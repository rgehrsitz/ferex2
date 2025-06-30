import { z } from 'zod';

// Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  birthDate: z.date({
    required_error: 'Birth date is required',
    invalid_type_error: 'Please enter a valid birth date'
  }),
  hireDate: z.date({
    required_error: 'Hire date is required',
    invalid_type_error: 'Please enter a valid hire date'
  }),
  plannedRetirementDate: z.date({
    required_error: 'Planned retirement date is required',
    invalid_type_error: 'Please enter a valid retirement date'
  })
}).refine((data) => {
  // Validate hire date is after birth date
  if (data.birthDate && data.hireDate) {
    const ageAtHire = data.hireDate.getFullYear() - data.birthDate.getFullYear();
    return ageAtHire >= 16;
  }
  return true;
}, {
  message: 'Hire date must be after 16th birthday',
  path: ['hireDate']
}).refine((data) => {
  // Validate retirement date is after hire date
  if (data.hireDate && data.plannedRetirementDate) {
    const yearsOfService = data.plannedRetirementDate.getFullYear() - data.hireDate.getFullYear();
    return yearsOfService >= 5;
  }
  return true;
}, {
  message: 'Must have at least 5 years of service for retirement',
  path: ['plannedRetirementDate']
});

// TSP Schema
export const tspFundsAllocationSchema = z.object({
  gFund: z.number().min(0, 'G Fund percentage must be 0 or greater').max(100, 'G Fund percentage cannot exceed 100'),
  fFund: z.number().min(0, 'F Fund percentage must be 0 or greater').max(100, 'F Fund percentage cannot exceed 100'),
  cFund: z.number().min(0, 'C Fund percentage must be 0 or greater').max(100, 'C Fund percentage cannot exceed 100'),
  sFund: z.number().min(0, 'S Fund percentage must be 0 or greater').max(100, 'S Fund percentage cannot exceed 100'),
  iFund: z.number().min(0, 'I Fund percentage must be 0 or greater').max(100, 'I Fund percentage cannot exceed 100'),
  lifecycleFund: z.string().optional()
}).refine((data) => {
  const total = data.gFund + data.fFund + data.cFund + data.sFund + data.iFund;
  return Math.abs(total - 100) <= 1; // Allow 1% tolerance for rounding
}, {
  message: 'Fund allocations must total 100%',
  path: ['gFund'] // Will show error on first field, but message covers all
});

export const tspWithdrawalStrategySchema = z.object({
  type: z.enum(['LIFE_EXPECTANCY', 'FIXED_AMOUNT', 'FIXED_PERCENTAGE', 'MIXED'], {
    required_error: 'Withdrawal type is required'
  }),
  fixedAmount: z.number().min(100, 'Fixed amount must be at least $100').optional(),
  fixedPercentage: z.number().min(0.1, 'Fixed percentage must be at least 0.1%').max(20, 'Fixed percentage cannot exceed 20%').optional(),
  mixedLifeExpectancyAmount: z.number().min(100, 'Life expectancy amount must be at least $100').optional(),
  mixedFixedAmount: z.number().min(100, 'Fixed amount must be at least $100').optional(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY'], {
    required_error: 'Frequency is required'
  }),
  startAge: z.number()
    .min(50, 'Start age must be at least 50')
    .max(75, 'Start age cannot exceed 75')
}).refine((data) => {
  // Validate required fields based on withdrawal type
  if (data.type === 'FIXED_AMOUNT') {
    return data.fixedAmount !== undefined && data.fixedAmount > 0;
  }
  if (data.type === 'FIXED_PERCENTAGE') {
    return data.fixedPercentage !== undefined && data.fixedPercentage > 0;
  }
  if (data.type === 'MIXED') {
    return (data.mixedLifeExpectancyAmount !== undefined && data.mixedLifeExpectancyAmount > 0) ||
           (data.mixedFixedAmount !== undefined && data.mixedFixedAmount > 0);
  }
  return true;
}, {
  message: 'Required fields for selected withdrawal type are missing',
  path: ['fixedAmount']
});

export const tspSchema = z.object({
  currentBalance: z.number().min(0, 'Current balance must be 0 or greater'),
  traditionalBalance: z.number().min(0, 'Traditional balance must be 0 or greater'),
  rothBalance: z.number().min(0, 'Roth balance must be 0 or greater'),
  monthlyContribution: z.number().min(0, 'Monthly contribution must be 0 or greater').max(10000, 'Monthly contribution seems too high'),
  agencyMatch: z.number().min(0, 'Agency match must be 0 or greater').max(5000, 'Agency match seems too high'),
  growthRate: z.number()
    .min(0, 'Growth rate must be 0 or greater')
    .max(15, 'Growth rate cannot exceed 15%'),
  withdrawalStrategy: tspWithdrawalStrategySchema,
  fundsAllocation: tspFundsAllocationSchema,
  selectedLFund: z.string().optional()
});

