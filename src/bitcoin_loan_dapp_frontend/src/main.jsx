import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import { overridePlugWallet } from './plugOverride';
import './index.css';

// Override Plug wallet's default behavior if it exists
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      overridePlugWallet();
    }, 1000); // Give Plug wallet time to initialize
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
