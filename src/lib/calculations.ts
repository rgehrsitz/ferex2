// import { invoke } from '@tauri-apps/api/tauri';
import { RetirementScenario, CalculationResults, AnnualProjection } from '../types';

export class RetirementCalculator {
  static async calculateFERSPension(
    serviceYears: number,
    highThree: number,
    ageAtRetirement: number
  ): Promise<number> {
    // FERS pension calculation
    // 1.0% multiplier for most cases, 1.1% for age 62+ with 20+ years
    const multiplier = ageAtRetirement >= 62 && serviceYears >= 20 ? 0.011 : 0.01;
    return highThree * serviceYears * multiplier;
  }

  static calculateFERSAnnuitySupplament(
    fersServiceYears: number,
    estimatedSSBenefitAtAge62: number
  ): number {
    return (estimatedSSBenefitAtAge62 / 40) * Math.ceil(fersServiceYears);
  }

  static calculateSocialSecurityBenefit(
    benefitAtFRA: number,
    claimingAge: number,
    fullRetirementAge: number
  ): number {
    if (claimingAge === fullRetirementAge) {
      return benefitAtFRA;
    }
    
    const monthsDifference = (claimingAge - fullRetirementAge) * 12;
    
    if (claimingAge < fullRetirementAge) {
      // Early claiming reduction
      const earlyMonths = Math.abs(monthsDifference);
      const firstThreeYears = Math.min(earlyMonths, 36);
      const additionalMonths = Math.max(0, earlyMonths - 36);
      
      const reduction = (firstThreeYears * 5/9) + (additionalMonths * 5/12);
      return benefitAtFRA * (1 - reduction / 100);
    } else {
      // Delayed retirement credits
      const delayedMonths = monthsDifference;
      const increase = (delayedMonths * 2/3) / 100; // 8% per year = 2/3% per month
      return benefitAtFRA * (1 + increase);
    }
  }

  static calculateTSPWithdrawals(
    balance: number,
    withdrawalType: 'LIFE_EXPECTANCY' | 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE' | 'MIXED',
    age: number,
    fixedAmount?: number,
    fixedPercentage?: number,
    mixedLifeExpectancyAmount?: number,
    mixedFixedAmount?: number
  ): { withdrawal: number; newBalance: number } {
    let withdrawal = 0;
    
    if (withdrawalType === 'FIXED_AMOUNT' && fixedAmount) {
      withdrawal = Math.min(fixedAmount, balance);
    } else if (withdrawalType === 'FIXED_PERCENTAGE' && fixedPercentage) {
      withdrawal = balance * (fixedPercentage / 100);
    } else if (withdrawalType === 'MIXED') {
      // Combined withdrawal strategy
      let lifeExpectancyPortion = 0;
      if (mixedLifeExpectancyAmount) {
        lifeExpectancyPortion = Math.min(mixedLifeExpectancyAmount, balance);
      }
      
      let fixedPortion = 0;
      if (mixedFixedAmount) {
        fixedPortion = Math.min(mixedFixedAmount, balance - lifeExpectancyPortion);
      }
      
      withdrawal = lifeExpectancyPortion + fixedPortion;
    } else {
      // Life expectancy method using IRS Uniform Lifetime Table
      const lifeExpectancyFactor = this.getLifeExpectancyFactor(age);
      withdrawal = balance / lifeExpectancyFactor;
    }
    
    return {
      withdrawal: Math.min(withdrawal, balance),
      newBalance: Math.max(0, balance - withdrawal)
    };
  }

  static getLifeExpectancyFactor(age: number): number {
    // Simplified IRS Uniform Lifetime Table
    const table: { [key: number]: number } = {
      70: 27.4, 71: 26.5, 72: 25.6, 73: 24.7, 74: 23.8,
      75: 22.9, 76: 22.0, 77: 21.2, 78: 20.3, 79: 19.5,
      80: 18.7, 81: 17.9, 82: 17.1, 83: 16.3, 84: 15.5,
      85: 14.8, 86: 14.1, 87: 13.4, 88: 12.7, 89: 12.0,
      90: 11.4, 91: 10.8, 92: 10.2, 93: 9.6, 94: 9.1,
      95: 8.6, 96: 8.1, 97: 7.6, 98: 7.1, 99: 6.7, 100: 6.3
    };
    
    return table[age] || 6.3;
  }

  static calculateRequiredMinimumDistribution(
    tspBalance: number,
    age: number
  ): number {
    if (age < 73) return 0;
    
    const factor = this.getLifeExpectancyFactor(age);
    return tspBalance / factor;
  }

  static calculateFERSCOLA(
    baseAmount: number,
    inflationRate: number,
    retireeAge: number
  ): number {
    // FERS COLA rules - no COLA until age 62 for most retirees
    if (retireeAge < 62) return 0;
    
    let adjustedInflation = inflationRate;
    if (inflationRate > 0.02 && inflationRate <= 0.03) {
      adjustedInflation = 0.02; // Capped at 2%
    } else if (inflationRate > 0.03) {
      adjustedInflation = inflationRate - 0.01; // Reduced by 1 percentage point
    }
    
    return baseAmount * adjustedInflation;
  }

