import { NextResponse } from 'next/server'
import fetch from 'node-fetch'
import redisClient from '../../lib/redisClient'
import { namehash } from 'ethers'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || 1);
    const limit = parseInt(searchParams.get('limit') || 25);

    const totalFeathers = await redisClient.zcard('feathers');
    const totalPages = Math.ceil(totalFeathers / limit);
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const holders = await redisClient.zrevrange('feathers', start, end, 'WITHSCORES');
    const formatted = [];
    
    for (let i = 0; i < holders.length; i += 2) {
      formatted.push({
        address: holders[i],
        balance: holders[i + 1],
        percentage: ((holders[i + 1] / totalFeathers) * 100).toFixed(2)
      });
    }

    return Response.json({
      holders: formatted,
      totalPages,
      totalFeathers,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch feather holders' },
      { status: 500 }
    );
  }
}