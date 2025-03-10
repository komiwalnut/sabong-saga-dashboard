import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { DuneClient } from "@duneanalytics/client-sdk";
import redisClient from '../../lib/redisClient';

const CACHE_EXPIRY_TIME = 600;
const TOTAL_API = 'https://feather-dashboard.vercel.app/api/feathers/total';
const GRAPHQL_API = 'https://marketplace-graphql.skymavis.com/graphql';

async function getTotalBurned() {
  try {
    const duneApiKey = process.env.DUNE_KEY;
    if (!duneApiKey) {
      throw new Error("DUNE_KEY not found in environment variables");
    }
    
    const dune = new DuneClient(duneApiKey);
    const queryResult = await dune.getLatestResult({ queryId: 4832247 });
    
    if (!queryResult || !queryResult.result || !queryResult.result.rows || queryResult.result.rows.length === 0) {
      throw new Error("No data returned from Dune query");
    }
    
    const burnedTokens = queryResult.result.rows[0].total_feathers_burned;

    return BigInt(burnedTokens);
  } catch (error) {
    console.error('Dune API Error:', error);
    return null;
  }
}

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

    const [totalRes, graphqlRes, burnedTokens] = await Promise.all([
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
      }),
      getTotalBurned()
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

    const formattedBurnedTokens = burnedTokens 
      ? burnedTokens.toString() 
      : "0";

    const stats = {
      totalOwners: totalOwners,
      quantity: parseInt(totalData.onChain || "0"),
      claimable: totalData.claimable || 0,
      totalWithdraws: totalData.totalWithdraws || 0,
      burnedTokens: formattedBurnedTokens
    };

    if (redisClient.isReady) {
      await redisClient.set(cacheKey, JSON.stringify(stats), { EX: CACHE_EXPIRY_TIME });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}