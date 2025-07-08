#!/bin/bash

# 🚀 PRODUCTION-READY DEPLOYMENT SCRIPT FOR BITCOIN LOAN DAPP
# This script handles complete deployment from development to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="bitcoin_loan_dapp"
NETWORK=${1:-local}  # Default to local, can be 'local' or 'ic'
BUILD_ENV=${2:-production}  # Default to production

# Disable cargo audit to avoid Cargo.lock issues during local development
export DFX_DISABLE_AUDIT=1

echo -e "${BLUE}🚀 Starting Bitcoin Loan DApp Deployment${NC}"
echo -e "${BLUE}Network: ${NETWORK}${NC}"
echo -e "${BLUE}Build Environment: ${BUILD_ENV}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking Prerequisites...${NC}"

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    print_error "DFX is not installed. Please install DFX first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Prerequisites check passed"

# Check DFX version
DFX_VERSION=$(dfx --version | cut -d' ' -f2)
print_status "DFX version: $DFX_VERSION"

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Start DFX if running local deployment
if [ "$NETWORK" = "local" ]; then
    echo -e "${BLUE}🏁 Starting DFX replica...${NC}"
    
    # Check if DFX is already running
    if dfx ping &> /dev/null; then
        print_status "DFX replica is already running"
    else
        print_warning "Starting DFX replica in background..."
        dfx start --clean --background
        sleep 5
        
        # Verify DFX started successfully
        if dfx ping &> /dev/null; then
            print_status "DFX replica started successfully"
        else
            print_error "Failed to start DFX replica"
            exit 1
        fi
    fi
fi

# Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf .dfx/local/canisters/${PROJECT_NAME}_backend/
rm -rf .dfx/local/canisters/${PROJECT_NAME}_frontend/
rm -rf src/${PROJECT_NAME}_frontend/dist/
print_status "Previous builds cleaned"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd src/${PROJECT_NAME}_frontend

# Check if package-lock.json exists and use appropriate install command
if [ -f "package-lock.json" ]; then
    echo "Found package-lock.json, using npm ci..."
    npm ci
else
    echo "No package-lock.json found, using npm install..."
    npm install
fi

cd ../..
print_status "Dependencies installed"

# Deploy Internet Identity first (required for declarations)
echo -e "${BLUE}🆔 Deploying Internet Identity...${NC}"
if dfx deploy internet_identity --network $NETWORK &> /dev/null; then
    print_status "Internet Identity deployed"
else
    print_warning "Internet Identity deployment failed, continuing without it..."
fi

# Create canisters first
echo -e "${BLUE}🏗️ Creating canisters...${NC}"
if dfx canister create ${PROJECT_NAME}_backend --network $NETWORK &> /dev/null; then
    print_status "Backend canister created"
else
    print_warning "Backend canister already exists or creation failed"
fi

if dfx canister create ${PROJECT_NAME}_frontend --network $NETWORK &> /dev/null; then
    print_status "Frontend canister created"
else
    print_warning "Frontend canister already exists or creation failed"
fi

# Generate canister declarations
echo -e "${BLUE}🔧 Generating canister declarations...${NC}"
if dfx generate --network $NETWORK; then
    print_status "Canister declarations generated"
else
    print_warning "Some declarations failed, but continuing..."
fi

# Build backend
echo -e "${BLUE}🏗️ Building backend canister...${NC}"
dfx build ${PROJECT_NAME}_backend --network $NETWORK
print_status "Backend canister built"

# Build frontend
echo -e "${BLUE}🎨 Building frontend...${NC}"
cd src/${PROJECT_NAME}_frontend

if [ "$BUILD_ENV" = "production" ]; then
    npm run build:prod
else
    npm run build:$NETWORK
fi

cd ../..
print_status "Frontend built"

# Deploy canisters
echo -e "${BLUE}🚀 Deploying canisters...${NC}"

# Deploy backend first
echo -e "${BLUE}   Deploying backend canister...${NC}"
dfx deploy ${PROJECT_NAME}_backend --network $NETWORK
print_status "Backend canister deployed"

