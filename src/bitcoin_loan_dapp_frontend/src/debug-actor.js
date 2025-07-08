// Debug utility to test actor connection and environment setup
import { createActor, getActor, CANISTER_IDS } from './actor';

export const debugActorSetup = async () => {
  console.log('=== ACTOR DEBUG INFORMATION ===');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- DFX_NETWORK:', import.meta.env.DFX_NETWORK || 'local');
  console.log('- Backend Canister ID (hardcoded):', CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND);
  console.log('- Internet Identity Canister ID (hardcoded):', CANISTER_IDS.INTERNET_IDENTITY);
  
  // List all available canister IDs
  console.log('- Available hardcoded canister IDs:', Object.keys(CANISTER_IDS));
  
  // Test actor connection
  console.log('\n=== TESTING ACTOR CONNECTION ===');
  let testResult = { success: false, error: null, principal: null };
  
  try {
    console.log('1. Creating unauthenticated actor...');
    const actor = await createActor();
    console.log('✅ Actor created successfully');
    
    console.log('2. Testing whoami call...');
    const principal = await actor.whoami();
    console.log('✅ Whoami call successful');
    
    testResult = { success: true, principal: principal.toString(), error: null };
  } catch (error) {
    console.error('❌ Actor test failed:', error);
    testResult = { success: false, error: error.message, principal: null };
  }
  
  if (testResult.success) {
    console.log('✅ Actor connection successful!');
    console.log('Backend principal:', testResult.principal);
  } else {
    console.error('❌ Actor connection failed!');
    console.error('Error:', testResult.error);
    
    // Provide debugging suggestions
    console.log('\n=== DEBUGGING SUGGESTIONS ===');
    
    if (testResult.error.includes('canister_not_found')) {
      console.log('1. Ensure your local IC replica is running: "dfx start"');
      console.log('2. Deploy your canisters: "dfx deploy"');
      console.log('3. Check that the hardcoded canister ID matches what dfx generated');
      console.log('   Current hardcoded ID:', CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND);
    }
    
    if (testResult.error.includes('Failed to fetch root key')) {
      console.log('1. Start the local IC replica: "dfx start"');
      console.log('2. Make sure port 4943 is not blocked');
    }
  }
  
  // Test Plug connection if available
  if (window.ic?.plug) {
    console.log('\n=== TESTING PLUG WALLET CONNECTION ===');
    try {
      const isConnected = await window.ic.plug.isConnected();
      console.log('Plug connected:', isConnected);
      
      if (isConnected) {
        const principal = await window.ic.plug.getPrincipal();
        console.log('Plug principal:', principal.toString());
        
        // Test Plug actor creation
        try {
          const plugActor = await getActor(); // This will try to use Plug if connected
          console.log('✅ Plug actor created successfully!');
        } catch (error) {
          console.warn('⚠️ Plug actor creation failed:', error.message);
        }
      }
    } catch (error) {
      console.error('❌ Plug connection test failed:', error.message);
    }
  } else {
    console.log('Plug Wallet not available');
  }

  console.log('=== END DEBUG ===\n');
  return testResult;
};

// Call this function in your component to debug
export const addDebugButton = () => {
  const isDev = import.meta.env.NODE_ENV === 'development' || import.meta.env.DFX_NETWORK === 'local';
  
  if (isDev) {
    // Add debug button to the page
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug Actor Setup';
    debugButton.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      background: #ff6b35;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    debugButton.onclick = debugActorSetup;
    document.body.appendChild(debugButton);
  }
}; 