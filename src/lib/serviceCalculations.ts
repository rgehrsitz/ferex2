import { ServicePeriod, MilitaryService, CreditableService } from '../types';
import { differenceInDays, differenceInMonths, parseISO, isAfter } from 'date-fns';

export class ServiceCalculator {
  /**
   * Calculate total creditable service for FERS retirement
   */
  static calculateCreditableService(
    servicePeriods: ServicePeriod[],
    militaryService?: MilitaryService,
    unusedSickLeaveHours: number = 0
  ): CreditableService {
    let totalMonths = 0;
    
    // Calculate civilian service
    for (const period of servicePeriods) {
      const months = this.calculatePeriodCreditableMonths(period);
      totalMonths += months;
    }
    
    // Add military service if applicable
    if (militaryService && militaryService.depositPaid && !militaryService.receivesMilitaryRetiredPay) {
      totalMonths += militaryService.totalMonths;
    }
    
    // Add unused sick leave (2087 hours = 1 year for most federal employees)
    const sickLeaveMonths = (unusedSickLeaveHours / 2087) * 12;
    totalMonths += sickLeaveMonths;
    
    return {
      servicePeriods,
      militaryService,
      totalCreditableMonths: Math.round(totalMonths * 100) / 100, // Round to 2 decimal places
      totalCreditableYears: Math.round((totalMonths / 12) * 100) / 100
    };
  }
  
  /**
   * Calculate creditable months for a specific service period
   */
  private static calculatePeriodCreditableMonths(period: ServicePeriod): number {
    const startDate = typeof period.startDate === 'string' ? new Date(period.startDate) : period.startDate;
    const endDate = typeof period.endDate === 'string' ? new Date(period.endDate) : period.endDate;
    
    if (isAfter(startDate, endDate)) {
      throw new Error(`Invalid service period: start date ${startDate} is after end date ${endDate}`);
    }
    
    // Calculate total months more accurately
    const totalMonths = differenceInMonths(endDate, startDate);
    
    // Add fractional months for remaining days
    const lastMonthStart = new Date(startDate);
    lastMonthStart.setMonth(lastMonthStart.getMonth() + totalMonths);
    const remainingDays = differenceInDays(endDate, lastMonthStart);
    const fractionalMonths = remainingDays / 30.44; // Average days per month
    
    let creditableMonths = totalMonths + fractionalMonths;
    
    // Apply service type rules
    switch (period.serviceType) {
      case 'FERS_FULL_TIME':
        // Full credit
        break;
        
      case 'FERS_PART_TIME':
        // Full credit for eligibility, but we'll track this for computation proration
        // For now, give full credit (proration happens in pension calculation)
        break;
        
      case 'TEMPORARY':
      case 'SEASONAL':
      case 'NON_DEDUCTION':
        if (!period.depositPaid) {
          creditableMonths = 0; // No credit without deposit
        }
        break;
        
      default:
        creditableMonths = 0;
    }
    
    return Math.max(0, creditableMonths);
  }
  
  /**
   * Calculate part-time proration factor for pension computation
   */
  static calculatePartTimeProrationFactor(servicePeriods: ServicePeriod[]): number {
    let totalFullTimeEquivalentMonths = 0;
    let totalActualMonths = 0;
    
    for (const period of servicePeriods) {
      const periodMonths = this.calculatePeriodCreditableMonths(period);
      totalActualMonths += periodMonths;
      
      if (period.serviceType === 'FERS_PART_TIME' && period.partTimePercentage) {
        totalFullTimeEquivalentMonths += periodMonths * (period.partTimePercentage / 100);
      } else {
        totalFullTimeEquivalentMonths += periodMonths;
      }
    }
    
    return totalActualMonths > 0 ? totalFullTimeEquivalentMonths / totalActualMonths : 1.0;
  }
  
  /**
   * Validate service periods for overlaps and other issues
   */
  static validateServicePeriods(periods: ServicePeriod[]): string[] {
    const errors: string[] = [];
    
    // Sort periods by start date
    const sortedPeriods = [...periods].sort((a, b) => {
      const dateA = typeof a.startDate === 'string' ? parseISO(a.startDate) : a.startDate;
      const dateB = typeof b.startDate === 'string' ? parseISO(b.startDate) : b.startDate;
      return dateA.getTime() - dateB.getTime();
    });
    
    // Check for overlaps
    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const current = sortedPeriods[i];
      const next = sortedPeriods[i + 1];
      
      const currentEnd = typeof current.endDate === 'string' ? parseISO(current.endDate) : current.endDate;
      const nextStart = typeof next.startDate === 'string' ? parseISO(next.startDate) : next.startDate;
      
      if (isAfter(currentEnd, nextStart)) {
        errors.push(`Service periods overlap: ${current.agency} (${current.startDate} - ${current.endDate}) and ${next.agency} (${next.startDate} - ${next.endDate})`);
      }
    }
    
