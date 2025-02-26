import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import redisClient from '../../lib/redisClient';
import { namehash } from 'ethers';

const ONCHAIN_API = 'https://skynet-api.roninchain.com/ronin/explorer/v2/tokens/0xc5da607b372eca2794f5b5452148751c358eb53c/top_holders';
const OFFCHAIN_API = ''; // Replace with actual API
const CACHE_EXPIRY_TIME = 600;

async function fetchOffchainData() {
  try {
    const response = await fetch(OFFCHAIN_API);
    if (!response.ok) return { holders: [], total: 0 };
    const data = await response.json();
    // Modify according to actual API response structure
    return {
      holders: data.holders || data.results || [],
      total: data.total || 0
    };
  } catch (error) {
    console.error('Offchain API Error:', error);
    return { holders: [], total: 0 };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 25;
  const offset = (page - 1) * limit;
  
  const cacheKey = `featherHolders:page-${page}:limit-${limit}`;
  
  try {
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) return NextResponse.json(JSON.parse(cachedData));
    }

    const [onchainRes, offchainData] = await Promise.all([
      fetch(`${ONCHAIN_API}?limit=${limit}&offset=${offset}`),
      fetchOffchainData()
    ]);

    if (!onchainRes.ok) throw new Error('Onchain API Error');
    
    const onchainJson = await onchainRes.json();
    if (!onchainJson?.result?.items) throw new Error('Invalid onchain response');

    const totalOnchain = onchainJson.result.paging.total;
    const totalPages = Math.ceil(totalOnchain / limit);
    const totalSupply = parseFloat(onchainJson.result.items[0]?.quantity || 0) + offchainData.total;
    
    const mergedHolders = await Promise.all(
      onchainJson.result.items.map(async (item) => {
        const offchainHolder = offchainData.holders.find(
          h => h.address.toLowerCase() === item.ownerAddress.toLowerCase()
        ) || { balance: 0 };

        const onchainBalance = parseFloat(item.balance);
        const offchainBalance = parseFloat(offchainHolder.balance);
        const total = onchainBalance + offchainBalance;

        return {
          address: item.ownerAddress,
          displayName: await getRnsName(item.ownerAddress) || item.ownerAddress,
          onchain: formatFeatherBalance(item.balance),
          offchain: formatFeatherBalance(offchainHolder.balance),
          total: formatFeatherBalance(total.toString()),
          percentage: formatFeatherPercentage((total / totalSupply) * 10000), // Convert to basis points
          updatedAt: item.updatedAt
        };
      })
    );

    mergedHolders.sort((a, b) => 
      parseFloat(b.onchain.replace(/,/g, '')) - parseFloat(a.onchain.replace(/,/g, ''))
    );

    const result = {
      holders: mergedHolders,
      updatedAt: new Date(onchainJson.result.items[0].updatedAt * 1000)
        .toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      totalPages,
      currentPage: page,
      totalHolders: totalOnchain
    };

    if (redisClient.isReady) {
      await redisClient.set(cacheKey, JSON.stringify(result), { 
        EX: CACHE_EXPIRY_TIME 
      });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function formatFeatherBalance(balance) {
  const numericBalance = parseFloat(balance);
  if (numericBalance === 0) return '0';
  
  if (numericBalance >= 1000) {
    return numericBalance.toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  }
  
  return parseFloat(numericBalance.toFixed(4)).toString();
}

function formatFeatherPercentage(apiPercentage) {
  const percentage = parseFloat(apiPercentage) / 100;
  return percentage.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }) + '%';
}

async function getRnsName(address) {
  try {
    const reverseDomain = address.slice(2) + '.addr.reverse'
    const reverseNameHash = namehash(reverseDomain)
    const data = '0x691f3431' + reverseNameHash.slice(2)
    
    const payload = {
      method: 'eth_call',
      params: [{
        to: '0xadb077d236d9e81fb24b96ae9cb8089ab9942d48',
        data: data,
      }, 'latest'],
      id: 0,
      jsonrpc: '2.0'
    }

    const response = await fetch('https://api.roninchain.com/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const responseData = await response.json()
    return cleanHexToString(responseData.result)
  } catch (error) {
    console.error('RNS lookup failed:', error)
    return null
  }
}

function cleanHexToString(hexStr) {
  if (!hexStr || hexStr === '0x') return null
  try {
    return Buffer.from(hexStr.slice(2), 'hex')
      .toString('utf8')
      .replace(/\0/g, '')
      .trim()
  } catch {
    return null
  }
}