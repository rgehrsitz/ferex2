// Monte Carlo simulation worker
self.onmessage = function(e) {
  const { scenario, iterations = 10000 } = e.data;
  
  console.log('Starting Monte Carlo simulation with', iterations, 'iterations');
  
  const results = runMonteCarloSimulation(scenario, iterations);
  
  self.postMessage({
    type: 'SIMULATION_COMPLETE',
    results
  });
};

function runMonteCarloSimulation(scenario, iterations) {
  const results = [];
  const ages = [];
  const portfolioValues = [];
  
  // Initialize age range
  const startAge = scenario.personalInfo.plannedRetirementAge || 62;
  const endAge = 95;
  
  for (let age = startAge; age <= endAge; age++) {
    ages.push(age);
  }
  
  // Run simulations
  for (let i = 0; i < iterations; i++) {
    const simulation = runSingleSimulation(scenario, ages);
    results.push(simulation);
    
    // Send progress updates every 1000 iterations
    if (i % 1000 === 0) {
      self.postMessage({
        type: 'SIMULATION_PROGRESS',
        progress: (i / iterations) * 100
      });
    }
  }
  
  // Calculate statistics
  const successfulRuns = results.filter(r => r.success).length;
  const successRate = (successfulRuns / iterations) * 100;
  
  // Calculate percentile bands for portfolio values
  const percentileBands = calculatePercentileBands(results, ages);
  
  // Calculate shortfall analysis
  const shortfallAnalysis = calculateShortfallAnalysis(results);
  
  return {
    successRate,
    totalIterations: iterations,
    percentileBands,
    shortfallAnalysis,
    medianPortfolioValue: percentileBands.find(p => p.percentile === 50)?.values || []
  };
}

function runSingleSimulation(scenario, ages) {
  let portfolioBalance = scenario.tsp.currentBalance;
  const portfolioValues = [];
  let success = true;
  let depletionAge = null;
  
  // Market parameters (simplified)
  const baseReturn = scenario.tsp.growthRate || 0.07;
  const volatility = 0.15; // 15% standard deviation
  const baseInflation = 0.03;
  const inflationVolatility = 0.02;
  
  for (let i = 0; i < ages.length; i++) {
    const age = ages[i];
    
    // Generate random market return and inflation
    const marketReturn = generateLogNormalReturn(baseReturn, volatility);
    const inflation = Math.max(0, generateNormalReturn(baseInflation, inflationVolatility));
    
    // Calculate income and expenses for this year
    const income = calculateIncomeForAge(scenario, age, inflation, i);
    const expenses = calculateExpensesForAge(scenario, age, inflation, i);
    
    // Calculate TSP withdrawal
    const withdrawal = Math.min(
      calculateTSPWithdrawal(scenario, portfolioBalance, age),
      portfolioBalance
    );
    
    // Update portfolio balance
    portfolioBalance = (portfolioBalance - withdrawal) * (1 + marketReturn);
    
    portfolioValues.push(Math.max(0, portfolioBalance));
    
    // Check if portfolio depleted and expenses exceed other income
    if (portfolioBalance <= 0 && expenses > (income - withdrawal)) {
      success = false;
      if (!depletionAge) {
        depletionAge = age;
      }
    }
  }
  
  return {
    success,
    depletionAge,
    portfolioValues,
    finalBalance: portfolioBalance
  };
}

function generateLogNormalReturn(meanReturn, volatility) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  // Convert to log-normal
  const logReturn = Math.log(1 + meanReturn) - 0.5 * volatility * volatility + volatility * z;
  return Math.exp(logReturn) - 1;
}

function generateNormalReturn(mean, volatility) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + volatility * z;
}

function calculateIncomeForAge(scenario, age, inflation, yearIndex) {
  let totalIncome = 0;
  
  // FERS Pension (starts at retirement)
  if (age >= scenario.personalInfo.plannedRetirementAge) {
    const basePension = scenario.federalService.annualPension || 0;
    // Apply FERS COLA (only if age 62+, with caps)
    let colaMultiplier = 1;
    if (age >= 62) {
      let adjustedInflation = inflation;
      if (inflation > 0.02 && inflation <= 0.03) {
        adjustedInflation = 0.02; // Capped at 2%
      } else if (inflation > 0.03) {
        adjustedInflation = inflation - 0.01; // Reduced by 1 percentage point
      }
      colaMultiplier = Math.pow(1 + adjustedInflation, yearIndex);
    }
    const pensionWithCola = basePension * colaMultiplier;
    totalIncome += pensionWithCola;
  }
  
  // Social Security (starts at claiming age)
  if (age >= scenario.socialSecurity.claimingAge) {
    const baseSS = scenario.socialSecurity.estimatedBenefit * 12;
    const ssWithCola = baseSS * Math.pow(1 + inflation, yearIndex);
    totalIncome += ssWithCola;
  }
  
  // Other income sources
  scenario.otherIncome?.forEach(income => {
    if (age >= income.startAge && (!income.endAge || age <= income.endAge)) {
      let amount = income.monthlyAmount * 12;
      if (income.colaAdjustment) {
        amount *= Math.pow(1 + inflation, yearIndex);
      }
      totalIncome += amount;
    }
  });
  
  return totalIncome;
}

function calculateExpensesForAge(scenario, age, inflation, yearIndex) {
  const baseExpenses = scenario.expenses.monthlyAmount * 12;
  const inflationRate = scenario.expenses.inflationRate || 0.03;
  return baseExpenses * Math.pow(1 + Math.max(inflation, inflationRate), yearIndex);
}

function calculateTSPWithdrawal(scenario, balance, age) {
  if (balance <= 0) return 0;
  
  const strategy = scenario.tsp.withdrawalStrategy;
  
  if (strategy.type === 'FIXED_AMOUNT') {
    return Math.min(strategy.fixedAmount || 0, balance);
  }
  
  // Life expectancy method (simplified)
  const lifeExpectancy = Math.max(10, 95 - age);
  return balance / lifeExpectancy;
}

function calculatePercentileBands(results, ages) {
  const percentiles = [10, 25, 50, 75, 90];
  const bands = [];
  
  percentiles.forEach(percentile => {
    const values = [];
    
    ages.forEach((age, ageIndex) => {
      const portfolioValuesAtAge = results.map(r => r.portfolioValues[ageIndex] || 0);
      portfolioValuesAtAge.sort((a, b) => a - b);
      
      const index = Math.floor((percentile / 100) * portfolioValuesAtAge.length);
      values.push(portfolioValuesAtAge[index] || 0);
    });
    
    bands.push({
      percentile,
      values
    });
  });
  
  return bands;
}

function calculateShortfallAnalysis(results) {
  const failedRuns = results.filter(r => !r.success);
  
  if (failedRuns.length === 0) {
    return {
      probabilityOfShortfall: 0,
      averageShortfallAge: null,
      averageShortfallMagnitude: 0
    };
  }
  
  const averageShortfallAge = failedRuns.reduce((sum, r) => sum + (r.depletionAge || 95), 0) / failedRuns.length;
  
  return {
    probabilityOfShortfall: (failedRuns.length / results.length) * 100,
    averageShortfallAge,
    averageShortfallMagnitude: 0 // Simplified for now
  };
}