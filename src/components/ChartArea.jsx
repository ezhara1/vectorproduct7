import React, { useEffect, useMemo, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, TimeScale } from 'chart.js'
import { Line, Bar, Scatter } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, TimeScale)

export default function ChartArea({ id, selected, onDropVector, onRemove, chartType, series }) {
  function onDrop(e) {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (data) {
      try { onDropVector(JSON.parse(data)) } catch {}
    }
  }
  function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }

  const labels = useMemo(() => {
    const first = series[0]
    if (!first) return []
    return first.table.map(r => r.refPer)
  }, [series])

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: series.map((s, i) => ({
        label: s.label,
        data: s.table.map(r => r.value === null ? null : Number(r.value)),
        backgroundColor: palette[i % palette.length] + '88',
        borderColor: palette[i % palette.length],
        pointRadius: chartType === 'scatter' ? 3 : 2,
        fill: false,
      }))
    }
  }, [series, labels, chartType])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: chartType === 'scatter' ? {
      x: { title: { display: true, text: 'Index' } },
      y: { title: { display: true, text: 'Value' } }
    } : {
      x: { ticks: { maxRotation: 0, autoSkip: true } },
      y: { beginAtZero: false }
    },
    plugins: { legend: { position: 'top' } }
  }), [chartType])

  return (
    <div className="chart-area" id={id} onDrop={onDrop} onDragOver={onDragOver}>
      <div className="selected">
        {selected.map(s => (
          <span key={s.vectorId} className="chip">
            {s.vectorId}
            <button onClick={() => onRemove(s.vectorId)} title="Remove">×</button>
          </span>
        ))}
      </div>
      <div className="chart-wrapper">
        {chartType === 'line' && <Line data={chartData} options={options} />}
        {chartType === 'bar' && <Bar data={chartData} options={options} />}
        {chartType === 'scatter' && (
          <Scatter data={{
            datasets: series.map((s, i) => ({
              label: s.label,
              data: s.table.map((r, ix) => ({ x: ix, y: r.value === null ? null : Number(r.value) })),
              backgroundColor: palette[i % palette.length],
            }))
          }} options={options} />
        )}
      </div>
    </div>
  )
}

const palette = [
  '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#f59e0b', '#0ea5e9', '#d946ef', '#059669'
]
