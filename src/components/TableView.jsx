import React, { useMemo } from 'react'

export default function TableView({ series }) {
  const rows = useMemo(() => {
    if (!series?.length) return []
    const byRef = new Map()
    series.forEach(s => {
      s.table.forEach(r => {
        const row = byRef.get(r.refPer) || { refPer: r.refPer }
        row[s.label] = r.value
        byRef.set(r.refPer, row)
      })
    })
    return Array.from(byRef.values())
  }, [series])

  const headers = useMemo(() => {
    if (!rows.length) return []
    const keys = new Set(['refPer'])
    series.forEach(s => keys.add(s.label))
    return Array.from(keys)
  }, [rows, series])

  function exportCSV() {
    if (!rows.length) return
    const csv = [headers.join(',')].concat(
      rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'statcan_data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!rows.length) return null

  return (
    <div className="table-view">
      <div className="table-actions">
        <button onClick={exportCSV}>Export CSV</button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {headers.map(h => <td key={h}>{r[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
