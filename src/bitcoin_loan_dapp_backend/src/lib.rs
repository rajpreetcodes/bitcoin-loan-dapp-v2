use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Deserialize;
use std::cell::RefCell;
use std::borrow::Cow;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Deserialize, Clone)]
pub struct Loan {
    pub id: u64,
    pub owner: Principal,
    pub collateral_amount: f64,
    pub loan_amount: f64,
    pub created_at: u64,
}

// Implementing Storable for Loan
impl Storable for Loan {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

#[derive(CandidType, Deserialize, Default)]
struct UserProfile {
    btc_address: Option<String>,
}

// Implementing Storable for UserProfile
impl Storable for UserProfile {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 512,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

// Wrapper type for Vec<u64> to avoid orphan rule issues
#[derive(CandidType, Deserialize, Default, Clone)]
struct LoanIds(Vec<u64>);

impl Storable for LoanIds {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Stable storage for loans: (Loan ID -> Loan)
    static LOANS: RefCell<StableBTreeMap<u64, Loan, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))))
    );

    // Stable storage for users: (Principal -> UserProfile)
    static USERS: RefCell<StableBTreeMap<Principal, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))))
    );

    // Stable storage for user loans mapping: (Principal -> LoanIds)
    static USER_LOANS: RefCell<StableBTreeMap<Principal, LoanIds, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))))
    );

    static LOAN_ID_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[ic_cdk::update]
pub fn create_loan(collateral: f64, loan: f64) -> Result<Loan, String> {
    let owner = ic_cdk::caller();
    let loan_id = LOAN_ID_COUNTER.with(|c| { let mut val = c.borrow_mut(); *val += 1; *val });

    let new_loan = Loan { id: loan_id, owner, collateral_amount: collateral, loan_amount: loan, created_at: ic_cdk::api::time() };

    LOANS.with(|p| p.borrow_mut().insert(loan_id, new_loan.clone()));

    USER_LOANS.with(|p| {
        let mut user_loans_map = p.borrow_mut();
        let mut loan_ids = user_loans_map.get(&owner).unwrap_or_default();
        loan_ids.0.push(loan_id);
        user_loans_map.insert(owner, loan_ids);
    });

    Ok(new_loan)
}

#[ic_cdk::update]
pub fn link_btc_address(address: String) -> Result<(), String> {
    let owner = ic_cdk::caller();
    let mut profile = USERS.with(|p| p.borrow().get(&owner).unwrap_or_default());
    profile.btc_address = Some(address);
    USERS.with(|p| p.borrow_mut().insert(owner, profile));
    Ok(())
}

#[ic_cdk::query]
pub fn get_loans() -> Vec<Loan> {
    let owner = ic_cdk::caller();
    USER_LOANS.with(|p| {
        match p.borrow().get(&owner) {
            Some(loan_ids) => LOANS.with(|loans_map| {
                loan_ids.0.iter().filter_map(|id| loans_map.borrow().get(id)).collect()
            }),
            None => vec![],
        }
    })
}

#[ic_cdk::query]
pub fn get_btc_address() -> Option<String> {
    let owner = ic_cdk::caller();
    USERS.with(|p| p.borrow().get(&owner).and_then(|profile| profile.btc_address))
}

#[ic_cdk::query]
pub fn health() -> String { "OK".to_string() }

ic_cdk::export_candid!();
