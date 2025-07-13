import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../declarations/bitcoin_loan_dapp_backend/bitcoin_loan_dapp_backend.did.js';
import { BACKEND_CANISTER_ID, HOST } from './config';

/**
 * Creates an unauthenticated actor for the backend canister.
 */
export function createActor() {
  const agent = new HttpAgent({ host: HOST });
  if (HOST.includes('localhost') || HOST.includes('127.0.0.1')) {
    agent.fetchRootKey().catch(e => console.warn('Unable to fetch root key. Are you running locally?', e));
  }
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: BACKEND_CANISTER_ID,
  });
}

/**
 * Creates an authenticated actor for the backend canister using II identity.
 * @param {import('@dfinity/agent').Identity} identity
 */
export function createAuthenticatedActor(identity) {
  const agent = new HttpAgent({ host: HOST, identity });
  if (HOST.includes('localhost') || HOST.includes('127.0.0.1')) {
    agent.fetchRootKey().catch(e => console.warn('Unable to fetch root key. Are you running locally?', e));
  }
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: BACKEND_CANISTER_ID,
  });
} 