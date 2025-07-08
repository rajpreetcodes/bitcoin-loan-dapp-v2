# 🚀 Bitcoin Loan DApp - Production Ready

A decentralized Bitcoin lending platform built on the Internet Computer blockchain. This dApp allows users to use their Bitcoin as collateral for instant loans with full transparency and security.

## 🌟 Features

- **🔒 Secure Bitcoin Collateral**: Link your Bitcoin wallet and use it as collateral
- **⚡ Instant Loans**: Get loans instantly with your Bitcoin backing
- **🌐 Decentralized**: Fully decentralized on Internet Computer
- **🔄 Transparent**: All transactions are transparent and verifiable
- **🆔 Dual Authentication**: Support for both Internet Identity and Plug Wallet
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Rust, Internet Computer SDK
- **Authentication**: Internet Identity, Plug Wallet
- **Blockchain**: Internet Computer Protocol (ICP)
- **Bitcoin Integration**: Bitcoin address validation and linking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- DFX (Internet Computer SDK) 0.15.0+
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd bitcoin_loan_dapp
```

### 2. Install Dependencies

```bash
npm install --prefix src/bitcoin_loan_dapp_frontend
```

### 3. Start Local Development

```bash
# Start DFX replica
dfx start --clean --background

# Deploy locally using the production-ready deployment script
chmod +x deploy.sh
./deploy.sh local
```

### 4. Access the DApp

After deployment, the script will display the access URLs:
- Frontend: `http://127.0.0.1:4943/?canisterId=<frontend-id>`
- Backend: `http://127.0.0.1:4943/?canisterId=<backend-id>`

## 🏭 Production Deployment

### Deploy to IC Mainnet

```bash
# Build and deploy to IC mainnet
./deploy.sh ic production
```

### Environment Configuration

The dApp is configured for multiple environments:

- **Local Development**: `http://127.0.0.1:4943`
- **IC Mainnet**: `https://ic0.app`

Environment detection is automatic based on the deployment context.

## 🔧 Configuration

### Hardcoded Canister IDs (Production Ready)

For production stability, canister IDs are hardcoded in the configuration:

```javascript
const CANISTER_IDS = {
  BITCOIN_LOAN_DAPP_BACKEND: "uxrrr-q7777-77774-qaaaq-cai",
  INTERNET_IDENTITY: "uzt4z-lp777-77774-qaabq-cai", 
  BITCOIN_LOAN_DAPP_FRONTEND: "u6s2n-gx777-77774-qaaba-cai"
};
```

### Environment-Based Host Configuration

```javascript
const ENV_CONFIG = {
  local: {
    host: "http://127.0.0.1:4943",
    identityProvider: "http://127.0.0.1:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai"
  },
  ic: {
    host: "https://ic0.app",
    identityProvider: "https://identity.ic0.app"
  }
};
```

## 🔐 Authentication

### Internet Identity (Primary)

- Secure and anonymous authentication
- No need to install browser extensions
- Uses Web Authentication API

### Plug Wallet (Secondary)

- Browser extension wallet
- Direct ICP token management
- Advanced wallet features

## 📚 Usage Guide

### 1. Connect Your Wallet

Choose between Internet Identity or Plug Wallet for authentication.

### 2. Link Bitcoin Address

- Enter your Bitcoin address (supports P2PKH, P2SH, and Bech32 formats)
- Address validation ensures proper format
- Linked addresses are stored securely

### 3. Create Loans

- Use your linked Bitcoin as collateral
- Specify loan amount and terms
- Loans are processed instantly

### 4. Manage Loans

- Track active loans in your dashboard
- Monitor collateral and repayment status
- Repay loans when ready

## 🧪 Testing

### Backend Testing

```bash
# Test backend connection
dfx canister call bitcoin_loan_dapp_backend whoami --network local

# Test Bitcoin address linking
dfx canister call bitcoin_loan_dapp_backend link_btc_address '("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa")' --network local
```

### Frontend Testing

```bash
cd src/bitcoin_loan_dapp_frontend
npm test
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "canister_not_found" Error

**Solution**: Ensure DFX is running and canisters are deployed:

```bash
dfx ping
dfx canister status --all --network local
```

#### 2. Plug Wallet Connection Issues

**Solution**: Force reconnect with correct host:

```bash
# Check current host configuration
# Use the "Force Reconnect" button in the dApp
```

#### 3. Backend Connection Failures

**Solution**: Verify backend deployment:

```bash
dfx canister call bitcoin_loan_dapp_backend whoami --network local
```

#### 4. Frontend Build Issues

**Solution**: Clear cache and rebuild:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Development Commands

```bash
# Start DFX replica
dfx start --clean --background

# Stop DFX replica
dfx stop

# Check canister status
dfx canister status --all --network local

# View logs
dfx logs --network local

# Redeploy everything
./deploy.sh local

# Deploy specific canister
dfx deploy bitcoin_loan_dapp_backend --network local
dfx deploy bitcoin_loan_dapp_frontend --network local
```

## 🏗️ Project Structure

```
bitcoin_loan_dapp/
├── src/
│   ├── bitcoin_loan_dapp_backend/     # Rust backend canister
│   │   ├── src/lib.rs                 # Main backend logic
│   │   ├── Cargo.toml                 # Rust dependencies
│   │   └── bitcoin_loan_dapp_backend.did  # Candid interface
│   ├── bitcoin_loan_dapp_frontend/    # React frontend
│   │   ├── src/
│   │   │   ├── actor.js               # IC actor configuration
│   │   │   ├── AuthContext.jsx        # Authentication context
│   │   │   ├── Dashboard.jsx          # Main dashboard
│   │   │   ├── LandingPage.jsx        # Landing page
│   │   │   └── main.jsx               # App entry point
│   │   ├── package.json               # Frontend dependencies
│   │   └── vite.config.js             # Vite configuration
│   └── declarations/                  # Generated canister declarations
├── dfx.json                          # DFX configuration
├── deploy.sh                         # Production deployment script
└── README.md                         # This file
```

## 🔒 Security Considerations

- All Bitcoin addresses are validated before linking
- Authentication is handled through secure IC protocols
- No private keys are stored or transmitted
- All canister calls are authenticated and authorized

## 🌐 Network Configuration

### Local Development

- Host: `http://127.0.0.1:4943`
- Internet Identity: Local canister
- DFX replica required

### IC Mainnet

- Host: `https://ic0.app`
- Internet Identity: `https://identity.ic0.app`
- Direct IC mainnet connection

## 📈 Performance Optimization

- **Code Splitting**: Vendor chunks separated for better caching
- **Lazy Loading**: Components loaded on demand
- **Optimized Builds**: Production builds are minified and optimized
- **Efficient Bundling**: Vite for fast development and optimized production builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the troubleshooting section above
- Review the deployment logs
- Verify canister status
- Check DFX and Node.js versions

## 🚀 Deployment Status

After running the deployment script, check `deployment-info.txt` for:
- Canister IDs
- Access URLs
- Deployment timestamps
- Network configuration

---

**🎯 Your Bitcoin Loan DApp is now production-ready!**

Use the deployment script for consistent, reliable deployments across all environments. The hardcoded configuration ensures stability, while the comprehensive error handling and troubleshooting guides help resolve any issues quickly.
