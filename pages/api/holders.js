import fetch from 'node-fetch';
import redisClient from '../../lib/redisClient';

const API_URL = 'https://skynet-api.roninchain.com/ronin/explorer/v2/tokens/0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad/top_holders';
const LIMIT = 200;
const CACHE_KEY = 'holdersData';
const CACHE_UPDATED_AT_KEY = 'LastUpdatedAt';
const CACHE_EXPIRY_TIME = 300;

export default async function handler(req, res) {
    try {
        console.time("Redis Get");
        const cachedData = await redisClient.get(CACHE_KEY);
        const cacheUpdatedAt = await redisClient.get(CACHE_UPDATED_AT_KEY);
        console.timeEnd("Redis Get");

        if (cachedData && cacheUpdatedAt) {
            console.log("Serving from cache");
            return res.json({ holders: JSON.parse(cachedData), updatedAt: cacheUpdatedAt });
        }

        console.log("Fetching first API response...");
        const firstResponse = await fetch(`${API_URL}?limit=${LIMIT}&offset=0`);
        if (!firstResponse.ok) throw new Error(`API Error: ${firstResponse.statusText}`);
        
        const firstJson = await firstResponse.json();
        console.log(firstJson);
        const totalHolders = firstJson.result.paging.total;
        
        console.log(`Total holders: ${totalHolders}`);
        
        const fetchedUpdatedAt = new Date(firstJson.result.items[0].updatedAt * 1000)
            .toISOString()
            .replace('T', ' ')
            .slice(0, 16) + ' UTC';

        let allHolders = [];
        let offset = 0;
        let callCount = 0;

        while (offset < totalHolders) {
            console.log(`Fetching holders from offset ${offset}...`);
            const response = await fetch(`${API_URL}?limit=${LIMIT}&offset=${offset}`);
            if (!response.ok) throw new Error(`API Error at offset ${offset}: ${response.statusText}`);
            
            const json = await response.json();
            allHolders.push(
                ...json.result.items.map(item => ({
                    address: item.ownerAddress,
                    balance: formatBalance(item.balance),
                    percentage: formatPercentage(item.percentage),
                }))
            );
        
            offset += LIMIT;
            callCount++;
        
            if (callCount % 10 === 0) {
                console.log("Rate limit delay of 1.5 seconds...");
                await delay(2000);
            }
        }

        console.time("Redis Set");
        await redisClient.set(CACHE_KEY, JSON.stringify(allHolders), { EX: CACHE_EXPIRY_TIME });
        await redisClient.set(CACHE_UPDATED_AT_KEY, fetchedUpdatedAt, { EX: CACHE_EXPIRY_TIME });
        console.timeEnd("Redis Set");

        console.log("Data fetched successfully!");
        res.json({ holders: allHolders, updatedAt: fetchedUpdatedAt });

    } catch (error) {
        console.error('Error fetching token holders:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
