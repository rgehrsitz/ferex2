import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Info, Users, FileText, Shield, Heart } from 'lucide-react';
import { SocialSecurity } from '../types';
import { socialSecuritySchema, SocialSecurityFormData } from '../schemas';
import { ControlledInput, ControlledSelect } from './FormComponents';

interface SocialSecurityManagerRHFProps {
  socialSecurity: SocialSecurity;
  onSocialSecurityChange: (socialSecurity: SocialSecurity) => void;
}

export function SocialSecurityManagerRHF({ socialSecurity, onSocialSecurityChange }: SocialSecurityManagerRHFProps) {
  const {
    control,
    watch,
    formState: { errors },
    reset
  } = useForm<SocialSecurityFormData>({
    resolver: zodResolver(socialSecuritySchema),
    mode: 'onBlur',
    defaultValues: {
      estimatedBenefit: socialSecurity.estimatedBenefit,
      benefitAt62: socialSecurity.benefitAt62,
      benefitAt63: socialSecurity.benefitAt63,
      benefitAt64: socialSecurity.benefitAt64,
      benefitAt65: socialSecurity.benefitAt65,
      benefitAt66: socialSecurity.benefitAt66,
      benefitAt67: socialSecurity.benefitAt67,
      benefitAt68: socialSecurity.benefitAt68,
      benefitAt69: socialSecurity.benefitAt69,
      benefitAt70: socialSecurity.benefitAt70,
      disabilityBenefit: socialSecurity.disabilityBenefit,
      survivorSpouseBenefit: socialSecurity.survivorSpouseBenefit,
      survivorChildBenefit: socialSecurity.survivorChildBenefit,
      fullRetirementAge: socialSecurity.fullRetirementAge,
      claimingAge: socialSecurity.claimingAge,
      spouseBenefit: socialSecurity.spouseBenefit
    }
  });

  // Update parent component on blur - save data even if form has validation errors
  const updateParent = () => {
    const formData = watch();
    // Always save data, even if form is invalid (user might be in middle of filling form)
    const socialSecurityData: SocialSecurity = {
      estimatedBenefit: formData.estimatedBenefit || formData.benefitAt67 || 0,
      benefitAt62: formData.benefitAt62,
      benefitAt63: formData.benefitAt63,
      benefitAt64: formData.benefitAt64,
      benefitAt65: formData.benefitAt65,
      benefitAt66: formData.benefitAt66,
      benefitAt67: formData.benefitAt67,
      benefitAt68: formData.benefitAt68,
      benefitAt69: formData.benefitAt69,
      benefitAt70: formData.benefitAt70,
      disabilityBenefit: formData.disabilityBenefit,
      survivorSpouseBenefit: formData.survivorSpouseBenefit,
      survivorChildBenefit: formData.survivorChildBenefit,
      fullRetirementAge: formData.fullRetirementAge || 67,
      claimingAge: formData.claimingAge || 67,
      earningsHistory: formData.earningsHistory,
      spouseBenefit: formData.spouseBenefit
    };
    onSocialSecurityChange(socialSecurityData);
  };

  // Update form when external Social Security data changes
  useEffect(() => {
    reset({
      estimatedBenefit: socialSecurity.estimatedBenefit,
      benefitAt62: socialSecurity.benefitAt62,
      benefitAt63: socialSecurity.benefitAt63,
      benefitAt64: socialSecurity.benefitAt64,
      benefitAt65: socialSecurity.benefitAt65,
      benefitAt66: socialSecurity.benefitAt66,
      benefitAt67: socialSecurity.benefitAt67,
      benefitAt68: socialSecurity.benefitAt68,
      benefitAt69: socialSecurity.benefitAt69,
      benefitAt70: socialSecurity.benefitAt70,
      disabilityBenefit: socialSecurity.disabilityBenefit,
      survivorSpouseBenefit: socialSecurity.survivorSpouseBenefit,
      survivorChildBenefit: socialSecurity.survivorChildBenefit,
      fullRetirementAge: socialSecurity.fullRetirementAge,
      claimingAge: socialSecurity.claimingAge,
      spouseBenefit: socialSecurity.spouseBenefit
    });
  }, [socialSecurity, reset]);

  // Watch specific values for calculations
  const claimingAge = watch('claimingAge') || 67;
  const spouseBenefit = watch('spouseBenefit') || 0;

  // Get all benefit amounts
  const benefits = {
    62: watch('benefitAt62'),
    63: watch('benefitAt63'),
    64: watch('benefitAt64'),
    65: watch('benefitAt65'),
    66: watch('benefitAt66'),
    67: watch('benefitAt67'),
    68: watch('benefitAt68'),
    69: watch('benefitAt69'),
    70: watch('benefitAt70')
  };

  // Get current benefit based on claiming age
  const getCurrentBenefit = (): number => {
    const claimAge = claimingAge as keyof typeof benefits;
    return benefits[claimAge] || 0;
  };

  const currentBenefit = getCurrentBenefit();
  const fraReference = benefits[67] || 0;
  const benefitChange = fraReference > 0 ? ((currentBenefit - fraReference) / fraReference * 100) : 0;

  // Get filled benefit count for progress indication
  const filledBenefits = Object.values(benefits).filter(b => b && b > 0).length;

  return (
    <div className="space-y-8">
      {/* Social Security Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-lg p-2 mr-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Your Social Security Statement</h3>
            <p className="text-blue-700 text-sm">
              Enter information directly from your Social Security statement for accurate retirement projections.
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-8">
        {/* Retirement Benefits - Exact SS Statement Format */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Personalized Monthly Retirement Benefit Estimates
            <span className="ml-2 text-sm text-gray-500">({filledBenefits}/9 ages entered)</span>
          </h4>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>From your Social Security statement:</strong> Copy the "Monthly Benefit Amount" for each age from
              the "Personalized Monthly Retirement Benefit Estimates" table. You don't need to fill all ages -
              enter what's available on your statement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ControlledInput
              name="benefitAt62"
              control={control}
              label="Age 62"
              type="number"
              min={0}
              step={1}
              placeholder="2795"
              tooltip="Monthly benefit if you start at age 62 (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt63"
              control={control}
              label="Age 63"
              type="number"
              min={0}
              step={1}
              placeholder="2985"
              tooltip="Monthly benefit if you start at age 63 (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt64"
              control={control}
              label="Age 64"
              type="number"
              min={0}
              step={1}
              placeholder="3191"
              tooltip="Monthly benefit if you start at age 64 (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt65"
              control={control}
              label="Age 65"
              type="number"
              min={0}
              step={1}
              placeholder="3464"
              tooltip="Monthly benefit if you start at age 65 (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt66"
              control={control}
              label="Age 66"
              type="number"
              min={0}
              step={1}
              placeholder="3738"
              tooltip="Monthly benefit if you start at age 66 (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt67"
              control={control}
              label="Age 67 (Full Retirement)"
              type="number"
              min={0}
              step={1}
              placeholder="4012"
              tooltip="Monthly benefit at your full retirement age (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt68"
              control={control}
              label="Age 68"
              type="number"
              min={0}
              step={1}
              placeholder="4314"
              tooltip="Monthly benefit if you delay to age 68 (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt69"
              control={control}
              label="Age 69"
              type="number"
              min={0}
              step={1}
              placeholder="4643"
              tooltip="Monthly benefit if you delay to age 69 (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="benefitAt70"
              control={control}
              label="Age 70 (Maximum)"
              type="number"
              min={0}
              step={1}
              placeholder="5000"
              tooltip="Maximum monthly benefit if you delay to age 70 (from your SS statement)"
              onUpdate={updateParent}
            />
          </div>
        </div>

        {/* Your Claiming Strategy */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            Your Claiming Strategy
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ControlledSelect
              name="fullRetirementAge"
              control={control}
              label="Your Full Retirement Age"
              required
              tooltip="Your full retirement age from your Social Security statement"
              options={[
                { value: '66', label: '66 years' },
                { value: '67', label: '67 years' }
              ]}
              onUpdate={updateParent}
            />

            <ControlledSelect
              name="claimingAge"
              control={control}
              label="When Do You Plan to Claim?"
              required
              tooltip="When you plan to start claiming Social Security benefits"
              options={[
                { value: '62', label: '62 years (earliest)' },
                { value: '63', label: '63 years' },
                { value: '64', label: '64 years' },
                { value: '65', label: '65 years' },
                { value: '66', label: '66 years' },
                { value: '67', label: '67 years (full benefit)' },
                { value: '68', label: '68 years' },
                { value: '69', label: '69 years' },
                { value: '70', label: '70 years (maximum)' }
              ]}
              onUpdate={updateParent}
            />
          </div>

          {/* Current Benefit Display */}
          {currentBenefit > 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Your Projected Social Security Income</h5>
                  <p className="text-2xl font-bold text-green-600">${currentBenefit.toLocaleString()}/month</p>
                  <p className="text-sm text-gray-600">
                    Claiming at age {claimingAge}
                    {benefitChange !== 0 && (
                      <span className={`ml-2 ${benefitChange > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                        ({benefitChange > 0 ? '+' : ''}{benefitChange.toFixed(1)}% vs full retirement age)
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Annual Income</p>
                  <p className="text-lg font-semibold text-gray-900">${(currentBenefit * 12).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disability Benefits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-orange-600" />
            Disability Benefits (Optional)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ControlledInput
              name="disabilityBenefit"
              control={control}
              label="Monthly Disability Benefit"
              type="number"
              min={0}
              step={1}
              placeholder="3964"
              tooltip="Your monthly disability benefit from your SS statement (if shown)"
              onUpdate={updateParent}
            />

            <div className="flex items-center">
              <Info className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-sm text-gray-600">
                This is the monthly payment you would receive if you became disabled right now.
              </p>
            </div>
          </div>
        </div>

        {/* Survivors Benefits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Survivors Benefits (Optional)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ControlledInput
              name="survivorSpouseBenefit"
              control={control}
              label="Spouse Survivor Benefit"
              type="number"
              min={0}
              step={1}
              placeholder="3975"
              tooltip="Monthly benefit your spouse would receive as a survivor (from your SS statement)"
              onUpdate={updateParent}
            />

            <ControlledInput
              name="survivorChildBenefit"
              control={control}
              label="Minor Child Survivor Benefit"
              type="number"
              min={0}
              step={1}
              placeholder="2981"
              tooltip="Monthly benefit each minor child would receive (from your SS statement)"
              onUpdate={updateParent}
            />
          </div>
        </div>

        {/* Spouse Benefits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Spouse Benefits (Optional)
          </h4>

          <div className="mb-4">
            <ControlledInput
              name="spouseBenefit"
              control={control}
              label="Spouse's Monthly Social Security Benefit"
              type="number"
              min={0}
              step={10}
              placeholder="1500"
              tooltip="Your spouse's estimated monthly Social Security benefit (if applicable)"
              onUpdate={updateParent}
            />
          </div>

          {spouseBenefit > 0 && currentBenefit > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start">
              <Info className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-purple-800 text-sm">
                  <strong>Combined Monthly Benefits:</strong> ${(currentBenefit + spouseBenefit).toLocaleString()}
                  <br />
                  <strong>Annual Combined Benefits:</strong> ${((currentBenefit + spouseBenefit) * 12).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* How to Get Your Statement */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-gray-600" />
            How to Get Your Social Security Statement
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Online Access</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visit <strong>ssa.gov/myaccount</strong></li>
                <li>• Create a my Social Security account</li>
                <li>• View and download your statement online</li>
                <li>• Updated annually with your latest earnings</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">What to Look For</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Personalized Monthly Retirement Benefit Estimates" table</li>
                <li>• Monthly amounts for ages 62, 67, and 70 (minimum)</li>
                <li>• Disability benefit amount (if shown)</li>
                <li>• Survivors benefits for family members</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Example from Statement:</strong> "Age 62: $2,795, Age 67: $4,012, Age 70: $5,000" -
              These are the exact amounts to enter above for the most accurate retirement projections.
            </p>
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