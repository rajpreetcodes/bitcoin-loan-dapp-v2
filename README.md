# Bitcoin Loan dApp

A decentralized application built on the Internet Computer Protocol (ICP) that enables users to take out loans using Bitcoin as collateral, without giving up custody of their BTC.

## 🌟 Features

- **Non-custodial Bitcoin collateral**: Lock your Bitcoin as collateral while maintaining control through smart contracts.
- **Peer-to-peer lending**: Connect borrowers and lenders directly without intermediaries.
- **Escrow system**: Secure transactions with a built-in escrow mechanism.
- **Internet Identity authentication**: Secure authentication using Internet Computer's identity service.
- **Responsive UI**: Modern, intuitive interface that works across devices.

## 🔧 Technology Stack

- **Backend**: Rust canisters on the Internet Computer.
- **Frontend**: React.js with Vite.
- **Authentication**: Internet Identity.
- **Blockchain Integration**: ICP Bitcoin integration and ckBTC tokens.
- **Smart Contracts**: Deployed on the Internet Computer Protocol.

## 📋 Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove) (>= 0.14.0).
- [Node.js](https://nodejs.org/) (>= 16.x).
- [Rust](https://www.rust-lang.org/tools/install) (latest stable).

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/rajpreetcodes/bitcoin-loan-dapp.git
   cd bitcoin-loan-dapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local Internet Computer replica:
   ```bash
   dfx start --clean --background
   ```

4. Deploy the canisters locally:
   ```bash
   dfx deploy
   ```

5. Start the frontend development server:
   ```bash
   cd src/bitcoin_loan_dapp_frontend && npm run dev
   ```

6. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`).

## 🏗️ Project Structure

```
bitcoin-loan-dapp/
├── Cargo.lock                # Rust dependencies lock file
├── Cargo.toml                # Rust project configuration
├── check_canisters.sh        # Script to check canister status
├── cypress/                  # E2E tests
├── deploy.sh                 # Deployment script
├── deployment-info.txt       # Deployment information
├── dfx.json                  # DFX configuration
├── dfx.json.backup           # Backup of DFX configuration
├── package-lock.json         # NPM lock file
├── package.json              # Frontend dependencies
├── README.md                 # This file
├── src/                      # Source code
│   ├── bitcoin_escrow_canister/     # Escrow canister
│   ├── bitcoin_loan_dapp_backend/   # Main backend canister
│   ├── bitcoin_loan_dapp_frontend/  # React frontend
│   └── declarations/                 # Generated canister declarations
├── target/                   # Build artifacts
├── test_canister_connection.sh # Test script
├── tsconfig.json             # TypeScript configuration
└── verify_deployment.sh      # Verification script
```

## 💡 How It Works

1. **Authentication**: Users authenticate using Internet Identity.
2. **Create Loan**: Borrowers create loan requests specifying collateral and loan amounts.
3. **Escrow Creation**: System creates escrow agreement between borrower and lender.
4. **Bitcoin Collateral**: Borrowers lock Bitcoin as collateral.
5. **Loan Funding**: Lenders fund loans with ckBTC.
6. **Repayment**: Borrowers repay loans to retrieve collateral.
7. **Defaulting**: Lenders can claim collateral if borrower defaults.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

For end-to-end testing:

```bash
npm run test:e2e
```

## 🚢 Deployment

To deploy to the Internet Computer mainnet:

1. Create or obtain cycles for deployment.
2. Configure your mainnet identity:
   ```bash
   dfx identity use <your-identity>
   ```
3. Deploy to mainnet:
   ```bash
   dfx deploy --network ic
   ```

## 🔐 Security Features

- Non-custodial design ensures users maintain control of their assets.
- Smart contract-based escrow system for secure transactions.
- Secure authentication via Internet Identity.
- Input validation and error handling throughout the application.

## 📱 UI Features

- Modern card-based interface with intuitive navigation.
- Real-time loan and escrow status updates.
- Form validation with helpful error messages.
- Dynamic loan summary calculations.
- Responsive design for mobile and desktop.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

Project Link: [https://github.com/rajpreetcodes/bitcoin-loan-dapp](https://github.com/rajpreetcodes/bitcoin-loan-dapp)

## 🙏 Acknowledgments

- [Internet Computer](https://internetcomputer.org/)
- [DFINITY Foundation](https://dfinity.org/)
- [ckBTC Documentation](https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/ckbtc/)
