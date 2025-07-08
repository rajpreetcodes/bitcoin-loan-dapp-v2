#!/bin/bash

echo "🧪 COMPREHENSIVE CANISTER CONNECTION TEST"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if DFX is running
echo "1. Checking DFX status..."
if ! dfx ping > /dev/null 2>&1; then
    echo -e "${RED}❌ DFX is not running. Please run 'dfx start --background' first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ DFX is running${NC}"

# Get canister IDs and test them
echo "2. Testing canister connectivity..."

BACKEND_ID=$(dfx canister id bitcoin_loan_dapp_backend --network local 2>/dev/null)
FRONTEND_ID=$(dfx canister id bitcoin_loan_dapp_frontend --network local 2>/dev/null)
II_ID=$(dfx canister id internet_identity --network local 2>/dev/null)

if [ -z "$BACKEND_ID" ]; then
    echo -e "${RED}❌ Backend canister not found - deploying...${NC}"
    dfx deploy bitcoin_loan_dapp_backend --network local
    BACKEND_ID=$(dfx canister id bitcoin_loan_dapp_backend --network local)
fi

if [ -z "$II_ID" ]; then
    echo -e "${RED}❌ Internet Identity canister not found - deploying...${NC}"
    dfx deploy internet_identity --network local
    II_ID=$(dfx canister id internet_identity --network local)
fi

echo "Current Canister IDs:"
echo -e "   - Backend: ${GREEN}$BACKEND_ID${NC}"
echo -e "   - Frontend: ${GREEN}$FRONTEND_ID${NC}"
echo -e "   - Internet Identity: ${GREEN}$II_ID${NC}"

# Test backend canister directly
echo "3. Testing backend canister calls..."
if dfx canister call bitcoin_loan_dapp_backend whoami --network local > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend canister responds to whoami${NC}"
else
    echo -e "${RED}❌ Backend canister does not respond${NC}"
fi

if dfx canister call bitcoin_loan_dapp_backend get_linked_btc_address --network local > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend canister responds to get_linked_btc_address${NC}"
else
    echo -e "${YELLOW}⚠️ Backend canister get_linked_btc_address may not be implemented yet${NC}"
fi

# Check environment variables in build
echo "4. Checking environment variable injection..."
cd src/bitcoin_loan_dapp_frontend

echo "Building frontend to check environment variable injection..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend builds successfully${NC}"
    
    # Check if canister IDs are properly injected
    if grep -q "$BACKEND_ID" dist/assets/*.js 2>/dev/null; then
        echo -e "${GREEN}✅ Backend canister ID found in built files${NC}"
    else
        echo -e "${YELLOW}⚠️ Backend canister ID not found in built files - check environment injection${NC}"
    fi
else
    echo -e "${RED}❌ Frontend build failed${NC}"
fi

cd ../..

# Deploy frontend if not exists
if [ -z "$FRONTEND_ID" ]; then
    echo "5. Deploying frontend..."
    dfx deploy bitcoin_loan_dapp_frontend --network local
    FRONTEND_ID=$(dfx canister id bitcoin_loan_dapp_frontend --network local)
fi

echo "6. Final verification..."
echo "Access URLs:"
echo -e "   - ${GREEN}Frontend: http://127.0.0.1:4943/?canisterId=$FRONTEND_ID${NC}"
echo -e "   - ${GREEN}Backend Candid: http://127.0.0.1:4943/?canisterId=uqqxf-5h777-77774-qaaaa-cai&id=$BACKEND_ID${NC}"
echo -e "   - ${GREEN}Internet Identity: http://127.0.0.1:4943/?canisterId=$II_ID${NC}"

echo ""
echo "7. Testing checklist:"
echo "   □ Open frontend URL in browser"
echo "   □ Check browser console for focused debug logs"
echo "   □ Try Plug Wallet connection"
echo "   □ Look for 'PLUG LOGIN DEBUG' and 'PLUG ACTOR DEBUG' logs"
echo "   □ Verify no more 'canister_not_found' errors"

echo ""
echo -e "${GREEN}🎉 TEST COMPLETE!${NC}"
echo "If you still see 'canister_not_found' errors, check the browser console"
echo "for the focused debug logs to identify any remaining issues." 