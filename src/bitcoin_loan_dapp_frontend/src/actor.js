import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

// Import the canister declarations (these are auto-generated)
import { idlFactory } from '../../declarations/bitcoin_loan_dapp_backend';

// PRODUCTION-READY ENVIRONMENT CONFIGURATION
const ENV_CONFIG = {
  development: {
    host: "http://127.0.0.1:4943",
    identityProvider: "http://127.0.0.1:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai"
  },
  local: {
    host: "http://127.0.0.1:4943", 
    identityProvider: "http://127.0.0.1:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai"
  },
  ic: {
    host: "https://ic0.app",
    identityProvider: "https://identity.ic0.app"
  }
};

// PRODUCTION-READY CANISTER IDS WITH FALLBACK
const CANISTER_IDS = {
  BITCOIN_LOAN_DAPP_BACKEND: 
    process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND || 
    import.meta.env.VITE_CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND ||
    "uxrrr-q7777-77774-qaaaq-cai", // Fallback hardcoded ID
  INTERNET_IDENTITY: 
    process.env.CANISTER_ID_INTERNET_IDENTITY || 
    import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY ||
    "uzt4z-lp777-77774-qaabq-cai", // Fallback hardcoded ID
  BITCOIN_LOAN_DAPP_FRONTEND: 
    process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_FRONTEND || 
    import.meta.env.VITE_CANISTER_ID_BITCOIN_LOAN_DAPP_FRONTEND ||
    "u6s2n-gx777-77774-qaaba-cai", // Fallback hardcoded ID
};

// DEBUG: Log canister IDs for troubleshooting
console.log("🔍 CANISTER ID DEBUG INFO:");
console.log("- Backend Canister ID:", CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND);
console.log("- Internet Identity ID:", CANISTER_IDS.INTERNET_IDENTITY);
console.log("- Frontend Canister ID:", CANISTER_IDS.BITCOIN_LOAN_DAPP_FRONTEND);
console.log("- Environment Variables:");
console.log("  - Backend from env:", process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND);
console.log("  - Backend from vite:", import.meta.env.VITE_CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND);

// Environment detection
const getEnvironment = () => {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'local';
    }
  }
  return import.meta.env?.DFX_NETWORK === 'ic' ? 'ic' : 'local';
};

const CURRENT_ENV = getEnvironment();
const CONFIG = ENV_CONFIG[CURRENT_ENV];

console.log("🚀 Production Actor Configuration:");
console.log("- Environment:", CURRENT_ENV);
console.log("- Host:", CONFIG.host);
console.log("- Backend Canister:", CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND);
console.log("- II Canister:", CANISTER_IDS.INTERNET_IDENTITY);

let actor = null;
let authClient = null;

// PRODUCTION-READY AGENT CREATION
const createAgent = async (identity = null) => {
  console.log("🔧 Creating agent with host:", CONFIG.host);
  
  const agentOptions = {
    host: CONFIG.host,
    ...(identity && { identity })
  };
  
  const agent = new HttpAgent(agentOptions);
  
  // Fetch root key for local development
  if (CURRENT_ENV !== 'ic') {
    console.log("🔑 Fetching root key for local development...");
    try {
      await agent.fetchRootKey();
      console.log("✅ Root key fetched successfully");
    } catch (err) {
      console.error("❌ Failed to fetch root key:", err);
      throw new Error(`Failed to connect to local IC replica at ${CONFIG.host}. Make sure 'dfx start' is running.`);
    }
  }
  
  return agent;
};

// UNAUTHENTICATED ACTOR - PRODUCTION READY
export const createActor = async () => {
  try {
    console.log("🎭 Creating unauthenticated actor...");
    const agent = await createAgent();
    
    const actorInstance = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND,
    });
    
    console.log("✅ Unauthenticated actor created successfully");
    return actorInstance;
  } catch (error) {
    console.error("❌ Failed to create unauthenticated actor:", error);
    throw error;
  }
};

// INTERNET IDENTITY ACTOR - PRODUCTION READY  
export const createAuthenticatedActorII = async () => {
  try {
    if (!authClient) {
      authClient = await AuthClient.create();
    }

    const isAuthenticated = await authClient.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error("User not authenticated with Internet Identity");
    }

    console.log("🆔 Creating Internet Identity authenticated actor...");
  const identity = authClient.getIdentity();
    const agent = await createAgent(identity);

    const actorInstance = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND,
    });

    console.log("✅ Internet Identity actor created successfully");
    return actorInstance;
  } catch (error) {
    console.error("❌ Failed to create II actor:", error);
    throw error;
  }
};

