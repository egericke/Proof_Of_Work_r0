// Fixed TimePanel.js with robust error handling
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import TimeCard from '../ui/TimeCard';
import TimeDistribution from '../ui/TimeDistribution';

export default function TimePanel({ supabase, dateRange }) {
  const [timeData, setTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aggregatedData, setAggregatedData] = useState({
    byBucket: {},
    byDay: {}
  });

  // Fetch time data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!supabase) {
          throw new Error("Supabase client is not available");
        }
        
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
          throw new Error("Date range is invalid");
        }
        
        // Format dates for queries
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        // Get toggl data
        const { data: togglData, error: togglError } = await supabase
          .from('toggl_time')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });
          
        if (togglError) {
          throw togglError;
        }
        
        // Always ensure we have an array even if the query failed
        const safeTogglData = Array.isArray(togglData) ? togglData : [];
        setTimeData(safeTogglData);
        
        // Only proceed with aggregation if we have data
        if (safeTogglData.length > 0) {
          // Aggregate by bucket
          const byBucket = safeTogglData.reduce((acc, entry) => {
            const bucket = entry.bucket || 'Uncategorized';
            acc[bucket] = (acc[bucket] || 0) + entry.hours;
            return acc;
          }, {});
          
          // Aggregate by day
          const byDay = safeTogglData.reduce((acc, entry) => {
            const date = entry.date;
            if (!acc[date]) acc[date] = {};
            
            const bucket = entry.bucket || 'Uncategorized';
            acc[date][bucket] = (acc[date][bucket] || 0) + entry.hours;
            
            return acc;
          }, {});
          
          setAggregatedData({ byBucket, byDay });
        } else {
          // Set empty but valid data structures
          setAggregatedData({ byBucket: {}, byDay: {} });
        }
      } catch (error) {
        console.error('Error fetching time data:', error);
        setError(error.message);
        // Ensure we have valid empty data structures even in case of error
        setAggregatedData({ byBucket: {}, byDay: {} });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [supabase, dateRange]);

  // Safely prepare data for the bucket distribution chart
  const bucketDistributionData = {
    labels: Object.keys(aggregatedData.byBucket || {}),
    datasets: [
      {
        data: Object.values(aggregatedData.byBucket || {}),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };
  
  // Safely prepare data for the time trend chart
  const timeChartData = {
    // Default to empty array if aggregatedData.byDay is undefined
    labels: Object.keys(aggregatedData.byDay || {}).sort(),
    datasets: (() => {
      // Guard against undefined
      if (!aggregatedData.byDay) return [];
      
      // Collect all unique bucket names across all days
      const uniqueBuckets = {};
      Object.values(aggregatedData.byDay).forEach(dayData => {
        Object.keys(dayData).forEach(bucket => {
          uniqueBuckets[bucket] = true;
        });
      });
      
      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ];
      
      // Create a dataset for each bucket
      return Object.keys(uniqueBuckets).map((bucket, index) => {
        return {
          label: bucket,
          data: Object.keys(aggregatedData.byDay).sort().map(date => 
            (aggregatedData.byDay[date] && aggregatedData.byDay[date][bucket]) || 0
          ),
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          borderWidth: 2,
          fill: false
        };
      });
    })()
  };

  // Safely calculate stats
  const totalHours = Object.values(aggregatedData.byBucket || {}).reduce((a, b) => a + b, 0);
  const deepWorkHours = (aggregatedData.byBucket && aggregatedData.byBucket['Deep Work']) || 0;
  const deepWorkPercentage = totalHours > 0 ? (deepWorkHours / totalHours * 100).toFixed(1) : 0;
  
  // Calculate daily average
  const uniqueDays = new Set(timeData.map(entry => entry.date)).size;
  const dailyAverage = uniqueDays > 0 ? (totalHours / uniqueDays).toFixed(1) : 0;

  // Show error state if we have an error
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Time Management
        </h2>
        
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Data</h3>
          <p className="text-white">{error}</p>
          <p className="mt-4 text-gray-300">Try refreshing the page or check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Time Management
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TimeCard 
          title="Total Tracked" 
          hours={totalHours.toFixed(1)} 
          icon="clock"
          color="blue"
          isLoading={isLoading}
        />
        <TimeCard 
          title="Deep Work" 
          hours={deepWorkHours.toFixed(1)}
          subtitle={`${deepWorkPercentage}% of total`}
          icon="brain"
          color="purple"
          isLoading={isLoading}
        />
        <TimeCard 
          title="Daily Average" 
          hours={dailyAverage}
          subtitle={`across ${uniqueDays} days`}
          icon="calendar"
          color="green"
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Time Distribution</h3>
          <DataChart 
            data={timeChartData} 
            type="line" 
            height={300}
            isLoading={isLoading}
            options={{
              scales: {
                x: {
                  stacked: false,
                },
                y: {
                  stacked: false,
                  title: {
                    display: true,
                    text: 'Hours'
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="lg:col-span-2 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Focus Categories</h3>
          <div className="h-64 flex items-center justify-center">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : Object.keys(aggregatedData.byBucket || {}).length > 0 ? (
              <DataChart 
                data={bucketDistributionData} 
                type="pie" 
                height={250}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            ) : (
              <div className="text-center text-gray-400">
                No time data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Time Allocation</h3>
        <TimeDistribution 
          data={Object.entries(aggregatedData.byBucket || {}).map(([bucket, hours]) => ({ 
            name: bucket, 
            value: hours,
            percentage: totalHours > 0 ? (hours / totalHours * 100).toFixed(1) : 0
          }))}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
