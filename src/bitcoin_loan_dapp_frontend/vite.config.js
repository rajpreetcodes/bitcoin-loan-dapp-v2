import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins:[react()],
  define:{
    //Inject canister IDs from .env file
    'process.env.CANISTER_ID_INTERNET_IDENTITY':JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY),
    'process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND':JSON.stringify(process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND),
  },
  server:{
    port:3000,
    proxy:{
      '/api':{
        target:'http://127.0.0.1:4943',
        changeOrigin:true,
      },
    },
  },
});
