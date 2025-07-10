import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Loan {
  'id' : bigint,
  'collateral_amount' : number,
  'owner' : Principal,
  'created_at' : bigint,
  'loan_amount' : number,
}
export type Result_1 = { 'Ok' : null } |
  { 'Err' : string };
export type Result_Loan = { 'Ok' : Loan } |
  { 'Err' : string };
export interface _SERVICE {
  'create_loan' : ActorMethod<[number, number], Result_Loan>,
  'get_btc_address' : ActorMethod<[], [] | [string]>,
  'get_loans' : ActorMethod<[], Array<Loan>>,
  'health' : ActorMethod<[], string>,
  'link_btc_address' : ActorMethod<[string], Result_1>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
