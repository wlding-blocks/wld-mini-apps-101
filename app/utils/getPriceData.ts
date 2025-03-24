interface TokenPriceData {
  price: string | null;
  priceChange24h: number | null;
  volume24h: number | null;
  chainId?: string | null;
  dexId?: string | null;
}

interface PriceResponse {
  [key: string]: TokenPriceData;
}

// Define interface for DexScreener pair data
interface DexScreenerPair {
  chainId: string;
  dexId: string;
  priceUsd: string;
  priceChange: {
    h24: number;
  };
  volume: {
    h24: number;
  };
  [key: string]: any; // For other properties we don't explicitly use
}

export async function getTokensPrices(tokenAddresses: string[]): Promise<PriceResponse> {
  const prices: PriceResponse = {};

  try {
    // Fetch all token prices in parallel
    const promises = tokenAddresses.map(async (address) => {
      // DexScreener API endpoint
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`
      );
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        // Look for World Chain pairs first (chainId 'wld' or similar)
        let worldChainPair = data.pairs.find((pair: DexScreenerPair) => 
          pair.chainId?.toLowerCase() === 'wld' || 
          pair.chainId?.toLowerCase().includes('world')
        );
        
        // If no World Chain pair found, just use the first one
        const pair = worldChainPair || data.pairs[0];
        
        return {
          address,
          price: pair.priceUsd,
          priceChange24h: pair.priceChange?.h24,
          volume24h: pair.volume?.h24,
          chainId: pair.chainId,
          dexId: pair.dexId
        };
      }
      return {
        address,
        price: null,
        priceChange24h: null,
        volume24h: null,
        chainId: null,
        dexId: null
      };
    });

    const results = await Promise.all(promises);
    
    // Convert results to an object keyed by address
    results.forEach((result) => {
      prices[result.address] = {
        price: result.price,
        priceChange24h: result.priceChange24h,
        volume24h: result.volume24h,
        chainId: result.chainId,
        dexId: result.dexId
      };
    });

    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return {};
  }
} 