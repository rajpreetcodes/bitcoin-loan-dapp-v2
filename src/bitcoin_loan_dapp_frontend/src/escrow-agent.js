import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { createActor } from "./agent";
import { HOST, DFX_NETWORK } from "./config";
import { AuthClient } from "@dfinity/auth-client";

// Local canister ID from dfx.json
const canisterId = process.env.BITCOIN_ESCROW_CANISTER_CANISTER_ID;

// Define the IDL factory directly
function createIdlFactory() {
  return ({ IDL }) => {
    const EscrowId = IDL.Nat64;
    const BtcAddress = IDL.Text;
    const EscrowStatus = IDL.Variant({
      'Pending' : IDL.Null,
      'Locked' : IDL.Null,
      'Released' : IDL.Null,
      'Refunded' : IDL.Null,
    });
    const Escrow = IDL.Record({
      'id' : EscrowId,
      'borrower' : IDL.Principal,
      'lender' : IDL.Principal,
      'btc_collateral_address' : BtcAddress,
      'collateral_amount' : IDL.Float64,
      'loan_amount' : IDL.Float64,
      'created_at' : IDL.Nat64,
      'status' : EscrowStatus,
      'release_time' : IDL.Opt(IDL.Nat64),
    });
    const Result_Bool = IDL.Variant({
      'Ok' : IDL.Bool,
      'Err' : IDL.Text,
    });
    const Result_EscrowId = IDL.Variant({
      'Ok' : EscrowId,
      'Err' : IDL.Text,
    });
    const Result_Escrow = IDL.Variant({
      'Ok' : Escrow,
      'Err' : IDL.Text,
    });
    return IDL.Service({
      'create_escrow' : IDL.Func([IDL.Principal, IDL.Text, IDL.Float64, IDL.Float64], [Result_EscrowId], []),
      'get_borrower_escrows' : IDL.Func([], [IDL.Vec(Escrow)], ['query']),
      'get_escrow' : IDL.Func([EscrowId], [Result_Escrow], ['query']),
      'get_lender_escrows' : IDL.Func([], [IDL.Vec(Escrow)], ['query']),
      'lock_escrow' : IDL.Func([EscrowId], [Result_Bool], []),
      'refund_escrow' : IDL.Func([EscrowId], [Result_Bool], []),
      'release_escrow' : IDL.Func([EscrowId], [Result_Bool], []),
    });
  };
}

// Get the authenticated agent
async function getAuthenticatedAgent() {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();
  
  const agent = new HttpAgent({
    host: HOST,
    identity
  });
  
  // When developing locally, we need to fetch the root key
  if (DFX_NETWORK === 'local') {
    try {
      await agent.fetchRootKey();
    } catch (err) {
      console.warn("Unable to fetch root key. Check if your local replica is running");
      console.error(err);
    }
  }
  
  return agent;
}

export async function getEscrowActor() {
  const agent = await getAuthenticatedAgent();
  return Actor.createActor(createIdlFactory(), {
    agent,
    canisterId,
  });
}

// Create a new escrow
export async function createEscrow(lenderPrincipal, btcAddress, collateralAmount, loanAmount) {
  const actor = await getEscrowActor();
  try {
    const result = await actor.create_escrow(
      Principal.fromText(lenderPrincipal),
      btcAddress,
      Number(collateralAmount),
      Number(loanAmount)
    );
    return result;
  } catch (error) {
    console.error("Error creating escrow:", error);
    throw error;
  }
}

// Lock an escrow (called by lender)
export async function lockEscrow(escrowId) {
  const actor = await getEscrowActor();
  try {
    const result = await actor.lock_escrow(BigInt(escrowId));
    return result;
  } catch (error) {
    console.error("Error locking escrow:", error);
    throw error;
  }
}

// Release an escrow (called by borrower)
export async function releaseEscrow(escrowId) {
  const actor = await getEscrowActor();
  try {
    const result = await actor.release_escrow(BigInt(escrowId));
    return result;
  } catch (error) {
    console.error("Error releasing escrow:", error);
    throw error;
  }
}

// Refund an escrow (called by lender)
export async function refundEscrow(escrowId) {
  const actor = await getEscrowActor();
  try {
    const result = await actor.refund_escrow(BigInt(escrowId));
    return result;
  } catch (error) {
    console.error("Error refunding escrow:", error);
    throw error;
  }
}

// Get a specific escrow
export async function getEscrow(escrowId) {
  const actor = await getEscrowActor();
  try {
    const result = await actor.get_escrow(BigInt(escrowId));
    return result;
  } catch (error) {
    console.error("Error getting escrow:", error);
    throw error;
  }
}

// Get all escrows where the caller is the borrower
export async function getBorrowerEscrows() {
  const actor = await getEscrowActor();
  try {
    const result = await actor.get_borrower_escrows();
    return result;
  } catch (error) {
    console.error("Error getting borrower escrows:", error);
    throw error;
  }
}

// Get all escrows where the caller is the lender
export async function getLenderEscrows() {
  const actor = await getEscrowActor();
  try {
    const result = await actor.get_lender_escrows();
    return result;
  } catch (error) {
    console.error("Error getting lender escrows:", error);
    throw error;
  }
} 