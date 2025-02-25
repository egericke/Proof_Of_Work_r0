// web/pages/habits.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHabits() {
      try {
        setIsLoading(true);
        
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase environment variables are not set");
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Get habits data for the last 14 days
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const startDate = twoWeeksAgo.toISOString().split('T')[0];
        
        const { data, error: habitsError } = await supabase
          .from('habit_tracking')
          .select('*')
          .gte('habit_date', startDate)
          .order('habit_date', { ascending: false });
          
        if (habitsError) throw habitsError;
        
        setHabits(data || []);
      } catch (err) {
        console.error("Error fetching habits:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHabits();
  }, []);

  // Group habits by date
  const habitsByDate = habits.reduce((acc, habit) => {
    const date = habit.habit_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(habit);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Habit Tracking</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
          <p className="font-bold">Error loading data:</p>
          <p>{error}</p>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-800 rounded-lg">
          <p className="text-xl mb-2">No habit data available</p>
          <p>Start tracking your habits to see them here</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-medium text-green-300 mb-4">Habit Completion Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-gray-400 text-sm">Total Habits</p>
                <p className="text-2xl font-bold">{habits.length}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold">{habits.filter(h => h.completed).length}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(habits.filter(h => h.completed).length / habits.length * 100)}%
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-gray-400 text-sm">Days Tracked</p>
                <p className="text-2xl font-bold">{Object.keys(habitsByDate).length}</p>
              </div>
            </div>
          </div>
          
          {Object.entries(habitsByDate).map(([date, dayHabits]) => (
            <div key={date} className="bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="font-medium text-white mb-3">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="space-y-2">
                {dayHabits.map((habit, index) => (
                  <div 
                    key={`${date}-${index}`} 
                    className="p-3 rounded flex justify-between items-center bg-gray-700"
                  >
                    <div>
                      <p className="font-medium">{habit.habit_name || 'Unnamed Habit'}</p>
                      {habit.notes && <p className="text-sm text-gray-400">{habit.notes}</p>}
                    </div>
                    <div className={`px-2 py-1 rounded text-sm ${
                      habit.completed 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {habit.completed ? 'Completed' : 'Missed'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
