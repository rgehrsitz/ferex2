import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Plus, X, TrendingUp, TrendingDown } from 'lucide-react';

type Page = 'dashboard' | 'scenario' | 'results' | 'comparison';

interface ComparisonProps {
  onNavigate: (page: Page) => void;
}

// Sample comparison data
const comparisonData = [
  { age: 62, scenarioA: 60000, scenarioB: 0, difference: -60000 },
  { age: 63, scenarioA: 61320, scenarioB: 0, difference: -61320 },
  { age: 64, scenarioA: 62670, scenarioB: 0, difference: -62670 },
  { age: 65, scenarioA: 92851, scenarioB: 78500, difference: -14351 },
  { age: 66, scenarioA: 94840, scenarioB: 80120, difference: -14720 },
  { age: 67, scenarioA: 96874, scenarioB: 102500, difference: 5626 },
  { age: 68, scenarioA: 98956, scenarioB: 104550, difference: 5594 },
  { age: 69, scenarioA: 101084, scenarioB: 106647, difference: 5563 },
];

export default function Comparison({ onNavigate }: ComparisonProps) {
  const [selectedScenarios, setSelectedScenarios] = useState([
    { id: '1', name: 'Retirement at 62', color: '#3b82f6' },
    { id: '2', name: 'Retirement at 67', color: '#10b981' },
  ]);

  const [availableScenarios] = useState([
    { id: '3', name: 'Early Retirement at MRA', color: '#8b5cf6' },
    { id: '4', name: 'Delayed Retirement at 70', color: '#f59e0b' },
    { id: '5', name: 'Part-time Transition', color: '#ef4444' },
  ]);

  const addScenario = (scenario: any) => {
    if (selectedScenarios.length < 3) {
      setSelectedScenarios([...selectedScenarios, scenario]);
    }
  };

  const removeScenario = (id: string) => {
    setSelectedScenarios(selectedScenarios.filter(s => s.id !== id));
  };

  const comparisonMetrics = [
    {
      metric: 'Average Annual Income',
      scenarioA: '$87,450',
      scenarioB: '$94,200',
      difference: '+$6,750',
      trend: 'up'
    },
    {
      metric: 'Total Lifetime Income',
      scenarioA: '$2.1M',
      scenarioB: '$2.4M',
      difference: '+$300k',
      trend: 'up'
    },
    {
      metric: 'TSP Depletion Age',
      scenarioA: '89',
      scenarioB: '92',
      difference: '+3 years',
      trend: 'up'
    },
    {
      metric: 'Years in Retirement',
      scenarioA: '28',
      scenarioB: '23',
      difference: '-5 years',
      trend: 'down'
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Scenario Comparison</h1>
        <p className="text-gray-600 mt-2">
          Compare up to 3 retirement scenarios to find the best strategy for your situation.
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Selected Scenarios</h2>
          <div className="text-sm text-gray-500">
            {selectedScenarios.length} of 3 scenarios selected
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {selectedScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="relative bg-white border-2 rounded-lg p-4"
              style={{ borderColor: scenario.color }}
            >
              <button
                onClick={() => removeScenario(scenario.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center mb-2">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: scenario.color }}
                ></div>
                <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
              </div>
              <p className="text-sm text-gray-600">Last updated: 2 hours ago</p>
            </div>
          ))}
          
          {selectedScenarios.length < 3 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
              <button
                onClick={() => onNavigate('scenario')}
                className="flex flex-col items-center text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Add Scenario</span>
              </button>
            </div>
          )}
        </div>

        {availableScenarios.length > 0 && selectedScenarios.length < 3 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Scenarios:</p>
            <div className="flex flex-wrap gap-2">
              {availableScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => addScenario(scenario)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  + {scenario.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedScenarios.length >= 2 && (
        <>
          {/* Comparison Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics Comparison</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {selectedScenarios[0].name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {selectedScenarios[1].name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparisonMetrics.map((metric, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {metric.metric}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.scenarioA}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {metric.scenarioB}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`flex items-center ${
                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {metric.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {metric.difference}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Income Comparison Chart */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Annual Income Comparison</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="scenarioA"
                    stroke={selectedScenarios[0].color}
                    strokeWidth={3}
                    name={selectedScenarios[0].name}
                  />
                  <Line
                    type="monotone"
                    dataKey="scenarioB"
                    stroke={selectedScenarios[1].color}
                    strokeWidth={3}
                    name={selectedScenarios[1].name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Difference Analysis */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Difference Analysis</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Income Difference']}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <Bar dataKey="difference" name="Income Difference">
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.difference >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Positive values indicate {selectedScenarios[1].name} provides higher income.
                  Negative values indicate {selectedScenarios[0].name} provides higher income.
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Analysis & Recommendations</h3>
            <div className="space-y-3 text-blue-800">
              <p>
                <strong>Early Retirement Trade-off:</strong> Retiring at 62 provides 5 additional years of retirement 
                but results in $300,000 less lifetime income compared to waiting until 67.
              </p>
              <p>
                <strong>Break-even Analysis:</strong> The higher income from delayed retirement begins to compensate 
                for the lost years starting at age 67, with cumulative benefits surpassing early retirement by age 85.
              </p>
              <p>
                <strong>Recommendation:</strong> Consider your health, family longevity, and personal priorities. 
                If you expect to live beyond 85 and don't need immediate retirement income, delaying retirement may be optimal.
              </p>
            </div>
          </div>
        </>
      )}

      {selectedScenarios.length < 2 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select at least 2 scenarios to compare</h3>
          <p className="text-gray-600 mb-6">
            Add scenarios to see detailed comparisons, charts, and recommendations.
          </p>
          <button
            onClick={() => onNavigate('scenario')}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
          >
            Create New Scenario
          </button>
        </div>
      )}
    </div>
  );
}