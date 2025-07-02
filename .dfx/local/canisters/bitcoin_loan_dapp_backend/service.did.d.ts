import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Loan {
  'id' : bigint,
  'collateral_amount' : bigint,
  'status' : LoanStatus,
  'borrower' : Principal,
  'loan_amount' : bigint,
}
export interface LoanReference {
  'id' : bigint,
  'status' : LoanStatus,
  'ipfs_hash' : string,
  'borrower' : Principal,
}
export type LoanStatus = { 'Repaid' : null } |
  { 'Active' : null };
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : null } |
  { 'Err' : string };
export interface _SERVICE {
  'create_loan' : ActorMethod<[bigint, bigint], Result>,
  'get_linked_btc_address' : ActorMethod<[], [] | [string]>,
  'get_loan' : ActorMethod<[bigint], { 'Ok' : Loan } | { 'Err' : string }>,
  'get_loan_refs_by_borrower' : ActorMethod<[Principal], Array<LoanReference>>,
  'get_stats' : ActorMethod<[], [bigint, bigint]>,
  'link_btc_address' : ActorMethod<[string], Result_1>,
  'repay_loan' : ActorMethod<[bigint], Result_1>,
  'whoami' : ActorMethod<[], Principal>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
