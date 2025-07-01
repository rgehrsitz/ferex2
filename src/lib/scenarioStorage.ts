import { RetirementScenario } from '../types';

// Scenarios file format for single JSON file storage
export interface ScenariosFile {
    version: string;
    createdAt: string;
    lastModified: string;
    metadata: {
        appVersion: string;
        totalScenarios: number;
        defaultScenarioId?: string;
    };
    scenarios: StoredScenario[];
}

// Extended scenario with metadata for storage
export interface StoredScenario extends Omit<RetirementScenario, 'createdAt' | 'updatedAt'> {
    id: string;
    name: string;
    description?: string;
    createdAt: string; // ISO string format for JSON storage
    lastModified: string;
    tags?: string[];
    isComplete: boolean; // Whether all required fields are filled
    lastCalculatedAt?: string;
}

// Default scenarios file structure
const createDefaultScenariosFile = (): ScenariosFile => ({
    version: '1.0',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    metadata: {
        appVersion: '1.0.0',
        totalScenarios: 0
    },
    scenarios: []
});

// Generate unique scenario ID
const generateScenarioId = (): string => {
    return 'scenario-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Tauri file operations (will use these when in Tauri app)
declare const window: any;

// Conditional imports for Tauri (only available in Tauri environment)
const getTauriFS = async () => {
    if (typeof window !== 'undefined' && window.__TAURI__) {
        try {
            const fs = await import('@tauri-apps/api/fs');
            const path = await import('@tauri-apps/api/path');
            return { fs, path };
        } catch (error) {
            console.warn('Tauri APIs not available:', error);
            return null;
        }
    }
    return null;
};

export class ScenarioStorageService {
    private static readonly FILE_NAME = 'ferex-scenarios.json';
    private static readonly STORAGE_KEY = 'ferex-scenarios';

    // Check if running in Tauri environment
    private static get isTauri (): boolean {
        return typeof window !== 'undefined' && window.__TAURI__;
    }

    // Load scenarios from storage
    static async loadScenarios (): Promise<ScenariosFile> {
        try {
            let loadedFile: ScenariosFile | null = null;

            if (this.isTauri) {
                // Try Tauri file system API first
                try {
                    const tauri = await getTauriFS();
                    if (tauri) {
                        const { readTextFile, exists } = tauri.fs;
                        const { appDataDir } = tauri.path;

                        const appDataPath = await appDataDir();
                        const filePath = `${appDataPath}${this.FILE_NAME}`;

                        if (await exists(filePath)) {
                            const content = await readTextFile(filePath);
                            loadedFile = JSON.parse(content) as ScenariosFile;
                        }
                    }
                } catch (tauriError) {
                    console.warn('Tauri load failed, falling back to localStorage:', tauriError);
                }
            }

            if (!loadedFile) {
                // Use localStorage for web version or as fallback
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    loadedFile = JSON.parse(stored) as ScenariosFile;
                }
            }

            if (loadedFile) {
                return this.migrateScenarios(loadedFile);
            }
        } catch (error) {
            console.error('Error loading scenarios:', error);
        }

        // Return default file if loading fails or no file exists
        return createDefaultScenariosFile();
    }

    // Save scenarios to storage
    static async saveScenarios (scenariosFile: ScenariosFile): Promise<void> {
        try {
            console.log('ScenarioStorage: Attempting to save scenarios...', {
                isTauri: this.isTauri,
                scenarioCount: scenariosFile.scenarios.length
            });

            // Update metadata
            scenariosFile.lastModified = new Date().toISOString();
            scenariosFile.metadata.totalScenarios = scenariosFile.scenarios.length;

            let savedSuccessfully = false;

            if (this.isTauri) {
                // Try Tauri file system API first
                try {
                    const tauri = await getTauriFS();
                    if (tauri) {
                        const { writeTextFile } = tauri.fs;
                        const { appDataDir } = tauri.path;

                        const appDataPath = await appDataDir();
                        const filePath = `${appDataPath}${this.FILE_NAME}`;

                        await writeTextFile(filePath, JSON.stringify(scenariosFile, null, 2));
                        savedSuccessfully = true;
                        console.log('ScenarioStorage: Saved successfully via Tauri');
                    }
                } catch (tauriError) {
                    console.warn('Tauri save failed, falling back to localStorage:', tauriError);
                }
            }

            if (!savedSuccessfully) {
                // Use localStorage for web version or as fallback
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenariosFile));
                console.log('ScenarioStorage: Saved successfully via localStorage');
            }
        } catch (error) {
            console.error('Error saving scenarios:', error);
            throw new Error('Failed to save scenarios. Please try again.');
        }
    }

    // Get all scenarios
    static async getAllScenarios (): Promise<StoredScenario[]> {
        const scenariosFile = await this.loadScenarios();
        return scenariosFile.scenarios;
    }

    // Get scenario by ID
    static async getScenario (id: string): Promise<StoredScenario | null> {
        const scenarios = await this.getAllScenarios();
        return scenarios.find(s => s.id === id) || null;
    }

    // Save scenario (create or update)
    static async saveScenario (scenario: Partial<StoredScenario>): Promise<StoredScenario> {
        const scenariosFile = await this.loadScenarios();
        const now = new Date().toISOString();

        // Find existing scenario or create new one
        const existingIndex = scenariosFile.scenarios.findIndex(s => s.id === scenario.id);

        if (existingIndex >= 0) {
            // Update existing scenario
            const existing = scenariosFile.scenarios[existingIndex];
            const updated: StoredScenario = {
                ...existing,
                ...scenario,
                lastModified: now,
                isComplete: this.validateScenarioCompleteness({ ...existing, ...scenario } as StoredScenario)
            };
            scenariosFile.scenarios[existingIndex] = updated;
            await this.saveScenarios(scenariosFile);
            return updated;
        } else {
            // Create new scenario
            const defaultScenario = this.createDefaultScenario();
            const newScenario: StoredScenario = {
                ...defaultScenario,
                ...scenario,
                id: scenario.id || generateScenarioId(),
                createdAt: now,
                lastModified: now,
                isComplete: this.validateScenarioCompleteness({ ...defaultScenario, ...scenario } as StoredScenario)
            };
            scenariosFile.scenarios.push(newScenario);
            await this.saveScenarios(scenariosFile);
            return newScenario;
        }
    }

    // Delete scenario
    static async deleteScenario (id: string): Promise<void> {
        const scenariosFile = await this.loadScenarios();
        scenariosFile.scenarios = scenariosFile.scenarios.filter(s => s.id !== id);
        await this.saveScenarios(scenariosFile);
    }

    // Duplicate scenario
    static async duplicateScenario (id: string, newName: string): Promise<StoredScenario> {
        const original = await this.getScenario(id);
        if (!original) {
            throw new Error('Scenario not found');
        }

        const duplicate = {
            ...original,
            id: generateScenarioId(),
            name: newName,
            description: `Copy of ${original.name}`
        };

        return await this.saveScenario(duplicate);
    }

    // Export scenarios to JSON file
    static async exportScenarios (): Promise<string> {
        const scenariosFile = await this.loadScenarios();
        return JSON.stringify(scenariosFile, null, 2);
    }

    // Import scenarios from JSON
    static async importScenarios (jsonContent: string, mergeMode: 'replace' | 'merge' = 'merge'): Promise<void> {
        try {
            const importedFile = JSON.parse(jsonContent) as ScenariosFile;
            const migratedFile = this.migrateScenarios(importedFile);

            if (mergeMode === 'replace') {
                await this.saveScenarios(migratedFile);
            } else {
                // Merge with existing scenarios
                const existingFile = await this.loadScenarios();
                const mergedScenarios = [...existingFile.scenarios];

                // Add imported scenarios with new IDs to avoid conflicts
                for (const importedScenario of migratedFile.scenarios) {
                    const newId = generateScenarioId();
                    mergedScenarios.push({
                        ...importedScenario,
                        id: newId,
                        name: `${importedScenario.name} (Imported)`
                    });
                }

                const mergedFile: ScenariosFile = {
                    ...existingFile,
                    scenarios: mergedScenarios
                };

                await this.saveScenarios(mergedFile);
            }
        } catch (error) {
            console.error('Error importing scenarios:', error);
            throw new Error('Invalid scenarios file format. Please check the file and try again.');
        }
    }

    // Create default scenario structure
    private static createDefaultScenario (): StoredScenario {
        const now = new Date().toISOString();
        return {
            id: generateScenarioId(),
            name: 'New Scenario',
            description: '',
            createdAt: now,
            lastModified: now,
            isComplete: false,
            personalInfo: {
                firstName: '',
                lastName: '',
                birthDate: new Date(),
                hireDate: new Date(),
                plannedRetirementDate: new Date(),
                currentAge: 0,
                yearsOfService: 0
            },
            retirementSystem: {
                type: 'FERS'
            },
            federalService: {
                highThreeSalary: 0,
                creditableService: {
                    servicePeriods: [],
                    totalCreditableYears: 0,
                    totalCreditableMonths: 0
                },
                survivorBenefit: {
                    election: 'NONE'
                },
                unusedSickLeave: 0
            },
            socialSecurity: {
                estimatedBenefit: 0,
                fullRetirementAge: 67,
                claimingAge: 67
            },
            tsp: {
                currentBalance: 0,
                traditionalBalance: 0,
                rothBalance: 0,
                monthlyContribution: 0,
                agencyMatch: 0,
                growthRate: 7,
                withdrawalStrategy: {
                    type: 'LIFE_EXPECTANCY',
                    frequency: 'MONTHLY',
                    startAge: 62
                },
                fundsAllocation: {
                    gFund: 10,
                    fFund: 10,
                    cFund: 40,
                    sFund: 20,
                    iFund: 20
                }
            },
            otherIncome: [],
            expenses: {
                monthlyAmount: 0,
                inflationRate: 0.025
            },
            taxes: {
                filingStatus: 'SINGLE',
                stateOfResidence: '',
                pensionTaxBasis: 0
            }
        };
    }

    // Validate if scenario has all required fields
    private static validateScenarioCompleteness (scenario: StoredScenario): boolean {
        return !!(
            scenario.personalInfo?.firstName &&
            scenario.personalInfo?.lastName &&
            scenario.federalService?.highThreeSalary > 0 &&
            scenario.federalService?.creditableService?.servicePeriods?.length > 0 &&
            scenario.socialSecurity?.estimatedBenefit > 0 &&
            scenario.expenses?.monthlyAmount > 0
        );
    }

    // Migrate older file formats (for future compatibility)
    private static migrateScenarios (scenariosFile: ScenariosFile): ScenariosFile {
        // Handle version migrations here as the app evolves
        if (scenariosFile.version !== '1.0') {
            // Perform migrations based on version
            scenariosFile.version = '1.0';
        }

        return scenariosFile;
    }

    // Get quick stats for Dashboard
    static async getQuickStats () {
        const scenarios = await this.getAllScenarios();
        const completeScenarios = scenarios.filter(s => s.isComplete);

        // Calculate average annual income from complete scenarios
        const avgIncome = completeScenarios.length > 0
            ? completeScenarios.reduce((sum, s) => {
                const pensionAnnual = (s.federalService.highThreeSalary * 0.01 * s.federalService.creditableService.totalCreditableYears);
                const ssAnnual = s.socialSecurity.estimatedBenefit * 12;
                return sum + pensionAnnual + ssAnnual;
            }, 0) / completeScenarios.length
            : 0;

        // Calculate years to retirement from most recent complete scenario
        const latestScenario = completeScenarios
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];

        const yearsToRetirement = latestScenario
            ? Math.max(0, new Date(latestScenario.personalInfo.plannedRetirementDate).getFullYear() - new Date().getFullYear())
            : 0;

        return {
            totalScenarios: scenarios.length,
            completeScenarios: completeScenarios.length,
            avgAnnualIncome: Math.round(avgIncome),
            yearsToRetirement: yearsToRetirement
        };
    }

    // Get recent scenarios for Dashboard
    static async getRecentScenarios (limit: number = 5): Promise<StoredScenario[]> {
        const scenarios = await this.getAllScenarios();
        return scenarios
            .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
            .slice(0, limit);
    }
}
