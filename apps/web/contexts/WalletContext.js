'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  connectKeplr, 
  disconnectWallet, 
  verifyWalletConnection, 
  getWalletBalance,
  isKeplrAvailable 
} from '../lib/keplr';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [offlineSigner, setOfflineSigner] = useState(null);
  const [signature, setSignature] = useState(null);

  // Check for existing connection on load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window === 'undefined') return;

      const savedAddress = localStorage.getItem('cosmos_wallet_address');
      const savedSignature = localStorage.getItem('cosmos_wallet_signature');
      const savedConnected = localStorage.getItem('cosmos_wallet_connected');

      if (savedAddress && savedSignature && savedConnected === 'true') {
        const isValid = await verifyWalletConnection(savedAddress);
        if (isValid) {
          setAddress(savedAddress);
          setSignature(JSON.parse(savedSignature));
          setIsConnected(true);
          
          // Fetch balance
          try {
            const bal = await getWalletBalance(savedAddress);
            setBalance(bal);
          } catch (error) {
            console.error('Error fetching balance:', error);
          }
        } else {
          // Clear invalid connection
          disconnectWallet();
        }
      }
    };

    checkExistingConnection();
  }, []);

  // Connect wallet function
  const connect = async () => {
    if (!isKeplrAvailable()) {
      setError('Keplr wallet is not installed. Please install the Keplr browser extension.');
      return false;
    }

    setIsConnecting(true);
    setError('');

    try {
      const walletInfo = await connectKeplr();
      
      setAddress(walletInfo.address);
      setSignature(walletInfo.signature);
      setOfflineSigner(walletInfo.offlineSigner);
      setIsConnected(true);

      // Save to localStorage
      localStorage.setItem('cosmos_wallet_address', walletInfo.address);
      localStorage.setItem('cosmos_wallet_signature', JSON.stringify(walletInfo.signature));
      localStorage.setItem('cosmos_wallet_connected', 'true');

      // Fetch balance
      try {
        const bal = await getWalletBalance(walletInfo.address);
        setBalance(bal);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }

      return true;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnect = () => {
    disconnectWallet();
    setIsConnected(false);
    setAddress('');
    setBalance(0);
    setOfflineSigner(null);
    setSignature(null);
    setError('');
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (address) {
      try {
        const bal = await getWalletBalance(address);
        setBalance(bal);
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  // Format address for display (truncate middle)
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const value = {
    // State
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    offlineSigner,
    signature,
    
    // Actions
    connect,
    disconnect,
    refreshBalance,
    
    // Utilities
    formatAddress,
    isKeplrAvailable: isKeplrAvailable()
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};