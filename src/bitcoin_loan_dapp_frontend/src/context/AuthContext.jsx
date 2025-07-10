import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../agent';
import { idlFactory as backendIdlFactory } from '../../../declarations/bitcoin_loan_dapp_backend/bitcoin_loan_dapp_backend.did.js';
import { IDENTITY_PROVIDER_URL, BACKEND_CANISTER_ID, HOST } from '../config';
import { overridePlugWallet } from '../plugOverride';

export const AuthContext = createContext();

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
        
        // Try to override Plug wallet if available
        overridePlugWallet();
    }, []);

    const handleAuthenticated = (client) => {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        const genericActor = createActor(BACKEND_CANISTER_ID, backendIdlFactory, {
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
            identityProvider: IDENTITY_PROVIDER_URL, // Use the imported config variable
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
        // Try to override Plug wallet again just before connecting
        overridePlugWallet();
        
        if (!window.ic?.plug) {
            window.open('https://plugwallet.ooo/', '_blank');
            return;
        }
        
        try {
            // Ensure we're using the correct host
            await window.ic.plug.requestConnect({
                whitelist: [BACKEND_CANISTER_ID],
                host: HOST
            });

            const plugAgent = window.ic.plug.agent;
            if(!plugAgent) {
                await window.ic.plug.createAgent({
                    whitelist: [BACKEND_CANISTER_ID],
                    host: HOST
                });
            }

            const plugActorInstance = await window.ic.plug.createActor({
                canisterId: BACKEND_CANISTER_ID,
                interfaceFactory: backendIdlFactory,
                host: HOST
            });

            setActor(plugActorInstance); // Set the main actor to be the Plug actor
            setIsPlugConnected(true);
            // Ensure we are also marked as generally authenticated
            if(!isAuthenticated) {
                const principal = await window.ic.plug.agent.getPrincipal();
                setUserPrincipal(principal);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Failed to connect to Plug wallet:", error);
            alert("Failed to connect to Plug wallet. Please make sure it's installed and try again.");
        }
    };

    return (
        <AuthContext.Provider value={{ login, logout, connectPlug, isAuthenticated, isPlugConnected, actor, userPrincipal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 