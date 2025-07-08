#!/bin/bash

echo "🔍 CANISTER ID VERIFICATION SCRIPT"
echo "=================================="

# Check if DFX is running
echo "1. Checking DFX status..."
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ DFX is not running. Please run 'dfx start --background' first."
    exit 1
fi
echo "✅ DFX is running"

# Get actual canister IDs
echo "2. Getting actual canister IDs..."
ACTUAL_BACKEND=$(dfx canister id bitcoin_loan_dapp_backend --network local 2>/dev/null)
ACTUAL_FRONTEND=$(dfx canister id bitcoin_loan_dapp_frontend --network local 2>/dev/null)
ACTUAL_II=$(dfx canister id internet_identity --network local 2>/dev/null)

echo "   - Backend: $ACTUAL_BACKEND"
echo "   - Frontend: $ACTUAL_FRONTEND"
echo "   - Internet Identity: $ACTUAL_II"

# Check hardcoded IDs in frontend
echo "3. Checking hardcoded IDs in frontend..."
HARDCODED_BACKEND="uxrrr-q7777-77774-qaaaq-cai"
HARDCODED_FRONTEND="u6s2n-gx777-77774-qaaba-cai"
HARDCODED_II="uzt4z-lp777-77774-qaabq-cai"

echo "   - Hardcoded Backend: $HARDCODED_BACKEND"
echo "   - Hardcoded Frontend: $HARDCODED_FRONTEND"
echo "   - Hardcoded II: $HARDCODED_II"

# Check for mismatches
echo "4. Checking for mismatches..."
MISMATCH=false

if [ "$ACTUAL_BACKEND" != "$HARDCODED_BACKEND" ]; then
    echo "❌ Backend canister ID mismatch!"
    echo "   Actual: $ACTUAL_BACKEND"
    echo "   Hardcoded: $HARDCODED_BACKEND"
    MISMATCH=true
fi

if [ "$ACTUAL_FRONTEND" != "$HARDCODED_FRONTEND" ]; then
    echo "❌ Frontend canister ID mismatch!"
    echo "   Actual: $ACTUAL_FRONTEND"
    echo "   Hardcoded: $HARDCODED_FRONTEND"
    MISMATCH=true
fi

if [ "$ACTUAL_II" != "$HARDCODED_II" ]; then
    echo "❌ Internet Identity canister ID mismatch!"
    echo "   Actual: $ACTUAL_II"
    echo "   Hardcoded: $HARDCODED_II"
    MISMATCH=true
fi

if [ "$MISMATCH" = true ]; then
    echo ""
    echo "🔧 FIXING CANISTER ID MISMATCHES..."
    echo "Updating frontend code with correct canister IDs..."
    
    # Update actor.js with correct canister IDs
    sed -i "s/uxrrr-q7777-77774-qaaaq-cai/$ACTUAL_BACKEND/g" src/bitcoin_loan_dapp_frontend/src/actor.js
    sed -i "s/u6s2n-gx777-77774-qaaba-cai/$ACTUAL_FRONTEND/g" src/bitcoin_loan_dapp_frontend/src/actor.js
    sed -i "s/uzt4z-lp777-77774-qaabq-cai/$ACTUAL_II/g" src/bitcoin_loan_dapp_frontend/src/actor.js
    
    # Update AuthContext.jsx with correct canister IDs  
    sed -i "s/uxrrr-q7777-77774-qaaaq-cai/$ACTUAL_BACKEND/g" src/bitcoin_loan_dapp_frontend/src/AuthContext.jsx
    sed -i "s/u6s2n-gx777-77774-qaaba-cai/$ACTUAL_FRONTEND/g" src/bitcoin_loan_dapp_frontend/src/AuthContext.jsx
    sed -i "s/uzt4z-lp777-77774-qaabq-cai/$ACTUAL_II/g" src/bitcoin_loan_dapp_frontend/src/AuthContext.jsx
    
    echo "✅ Canister IDs updated in frontend code"
    echo ""
    echo "🚀 REBUILDING AND REDEPLOYING..."
    
    # Rebuild frontend
    cd src/bitcoin_loan_dapp_frontend
    npm run build
    cd ../..
    
    # Redeploy frontend
    dfx deploy bitcoin_loan_dapp_frontend --network local
    
    echo "✅ Frontend rebuilt and redeployed with correct canister IDs"
else
    echo "✅ All canister IDs match!"
fi

echo ""
echo "5. Testing canister connectivity..."
echo "Testing backend canister..."
if dfx canister call bitcoin_loan_dapp_backend whoami --network local > /dev/null 2>&1; then
    echo "✅ Backend canister is responsive"
else
    echo "❌ Backend canister is not responding"
    echo "   Try: dfx deploy bitcoin_loan_dapp_backend --network local"
fi

echo ""
echo "🎉 CANISTER VERIFICATION COMPLETE!"
echo "If you're still seeing errors, try:"
echo "1. Hard refresh your browser (Ctrl+Shift+R)"
echo "2. Clear browser cache for localhost"
echo "3. Disconnect and reconnect Plug Wallet"
echo "4. Check the browser console for new canister IDs" 