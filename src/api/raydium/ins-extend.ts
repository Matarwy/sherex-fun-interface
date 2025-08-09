// pages/api/raydium/ins-extend.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' }); return
  }
  try {
    const upstream = 'https://service-v1.raydium.io/ins-extend'
    const r = await fetch(upstream, {
      method: req.method,
      headers: { 'content-type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body ?? {}) : undefined
    })
    const text = await r.text()
    res.setHeader('Cache-Control', 'no-store')
    res.status(r.status).send(text)
  } catch (e: any) {
    res.status(502).json({ error: 'Upstream error', message: e?.message ?? 'Unknown' })
  }
}
