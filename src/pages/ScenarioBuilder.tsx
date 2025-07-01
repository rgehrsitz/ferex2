import { useState, useMemo, useEffect, useCallback } from 'react';
import { Save, Calculator, AlertCircle, FileText } from 'lucide-react';
import { StoredScenario } from '../types';
import { ServicePeriodManager } from '../components/ServicePeriodManager';
import { TSPManagerRHF } from '../components/TSPManagerRHF';
import { SocialSecurityManagerRHF } from '../components/SocialSecurityManagerRHF';
import { ScenarioFileManager } from '../components/ScenarioFileManager';
import { useScenarioManager } from '../lib/useScenarioManager';
import { ServiceCalculator } from '../lib/serviceCalculations';

type Page = 'dashboard' | 'scenario' | 'results' | 'comparison';

interface ScenarioBuilderProps {
  onNavigate: (page: Page) => void;
}

export default function ScenarioBuilder({ onNavigate }: ScenarioBuilderProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const {
    currentScenario: hookCurrentScenario,
    saveScenario,
    createScenario,
    loadScenario
  } = useScenarioManager();

  // Local working copy of the scenario
  const [workingScenario, setWorkingScenario] = useState<StoredScenario | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync working scenario with hook's current scenario
  useEffect(() => {
    if (hookCurrentScenario && (!workingScenario || workingScenario.id !== hookCurrentScenario.id)) {
      setWorkingScenario(hookCurrentScenario);
      setHasUnsavedChanges(false);
    }
  }, [hookCurrentScenario, workingScenario]);

  // Initialize with a default scenario if none exists
  useEffect(() => {
    const initializeScenario = async () => {
      if (!hookCurrentScenario) {
        try {
          await createScenario('Untitled Scenario');
        } catch (error) {
          console.error('Failed to create initial scenario:', error);
        }
      }
    };

    initializeScenario();
  }, [hookCurrentScenario, createScenario]);

  // Handle scenario changes and mark as unsaved
  const handleScenarioChange = useCallback((updates: Partial<StoredScenario>) => {
    if (!workingScenario) return;

    const updatedScenario = { ...workingScenario, ...updates };
    setWorkingScenario(updatedScenario);
    setHasUnsavedChanges(true);
  }, [workingScenario]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges || !workingScenario) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await saveScenario(workingScenario);
        setHasUnsavedChanges(false);
        console.log('Auto-saved scenario:', workingScenario.name);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, workingScenario, saveScenario]);

  // Handle file operations
  const handleScenarioLoaded = async (scenario: StoredScenario) => {
    if (scenario.id) {
      await loadScenario(scenario.id);
    }
    setHasUnsavedChanges(false);
  };

  const handleNewScenario = () => {
    setActiveTab('personal'); // Reset to first tab for new scenarios
    setHasUnsavedChanges(false);
  };

  const tabs = [
    { id: 'personal', name: 'Personal Info', completed: false },
    { id: 'federal', name: 'Federal Service', completed: false },
    { id: 'social', name: 'Social Security', completed: false },
    { id: 'tsp', name: 'TSP', completed: false },
    { id: 'income', name: 'Other Income', completed: false },
    { id: 'expenses', name: 'Expenses & Taxes', completed: false },
  ];

  // Automatically calculate creditable service totals
  const creditableService = useMemo(() => {
    if (!workingScenario?.federalService?.creditableService.servicePeriods) {
      return { totalCreditableYears: 0, totalCreditableMonths: 0 };
    }

    return ServiceCalculator.calculateCreditableService(
      workingScenario.federalService.creditableService.servicePeriods,
      workingScenario.federalService.creditableService.militaryService,
      workingScenario.federalService.unusedSickLeave || 0
    );
  }, [
    workingScenario?.federalService?.creditableService.servicePeriods,
    workingScenario?.federalService?.creditableService.militaryService,
    workingScenario?.federalService?.unusedSickLeave
  ]);

  // Handle save and calculate totals
  const handleSave = async () => {
    if (!workingScenario) return;

    // Update totals before saving
    const updatedScenario = {
      ...workingScenario,
      federalService: {
        ...workingScenario.federalService,
        creditableService: {
          ...workingScenario.federalService.creditableService,
          totalCreditableYears: creditableService.totalCreditableYears,
          totalCreditableMonths: creditableService.totalCreditableMonths,
        }
      }
    };

    try {
      await saveScenario(updatedScenario);
      setHasUnsavedChanges(false);
      onNavigate('results');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  // Early return if no scenario is loaded yet
  if (!workingScenario) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading scenario...</p>
        </div>
      </div>
    );
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={workingScenario.personalInfo?.firstName || ''}
              onChange={(e) => handleScenarioChange({
                personalInfo: {
                  ...workingScenario.personalInfo,
                  firstName: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={workingScenario.personalInfo?.lastName || ''}
              onChange={(e) => handleScenarioChange({
                personalInfo: {
                  ...workingScenario.personalInfo,
                  lastName: e.target.value
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={workingScenario.personalInfo?.birthDate instanceof Date
                ? workingScenario.personalInfo.birthDate.toISOString().split('T')[0]
                : ''}
              onChange={(e) => handleScenarioChange({
                personalInfo: {
                  ...workingScenario.personalInfo,
                  birthDate: new Date(e.target.value)
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Federal Hire Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={workingScenario.personalInfo?.hireDate instanceof Date
                ? workingScenario.personalInfo.hireDate.toISOString().split('T')[0]
                : ''}
              onChange={(e) => handleScenarioChange({
                personalInfo: {
                  ...workingScenario.personalInfo,
                  hireDate: new Date(e.target.value)
                }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Retirement Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={workingScenario.personalInfo?.plannedRetirementDate instanceof Date
                ? workingScenario.personalInfo.plannedRetirementDate.toISOString().split('T')[0]
                : ''}
              onChange={(e) => handleScenarioChange({
                personalInfo: {
                  ...workingScenario.personalInfo,
                  plannedRetirementDate: new Date(e.target.value)
                }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTSP = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">TSP Details</h2>
        <p className="text-gray-600 mt-2">
          Enter your Thrift Savings Plan information for retirement projections.
        </p>
      </div>

      <TSPManagerRHF
        tsp={workingScenario.tsp!}
        onTSPChange={(tsp: any) => handleScenarioChange({ tsp })}
      />
    </div>
  );

  const renderFederalService = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Federal Service Details</h3>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">FERS</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">
                  Federal Employees Retirement System (FERS)
                </h3>
                <p className="text-sm text-blue-700">
                  This calculator is designed specifically for FERS employees hired after 1984.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            High-3 Average Salary
            <span className="text-gray-500 text-xs ml-1">(Annual - highest 36 consecutive months)</span>
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={workingScenario.federalService?.highThreeSalary || ''}
            onChange={(e) => handleScenarioChange({
              federalService: {
                ...workingScenario.federalService!,
                highThreeSalary: parseFloat(e.target.value) || 0
              }
            })}
            placeholder="85000"
          />
        </div>

        <ServicePeriodManager
          servicePeriods={workingScenario.federalService?.creditableService.servicePeriods || []}
          militaryService={workingScenario.federalService?.creditableService.militaryService}
          unusedSickLeave={workingScenario.federalService?.unusedSickLeave || 0}
          onServicePeriodsChange={(periods) => handleScenarioChange({
            federalService: {
              ...workingScenario.federalService!,
              creditableService: {
                ...workingScenario.federalService!.creditableService,
                servicePeriods: periods
              }
            }
          })}
          onMilitaryServiceChange={(military) => handleScenarioChange({
            federalService: {
              ...workingScenario.federalService!,
              creditableService: {
                ...workingScenario.federalService!.creditableService,
                militaryService: military
              }
            }
          })}
          onSickLeaveChange={(hours) => handleScenarioChange({
            federalService: {
              ...workingScenario.federalService!,
              unusedSickLeave: hours
            }
          })}
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Survivor Benefit Election
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={workingScenario.federalService?.survivorBenefit.election || 'NONE'}
            onChange={(e) => handleScenarioChange({
              federalService: {
                ...workingScenario.federalService!,
                survivorBenefit: {
                  ...workingScenario.federalService!.survivorBenefit,
                  election: e.target.value as any
                }
              }
            })}
          >
            <option value="NONE">No Survivor Benefit</option>
            <option value="PARTIAL">Partial (25% - 5% reduction)</option>
            <option value="FULL">Full (50% - 10% reduction)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSocialSecurity = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900">Social Security Planning</h3>
        <p className="text-blue-700 text-sm mt-1">
          Enter your Social Security benefit information to optimize your claiming strategy.
        </p>
      </div>

      <SocialSecurityManagerRHF
        socialSecurity={workingScenario.socialSecurity!}
        onSocialSecurityChange={(socialSecurity) => handleScenarioChange({ socialSecurity })}
      />
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'federal':
        return renderFederalService();
      case 'social':
        return renderSocialSecurity();
      case 'tsp':
        return renderTSP();
      case 'income':
        return <div>Other Income content coming soon...</div>;
      case 'expenses':
        return <div>Expenses & Taxes content coming soon...</div>;
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="p-8">
      {/* Scenario File Manager */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <ScenarioFileManager
          currentScenario={workingScenario}
          onScenarioChange={handleScenarioLoaded}
          onNewScenario={handleNewScenario}
          showUnsavedChanges={hasUnsavedChanges}
          className="flex flex-wrap gap-2"
        />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Build Retirement Scenario</h1>
        <p className="text-gray-600 mt-2">
          Create a detailed FERS retirement projection by entering your federal service and financial information.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-900">How to use the file operations:</p>
              <ul className="text-xs text-yellow-800 mt-1 list-disc list-inside space-y-1">
                <li><strong>New:</strong> Start a fresh scenario (your current work will be saved first)</li>
                <li><strong>Open:</strong> Load a previously saved scenario</li>
                <li><strong>Save:</strong> Save changes to the current scenario</li>
                <li><strong>Save As:</strong> Save a copy with a new name</li>
                <li><strong>Export/Import:</strong> Backup or share all your scenarios as a file</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Current Scenario Status */}
      {workingScenario && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Working on: {workingScenario.name}
                </h3>
                <p className="text-xs text-blue-700">
                  {hasUnsavedChanges ? 'You have unsaved changes' : 'All changes saved'}
                  {workingScenario.personalInfo?.firstName && ` • ${workingScenario.personalInfo.firstName} ${workingScenario.personalInfo?.lastName || ''}`}
                </p>
              </div>
            </div>
            <div className="text-xs text-blue-600">
              Last saved: {new Date(workingScenario.lastModified).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">2 of 6 sections completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full" style={{ width: '33%' }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{tab.name}</span>
                {tab.completed && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Need Help?</p>
                <p className="text-xs text-blue-700 mt-1">
                  Hover over field labels for tooltips and guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            {renderActiveTab()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id);
                  }
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                disabled={activeTab === 'personal'}
              >
                Previous
              </button>

              <div className="space-x-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </button>

                <button
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    } else {
                      handleSave();
                    }
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium flex items-center"
                >
                  {activeTab === 'expenses' ? (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Results
                    </>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}