use candid::{CandidType, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse, TransformArgs,
};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;

// ckBTC transfer types
#[derive(CandidType, Deserialize)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<[u8; 32]>,
}

#[derive(CandidType, Deserialize)]
pub struct TransferArg {
    pub to: Account,
    pub fee: Option<u64>,
    pub memo: Option<Vec<u8>>,
    pub amount: u64,
    pub from_subaccount: Option<Option<[u8; 32]>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferError {
    BadFee { expected_fee: u64 },
    InsufficientFunds { balance: u64 },
    TooOld,
    GenericError { error_code: u64, message: String },
}

pub type TransferResult = Result<u64, TransferError>;

// Loan structures  
#[derive(CandidType, Deserialize, Clone, PartialEq, Serialize)]
pub enum LoanStatus { Active, Repaid }

#[derive(CandidType, Deserialize, Clone, Serialize)]
pub struct Loan {
    pub id: u64,
    pub borrower: Principal,
    pub collateral_amount: u64,
    pub loan_amount: u64,
    pub status: LoanStatus,
}

// Local reference (catalog card) - stores IPFS hash
#[derive(CandidType, Deserialize, Clone)]
pub struct LoanReference {
    pub id: u64,
    pub ipfs_hash: String,     // Where full loan data lives on IPFS
    pub borrower: Principal,
    pub status: LoanStatus,    // For quick filtering
}

// Canister state
pub struct State {
    pub loan_references: HashMap<u64, LoanReference>,  // The "catalog"
    pub next_loan_id: u64,
    pub ckbtc_ledger_id: Principal,
    pub btc_addresses: HashMap<Principal, String>,     // User's Bitcoin addresses
}

impl Default for State {
    fn default() -> Self {
        Self {
            loan_references: HashMap::new(),
            next_loan_id: 1,
            ckbtc_ledger_id: Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap(),
            btc_addresses: HashMap::new(),
        }
    }
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        loan_references: HashMap::new(),
        next_loan_id: 1,
        ckbtc_ledger_id: Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap(),
        btc_addresses: HashMap::new(),
    });
}

#[derive(Deserialize)]
struct IpfsResponse { #[serde(rename = "Hash")] hash: String }

// Blockstream API response structures
#[derive(Deserialize)]
struct ChainStats {
    tx_count: u64,
}

#[derive(Deserialize)]
struct AddressInfo {
    chain_stats: ChainStats,
}

// HTTP response transformer
#[ic_cdk::query]
fn transform_http_response(args: TransformArgs) -> HttpResponse {
    HttpResponse { status: args.response.status.clone(), body: args.response.body.clone(), headers: Vec::new() }
}

// Store loan on IPFS and return hash
async fn store_on_ipfs(loan: &Loan) -> Result<String, String> {
    let json_data = serde_json::to_string(loan).map_err(|e| e.to_string())?;
    let boundary = "----formdata-boundary";
    let body = format!("--{}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"loan.json\"\r\nContent-Type: application/json\r\n\r\n{}\r\n--{}--\r\n", boundary, json_data, boundary);

    let request = CanisterHttpRequestArgument {
        url: "https://ipfs.infura.io:5001/api/v0/add".to_string(),
        method: HttpMethod::POST,
        body: Some(body.into_bytes()),
        max_response_bytes: Some(1024),
        transform: Some(ic_cdk::api::management_canister::http_request::TransformContext::from_name("transform_http_response".to_string(), vec![])),
        headers: vec![HttpHeader { name: "Content-Type".to_string(), value: format!("multipart/form-data; boundary={}", boundary) }],
    };

    match http_request(request, 0).await {
        Ok((response,)) if response.status == 200u16 => {
            let response_body = String::from_utf8(response.body).map_err(|e| e.to_string())?;
            let ipfs_response: IpfsResponse = serde_json::from_str(&response_body).map_err(|e| e.to_string())?;
            Ok(ipfs_response.hash)
        }
        Ok((response,)) => Err(format!("IPFS failed: {}", response.status)),
        Err((_, msg)) => Err(format!("HTTP failed: {}", msg)),
    }
}

// Get loan from IPFS using hash
async fn get_from_ipfs(ipfs_hash: &str) -> Result<Loan, String> {
    let request = CanisterHttpRequestArgument {
        url: format!("https://ipfs.io/ipfs/{}", ipfs_hash),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2048),
        transform: Some(ic_cdk::api::management_canister::http_request::TransformContext::from_name("transform_http_response".to_string(), vec![])),
        headers: vec![],
    };

