import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../agent'; // This path is now correct (../agent)
import { idlFactory as backendIdlFactory } from '../../../declarations/bitcoin_loan_dapp_backend/bitcoin_loan_dapp_backend.did.js';

export const AuthContext = createContext();

const iiUrl = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;

export const AuthProvider = ({ children }) => {
    const [authClient, setAuthClient] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userPrincipal, setUserPrincipal] = useState(null);
    const [plugActor, setPlugActor] = useState(null);
    const [isPlugConnected, setIsPlugConnected] = useState(false);
    const [actor, setActor] = useState(null); // A single actor state

    useEffect(() => {
        AuthClient.create().then(async (client) => {
            setAuthClient(client);
            if (await client.isAuthenticated()) {
                handleAuthenticated(client);
            }
        });
    }, []);

    const handleAuthenticated = (client) => {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        const genericActor = createActor(process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND, backendIdlFactory, {
            agentOptions: { identity }
        });
        setActor(genericActor);
        setUserPrincipal(principal);
        setIsAuthenticated(true);
        // Set plug as "connected" so the app works immediately with II
        setIsPlugConnected(true);
    };

    const login = () => {
        authClient?.login({
            identityProvider: iiUrl,
            onSuccess: () => handleAuthenticated(authClient),
        });
    };

    const logout = async () => {
        await authClient?.logout();
        // Also disconnect plug if it was connected
        if (window.ic?.plug?.isConnected()) {
            await window.ic.plug.disconnect();
        }
        setActor(null);
        setIsAuthenticated(false);
        setUserPrincipal(null);
        setIsPlugConnected(false);
    };

    const connectPlug = async () => {
        if (!window.ic?.plug) {
            window.open('https://plugwallet.ooo/', '_blank');
            return;
        }
        const backendCanisterId = process.env.CANISTER_ID_BITCOIN_LOAN_DAPP_BACKEND;
        await window.ic.plug.requestConnect({ whitelist: [backendCanisterId] });

        const plugAgent = window.ic.plug.agent;
        if(!plugAgent) {
            await window.ic.plug.createAgent({whitelist: [backendCanisterId]});
        }

        const plugActorInstance = await window.ic.plug.createActor({
            canisterId: backendCanisterId,
            interfaceFactory: backendIdlFactory,
        });

        setActor(plugActorInstance); // Set the main actor to be the Plug actor
        setIsPlugConnected(true);
        // Ensure we are also marked as generally authenticated
        if(!isAuthenticated) {
            const principal = await window.ic.plug.agent.getPrincipal();
            setUserPrincipal(principal);
            setIsAuthenticated(true);
        }
    };

    return (
        <AuthContext.Provider value={{ login, logout, connectPlug, isAuthenticated, isPlugConnected, actor, userPrincipal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 