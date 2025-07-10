export const idlFactory = ({ IDL }) => {
  const Loan = IDL.Record({
    'id' : IDL.Nat64,
    'collateral_amount' : IDL.Float64,
    'owner' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'loan_amount' : IDL.Float64,
  });
  const Result_Loan = IDL.Variant({ 'Ok' : Loan, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'create_loan' : IDL.Func([IDL.Float64, IDL.Float64], [Result_Loan], []),
    'get_btc_address' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'get_loans' : IDL.Func([], [IDL.Vec(Loan)], ['query']),
    'health' : IDL.Func([], [IDL.Text], ['query']),
    'link_btc_address' : IDL.Func([IDL.Text], [Result_1], []),
  });
};
export const init = ({ IDL }) => { return []; };