    match http_request(request, 0).await {
        Ok((response,)) if response.status == 200u16 => {
            let response_body = String::from_utf8(response.body).map_err(|e| e.to_string())?;
            serde_json::from_str(&response_body).map_err(|e| e.to_string())
        }
        Ok((response,)) => Err(format!("IPFS retrieval failed: {}", response.status)),
        Err((_, msg)) => Err(format!("HTTP failed: {}", msg)),
    }
}

/// Create loan: Store on IPFS + Transfer ckBTC + Save reference locally  
#[ic_cdk::update]
pub async fn create_loan(collateral: u64, loan: u64) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    
    // Generate unique loan ID
    let loan_id = STATE.with(|state| {
        let mut state = state.borrow_mut();
        let id = state.next_loan_id;
        state.next_loan_id += 1;
        id
    });

    // Create loan struct
    let new_loan = Loan { id: loan_id, borrower: caller, collateral_amount: collateral, loan_amount: loan, status: LoanStatus::Active };

    // Store full loan data on IPFS (decentralized storage)
    let ipfs_hash = store_on_ipfs(&new_loan).await?;

    // Store catalog card locally (for fast searching)
    STATE.with(|state| {
        state.borrow_mut().loan_references.insert(loan_id, LoanReference {
            id: loan_id, ipfs_hash: ipfs_hash.clone(), borrower: caller, status: LoanStatus::Active,
        });
    });

    // Transfer ckBTC to borrower
    let ckbtc_ledger_id = STATE.with(|state| state.borrow().ckbtc_ledger_id);
    let transfer_arg = TransferArg {
        to: Account { owner: caller, subaccount: None },
        fee: None,
        memo: Some(format!("Loan #{}", loan_id).into_bytes()),
        amount: loan,
        from_subaccount: None,
        created_at_time: None,
    };

    let transfer_result: CallResult<(TransferResult,)> = ic_cdk::call(ckbtc_ledger_id, "icrc1_transfer", (transfer_arg,)).await;

    match transfer_result {
        Ok((Ok(_transfer_id),)) => Ok(loan_id),  // Success!
        _ => {
            // Transfer failed - clean up the catalog card
            STATE.with(|state| state.borrow_mut().loan_references.remove(&loan_id));
            Err("ckBTC transfer failed".to_string())
        }
    }
}

/// Marks a loan as repaid after the borrower has transferred the amount back
#[ic_cdk::update]
pub async fn repay_loan(loan_id: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // Get and validate loan reference
    let ipfs_hash = STATE.with(|state| {
        let state = state.borrow();
        match state.loan_references.get(&loan_id) {
            Some(loan_ref) if loan_ref.borrower == caller && loan_ref.status == LoanStatus::Active => {
                Ok(loan_ref.ipfs_hash.clone())
            }
            Some(_) => Err("Cannot repay this loan"),
            None => Err("Loan not found"),
        }
    })?;

    // Get loan from IPFS, update status, store back
    let mut loan = get_from_ipfs(&ipfs_hash).await?;
    loan.status = LoanStatus::Repaid;
    let new_hash = store_on_ipfs(&loan).await?;

    // Update local reference
    STATE.with(|state| {
        let mut state = state.borrow_mut();
        if let Some(loan_ref) = state.loan_references.get_mut(&loan_id) {
            loan_ref.ipfs_hash = new_hash;
            loan_ref.status = LoanStatus::Repaid;
        }
    });

    Ok(())
}

