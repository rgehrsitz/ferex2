import { useState, useCallback, useRef } from 'react';
import { RetirementScenario, MonteCarloResults } from '../types';

interface SimulationState {
  isRunning: boolean;
  progress: number;
  results: MonteCarloResults | null;
  error: string | null;
}

export function useMonteCarloSimulation() {
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    progress: 0,
    results: null,
    error: null,
  });

  const workerRef = useRef<Worker | null>(null);

  const runSimulation = useCallback((scenario: RetirementScenario, iterations = 10000) => {
    // Terminate existing worker if running
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setState({
      isRunning: true,
      progress: 0,
      results: null,
      error: null,
    });

    try {
      // Create new worker
      workerRef.current = new Worker('/monte-carlo-worker.js');

      workerRef.current.onmessage = (e) => {
        const { type, progress, results, error } = e.data;

        switch (type) {
          case 'SIMULATION_PROGRESS':
            setState(prev => ({
              ...prev,
              progress,
            }));
            break;

          case 'SIMULATION_COMPLETE':
            setState({
              isRunning: false,
              progress: 100,
              results,
              error: null,
            });
            // Clean up worker
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }
            break;

          case 'SIMULATION_ERROR':
            setState({
              isRunning: false,
              progress: 0,
              results: null,
              error: error || 'Unknown simulation error',
            });
            break;
        }
      };

      workerRef.current.onerror = () => {
        setState({
          isRunning: false,
          progress: 0,
          results: null,
          error: 'Worker error occurred',
        });
      };

      // Start simulation
      workerRef.current.postMessage({ scenario, iterations });

    } catch (error) {
      setState({
        isRunning: false,
        progress: 0,
        results: null,
        error: error instanceof Error ? error.message : 'Failed to start simulation',
      });
    }
  }, []);

  const cancelSimulation = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setState({
      isRunning: false,
      progress: 0,
      results: null,
      error: 'Simulation cancelled',
    });
  }, []);

  // Cleanup worker on unmount
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    ...state,
    runSimulation,
    cancelSimulation,
    cleanup,
  };
}