// web/components/panels/HabitsPanel.js
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabaseClient';
import { fallbackHabits } from '../../utils/fallbackData';

export default function HabitsPanel({ dateRange }) {
  const [habits, setHabits] = useState([]); // Always initialize as array
  const [isLoading, setIsLoading] = useState(true);

  // Format dates for Supabase query
  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchHabits() {
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        let habitsData = fallbackHabits.habits; // Default to fallback

        if (supabase) {
          const startDateStr = formatDateParam(dateRange.startDate);
          const endDateStr = formatDateParam(dateRange.endDate);

          const { data, error } = await supabase
            .from('habit_tracking')
            .select('*')
            .gte('habit_date', startDateStr)
            .lte('habit_date', endDateStr)
            .order('habit_date', { ascending: false });

          if (error) throw error;
          habitsData = data || []; // Ensure array even if no data
        }

        setHabits(habitsData);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setHabits(fallbackHabits.habits); // Fallback on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchHabits();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Habits Tracker
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Habits</h3>
          {(habits || []).length > 0 ? (
            <ul className="space-y-2">
              {(habits || []).map((habit, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-700 rounded"
                >
                  <span>{habit.habit_name}</span>
                  <span
                    className={habit.completed ? 'text-green-400' : 'text-red-400'}
                  >
                    {habit.completed ? '✓' : '✗'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No habits recorded in this date range.</p>
          )}
        </div>
      )}
    </div>
  );
}
