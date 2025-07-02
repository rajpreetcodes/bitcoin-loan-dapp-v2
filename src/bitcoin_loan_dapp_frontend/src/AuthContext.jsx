import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { resetActor } from './actor';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      // Configure the identity provider based on environment
      const DFX_NETWORK = process.env.DFX_NETWORK || 'local';
      
      let identityProvider;
      
      if (DFX_NETWORK === "ic") {
        // Use the official mainnet identity provider
        identityProvider = "https://identity.ic0.app";
      } else {
        // Use the local replica's identity provider
        const localCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
        identityProvider = `http://${localCanisterId}.localhost:4943`;
      }

      const client = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30, // 30 minutes
          disableDefaultIdleCallback: true,
        },
      });
      
      setAuthClient(client);

      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const identity = client.getIdentity();
        setPrincipal(identity.getPrincipal());
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) return;

    try {
      setIsLoading(true);
      
      // Configure the identity provider based on environment
      const DFX_NETWORK = process.env.DFX_NETWORK || 'local';
      
      let identityProvider;
      
      if (DFX_NETWORK === "ic") {
        // Use the official mainnet identity provider
        identityProvider = "https://identity.ic0.app";
      } else {
        // Use the local replica's identity provider
        const localCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY;
        identityProvider = `http://${localCanisterId}.localhost:4943`;
      }

      await authClient.login({
        identityProvider: identityProvider,
        onSuccess: () => {
          setIsAuthenticated(true);
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal());
          resetActor(); // Reset actor to use new authenticated identity
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      resetActor(); // Reset actor to unauthenticated
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    isAuthenticated,
    principal,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 