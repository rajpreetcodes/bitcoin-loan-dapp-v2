import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createAuthenticatedActor } from '../actor';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    AuthClient.create().then(client => {
      setAuthClient(client);
      client.isAuthenticated().then(async (authed) => {
        setIsAuthenticated(authed);
        setIsConnecting(false);
        if (authed) {
          const identity = client.getIdentity();
          setUserPrincipal(identity.getPrincipal().toText());
          setActor(createAuthenticatedActor(identity));
        }
      });
    });
  }, []);

  const login = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app/#authorize'
          : 'http://localhost:4943?canisterId=ryjl3-tyaaa-aaaaa-aaaba-cai',
        onSuccess: async () => {
          setIsAuthenticated(true);
          const identity = authClient.getIdentity();
          setUserPrincipal(identity.getPrincipal().toText());
          setActor(createAuthenticatedActor(identity));
          setIsConnecting(false);
        },
        onError: (err) => {
          setError('Login failed: ' + err.message);
          setIsConnecting(false);
        },
      });
    } catch (err) {
      setError('Login failed: ' + err.message);
      setIsConnecting(false);
    }
  };

  const logout = async () => {
    setIsConnecting(true);
    setError(null);
    await authClient.logout();
    setIsAuthenticated(false);
    setUserPrincipal(null);
    setActor(null);
    setIsConnecting(false);
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, isConnecting, userPrincipal, actor, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 