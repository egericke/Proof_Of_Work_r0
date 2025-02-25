// web/pages/toggl.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

// Use dynamic import for Chart.js components to avoid SSR issues
const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
);

// Import Chart.js components dynamically since they use browser APIs
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TogglPage() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Create Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Fetch Toggl data directly from Supabase
        const { data: togglData, error } = await supabase
          .from('toggl_time')
          .select('date, bucket, hours')
          .order('date', { ascending: true });
          
        if (error) throw error;
        
        if (togglData && togglData.length > 0) {
          // Group by date and bucket
          const dateGroups = {};
          const allBuckets = new Set();
          
          togglData.forEach(entry => {
            const dateStr = entry.date;
            if (!dateGroups[dateStr]) dateGroups[dateStr] = {};
            
            const bucket = entry.bucket || 'Uncategorized';
            allBuckets.add(bucket);
            
            dateGroups[dateStr][bucket] = (dateGroups[dateStr][bucket] || 0) + entry.hours;
          });
          
          // Convert to chart format
          const dates = Object.keys(dateGroups).sort();
          const buckets = Array.from(allBuckets);
          
          // Generate colors for buckets
          const colors = [
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ];
          
          // Create datasets
          const datasets = buckets.map((bucket, index) => ({
            label: bucket,
            data: dates.map(date => dateGroups[date][bucket] || 0),
            backgroundColor: colors[index % colors.length],
          }));
          
          setChartData({
            labels: dates,
            datasets,
          });
        }
      } catch (error) {
        console.error('Error fetching Toggl data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Chart.js options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb',
        },
      },
      title: {
        display: true,
        text: 'Time Tracking by Category',
        color: '#e5e7eb',
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#e5e7eb',
        },
      },
      y: {
        stacked: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#e5e7eb',
        },
        title: {
          display: true,
          text: 'Hours',
          color: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Time Tracking Dashboard</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
            <p className="font-bold">Error loading data:</p>
            <p>{error}</p>
          </div>
        ) : chartData.datasets.length > 0 ? (
          <div className="h-96">
            <Bar data={chartData} options={options} />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl mb-2">No time tracking data available</p>
            <p>Log your time in Toggl to see data here</p>
          </div>
        )}
      </div>
    </div>
  );
}
