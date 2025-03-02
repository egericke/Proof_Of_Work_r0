// web/components/panels/TimePanel.js
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import TimeCard from '../ui/TimeCard';
import { getSupabaseClient } from '../../utils/supabaseClient';

// Fallback data in case fetching fails or Supabase is unavailable
const fallbackTimeEntries = [
  { date: '2023-01-10', bucket: 'Deep Work', hours: 4.5 },
  { date: '2023-01-10', bucket: 'Meetings', hours: 2.0 },
  { date: '2023-01-11', bucket: 'Deep Work', hours: 3.8 },
];

export default function TimePanel({ dateRange }) {
  // Initialize state as an empty array to avoid undefined errors
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Utility to format dates for Supabase queries
  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = getSupabaseClient();

        // Default to fallback data
        let timeData = fallbackTimeEntries;

        // Fetch from Supabase if client is available
        if (supabase) {
          const { data: fetchedData, error } = await supabase
            .from('toggl_time')
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .order('date', { ascending: true });

          if (error) throw error;
          // Use fetched data if available and non-empty
          if (fetchedData?.length > 0) timeData = fetchedData;
        }

        setTimeEntries(timeData);
      } catch (error) {
        console.error('Error fetching time data:', error);
        // Fallback to static data on error
        setTimeEntries(fallbackTimeEntries);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [dateRange]);

  // Prepare chart data for time distribution
  const chartData = {
    labels: [...new Set((timeEntries || []).map((entry) => entry.date))],
    datasets: [
      {
        label: 'Deep Work',
        data: (timeEntries || [])
          .filter((entry) => entry.bucket === 'Deep Work')
          .map((entry) => entry.hours),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Meetings',
        data: (timeEntries || [])
          .filter((entry) => entry.bucket === 'Meetings')
          .map((entry) => entry.hours),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      // Additional buckets can be added here
    ],
  };

  // Debug log to inspect data before rendering
  console.log('Rendering TimePanel with timeEntries:', timeEntries);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Time Tracking
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution Chart */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Time Distribution</h3>
          <DataChart
            data={chartData}
            type="bar"
            height={300}
            isLoading={isLoading}
            options={{ scales: { y: { beginAtZero: true } } }}
          />
        </div>
        {/* Recent Time Entries */}
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Time Entries</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded"></div>
                ))}
            </div>
          ) : (timeEntries || []).length > 0 ? (
            (timeEntries || [])
              .slice(0, 5)
              .map((entry, index) => (
                <TimeCard
                  key={index}
                  date={entry.date}
                  bucket={entry.bucket}
                  hours={entry.hours}
                />
              ))
          ) : (
            <div className="text-gray-400 text-center py-4">No time entries found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default props to ensure graceful handling if dateRange is undefined
TimePanel.defaultProps = {
  dateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to last 7 days
    endDate: new Date(),
  },
};
