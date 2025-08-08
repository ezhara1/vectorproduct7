export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  try {
    const { vectorIds = [], latestN = 60 } = JSON.parse(event.body || '{}')
    if (!Array.isArray(vectorIds) || vectorIds.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'vectorIds required' }) }
    }
    // Strip 'v' prefix and ensure numeric ids
    const payload = vectorIds.map(id => ({
      vectorId: Number(String(id).replace(/^v/i, '')),
      latestN: Number(latestN)
    }))

    const resp = await fetch('https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!resp.ok) {
      const t = await resp.text()
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error', detail: t }) }
    }
    const raw = await resp.json()

    // Normalize into chart/table friendly series
    const series = raw.filter(r => r?.status === 'SUCCESS').map(r => {
      const obj = r.object || {}
      const data = (obj.vectorDataPoint || []).map(p => ({
        refPer: p.refPerRaw || p.refPer || '',
        value: p.value === null || p.value === '' ? null : Number(p.value)
      })).reverse() // chronological ascending
      return {
        label: 'v' + (obj.vectorId ?? ''),
        productId: obj.productId,
        table: data
      }
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series })
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) }
  }
}
