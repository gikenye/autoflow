import { useState, useCallback, useEffect } from "react";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ethers } from "ethers";

export interface CircleUser {
    address: string;
    email?: string;
    name?: string;
    profileImage?: string;
    provider: "circle";
}

// It's recommended to move this to environment variables
const WEB3AUTH_CLIENT_ID = "YOUR_WEB3AUTH_CLIENT_ID"; // Replace with your actual client ID

export function useCircleWallet() {
    const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
    const [user, setUser] = useState<CircleUser | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const initWeb3Auth = async () => {
            try {
                const web3AuthInstance = new Web3Auth({
                    clientId: WEB3AUTH_CLIENT_ID,
                    web3AuthNetwork: "sapphire_devnet",
                    chainConfig: {
                        chainNamespace: "eip155",
                        chainId: "0x13881", // Polygon Mumbai
                        rpcTarget: "https://rpc.ankr.com/polygon_mumbai",
                        displayName: "Polygon Mumbai Testnet",
                        blockExplorer: "https://mumbai.polygonscan.com/",
                        ticker: "MATIC",
                        tickerName: "Matic",
                    },
                });

                const openloginAdapter = new OpenloginAdapter({
                    adapterSettings: {
                        network: "sapphire_devnet",
                    },
                });
                web3AuthInstance.configureAdapter(openloginAdapter);

                setWeb3auth(web3AuthInstance);
                await web3AuthInstance.initModal();

                if (web3AuthInstance.provider) {
                    const web3Provider = new ethers.BrowserProvider(web3AuthInstance.provider);
                    const signer = await web3Provider.getSigner();
                    const address = await signer.getAddress();
                    const userInfo = await web3AuthInstance.getUserInfo();

                    const circleUser: CircleUser = {
                        address,
                        email: userInfo.email,
                        name: userInfo.name,
                        profileImage: userInfo.profileImage,
                        provider: "circle",
                    };
                    
                    setUser(circleUser);
                    setProvider(web3Provider);
                    setIsConnected(true);
                }
            } catch (error) {
                console.error("Web3Auth initialization failed:", error);
            }
        };

        initWeb3Auth();
    }, []);

    const connect = useCallback(async () => {
        if (!web3auth) {
            console.error("Web3Auth not initialized");
            return;
        }

        setIsLoading(true);
        try {
            const web3authProvider = await web3auth.connect();
            if (!web3authProvider) {
                throw new Error("Web3Auth connection failed.");
            }
            
            const web3Provider = new ethers.BrowserProvider(web3authProvider);
            setProvider(web3Provider);

            const signer = await web3Provider.getSigner();
            const address = await signer.getAddress();
            const userInfo = await web3auth.getUserInfo();

            const circleUser: CircleUser = {
                address,
                email: userInfo.email,
                name: userInfo.name,
                profileImage: userInfo.profileImage,
                provider: "circle",
            };

            setUser(circleUser);
            setIsConnected(true);
            
            return { user: circleUser, provider: web3Provider };
        } catch (error) {
            console.error("Circle connection failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [web3auth]);

    const disconnect = useCallback(async () => {
        if (!web3auth) {
            return;
        }
        await web3auth.logout();
        setUser(null);
        setProvider(null);
        setIsConnected(false);
    }, [web3auth]);

    return {
        user,
        provider,
        isLoading,
        isConnected,
        connect,
        disconnect,
    };
} 