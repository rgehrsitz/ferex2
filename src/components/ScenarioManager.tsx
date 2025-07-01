import React, { useState, useRef } from 'react';
import {
  Save,
  FolderOpen,
  Download,
  Upload,
  Plus,
  Copy,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { useScenarioManager } from '../lib/useScenarioManager';
import { StoredScenario } from '../types';

interface ScenarioManagerProps {
  currentScenario?: StoredScenario | null;
  onScenarioSelected?: (scenario: StoredScenario) => void;
  onScenarioSaved?: (scenario: StoredScenario) => void;
  showLoadButton?: boolean;
  showSaveButton?: boolean;
  showImportExport?: boolean;
  className?: string;
}

export function ScenarioManager({
  currentScenario,
  onScenarioSelected,
  onScenarioSaved,
  showLoadButton = true,
  showSaveButton = true,
  showImportExport = true,
  className = ''
}: ScenarioManagerProps) {
  const {
    scenarios,
    loading,
    error,
    loadScenario,
    saveScenario,
    createScenario,
    deleteScenario,
    duplicateScenario,
    exportScenarios,
    importScenarios,
    clearError
  } = useScenarioManager();

  const [showScenarioList, setShowScenarioList] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle save current scenario
  const handleSave = async () => {
    if (!currentScenario) return;

    try {
      const saved = await saveScenario(currentScenario);
      onScenarioSaved?.(saved);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle load scenario
  const handleLoad = async (scenario: StoredScenario) => {
    try {
      await loadScenario(scenario.id);
      onScenarioSelected?.(scenario);
      setShowScenarioList(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle create new scenario
  const handleCreate = async () => {
    if (!newScenarioName.trim()) return;

    try {
      const newScenario = await createScenario(newScenarioName.trim(), newScenarioDescription.trim());
      onScenarioSelected?.(newScenario);
      setShowCreateDialog(false);
      setNewScenarioName('');
      setNewScenarioDescription('');
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle duplicate scenario
  const handleDuplicate = async (scenario: StoredScenario) => {
    try {
      const duplicated = await duplicateScenario(scenario.id, `${scenario.name} (Copy)`);
      onScenarioSelected?.(duplicated);
      setShowScenarioList(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle delete scenario
  const handleDelete = async (id: string) => {
    try {
      await deleteScenario(id);
      setShowDeleteConfirm(null);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle export scenarios
  const handleExport = async () => {
    try {
      const jsonContent = await exportScenarios();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ferex-scenarios-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Handle import scenarios
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await importScenarios(content, importMode);
      } catch (err) {
        // Error is handled by the hook
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {showSaveButton && currentScenario && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Scenario
          </button>
        )}

        {showLoadButton && (
          <button
            onClick={() => setShowScenarioList(true)}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Scenario
          </button>
        )}

        <button
          onClick={() => setShowCreateDialog(true)}
          disabled={loading}
          className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Scenario
        </button>

        {showImportExport && (
          <>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All
            </button>

            <div className="relative">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </>
        )}
      </div>

      {/* Scenario List Modal */}
      {showScenarioList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Load Scenario</h3>
              <button
                onClick={() => setShowScenarioList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading scenarios...</p>
                </div>
              ) : scenarios.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No scenarios found</p>
                  <button
                    onClick={() => {
                      setShowScenarioList(false);
                      setShowCreateDialog(true);
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first scenario
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                          {scenario.description && (
                            <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                          )}
                        </div>
                        <div className="flex items-center ml-2">
                          {scenario.isComplete ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-yellow-400" />
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Modified {formatDate(scenario.lastModified)}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoad(scenario)}
                          className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDuplicate(scenario)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(scenario.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Scenario Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create New Scenario</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scenario Name *
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="e.g., Retirement at 62"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  placeholder="Brief description of this scenario"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewScenarioName('');
                  setNewScenarioDescription('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newScenarioName.trim() || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Scenario</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this scenario? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Mode Selection (could be expanded) */}
      {showImportExport && (
        <div className="mt-2 text-xs text-gray-600">
          Import mode:
          <select
            value={importMode}
            onChange={(e) => setImportMode(e.target.value as 'replace' | 'merge')}
            className="ml-1 border-0 bg-transparent text-blue-600 focus:outline-none"
          >
            <option value="merge">Merge with existing</option>
            <option value="replace">Replace all scenarios</option>
          </select>
        </div>
      )}
    </div>
  );
}
