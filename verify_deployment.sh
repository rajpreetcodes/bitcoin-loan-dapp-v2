#!/bin/bash

echo "🔍 SIMPLE DEPLOYMENT VERIFICATION"
echo "=================================="

# Check if DFX is running
echo "1. Checking DFX status..."
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please run 'dfx start --background' first."
    exit 1
fi
echo "✅ DFX is running"

# Check canisters
echo "2. Checking canister status..."
echo "Backend canister:"
dfx canister status bitcoin_loan_dapp_backend --network local || echo "❌ Backend canister not found"

echo "Frontend canister:"
dfx canister status bitcoin_loan_dapp_frontend --network local || echo "❌ Frontend canister not found"

echo "Internet Identity canister:"
dfx canister status internet_identity --network local || echo "❌ Internet Identity canister not found"

# Test backend
echo "3. Testing backend connectivity..."
if dfx canister call bitcoin_loan_dapp_backend whoami --network local > /dev/null 2>&1; then
    echo "✅ Backend canister is responsive"
else
    echo "❌ Backend canister is not responding"
fi

# Get canister IDs
echo "4. Current canister IDs:"
BACKEND_ID=$(dfx canister id bitcoin_loan_dapp_backend --network local 2>/dev/null)
FRONTEND_ID=$(dfx canister id bitcoin_loan_dapp_frontend --network local 2>/dev/null)
II_ID=$(dfx canister id internet_identity --network local 2>/dev/null)

echo "   - Backend: $BACKEND_ID"
echo "   - Frontend: $FRONTEND_ID"
echo "   - Internet Identity: $II_ID"

echo "5. Access URLs:"
echo "   - Frontend: http://127.0.0.1:4943/?canisterId=$FRONTEND_ID"
echo "   - Backend Candid: http://127.0.0.1:4943/?canisterId=uqqxf-5h777-77774-qaaaa-cai&id=$BACKEND_ID"

echo ""
echo "✅ VERIFICATION COMPLETE!" 