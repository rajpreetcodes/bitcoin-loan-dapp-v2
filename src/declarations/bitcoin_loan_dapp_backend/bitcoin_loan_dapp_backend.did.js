export const idlFactory = ({ IDL }) => {
  const Loan = IDL.Record({
    'id': IDL.Nat64,
    'owner': IDL.Principal,
    'collateral_amount': IDL.Float64,
    'loan_amount': IDL.Float64,
    'created_at': IDL.Nat64,
  });
  
  const Result_Loan = IDL.Variant({
    'Ok': Loan,
    'Err': IDL.Text,
  });
  
  const Result_1 = IDL.Variant({
    'Ok': IDL.Null,
    'Err': IDL.Text,
  });
  
  return IDL.Service({
    'create_loan': IDL.Func([IDL.Float64, IDL.Float64], [Result_Loan], []),
    'get_loans': IDL.Func([], [IDL.Vec(Loan)], ['query']),
    'get_btc_address': IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'link_btc_address': IDL.Func([IDL.Text], [Result_1], []),
    'health': IDL.Func([], [IDL.Text], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
