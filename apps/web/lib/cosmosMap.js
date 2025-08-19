export const cosmosTokenMap = {
  2: { 
    name: 'ATOM', 
    emoji: '⚛️', 
    color: '#2E3440',
    gradient: 'linear-gradient(135deg, #2E3440 0%, #3B4252 100%)',
    description: 'Cosmos Hub native token'
  },
  4: { 
    name: 'OSMO', 
    emoji: '🧪', 
    color: '#722CF1',
    gradient: 'linear-gradient(135deg, #722CF1 0%, #A855F7 100%)',
    description: 'Osmosis DEX token'
  },
  8: { 
    name: 'JUNO', 
    emoji: '🌀', 
    color: '#F0827D',
    gradient: 'linear-gradient(135deg, #F0827D 0%, #FB7185 100%)',
    description: 'Juno smart contracts'
  },
  16: { 
    name: 'STARS', 
    emoji: '⭐', 
    color: '#DB2777',
    gradient: 'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)',
    description: 'Stargaze NFT hub'
  },
  32: { 
    name: 'SCRT', 
    emoji: '🔐', 
    color: '#1F2937',
    gradient: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
    description: 'Secret Network privacy'
  },
  64: { 
    name: 'EVMOS', 
    emoji: '🚀', 
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
    description: 'Evmos EVM compatibility'
  },
  128: { 
    name: 'AKT', 
    emoji: '☁️', 
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    description: 'Akash cloud computing'
  },
  256: { 
    name: 'REGEN', 
    emoji: '🌱', 
    color: '#22C55E',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
    description: 'Regen regenerative economy'
  },
  512: { 
    name: 'CRO', 
    emoji: '💎', 
    color: '#1D4ED8',
    gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    description: 'Crypto.com Chain'
  },
  1024: { 
    name: 'KAVA', 
    emoji: '🔥', 
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    description: 'Kava DeFi platform'
  },
  2048: { 
    name: 'COSMOS', 
    emoji: '🌌', 
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    description: 'Internet of Blockchains'
  },
  4096: { 
    name: 'INFINITY', 
    emoji: '♾️', 
    color: '#F472B6',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #F9A8D4 100%)',
    description: 'Beyond the cosmos!'
  }
};

export const getTileData = (value) => {
  return cosmosTokenMap[value] || { 
    name: value.toString(), 
    emoji: '✨', 
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
    description: 'Unknown token'
  };
};

// Get tile animation class based on value
export const getTileAnimationClass = (value) => {
  if (value >= 2048) return 'animate-pulse';
  if (value >= 1024) return 'animate-bounce';
  return '';
};

// Get rarity level for NFT minting
export const getTileRarity = (maxTile) => {
  if (maxTile >= 4096) return 'legendary';
  if (maxTile >= 2048) return 'epic';
  if (maxTile >= 1024) return 'rare';
  if (maxTile >= 512) return 'uncommon';
  return 'common';
};

// Prize configurations for Wheel of Fortune
export const wheelPrizes = [
  {
    id: 'common_badge',
    name: 'Common Badge',
    emoji: '🥉',
    color: '#9CA3AF',
    probability: 0.4,
    rarity: 'common'
  },
  {
    id: 'uncommon_badge', 
    name: 'Uncommon Badge',
    emoji: '🥈',
    color: '#10B981',
    probability: 0.3,
    rarity: 'uncommon'
  },
  {
    id: 'rare_badge',
    name: 'Rare Badge',
    emoji: '🥇',
    color: '#3B82F6',
    probability: 0.15,
    rarity: 'rare'
  },
  {
    id: 'epic_badge',
    name: 'Epic Badge',
    emoji: '💎',
    color: '#8B5CF6',
    probability: 0.1,
    rarity: 'epic'
  },
  {
    id: 'legendary_badge',
    name: 'Legendary Badge',
    emoji: '👑',
    color: '#F59E0B',
    probability: 0.04,
    rarity: 'legendary'
  },
  {
    id: 'nothing',
    name: 'Try Again',
    emoji: '😅',
    color: '#EF4444',
    probability: 0.01,
    rarity: 'none'
  }
];