export interface RetirementScenario {
  id: string;
  name: string;
  personalInfo: PersonalInfo;
  retirementSystem: RetirementSystem;
  federalService: FederalService;
  socialSecurity: SocialSecurity;
  tsp: TSP;
  otherIncome: OtherIncome[];
  expenses: Expenses;
  taxes: TaxInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  birthDate: Date;
  hireDate: Date;
  plannedRetirementDate: Date;
  currentAge: number;
  yearsOfService: number;
}

export interface RetirementSystem {
  type: 'FERS';
  // Note: Future enhancement could support FERS transferees
}

export interface FederalService {
  highThreeSalary: number;
  creditableService: CreditableService;
  survivorBenefit: SurvivorBenefit;
  partTimeService?: PartTimeService[];
  unusedSickLeave: number; // in hours
}

export interface CreditableService {
  servicePeriods: ServicePeriod[];
  militaryService?: MilitaryService;
  totalCreditableYears: number; // Calculated field
  totalCreditableMonths: number; // More precise calculation
}

export interface ServicePeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  serviceType: 'FERS_FULL_TIME' | 'FERS_PART_TIME' | 'TEMPORARY' | 'SEASONAL' | 'NON_DEDUCTION';
  agency: string;
  position: string;
  partTimePercentage?: number; // For part-time service (e.g., 50, 75, etc.)
  depositRequired: boolean;
  depositPaid: boolean;
  notes?: string;
}

export interface MilitaryService {
  branches: MilitaryBranch[];
  totalMonths: number;
  depositRequired: boolean;
  depositPaid: boolean;
  receivesMilitaryRetiredPay: boolean;
}

export interface MilitaryBranch {
  id: string;
  branch: 'ARMY' | 'NAVY' | 'AIR_FORCE' | 'MARINES' | 'COAST_GUARD' | 'SPACE_FORCE';
  startDate: Date;
  endDate: Date;
  serviceType: 'ACTIVE_DUTY' | 'RESERVES' | 'NATIONAL_GUARD';
  honorableDischarge: boolean;
}

export interface PartTimeService {
  startDate: Date;
  endDate: Date;
  hoursPerYear: number;
  fullTimeEquivalent: number;
}

export interface SurvivorBenefit {
  election: 'NONE' | 'PARTIAL' | 'FULL';
  beneficiaryAge?: number;
  customAmount?: number; // For partial elections
}

export interface SocialSecurity {
  estimatedBenefit: number; // Monthly benefit at FRA
  fullRetirementAge: number;
  claimingAge: number;
  earningsHistory?: number[]; // Annual earnings for last 35 years
  spouseBenefit?: number;
}

export interface TSP {
  currentBalance: number;
  traditionalBalance: number;
  rothBalance: number;
  monthlyContribution: number;
  agencyMatch: number;
  growthRate: number;
  withdrawalStrategy: TSPWithdrawalStrategy;
  fundsAllocation: TSPFundsAllocation;
}

export interface TSPWithdrawalStrategy {
  type: 'LIFE_EXPECTANCY' | 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE' | 'MIXED';
  fixedAmount?: number;
  fixedPercentage?: number;
  mixedLifeExpectancyAmount?: number;
  mixedFixedAmount?: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  startAge: number;
}

export interface TSPFundsAllocation {
  gFund: number; // Percentages (should sum to 100)
  fFund: number;
  cFund: number;
  sFund: number;
  iFund: number;
  lifecycleFund?: string; // e.g., "L2050"
}

export interface OtherIncome {
  id: string;
  name: string;
  monthlyAmount: number;
  startAge: number;
  endAge?: number;
  colaAdjustment: boolean;
  taxable: boolean;
}

export interface Expenses {
  monthlyAmount: number;
  inflationRate: number;
  categories?: ExpenseCategory[];
}

export interface ExpenseCategory {
  name: string;
  monthlyAmount: number;
  inflationRate: number;
}

export interface TaxInfo {
  filingStatus: 'SINGLE' | 'MARRIED_FILING_JOINTLY' | 'MARRIED_FILING_SEPARATELY' | 'HEAD_OF_HOUSEHOLD';
  stateOfResidence: string;
  federalTaxRate?: number; // Estimated effective rate
  stateTaxRate?: number; // Estimated effective rate
  pensionTaxBasis: number; // After-tax contributions for Simplified Method
}

export interface CalculationResults {
  annualProjections: AnnualProjection[];
  summary: RetirementSummary;
  monteCarloResults?: MonteCarloResults;
}

export interface AnnualProjection {
  year: number;
  age: number;
  grossIncome: IncomeBreakdown;
  taxes: TaxBreakdown;
  netIncome: number;
  expenses: number;
  surplus: number;
  tspBalance: number;
  cumulativeNetIncome: number;
}

export interface IncomeBreakdown {
  pension: number;
  socialSecurity: number;
  tspWithdrawal: number;
  srs: number; // FERS Annuity Supplement
  otherIncome: number;
  total: number;
}

export interface TaxBreakdown {
  federalTax: number;
  stateTax: number;
  effectiveRate: number;
  total: number;
}

export interface RetirementSummary {
  averageAnnualNetIncome: number;
  totalLifetimeIncome: number;
  yearsOfRetirement: number;
  tspDepletionAge?: number;
  successProbability?: number;
}

export interface MonteCarloResults {
  successRate: number;
  medianPortfolioValue: number[];
  percentileBands: PercentileBand[];
  shortfallAnalysis: ShortfallAnalysis;
}

export interface PercentileBand {
  percentile: number;
  values: number[];
}

export interface ShortfallAnalysis {
  probabilityOfShortfall: number;
  averageShortfallMagnitude: number;
  averageShortfallDuration: number;
}