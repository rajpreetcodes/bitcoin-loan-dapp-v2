import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

// Import the canister declarations (these are auto-generated)
import { idlFactory } from '../../declarations/bitcoin_loan_dapp_backend';
import { canisterId } from '../../declarations/bitcoin_loan_dapp_backend';

let actor = null;

// Create an unauthenticated actor (for public queries if needed)
export const createActor = async () => {
  const agent = new HttpAgent({
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  });

  // When running locally, fetch root key
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};

// Create an authenticated actor using the user's identity
export const createAuthenticatedActor = async () => {
  const authClient = await AuthClient.create();
  
  if (!await authClient.isAuthenticated()) {
    throw new Error("User is not authenticated");
  }

  const identity = authClient.getIdentity();
  const agent = new HttpAgent({
    identity,
    host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://localhost:4943",
  });

  // When running locally, fetch root key
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  const authenticatedActor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  return authenticatedActor;
};

// Get the current actor instance (authenticated if user is logged in)
export const getActor = async () => {
  if (!actor) {
    try {
      actor = await createAuthenticatedActor();
    } catch (error) {
      console.warn("Failed to create authenticated actor, using unauthenticated:", error);
      actor = await createActor();
    }
  }
  return actor;
};

// Reset actor (call this after login/logout)
export const resetActor = () => {
  actor = null;
}; 