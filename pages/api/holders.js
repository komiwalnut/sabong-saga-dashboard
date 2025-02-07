import fetch from 'node-fetch';
import redisClient from '../../lib/redisClient';

const API_URL = 'https://skynet-api.roninchain.com/ronin/explorer/v2/tokens/0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad/top_holders';
const CACHE_EXPIRY_TIME = 600;

export default async function handler(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const offset = (page - 1) * limit;
  
  try {
    const cacheKey = `holdersData:page-${page}:limit-${limit}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Serving page from cache");
      return res.json(JSON.parse(cachedData));
    }
    
    const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    
    const json = await response.json();
    const totalHolders = json.result.paging.total;
    const totalPages = Math.ceil(totalHolders / limit);
    
    const holders = json.result.items.map(item => ({
      address: item.ownerAddress,
      balance: formatBalance(item.balance),
      percentage: formatPercentage(item.percentage),
    }));
    
    const fetchedUpdatedAt = new Date(json.result.items[0].updatedAt * 1000)
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16) + ' UTC';
    
    const result = {
      holders,
      updatedAt: fetchedUpdatedAt,
      totalPages,
      currentPage: page,
      totalHolders,
    };
    
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: CACHE_EXPIRY_TIME });
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching token holders:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

function formatBalance(balance) {
  let formattedBalance = parseFloat(balance);
  if (formattedBalance <= 0.0001) return '0.0001';
  if (formattedBalance < 1 && formattedBalance > 0.0001) return formattedBalance.toFixed(3);
  return formattedBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPercentage(percentage) {
  let formattedPercentage = parseFloat(percentage * 100);
  if (formattedPercentage <= 0.0001) return '0.0001%';
  if (formattedPercentage < 0.1 && formattedPercentage > 0.0001) return formattedPercentage.toFixed(4) + '%';
  return formattedPercentage.toFixed(2) + '%';
}
