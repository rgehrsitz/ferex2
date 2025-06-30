import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { DollarSign, PieChart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { TSP } from '../types';
import { tspSchema, TSPFormData } from '../schemas';
import { ControlledInput, ControlledSelect } from './FormComponents';

interface TSPManagerRHFProps {
  tsp: TSP;
  onTSPChange: (tsp: TSP) => void;
}

export function TSPManagerRHF({ tsp, onTSPChange }: TSPManagerRHFProps) {
  const {
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<TSPFormData>({
    resolver: zodResolver(tspSchema),
    mode: 'onBlur',
    defaultValues: {
      currentBalance: tsp.currentBalance,
      traditionalBalance: tsp.traditionalBalance,
      rothBalance: tsp.rothBalance,
      monthlyContribution: tsp.monthlyContribution,
      agencyMatch: tsp.agencyMatch,
      growthRate: tsp.growthRate * 100, // Convert decimal to percentage for display
      withdrawalStrategy: {
        type: tsp.withdrawalStrategy.type,
        fixedAmount: tsp.withdrawalStrategy.fixedAmount,
        fixedPercentage: tsp.withdrawalStrategy.fixedPercentage,
        mixedLifeExpectancyAmount: tsp.withdrawalStrategy.mixedLifeExpectancyAmount,
        mixedFixedAmount: tsp.withdrawalStrategy.mixedFixedAmount,
        frequency: tsp.withdrawalStrategy.frequency,
        startAge: tsp.withdrawalStrategy.startAge
      },
      fundsAllocation: {
        gFund: tsp.fundsAllocation.gFund,
        fFund: tsp.fundsAllocation.fFund,
        cFund: tsp.fundsAllocation.cFund,
        sFund: tsp.fundsAllocation.sFund,
        iFund: tsp.fundsAllocation.iFund,
        lifecycleFund: tsp.fundsAllocation.lifecycleFund
      }
    }
  });

  // Update parent component on blur - save data even if form has validation errors
  const updateParent = () => {
    const formData = watch();
    // Always save data, even if form is invalid (user might be in middle of filling form)
      // Properly construct TSP object with correct structure
      const tspData: TSP = {
        currentBalance: formData.currentBalance || 0,
        traditionalBalance: formData.traditionalBalance || 0,
        rothBalance: formData.rothBalance || 0,
        monthlyContribution: formData.monthlyContribution || 0,
        agencyMatch: formData.agencyMatch || 0,
        growthRate: (formData.growthRate || 0) / 100, // Convert percentage to decimal
        withdrawalStrategy: {
          type: formData.withdrawalStrategy?.type || 'LIFE_EXPECTANCY',
          fixedAmount: formData.withdrawalStrategy?.fixedAmount,
          fixedPercentage: formData.withdrawalStrategy?.fixedPercentage,
          mixedLifeExpectancyAmount: formData.withdrawalStrategy?.mixedLifeExpectancyAmount,
          mixedFixedAmount: formData.withdrawalStrategy?.mixedFixedAmount,
          frequency: formData.withdrawalStrategy?.frequency || 'MONTHLY',
          startAge: formData.withdrawalStrategy?.startAge || 62
        },
        fundsAllocation: {
          gFund: formData.fundsAllocation?.gFund || 0,
          fFund: formData.fundsAllocation?.fFund || 0,
          cFund: formData.fundsAllocation?.cFund || 0,
          sFund: formData.fundsAllocation?.sFund || 0,
          iFund: formData.fundsAllocation?.iFund || 0,
          lifecycleFund: formData.fundsAllocation?.lifecycleFund
        }
      };
      onTSPChange(tspData);
  };

  // Update form when external TSP data changes
  useEffect(() => {
    reset({
      currentBalance: tsp.currentBalance,
      traditionalBalance: tsp.traditionalBalance,
      rothBalance: tsp.rothBalance,
      monthlyContribution: tsp.monthlyContribution,
      agencyMatch: tsp.agencyMatch,
      growthRate: tsp.growthRate * 100, // Convert decimal to percentage for display
      withdrawalStrategy: {
        type: tsp.withdrawalStrategy.type,
        fixedAmount: tsp.withdrawalStrategy.fixedAmount,
        fixedPercentage: tsp.withdrawalStrategy.fixedPercentage,
        mixedLifeExpectancyAmount: tsp.withdrawalStrategy.mixedLifeExpectancyAmount,
        mixedFixedAmount: tsp.withdrawalStrategy.mixedFixedAmount,
        frequency: tsp.withdrawalStrategy.frequency,
        startAge: tsp.withdrawalStrategy.startAge
      },
      fundsAllocation: {
        gFund: tsp.fundsAllocation.gFund,
        fFund: tsp.fundsAllocation.fFund,
        cFund: tsp.fundsAllocation.cFund,
        sFund: tsp.fundsAllocation.sFund,
        iFund: tsp.fundsAllocation.iFund,
        lifecycleFund: tsp.fundsAllocation.lifecycleFund
      }
    });
  }, [tsp, reset]);

  // Watch specific values for validation states
  const traditionalBalance = watch('traditionalBalance') || 0;
  const rothBalance = watch('rothBalance') || 0;
  const gFund = watch('fundsAllocation.gFund') || 0;
  const fFund = watch('fundsAllocation.fFund') || 0;
  const cFund = watch('fundsAllocation.cFund') || 0;
  const sFund = watch('fundsAllocation.sFund') || 0;
  const iFund = watch('fundsAllocation.iFund') || 0;
  const withdrawalType = watch('withdrawalStrategy.type');
  const selectedLFund = watch('selectedLFund');

  // Calculate validation states
  const allocationTotal = gFund + fFund + cFund + sFund + iFund;
  const balanceTotal = traditionalBalance + rothBalance;

  // L Fund allocations and growth rates
  const lFundData = {
    'L2070': { gFund: 2, fFund: 5, cFund: 58, sFund: 22, iFund: 13, growthRate: 9.5 },
    'L2065': { gFund: 2, fFund: 5, cFund: 58, sFund: 22, iFund: 13, growthRate: 9.5 },
    'L2060': { gFund: 2, fFund: 5, cFund: 58, sFund: 22, iFund: 13, growthRate: 9.4 },
    'L2055': { gFund: 3, fFund: 6, cFund: 56, sFund: 21, iFund: 14, growthRate: 9.2 },
    'L2050': { gFund: 4, fFund: 7, cFund: 54, sFund: 21, iFund: 14, growthRate: 9.0 },
    'L2045': { gFund: 6, fFund: 9, cFund: 51, sFund: 20, iFund: 14, growthRate: 8.6 },
    'L2040': { gFund: 9, fFund: 12, cFund: 47, sFund: 19, iFund: 13, growthRate: 8.1 },
    'L2035': { gFund: 13, fFund: 16, cFund: 42, sFund: 17, iFund: 12, growthRate: 7.5 },
    'L2030': { gFund: 19, fFund: 22, cFund: 35, sFund: 15, iFund: 9, growthRate: 6.8 },
    'L2025': { gFund: 34, fFund: 26, cFund: 24, sFund: 11, iFund: 5, growthRate: 5.2 },
    'LINCOME': { gFund: 74, fFund: 20, cFund: 4, sFund: 1, iFund: 1, growthRate: 3.2 }
  } as const;

  // Auto-populate L Fund allocation
  const applyLFundAllocation = (lFund: keyof typeof lFundData) => {
    const allocation = lFundData[lFund];
    setValue('fundsAllocation.gFund', allocation.gFund);
    setValue('fundsAllocation.fFund', allocation.fFund);
    setValue('fundsAllocation.cFund', allocation.cFund);
    setValue('fundsAllocation.sFund', allocation.sFund);
    setValue('fundsAllocation.iFund', allocation.iFund);
    setValue('growthRate', allocation.growthRate);
    updateParent();
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

      <form className="space-y-8">
        {/* Current Balances */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Current TSP Balances
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <ControlledInput
              name="traditionalBalance"
              control={control}
              label="Traditional TSP"
              type="number"
              min={0}
              step={100}
              placeholder="100000"
              required
              tooltip="Your traditional (pre-tax) TSP balance"
              onUpdate={() => {
                setValue('currentBalance', traditionalBalance + rothBalance);
                updateParent();
              }}
            />

            <ControlledInput
              name="rothBalance"
              control={control}
              label="Roth TSP"
              type="number"
              min={0}
              step={100}
              placeholder="50000"
              required
              tooltip="Your Roth (after-tax) TSP balance"
              onUpdate={() => {
                setValue('currentBalance', traditionalBalance + rothBalance);
                updateParent();
              }}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Total TSP Balance
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 font-semibold">
                ${balanceTotal.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">Automatically calculated</p>
            </div>
          </div>

          {/* Balance Confirmation */}
          {balanceTotal > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-800 text-sm">
                Total TSP Balance: ${balanceTotal.toLocaleString()} (Traditional: ${traditionalBalance.toLocaleString()}, Roth: ${rothBalance.toLocaleString()})
              </p>
            </div>
          )}
        </div>

        {/* Contributions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Contributions</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ControlledInput
              name="monthlyContribution"
              control={control}
              label="Monthly Employee Contribution"
              type="number"
              min={0}
              step={50}
              placeholder="1000"
              tooltip="Your current monthly contribution to TSP (employee portion)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="agencyMatch"
              control={control}
              label="Monthly Agency Match"
              type="number"
              min={0}
              step={50}
              placeholder="500"
              tooltip="Agency matching contribution (typically up to 5% of salary)"
              onUpdate={updateParent}
            />
          </div>
        </div>

        {/* Fund Allocation */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-600" />
            TSP Fund Allocation
          </h4>

          {/* L Fund Quick Selection */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Quick L Fund Selection</h5>
            <p className="text-blue-700 text-sm mb-3">
              Choose an L Fund to automatically set allocation and growth rate based on your target retirement year.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.keys(lFundData).map((fund) => (
                <button
                  key={fund}
                  type="button"
                  onClick={() => applyLFundAllocation(fund as keyof typeof lFundData)}
                  className={`px-3 py-2 text-xs rounded border transition-colors ${
                    selectedLFund === fund
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {fund}
                </button>
              ))}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            Or enter custom allocation percentages for each TSP fund. Total must equal 100%.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <ControlledInput
              name="fundsAllocation.gFund"
              control={control}
              label="G Fund %"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="10"
              tooltip="Government Securities Investment Fund (G Fund)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="fundsAllocation.fFund"
              control={control}
              label="F Fund %"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="10"
              tooltip="Fixed Income Index Investment Fund (F Fund)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="fundsAllocation.cFund"
              control={control}
              label="C Fund %"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="40"
              tooltip="Common Stock Index Investment Fund (C Fund)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="fundsAllocation.sFund"
              control={control}
              label="S Fund %"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="20"
              tooltip="Small Capitalization Stock Index Investment Fund (S Fund)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="fundsAllocation.iFund"
              control={control}
              label="I Fund %"
              type="number"
              min={0}
              max={100}
              step={1}
              placeholder="20"
              tooltip="International Stock Index Investment Fund (I Fund)"
              onUpdate={updateParent}
            />
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

          <ControlledInput
            name="growthRate"
            control={control}
            label="Annual Growth Rate (%)"
            type="number"
            min={0}
            max={15}
            step={0.1}
            placeholder="7.0"
            tooltip="Expected annual return on your TSP investments. Historical average is around 7-8%"
            onUpdate={updateParent}
          />
        </div>

        {/* Withdrawal Strategy */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Strategy</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ControlledSelect
              name="withdrawalStrategy.type"
              control={control}
              label="Withdrawal Type"
              required
              tooltip="Choose how you want to withdraw from your TSP in retirement"
              options={[
                { value: 'LIFE_EXPECTANCY', label: 'Life Expectancy Payments' },
                { value: 'FIXED_AMOUNT', label: 'Fixed Dollar Amount' },
                { value: 'FIXED_PERCENTAGE', label: 'Fixed Percentage' },
                { value: 'MIXED', label: 'Mixed Strategy' }
              ]}
              onUpdate={updateParent}
            />

            <ControlledInput
              name="withdrawalStrategy.startAge"
              control={control}
              label="Start Age"
              type="number"
              min={50}
              max={75}
              placeholder="62"
              required
              tooltip="Age when you plan to start TSP withdrawals"
              onUpdate={updateParent}
            />

            <ControlledSelect
              name="withdrawalStrategy.frequency"
              control={control}
              label="Frequency"
              required
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'QUARTERLY', label: 'Quarterly' },
                { value: 'ANNUALLY', label: 'Annually' }
              ]}
              onUpdate={updateParent}
            />
          </div>

          {/* Conditional fields based on withdrawal type */}
          <div className="mt-4 space-y-4">
            {withdrawalType === 'FIXED_AMOUNT' && (
              <ControlledInput
                name="withdrawalStrategy.fixedAmount"
                control={control}
                label="Fixed Monthly Amount"
                type="number"
                min={100}
                step={100}
                placeholder="2000"
                required
                tooltip="Fixed dollar amount for monthly withdrawals"
                onUpdate={updateParent}
              />
            )}

            {withdrawalType === 'FIXED_PERCENTAGE' && (
              <ControlledInput
                name="withdrawalStrategy.fixedPercentage"
                control={control}
                label="Fixed Annual Percentage (%)"
                type="number"
                min={0.1}
                max={20}
                step={0.1}
                placeholder="4.0"
                required
                tooltip="Annual percentage of your TSP balance to withdraw (e.g., 4% = 4.0)"
                onUpdate={updateParent}
              />
            )}

            {withdrawalType === 'MIXED' && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="font-medium text-amber-900 mb-2">Mixed Strategy</h5>
                  <p className="text-amber-700 text-sm">
                    Combine life expectancy payments with a fixed amount. You can receive life expectancy payments 
                    for steady income, plus take additional fixed withdrawals when needed.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ControlledInput
                    name="withdrawalStrategy.mixedLifeExpectancyAmount"
                    control={control}
                    label="Life Expectancy Portion ($)"
                    type="number"
                    min={100}
                    step={100}
                    placeholder="1500"
                    tooltip="Monthly amount from life expectancy calculations"
                    onUpdate={updateParent}
                  />

                  <ControlledInput
                    name="withdrawalStrategy.mixedFixedAmount"
                    control={control}
                    label="Additional Fixed Amount ($)"
                    type="number"
                    min={100}
                    step={100}
                    placeholder="500"
                    tooltip="Additional fixed monthly amount"
                    onUpdate={updateParent}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Form Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-800 font-medium">Please correct the following errors:</h4>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>{error?.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}