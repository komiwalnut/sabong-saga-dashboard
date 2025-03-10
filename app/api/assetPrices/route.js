import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cockPriceResponse = await fetch(
      'https://exchange-rate.skymavis.com/v2/prices?addresses=0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad',
      { next: { revalidate: 60 } }
    );
    
    if (!cockPriceResponse.ok) {
      throw new Error(`Failed to fetch COCK price: ${cockPriceResponse.status}`);
    }
    
    const cockPriceData = await cockPriceResponse.json();
    const cockUsdPrice = cockPriceData.result?.['0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad']?.usd || null;

    const featherPriceResponse = await fetch('https://marketplace-graphql.skymavis.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: "GetTokenData",
        variables: {
          tokenAddress: "0xc5da607b372eca2794f5b5452148751c358eb53c"
        },
        query: `query GetTokenData($tokenAddress: String, $slug: String) {
          tokenData(tokenAddress: $tokenAddress, slug: $slug) {
            minPrice
          }
        }`
      }),
      next: { revalidate: 60 }
    });
    
    if (!featherPriceResponse.ok) {
      throw new Error(`Failed to fetch Feather price: ${featherPriceResponse.status}`);
    }
    
    const featherData = await featherPriceResponse.json();
    let featherRonPrice = null;
    
    if (featherData.data?.tokenData?.minPrice) {
      featherRonPrice = parseInt(featherData.data.tokenData.minPrice) / 10**18;
    }

    return NextResponse.json({
      cockPrice: cockUsdPrice,
      featherPrice: featherRonPrice
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset prices', message: error.message },
      { status: 500 }
    );
  }
}