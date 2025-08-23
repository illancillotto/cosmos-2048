// Stargaze NFT minting functionality
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { getSigningClient, STARGAZE_CHAIN_CONFIG } from './keplr';

// Contract addresses (these should be environment variables in production)
export const NFT_CONFIG = {
  // This should be replaced with actual deployed contract address
  contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || 'stars1...',
  // Minter address for admin functions (if needed)
  minterAddress: process.env.NEXT_PUBLIC_MINTER_ADDRESS || 'stars1...',
  // Collection name
  collectionName: 'Cosmos 2048 Game Badges',
  // Base URI for metadata
  baseTokenUri: process.env.NEXT_PUBLIC_BASE_TOKEN_URI || 'https://api.cosmos2048.com/metadata/',
};

// Generate metadata for NFT
export const generateNFTMetadata = (gameData, wheelPrize) => {
  const { score, maxTile, timestamp, address } = gameData;
  const { rarity, name, emoji } = wheelPrize;

  const metadata = {
    name: `Cosmos 2048 ${name}`,
    description: `A ${rarity} game badge earned by achieving ${score.toLocaleString()} points and reaching the ${maxTile} tile in Cosmos 2048. ${emoji}`,
    image: `${NFT_CONFIG.baseTokenUri}images/${rarity}-${maxTile}.png`,
    external_url: 'https://cosmos2048.com',
    attributes: [
      {
        trait_type: 'Game',
        value: 'Cosmos 2048'
      },
      {
        trait_type: 'Score',
        value: score,
        display_type: 'number'
      },
      {
        trait_type: 'Max Tile',
        value: maxTile,
        display_type: 'number'
      },
      {
        trait_type: 'Rarity',
        value: rarity
      },
      {
        trait_type: 'Prize Type',
        value: name
      },
      {
        trait_type: 'Player Address',
        value: address
      },
      {
        trait_type: 'Date Earned',
        value: new Date(timestamp).toISOString(),
        display_type: 'date'
      },
      {
        trait_type: 'Game Session',
        value: `${timestamp}-${address.slice(-6)}`,
      }
    ],
    properties: {
      rarity: rarity,
      game_score: score,
      max_tile: maxTile,
      wheel_prize: wheelPrize.id,
      minted_at: timestamp,
      player: address
    }
  };

  return metadata;
};

// Generate unique token ID
export const generateTokenId = (address, timestamp, score) => {
  // Create a unique token ID using address, timestamp, and score
  const addressSuffix = address.slice(-6);
  const timestampSuffix = timestamp.toString().slice(-6);
  const scoreSuffix = score.toString().padStart(8, '0');
  
  return `c2048-${addressSuffix}-${timestampSuffix}-${scoreSuffix}`;
};

// Upload metadata to IPFS or server (mock implementation)
export const uploadMetadata = async (metadata) => {
  try {
    // In production, this would upload to IPFS or a decentralized storage
    // For now, we'll return a mock URI
    const tokenId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const metadataUri = `${NFT_CONFIG.baseTokenUri}${tokenId}.json`;
    
    // Mock API call to store metadata
    console.log('Uploading metadata:', metadata);
    console.log('Generated URI:', metadataUri);
    
    // In a real implementation, you would:
    // const response = await fetch('/api/metadata/upload', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metadata)
    // });
    // const { uri } = await response.json();
    // return uri;
    
    return metadataUri;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw new Error('Failed to upload NFT metadata');
  }
};

// Mint NFT on Stargaze
export const mintGameBadgeNFT = async (offlineSigner, gameData, wheelPrize) => {
  try {
    // Check if NFT minting is enabled
    const validation = await validateNFTContract();
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (!offlineSigner) {
      throw new Error('No wallet signer available');
    }

    if (wheelPrize.rarity === 'none') {
      throw new Error('No NFT to mint for this prize');
    }

    // Generate metadata and upload
    const metadata = generateNFTMetadata(gameData, wheelPrize);
    const tokenUri = await uploadMetadata(metadata);
    
    // Generate unique token ID
    const tokenId = generateTokenId(
      gameData.address, 
      gameData.timestamp, 
      gameData.score
    );

    // Get signing client
    const client = await getSigningClient(offlineSigner);
    
    // Prepare mint message
    const mintMsg = {
      mint: {
        token_id: tokenId,
        owner: gameData.address,
        token_uri: tokenUri,
        extension: {
          description: metadata.description,
          image: metadata.image,
          external_url: metadata.external_url,
          attributes: metadata.attributes,
          properties: metadata.properties
        }
      }
    };

    // Calculate gas fee
    const fee = {
      amount: [
        {
          denom: 'ustars',
          amount: '500000', // 0.5 STARS
        },
      ],
      gas: '200000',
    };

    console.log('Minting NFT with message:', mintMsg);

    // Execute mint transaction
    const result = await client.execute(
      gameData.address,
      NFT_CONFIG.contractAddress,
      mintMsg,
      fee,
      `Minting Cosmos 2048 ${wheelPrize.name} Badge`
    );

    console.log('NFT minted successfully:', result);

    return {
      success: true,
      tokenId: tokenId,
      transactionHash: result.transactionHash,
      metadata: metadata,
      tokenUri: tokenUri,
      blockHeight: result.height
    };

  } catch (error) {
    console.error('NFT minting failed:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown minting error',
      details: error
    };
  }
};

// Query user's NFTs (for BadgeGallery component)
export const getUserNFTs = async (userAddress, limit = 50) => {
  try {
    if (!userAddress) {
      return [];
    }

    // Query NFTs owned by user
    const queryMsg = {
      tokens: {
        owner: userAddress,
        limit: limit
      }
    };

    // This would typically use a query client
    // For now, return mock data structure
    console.log('Querying NFTs for address:', userAddress);
    
    // In production:
    // const client = await CosmWasmClient.connect(STARGAZE_CHAIN_CONFIG.rpc);
    // const result = await client.queryContractSmart(NFT_CONFIG.contractAddress, queryMsg);
    // return result.tokens || [];

    // Mock response
    return [];
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    return [];
  }
};

// Get NFT details by token ID
export const getNFTDetails = async (tokenId) => {
  try {
    const queryMsg = {
      nft_info: {
        token_id: tokenId
      }
    };

    // In production:
    // const client = await CosmWasmClient.connect(STARGAZE_CHAIN_CONFIG.rpc);
    // const result = await client.queryContractSmart(NFT_CONFIG.contractAddress, queryMsg);
    // return result;

    // Mock response
    return null;
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    return null;
  }
};

// Check if NFT minting is enabled
export const isNFTMintingEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_NFT_MINTING === 'true';
};

// Validate contract address
export const validateNFTContract = async () => {
  try {
    if (!isNFTMintingEnabled()) {
      return {
        valid: false,
        error: 'NFT minting is disabled in configuration. Set NEXT_PUBLIC_ENABLE_NFT_MINTING=true to enable.'
      };
    }

    if (!NFT_CONFIG.contractAddress || NFT_CONFIG.contractAddress === 'stars1...' || NFT_CONFIG.contractAddress.includes('example')) {
      return {
        valid: false,
        error: 'NFT contract address not configured. Please set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS with a valid Stargaze contract address.'
      };
    }

    // In production, query contract info to validate
    return {
      valid: true,
      contractAddress: NFT_CONFIG.contractAddress
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};