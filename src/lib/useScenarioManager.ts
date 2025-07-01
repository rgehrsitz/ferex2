import { useState, useEffect, useCallback } from 'react';
import { StoredScenario } from '../types';
import { ScenarioStorageService } from '../lib/scenarioStorage';

export interface UseScenarioManagerResult {
    scenarios: StoredScenario[];
    currentScenario: StoredScenario | null;
    loading: boolean;
    error: string | null;

    // Scenario operations
    loadScenario: (id: string) => Promise<void>;
    saveScenario: (scenario: Partial<StoredScenario>) => Promise<StoredScenario>;
    createScenario: (name: string, description?: string) => Promise<StoredScenario>;
    deleteScenario: (id: string) => Promise<void>;
    duplicateScenario: (id: string, newName: string) => Promise<StoredScenario>;

    // File operations
    exportScenarios: () => Promise<string>;
    importScenarios: (jsonContent: string, mergeMode?: 'replace' | 'merge') => Promise<void>;

    // Utility functions
    refreshScenarios: () => Promise<void>;
    clearError: () => void;
}

export function useScenarioManager (): UseScenarioManagerResult {
    const [scenarios, setScenarios] = useState<StoredScenario[]>([]);
    const [currentScenario, setCurrentScenario] = useState<StoredScenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load all scenarios
    const refreshScenarios = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const loadedScenarios = await ScenarioStorageService.getAllScenarios();
            setScenarios(loadedScenarios);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load scenarios');
        } finally {
            setLoading(false);
        }
    }, []);

    // Load specific scenario
    const loadScenario = useCallback(async (id: string) => {
        try {
            setError(null);
            const scenario = await ScenarioStorageService.getScenario(id);
            if (scenario) {
                setCurrentScenario(scenario);
            } else {
                setError('Scenario not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load scenario');
        }
    }, []);

    // Save scenario
    const saveScenario = useCallback(async (scenario: Partial<StoredScenario>): Promise<StoredScenario> => {
        try {
            setError(null);
            const savedScenario = await ScenarioStorageService.saveScenario(scenario);

            // Update current scenario if it's the one being saved
            if (currentScenario?.id === savedScenario.id) {
                setCurrentScenario(savedScenario);
            }

            // Refresh scenarios list
            await refreshScenarios();

            return savedScenario;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save scenario';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [currentScenario?.id, refreshScenarios]);

    // Create new scenario
    const createScenario = useCallback(async (name: string, description?: string): Promise<StoredScenario> => {
        try {
            setError(null);
            const newScenario = await ScenarioStorageService.saveScenario({
                name,
                description: description || ''
            });
            setCurrentScenario(newScenario);
            await refreshScenarios();
            return newScenario;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create scenario';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [refreshScenarios]);

    // Delete scenario
    const deleteScenario = useCallback(async (id: string) => {
        try {
            setError(null);
            await ScenarioStorageService.deleteScenario(id);

            // Clear current scenario if it was deleted
            if (currentScenario?.id === id) {
                setCurrentScenario(null);
            }

            await refreshScenarios();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete scenario');
        }
    }, [currentScenario?.id, refreshScenarios]);

    // Duplicate scenario
    const duplicateScenario = useCallback(async (id: string, newName: string): Promise<StoredScenario> => {
        try {
            setError(null);
            const duplicated = await ScenarioStorageService.duplicateScenario(id, newName);
            await refreshScenarios();
            return duplicated;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate scenario';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [refreshScenarios]);

    // Export scenarios
    const exportScenarios = useCallback(async (): Promise<string> => {
        try {
            setError(null);
            return await ScenarioStorageService.exportScenarios();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to export scenarios';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Import scenarios
    const importScenarios = useCallback(async (jsonContent: string, mergeMode: 'replace' | 'merge' = 'merge') => {
        try {
            setError(null);
            await ScenarioStorageService.importScenarios(jsonContent, mergeMode);
            await refreshScenarios();

            // Clear current scenario if replace mode was used
            if (mergeMode === 'replace') {
                setCurrentScenario(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import scenarios');
        }
    }, [refreshScenarios]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Load scenarios on mount
    useEffect(() => {
        refreshScenarios();
    }, [refreshScenarios]);

    return {
        scenarios,
        currentScenario,
        loading,
        error,
        loadScenario,
        saveScenario,
        createScenario,
        deleteScenario,
        duplicateScenario,
        exportScenarios,
        importScenarios,
        refreshScenarios,
        clearError
    };
}

// Hook for quick stats (used in Dashboard)
export function useQuickStats () {
    const [stats, setStats] = useState({
        totalScenarios: 0,
        completeScenarios: 0,
        avgAnnualIncome: 0,
        yearsToRetirement: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const quickStats = await ScenarioStorageService.getQuickStats();
                setStats(quickStats);
            } catch (error) {
                console.error('Failed to load quick stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    return { stats, loading };
}

// Hook for recent scenarios (used in Dashboard)
export function useRecentScenarios (limit: number = 5) {
    const [scenarios, setScenarios] = useState<StoredScenario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecentScenarios = async () => {
            try {
                const recentScenarios = await ScenarioStorageService.getRecentScenarios(limit);
                setScenarios(recentScenarios);
            } catch (error) {
                console.error('Failed to load recent scenarios:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRecentScenarios();
    }, [limit]);

    return { scenarios, loading };
}
