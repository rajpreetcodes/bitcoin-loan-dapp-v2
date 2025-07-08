import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from './agent';
import { idlFactory as backendIdlFactory } from '../../declarations/bitcoin_loan_dapp_backend/bitcoin_loan_dapp_backend.did.js';

export const AuthContext = createContext(null);

const iiUrl = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;

export const AuthProvider = ({ children }) => {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); //Primary auth is II
  const [identity, setIdentity] = useState(null);
  const [userPrincipal, setUserPrincipal] = useState(null);

  const [plugActor, setPlugActor] = useState(null); //Separate state for Plug actor
  const [isPlugConnected, setIsPlugConnected] = useState(false);

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      setAuthClient(client);
      const authenticated = await client.isAuthenticated();
      if (authenticated) {
        handleAuthenticated(client);
      }
    });
  }, []);

  const handleAuthenticated = (client) => {
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();

    // Create an actor for II authenticated users
    const iiActor = createActor(process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND, backendIdlFactory, {
      agentOptions: { identity }
    });

    // We can set this to a generic 'actor' state if needed, but for now we'll handle II and Plug separately.
    setIdentity(identity);
    setUserPrincipal(principal);
    setIsAuthenticated(true);
  };

  const login = () => {
    if (!authClient) return;
    authClient.login({
      identityProvider: iiUrl,
      onSuccess: () => handleAuthenticated(authClient),
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setUserPrincipal(null);
    setPlugActor(null);
    setIsPlugConnected(false);
  };

  const connectPlug = async () => {
    if (!window.ic || !window.ic.plug) {
      window.open('https://plugwallet.ooo/', '_blank');
      return;
    }
    const backendCanisterId = process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND;
    const whitelist = [backendCanisterId];
    await window.ic.plug.requestConnect({ whitelist });
    const plugActor = await window.ic.plug.createActor({ 
      canisterId: backendCanisterId, 
      interfaceFactory: backendIdlFactory 
    });
    setPlugActor(plugActor);
    setIsPlugConnected(true);
  };

  //The actor passed to the app is the Plug actor if connected, otherwise null.
  const actor = plugActor;

  return (
    <AuthContext.Provider value={{
      login,
      logout,
      connectPlug,
      isAuthenticated,
      isPlugConnected,
      actor,
      userPrincipal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 