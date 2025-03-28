// web/components/panels/TimePanel.js
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import { getSupabaseClient } from '../../utils/supabaseClient';
import ErrorBoundary from '../ErrorBoundary'; // Import ErrorBoundary

// Define a consistent color mapping for project names (buckets)
const categoryColorMap = {
  'Deep Work': 'rgba(54, 162, 235, 0.8)', // Blue
  'Health/Fitness': 'rgba(75, 192, 192, 0.8)', // Teal
  'Learning': 'rgba(153, 102, 255, 0.8)', // Purple
  'Meetings': 'rgba(255, 159, 64, 0.8)', // Orange
  'Admin/Misc': 'rgba(255, 99, 132, 0.8)', // Pink
  'No Project': 'rgba(156, 163, 175, 0.8)', // Gray
  // Add more specific project names and colors as needed
};

// Function to get a color, falling back to gray or cycling through defaults
const getCategoryColor = (categoryName, index) => {
  if (categoryColorMap[categoryName]) {
    return categoryColorMap[categoryName];
  }
  // Fallback colors if category not in map
  const defaultColors = [
    'rgba(255, 206, 86, 0.8)', // Yellow
    'rgba(201, 203, 207, 0.8)', // Lighter Gray
    'rgba(239, 68, 68, 0.8)', // Red
  ];
  return defaultColors[index % defaultColors.length];
};


export default function TimePanel({ dateRange }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false); // Track if data was successfully fetched

  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      setHasData(false); // Reset data flag on new fetch

      try {
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = getSupabaseClient();

        if (!supabase) {
          throw new Error('Supabase client not available. Check environment variables.');
        }

        // Query the correct columns: project_name and duration_seconds
        console.log(`TimePanel: Fetching toggl_entries from ${startDateStr} to ${endDateStr}`);
        const { data: togglData, error: queryError } = await supabase
          .from('toggl_entries')
          .select('date, project_name, duration_seconds') // Fetch correct columns
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true });
        console.log(`TimePanel: Query completed. ${queryError ? 'Error: ' + queryError.message : 'Success: ' + (togglData?.length ?? 0) + ' records'}`);

        if (queryError) {
          // Check for specific "relation does not exist" error
          if (queryError.code === '42P01') {
            throw new Error(`Database table 'toggl_entries' not found. Ensure migrations ran correctly. Original: ${queryError.message}`);
          }
          throw queryError; // Re-throw other errors
        }

        if (togglData?.length > 0) {
          setHasData(true);
          const dateGroups = {};
          const allCategories = new Set(); // Use 'Categories' instead of 'Buckets'

          // Process fetched data
          togglData.forEach((entry) => {
            const dateStr = entry.date;
            if (!dateStr) return; // Skip entries without a date

            if (!dateGroups[dateStr]) dateGroups[dateStr] = {};

            // Use project_name as the category, default to 'No Project'
            const category = entry.project_name || 'No Project';
            allCategories.add(category);

            // Convert duration_seconds to hours
            const hours = (entry.duration_seconds || 0) / 3600;

            // Sum hours per category for each date
            dateGroups[dateStr][category] = (dateGroups[dateStr][category] || 0) + hours;
          });

          const dates = Object.keys(dateGroups).sort();
          const categories = Array.from(allCategories).sort(); // Sort categories alphabetically

          // Create datasets for the chart using the color map
          const datasets = categories.map((category, index) => ({
            label: category,
            data: dates.map((date) => dateGroups[date][category] || 0),
            backgroundColor: getCategoryColor(category, index), // Use dynamic color function
          }));

          setChartData({ labels: dates, datasets });
        } else {
          // No data found for the range, set empty chart data
          setHasData(false);
          setChartData({ labels: [], datasets: [] });
          console.log(`TimePanel: No toggl_entries data found for the selected date range.`);
        }
      } catch (err) {
        console.error('TimePanel: Error fetching or processing time data:', err);
        setError(err.message || 'An unknown error occurred.'); // Provide a default message
        setChartData({ labels: [], datasets: [] }); // Clear chart data on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange]); // Re-fetch when dateRange changes

  // Enhanced Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">
          Time Tracking
        </h2>
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm animate-pulse">
          <div className="h-6 w-3/4 bg-gray-700 rounded mb-4"></div>
          <div className="h-72 bg-gray-700 rounded"></div> {/* Approx chart height */}
        </div>
      </div>
    );
  }

  // Enhanced Error Display
  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Time Tracking
        </h2>
        <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
          <p className="font-bold mb-2">Error loading Time Panel:</p>
          <p className="text-sm mb-3">{error}</p>
          <p className="text-xs text-gray-300">
            Possible causes: Database connection issue, missing 'toggl_entries' table, or incorrect table schema (expected columns: date, project_name, duration_seconds). Check console logs for details.
          </p>
        </div>
      </div>
    );
  }

  // Main Content Render
  return (
    <ErrorBoundary componentName="TimePanel">
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Time Tracking
        </h2>
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Time Distribution by Category</h3>
          {hasData ? (
            <DataChart
              data={chartData}
              type="bar"
              height={300}
              isLoading={false} // Already handled above
              options={{
                responsive: true,
                scales: {
                  x: {
                    stacked: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#e5e7eb' },
                  },
                  y: {
                    stacked: true,
                    title: { display: true, text: 'Hours', color: '#e5e7eb' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#e5e7eb' },
                  },
                },
                plugins: {
                  legend: {
                    labels: { color: '#e5e7eb' }
                  }
                }
              }}
            />
          ) : (
            // Clear No Data State
            <div className="flex items-center justify-center h-72 text-gray-400">
              No time tracking data found for the selected period.
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
