import { useState, useMemo } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { TSP, TSPWithdrawalStrategy, TSPFundsAllocation } from '../types';
import { FormField, Input, Select } from './FormField';

interface TSPManagerProps {
  tsp: TSP;
  onTSPChange: (tsp: TSP) => void;
}

export function TSPManager({ tsp, onTSPChange }: TSPManagerProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = (fieldId: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [fieldId]: error }));
  };

  const clearFieldError = (fieldId: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  };

  const validateNumber = (value: string, fieldId: string, min: number = 0, max?: number, label?: string): number | null => {
    if (!value.trim()) {
      setFieldError(fieldId, `${label || 'Value'} is required`);
      return null;
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      setFieldError(fieldId, 'Please enter a valid number');
      return null;
    }

    if (num < min) {
      setFieldError(fieldId, `${label || 'Value'} must be at least ${min}`);
      return null;
    }

    if (max !== undefined && num > max) {
      setFieldError(fieldId, `${label || 'Value'} cannot exceed ${max}`);
      return null;
    }

    clearFieldError(fieldId);
    return num;
  };

  const validatePercentage = (value: string, fieldId: string, label: string): number | null => {
    return validateNumber(value, fieldId, 0, 100, `${label} percentage`);
  };

  // Calculate totals and validation
  const allocationTotal = useMemo(() => {
    return tsp.fundsAllocation.gFund + tsp.fundsAllocation.fFund + 
           tsp.fundsAllocation.cFund + tsp.fundsAllocation.sFund + 
           tsp.fundsAllocation.iFund;
  }, [tsp.fundsAllocation]);

  const balanceTotal = useMemo(() => {
    return tsp.traditionalBalance + tsp.rothBalance;
  }, [tsp.traditionalBalance, tsp.rothBalance]);

  const balanceDiscrepancy = Math.abs(balanceTotal - tsp.currentBalance);

  const updateTSP = (updates: Partial<TSP>) => {
    onTSPChange({ ...tsp, ...updates });
  };

  // Helper to create number input handlers
  const createNumberInputHandlers = (
    field: keyof TSP | string, 
    min: number = 0, 
    max?: number, 
    label?: string,
    isPercentage: boolean = false
  ) => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '') {
        if (field.includes('.')) {
          // Handle nested fields like fundsAllocation.gFund
          const [parent, child] = field.split('.');
          if (parent === 'fundsAllocation') {
            updateFundsAllocation({ [child]: 0 });
          } else if (parent === 'withdrawalStrategy') {
            updateWithdrawalStrategy({ [child]: 0 });
          }
        } else {
          updateTSP({ [field as keyof TSP]: 0 } as any);
        }
        return;
      }
      
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const finalValue = isPercentage ? numValue : numValue;
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (parent === 'fundsAllocation') {
            updateFundsAllocation({ [child]: finalValue });
          } else if (parent === 'withdrawalStrategy') {
            updateWithdrawalStrategy({ [child]: finalValue });
          }
        } else {
          updateTSP({ [field as keyof TSP]: finalValue } as any);
        }
      }
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const fieldId = field.replace('.', '_');
      const value = validateNumber(e.target.value, fieldId, min, max, label);
      if (value !== null) {
        const finalValue = isPercentage ? value : value;
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (parent === 'fundsAllocation') {
            updateFundsAllocation({ [child]: finalValue });
          } else if (parent === 'withdrawalStrategy') {
            updateWithdrawalStrategy({ [child]: finalValue });
          }
        } else {
          updateTSP({ [field as keyof TSP]: finalValue } as any);
        }
      }
    }
  });

  const updateWithdrawalStrategy = (updates: Partial<TSPWithdrawalStrategy>) => {
    updateTSP({
      withdrawalStrategy: { ...tsp.withdrawalStrategy, ...updates }
    });
  };

  const updateFundsAllocation = (updates: Partial<TSPFundsAllocation>) => {
    updateTSP({
      fundsAllocation: { ...tsp.fundsAllocation, ...updates }
    });
  };

  return (
    <div className="space-y-8">
      {/* TSP Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-lg p-2 mr-3">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Thrift Savings Plan (TSP)</h3>
            <p className="text-blue-700 text-sm">
              Enter your current TSP balance, contributions, and investment allocation for retirement planning.
            </p>
          </div>
        </div>
      </div>

      {/* Current Balances */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Current TSP Balances
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormField label="Total TSP Balance" required error={fieldErrors['totalBalance']}>
            <Input
              type="number"
              min="0"
              step="100"
              placeholder="150000"
              error={!!fieldErrors['totalBalance']}
              value={tsp.currentBalance || ''}
              {...createNumberInputHandlers('currentBalance', 0, undefined, 'Total TSP balance')}
            />
          </FormField>

          <FormField label="Traditional TSP" required error={fieldErrors['traditionalBalance']}>
            <Input
              type="number"
              min="0"
              step="100"
              placeholder="100000"
              error={!!fieldErrors['traditionalBalance']}
              value={tsp.traditionalBalance || ''}
              {...createNumberInputHandlers('traditionalBalance', 0, undefined, 'Traditional TSP balance')}
            />
          </FormField>

          <FormField label="Roth TSP" required error={fieldErrors['rothBalance']}>
            <Input
              type="number"
              min="0"
              step="100"
              placeholder="50000"
              error={!!fieldErrors['rothBalance']}
              value={tsp.rothBalance || ''}
              {...createNumberInputHandlers('rothBalance', 0, undefined, 'Roth TSP balance')}
            />
          </FormField>
        </div>

        {/* Balance Validation */}
        {balanceDiscrepancy > 1000 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 text-sm">
                <strong>Balance Mismatch:</strong> Traditional + Roth (${balanceTotal.toLocaleString()}) 
                should equal Total Balance (${tsp.currentBalance.toLocaleString()}).
              </p>
            </div>
          </div>
        )}

        {balanceDiscrepancy <= 1000 && tsp.currentBalance > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800 text-sm">TSP balances are properly allocated.</p>
          </div>
        )}
      </div>

      {/* Contributions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Contributions</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="Monthly Employee Contribution" 
            tooltip="Your current monthly contribution to TSP (employee portion)"
            error={fieldErrors['monthlyContribution']}
          >
            <Input
              type="number"
              min="0"
              step="50"
              placeholder="1000"
              error={!!fieldErrors['monthlyContribution']}
              value={tsp.monthlyContribution || ''}
              {...createNumberInputHandlers('monthlyContribution', 0, 10000, 'Monthly contribution')}
            />
          </FormField>

          <FormField 
            label="Monthly Agency Match" 
            tooltip="Agency matching contribution (typically up to 5% of salary)"
            error={fieldErrors['agencyMatch']}
          >
            <Input
              type="number"
              min="0"
              step="50"
              placeholder="500"
              error={!!fieldErrors['agencyMatch']}
              value={tsp.agencyMatch || ''}
              {...createNumberInputHandlers('agencyMatch', 0, 5000, 'Agency match')}
            />
          </FormField>
        </div>
      </div>

      {/* Fund Allocation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-blue-600" />
          TSP Fund Allocation
        </h4>

        <p className="text-gray-600 text-sm mb-4">
          Enter the percentage allocation for each TSP fund. Total must equal 100%.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <FormField label="G Fund %" error={fieldErrors['gFund']}>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="10"
              error={!!fieldErrors['gFund']}
              value={tsp.fundsAllocation.gFund || ''}
              onBlur={(e) => {
                const value = validatePercentage(e.target.value, 'gFund', 'G Fund');
                if (value !== null) {
                  updateFundsAllocation({ gFund: value });
                }
              }}
            />
          </FormField>

          <FormField label="F Fund %" error={fieldErrors['fFund']}>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="10"
              error={!!fieldErrors['fFund']}
              value={tsp.fundsAllocation.fFund || ''}
              onBlur={(e) => {
                const value = validatePercentage(e.target.value, 'fFund', 'F Fund');
                if (value !== null) {
                  updateFundsAllocation({ fFund: value });
                }
              }}
            />
          </FormField>

          <FormField label="C Fund %" error={fieldErrors['cFund']}>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="40"
              error={!!fieldErrors['cFund']}
              value={tsp.fundsAllocation.cFund || ''}
              onBlur={(e) => {
                const value = validatePercentage(e.target.value, 'cFund', 'C Fund');
                if (value !== null) {
                  updateFundsAllocation({ cFund: value });
                }
              }}
            />
          </FormField>

          <FormField label="S Fund %" error={fieldErrors['sFund']}>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="20"
              error={!!fieldErrors['sFund']}
              value={tsp.fundsAllocation.sFund || ''}
              onBlur={(e) => {
                const value = validatePercentage(e.target.value, 'sFund', 'S Fund');
                if (value !== null) {
                  updateFundsAllocation({ sFund: value });
                }
              }}
            />
          </FormField>

          <FormField label="I Fund %" error={fieldErrors['iFund']}>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="20"
              error={!!fieldErrors['iFund']}
              value={tsp.fundsAllocation.iFund || ''}
              onBlur={(e) => {
                const value = validatePercentage(e.target.value, 'iFund', 'I Fund');
                if (value !== null) {
                  updateFundsAllocation({ iFund: value });
                }
              }}
            />
          </FormField>
        </div>

        {/* Allocation Validation */}
        {Math.abs(allocationTotal - 100) > 1 && allocationTotal > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 text-sm">
                <strong>Allocation Total:</strong> {allocationTotal.toFixed(1)}% 
                (should equal 100%)
              </p>
            </div>
          </div>
        )}

        {Math.abs(allocationTotal - 100) <= 1 && allocationTotal > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800 text-sm">Fund allocation totals 100%.</p>
          </div>
        )}
      </div>

      {/* Growth Rate */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Expected Growth Rate</h4>

        <FormField 
          label="Annual Growth Rate (%)" 
          tooltip="Expected annual return on your TSP investments. Historical average is around 7-8%"
          error={fieldErrors['growthRate']}
        >
          <Input
            type="number"
            min="0"
            max="15"
            step="0.1"
            placeholder="7.0"
            error={!!fieldErrors['growthRate']}
            value={tsp.growthRate ? (tsp.growthRate * 100).toFixed(1) : ''}
            onBlur={(e) => {
              const value = validateNumber(e.target.value, 'growthRate', 0, 15, 'Growth rate');
              if (value !== null) {
                updateTSP({ growthRate: value / 100 }); // Convert percentage to decimal
              }
            }}
          />
        </FormField>
      </div>

      {/* Withdrawal Strategy */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Strategy</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Withdrawal Type" required>
            <Select
              value={tsp.withdrawalStrategy.type}
              onChange={(e) => updateWithdrawalStrategy({ 
                type: e.target.value as 'LIFE_EXPECTANCY' | 'FIXED_AMOUNT' | 'MIXED' 
              })}
              options={[
                { value: 'LIFE_EXPECTANCY', label: 'Life Expectancy Payments' },
                { value: 'FIXED_AMOUNT', label: 'Fixed Dollar Amount' },
                { value: 'MIXED', label: 'Mixed Withdrawal' }
              ]}
            />
          </FormField>

          <FormField label="Start Age" required error={fieldErrors['startAge']}>
            <Input
              type="number"
              min="50"
              max="75"
              placeholder="62"
              error={!!fieldErrors['startAge']}
              value={tsp.withdrawalStrategy.startAge || ''}
              onBlur={(e) => {
                const value = validateNumber(e.target.value, 'startAge', 50, 75, 'Start age');
                if (value !== null) {
                  updateWithdrawalStrategy({ startAge: value });
                }
              }}
            />
          </FormField>

          <FormField label="Frequency" required>
            <Select
              value={tsp.withdrawalStrategy.frequency}
              onChange={(e) => updateWithdrawalStrategy({ 
                frequency: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' 
              })}
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'QUARTERLY', label: 'Quarterly' },
                { value: 'ANNUALLY', label: 'Annually' }
              ]}
            />
          </FormField>
        </div>

        {tsp.withdrawalStrategy.type === 'FIXED_AMOUNT' && (
          <div className="mt-4">
            <FormField label="Fixed Monthly Amount" required error={fieldErrors['fixedAmount']}>
              <Input
                type="number"
                min="100"
                step="100"
                placeholder="2000"
                error={!!fieldErrors['fixedAmount']}
                value={tsp.withdrawalStrategy.fixedAmount || ''}
                onBlur={(e) => {
                  const value = validateNumber(e.target.value, 'fixedAmount', 100, undefined, 'Fixed amount');
                  if (value !== null) {
                    updateWithdrawalStrategy({ fixedAmount: value });
                  }
                }}
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  );
}