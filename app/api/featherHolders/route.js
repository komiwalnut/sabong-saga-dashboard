import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import redisClient from '../../lib/redisClient';
import { namehash } from 'ethers';

const ONCHAIN_API = 'https://skynet-api.roninchain.com/ronin/explorer/v2/tokens/0xc5da607b372eca2794f5b5452148751c358eb53c/top_holders';
const CACHE_EXPIRY_TIME = 600;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 25;
  const offset = (page - 1) * limit;
  
  const cacheKey = `featherHolders:page-${page}:limit-${limit}`;
  
  try {
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        if (parsedCache && parsedCache.holders) {
          return NextResponse.json(parsedCache);
        }
      }
    }

    const onchainRes = await fetch(`${ONCHAIN_API}?limit=${limit}&offset=${offset}`);

    if (!onchainRes.ok) {
      throw new Error('Onchain API Error');
    }
    
    const onchainJson = await onchainRes.json();
    if (!onchainJson?.result?.items) {
      throw new Error('Invalid onchain response');
    }

    const totalOnchain = onchainJson.result.paging.total;
    const totalPages = Math.ceil(totalOnchain / limit);
    
    const holders = await Promise.all(
      onchainJson.result.items.map(async (item) => {
        return {
          address: item.ownerAddress,
          displayName: await getRnsName(item.ownerAddress) || item.ownerAddress,
          balance: formatFeatherBalance(item.balance),
          updatedAt: item.updatedAt
        };
      })
    );

    holders.sort((a, b) => 
      parseFloat(b.balance.replace(/,/g, '')) - parseFloat(a.balance.replace(/,/g, ''))
    );

    const fetchedUpdatedAt = new Date(onchainJson.result.items[0].updatedAt * 1000)
          .toISOString()
          .replace('T', ' ')
          .slice(0, 16) + ' UTC';

    const result = {
      holders: holders,
      updatedAt: fetchedUpdatedAt,
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

async function getRnsName(address) {
  try {
    const reverseDomain = address.slice(2) + '.addr.reverse';
    const reverseNameHash = namehash(reverseDomain);
    const data = '0x691f3431' + reverseNameHash.slice(2);
    
    const payload = {
      method: 'eth_call',
      params: [{
        to: '0xadb077d236d9e81fb24b96ae9cb8089ab9942d48',
        data: data,
      }, 'latest'],
      id: 0,
      jsonrpc: '2.0'
    };

    const response = await fetch('https://api.roninchain.com/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    const hexResult = responseData.result;
    if (!hexResult || hexResult === '0x') {
      return null;
    }
    return cleanHexToString(hexResult);
  } catch (error) {
    return null;
  }
}

function cleanHexToString(hexStr) {
  if (hexStr.startsWith('0x')) {
    hexStr = hexStr.slice(2);
  }
  const buffer = Buffer.from(hexStr, 'hex');
  const decoded = buffer.toString('utf8').replace(/[^\x20-\x7E]+/g, '').trim();
  return decoded;
}