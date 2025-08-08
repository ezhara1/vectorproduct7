import React, { useEffect, useMemo, useState } from 'react'
import ProductBrowser from './components/ProductBrowser.jsx'
import ChartArea from './components/ChartArea.jsx'
import TableView from './components/TableView.jsx'

export default function App() {
  const [catalog, setCatalog] = useState([])
  const [selectedVectors, setSelectedVectors] = useState([]) // [{vectorId, text}]
  const [chartType, setChartType] = useState('line')
  const [latestN, setLatestN] = useState(60)
  const [loading, setLoading] = useState(false)
  const [series, setSeries] = useState([]) // [{label, data:[{x,y}], table:[...] }]
  const [error, setError] = useState('')

  useEffect(() => {
    // Try to load `data.json` as a static asset first (if placed under /public)
    fetch('/data.json')
      .then(async r => {
        if (!r.ok) throw new Error('not ok')
        return r.json()
      })
      .then(setCatalog)
      .catch(async () => {
        // Fallback: import from project root so dev works without moving the file
        try {
          const mod = await import('../data.json')
          setCatalog(mod.default || mod)
        } catch (e) {
          setError('Failed to load data.json')
        }
      })
  }, [])

  const vectorIds = useMemo(() => selectedVectors.map(v => v.vectorId), [selectedVectors])

  async function fetchData() {
    setError('')
    setLoading(true)
    try {
      // Primary: Netlify Function route
      const res = await fetch('/api/statcan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vectorIds, latestN: Number(latestN) || 60 })
      })
      let ok = res.ok
      let data
      if (ok) {
        data = await res.json()
      } else {
        // Fallback for local dev without Netlify: call StatsCan directly
        const payload = vectorIds.map(id => ({
          vectorId: Number(String(id).replace(/^v/i, '')),
          latestN: Number(latestN) || 60
        }))
        const direct = await fetch('https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!direct.ok) throw new Error('Request failed')
        const raw = await direct.json()
        data = {
          series: raw.filter(r => r?.status === 'SUCCESS').map(r => {
            const obj = r.object || {}
            const table = (obj.vectorDataPoint || []).map(p => ({
              refPer: p.refPerRaw || p.refPer || '',
              value: p.value === null || p.value === '' ? null : Number(p.value)
            })).reverse()
            return { label: 'v' + (obj.vectorId ?? ''), productId: obj.productId, table }
          })
        }
      }
      setSeries(data.series || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function onDropVector(v) {
    if (!selectedVectors.some(s => s.vectorId === v.vectorId)) {
      setSelectedVectors(prev => [...prev, v])
    }
  }

  function removeVector(id) {
    setSelectedVectors(prev => prev.filter(v => v.vectorId !== id))
  }

  return (
    <div className="layout">
      <header>
        <h1>StatsCan Visualizer</h1>
        <div className="controls">
          <label>
            Latest periods
            <input type="number" min="1" max="5000" value={latestN} onChange={e => setLatestN(e.target.value)} />
          </label>
          <label>
            Chart type
            <select value={chartType} onChange={e => setChartType(e.target.value)}>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="scatter">Scatter</option>
            </select>
          </label>
          <button onClick={fetchData} disabled={loading || selectedVectors.length === 0}>
            {loading ? 'Fetching…' : 'Fetch & Visualize'}
          </button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <main>
        <aside>
          <ProductBrowser catalog={catalog} onDropTargetId="chart-drop" onDragVector={() => {}} />
        </aside>
        <section>
          <ChartArea
            id="chart-drop"
            selected={selectedVectors}
            onDropVector={onDropVector}
            onRemove={removeVector}
            chartType={chartType}
            series={series}
          />
          <TableView series={series} />
        </section>
      </main>

      <footer>
        <small>Built for Stats Canada vectors via Netlify Functions</small>
      </footer>
    </div>
  )
}
