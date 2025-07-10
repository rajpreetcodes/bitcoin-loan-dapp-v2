import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

// Import the canister declarations (these are auto-generated)
import { idlFactory } from '../../declarations/bitcoin_loan_dapp_backend';

// PRODUCTION-READY ENVIRONMENT CONFIGURATION
const ENV_CONFIG = {
  development: {
    host: "http://127.0.0.1:4943",
    identityProvider: "http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
  },
  local: {
    host: "http://127.0.0.1:4943", 
    identityProvider: "http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
  },
  ic: {
    host: "https://icp-api.io",
    identityProvider: "https://identity.ic0.app"
  }
};

// Get canister IDs from .dfx/local/canister_ids.json
const CANISTER_IDS = {
  BITCOIN_LOAN_DAPP_BACKEND: 
    process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND || 
    import.meta.env.VITE_CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND ||
    "uxrrr-q7777-77774-qaaaq-cai", // Fallback hardcoded ID - update with your actual local ID
  INTERNET_IDENTITY: 
    process.env.CANISTER_ID_INTERNET_IDENTITY || 
    import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY ||
    "rdmx6-jaaaa-aaaaa-aaadq-cai", // Use standard II canister ID
  BITCOIN_LOAN_DAPP_FRONTEND: 
    process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_FRONTEND || 
    import.meta.env.VITE_CANISTER_ID_BITCOIN_LOAN_DAPP_FRONTEND ||
    "u6s2n-gx777-77774-qaaba-cai", // Fallback hardcoded ID
};

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

// PRODUCTION-READY AGENT CREATION
const createAgent = async (identity = null) => {
  const agentOptions = {
    host: CONFIG.host,
    ...(identity && { identity })
  };
  
  const agent = new HttpAgent(agentOptions);
  
  // Fetch root key for local development
  if (CURRENT_ENV !== 'ic') {
    try {
      await agent.fetchRootKey();
    } catch (err) {
      console.error("Failed to fetch root key:", err);
      throw new Error(`Failed to connect to local IC replica at ${CONFIG.host}. Make sure 'dfx start' is running.`);
    }
  }
  
  return agent;
};

// UNAUTHENTICATED ACTOR - PRODUCTION READY
export const createActor = async () => {
  try {
    const agent = await createAgent();
    
    const actorInstance = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND,
    });
    
    return actorInstance;
  } catch (error) {
    console.error("Failed to create unauthenticated actor:", error);
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

    const identity = authClient.getIdentity();
    const agent = await createAgent(identity);

    const actorInstance = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND,
    });

    return actorInstance;
  } catch (error) {
    console.error("Failed to create II actor:", error);
    throw error;
  }
};

// PLUG WALLET ACTOR - PRODUCTION READY
export const createAuthenticatedActorPlug = async () => {
  try {
    if (!window.ic?.plug) {
      throw new Error("Plug Wallet not installed");
    }

    const backendCanisterId = CANISTER_IDS.BITCOIN_LOAN_DAPP_BACKEND;

    // Disconnect to clear any cached state
    try {
      if (await window.ic.plug.isConnected()) {
        await window.ic.plug.disconnect();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (e) {
      console.log("Disconnect not needed or failed:", e.message);
    }

    // Connect with correct host
    const connected = await window.ic.plug.requestConnect({
      whitelist: [backendCanisterId],
      host: CONFIG.host,
    });

    if (!connected) {
      throw new Error("Failed to connect to Plug Wallet");
    }

    // Create actor
    const plugActor = await window.ic.plug.createActor({
      canisterId: backendCanisterId,
      interfaceFactory: idlFactory,
      host: CONFIG.host,
    });

    if (!plugActor) {
      throw new Error("Failed to create Plug Wallet actor");
    }

    return plugActor;
  } catch (error) {
    console.error("Failed to create Plug actor:", error);
    throw error;
  }
};

// UNIFIED ACTOR CREATION
export const createAuthenticatedActor = async (authMethod = null) => {
  if (authMethod === 'plug') {
    return createAuthenticatedActorPlug();
  } else {
    return createAuthenticatedActorII();
  }
};

// SINGLETON ACTOR GETTER
let actor = null;
let authClient = null;

export const getActor = async (authMethod = null) => {
  if (!actor) {
    try {
      actor = await createAuthenticatedActor(authMethod);
    } catch (error) {
      console.error("Failed to get authenticated actor:", error);
      throw error;
    }
  }
  return actor;
};

export const resetActor = () => {
  actor = null;
};

// HEALTH CHECK
export const healthCheck = async () => {
  try {
    const testActor = await createActor();
    const health = await testActor.health();
    return health === "OK";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}; 