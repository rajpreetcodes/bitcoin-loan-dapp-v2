use candid::{CandidType, Decode, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{BoundedStorable, DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Deserialize;
use std::cell::RefCell;
use std::borrow::Cow;

type Memory = VirtualMemory<DefaultMemoryImpl>;
type EscrowId = u64;
type BtcAddress = String;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum EscrowStatus {
    Pending,
    Locked,
    Released,
    Refunded,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Escrow {
    pub id: EscrowId,
    pub borrower: Principal,
    pub lender: Principal,
    pub btc_collateral_address: BtcAddress,
    pub collateral_amount: f64,
    pub loan_amount: f64,
    pub created_at: u64,
    pub status: EscrowStatus,
    pub release_time: Option<u64>,
}

// Implementing Storable for Escrow
impl Storable for Escrow {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }
    
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

// Implementing BoundedStorable for Escrow
impl BoundedStorable for Escrow {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    // Stable storage for escrows: (Escrow ID -> Escrow)
    static ESCROWS: RefCell<StableBTreeMap<EscrowId, Escrow, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))))
    );

    static ESCROW_ID_COUNTER: RefCell<EscrowId> = RefCell::new(0);
}

#[ic_cdk_macros::update]
pub fn create_escrow(
    lender: Principal, 
    btc_collateral_address: BtcAddress, 
    collateral_amount: f64, 
    loan_amount: f64
) -> Result<EscrowId, String> {
    let borrower = ic_cdk::caller();
    
    // Validate inputs
    if collateral_amount <= 0.0 {
        return Err("Collateral amount must be positive".to_string());
    }
    
    if loan_amount <= 0.0 {
        return Err("Loan amount must be positive".to_string());
    }
    
    if btc_collateral_address.len() < 26 {
        return Err("Invalid Bitcoin address".to_string());
    }
    
    // Create new escrow
    let escrow_id = ESCROW_ID_COUNTER.with(|c| {
        let mut id = c.borrow_mut();
        *id += 1;
        *id
    });
    
    let escrow = Escrow {
        id: escrow_id,
        borrower,
        lender,
        btc_collateral_address,
        collateral_amount,
        loan_amount,
        created_at: ic_cdk::api::time(),
        status: EscrowStatus::Pending,
        release_time: None,
    };
    
    ESCROWS.with(|escrows| {
        escrows.borrow_mut().insert(escrow_id, escrow);
    });
    
    Ok(escrow_id)
}

#[ic_cdk_macros::update]
pub fn lock_escrow(escrow_id: EscrowId) -> Result<bool, String> {
    let caller = ic_cdk::caller();
    
    ESCROWS.with(|escrows| {
        let mut escrows_mut = escrows.borrow_mut();
        
        match escrows_mut.get(&escrow_id) {
            Some(escrow) => {
                // Only the lender can lock the escrow
                if caller != escrow.lender {
                    return Err("Only the lender can lock this escrow".to_string());
                }
                
                // Check if escrow is in pending state
                if !matches!(escrow.status, EscrowStatus::Pending) {
                    return Err("Escrow is not in pending state".to_string());
                }
                
                // Update escrow status to locked
                let mut updated_escrow = escrow.clone();
                updated_escrow.status = EscrowStatus::Locked;
                updated_escrow.release_time = Some(ic_cdk::api::time());
                
                escrows_mut.insert(escrow_id, updated_escrow);
                Ok(true)
            },
            None => Err("Escrow not found".to_string()),
        }
    })
}

#[ic_cdk_macros::update]
pub fn release_escrow(escrow_id: EscrowId) -> Result<bool, String> {
    let caller = ic_cdk::caller();
    
    ESCROWS.with(|escrows| {
        let mut escrows_mut = escrows.borrow_mut();
        
        match escrows_mut.get(&escrow_id) {
            Some(escrow) => {
                // Only the borrower can release the escrow
                if caller != escrow.borrower {
                    return Err("Only the borrower can release this escrow".to_string());
                }
                
                // Check if escrow is in locked state
                if !matches!(escrow.status, EscrowStatus::Locked) {
                    return Err("Escrow is not in locked state".to_string());
                }
                
                // Update escrow status to released
                let mut updated_escrow = escrow.clone();
                updated_escrow.status = EscrowStatus::Released;
                
                escrows_mut.insert(escrow_id, updated_escrow);
                Ok(true)
            },
            None => Err("Escrow not found".to_string()),
        }
    })
}

#[ic_cdk_macros::update]
pub fn refund_escrow(escrow_id: EscrowId) -> Result<bool, String> {
    let caller = ic_cdk::caller();
    
    ESCROWS.with(|escrows| {
        let mut escrows_mut = escrows.borrow_mut();
        
        match escrows_mut.get(&escrow_id) {
            Some(escrow) => {
                // Only the lender can refund the escrow
                if caller != escrow.lender {
                    return Err("Only the lender can refund this escrow".to_string());
                }
                
                // Check if escrow is in locked state
                if !matches!(escrow.status, EscrowStatus::Locked) {
                    return Err("Escrow is not in locked state".to_string());
                }
                
                // Update escrow status to refunded
                let mut updated_escrow = escrow.clone();
                updated_escrow.status = EscrowStatus::Refunded;
                
                escrows_mut.insert(escrow_id, updated_escrow);
                Ok(true)
            },
            None => Err("Escrow not found".to_string()),
        }
    })
}

#[ic_cdk_macros::query]
pub fn get_escrow(escrow_id: EscrowId) -> Result<Escrow, String> {
    ESCROWS.with(|escrows| {
        match escrows.borrow().get(&escrow_id) {
            Some(escrow) => Ok(escrow),
            None => Err("Escrow not found".to_string()),
        }
    })
}

#[ic_cdk_macros::query]
pub fn get_borrower_escrows() -> Vec<Escrow> {
    let caller = ic_cdk::caller();
    
    ESCROWS.with(|escrows| {
        escrows.borrow()
            .iter()
            .filter(|(_, escrow)| escrow.borrower == caller)
            .map(|(_, escrow)| escrow)
            .collect()
    })
}

#[ic_cdk_macros::query]
pub fn get_lender_escrows() -> Vec<Escrow> {
    let caller = ic_cdk::caller();
    
    ESCROWS.with(|escrows| {
        escrows.borrow()
            .iter()
            .filter(|(_, escrow)| escrow.lender == caller)
            .map(|(_, escrow)| escrow)
            .collect()
    })
}

// Generate Candid interface
candid::export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn __export_did_tmp_() -> String {
    __export_service()
} 