    // Check each period for validity
    periods.forEach((period, index) => {
      const startDate = typeof period.startDate === 'string' ? parseISO(period.startDate) : period.startDate;
      const endDate = typeof period.endDate === 'string' ? parseISO(period.endDate) : period.endDate;
      
      if (isAfter(startDate, endDate)) {
        errors.push(`Period ${index + 1}: Start date cannot be after end date`);
      }
      
      if (isAfter(startDate, new Date())) {
        errors.push(`Period ${index + 1}: Start date cannot be in the future`);
      }
      
      if (period.serviceType === 'FERS_PART_TIME' && (!period.partTimePercentage || period.partTimePercentage <= 0 || period.partTimePercentage > 100)) {
        errors.push(`Period ${index + 1}: Part-time percentage must be between 1-100`);
      }
      
      if ((period.serviceType === 'TEMPORARY' || period.serviceType === 'NON_DEDUCTION') && period.depositRequired && !period.depositPaid) {
        errors.push(`Period ${index + 1}: Deposit required but not paid - this service will not count`);
      }
    });
    
    return errors;
  }
  
  /**
   * Generate a simple service period from hire date and retirement date
   * (for users who don't want to enter detailed periods)
   */
  static generateSimpleServicePeriod(
    hireDate: Date,
    retirementDate: Date,
    agency: string = 'Federal Agency'
  ): ServicePeriod {
    return {
      id: 'simple-period-1',
      startDate: hireDate,
      endDate: retirementDate,
      serviceType: 'FERS_FULL_TIME',
      agency,
      position: 'Federal Employee',
      depositRequired: false,
      depositPaid: true,
      notes: 'Automatically generated from hire and retirement dates'
    };
  }
  
  /**
   * Check if someone is eligible for immediate retirement
   */
  static checkRetirementEligibility(
    age: number,
    creditableService: CreditableService
  ): {
    eligible: boolean;
    eligibilityType?: 'MRA_30' | 'MRA_10' | 'AGE_60_20' | 'AGE_62_5';
    mra: number;
    message: string;
  } {
    const mra = this.calculateMinimumRetirementAge(new Date().getFullYear() - age);
    const years = creditableService.totalCreditableYears;
    
    // Check various eligibility scenarios
    if (age >= mra && years >= 30) {
      return {
        eligible: true,
        eligibilityType: 'MRA_30',
        mra,
        message: `Eligible for immediate, unreduced retirement at MRA (${mra}) with 30+ years`
      };
    }
    
    if (age >= 60 && years >= 20) {
      return {
        eligible: true,
        eligibilityType: 'AGE_60_20',
        mra,
        message: 'Eligible for immediate, unreduced retirement at age 60 with 20+ years'
      };
    }
    
    if (age >= 62 && years >= 5) {
      return {
        eligible: true,
        eligibilityType: 'AGE_62_5',
        mra,
        message: 'Eligible for immediate, unreduced retirement at age 62 with 5+ years'
      };
    }
    
    if (age >= mra && years >= 10 && years < 30) {
      return {
        eligible: true,
        eligibilityType: 'MRA_10',
        mra,
        message: `Eligible for early retirement at MRA (${mra}) with 10+ years (5% annual reduction applies if taken before age 62)`
      };
    }
    
    return {
      eligible: false,
      mra,
      message: this.getEligibilityGuidance(age, years, mra)
    };
  }
  
  private static calculateMinimumRetirementAge(birthYear: number): number {
    if (birthYear < 1948) return 55;
    if (birthYear < 1953) return 55 + ((birthYear - 1947) * 2 / 12); // Gradual increase
    if (birthYear < 1965) return 56;
    if (birthYear < 1970) return 56 + ((birthYear - 1964) * 2 / 12); // Gradual increase
    return 57;
  }
  
  private static getEligibilityGuidance(age: number, years: number, mra: number): string {
    if (years < 5) {
      return `Need at least 5 years of FERS service. Currently have ${years.toFixed(1)} years.`;
    }
    
    if (age < mra) {
      const yearsToMRA = mra - age;
      if (years >= 30) {
        return `Can retire without reduction in ${yearsToMRA.toFixed(1)} years at MRA ${mra}`;
      } else if (years >= 10) {
        return `Can retire with reduction in ${yearsToMRA.toFixed(1)} years at MRA ${mra}, or continue to age 60/62 for unreduced benefits`;
      } else {
        const yearsNeeded = 10 - years;
        return `Need ${yearsNeeded.toFixed(1)} more years of service to be eligible for early retirement at MRA ${mra}`;
      }
    }
    
    const yearsNeeded = Math.min(10 - years, 30 - years);
    return `Need ${yearsNeeded.toFixed(1)} more years of service for retirement eligibility`;
  }
}