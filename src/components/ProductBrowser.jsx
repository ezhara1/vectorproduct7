import React, { useMemo, useState } from 'react'

export default function ProductBrowser({ catalog, onDropTargetId }) {
  const [query, setQuery] = useState('')
  const [productId, setProductId] = useState('')

  const products = useMemo(() => {
    const list = Array.isArray(catalog) ? catalog : []
    if (!query) return list
    const q = query.toLowerCase()
    return list.filter(p => p.productId.includes(q) || (p.description||'').toLowerCase().includes(q))
  }, [catalog, query])

  const current = useMemo(() => products.find(p => p.productId === productId) || products[0], [products, productId])

  return (
    <div className="browser">
      <h2>Browse Products</h2>
      <input
        placeholder="Search product id or description"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <select value={productId} onChange={e => setProductId(e.target.value)}>
        {products.map(p => (
          <option key={p.productId} value={p.productId}>{p.productId} — {p.description}</option>
        ))}
      </select>

      <div className="vectors">
        {(current?.vectors || []).map(v => (
          <VectorItem key={v.vectorId} v={v} onDropTargetId={onDropTargetId} />
        ))}
      </div>
      <p className="hint">Drag vectors into the chart area to add.</p>
    </div>
  )
}

function VectorItem({ v, onDropTargetId }) {
  function onDragStart(e) {
    e.dataTransfer.setData('application/json', JSON.stringify(v))
    e.dataTransfer.effectAllowed = 'copy'
  }
  return (
    <div className="vector" draggable onDragStart={onDragStart}>
      <div className="vector-id">{v.vectorId}</div>
      <div className="vector-text">{v.text}</div>
      <div className="vector-hint">Drop to #{onDropTargetId}</div>
    </div>
  )
}