// Service Period Schema
export const servicePeriodSchema = z.object({
  id: z.string(),
  startDate: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Please enter a valid start date'
  }),
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'Please enter a valid end date'
  }),
  serviceType: z.enum(['FERS_FULL_TIME', 'FERS_PART_TIME', 'TEMPORARY', 'SEASONAL', 'NON_DEDUCTION'], {
    required_error: 'Service type is required'
  }),
  agency: z.string().min(1, 'Agency is required'),
  position: z.string().min(1, 'Position is required'),
  partTimePercentage: z.number().min(1).max(100).optional(),
  depositRequired: z.boolean(),
  depositPaid: z.boolean(),
  notes: z.string().optional()
}).refine((data) => {
  // End date must be after start date
  return data.endDate > data.startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
}).refine((data) => {
  // If part-time, percentage is required
  if (data.serviceType === 'FERS_PART_TIME') {
    return data.partTimePercentage !== undefined && data.partTimePercentage > 0;
  }
  return true;
}, {
  message: 'Part-time percentage is required for part-time service',
  path: ['partTimePercentage']
});

export const federalServiceSchema = z.object({
  highThreeSalary: z.number()
    .min(20000, 'High-3 salary seems too low for federal service')
    .max(500000, 'High-3 salary seems unrealistic'),
  servicePeriods: z.array(servicePeriodSchema).min(1, 'At least one service period is required'),
  unusedSickLeave: z.number()
    .min(0, 'Sick leave cannot be negative')
    .max(8760, 'Sick leave cannot exceed 8760 hours (1 year)')
});

// Social Security Schema
export const socialSecuritySchema = z.object({
  estimatedBenefit: z.number()
    .min(100, 'Estimated benefit seems too low')
    .max(5000, 'Estimated benefit seems too high - please verify'),
  fullRetirementAge: z.number()
    .min(65, 'Full retirement age must be between 65 and 67')
    .max(67, 'Full retirement age must be between 65 and 67'),
  claimingAge: z.number()
    .min(62, 'Claiming age must be between 62 and 70')
    .max(70, 'Claiming age must be between 62 and 70'),
  earningsHistory: z.array(z.number()).optional(),
  spouseBenefit: z.number().min(0).optional()
});

// Other Income Schema
export const otherIncomeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Income name is required'),
  monthlyAmount: z.number().min(0, 'Monthly amount must be 0 or greater'),
  startAge: z.number().min(50, 'Start age must be at least 50'),
  endAge: z.number().min(50, 'End age must be at least 50').optional()
}).refine((data) => {
  if (data.endAge) {
    return data.endAge > data.startAge;
  }
  return true;
}, {
  message: 'End age must be after start age',
  path: ['endAge']
});

// Expenses Schema
export const expensesSchema = z.object({
  monthlyAmount: z.number()
    .min(500, 'Monthly expenses seem too low')
    .max(50000, 'Monthly expenses seem very high'),
  inflationRate: z.number()
    .min(0, 'Inflation rate must be 0 or greater')
    .max(0.1, 'Inflation rate seems too high (max 10%)')
});

// Taxes Schema
export const taxesSchema = z.object({
  filingStatus: z.enum(['SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY', 'HEAD_OF_HOUSEHOLD'], {
    required_error: 'Filing status is required'
  }),
  stateOfResidence: z.string().min(1, 'State of residence is required'),
  pensionTaxBasis: z.number().min(0, 'Pension tax basis cannot be negative')
});

// Complete Retirement Scenario Schema
export const retirementScenarioSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Scenario name is required'),
  personalInfo: personalInfoSchema,
  federalService: federalServiceSchema,
  socialSecurity: socialSecuritySchema,
  tsp: tspSchema,
  otherIncome: z.array(otherIncomeSchema),
  expenses: expensesSchema,
  taxes: taxesSchema
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type TSPFormData = z.infer<typeof tspSchema>;
export type ServicePeriodFormData = z.infer<typeof servicePeriodSchema>;
export type FederalServiceFormData = z.infer<typeof federalServiceSchema>;
export type SocialSecurityFormData = z.infer<typeof socialSecuritySchema>;
export type OtherIncomeFormData = z.infer<typeof otherIncomeSchema>;
export type ExpensesFormData = z.infer<typeof expensesSchema>;
export type TaxesFormData = z.infer<typeof taxesSchema>;
export type RetirementScenarioFormData = z.infer<typeof retirementScenarioSchema>;