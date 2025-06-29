import { RetirementScenario } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ScenarioValidator {
  static validatePersonalInfo(scenario: Partial<RetirementScenario>): ValidationError[] {
    const errors: ValidationError[] = [];
    const info = scenario.personalInfo;

    if (!info) {
      errors.push({ field: 'personalInfo', message: 'Personal information is required' });
      return errors;
    }

    if (!info.firstName?.trim()) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!info.lastName?.trim()) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (!info.birthDate) {
      errors.push({ field: 'birthDate', message: 'Birth date is required' });
    } else {
      const birthYear = new Date(info.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18 || currentYear - birthYear > 100) {
        errors.push({ field: 'birthDate', message: 'Please enter a valid birth date' });
      }
    }

    if (!info.hireDate) {
      errors.push({ field: 'hireDate', message: 'Hire date is required' });
    } else if (info.birthDate) {
      const hireYear = new Date(info.hireDate).getFullYear();
      const birthYear = new Date(info.birthDate).getFullYear();
      if (hireYear - birthYear < 16) {
        errors.push({ field: 'hireDate', message: 'Hire date must be after 16th birthday' });
      }
    }

    if (!info.plannedRetirementDate) {
      errors.push({ field: 'plannedRetirementDate', message: 'Planned retirement date is required' });
    } else if (info.hireDate) {
      const retirementYear = new Date(info.plannedRetirementDate).getFullYear();
      const hireYear = new Date(info.hireDate).getFullYear();
      if (retirementYear - hireYear < 5) {
        errors.push({ 
          field: 'plannedRetirementDate', 
          message: 'Must have at least 5 years of service for retirement' 
        });
      }
    }

    return errors;
  }

  static validateFederalService(scenario: Partial<RetirementScenario>): ValidationError[] {
    const errors: ValidationError[] = [];
    const service = scenario.federalService;

    if (!service) {
      errors.push({ field: 'federalService', message: 'FERS service information is required' });
      return errors;
    }

    if (!service.highThreeSalary || service.highThreeSalary <= 0) {
      errors.push({ field: 'highThreeSalary', message: 'High-3 salary must be greater than 0' });
    } else if (service.highThreeSalary < 20000 || service.highThreeSalary > 500000) {
      errors.push({ 
        field: 'highThreeSalary', 
        message: 'High-3 salary seems unrealistic for federal service. Please verify.' 
      });
    }

    const totalYears = service.creditableService?.totalYears || 0;
    if (totalYears <= 0) {
      errors.push({ field: 'totalYears', message: 'Total FERS creditable service must be greater than 0' });
    } else if (totalYears > 45) { // FERS started in 1987, so max ~38 years by 2025
      errors.push({ field: 'totalYears', message: 'FERS service years seem too high (FERS started in 1987)' });
    }

    const militaryYears = service.creditableService?.militaryYears || 0;
    if (militaryYears > totalYears) {
      errors.push({ 
        field: 'militaryYears', 
        message: 'Military years cannot exceed total creditable service' 
      });
    }

    const sickLeave = service.unusedSickLeave || 0;
    if (sickLeave < 0 || sickLeave > 8760) { // Max ~1 year
      errors.push({ field: 'unusedSickLeave', message: 'Please enter a valid sick leave balance (0-8760 hours)' });
    }

    return errors;
  }

  static validateSocialSecurity(scenario: Partial<RetirementScenario>): ValidationError[] {
    const errors: ValidationError[] = [];
    const ss = scenario.socialSecurity;

    if (!ss) {
      errors.push({ field: 'socialSecurity', message: 'Social Security information is required' });
      return errors;
    }

    if (!ss.estimatedBenefit || ss.estimatedBenefit <= 0) {
      errors.push({ field: 'estimatedBenefit', message: 'Estimated Social Security benefit is required' });
    } else if (ss.estimatedBenefit > 5000) {
      errors.push({ 
        field: 'estimatedBenefit', 
        message: 'Monthly benefit seems high. Please verify from SSA estimate.' 
      });
    }

    if (!ss.fullRetirementAge || ss.fullRetirementAge < 65 || ss.fullRetirementAge > 67) {
      errors.push({ 
        field: 'fullRetirementAge', 
        message: 'Full retirement age must be between 65 and 67' 
      });
    }

    if (!ss.claimingAge || ss.claimingAge < 62 || ss.claimingAge > 70) {
      errors.push({ field: 'claimingAge', message: 'Claiming age must be between 62 and 70' });
    }

    return errors;
  }

  static validateTSP(scenario: Partial<RetirementScenario>): ValidationError[] {
    const errors: ValidationError[] = [];
    const tsp = scenario.tsp;

    if (!tsp) {
      errors.push({ field: 'tsp', message: 'TSP information is required' });
      return errors;
    }

    if (tsp.currentBalance < 0) {
      errors.push({ field: 'currentBalance', message: 'TSP balance cannot be negative' });
    }

    if (tsp.traditionalBalance < 0 || tsp.rothBalance < 0) {
      errors.push({ field: 'tspBalances', message: 'TSP balances cannot be negative' });
    }

    const totalBalance = (tsp.traditionalBalance || 0) + (tsp.rothBalance || 0);
    if (Math.abs(totalBalance - (tsp.currentBalance || 0)) > 1000) {
      errors.push({ 
        field: 'tspBalances', 
        message: 'Traditional + Roth balances should equal total balance' 
      });
    }

    if (tsp.growthRate && (tsp.growthRate < -0.1 || tsp.growthRate > 0.2)) {
      errors.push({ 
        field: 'growthRate', 
        message: 'Growth rate should be between -10% and 20%' 
      });
    }

    const allocation = tsp.fundsAllocation;
    if (allocation) {
      const total = (allocation.gFund || 0) + (allocation.fFund || 0) + 
                   (allocation.cFund || 0) + (allocation.sFund || 0) + 
                   (allocation.iFund || 0);
      
      if (Math.abs(total - 100) > 1) {
        errors.push({ 
          field: 'fundsAllocation', 
          message: 'Fund allocations must total 100%' 
        });
      }
    }

    return errors;
  }

  static validateExpenses(scenario: Partial<RetirementScenario>): ValidationError[] {
    const errors: ValidationError[] = [];
    const expenses = scenario.expenses;

    if (!expenses) {
      errors.push({ field: 'expenses', message: 'Expense information is required' });
      return errors;
    }

    if (!expenses.monthlyAmount || expenses.monthlyAmount <= 0) {
      errors.push({ field: 'monthlyAmount', message: 'Monthly expenses must be greater than 0' });
    } else if (expenses.monthlyAmount > 50000) {
      errors.push({ 
        field: 'monthlyAmount', 
        message: 'Monthly expenses seem very high. Please verify.' 
      });
    }

    if (expenses.inflationRate < 0 || expenses.inflationRate > 0.1) {
      errors.push({ 
        field: 'inflationRate', 
        message: 'Inflation rate should be between 0% and 10%' 
      });
    }

    return errors;
  }

  static validateTaxes(scenario: Partial<RetirementScenario>): ValidationError[] {
    const errors: ValidationError[] = [];
    const taxes = scenario.taxes;

    if (!taxes) {
      errors.push({ field: 'taxes', message: 'Tax information is required' });
      return errors;
    }

    if (!taxes.filingStatus) {
      errors.push({ field: 'filingStatus', message: 'Filing status is required' });
    }

    if (!taxes.stateOfResidence?.trim()) {
      errors.push({ field: 'stateOfResidence', message: 'State of residence is required' });
    }

    if (taxes.pensionTaxBasis < 0) {
      errors.push({ field: 'pensionTaxBasis', message: 'Pension tax basis cannot be negative' });
    }

    return errors;
  }

  static validateComplete(scenario: Partial<RetirementScenario>): ValidationResult {
    const errors: ValidationError[] = [
      ...this.validatePersonalInfo(scenario),
      ...this.validateFederalService(scenario),
      ...this.validateSocialSecurity(scenario),
      ...this.validateTSP(scenario),
      ...this.validateExpenses(scenario),
      ...this.validateTaxes(scenario),
    ];

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateSection(scenario: Partial<RetirementScenario>, section: string): ValidationError[] {
    switch (section) {
      case 'personal':
        return this.validatePersonalInfo(scenario);
      case 'federal':
        return this.validateFederalService(scenario);
      case 'social':
        return this.validateSocialSecurity(scenario);
      case 'tsp':
        return this.validateTSP(scenario);
      case 'expenses':
        return this.validateExpenses(scenario);
      case 'taxes':
        return this.validateTaxes(scenario);
      default:
        return [];
    }
  }
}