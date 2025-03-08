// web/pages/habits.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase environment variables are not set");
        }
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch habit data
        const { data: habitsData, error: habitsError } = await supabase
          .from('habit_tracking')
          .select('habit_date, habit_name, completed')
          .order('habit_date', { ascending: false })
          .limit(50); // Adjust limit as needed

        if (habitsError) throw habitsError;

        if (habitsData && habitsData.length > 0) {
          setHabits(habitsData);

          // Calculate streak (days with 80%+ completion)
          const habitsByDate = {};
          habitsData.forEach(habit => {
            if (!habitsByDate[habit.habit_date]) {
              habitsByDate[habit.habit_date] = { total: 0, completed: 0 };
            }
            habitsByDate[habit.habit_date].total++;
            if (habit.completed) habitsByDate[habit.habit_date].completed++;
          });

          const streakCount = Object.keys(habitsByDate).filter(date => {
            const dayData = habitsByDate[date];
            return dayData.completed / dayData.total >= 0.8;
          }).length;

          setStreak(streakCount);
        } else {
          setError('No habit data found');
        }
      } catch (err) {
        console.error("Error fetching habit data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Habits Dashboard</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
          <p className="font-bold">Error loading data:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Habit Stats */}
          <div className="bg-gray-800 rounded-lg p-4 shadow glass-panel">
            <h2 className="text-lg font-medium text-blue-300 mb-4">Your Habit Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Habit Streak</p>
                <p className="text-2xl font-bold">{streak} <span className="text-sm">days</span></p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Habits</p>
                <p className="text-2xl font-bold">{habits.length}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {((habits.filter(h => h.completed).length / habits.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Habits List */}
          <div className="bg-gray-800 rounded-lg p-4 shadow glass-panel">
            <h2 className="text-lg font-medium text-blue-300 mb-4">Recent Habits</h2>
            {habits.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No habit data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{habit.habit_name}</h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(habit.habit_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        habit.completed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {habit.completed ? 'Completed' : 'Missed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
