import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  plugins:[react()],
  define:{
    // Expose all process.env variables to the client
    'process.env': process.env
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
