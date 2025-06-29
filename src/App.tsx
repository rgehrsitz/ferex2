import { useState } from 'react';
import { Calculator, BarChart3, Settings, Home, Users } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ScenarioBuilder from './pages/ScenarioBuilder';
import Results from './pages/Results';
import Comparison from './pages/Comparison';

type Page = 'dashboard' | 'scenario' | 'results' | 'comparison';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'scenario', name: 'Build Scenario', icon: Calculator },
    { id: 'results', name: 'Results', icon: BarChart3 },
    { id: 'comparison', name: 'Compare', icon: Users },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'scenario':
        return <ScenarioBuilder onNavigate={setCurrentPage} />;
      case 'results':
        return <Results onNavigate={setCurrentPage} />;
      case 'comparison':
        return <Comparison onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">FEREX</h1>
          <p className="text-sm text-gray-600 mt-1">FERS Retirement Explorer</p>
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as Page)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6 border-t">
          <button className="flex items-center text-gray-600 hover:text-gray-900">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}