/// Get loan details from IPFS
#[ic_cdk::update]
pub async fn get_loan(loan_id: u64) -> Result<Loan, String> {
    let ipfs_hash = STATE.with(|state| {
        state.borrow().loan_references.get(&loan_id)
            .map(|loan_ref| loan_ref.ipfs_hash.clone())
            .ok_or("Loan not found")
    })?;
    
    get_from_ipfs(&ipfs_hash).await
}

/// Get loan catalog cards for borrower (fast - no IPFS calls)
#[ic_cdk::query]
pub fn get_loan_refs_by_borrower(borrower: Principal) -> Vec<LoanReference> {
    STATE.with(|state| state.borrow().loan_references.values().filter(|r| r.borrower == borrower).cloned().collect())
}

/// Get stats (fast - uses catalog only)
#[ic_cdk::query]
pub fn get_stats() -> (u64, u64) {
    STATE.with(|state| {
        let state = state.borrow();
        let total = state.loan_references.len() as u64;
        let active = state.loan_references.values().filter(|r| r.status == LoanStatus::Active).count() as u64;
        (total, active)
    })
}

// Export the candid interface
/// Returns the Principal ID of the caller (for testing connectivity)
#[ic_cdk::query]
pub fn whoami() -> Principal {
    ic_cdk::caller()
}

/// Allows a logged-in user to save their Bitcoin address with comprehensive validation
#[ic_cdk::update]
pub async fn link_btc_address(address: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let trimmed_address = address.trim();
    
    // A. Format Validation (Mandatory)
    if trimmed_address.is_empty() {
        return Err("Bitcoin address cannot be empty".to_string());
    }
    
    // Check Bitcoin address format
    let is_valid_format = if trimmed_address.starts_with('1') {
        // P2PKH address: starts with 1, length 26-35
        trimmed_address.len() >= 26 && trimmed_address.len() <= 35
    } else if trimmed_address.starts_with('3') {
        // P2SH address: starts with 3, length 26-35
        trimmed_address.len() >= 26 && trimmed_address.len() <= 35
    } else if trimmed_address.starts_with("bc1") {
        // Bech32 address: starts with bc1
        trimmed_address.len() >= 42 && trimmed_address.len() <= 62
    } else {
        false
    };
    
    if !is_valid_format {
        return Err("Invalid Bitcoin address format".to_string());
    }
    
    // B. Activity Check via HTTPS Outcall (Advanced)
    let request = CanisterHttpRequestArgument {
        url: format!("https://blockstream.info/api/address/{}", trimmed_address),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2048),
        transform: Some(ic_cdk::api::management_canister::http_request::TransformContext::from_name("transform_http_response".to_string(), vec![])),
        headers: vec![],
    };
    
    match http_request(request, 25_000_000_000).await {
        Ok((response,)) if response.status == 200u16 => {
            let response_body = String::from_utf8(response.body).map_err(|_| "Failed to parse API response".to_string())?;
            let address_info: AddressInfo = serde_json::from_str(&response_body).map_err(|_| "Failed to parse address information".to_string())?;
            
            if address_info.chain_stats.tx_count == 0 {
                return Err("Address has no on-chain activity".to_string());
            }
            
            // Address is valid and active - save it
            STATE.with(|state| {
                state.borrow_mut().btc_addresses.insert(caller, trimmed_address.to_string());
            });
            
            Ok(())
        }
        Ok((response,)) => {
            Err(format!("Failed to verify address activity: HTTP {}", response.status))
        }
        Err((_, msg)) => {
            Err(format!("Address has no on-chain activity"))
        }
    }
}

/// Retrieves the linked Bitcoin address for the logged-in user
#[ic_cdk::query]
pub fn get_linked_btc_address() -> Option<String> {
    let caller = ic_cdk::caller();
    STATE.with(|state| {
        state.borrow().btc_addresses.get(&caller).cloned()
    })
}

ic_cdk::export_candid!();
