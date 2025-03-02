// web/components/ui/DataChart.js - Enhanced version with better error handling
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
  const [chartError, setChartError] = useState(null);
  
  // Check if data is valid with more comprehensive validation
  const isDataValid = (() => {
    // Early check for undefined/null data
    if (!data) return false;
    
    // Check for required properties
    if (!data.labels || !data.datasets) return false;
    
    // Validate arrays
    if (!Array.isArray(data.labels) || !Array.isArray(data.datasets)) return false;
    
    // Check if datasets have required properties
    if (data.datasets.length > 0) {
      // For bar/line charts, we need data array in each dataset
      if (type === 'line' || type === 'bar') {
        return data.datasets.every(dataset => 
          dataset && Array.isArray(dataset.data) && dataset.data.length > 0
        );
      } 
      // For pie/doughnut charts, we just need a data array
      else if (type === 'pie' || type === 'doughnut') {
        return data.datasets.length > 0 && 
               Array.isArray(data.datasets[0].data) && 
               data.datasets[0].data.length > 0;
      }
    }
    
    // Default to requiring non-empty arrays
    return data.labels.length > 0 && data.datasets.length > 0;
  })();
  
  // Initialize Chart.js on client-side only
  useEffect(() => {
    setIsMounted(true);
    
    // Only import Chart.js in the browser
    if (typeof window !== 'undefined') {
      try {
        import('chart.js/auto');
      } catch (error) {
        console.error('Failed to load Chart.js:', error);
        setChartError('Failed to load chart library');
      }
    }
    
    return () => setIsMounted(false);
  }, []);
  
  // Update chart options based on screen size
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;
    
    const updateOptions = () => {
      try {
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
      } catch (error) {
        console.error('Error updating chart options:', error);
        setChartError('Failed to configure chart');
      }
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
  
  // Show error state if we have an error
  if (chartError) {
    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <div className="h-full w-full flex flex-col items-center justify-center bg-red-900/10 rounded-lg border border-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-center px-4">
            <p className="text-red-400 font-medium mb-1">Chart Error</p>
            <p className="text-gray-300 text-sm">{chartError}</p>
          </div>
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
  
  // Catch potential render errors
  try {
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
  } catch (error) {
    console.error('Error rendering chart:', error);
    return (
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <div className="h-full w-full flex flex-col items-center justify-center bg-red-900/10 rounded-lg border border-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-center px-4">
            <p className="text-red-400 font-medium mb-1">Chart Rendering Error</p>
            <p className="text-gray-300 text-sm">Failed to render chart with the provided data</p>
          </div>
        </div>
      </div>
    );
  }
}
