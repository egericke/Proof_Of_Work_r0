// web/pages/habits.js
import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabaseClient';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [habitStats, setHabitStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    doneInMonth: 0,
    totalDone: 0,
    overallRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  // Generate yearly grid data
  useEffect(() => {
    const fetchHabits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const supabase = getSupabaseClient();
        if (!supabase) throw new Error('Supabase client not available');

        // Fetch habits for the selected year
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        const { data, error } = await supabase
          .from('habit_tracking')
          .select('*')
          .gte('habit_date', startDate)
          .lte('habit_date', endDate)
          .order('habit_date', { ascending: true });
          
        if (error) throw error;
        
        // Calculate stats
        const habitsByDate = {};
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth() + 1;
        
        // Group habits by date
        if (data && data.length > 0) {
          data.forEach(habit => {
            const date = habit.habit_date;
            if (!habitsByDate[date]) {
              habitsByDate[date] = { total: 0, completed: 0 };
            }
            
            habitsByDate[date].total++;
            if (habit.completed) {
              habitsByDate[date].completed++;
            }
          });
          
          // Calculate completion rates for each day (80% or more is considered complete)
          const completedDays = {};
          Object.keys(habitsByDate).forEach(date => {
            const day = habitsByDate[date];
            completedDays[date] = (day.completed / day.total) >= 0.8;
          });
          
          // Calculate current streak
          let currentStreak = 0;
          let date = new Date(today);
          
          // Check up to 365 days back (max possible streak)
          for (let i = 0; i < 365; i++) {
            const dateStr = date.toISOString().split('T')[0];
            
            // If we have data for this day and it's marked as completed
            if (completedDays[dateStr]) {
              currentStreak++;
              // Move to previous day
              date.setDate(date.getDate() - 1);
            } else {
              // Streak broken
              break;
            }
          }
          
          // Calculate best streak
          let bestStreak = 0;
          let tempStreak = 0;
          
          // Sort dates to ensure chronological order
          const sortedDates = Object.keys(completedDays).sort();
          
          for (let i = 0; i < sortedDates.length; i++) {
            const date = sortedDates[i];
            if (completedDays[date]) {
              tempStreak++;
              bestStreak = Math.max(bestStreak, tempStreak);
            } else {
              tempStreak = 0;
            }
          }
          
          // Count completions in current month
          const doneInMonth = Object.keys(habitsByDate)
            .filter(date => {
              const month = new Date(date).getMonth() + 1;
              return month === currentMonth && completedDays[date];
            }).length;
            
          // Count total completions
          const totalDone = Object.keys(completedDays)
            .filter(date => completedDays[date]).length;
            
          // Calculate overall completion rate
          const totalDays = Object.keys(habitsByDate).length;
          const overallRate = totalDays > 0 
            ? (totalDone / totalDays * 100).toFixed(1) 
            : 0;
          
          setHabitStats({
            currentStreak,
            bestStreak,
            doneInMonth,
            totalDone,
            overallRate
          });
        }
        
        setHabits(data || []);
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHabits();
  }, [year]);
  
  // Generate the yearly grid
  const renderYearlyGrid = () => {
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    
    // Group habits by date and calculate completion rate
    const habitsByDate = {};
    habits.forEach(habit => {
      const date = habit.habit_date;
      if (!habitsByDate[date]) {
        habitsByDate[date] = { total: 0, completed: 0 };
      }
      
      habitsByDate[date].total++;
      if (habit.completed) {
        habitsByDate[date].completed++;
      }
    });
    
    // Get array of dates that have 80%+ completion rate
    const completedDates = Object.keys(habitsByDate).filter(date => {
      const day = habitsByDate[date];
      return (day.completed / day.total) >= 0.8;
    });
    
    // Create month calendars
    return months.map((month, monthIndex) => {
      // Get days in this month for the selected year
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      
      // Generate grid cells for days
      const dayCells = [];
      for (let day = 1; day <= daysInMonth; day++) {
        // Format date as YYYY-MM-DD
        const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Check if this date is completed
        const isCompleted = completedDates.includes(date);
        
        // Check if this date is today
        const isToday = date === new Date().toISOString().split('T')[0];
        
        // Create the day cell
        dayCells.push(
          <div 
            key={date} 
            className={`w-4 h-4 rounded-sm ${
              isCompleted 
                ? 'bg-blue-500'
                : (habitsByDate[date] ? 'bg-gray-600' : 'bg-gray-800')
            } ${isToday ? 'ring-2 ring-white' : ''}
            hover:opacity-80 cursor-pointer transition-colors`}
            title={date}
          />
        );
      }
      
      // Return month container
      return (
        <div key={month} className="mb-6">
          <h5 className="text-xs text-gray-400 mb-1">{month}</h5>
          <div className="grid grid-cols-7 gap-1">
            {dayCells}
          </div>
        </div>
      );
    });
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-700 rounded"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
        <p className="font-bold">Error loading habits:</p>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Yearly Status
        </h2>
        
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <button
            onClick={() => setYear(year - 1)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none"
            aria-label="Previous year"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[...Array(5)].map((_, i) => {
              const yearOption = new Date().getFullYear() - 2 + i;
              return (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              );
            })}
          </select>
          
          <button
            onClick={() => setYear(year + 1)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none"
            aria-label="Next year"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Streak</p>
              <p className="text-2xl font-bold">{habitStats.currentStreak} <span className="text-sm">Days</span></p>
            </div>
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Best Streak</p>
              <p className="text-2xl font-bold">{habitStats.bestStreak} <span className="text-sm">Days</span></p>
            </div>
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Done in March</p>
              <p className="text-2xl font-bold">{habitStats.doneInMonth} <span className="text-sm">Days</span></p>
            </div>
            <div className="p-2 rounded-full bg-green-500/20 text-green-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overall Rate</p>
              <p className="text-2xl font-bold">{habitStats.overallRate} <span className="text-sm">%</span></p>
            </div>
            <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-300">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-600 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-300">Incomplete</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-800 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-300">No Data</span>
        </div>
      </div>
      
      {/* Yearly Grid */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
          {renderYearlyGrid()}
        </div>
      </div>
      
      {/* Recent Habits Section */}
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Habits</h3>
        
        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No habit data available for {year}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.slice(0, 6).map((habit, index) => (
              <div 
                key={index}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h4 className="font-medium">{habit.habit_name}</h4>
                  <p className="text-gray-400 text-sm">
                    {new Date(habit.habit_date).toLocaleDateString()}
                  </p>
                </div>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    habit.completed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}
                >
                  {habit.completed ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
