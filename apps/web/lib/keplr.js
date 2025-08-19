// Keplr wallet integration with ADR-36 signing
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { stringToPath } from '@cosmjs/crypto';
import { toBase64, fromUtf8 } from '@cosmjs/encoding';

// Stargaze mainnet configuration
export const STARGAZE_CHAIN_CONFIG = {
  chainId: 'stargaze-1',
  chainName: 'Stargaze',
  rpc: 'https://rpc.stargaze-apis.com',
  rest: 'https://rest.stargaze-apis.com',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'stars',
    bech32PrefixAccPub: 'starspub',
    bech32PrefixValAddr: 'starsvaloper',
    bech32PrefixValPub: 'starsvaloperpub',
    bech32PrefixConsAddr: 'starsvalcons',
    bech32PrefixConsPub: 'starsvalconspub',
  },
  currencies: [
    {
      coinDenom: 'STARS',
      coinMinimalDenom: 'ustars',
      coinDecimals: 6,
      coinGeckoId: 'stargaze',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'STARS',
      coinMinimalDenom: 'ustars',
      coinDecimals: 6,
      coinGeckoId: 'stargaze',
      gasPriceStep: {
        low: 1,
        average: 1.1,
        high: 1.2,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'STARS',
    coinMinimalDenom: 'ustars',
    coinDecimals: 6,
    coinGeckoId: 'stargaze',
  },
};

// Check if Keplr is available
export const isKeplrAvailable = () => {
  if (typeof window === 'undefined') return false;
  return !!(window.keplr && window.getOfflineSigner);
};

// Connect to Keplr wallet
export const connectKeplr = async () => {
  if (typeof window === 'undefined' || !isKeplrAvailable()) {
    throw new Error('Keplr wallet is not installed. Please install Keplr extension.');
  }

  try {
    // Suggest chain if not already added
    try {
      await window.keplr.enable(STARGAZE_CHAIN_CONFIG.chainId);
    } catch (error) {
      // If chain is not supported, suggest it
      await window.keplr.experimentalSuggestChain(STARGAZE_CHAIN_CONFIG);
      await window.keplr.enable(STARGAZE_CHAIN_CONFIG.chainId);
    }

    // Get the offline signer
    const offlineSigner = window.getOfflineSigner(STARGAZE_CHAIN_CONFIG.chainId);
    
    // Get user account
    const accounts = await offlineSigner.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts found in Keplr wallet');
    }

    const userAddress = accounts[0].address;
    
    // Perform ADR-36 signing for authentication
    const signDoc = await createADR36SignDoc(userAddress);
    const signature = await window.keplr.signArbitrary(
      STARGAZE_CHAIN_CONFIG.chainId,
      userAddress,
      signDoc.message
    );

    return {
      address: userAddress,
      signature: signature,
      signDoc: signDoc,
      offlineSigner: offlineSigner
    };
  } catch (error) {
    console.error('Keplr connection error:', error);
    throw error;
  }
};

// Create ADR-36 compliant sign document
export const createADR36SignDoc = async (address) => {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(7);
  
  const message = `Welcome to Cosmos 2048!

Please sign this message to authenticate your wallet.

Address: ${address}
Timestamp: ${timestamp}
Nonce: ${nonce}

This signature proves ownership of your wallet for secure gameplay.`;

  return {
    message: message,
    timestamp: timestamp,
    nonce: nonce
  };
};

// Get signing client for CosmWasm transactions
export const getSigningClient = async (offlineSigner) => {
  const client = await SigningCosmWasmClient.connectWithSigner(
    STARGAZE_CHAIN_CONFIG.rpc,
    offlineSigner,
    {
      gasPrice: {
        denom: 'ustars',
        amount: '1.1'
      }
    }
  );
  return client;
};

// Verify wallet connection
export const verifyWalletConnection = async (address) => {
  try {
    if (typeof window === 'undefined' || !isKeplrAvailable()) {
      return false;
    }

    const key = await window.keplr.getKey(STARGAZE_CHAIN_CONFIG.chainId);
    return key.bech32Address === address;
  } catch (error) {
    console.error('Wallet verification error:', error);
    return false;
  }
};

// Disconnect wallet (clear local state)
export const disconnectWallet = () => {
  // Keplr doesn't have programmatic disconnect, so we just clear local state
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cosmos_wallet_address');
    localStorage.removeItem('cosmos_wallet_signature');
    localStorage.removeItem('cosmos_wallet_connected');
  }
};

// Get wallet balance
export const getWalletBalance = async (address) => {
  try {
    const response = await fetch(`${STARGAZE_CHAIN_CONFIG.rest}/cosmos/bank/v1beta1/balances/${address}`);
    const data = await response.json();
    
    const starsBalance = data.balances.find(balance => balance.denom === 'ustars');
    return starsBalance ? parseInt(starsBalance.amount) / 1000000 : 0; // Convert to STARS
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
};