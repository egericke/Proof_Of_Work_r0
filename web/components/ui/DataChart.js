// web/components/ui/DataChart.js
import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom chart theme
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#D1D5DB' // text-gray-300
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)', // bg-gray-900 with opacity
      titleColor: '#F9FAFB', // text-gray-50
      bodyColor: '#F3F4F6', // text-gray-100
      borderColor: 'rgba(59, 130, 246, 0.5)', // blue-500 with opacity
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      displayColors: true,
      usePointStyle: true,
      boxPadding: 3
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(31, 41, 55, 0.2)', // gray-800 with opacity
        borderColor: 'rgba(31, 41, 55, 0.5)' // gray-800 with more opacity
      },
      ticks: {
        color: '#9CA3AF' // text-gray-400
      }
    },
    y: {
      grid: {
        color: 'rgba(31, 41, 55, 0.2)', // gray-800 with opacity
        borderColor: 'rgba(31, 41, 55, 0.5)' // gray-800 with more opacity
      },
      ticks: {
        color: '#9CA3AF' // text-gray-400
      }
    }
  },
  elements: {
    line: {
      tension: 0.3, // Smoother curves
      borderWidth: 2
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2,
      backgroundColor: '#1F2937' // gray-800
    },
    bar: {
      borderRadius: 4
    },
    arc: {
      borderWidth: 1,
      borderColor: '#1F2937' // gray-800
    }
  }
};

export default function DataChart({ 
  data, 
  type = 'line', 
  height = 300, 
  isLoading = false,
  options = {} 
}) {
  const chartOptions = {
    ...defaultOptions,
    ...options
  };
  
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'pie':
        return <Pie data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      default:
        return <Line data={data} options={chartOptions} />;
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data.labels && data.labels.length > 0 ? (
        renderChart()
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-400">
          No data available for the selected period
        </div>
      )}
    </div>
  );
}