  static calculateFederalTax(
    taxableIncome: number,
    filingStatus: string,
    standardDeduction: number,
    isOver65: boolean = false
  ): number {
    // 2024 tax brackets (simplified)
    const brackets = {
      SINGLE: [
        { rate: 0.10, min: 0, max: 11000 },
        { rate: 0.12, min: 11000, max: 44725 },
        { rate: 0.22, min: 44725, max: 95375 },
        { rate: 0.24, min: 95375, max: 182050 },
        { rate: 0.32, min: 182050, max: 231250 },
        { rate: 0.35, min: 231250, max: 578125 },
        { rate: 0.37, min: 578125, max: Infinity }
      ],
      MARRIED_FILING_JOINTLY: [
        { rate: 0.10, min: 0, max: 22000 },
        { rate: 0.12, min: 22000, max: 89450 },
        { rate: 0.22, min: 89450, max: 190750 },
        { rate: 0.24, min: 190750, max: 364200 },
        { rate: 0.32, min: 364200, max: 462500 },
        { rate: 0.35, min: 462500, max: 693750 },
        { rate: 0.37, min: 693750, max: Infinity }
      ]
    };

    const deduction = standardDeduction + (isOver65 ? 1850 : 0);
    const adjustedIncome = Math.max(0, taxableIncome - deduction);
    
    const bracketSet = brackets[filingStatus as keyof typeof brackets] || brackets.SINGLE;
    
    let tax = 0;
    for (const bracket of bracketSet) {
      if (adjustedIncome > bracket.min) {
        const taxableAtBracket = Math.min(adjustedIncome, bracket.max) - bracket.min;
        tax += taxableAtBracket * bracket.rate;
      }
    }
    
    return tax;
  }

  static async calculateScenario(scenario: RetirementScenario): Promise<CalculationResults> {
    const projections: AnnualProjection[] = [];
    const currentYear = new Date().getFullYear();
    const retirementYear = scenario.personalInfo.plannedRetirementDate.getFullYear();
    const retirementAge = scenario.personalInfo.currentAge + (retirementYear - currentYear);
    
    // Calculate annual FERS pension using computed creditable service
    const creditableYears = scenario.federalService.creditableService.totalCreditableYears;
    const annualPension = await this.calculateFERSPension(
      creditableYears,
      scenario.federalService.highThreeSalary,
      retirementAge
    );

    // Calculate SRS (FERS Annuity Supplement)
    const srsAmount = retirementAge < 62
      ? this.calculateFERSAnnuitySupplament(
          scenario.federalService.creditableService.totalCreditableYears,
          scenario.socialSecurity.estimatedBenefit
        )
      : 0;

    let tspBalance = scenario.tsp.currentBalance;
    
    // Project 30 years of retirement
    for (let year = 0; year < 30; year++) {
      const currentAge = retirementAge + year;
      const projectionYear = retirementYear + year;
      
      // Social Security starts at claiming age
      const ssMonthlyBenefit = currentAge >= scenario.socialSecurity.claimingAge
        ? this.calculateSocialSecurityBenefit(
            scenario.socialSecurity.estimatedBenefit,
            scenario.socialSecurity.claimingAge,
            scenario.socialSecurity.fullRetirementAge
          )
        : 0;

      // TSP Withdrawals
      const tspWithdrawal = this.calculateTSPWithdrawals(
        tspBalance,
        scenario.tsp.withdrawalStrategy.type,
        currentAge,
        scenario.tsp.withdrawalStrategy.fixedAmount,
        scenario.tsp.withdrawalStrategy.fixedPercentage,
        scenario.tsp.withdrawalStrategy.mixedLifeExpectancyAmount,
        scenario.tsp.withdrawalStrategy.mixedFixedAmount
      );

      // Apply TSP growth
      const monthlyGrowthRate = scenario.tsp.growthRate / 12;
      tspBalance = tspWithdrawal.newBalance * Math.pow(1 + monthlyGrowthRate, 12);

      // Calculate income components
      const grossIncome = {
        pension: annualPension * 12,
        socialSecurity: ssMonthlyBenefit * 12,
        tspWithdrawal: tspWithdrawal.withdrawal,
        srs: (currentAge < 62 ? srsAmount : 0) * 12,
        otherIncome: scenario.otherIncome.reduce((sum, income) => {
          if (currentAge >= income.startAge && (!income.endAge || currentAge <= income.endAge)) {
            return sum + (income.monthlyAmount * 12);
          }
          return sum;
        }, 0),
        total: 0
      };
      
      grossIncome.total = Object.values(grossIncome).reduce((sum, val) => sum + val, 0) - grossIncome.total;

      // Calculate taxes (simplified)
      const federalTax = this.calculateFederalTax(
        grossIncome.total,
        scenario.taxes.filingStatus,
        29200, // 2024 standard deduction MFJ
        currentAge >= 65
      );

      const taxes = {
        federalTax,
        stateTax: grossIncome.total * (scenario.taxes.stateTaxRate || 0.05),
        effectiveRate: 0,
        total: 0
      };
      
      taxes.total = taxes.federalTax + taxes.stateTax;
      taxes.effectiveRate = grossIncome.total > 0 ? taxes.total / grossIncome.total : 0;

      const netIncome = grossIncome.total - taxes.total;
      const expenses = scenario.expenses.monthlyAmount * 12 * Math.pow(1 + scenario.expenses.inflationRate, year);
      
      projections.push({
        year: projectionYear,
        age: currentAge,
        grossIncome,
        taxes,
        netIncome,
        expenses,
        surplus: netIncome - expenses,
        tspBalance,
        cumulativeNetIncome: projections.reduce((sum, p) => sum + p.netIncome, 0) + netIncome
      });
    }

    const summary = {
      averageAnnualNetIncome: projections.reduce((sum, p) => sum + p.netIncome, 0) / projections.length,
      totalLifetimeIncome: projections.reduce((sum, p) => sum + p.netIncome, 0),
      yearsOfRetirement: projections.length,
      tspDepletionAge: projections.find(p => p.tspBalance <= 0)?.age
    };

    return {
      annualProjections: projections,
      summary
    };
  }
}