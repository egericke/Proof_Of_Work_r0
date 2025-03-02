// web/components/ui/DataChart.js
import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

export default function DataChart({ data = { labels: [], datasets: [] }, type = 'line', height = 300, isLoading, options = {} }) {
  if (isLoading) {
    return <div className="animate-pulse bg-gray-700 rounded-lg" style={{ height: `${height}px` }}></div>;
  }

  console.log('Rendering DataChart with data:', data);

  const chartOptions = {
    ...options,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#e5e7eb' } }, ...options.plugins },
    scales: options.scales ? {
      ...options.scales,
      x: { ...options.scales.x, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#e5e7eb' } },
      y: { ...options.scales.y, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#e5e7eb' } },
    } : undefined,
  };

  const ChartComponent = type === 'bar' ? Bar : type === 'doughnut' ? Doughnut : Line;

  return (
    <div style={{ height: `${height}px` }}>
      <ChartComponent data={data} options={chartOptions} />
    </div>
  );
}
