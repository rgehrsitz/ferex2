import { useState } from 'react';
import { Save, FolderOpen, FileText, Plus } from 'lucide-react';
import { StoredScenario } from '../types';

interface ScenarioFileManagerProps {
  currentScenario?: StoredScenario | null;
  currentFilePath?: string | null; // Path to the currently opened file
  onScenarioChange?: (scenario: StoredScenario, filePath?: string) => void;
  onNewScenario?: () => void;
  showUnsavedChanges?: boolean;
  className?: string;
}

export function ScenarioFileManager({
  currentScenario,
  currentFilePath,
  onScenarioChange,
  onNewScenario,
  showUnsavedChanges = false,
  className = ''
}: ScenarioFileManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're running in Tauri (desktop) or web
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  // Create a new scenario with proper structure
  const createNewScenario = (): StoredScenario => {
    return {
      id: `scenario-${Date.now()}`,
      name: 'Untitled Scenario',
      description: '',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isComplete: false,
      // Initialize with default structure
      personalInfo: {
        firstName: '',
        lastName: '',
        birthDate: new Date(),
        hireDate: new Date(),
        plannedRetirementDate: new Date(),
        currentAge: 0,
        yearsOfService: 0
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
        growthRate: 0.07,
        withdrawalStrategy: {
          type: 'LIFE_EXPECTANCY',
          frequency: 'MONTHLY',
          startAge: 62
        },
        fundsAllocation: {
          gFund: 10,
          fFund: 15,
          cFund: 35,
          sFund: 15,
          iFund: 25
        }
      },
      retirementSystem: {
        type: 'FERS'
      },
      otherIncome: [],
      expenses: {
        monthlyAmount: 0,
        inflationRate: 0.03
      },
      taxes: {
        filingStatus: 'SINGLE',
        stateOfResidence: '',
        pensionTaxBasis: 0
      }
    };
  };

  // Handle New - create a new scenario
  const handleNew = async () => {
    try {
      const newScenario = createNewScenario();
      onScenarioChange?.(newScenario, undefined); // No file path for new scenario
      onNewScenario?.();
    } catch (err) {
      setError('Failed to create new scenario');
      console.error('New scenario failed:', err);
    }
  };

  // Handle Open - open a JSON file from disk
  const handleOpen = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isTauri) {
        // Use Tauri file dialog
        const { open } = await import('@tauri-apps/api/dialog');
        const { readTextFile } = await import('@tauri-apps/api/fs');

        const filePath = await open({
          filters: [{
            name: 'Scenario Files',
            extensions: ['json']
          }],
          title: 'Open Scenario File'
        });

        if (filePath && typeof filePath === 'string') {
          const content = await readTextFile(filePath);
          const scenarioData = JSON.parse(content);

          // Validate that it's a valid scenario file
          if (!scenarioData.id || !scenarioData.name) {
            throw new Error('Invalid scenario file format');
          }

          // Convert date strings back to Date objects
          convertStringDatesToObjects(scenarioData);

          onScenarioChange?.(scenarioData, filePath);
        }
      } else {
        // Use web file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          try {
            const content = await file.text();
            const scenarioData = JSON.parse(content);

            // Validate that it's a valid scenario file
            if (!scenarioData.id || !scenarioData.name) {
              throw new Error('Invalid scenario file format');
            }

            // Convert date strings back to Date objects
            convertStringDatesToObjects(scenarioData);

            onScenarioChange?.(scenarioData, file.name);
          } catch (err) {
            setError('Failed to open file. Please check that it\'s a valid scenario file.');
            console.error('Open failed:', err);
          } finally {
            setLoading(false);
          }
        };

        input.click();
      }
    } catch (err) {
      setError('Failed to open file');
      console.error('Open failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Save - save to current file or prompt for location
  const handleSave = async () => {
    if (!currentScenario) return;

    try {
      setLoading(true);
      setError(null);

      const scenarioToSave = {
        ...currentScenario,
        lastModified: new Date().toISOString()
      };

      if (currentFilePath && isTauri) {
        // Save to existing file (only works in Tauri)
        const { writeTextFile } = await import('@tauri-apps/api/fs');
        const content = JSON.stringify(scenarioToSave, null, 2);
        await writeTextFile(currentFilePath, content);
      } else {
        // No current file or in web mode, prompt for save location
        await handleSaveAs();
        return;
      }
    } catch (err) {
      setError('Failed to save scenario');
      console.error('Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Save As - always prompt for new location
  const handleSaveAs = async () => {
    if (!currentScenario) return;

    try {
      setLoading(true);
      setError(null);

      const scenarioToSave = {
        ...currentScenario,
        lastModified: new Date().toISOString()
      };

      if (isTauri) {
        // Use Tauri save dialog
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeTextFile } = await import('@tauri-apps/api/fs');

        // Generate default filename
        const safeName = currentScenario.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const defaultPath = `${safeName}_scenario.json`;

        const filePath = await save({
          filters: [{
            name: 'Scenario Files',
            extensions: ['json']
          }],
          defaultPath,
          title: 'Save Scenario As'
        });

        if (filePath) {
          const content = JSON.stringify(scenarioToSave, null, 2);
          await writeTextFile(filePath, content);
          // Update the current file path
          onScenarioChange?.(scenarioToSave, filePath);
        }
      } else {
        // Use web download
        const safeName = currentScenario.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeName}_scenario.json`;

        const content = JSON.stringify(scenarioToSave, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // In web mode, we can't track the actual file path, but use the filename
        onScenarioChange?.(scenarioToSave, filename);
      }
    } catch (err) {
      setError('Failed to save scenario');
      console.error('Save As failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert ISO date strings back to Date objects
  const convertStringDatesToObjects = (scenario: any) => {
    if (scenario.personalInfo?.birthDate && typeof scenario.personalInfo.birthDate === 'string') {
      scenario.personalInfo.birthDate = new Date(scenario.personalInfo.birthDate);
    }
    if (scenario.personalInfo?.hireDate && typeof scenario.personalInfo.hireDate === 'string') {
      scenario.personalInfo.hireDate = new Date(scenario.personalInfo.hireDate);
    }
    if (scenario.personalInfo?.plannedRetirementDate && typeof scenario.personalInfo.plannedRetirementDate === 'string') {
      scenario.personalInfo.plannedRetirementDate = new Date(scenario.personalInfo.plannedRetirementDate);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Traditional File Operations */}
      <button
        onClick={handleNew}
        disabled={loading}
        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        title="Create new scenario"
      >
        <Plus className="h-4 w-4 mr-2" />
        New
      </button>

      <button
        onClick={handleOpen}
        disabled={loading}
        className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        title="Open scenario file from disk"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Open
      </button>

      <button
        onClick={handleSave}
        disabled={loading || !currentScenario}
        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        title={currentFilePath ? "Save current scenario" : "Save scenario (will prompt for location)"}
      >
        <Save className="h-4 w-4 mr-2" />
        Save
        {showUnsavedChanges && <span className="ml-1 text-yellow-300">*</span>}
      </button>

      <button
        onClick={handleSaveAs}
        disabled={loading || !currentScenario}
        className="flex items-center px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
        title="Save scenario to new file"
      >
        <FileText className="h-4 w-4 mr-2" />
        Save As...
      </button>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm">Processing...</span>
        </div>
      )}

      {/* Current File Info */}
      {currentScenario && (
        <div className="ml-4 text-sm text-gray-600 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <div>
            <span className="font-medium">File:</span> {currentFilePath || 'Untitled'}
            <span className="ml-3 font-medium">Scenario:</span> {currentScenario.name}
            {isTauri ? (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Desktop</span>
            ) : (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Web</span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Help text for new users */}
      {!currentScenario && (
        <div className="ml-4 text-sm text-gray-500 italic">
          Start by creating a New scenario or Opening an existing file
        </div>
      )}
    </div>
  );
}
