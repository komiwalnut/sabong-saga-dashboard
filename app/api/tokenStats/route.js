import { NextResponse } from 'next/server'
import fetch from 'node-fetch'
import redisClient from '../../lib/redisClient'

const CACHE_EXPIRY_TIME = 600
const TOTAL_SUPPLY = 1000000000

async function getTotalCirculating() {
  try {
    const [res1, res2] = await Promise.all([
      fetch('https://api.roninchain.com/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'eth_call',
          params: [{
            to: "0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad",
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
            to: "0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad",
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
    return TOTAL_SUPPLY - (Number(sum) / 10**18)
  } catch (error) {
    console.error('RPC Error:', error)
    return null
  }
}

export async function GET() {
  const cacheKey = 'tokenStats'
  
  try {
    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey)
      if (cached) return NextResponse.json(JSON.parse(cached))
    }

    const [circulating, transfersRes] = await Promise.all([
      getTotalCirculating(),
      fetch('https://skynet-api.roninchain.com/ronin/explorer/v2/collections/0x8fd6b3fa81adf438feeb857e0b8aed5f74f718ad/transfers?offset=0&limit=1')
    ])

    const transfersData = await transfersRes.json()
    const stats = {
      totalSupply: TOTAL_SUPPLY,
      circulating: circulating !== null ? circulating : null,
      burned: TOTAL_SUPPLY - circulating,
      transfers: transfersData.result.paging.total
    }

    if (redisClient.isReady) {
      await redisClient.set(cacheKey, JSON.stringify(stats), { EX: CACHE_EXPIRY_TIME })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Token Stats Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token stats' },
      { status: 500 }
    )
  }
}