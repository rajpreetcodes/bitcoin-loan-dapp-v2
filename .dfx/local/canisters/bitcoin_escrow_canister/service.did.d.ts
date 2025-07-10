import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BtcAddress = string;
export interface Escrow {
  'id' : EscrowId,
  'collateral_amount' : number,
  'status' : EscrowStatus,
  'release_time' : [] | [bigint],
  'btc_collateral_address' : BtcAddress,
  'created_at' : bigint,
  'borrower' : Principal,
  'loan_amount' : number,
  'lender' : Principal,
}
export type EscrowId = bigint;
export type EscrowStatus = { 'pending' : null } |
  { 'refunded' : null } |
  { 'locked' : null } |
  { 'released' : null };
export type Result_Bool = { 'Ok' : boolean } |
  { 'Err' : string };
export type Result_Escrow = { 'Ok' : Escrow } |
  { 'Err' : string };
export type Result_EscrowId = { 'Ok' : EscrowId } |
  { 'Err' : string };
export interface _SERVICE {
  'create_escrow' : ActorMethod<
    [Principal, string, number, number],
    Result_EscrowId
  >,
  'get_borrower_escrows' : ActorMethod<[], Array<Escrow>>,
  'get_escrow' : ActorMethod<[EscrowId], Result_Escrow>,
  'get_lender_escrows' : ActorMethod<[], Array<Escrow>>,
  'lock_escrow' : ActorMethod<[EscrowId], Result_Bool>,
  'refund_escrow' : ActorMethod<[EscrowId], Result_Bool>,
  'release_escrow' : ActorMethod<[EscrowId], Result_Bool>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
