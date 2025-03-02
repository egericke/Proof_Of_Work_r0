// web/components/ui/DataChart.js
import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DataChart({
  data = { labels: [], datasets: [] },
  type,
  height,
  isLoading,
  options,
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center" style={{ height }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const chartProps = {
    data,
    height,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...options,
    },
  };

  switch (type) {
    case 'line':
      return <Line {...chartProps} />;
    case 'doughnut':
      return <Doughnut {...chartProps} />;
    default:
      return <Line {...chartProps} />;
  }
}
