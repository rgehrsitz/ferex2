import { Plus, FileText, TrendingUp, Clock } from 'lucide-react';

type Page = 'dashboard' | 'scenario' | 'results' | 'comparison';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const recentScenarios = [
    { id: '1', name: 'Retirement at 62', lastModified: '2 days ago', status: 'Complete' },
    { id: '2', name: 'Early Retirement at MRA', lastModified: '1 week ago', status: 'Draft' },
    { id: '3', name: 'Delayed Retirement at 67', lastModified: '2 weeks ago', status: 'Complete' },
  ];

  const quickStats = [
    { label: 'Total Scenarios', value: '12', icon: FileText, color: 'bg-blue-500' },
    { label: 'Avg. Annual Income', value: '$82,450', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Years to Retirement', value: '8.5', icon: Clock, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the FERS Retirement Scenario Explorer. Plan your FERS retirement with confidence and precision.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={() => onNavigate('scenario')}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-primary-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Create New Scenario</p>
                  <p className="text-sm text-gray-600">Build a new retirement projection</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => onNavigate('comparison')}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-primary-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Compare Scenarios</p>
                  <p className="text-sm text-gray-600">Analyze different retirement options</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Scenarios */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Scenarios</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onNavigate('results')}
                >
                  <div>
                    <p className="font-medium text-gray-900">{scenario.name}</p>
                    <p className="text-sm text-gray-600">Modified {scenario.lastModified}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      scenario.status === 'Complete'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {scenario.status}
                  </span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => onNavigate('scenario')}
              className="mt-4 w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all scenarios →
            </button>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <div className="bg-primary-100 rounded-full p-2 mr-3">
              <span className="text-primary-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gather Your Information</p>
              <p className="text-sm text-gray-600">Collect your SF-50, TSP statements, and Social Security estimates</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary-100 rounded-full p-2 mr-3">
              <span className="text-primary-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Build Your Scenario</p>
              <p className="text-sm text-gray-600">Enter your details and retirement preferences</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary-100 rounded-full p-2 mr-3">
              <span className="text-primary-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Analyze Results</p>
              <p className="text-sm text-gray-600">Review projections and compare different strategies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}