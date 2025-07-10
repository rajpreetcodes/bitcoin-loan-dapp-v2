import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Loan {
  'id' : bigint,
  'owner' : Principal,
  'collateral_amount' : number,
  'loan_amount' : number,
  'created_at' : bigint,
}

export type Result_1 = { 'Ok' : null } |
  { 'Err' : string };

export type Result_Loan = { 'Ok' : Loan } |
  { 'Err' : string };

export interface _SERVICE {
  'create_loan' : ActorMethod<[number, number], Result_Loan>,
  'get_loans' : ActorMethod<[], Array<Loan>>,
  'get_btc_address' : ActorMethod<[], [] | [string]>,
  'link_btc_address' : ActorMethod<[string], Result_1>,
  'health' : ActorMethod<[], string>,
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