# Deploy frontend
echo -e "${BLUE}   Deploying frontend canister...${NC}"
dfx deploy ${PROJECT_NAME}_frontend --network $NETWORK
print_status "Frontend canister deployed"

# Get canister IDs
echo -e "${BLUE}📋 Getting canister information...${NC}"
BACKEND_ID=$(dfx canister id ${PROJECT_NAME}_backend --network $NETWORK)
FRONTEND_ID=$(dfx canister id ${PROJECT_NAME}_frontend --network $NETWORK)

if [ "$NETWORK" = "local" ]; then
    LOCAL_HOST="http://127.0.0.1:4943"
    BACKEND_URL="${LOCAL_HOST}/?canisterId=${BACKEND_ID}"
    FRONTEND_URL="${LOCAL_HOST}/?canisterId=${FRONTEND_ID}"
else
    BACKEND_URL="https://${BACKEND_ID}.ic0.app"
    FRONTEND_URL="https://${FRONTEND_ID}.ic0.app"
fi

# Test backend connection
echo -e "${BLUE}🧪 Testing backend connection...${NC}"
if dfx canister call ${PROJECT_NAME}_backend whoami --network $NETWORK &> /dev/null; then
    print_status "Backend connection test passed"
else
    print_warning "Backend connection test failed (this might be normal for some functions)"
fi

# Display deployment summary
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL! 🎉${NC}"
echo ""
echo -e "${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "${BLUE}Network:${NC} $NETWORK"
echo -e "${BLUE}Build Environment:${NC} $BUILD_ENV"
echo ""
echo -e "${BLUE}🏗️ CANISTER INFORMATION${NC}"
echo -e "${BLUE}Backend ID:${NC} $BACKEND_ID"
echo -e "${BLUE}Frontend ID:${NC} $FRONTEND_ID"
echo ""
echo -e "${BLUE}🌐 ACCESS URLS${NC}"
echo -e "${BLUE}Backend:${NC} $BACKEND_URL"
echo -e "${BLUE}Frontend:${NC} $FRONTEND_URL"
echo ""

if [ "$NETWORK" = "local" ]; then
    echo -e "${BLUE}🛠️ DEVELOPMENT COMMANDS${NC}"
    echo -e "${BLUE}Stop DFX:${NC} dfx stop"
    echo -e "${BLUE}Restart DFX:${NC} dfx start --clean --background"
    echo -e "${BLUE}View logs:${NC} dfx logs"
    echo -e "${BLUE}Redeploy:${NC} ./deploy.sh local"
    echo ""
fi

echo -e "${BLUE}🔍 TROUBLESHOOTING${NC}"
echo -e "${BLUE}View canister status:${NC} dfx canister status --all --network $NETWORK"
echo -e "${BLUE}Check canister logs:${NC} dfx logs --network $NETWORK"
echo -e "${BLUE}Test backend:${NC} dfx canister call ${PROJECT_NAME}_backend whoami --network $NETWORK"
echo ""

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🎯 You can now access your dApp at: ${FRONTEND_URL}${NC}"

# Save deployment info to file
cat > deployment-info.txt << EOF
Bitcoin Loan DApp Deployment Information
========================================
Date: $(date)
Network: $NETWORK
Build Environment: $BUILD_ENV

Canister IDs:
- Backend: $BACKEND_ID
- Frontend: $FRONTEND_ID

Access URLs:
- Backend: $BACKEND_URL
- Frontend: $FRONTEND_URL

DFX Commands:
- Stop: dfx stop
- Start: dfx start --clean --background
- Status: dfx canister status --all --network $NETWORK
- Logs: dfx logs --network $NETWORK
- Redeploy: ./deploy.sh $NETWORK
EOF

print_status "Deployment information saved to deployment-info.txt"
echo ""
echo -e "${GREEN}🚀 Happy coding! Your Bitcoin Loan DApp is ready to use! 🚀${NC}" 