import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export type WalletType = 'ethereum' | 'solana';

export interface WalletState {
  isConnected: boolean;
  walletType: WalletType | null;
  address: string | null;
  balance: number; // Native token balance (ETH or SOL)
  usdValue: number; // USD value based on live prices
  ethPrice: number;
  solPrice: number;
  brdgPrice: number; // BRDG Utility Token Price ($)
  brdgBalance: number; // BRDG Token Balance
  networkName: string | null;
  isConnecting: boolean;
  error: string | null;
}

const PUBLIC_ETH_RPCS = [
  'https://ethereum-rpc.publicnode.com',
  'https://eth.llamarpc.com',
  'https://cloudflare-eth.com',
];

const PUBLIC_SOL_RPCS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com',
];

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletType: null,
    address: null,
    balance: 0,
    usdValue: 0,
    ethPrice: 3000,
    solPrice: 180,
    brdgPrice: 1.25,
    brdgBalance: 500,
    networkName: null,
    isConnecting: false,
    error: null,
  });

  // Fetch live crypto price rates from CoinGecko API with Coinbase API fallback
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd');
      if (res.ok) {
        const data = await res.json();
        const ethPrice = data.ethereum?.usd || 3000;
        const solPrice = data.solana?.usd || 180;
        setWalletState((prev) => ({
          ...prev,
          ethPrice,
          solPrice,
          brdgPrice: 1.25,
          usdValue: prev.balance * (prev.walletType === 'solana' ? solPrice : ethPrice),
        }));
        return;
      }
    } catch {
      // Try Coinbase API fallback
    }

    try {
      const [ethRes, solRes] = await Promise.all([
        fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot'),
        fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot'),
      ]);
      const ethData = ethRes.ok ? await ethRes.json() : null;
      const solData = solRes.ok ? await solRes.json() : null;
      const ethPrice = ethData?.data?.amount ? parseFloat(ethData.data.amount) : 3000;
      const solPrice = solData?.data?.amount ? parseFloat(solData.data.amount) : 180;
      setWalletState((prev) => ({
        ...prev,
        ethPrice,
        solPrice,
        brdgPrice: 1.25,
        usdValue: prev.balance * (prev.walletType === 'solana' ? solPrice : ethPrice),
      }));
    } catch {
      // Keep existing prices
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Fetch real on-chain Ethereum balance safely with multi-RPC fallback
  const fetchEthBalance = async (addr: string, isExtensionWallet = false): Promise<number> => {
    // 1. Try injected extension wallet first if explicitly connected via browser wallet
    if (isExtensionWallet && typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const rawBalance = await provider.getBalance(addr);
        return parseFloat(ethers.formatEther(rawBalance));
      } catch {
        // Fallthrough to public RPCs
      }
    }

    // 2. Try public RPC nodes
    for (const rpcUrl of PUBLIC_ETH_RPCS) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const rawBalance = await Promise.race([
          provider.getBalance(addr),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000)),
        ]);
        return parseFloat(ethers.formatEther(rawBalance));
      } catch {
        // Try next RPC
      }
    }

    // Return 0 if address balance is zero or unverified on RPCs
    return 0;
  };

  // Fetch real on-chain Solana balance safely
  const fetchSolBalance = async (addr: string): Promise<number> => {
    for (const rpcUrl of PUBLIC_SOL_RPCS) {
      try {
        const connection = new Connection(rpcUrl, 'confirmed');
        const pubkey = new PublicKey(addr);
        const lamports = await Promise.race([
          connection.getBalance(pubkey),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000)),
        ]);
        return lamports / LAMPORTS_PER_SOL;
      } catch {
        // Try next endpoint
      }
    }
    return 0;
  };

  // Connect Ethereum Wallet (MetaMask, Coinbase, Phantom EVM, etc.)
  const connectEthereum = async (customAddress?: string) => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      let targetAddress = customAddress;
      let networkName = 'Ethereum Mainnet';
      const isExtension = !customAddress;

      if (!targetAddress) {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
          throw new Error('No Ethereum wallet extension detected. Please install MetaMask or paste an address.');
        }
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts authorized by Ethereum wallet.');
        }
        targetAddress = accounts[0];
        try {
          const net = await provider.getNetwork();
          networkName = net.name === 'unknown' ? 'EVM Chain' : net.name;
        } catch {
          networkName = 'Ethereum Mainnet';
        }
      }

      if (!ethers.isAddress(targetAddress)) {
        throw new Error('Invalid Ethereum address format.');
      }

      const bal = await fetchEthBalance(targetAddress, isExtension);
      setWalletState((prev) => {
        const price = prev.ethPrice;
        return {
          ...prev,
          isConnected: true,
          walletType: 'ethereum',
          address: targetAddress,
          balance: bal,
          usdValue: bal * price,
          networkName,
          isConnecting: false,
          error: null,
        };
      });
    } catch (err: any) {
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect Ethereum wallet.',
      }));
    }
  };

  // Connect Solana Wallet (Phantom, Solflare, etc.)
  const connectSolana = async (customAddress?: string) => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      let targetAddress = customAddress;

      if (!targetAddress) {
        const solanaProvider = (window as any).solana;
        if (!solanaProvider) {
          throw new Error('No Solana wallet extension detected. Please install Phantom or paste an address.');
        }
        const resp = await solanaProvider.connect();
        targetAddress = resp.publicKey.toString();
      }

      try {
        new PublicKey(targetAddress);
      } catch {
        throw new Error('Invalid Solana public key address.');
      }

      const bal = await fetchSolBalance(targetAddress);
      setWalletState((prev) => {
        const price = prev.solPrice;
        return {
          ...prev,
          isConnected: true,
          walletType: 'solana',
          address: targetAddress,
          balance: bal,
          usdValue: bal * price,
          networkName: 'Solana Mainnet',
          isConnecting: false,
          error: null,
        };
      });
    } catch (err: any) {
      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect Solana wallet.',
      }));
    }
  };

  // Refresh current connected wallet balance
  const refreshBalance = async () => {
    if (!walletState.address || !walletState.walletType) return;
    setWalletState((prev) => ({ ...prev, isConnecting: true }));
    let bal = 0;
    if (walletState.walletType === 'ethereum') {
      bal = await fetchEthBalance(walletState.address, false);
    } else {
      bal = await fetchSolBalance(walletState.address);
    }
    setWalletState((prev) => {
      const price = prev.walletType === 'solana' ? prev.solPrice : prev.ethPrice;
      return {
        ...prev,
        balance: bal,
        usdValue: bal * price,
        isConnecting: false,
      };
    });
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletState((prev) => ({
      ...prev,
      isConnected: false,
      walletType: null,
      address: null,
      balance: 0,
      usdValue: 0,
      networkName: null,
      isConnecting: false,
      error: null,
    }));
  };

  return {
    walletState,
    connectEthereum,
    connectSolana,
    refreshBalance,
    disconnectWallet,
  };
}
