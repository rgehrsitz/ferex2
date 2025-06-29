# FEREX - Federal Retirement Scenario Explorer

A comprehensive desktop application for FERS federal employees to model and analyze retirement scenarios with precision and confidence.

## Features

### Core Capabilities
- **FERS Pension Calculations**: Accurate computation of federal retirement annuities including high-3 salary, creditable service, and early retirement provisions with proper 1.0%/1.1% multipliers
- **Social Security Integration**: Post-WEP/GPO repeal modeling with claiming age optimization (2025+)
- **FERS Annuity Supplement**: Comprehensive SRS modeling for eligible early retirees under age 62
- **TSP Analysis**: Traditional and Roth TSP growth projections with multiple withdrawal strategies and RMD calculations
- **Tax Modeling**: Federal and state tax calculations using IRS Simplified Method for pension taxation
- **Monte Carlo Simulation**: Risk analysis with 10,000+ iterations modeling market volatility and inflation uncertainty

### Advanced Features
- **Scenario Comparison**: Side-by-side analysis of multiple retirement strategies
- **FERS-Specific COLA Modeling**: Accurate cost-of-living adjustments with FERS caps and age 62 eligibility rules
- **Survivor Benefits**: Impact analysis of survivor annuity elections (10% reduction for full, 5% for partial)
- **Early Retirement Analysis**: MRA+10, MRA+30, Age 60+20 options with proper reductions
- **Data Visualization**: Interactive charts for income projections, risk analysis, and scenario comparisons

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Tauri (Rust backend)
- **Charts**: Recharts
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- Rust toolchain
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ferex
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run tauri dev
```

4. Build for production
```bash
npm run tauri build
```

## Usage

### 1. Personal Information
- Enter basic demographics and federal service dates
- Specify planned retirement date
- Confirm FERS eligibility (hired after 1984)

### 2. FERS Service Details
- Input high-3 average salary (highest 36 consecutive months)
- Enter total FERS creditable service years
- Include military service and buy-back status
- Specify unused sick leave balance (counts toward computation)
- Select survivor benefit election (affects monthly annuity)

### 3. Social Security
- Enter estimated monthly benefit at Full Retirement Age
- Specify claiming age (62-70)
- System automatically handles post-WEP/GPO repeal rules

### 4. TSP Configuration
- Current balance (Traditional and Roth breakdown)
- Expected annual growth rate
- Withdrawal strategy (Life Expectancy or Fixed Amount)
- Fund allocation preferences

### 5. Other Income & Expenses
- Additional retirement income sources
- Monthly expense estimates
- Inflation assumptions

### 6. Analysis & Results
- View detailed year-by-year projections
- Run Monte Carlo simulations for risk analysis
- Compare multiple scenarios
- Export results for further analysis

## Calculation Accuracy

FEREX implements the official FERS calculation rules as specified by OPM:

- **FERS Pension**: 1.0% or 1.1% multiplier based on age and service at retirement
- **FERS Annuity Supplement**: Accurate SRS calculations for eligible early retirees
- **FERS COLA**: Age 62+ eligibility with caps (2% max, inflation-1% if >3%)
- **Social Security**: Post-2025 calculations without WEP/GPO reductions
- **TSP Withdrawals**: Life expectancy and fixed amount methods with proper RMDs
- **Tax Calculations**: IRS Simplified Method for pension taxation

## Monte Carlo Simulation

The risk analysis feature runs comprehensive Monte Carlo simulations:

- **Market Returns**: Log-normal distribution based on historical TSP fund performance
- **Inflation Modeling**: Normal distribution with historical volatility
- **Correlation Effects**: Accounts for asset class correlations
- **Success Metrics**: Portfolio survival probability, shortfall analysis, percentile bands

## Validation & Error Handling

- **Input Validation**: Real-time validation with helpful error messages
- **Data Consistency**: Cross-field validation to ensure logical inputs
- **Calculation Safeguards**: Prevents division by zero and handles edge cases
- **User Guidance**: Tooltips and contextual help throughout the interface

## Limitations

- **CSRS Support**: This version focuses exclusively on FERS (post-1984 hires)
- **State Taxes**: Simplified state tax modeling (user input required)
- **FEHB/FEGLI**: Health insurance and life insurance not yet modeled
- **Special Categories**: LEO, FF, ATC provisions not implemented
- **FERS Transferees**: Employees who transferred from CSRS to FERS not yet supported

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

FEREX is provided for informational purposes only. While every effort has been made to ensure calculation accuracy, users should:

- Verify all inputs with official sources (SF-50, TSP statements, SSA estimates)
- Confirm FERS eligibility and service dates with your agency HR
- Understand that projections are estimates based on assumptions
- Consider professional financial planning advice for major decisions

This tool is designed specifically for FERS employees. CSRS employees should consult other resources or professional advisors.

## Support

For questions, bug reports, or feature requests, please open an issue on GitHub.

## Acknowledgments

- Office of Personnel Management (OPM) for official retirement calculation guidelines
- Social Security Administration (SSA) for benefit calculation methodologies
- Thrift Savings Plan (TSP) for investment performance data
- Federal employee community for feedback and testing