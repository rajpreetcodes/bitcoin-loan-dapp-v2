import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get canister IDs from environment variables or use placeholders
const BITCOIN_LOAN_DAPP_BACKEND_CANISTER_ID = process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND || "uzt4z-lp777-77774-qaabq-cai";
const BITCOIN_ESCROW_CANISTER_CANISTER_ID = process.env.CANISTER_ID_BITCOIN_ESCROW_CANISTER || "uxrrr-q7777-77774-qaaaq-cai";

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      ...process.env,
      BITCOIN_LOAN_DAPP_BACKEND_CANISTER_ID,
      BITCOIN_ESCROW_CANISTER_CANISTER_ID
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      // Explicitly mark these paths as external to prevent bundling errors
      external: [
        "../declarations/bitcoin_escrow_canister/bitcoin_escrow_canister.did.js"
      ]
    }
  }
});
