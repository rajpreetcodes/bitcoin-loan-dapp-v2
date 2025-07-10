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
    const [actor, setActor] = useState(null);
    const [walletBalances, setWalletBalances] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [plugInitialized, setPlugInitialized] = useState(false);

    // Function to clear authentication state
    const clearAuthState = async (client) => {
        if (client) {
            await client.logout();
        }
        if (window.ic?.plug?.isConnected()) {
            await window.ic.plug.disconnect();
        }
        setActor(null);
        setIsAuthenticated(false);
        setUserPrincipal(null);
        setIsPlugConnected(false);
        setWalletBalances(null);
        
        localStorage.removeItem('ic-delegation');
        localStorage.removeItem('ic-identity');
        
        console.log("Authentication state cleared");
    };

    // Initialize Plug wallet
    useEffect(() => {
        const initializePlug = async () => {
            try {
                await overridePlugWallet();
                setPlugInitialized(true);
            } catch (error) {
                console.warn("Plug wallet not available:", error);
                setPlugInitialized(false);
            }
        };

        initializePlug();
    }, []);

    // Initialize auth client
    useEffect(() => {
        AuthClient.create().then(async (client) => {
            setAuthClient(client);
            
            const urlParams = new URLSearchParams(window.location.search);
            const clearAuth = urlParams.get('clearAuth');
            
            if (clearAuth === 'true') {
                await clearAuthState(client);
                window.history.replaceState({}, document.title, window.location.pathname);
            } else if (await client.isAuthenticated()) {
                handleAuthenticated(client);
            }
        });
    }, []);

    // Check wallet balances when connected
    useEffect(() => {
        const checkWalletBalances = async () => {
            if (isPlugConnected && window.ic?.plug) {
                try {
                    // DEMO ONLY: Using simulated balances
                    setWalletBalances({
                        BTC: 1.30557224,
                        ckBTC: 2.5,
                        ICP: 100
                    });
                } catch (error) {
                    console.error("Failed to fetch wallet balances:", error);
                }
            } else {
                setWalletBalances(null);
            }
        };
        
        checkWalletBalances();
    }, [isPlugConnected]);

    const handleAuthenticated = (client) => {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        const genericActor = createActor(BACKEND_CANISTER_ID, backendIdlFactory, {
            agentOptions: { identity }
        });
        setActor(genericActor);
        setUserPrincipal(principal);
        setIsAuthenticated(true);
    };

    const login = async () => {
        setIsConnecting(true);
        try {
            await authClient?.login({
                identityProvider: IDENTITY_PROVIDER_URL,
                onSuccess: () => {
                    handleAuthenticated(authClient);
                    setIsConnecting(false);
                },
            });
        } catch (error) {
            console.error("Login failed:", error);
            setIsConnecting(false);
        }
    };

    const logout = async () => {
        await clearAuthState(authClient);
    };

    const connectPlug = async () => {
        if (!plugInitialized) {
            alert("Plug wallet is not available. Please install the Plug wallet extension and refresh the page.");
            window.open('https://plugwallet.ooo/', '_blank');
            return;
        }

        setIsConnecting(true);
        
        try {
            await window.ic.plug.requestConnect({
                whitelist: [BACKEND_CANISTER_ID],
                host: HOST
            });

            const plugAgent = window.ic.plug.agent;
            if (!plugAgent) {
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

            const principal = await window.ic.plug.agent.getPrincipal();
            
            setActor(plugActorInstance);
            setIsPlugConnected(true);
            setUserPrincipal(principal);
            setIsAuthenticated(true);
            
        } catch (error) {
            console.error("Failed to connect to Plug wallet:", error);
            alert("Failed to connect to Plug wallet. Please make sure it's installed and try again.");
            setIsPlugConnected(false);
            setWalletBalances(null);
        } finally {
            setIsConnecting(false);
        }
    };

    const requestTransaction = async (amount, recipient, token = 'BTC') => {
        if (!isPlugConnected || !window.ic?.plug) {
            return { success: false, error: 'Wallet not connected' };
        }
        
        try {
            const userConfirmed = window.confirm(
                `Do you want to transfer ${amount} ${token} to ${recipient}?`
            );
            
            if (!userConfirmed) {
                return { success: false, error: 'User cancelled the transaction' };
            }
            
            if (walletBalances) {
                setWalletBalances(prev => ({
                    ...prev,
                    [token]: Math.max(0, prev[token] - amount)
                }));
            }
            
            return { success: true, txId: `tx_${Date.now()}` };
        } catch (error) {
            console.error("Transaction failed:", error);
            return { success: false, error: error.message || 'Transaction failed' };
        }
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            login,
            logout,
            userPrincipal,
            actor,
            connectPlug,
            isPlugConnected,
            walletBalances,
            isConnecting,
            requestTransaction,
            plugInitialized
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 