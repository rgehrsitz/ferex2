import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Download, Share, Settings } from 'lucide-react';

type Page = 'dashboard' | 'scenario' | 'results' | 'comparison';

interface ResultsProps {
  onNavigate: (page: Page) => void;
}

// Sample data for demonstration
const sampleData = [
  { year: 2025, age: 62, pension: 48000, socialSecurity: 0, tsp: 12000, total: 60000, expenses: 54000 },
  { year: 2026, age: 63, pension: 48960, socialSecurity: 0, tsp: 12360, total: 61320, expenses: 55620 },
  { year: 2027, age: 64, pension: 49939, socialSecurity: 0, tsp: 12731, total: 62670, expenses: 57288 },
  { year: 2028, age: 65, pension: 50938, socialSecurity: 28800, tsp: 13113, total: 92851, expenses: 59007 },
  { year: 2029, age: 66, pension: 51957, socialSecurity: 29376, tsp: 13507, total: 94840, expenses: 60777 },
  { year: 2030, age: 67, pension: 52996, socialSecurity: 29965, tsp: 13913, total: 96874, expenses: 62600 },
  { year: 2031, age: 68, pension: 54056, socialSecurity: 30568, tsp: 14332, total: 98956, expenses: 64478 },
  { year: 2032, age: 69, pension: 55138, socialSecurity: 31183, tsp: 14763, total: 101084, expenses: 66412 },
];

export default function Results({ onNavigate }: ResultsProps) {
  const [activeView, setActiveView] = useState('overview');

  const views = [
    { id: 'overview', name: 'Overview' },
    { id: 'income', name: 'Income Analysis' },
    { id: 'monte-carlo', name: 'Risk Analysis' },
    { id: 'detailed', name: 'Detailed Tables' },
  ];

  const summary = {
    averageAnnualIncome: '$87,450',
    totalLifetimeIncome: '$2.1M',
    tspDepletionAge: 'Age 89',
    successProbability: '94%'
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg. Annual Income</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{summary.averageAnnualIncome}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lifetime Income</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{summary.totalLifetimeIncome}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">TSP Depletion</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{summary.tspDepletionAge}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Success Rate</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{summary.successProbability}</p>
        </div>
      </div>

      {/* Income Timeline Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Retirement Income Timeline</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            <Legend />
            <Area
              type="monotone"
              dataKey="pension"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              name="Pension"
            />
            <Area
              type="monotone"
              dataKey="socialSecurity"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              name="Social Security"
            />
            <Area
              type="monotone"
              dataKey="tsp"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              name="TSP Withdrawal"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={3}
              strokeDasharray="5 5"
              name="Expenses"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderIncomeAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Composition by Source</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="age" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            <Legend />
            <Bar dataKey="pension" stackId="a" fill="#3b82f6" name="Pension" />
            <Bar dataKey="socialSecurity" stackId="a" fill="#10b981" name="Social Security" />
            <Bar dataKey="tsp" stackId="a" fill="#8b5cf6" name="TSP" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} name="Total Income" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Surplus/Deficit</h3>
          <div className="space-y-2">
            {sampleData.slice(0, 6).map((year) => {
              const surplus = year.total - year.expenses;
              return (
                <div key={year.year} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Age {year.age}</span>
                  <span className={`font-medium ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${surplus >= 0 ? '+' : ''}{surplus.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monte Carlo Simulation Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">94%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-xs text-gray-500 mt-1">Funds last until age 95</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">$1.2M</p>
            <p className="text-sm text-gray-600">Median Portfolio at 85</p>
            <p className="text-xs text-gray-500 mt-1">50th percentile outcome</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">3.2%</p>
            <p className="text-sm text-gray-600">Shortfall Risk</p>
            <p className="text-xs text-gray-500 mt-1">Before age 85</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Risk Analysis:</strong> Your retirement plan shows strong probability of success. 
            The Monte Carlo simulation ran 10,000 scenarios with varying market conditions and inflation rates.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 94% of scenarios result in funds lasting until age 95</li>
            <li>• In worst-case scenarios, average shortfall is 2.1 years</li>
            <li>• Plan is most sensitive to inflation and early market downturns</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'income':
        return renderIncomeAnalysis();
      case 'monte-carlo':
        return renderRiskAnalysis();
      case 'detailed':
        return <div className="bg-white p-6 rounded-lg shadow">Detailed tables coming soon...</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Retirement Scenario Results</h1>
          <p className="text-gray-600 mt-2">
            Scenario: "Retirement at 62" • Last updated: 2 hours ago
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => onNavigate('scenario')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Scenario
          </button>
        </div>
      </div>

      {/* View Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === view.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {view.name}
            </button>
          ))}
        </nav>
      </div>

      {renderActiveView()}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => onNavigate('comparison')}
          className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
        >
          Compare with Another Scenario
        </button>
        <button
          onClick={() => onNavigate('scenario')}
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
        >
          Create New Scenario
        </button>
      </div>
    </div>
  );
}