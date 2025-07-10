import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

// Import the canister declarations (these are auto-generated)
import { idlFactory } from '../../declarations/bitcoin_loan_dapp_backend';

// Import from our config file
import { HOST, BACKEND_CANISTER_ID, IDENTITY_PROVIDER_URL } from './config';

// PRODUCTION-READY ENVIRONMENT CONFIGURATION
const ENV_CONFIG = {
  development: {
    host: "http://127.0.0.1:4943",
    identityProvider: "http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
  },
  local: {
    host: HOST,
    identityProvider: IDENTITY_PROVIDER_URL
  },
  ic: {
    host: "https://icp-api.io",
    identityProvider: "https://identity.ic0.app"
  }
};

// Get environment
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
      canisterId: BACKEND_CANISTER_ID,
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
      canisterId: BACKEND_CANISTER_ID,
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

    // Explicitly set the host for Plug wallet
    if (!window.ic.plug._host) {
      window.ic.plug._host = HOST;
    }

    // Disconnect to clear any cached state
    try {
      if (await window.ic.plug.isConnected()) {
        await window.ic.plug.disconnect();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (e) {
      console.log("Disconnect not needed or failed:", e.message);
    }

    // Connect with correct host - explicitly set
    const connected = await window.ic.plug.requestConnect({
      whitelist: [BACKEND_CANISTER_ID],
      host: HOST,
    });

    if (!connected) {
      throw new Error("Failed to connect to Plug Wallet");
    }

    // Create agent with explicit host
    if (!window.ic.plug.agent) {
      await window.ic.plug.createAgent({
        whitelist: [BACKEND_CANISTER_ID],
        host: HOST
      });
    }

    // Create actor with explicit host
    const plugActor = await window.ic.plug.createActor({
      canisterId: BACKEND_CANISTER_ID,
      interfaceFactory: idlFactory,
      host: HOST,
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