import { useState, useMemo, useCallback } from 'react';
import { Plus, X, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';
import { ServicePeriod, MilitaryService } from '../types';
import { ServiceCalculator } from '../lib/serviceCalculations';
import { FormField, Input, Select } from './FormField';

interface ServicePeriodManagerProps {
  servicePeriods: ServicePeriod[];
  militaryService?: MilitaryService;
  unusedSickLeave: number;
  onServicePeriodsChange: (periods: ServicePeriod[]) => void;
  onMilitaryServiceChange: (military?: MilitaryService) => void;
  onSickLeaveChange: (hours: number) => void;
}

export function ServicePeriodManager({
  servicePeriods,
  militaryService,
  unusedSickLeave,
  onServicePeriodsChange,
  onMilitaryServiceChange: _onMilitaryServiceChange,
  onSickLeaveChange
}: ServicePeriodManagerProps) {
  const [showAdvanced, setShowAdvanced] = useState(servicePeriods.length > 1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Calculate current totals with error handling and more stable dependencies
  const creditableService = useMemo(() => {
    try {
      // Only calculate if we have valid service periods
      if (!servicePeriods || servicePeriods.length === 0) {
        return {
          servicePeriods: [],
          totalCreditableYears: 0,
          totalCreditableMonths: 0
        };
      }
      
      // Check if all service periods have valid dates
      const hasValidDates = servicePeriods.every(period => 
        period.startDate && period.endDate && 
        !isNaN(new Date(period.startDate).getTime()) && 
        !isNaN(new Date(period.endDate).getTime())
      );
      
      if (!hasValidDates) {
        console.log('Skipping calculation - invalid dates detected');
        return {
          servicePeriods,
          militaryService,
          totalCreditableYears: 0,
          totalCreditableMonths: 0
        };
      }
      
      return ServiceCalculator.calculateCreditableService(
        servicePeriods,
        militaryService,
        unusedSickLeave
      );
    } catch (error) {
      console.error('Error calculating creditable service:', error);
      return {
        servicePeriods,
        militaryService,
        totalCreditableYears: 0,
        totalCreditableMonths: 0
      };
    }
  }, [servicePeriods, militaryService, unusedSickLeave]);

  const validateAndUpdate = (newPeriods: ServicePeriod[]) => {
    try {
      console.log('Validating periods:', newPeriods);
      const errors = ServiceCalculator.validateServicePeriods(newPeriods);
      console.log('Validation errors:', errors);
      setValidationErrors(errors);
      onServicePeriodsChange(newPeriods);
    } catch (error) {
      console.error('Error in validateAndUpdate:', error);
      setValidationErrors([`Validation error: ${error}`]);
    }
  };

  const addServicePeriod = () => {
    const newPeriod: ServicePeriod = {
      id: `period-${Date.now()}`,
      startDate: new Date(),
      endDate: new Date(),
      serviceType: 'FERS_FULL_TIME',
      agency: '',
      position: '',
      depositRequired: false,
      depositPaid: true
    };
    validateAndUpdate([...servicePeriods, newPeriod]);
    setShowAdvanced(true);
  };

  const updateServicePeriod = useCallback((id: string, updates: Partial<ServicePeriod>) => {
    const updated = servicePeriods.map(period =>
      period.id === id ? { ...period, ...updates } : period
    );
    
    // For date updates, update state immediately but don't trigger validation yet
    onServicePeriodsChange(updated);
  }, [servicePeriods, onServicePeriodsChange]);

  const validateServicePeriod = useCallback((id: string, updates: Partial<ServicePeriod>) => {
    const updated = servicePeriods.map(period =>
      period.id === id ? { ...period, ...updates } : period
    );
    validateAndUpdate(updated);
  }, [servicePeriods]);

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

  const removeServicePeriod = (id: string) => {
    const filtered = servicePeriods.filter(period => period.id !== id);
    validateAndUpdate(filtered);
    if (filtered.length <= 1) {
      setShowAdvanced(false);
    }
  };

  const generateSimplePeriod = () => {
    // Use first and last dates from existing periods, or default dates
    const firstDate = servicePeriods.length > 0 
      ? servicePeriods[0].startDate 
      : new Date('2000-01-01');
    const lastDate = servicePeriods.length > 0 
      ? servicePeriods[servicePeriods.length - 1].endDate 
      : new Date();

    const simplePeriod = ServiceCalculator.generateSimpleServicePeriod(
      new Date(firstDate),
      new Date(lastDate),
      'Federal Agency'
    );
    
    validateAndUpdate([simplePeriod]);
    setShowAdvanced(false);
  };

  const serviceTypeOptions = [
    { value: 'FERS_FULL_TIME', label: 'FERS Full-Time' },
    { value: 'FERS_PART_TIME', label: 'FERS Part-Time' },
    { value: 'TEMPORARY', label: 'Temporary Appointment' },
    { value: 'SEASONAL', label: 'Seasonal Appointment' },
    { value: 'NON_DEDUCTION', label: 'Non-Deduction Service' }
  ];

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Creditable Service Summary</h3>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Years:</span>
                <span className="font-semibold ml-2 text-blue-900">
                  {creditableService.totalCreditableYears.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Total Months:</span>
                <span className="font-semibold ml-2 text-blue-900">
                  {creditableService.totalCreditableMonths.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <Calculator className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Service Period Issues</h4>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Simple vs Advanced Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Service History</h3>
          <p className="text-sm text-gray-600">
            {showAdvanced 
              ? 'Detailed service periods for complex employment history'
              : 'Simplified entry for continuous federal service'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={generateSimplePeriod}
            className={`px-3 py-1 text-sm rounded-md ${
              !showAdvanced 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setShowAdvanced(true)}
            className={`px-3 py-1 text-sm rounded-md ${
              showAdvanced 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Service Periods */}
      <div className="space-y-4">
        {servicePeriods.map((period, index) => (
          <div key={period.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                Service Period {index + 1}
                {period.notes && <span className="text-gray-500 text-sm ml-2">({period.notes})</span>}
              </h4>
              {showAdvanced && servicePeriods.length > 1 && (
                <button
                  onClick={() => removeServicePeriod(period.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Start Date" required error={fieldErrors[`${period.id}-startDate`]}>
                <Input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  error={!!fieldErrors[`${period.id}-startDate`]}
                  defaultValue={period.startDate instanceof Date 
                    ? period.startDate.toLocaleDateString('en-US')
                    : ''}
                  onBlur={(e) => {
                    const fieldId = `${period.id}-startDate`;
                    console.log('Start date blur validation:', e.target.value);
                    
                    if (!e.target.value.trim()) {
                      setFieldError(fieldId, 'Start date is required');
                      return;
                    }
                    
                    try {
                      const newDate = new Date(e.target.value);
                      const year = newDate.getFullYear();
                      
                      if (isNaN(newDate.getTime())) {
                        setFieldError(fieldId, 'Please enter a valid date (MM/DD/YYYY)');
                        return;
                      }
                      
                      if (year < 1970 || year > 2030) {
                        setFieldError(fieldId, 'Year must be between 1970 and 2030');
                        return;
                      }
                      
                      // Valid date - clear any errors and update
                      clearFieldError(fieldId);
                      updateServicePeriod(period.id, { startDate: newDate });
                      validateServicePeriod(period.id, { startDate: newDate });
                      
                    } catch (error) {
                      setFieldError(fieldId, 'Please enter a valid date (MM/DD/YYYY)');
                      console.error('Error processing start date:', error);
                    }
                  }}
                />
              </FormField>

              <FormField label="End Date" required error={fieldErrors[`${period.id}-endDate`]}>
                <Input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  error={!!fieldErrors[`${period.id}-endDate`]}
                  defaultValue={period.endDate instanceof Date 
                    ? period.endDate.toLocaleDateString('en-US')
                    : ''}
                  onBlur={(e) => {
                    const fieldId = `${period.id}-endDate`;
                    console.log('End date blur validation:', e.target.value);
                    
                    if (!e.target.value.trim()) {
                      setFieldError(fieldId, 'End date is required');
                      return;
                    }
                    
                    try {
                      const newDate = new Date(e.target.value);
                      const year = newDate.getFullYear();
                      
                      if (isNaN(newDate.getTime())) {
                        setFieldError(fieldId, 'Please enter a valid date (MM/DD/YYYY)');
                        return;
                      }
                      
                      if (year < 1970 || year > 2030) {
                        setFieldError(fieldId, 'Year must be between 1970 and 2030');
                        return;
                      }
                      
                      // Valid date - clear any errors and update
                      clearFieldError(fieldId);
                      updateServicePeriod(period.id, { endDate: newDate });
                      validateServicePeriod(period.id, { endDate: newDate });
                      
                    } catch (error) {
                      setFieldError(fieldId, 'Please enter a valid date (MM/DD/YYYY)');
                      console.error('Error processing end date:', error);
                    }
                  }}
                />
              </FormField>

              <FormField label="Service Type" required>
                <Select
                  value={period.serviceType}
                  onChange={(e) => updateServicePeriod(period.id, { 
                    serviceType: e.target.value as ServicePeriod['serviceType'] 
                  })}
                  options={serviceTypeOptions}
                />
              </FormField>

              {showAdvanced && (
                <>
                  <FormField label="Agency">
                    <Input
                      value={period.agency}
                      onChange={(e) => updateServicePeriod(period.id, { agency: e.target.value })}
                      placeholder="Department/Agency"
                    />
                  </FormField>

                  <FormField label="Position">
                    <Input
                      value={period.position}
                      onChange={(e) => updateServicePeriod(period.id, { position: e.target.value })}
                      placeholder="Job Title/Series"
                    />
                  </FormField>

                  {period.serviceType === 'FERS_PART_TIME' && (
                    <FormField label="Part-Time %" required>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={period.partTimePercentage || ''}
                        onChange={(e) => updateServicePeriod(period.id, { 
                          partTimePercentage: parseInt(e.target.value) || undefined 
                        })}
                        placeholder="50"
                      />
                    </FormField>
                  )}

                  {(period.serviceType === 'TEMPORARY' || period.serviceType === 'NON_DEDUCTION') && (
                    <div className="col-span-full">
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={period.depositPaid}
                          onChange={(e) => updateServicePeriod(period.id, { 
                            depositPaid: e.target.checked 
                          })}
                          className="mr-2"
                        />
                        Deposit paid for this service period
                      </label>
                      {!period.depositPaid && (
                        <p className="text-red-600 text-xs mt-1">
                          This service will not count toward retirement without deposit
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {showAdvanced && (
          <button
            onClick={addServicePeriod}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            <Plus className="h-5 w-5 mx-auto mb-2" />
            Add Another Service Period
          </button>
        )}
      </div>

      {/* Unused Sick Leave */}
      <FormField 
        label="Unused Sick Leave Balance" 
        tooltip="Unused sick leave is added to your years of service for pension computation (not eligibility). Enter your current balance in hours."
      >
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="0"
            max="8760"
            value={unusedSickLeave || ''}
            onChange={(e) => onSickLeaveChange(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <span className="text-sm text-gray-500">hours</span>
          <span className="text-sm text-gray-400">
            ({(unusedSickLeave / 2087).toFixed(2)} years)
          </span>
        </div>
      </FormField>

      {/* Calculation Notes */}
      {validationErrors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Service calculation complete</p>
              <p className="mt-1">
                Your creditable service includes {servicePeriods.length} employment period(s)
                {militaryService && militaryService.depositPaid && ', military service'}
                {unusedSickLeave > 0 && `, and ${unusedSickLeave} hours of unused sick leave`}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}