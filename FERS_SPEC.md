# FEREX - FERS Retirement Scenario Explorer: Specification

## Overview
FEREX is a comprehensive desktop application designed specifically for Federal Employees Retirement System (FERS) participants to model and analyze retirement scenarios. This tool focuses exclusively on FERS rules and calculations to provide the most accurate and relevant projections for federal employees hired after 1984.

## Core FERS Components

### 1. FERS Pension Calculation
**Basic Formula**: High-3 × Years of Service × Multiplier

**Multipliers**:
- **1.0%**: Standard rate for most retirements
- **1.1%**: Enhanced rate for employees who retire at age 62+ with 20+ years of service

**High-3 Calculation**: 
- Average of highest 36 consecutive months of basic pay
- Includes locality pay and shift differentials
- Excludes overtime, bonuses, and premium pay

### 2. FERS Annuity Supplement (SRS)
**Purpose**: Bridge income gap between FERS retirement and Social Security eligibility at age 62

**Eligibility**: 
- Immediate, unreduced FERS annuity required
- MRA+30 (unreduced)
- Age 60+20 (unreduced)  
- Certain VERA/DSR scenarios

**Calculation**: (Estimated SS at 62 ÷ 40) × Years of FERS Service

**Duration**: Starts at retirement, automatically ends at age 62

**Earnings Test**: Subject to Social Security earnings test ($22,320 limit in 2024)

### 3. Creditable Service Rules
**Civilian Service**: 
- All FERS-covered employment
- Temporary service with deposit (pre-1989 only)

**Military Service**:
- Post-1956 service requires buy-back deposit
- 3% of basic military pay plus interest
- Must be completed before retirement

**Sick Leave**: 
- Unused sick leave counts toward computation (not eligibility)
- Added to total service years for pension calculation

**Part-time Service**: 
- Counts fully toward eligibility
- Prorated for computation based on hours worked

### 4. Early Retirement Options

**MRA+10**: 
- Retire at Minimum Retirement Age with 10-29 years
- 5% reduction per year under age 62
- No SRS eligibility
- Can postpone annuity to reduce/eliminate penalty

**MRA+30**: 
- Retire at MRA with 30+ years
- No reduction
- SRS eligible

**Age 60+20**: 
- Retire at age 60 with 20+ years
- No reduction
- SRS eligible

### 5. FERS COLA Rules
**Eligibility**: Most FERS retirees must reach age 62

**Calculation**:
- If inflation ≤ 2.0%: Full COLA
- If inflation 2.1% - 3.0%: COLA capped at 2.0%
- If inflation > 3.0%: COLA = inflation - 1.0%

**Exceptions**: Disability retirees and survivors receive COLAs before age 62

### 6. Survivor Benefits
**Options**:
- None: No reduction, no survivor income
- Partial (25%): 5% reduction to retiree's annuity
- Full (50%): 10% reduction to retiree's annuity

**Spousal Consent**: Required for anything less than full survivor benefit

## Social Security Integration (Post-WEP/GPO Repeal)

### Simplified Calculations
- No WEP reductions for benefits after December 2023
- No GPO reductions for spousal/survivor benefits
- Standard PIA calculations apply to all FERS employees

### Claiming Strategies
- Early claiming (age 62): Permanent reductions apply
- Full Retirement Age: 100% of PIA
- Delayed claiming (up to age 70): 8% annual increases

## TSP (Thrift Savings Plan) Modeling

### Account Types
**Traditional TSP**: Tax-deferred contributions and growth, taxed upon withdrawal
**Roth TSP**: After-tax contributions, tax-free qualified withdrawals

### Withdrawal Strategies
**Life Expectancy Method**: 
- Annual recalculation based on IRS tables
- Payment adjusts each year based on balance and age

**Fixed Amount Method**: 
- User-specified monthly/quarterly/annual payment
- Continues until account depleted

### Required Minimum Distributions
- Begin at age 73 (born 1951-1959) or age 75 (born 1960+)
- Based on IRS Uniform Lifetime Table
- Apply to Traditional TSP only

## Tax Calculations

### Federal Income Tax
**Pension Taxation**: IRS Simplified Method
- After-tax contributions recovered tax-free over life expectancy
- Remaining portion taxed as ordinary income

**Social Security Taxation**: 
- Based on "provisional income" calculation
- 0%, 50%, or 85% may be taxable depending on income level

**TSP Taxation**:
- Traditional: Fully taxable as ordinary income
- Roth: Tax-free if qualified (5-year rule + age 59½)

### State Income Tax
- Simplified user-input approach
- Links to state-specific resources
- Recognition that treatment varies significantly by state

## Risk Analysis & Monte Carlo Simulation

### Stochastic Variables
**Investment Returns**: Log-normal distribution based on historical TSP performance
**Inflation**: Normal distribution with historical mean and standard deviation

### Risk Metrics
- Success probability (funds lasting to target age)
- Shortfall analysis (magnitude and duration)
- Percentile bands (10th, 25th, 50th, 75th, 90th percentiles)

### Sensitivity Analysis
- Test impact of key assumptions
- Identify variables with highest impact on outcomes

## User Interface Design

### Workflow
1. **Personal Information**: Demographics, service dates, retirement plans
2. **FERS Service Details**: High-3, creditable service, survivor elections
3. **Social Security**: Benefit estimates, claiming age
4. **TSP**: Balances, growth assumptions, withdrawal strategy
5. **Other Income & Expenses**: Additional sources, monthly spending
6. **Results & Analysis**: Projections, comparisons, risk analysis

### Visualizations
- Stacked area charts for income composition over time
- Waterfall charts for scenario comparisons
- Fan charts for Monte Carlo results
- Side-by-side comparison tables

### Validation & Help
- Real-time input validation
- Contextual tooltips with FERS-specific guidance
- Error prevention and helpful suggestions

## Technical Architecture

### Frontend
- React + TypeScript for type safety and maintainability
- Tailwind CSS for responsive, professional styling
- Recharts for interactive data visualizations

### Backend
- Tauri (Rust) for high-performance calculations
- SQLite for local scenario storage
- Web Workers for Monte Carlo simulations

### Cross-Platform
- Windows, macOS, and Linux support
- Native OS integration via Tauri
- Smaller footprint than Electron-based alternatives

## Accuracy & Compliance

### OPM Alignment
All calculations implement official OPM guidance:
- FERS pension computation rules
- SRS eligibility and calculation methods
- COLA application procedures
- Creditable service determinations

### Data Sources
- TSP fund performance data from tsp.gov
- IRS tax tables and life expectancy factors
- Social Security Administration benefit calculation methods
- Office of Personnel Management retirement guides

## Future Enhancements

### Potential Additions
- FERS transferee support (employees who switched from CSRS)
- FEHB premium modeling for health insurance costs
- FEGLI life insurance calculations
- Special category provisions (LEO, firefighter, air traffic control)
- Advanced estate planning features

### Data Improvements
- Real-time TSP balance integration
- Automated Social Security estimate imports
- Enhanced state tax database
- Professional advisor collaboration tools

## Limitations & Disclaimers

### Scope Boundaries
- FERS employees only (post-1984 hires)
- General retirement provisions (not special categories)
- Estimates based on current law and user inputs
- Not a substitute for professional financial advice

### User Responsibilities
- Verify all inputs with official sources
- Confirm FERS eligibility and service history
- Understand projections are estimates
- Consult professionals for complex situations

---

*This specification serves as the authoritative guide for FEREX development, ensuring accurate implementation of FERS retirement rules and user-friendly presentation of complex federal retirement concepts.*