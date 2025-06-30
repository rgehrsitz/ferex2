import { useState, useMemo } from 'react';
import { Save, Calculator, AlertCircle } from 'lucide-react';
import { RetirementScenario } from '../types';
import { ServicePeriodManager } from '../components/ServicePeriodManager';
import { ServiceCalculator } from '../lib/serviceCalculations';

type Page = 'dashboard' | 'scenario' | 'results' | 'comparison';

interface ScenarioBuilderProps {
  onNavigate: (page: Page) => void;
}

export default function ScenarioBuilder({ onNavigate }: ScenarioBuilderProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [scenario, setScenario] = useState<Partial<RetirementScenario>>({
    name: 'New Retirement Scenario',
    personalInfo: {
      firstName: '',
      lastName: '',
      birthDate: new Date(),
      hireDate: new Date(),
      plannedRetirementDate: new Date(),
      currentAge: 0,
      yearsOfService: 0,
    },
    retirementSystem: {
      type: 'FERS',
    },
    federalService: {
      highThreeSalary: 0,
      creditableService: {
        servicePeriods: [
          ServiceCalculator.generateSimpleServicePeriod(
            new Date(new Date().getFullYear() - 5, 0, 1), // 5 years ago
            new Date(), // today
            'Federal Agency'
          )
        ],
        totalCreditableYears: 0,
        totalCreditableMonths: 0,
      },
      survivorBenefit: {
        election: 'NONE',
      },
      unusedSickLeave: 0,
    },
    socialSecurity: {
      estimatedBenefit: 0,
      fullRetirementAge: 67,
      claimingAge: 67,
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
        startAge: 62,
      },
      fundsAllocation: {
        gFund: 10,
        fFund: 10,
        cFund: 40,
        sFund: 20,
        iFund: 20,
      },
    },
    otherIncome: [],
    expenses: {
      monthlyAmount: 0,
      inflationRate: 0.03,
    },
    taxes: {
      filingStatus: 'MARRIED_FILING_JOINTLY',
      stateOfResidence: '',
      pensionTaxBasis: 0,
    },
  });

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
    if (!scenario.federalService?.creditableService.servicePeriods) {
      return { totalCreditableYears: 0, totalCreditableMonths: 0 };
    }
    
    return ServiceCalculator.calculateCreditableService(
      scenario.federalService.creditableService.servicePeriods,
      scenario.federalService.creditableService.militaryService,
      scenario.federalService.unusedSickLeave || 0
    );
  }, [
    scenario.federalService?.creditableService.servicePeriods,
    scenario.federalService?.creditableService.militaryService,
    scenario.federalService?.unusedSickLeave
  ]);

  const handleSave = () => {
    // Update totals before saving
    setScenario(prev => ({
      ...prev,
      federalService: {
        ...prev.federalService!,
        creditableService: {
          ...prev.federalService!.creditableService,
          totalCreditableYears: creditableService.totalCreditableYears,
          totalCreditableMonths: creditableService.totalCreditableMonths,
        }
      }
    }));
    
    // Save scenario logic here
    onNavigate('results');
  };

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
              value={scenario.personalInfo?.firstName || ''}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo!, firstName: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={scenario.personalInfo?.lastName || ''}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo!, lastName: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={scenario.personalInfo?.birthDate instanceof Date 
                ? scenario.personalInfo.birthDate.toISOString().split('T')[0]
                : ''}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo!, birthDate: new Date(e.target.value) }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Federal Hire Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={scenario.personalInfo?.hireDate instanceof Date 
                ? scenario.personalInfo.hireDate.toISOString().split('T')[0]
                : ''}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo!, hireDate: new Date(e.target.value) }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Retirement Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={scenario.personalInfo?.plannedRetirementDate instanceof Date 
                ? scenario.personalInfo.plannedRetirementDate.toISOString().split('T')[0]
                : ''}
              onChange={(e) => setScenario(prev => ({
                ...prev,
                personalInfo: { ...prev.personalInfo!, plannedRetirementDate: new Date(e.target.value) }
              }))}
            />
          </div>
        </div>
      </div>
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
            value={scenario.federalService?.highThreeSalary || ''}
            onChange={(e) => setScenario(prev => ({
              ...prev,
              federalService: { 
                ...prev.federalService!, 
                highThreeSalary: parseFloat(e.target.value) || 0 
              }
            }))}
            placeholder="85000"
          />
        </div>

        <ServicePeriodManager
          servicePeriods={scenario.federalService?.creditableService.servicePeriods || []}
          militaryService={scenario.federalService?.creditableService.militaryService}
          unusedSickLeave={scenario.federalService?.unusedSickLeave || 0}
          onServicePeriodsChange={(periods) => setScenario(prev => ({
            ...prev,
            federalService: {
              ...prev.federalService!,
              creditableService: {
                ...prev.federalService!.creditableService,
                servicePeriods: periods
              }
            }
          }))}
          onMilitaryServiceChange={(military) => setScenario(prev => ({
            ...prev,
            federalService: {
              ...prev.federalService!,
              creditableService: {
                ...prev.federalService!.creditableService,
                militaryService: military
              }
            }
          }))}
          onSickLeaveChange={(hours) => setScenario(prev => ({
            ...prev,
            federalService: {
              ...prev.federalService!,
              unusedSickLeave: hours
            }
          }))}
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Survivor Benefit Election
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={scenario.federalService?.survivorBenefit.election || 'NONE'}
            onChange={(e) => setScenario(prev => ({
              ...prev,
              federalService: { 
                ...prev.federalService!, 
                survivorBenefit: {
                  ...prev.federalService!.survivorBenefit,
                  election: e.target.value as any
                }
              }
            }))}
          >
            <option value="NONE">No Survivor Benefit</option>
            <option value="PARTIAL">Partial (25% - 5% reduction)</option>
            <option value="FULL">Full (50% - 10% reduction)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'federal':
        return renderFederalService();
      case 'social':
        return <div>Social Security content coming soon...</div>;
      case 'tsp':
        return <div>TSP content coming soon...</div>;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Build Retirement Scenario</h1>
        <p className="text-gray-600 mt-2">
          Create a detailed FERS retirement projection by entering your federal service and financial information.
        </p>
      </div>

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