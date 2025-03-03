// web/components/panels/HabitsPanel.js
import { useState, useEffect } from 'react';
import HabitCalendar from '../ui/HabitCalendar';
import { getSupabaseClient } from '../../utils/supabaseClient';

// Fallback data for habits
const fallbackHabits = [
  { habit_date: '2023-01-10', habit_name: 'Meditation', completed: true },
  { habit_date: '2023-01-10', habit_name: 'Reading', completed: true },
  { habit_date: '2023-01-10', habit_name: 'Exercise', completed: false },
];

export default function HabitsPanel({ dateRange }) {
  // Initialize state as an empty array
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Utility to format dates for Supabase queries
  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
          console.warn('HabitsPanel: Invalid dateRange provided, using fallback data');
          setHabits(fallbackHabits);
          return;
        }

        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = getSupabaseClient();

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

            const { data: fetchedData, error } = result;

            if (error) throw error;
            // Use fetched data if available and non-empty
            if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
              habitsData = fetchedData;
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
  }, [dateRange]);

  // Group habits by date for calendar view
  const habitsByDate = (habits || []).reduce((acc, habit) => {
    if (!acc[habit.habit_date]) acc[habit.habit_date] = [];
    acc[habit.habit_date].push(habit);
    return acc;
  }, {});

  // Debug log to inspect data before rendering
  console.log('Rendering HabitsPanel with habits:', habits);

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
          (habits || [])
            .slice(0, 5)
            .map((habit, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-700 rounded mb-2"
              >
                <span>{habit.habit_name}</span>
                <span className={habit.completed ? 'text-green-400' : 'text-red-400'}>
                  {habit.completed ? 'Completed' : 'Missed'}
                </span>
              </div>
            ))
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
