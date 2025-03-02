// web/components/ui/DataChart.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Simpler dynamic imports that work better with Vercel build
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

// Default chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#D1D5DB',
        boxWidth: 12,
        padding: 10,
        font: {
          size: 11
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      titleColor: '#F9FAFB',
      bodyColor: '#F3F4F6',
      borderColor: 'rgba(59, 130, 246, 0.5)',
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
        color: 'rgba(31, 41, 55, 0.2)',
        borderColor: 'rgba(31, 41, 55, 0.5)'
      },
      ticks: {
        color: '#9CA3AF',
        maxRotation: 45,
        minRotation: 0,
        font: {
          size: 10
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(31, 41, 55, 0.2)',
        borderColor: 'rgba(31, 41, 55, 0.5)'
      },
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 10
        }
      }
    }
  }
};

export default function DataChart({ 
  data = { labels: [], datasets: [] }, // Provide default empty arrays
  type = 'line', 
  height = 300, 
  isLoading = false,
  options = {} 
}) {
  const [chartOptions, setChartOptions] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if data is valid
  const isDataValid = data && 
                     Array.isArray(data.labels) && 
                     Array.isArray(data.datasets) && 
                     data.labels.length > 0 && 
                     data.datasets.length > 0;
  
  // Initialize Chart.js on client-side only
  useEffect(() => {
    setIsMounted(true);
    
    // Only import Chart.js in the browser
    if (typeof window !== 'undefined') {
      import('chart.js/auto');
    }
    
    return () => setIsMounted(false);
  }, []);
  
  // Update chart options based on screen size
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;
    
    const updateOptions = () => {
      // Set aspect ratio based on screen width
      const screenWidth = window.innerWidth;
      let aspectRatio;
      
      if (screenWidth < 640) {
        aspectRatio = 1.25; // Mobile
      } else if (screenWidth < 1024) {
        aspectRatio = 1.75; // Tablet
      } else {
        aspectRatio = 2; // Desktop
      }
      
      // Merge options
      const mergedOptions = {
        ...defaultOptions,
        ...options,
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio
      };
      
      setChartOptions(mergedOptions);
    };
    
    updateOptions();
    
    window.addEventListener('resize', updateOptions);
    return () => window.removeEventListener('resize', updateOptions);
  }, [options, type, isMounted]);

  // Render fallback for loading state or empty data
  if (isLoading) {
    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <div className="h-full w-full flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  // Check for valid data
  if (!isMounted || !isDataValid) {
    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <div className="h-full w-full flex items-center justify-center text-gray-400 text-center p-4">
          No data available for the selected period
        </div>
      </div>
    );
  }
  
  // Render the appropriate chart type
  let ChartComponent;
  switch (type) {
    case 'line':
      ChartComponent = Line;
      break;
    case 'bar':
      ChartComponent = Bar;
      break;
    case 'pie':
      ChartComponent = Pie;
      break;
    case 'doughnut':
      ChartComponent = Doughnut;
      break;
    default:
      ChartComponent = Line;
  }
  
  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <ChartComponent data={data} options={chartOptions} />
    </div>
  );
}
