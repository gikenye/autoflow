import { useState, useCallback } from "react";
import { MetaMaskSDK } from "@metamask/sdk-react";
import { ethers } from "ethers";

export interface MetaMaskUser {
    address: string;
    provider: "metamask";
}

export function useMetaMaskWallet() {
    const [user, setUser] = useState<MetaMaskUser | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const connect = useCallback(async () => {
        setIsLoading(true);
        try {
            const MMSDK = new MetaMaskSDK({
                dappMetadata: {
                    name: "AutoFlow",
                    url: window.location.href,
                },
            });
            const ethereum = MMSDK.getProvider();
            if (!ethereum) {
                throw new Error("MetaMask provider not found");
            }

            await ethereum.request({ method: "eth_requestAccounts" });
            
            const web3Provider = new ethers.BrowserProvider(ethereum);
            setProvider(web3Provider);

            const signer = await web3Provider.getSigner();
            const address = await signer.getAddress();

            const metaMaskUser: MetaMaskUser = { address, provider: "metamask" };
            setUser(metaMaskUser);
            setIsConnected(true);
            
            return { user: metaMaskUser, provider: web3Provider };
        } catch (error) {
            console.error("MetaMask connection failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const disconnect = useCallback(async () => {
        // MetaMask SDK does not have an explicit disconnect method.
        // Clearing state is the standard approach.
        setUser(null);
        setProvider(null);
        setIsConnected(false);
    }, []);

    return {
        user,
        provider,
        isLoading,
        isConnected,
        connect,
        disconnect,
    };
} 