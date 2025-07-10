const getEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const DFX_NETWORK = getEnv('DFX_NETWORK');
export const BACKEND_CANISTER_ID = getEnv('CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND');
export const IDENTITY_CANISTER_ID = getEnv('CANISTER_ID_INTERNET_IDENTITY');

export const HOST = DFX_NETWORK === 'local' 
  ? 'http://127.0.0.1:4943' 
  : 'https://icp-api.io';

export const IDENTITY_PROVIDER_URL = DFX_NETWORK === 'local'
  ? `http://${IDENTITY_CANISTER_ID}.localhost:4943`
  : 'https://identity.ic0.app'; 