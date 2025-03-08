// web/components/panels/HabitsPanel.js
import { useState, useEffect } from 'react';
import HabitCalendar from '../ui/HabitCalendar';
import { getSupabaseClient } from '../../utils/supabaseClient';

export default function HabitsPanel({ dateRange }) {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = getSupabaseClient();

        if (!supabase) throw new Error('Supabase client not available');

        const { data: habitsData, error } = await supabase
          .from('habit_tracking')
          .select('habit_date, habit_name, completed')
          .gte('habit_date', startDateStr)
          .lte('habit_date', endDateStr)
          .order('habit_date', { ascending: false });

        if (error) throw error;

        setHabits(habitsData || []);
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
        <p className="font-bold">Error loading Habits:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Habit Tracker
      </h2>
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Habit Progress</h3>
        <HabitCalendar habits={habits} isLoading={isLoading} />
      </div>
    </div>
  );
}
