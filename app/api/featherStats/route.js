import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import redisClient from '../../lib/redisClient';

const CACHE_EXPIRY_TIME = 600;
const TOTAL_API = 'https://feather-dashboard.vercel.app/api/feathers/total';
const GRAPHQL_API = 'https://marketplace-graphql.skymavis.com/graphql';

/*async function getTotalBurned() {
  try {
    const [res1, res2] = await Promise.all([
      fetch('https://api.roninchain.com/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'eth_call',
          params: [{
            to: "0xc5da607b372eca2794f5b5452148751c358eb53c",
            data: "0x70a08231000000000000000000000000000000000000000000000000000000000000dead"
          }, "latest"],
          id: 43,
          jsonrpc: "2.0"
        })
      }),
      fetch('https://api.roninchain.com/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'eth_call',
          params: [{
            to: "0xc5da607b372eca2794f5b5452148751c358eb53c",
            data: "0x70a082310000000000000000000000000000000000000000000000000000000000000000"
          }, "latest"],
          id: 44,
          jsonrpc: "2.0"
        })
      })
    ])

    const data1 = await res1.json()
    const data2 = await res2.json()
    const sum = BigInt(data1.result) + BigInt(data2.result)
    return sum
  } catch (error) {
    console.error('RPC Error:', error)
    return null
  }
}*/

export async function GET() {
  const cacheKey = 'featherStats';
  try {
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) return NextResponse.json(JSON.parse(cached));
    }

    const authToken = process.env.auth_token || '';

    const graphqlQuery = {
      "operationName": "GetTokenData",
      "variables": {
        "tokenAddress": "0xc5da607b372eca2794f5b5452148751c358eb53c"
      },
      "query": `
        query GetTokenData($tokenAddress: String) {
          tokenData(tokenAddress: $tokenAddress) {
            totalOwners
          }
        }
      `
    };

    const [totalRes, graphqlRes] = await Promise.all([
      fetch(TOTAL_API, {
        headers: {
          'Cookie': `auth_token=${authToken}`
        }
      }),
      fetch(GRAPHQL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery)
      })
      //getTotalBurned()
    ]);

    let totalData = { claimable: 0, totalWithdraws: 0, onChain: "0" };
    if (totalRes.ok) {
      totalData = await totalRes.json();
    }

    let totalOwners = 0;
    if (graphqlRes.ok) {
      const graphqlData = await graphqlRes.json();
      totalOwners = graphqlData?.data?.tokenData?.totalOwners || 0;
    }

    const stats = {
      totalOwners: totalOwners,
      quantity: parseInt(totalData.onChain || "0"),
      claimable: totalData.claimable || 0,
      totalWithdraws: totalData.totalWithdraws || 0
    };

    if (redisClient.isReady) {
      await redisClient.set(cacheKey, JSON.stringify(stats), { EX: CACHE_EXPIRY_TIME });
    }

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}