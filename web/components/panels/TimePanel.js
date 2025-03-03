// web/components/panels/TimePanel.js
import React, { useState, useEffect, useMemo } from 'react';
import DataChart from '../ui/DataChart';
import TimeCard from '../ui/TimeCard';
import { getSupabaseClient } from '../../utils/supabaseClient';

// Fallback data in case fetching fails or Supabase is unavailable
const fallbackTimeEntries = [
  { date: '2023-01-10', bucket: 'Deep Work', hours: 4.5 },
  { date: '2023-01-10', bucket: 'Meetings', hours: 2.0 },
  { date: '2023-01-11', bucket: 'Deep Work', hours: 3.8 },
];

export default function TimePanel({ dateRange, supabase: propSupabase, initialTimeEntries = [] }) {
  // Initialize state with server-fetched data or empty array
  const [timeEntries, setTimeEntries] = useState(
    Array.isArray(initialTimeEntries) && initialTimeEntries.length > 0 
      ? initialTimeEntries 
      : []
  );
  const [isLoading, setIsLoading] = useState(!initialTimeEntries?.length); // Don't show loading if we have initial data
  const [error, setError] = useState(null);

  // Utility to format dates for Supabase queries
  const formatDateParam = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date object');
      }
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error('Date formatting error:', err);
      return new Date().toISOString().split('T')[0]; // Use today as fallback
    }
  };

  useEffect(() => {
    // Skip data fetching if we have initial data and it's the first render
    if (Array.isArray(initialTimeEntries) && initialTimeEntries.length > 0 && timeEntries === initialTimeEntries) {
      console.log('TimePanel: Using server-fetched initial data:', initialTimeEntries.length);
      return; // Skip fetching - we already have pre-loaded data
    }
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
          console.warn('TimePanel: Invalid dateRange provided, using fallback data');
          setTimeEntries(fallbackTimeEntries || []);
          return;
        }

        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = propSupabase || getSupabaseClient();

        // Default to fallback data
        let timeData = fallbackTimeEntries;

        // Fetch from Supabase if client is available
        if (supabase) {
          try {
            const query = supabase
              .from('toggl_time')
              .select('*')
              .gte('date', startDateStr)
              .lte('date', endDateStr)
              .order('date', { ascending: true });

            // Use execute for mockClient or standard await pattern
            const result = query.execute 
              ? await query.execute() 
              : await query;
              
            const { data: fetchedData, error: queryError } = result || { data: null, error: null };

            // Detailed error logging to help debug Vercel deployment issues
            if (queryError) {
              console.error('Supabase time query error details:', {
                message: queryError.message,
                code: queryError.code,
                details: queryError.details,
                hint: queryError.hint
              });
              setError(queryError.message);
              throw queryError;
            }
            
            // Log the actual data received for debugging
            console.log('Time entries data received:', fetchedData ? 
              `Array with ${fetchedData.length} items` : 'No data (null/undefined)');
              
            // Use fetched data if available and non-empty
            if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
              timeData = fetchedData;
            } else {
              console.log('Using fallback data for time entries since query returned empty results');
            }
          } catch (supabaseError) {
            console.error('Supabase query error:', supabaseError);
            // Continue with fallback data
          }
        }

        setTimeEntries(timeData || []);
      } catch (error) {
        console.error('Error fetching time data:', error);
        // Fallback to static data on error
        setTimeEntries(fallbackTimeEntries || []);
        setError('Failed to load time data: ' + (error.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [dateRange, initialTimeEntries, timeEntries]);

  // Process chart data with additional validation
  const chartData = useMemo(() => {
    // Safety check for timeEntries
    const safeEntries = Array.isArray(timeEntries) ? timeEntries : [];
    console.log(`Preparing chart data with ${safeEntries.length} time entries`);
    
    return {
      // Use Set for unique dates, with fallback to empty array if map fails
      labels: [...new Set(safeEntries.map(entry => entry?.date || '').filter(Boolean))],
      datasets: [
        {
          label: 'Deep Work',
          data: safeEntries
            .filter(entry => entry?.bucket === 'Deep Work')
            .map(entry => entry?.hours || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
        {
          label: 'Meetings',
          data: safeEntries
            .filter(entry => entry?.bucket === 'Meetings')
            .map(entry => entry?.hours || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
        },
        // Additional buckets can be added here
      ],
    };
  }, [timeEntries]);

  // Debug log to inspect data before rendering
  console.log('Rendering TimePanel with timeEntries:', Array.isArray(timeEntries) ? timeEntries.length : 'not an array');
  
  // If there's an error, show it to the user
  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Time Tracking
        </h2>
        <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-6 text-center">
          <h3 className="text-xl text-red-400 mb-3">Error Loading Time Data</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            Array.isArray(timeEntries) ?
              timeEntries.filter(entry => entry !== null && entry !== undefined)
                .slice(0, 5)
                .map((entry, index) => (
                  <TimeCard
                    key={index}
                    date={entry?.date || 'Unknown date'}
                    bucket={entry?.bucket || 'Unknown category'}
                    hours={entry?.hours || 0}
                  />
                ))
              : <div className="text-gray-400 text-center py-4">Error: Invalid time entries data format.</div>
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
