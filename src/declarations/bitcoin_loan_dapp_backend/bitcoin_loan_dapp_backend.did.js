export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const LoanStatus = IDL.Variant({ 'Repaid' : IDL.Null, 'Active' : IDL.Null });
  const Loan = IDL.Record({
    'id' : IDL.Nat64,
    'collateral_amount' : IDL.Nat64,
    'status' : LoanStatus,
    'borrower' : IDL.Principal,
    'loan_amount' : IDL.Nat64,
  });
  const LoanReference = IDL.Record({
    'id' : IDL.Nat64,
    'status' : LoanStatus,
    'ipfs_hash' : IDL.Text,
    'borrower' : IDL.Principal,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'create_loan' : IDL.Func([IDL.Nat64, IDL.Nat64], [Result], []),
    'get_linked_btc_address' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'get_loan' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : Loan, 'Err' : IDL.Text })],
        [],
      ),
    'get_loan_refs_by_borrower' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(LoanReference)],
        ['query'],
      ),
    'get_stats' : IDL.Func([], [IDL.Nat64, IDL.Nat64], ['query']),
    'link_btc_address' : IDL.Func([IDL.Text], [Result_1], []),
    'repay_loan' : IDL.Func([IDL.Nat64], [Result_1], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
