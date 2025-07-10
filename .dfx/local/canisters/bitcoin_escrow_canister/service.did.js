export const idlFactory = ({ IDL }) => {
  const EscrowId = IDL.Nat64;
  const Result_EscrowId = IDL.Variant({ 'Ok' : EscrowId, 'Err' : IDL.Text });
  const EscrowStatus = IDL.Variant({
    'pending' : IDL.Null,
    'refunded' : IDL.Null,
    'locked' : IDL.Null,
    'released' : IDL.Null,
  });
  const BtcAddress = IDL.Text;
  const Escrow = IDL.Record({
    'id' : EscrowId,
    'collateral_amount' : IDL.Float64,
    'status' : EscrowStatus,
    'release_time' : IDL.Opt(IDL.Nat64),
    'btc_collateral_address' : BtcAddress,
    'created_at' : IDL.Nat64,
    'borrower' : IDL.Principal,
    'loan_amount' : IDL.Float64,
    'lender' : IDL.Principal,
  });
  const Result_Escrow = IDL.Variant({ 'Ok' : Escrow, 'Err' : IDL.Text });
  const Result_Bool = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  return IDL.Service({
    'create_escrow' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Float64, IDL.Float64],
        [Result_EscrowId],
        [],
      ),
    'get_borrower_escrows' : IDL.Func([], [IDL.Vec(Escrow)], ['query']),
    'get_escrow' : IDL.Func([EscrowId], [Result_Escrow], ['query']),
    'get_lender_escrows' : IDL.Func([], [IDL.Vec(Escrow)], ['query']),
    'lock_escrow' : IDL.Func([EscrowId], [Result_Bool], []),
    'refund_escrow' : IDL.Func([EscrowId], [Result_Bool], []),
    'release_escrow' : IDL.Func([EscrowId], [Result_Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
