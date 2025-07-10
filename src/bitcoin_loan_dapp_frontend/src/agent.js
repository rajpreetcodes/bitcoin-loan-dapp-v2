import { Actor, HttpAgent } from "@dfinity/agent";
import { HOST, DFX_NETWORK } from "./config"; // Import from our new config file

/**
 * Creates an actor for interacting with a canister.
 * @param {string} canisterId - The ID of the canister.
 * @param {object} idlFactory - The Candid interface for the canister.
 * @param {object} [options] - Optional settings for the actor.
 * @param {object} [options.agentOptions] - Options for the HttpAgent.
 * @returns {import("@dfinity/agent").ActorSubclass<any>}
 */
export const createActor = (canisterId, idlFactory, options = {}) => {
  const agent = new HttpAgent({
    host: HOST,
    ...options.agentOptions,
  });

  if (DFX_NETWORK === "local") {
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