// PLUG WALLET ACTOR - PRODUCTION READY WITH AGGRESSIVE HOST FIX
export const createAuthenticatedActorPlug = async () => {
  try {
    if (!window.ic?.plug) {
      throw new Error("Plug Wallet not installed");
    }

    // FOCUSED PLUG WALLET DEBUG - DIRECT ENVIRONMENT VARIABLE USAGE
    const backendCanisterId = import.meta.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND || 
                              process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND || 
                              "uxrrr-q7777-77774-qaaaq-cai";

    console.log("--- PLUG ACTOR DEBUG ---");
    console.log("Using Backend Canister ID for Whitelist & Actor:", backendCanisterId);
    console.log("Host:", CONFIG.host);
    console.log("Environment variables:");
    console.log("------------------------");

    console.log("🔌 Creating Plug Wallet actor...");
    console.log("- Force disconnecting Plug to clear cache...");
    
    // AGGRESSIVE DISCONNECT TO CLEAR WRONG HOST CACHE
    try {
      await window.ic.plug.disconnect();
      // Wait a moment for disconnect to complete
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      console.log("- Disconnect not needed or failed:", e.message);
    }

    // FORCE RECONNECT WITH CORRECT HOST - MULTIPLE ATTEMPTS
    console.log("- Reconnecting with correct host:", CONFIG.host);
    
    let connected = false;
    const maxAttempts = 3;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`- Connection attempt ${attempt}/${maxAttempts}`);
        
        connected = await window.ic.plug.requestConnect({
          whitelist: [backendCanisterId],
          host: CONFIG.host,
          timeout: 30000, // 30 second timeout
        });
        
        if (connected) {
          console.log("✅ Plug Wallet connected successfully");
          break;
        }
      } catch (connectError) {
        console.warn(`- Connection attempt ${attempt} failed:`, connectError.message);
        if (attempt === maxAttempts) {
          throw new Error(`Failed to connect to Plug Wallet after ${maxAttempts} attempts`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
      }
    }

    if (!connected) {
      throw new Error("Failed to connect to Plug Wallet");
    }

    // VERIFY CONNECTION AND HOST
    try {
      const isConnected = await window.ic.plug.isConnected();
      console.log("- Plug connection verified:", isConnected);
      
      if (window.ic.plug.agent) {
        console.log("- Plug agent host:", window.ic.plug.agent._host?.toString() || "unknown");
      }
    } catch (e) {
      console.warn("- Connection verification failed:", e.message);
    }

    // CREATE ACTOR WITH EXPLICIT HOST AND RETRY MECHANISM
    console.log("- Creating Plug actor with canister:", backendCanisterId);
    
    let plugActor = null;
    const maxActorAttempts = 2;
    
    for (let attempt = 1; attempt <= maxActorAttempts; attempt++) {
      try {
        console.log(`- Actor creation attempt ${attempt}/${maxActorAttempts}`);
        
        plugActor = await window.ic.plug.createActor({
          canisterId: backendCanisterId,
          interfaceFactory: idlFactory,
          host: CONFIG.host, // Force correct host again
        });
        
        if (plugActor) {
          console.log("✅ Plug Wallet actor created successfully");
          break;
        }
      } catch (actorError) {
        console.warn(`- Actor creation attempt ${attempt} failed:`, actorError.message);
        if (attempt === maxActorAttempts) {
          throw new Error(`Failed to create Plug actor after ${maxActorAttempts} attempts: ${actorError.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
      }
    }

    if (!plugActor) {
      throw new Error("Failed to create Plug Wallet actor");
    }

    return plugActor;
  } catch (error) {
    console.error("❌ Failed to create Plug actor:", error);
    throw error;
  }
};

// SMART ACTOR CREATION - PRODUCTION READY
export const createAuthenticatedActor = async (authMethod = null) => {
  try {
    if (authMethod === 'internet_identity') {
      return await createAuthenticatedActorII();
    } else if (authMethod === 'plug_wallet') {
      return await createAuthenticatedActorPlug();
    } else {
      // Auto-detect authentication method
      console.log("🔍 Auto-detecting authentication method...");
      
      // Check Internet Identity first
      if (!authClient) {
        authClient = await AuthClient.create();
      }
      
      const isIIAuthenticated = await authClient.isAuthenticated();
      if (isIIAuthenticated) {
        console.log("🆔 Auto-detected Internet Identity");
        return await createAuthenticatedActorII();
      }
      
      // Check Plug Wallet
      if (window.ic?.plug) {
        try {
          const isPlugConnected = await window.ic.plug.isConnected();
          if (isPlugConnected) {
            console.log("🔌 Auto-detected Plug Wallet");
            return await createAuthenticatedActorPlug();
          }
        } catch (e) {
          console.warn("Plug detection failed:", e);
        }
      }
      
      throw new Error("No authentication method detected");
    }
  } catch (error) {
    console.error("❌ Failed to create authenticated actor:", error);
    throw error;
  }
};

// MAIN ACTOR GETTER - PRODUCTION READY WITH FALLBACKS
export const getActor = async (authMethod = null) => {
  console.log("📞 getActor called, environment:", CURRENT_ENV);
  
  if (!actor) {
    console.log("🔄 Creating new actor instance...");
    try {
      // Try authenticated first
      actor = await createAuthenticatedActor(authMethod);
      console.log("✅ Authenticated actor ready");
    } catch (authError) {
      console.warn("⚠️ Auth failed, falling back to unauthenticated:", authError.message);
      try {
        // Fallback to unauthenticated
      actor = await createActor();
        console.log("✅ Unauthenticated actor ready");
      } catch (fallbackError) {
        console.error("❌ All actor creation methods failed:", fallbackError);
        throw new Error(`Cannot connect to backend: ${fallbackError.message}`);
      }
    }
  } else {
    console.log("♻️ Using existing actor");
  }
  
  return actor;
};

// RESET FUNCTION - PRODUCTION READY
export const resetActor = () => {
  console.log("🔄 Resetting actor and auth client");
  actor = null;
  authClient = null;
};

// HEALTH CHECK - PRODUCTION READY
export const healthCheck = async () => {
  try {
    console.log("🏥 Performing health check...");
    const testActor = await createActor();
    const result = await testActor.whoami();
    console.log("✅ Health check passed, backend principal:", result.toString());
    return { success: true, principal: result.toString() };
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return { success: false, error: error.message };
  }
};

// EXPORTS - PRODUCTION READY
export { CANISTER_IDS, CONFIG, CURRENT_ENV }; 