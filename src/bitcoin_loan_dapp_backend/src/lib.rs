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
    if collateral <= 0.0 || loan <= 0.0 {
        return Err("Collateral and loan amounts must be positive".to_string());
    }

    let owner = ic_cdk::caller();
    let loan_id = LOAN_ID_COUNTER.with(|c| { let mut val = c.borrow_mut(); *val += 1; *val });

    let new_loan = Loan { 
        id: loan_id, 
        owner, 
        collateral_amount: collateral, 
        loan_amount: loan, 
        created_at: ic_cdk::api::time() 
    };

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
    if address.trim().is_empty() {
        return Err("Bitcoin address cannot be empty".to_string());
    }

    // Enhanced Bitcoin address validation for different formats
    let validation_result = validate_btc_address(&address);
    if let Err(msg) = validation_result {
        return Err(msg);
    }

    let owner = ic_cdk::caller();
    let profile = UserProfile {
        btc_address: Some(address.clone())
    };
    
    USERS.with(|p| {
        let mut users = p.borrow_mut();
        users.insert(owner, profile);
    });
    
    Ok(())
}

// Helper function to validate Bitcoin addresses
fn validate_btc_address(address: &str) -> Result<(), String> {
    // Basic format check
    if address.trim().is_empty() {
        return Err("Bitcoin address cannot be empty".to_string());
    }

    // Identify the address type
    let address_type = identify_btc_address_type(address);
    
    match address_type {
        BtcAddressType::Invalid => {
            return Err("Invalid Bitcoin address format. Must be a valid BTC address".to_string());
        },
        _ => {
            // Proceed with additional validation based on the address type
            validate_address_by_type(address, address_type)
        }
    }
}

// Enum to represent different Bitcoin address types
enum BtcAddressType {
    Legacy,
    ScriptHash,
    Bech32,
    Taproot,
    TestnetLegacy,
    TestnetScript,
    TestnetBech32,
    TestnetTaproot,
    Invalid,
}

// Function to identify the Bitcoin address type
fn identify_btc_address_type(address: &str) -> BtcAddressType {
    // Check for empty address
    if address.trim().is_empty() {
        return BtcAddressType::Invalid;
    }
    
    // Identify by prefix
    if address.starts_with("1") {
        BtcAddressType::Legacy
    } else if address.starts_with("3") {
        BtcAddressType::ScriptHash
    } else if address.starts_with("bc1q") {
        BtcAddressType::Bech32
    } else if address.starts_with("bc1p") {
        BtcAddressType::Taproot
    } else if address.starts_with("m") || address.starts_with("n") {
        BtcAddressType::TestnetLegacy
    } else if address.starts_with("2") {
        BtcAddressType::TestnetScript
    } else if address.starts_with("tb1q") {
        BtcAddressType::TestnetBech32
    } else if address.starts_with("tb1p") {
        BtcAddressType::TestnetTaproot
    } else {
        // Special case: Check if it's a bc1 address that doesn't follow the exact format
        if address.starts_with("bc1") {
            // If it starts with bc1 but not followed by 'q' or 'p', it's invalid
            // This catches cases like "bc1snafas" which are invalid
            return BtcAddressType::Invalid;
        }
        
        BtcAddressType::Invalid
    }
}

// Function to validate address based on its type
fn validate_address_by_type(address: &str, address_type: BtcAddressType) -> Result<(), String> {
    // Length validation based on format
    let valid_length = match address_type {
        BtcAddressType::Legacy | BtcAddressType::ScriptHash | 
        BtcAddressType::TestnetLegacy | BtcAddressType::TestnetScript => {
            // Legacy or P2SH (mainnet or testnet)
            address.len() >= 26 && address.len() <= 34
        },
        BtcAddressType::Bech32 | BtcAddressType::TestnetBech32 => {
            // Bech32 SegWit (mainnet or testnet)
            address.len() >= 42 && address.len() <= 62
        },
        BtcAddressType::Taproot | BtcAddressType::TestnetTaproot => {
            // Taproot (mainnet or testnet)
            address.len() >= 62 && address.len() <= 64
        },
        BtcAddressType::Invalid => false,
    };

    if !valid_length {
        return Err("Invalid Bitcoin address length for the given format".to_string());
    }

    // Character set validation
    let valid_chars = match address_type {
        BtcAddressType::Legacy | BtcAddressType::ScriptHash | 
        BtcAddressType::TestnetLegacy | BtcAddressType::TestnetScript => {
            // Base58 character set for legacy addresses
            address.chars().all(|c| "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".contains(c))
        },
        BtcAddressType::Bech32 | BtcAddressType::Taproot | 
        BtcAddressType::TestnetBech32 | BtcAddressType::TestnetTaproot => {
            // Bech32 character set
            address.chars().all(|c| "0123456789abcdefghijklmnopqrstuvwxyz".contains(c))
        },
        BtcAddressType::Invalid => false,
    };

    if !valid_chars {
        return Err("Bitcoin address contains invalid characters".to_string());
    }

    // Additional validation for Bech32 addresses
    match address_type {
        BtcAddressType::Bech32 | BtcAddressType::TestnetBech32 | 
        BtcAddressType::Taproot | BtcAddressType::TestnetTaproot => {
            // Bech32 addresses must have a 1 as the separator after the human-readable part
            if !address.contains('1') {
                return Err("Invalid Bech32 address format: missing separator".to_string());
            }
            
            // For bc1 addresses, the format should be bc1 + separator + data part
            // The data part should be at least 6 characters
            let parts: Vec<&str> = address.split('1').collect();
            if parts.len() < 2 || parts[1].len() < 6 {
                return Err("Invalid Bech32 address format: data part too short".to_string());
            }
        },
        _ => {}
    }

    // Note: For production, consider adding checksum validation or using a Bitcoin library
    
    Ok(())
}

#[ic_cdk::query]
fn get_loans() -> Vec<Loan> {
    let caller = ic_cdk::caller();
    
    LOANS.with(|loans| {
        let loans_ref = loans.borrow();
        loans_ref.iter()
            .filter(|(_, loan)| loan.owner == caller)
            .map(|(_, loan)| loan.clone())
            .collect()
    })
}

#[ic_cdk::query]
fn get_btc_address() -> Option<String> {
    let caller = ic_cdk::caller();
    
    USERS.with(|users| {
        let users_ref = users.borrow();
        users_ref.get(&caller).and_then(|profile| profile.btc_address.clone())
    })
}

#[ic_cdk::query]
fn health() -> String {
    "OK".to_string()
}

ic_cdk::export_candid!();
