// web/components/panels/HabitsPanel.js
import React, { useState, useEffect, useMemo } from 'react';
import HabitCalendar from '../ui/HabitCalendar';
import { getSupabaseClient } from '../../utils/supabaseClient';

// Fallback data for habits
const fallbackHabits = [
  { habit_date: '2023-01-10', habit_name: 'Meditation', completed: true },
  { habit_date: '2023-01-10', habit_name: 'Reading', completed: true },
  { habit_date: '2023-01-10', habit_name: 'Exercise', completed: false },
];

export default function HabitsPanel({ dateRange, supabase: propSupabase, initialHabits = [] }) {
  // Initialize state with server-fetched data or empty array
  const [habits, setHabits] = useState(
    Array.isArray(initialHabits) && initialHabits.length > 0 
      ? initialHabits 
      : []
  );
  const [isLoading, setIsLoading] = useState(!initialHabits?.length); // Don't show loading if we have initial data
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
    if (Array.isArray(initialHabits) && initialHabits.length > 0 && habits === initialHabits) {
      console.log('HabitsPanel: Using server-fetched initial data:', initialHabits.length);
      return; // Skip fetching - we already have pre-loaded data
    }
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
          console.warn('HabitsPanel: Invalid dateRange provided, using fallback data');
          setHabits(fallbackHabits || []);
          return;
        }

        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        // Use passed in Supabase client if available or get a new one
        const supabase = propSupabase || getSupabaseClient();

        // Default to fallback data
        let habitsData = fallbackHabits;

        // Fetch from Supabase if client is available
        if (supabase) {
          try {
            const query = supabase
              .from('habit_tracking')
              .select('*')
              .gte('habit_date', startDateStr)
              .lte('habit_date', endDateStr)
              .order('habit_date', { ascending: true });

            // Use execute for mockClient or standard await pattern
            const result = query.execute 
              ? await query.execute() 
              : await query;

            const { data: fetchedData, error: queryError } = result || { data: null, error: null };

            // Detailed error logging to help debug Vercel deployment issues
            if (queryError) {
              console.error('Supabase habits query error details:', {
                message: queryError.message,
                code: queryError.code,
                details: queryError.details,
                hint: queryError.hint
              });
              setError(queryError.message);
              throw queryError;
            }
            
            // Log the actual data received for debugging
            console.log('Habits data received:', fetchedData ? 
              `Array with ${fetchedData.length} items` : 'No data (null/undefined)');
              
            // Use fetched data if available and non-empty
            if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
              habitsData = fetchedData;
            } else {
              console.log('Using fallback data for habits since query returned empty results');
            }
          } catch (supabaseError) {
            console.error('Supabase query error:', supabaseError);
            // Continue with fallback data
          }
        }

        setHabits(habitsData || []);
      } catch (error) {
        console.error('Error fetching habits data:', error);
        // Fallback to static data on error
        setHabits(fallbackHabits || []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [dateRange, initialHabits, habits]);

  // Group habits by date for calendar view - with extra validation
  const habitsByDate = React.useMemo(() => {
    // Ensure habits is always an array before reducing
    const safeHabits = Array.isArray(habits) ? habits : [];
    console.log(`Calculating habitsByDate with ${safeHabits.length} habits`);
    
    return safeHabits.reduce((acc, habit) => {
      if (!habit || !habit.habit_date) return acc;
      if (!acc[habit.habit_date]) acc[habit.habit_date] = [];
      acc[habit.habit_date].push(habit);
      return acc;
    }, {});
  }, [habits]);

  // Debug log to inspect data before rendering
  console.log('Rendering HabitsPanel with habits:', Array.isArray(habits) ? habits.length : 'not an array');
  
  // If there's an error, show it to the user
  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Habits Tracker
        </h2>
        <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-6 text-center">
          <h3 className="text-xl text-red-400 mb-3">Error Loading Habits</h3>
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
        Habits Tracker
      </h2>
      {/* Habit Calendar */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Habit Completion Calendar</h3>
        <HabitCalendar habitsByDate={habitsByDate} isLoading={isLoading} />
      </div>
      {/* Recent Habits */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Habits</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
          </div>
        ) : (habits || []).length > 0 ? (
          Array.isArray(habits) ? 
            habits.filter(h => h !== null && h !== undefined)
              .slice(0, 5)
              .map((habit, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-700 rounded mb-2"
                >
                  <span>{habit?.habit_name || 'Unknown habit'}</span>
                  <span className={habit?.completed ? 'text-green-400' : 'text-red-400'}>
                    {habit?.completed ? 'Completed' : 'Missed'}
                  </span>
                </div>
              ))
            : <div className="text-gray-400 text-center py-4">Error: Invalid habits data format.</div>
        ) : (
          <div className="text-gray-400 text-center py-4">No habits found.</div>
        )}
      </div>
    </div>
  );
}

// Default props to ensure graceful handling if dateRange is undefined
HabitsPanel.defaultProps = {
  dateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to last 7 days
    endDate: new Date(),
  },
};
