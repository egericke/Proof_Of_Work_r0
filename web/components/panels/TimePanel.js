// web/components/panels/TimePanel.js
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import TimeCard from '../ui/TimeCard';
import TimeDistribution from '../ui/TimeDistribution';

export default function TimePanel({ supabase, dateRange }) {
  const [timeData, setTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aggregatedData, setAggregatedData] = useState({
    byBucket: {},
    byDay: {}
  });

  // Fetch time data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Format dates for queries
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        // Get toggl data
        const { data: togglData } = await supabase
          .from('toggl_time')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });
          
        if (togglData) {
          setTimeData(togglData);
          
          // Aggregate by bucket
          const byBucket = togglData.reduce((acc, entry) => {
            const bucket = entry.bucket || 'Uncategorized';
            acc[bucket] = (acc[bucket] || 0) + entry.hours;
            return acc;
          }, {});
          
          // Aggregate by day
          const byDay = togglData.reduce((acc, entry) => {
            const date = entry.date;
            if (!acc[date]) acc[date] = {};
            
            const bucket = entry.bucket || 'Uncategorized';
            acc[date][bucket] = (acc[date][bucket] || 0) + entry.hours;
            
            return acc;
          }, {});
          
          setAggregatedData({ byBucket, byDay });
        }
      } catch (error) {
        console.error('Error fetching time data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [supabase, dateRange]);

  // Prepare data for the bucket distribution chart
  const bucketDistributionData = {
    labels: Object.keys(aggregatedData.byBucket),
    datasets: [
      {
        data: Object.values(aggregatedData.byBucket),
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
  
  // Prepare data for the time trend chart
  const timeChartData = {
    labels: Object.keys(aggregatedData.byDay).sort(),
    datasets: Object.entries(
      // Get unique buckets across all days
      Object.values(aggregatedData.byDay).reduce((acc, dayData) => {
        Object.keys(dayData).forEach(bucket => {
          acc[bucket] = true;
        });
        return acc;
      }, {})
    ).map(([bucket, _], index) => {
      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ];
      
      return {
        label: bucket,
        data: Object.keys(aggregatedData.byDay).sort().map(date => 
          aggregatedData.byDay[date][bucket] || 0
        ),
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        fill: false
      };
    })
  };

  // Calculate stats
  const totalHours = Object.values(aggregatedData.byBucket).reduce((a, b) => a + b, 0);
  const deepWorkHours = aggregatedData.byBucket['Deep Work'] || 0;
  const deepWorkPercentage = totalHours > 0 ? (deepWorkHours / totalHours * 100).toFixed(1) : 0;
  
  // Calculate daily average
  const uniqueDays = new Set(timeData.map(entry => entry.date)).size;
  const dailyAverage = uniqueDays > 0 ? (totalHours / uniqueDays).toFixed(1) : 0;

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
            ) : Object.keys(aggregatedData.byBucket).length > 0 ? (
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
          data={Object.entries(aggregatedData.byBucket).map(([bucket, hours]) => ({ 
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
