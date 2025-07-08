import { Actor, HttpAgent } from "@dfinity/agent";

/**
 * Creates an actor for interacting with a canister.
 * @param {string} canisterId - The ID of the canister.
 * @param {object} idlFactory - The Candid interface for the canister.
 * @param {object} [options] - Optional settings for the actor.
 * @param {object} [options.agentOptions] - Options for the HttpAgent.
 * @returns {import("@dfinity/agent").ActorSubclass<any>}
 */
export const createActor = (canisterId, idlFactory, options = {}) => {
  const host = process.env.DFX_NETWORK === "local" ? "http://127.0.0.1:4943" : "https://icp-api.io";
  
  const agentOptions = options.agentOptions || {};
  
  const agent = new HttpAgent({
    host,
    ...agentOptions,
  });

  // For local development, fetch the root key
  if (process.env.DFX_NETWORK === "local") {
    agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  // Creates an actor with the provided canister ID, interface, and agent.
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
}; 