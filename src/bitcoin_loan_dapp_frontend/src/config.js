const getEnv = (key, defaultValue = null) => {
  const value = process.env[key] || import.meta.env[`VITE_${key}`] || defaultValue;
  if (!value && defaultValue === null) {
    console.warn(`Missing environment variable: ${key}, using default value`);
  }
  return value;
};

export const DFX_NETWORK = getEnv('DFX_NETWORK', 'local');

// Use the actual canister IDs from your deployment
export const BACKEND_CANISTER_ID = getEnv(
  'CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND',
  'uxrrr-q7777-77774-qaaaq-cai'
);

export const IDENTITY_CANISTER_ID = getEnv(
  'CANISTER_ID_INTERNET_IDENTITY',
  'uzt4z-lp777-77774-qaabq-cai'
);

// Always use http://localhost:4943 format for local development
export const HOST = DFX_NETWORK === 'local' 
  ? 'http://localhost:4943' 
  : 'https://icp-api.io';

export const IDENTITY_PROVIDER_URL = DFX_NETWORK === 'local'
  ? `http://${IDENTITY_CANISTER_ID}.localhost:4943`
  : 'https://identity.ic0.app'; 

// Add a function to get the correct host format
export const getCanisterUrl = (canisterId) => {
  if (DFX_NETWORK === 'local') {
    return `http://${canisterId}.localhost:4943`;
  }
  return `https://${canisterId}.icp0.io`;
}; 