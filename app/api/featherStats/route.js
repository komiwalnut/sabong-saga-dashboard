import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import redisClient from '../../lib/redisClient';

const CACHE_EXPIRY_TIME = 600;
const FEATHER_API = 'https://skynet-api.roninchain.com/ronin/explorer/v2/collections/0xc5da607b372eca2794f5b5452148751c358eb53c/nfts/stats';
const DAU_API = ''; // Replace with actual API

async function fetchDailyActiveUsers() {
  try {
    const response = await fetch(DAU_API);
    if (!response.ok) return 0;
    const data = await response.json();
    // Modify according to actual API response structure
    return data.dailyActiveUsers || data.count || 0;
  } catch (error) {
    console.error('DAU API Error:', error);
    return 0;
  }
}

export async function GET() {
  const cacheKey = 'featherStats';
  try {
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return NextResponse.json(JSON.parse(cached));
    }

    const [featherRes, dau] = await Promise.all([
      fetch(FEATHER_API, { method: 'POST' }),
      fetchDailyActiveUsers()
    ]);

    if (!featherRes.ok) throw new Error('Feather stats failed');
    
    const featherData = await featherRes.json();
    const featherStats = featherData.result?.items?.[0] || {};

    const stats = {
      totalOwners: featherStats.totalOwners || 0,
      quantity: featherStats.quantity || 0,
      dailyActiveUsers: dau
    };

    if (redisClient.isReady) {
      await redisClient.set(cacheKey, JSON.stringify(stats), { EX: CACHE_EXPIRY_TIME });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}