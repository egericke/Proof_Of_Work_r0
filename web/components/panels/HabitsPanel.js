// Fixed HabitsPanel.js with improved error handling
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import HabitCard from '../ui/HabitCard';
import HabitCalendar from '../ui/HabitCalendar';

export default function HabitsPanel({ supabase, dateRange }) {
  const [habitData, setHabitData] = useState([]);
  const [habitAnalytics, setHabitAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [habitStats, setHabitStats] = useState({
    totalTracked: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  // Fetch habit data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Validate inputs
        if (!supabase) {
          throw new Error("Supabase client is not available");
        }
        
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
          throw new Error("Date range is invalid");
        }
        
        // Format dates for queries
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        // Get habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habit_tracking')
          .select('*')
          .gte('habit_date', startDate)
          .lte('habit_date', endDate)
          .order('habit_date', { ascending: true });
          
        if (habitsError) throw habitsError;
        
        // Get habit analytics
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('habit_analytics')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });
          
        // Ensure we have arrays even if the queries failed
        const safeHabitsData = Array.isArray(habitsData) ? habitsData : [];
        const safeAnalyticsData = Array.isArray(analyticsData) ? analyticsData : [];
        
        setHabitData(safeHabitsData);
        setHabitAnalytics(safeAnalyticsData);
        
        // Only process data if we have any
        if (safeHabitsData.length > 0) {
          const totalHabits = safeHabitsData.length;
          const completedHabits = safeHabitsData.filter(h => h.completed).length;
          const completionRate = totalHabits > 0 
            ? (completedHabits / totalHabits * 100).toFixed(1) 
            : 0;
            
          // Calculate streak (simplified)
          const sortedByDate = [...safeHabitsData]
            .sort((a, b) => new Date(b.habit_date) - new Date(a.habit_date));
          
          let currentStreak = 0;
          for (const habit of sortedByDate) {
            if (habit.completed) {
              currentStreak++;
            } else {
              break;
            }
          }
          
          // Calculate longest streak (simplified)
          let longestStreak = 0;
          let currentLongStreak = 0;
          for (const habit of safeHabitsData) {
            if (habit.completed) {
              currentLongStreak++;
              if (currentLongStreak > longestStreak) {
                longestStreak = currentLongStreak;
              }
            } else {
              currentLongStreak = 0;
            }
          }
          
          setHabitStats({
            totalTracked: totalHabits,
            completionRate,
            currentStreak,
            longestStreak
          });
        }
      } catch (error) {
        console.error('Error fetching habit data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [supabase, dateRange]);

  // Prepare consistency chart data - with defensive programming
  const consistencyChartData = {
    // Ensure we have valid arrays even if habitAnalytics is undefined
    labels: Array.isArray(habitAnalytics) ? habitAnalytics.map(item => item.date || '') : [],
    datasets: [
      {
        label: 'Consistency Score',
        data: Array.isArray(habitAnalytics) 
          ? habitAnalytics.map(item => (item && item.consistency_score) || 0) 
          : [],
        fill: true,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.8)',
        tension: 0.3
      }
    ]
  };
  
  // Group habits by name - with defensive programming
  const habitsByName = Array.isArray(habitData) ? habitData.reduce((acc, habit) => {
    const name = habit.habit_name || 'Unnamed';
    if (!acc[name]) acc[name] = [];
    acc[name].push(habit);
    return acc;
  }, {}) : {};
  
  // Calculate completion rate by habit - with defensive programming
  const habitCompletionRates = Object.entries(habitsByName).map(([name, habits]) => {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const rate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    
    return { name, rate, total, completed };
  }).sort((a, b) => b.rate - a.rate);
  
  // Prepare habit completion rate chart data
  const habitRatesChartData = {
    labels: habitCompletionRates.map(h => h.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: habitCompletionRates.map(h => h.rate),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  // Prepare calendar data - with defensive programming
  const calendarData = Array.isArray(habitData) ? habitData.reduce((acc, habit) => {
    if (!habit || !habit.habit_date) return acc;
    
    const date = habit.habit_date;
    if (!acc[date]) acc[date] = { total: 0, completed: 0 };
    
    acc[date].total++;
    if (habit.completed) acc[date].completed++;
    
    return acc;
  }, {}) : {};

  // Show error state if we have an error
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Habit Tracker
        </h2>
        
        <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Data</h3>
          <p className="text-white">{error}</p>
          <p className="mt-4 text-gray-300">Try refreshing the page or check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Habit Tracker
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HabitCard 
          title="Habits Tracked" 
          value={habitStats.totalTracked}
          icon="list-check"
          color="amber"
          isLoading={isLoading}
        />
        <HabitCard 
          title="Completion Rate" 
          value={`${habitStats.completionRate}%`}
          icon="percent"
          color="green"
          isLoading={isLoading}
        />
        <HabitCard 
          title="Current Streak" 
          value={habitStats.currentStreak}
          unit="days"
          icon="flame"
          color="red"
          isLoading={isLoading}
        />
        <HabitCard 
          title="Longest Streak" 
          value={habitStats.longestStreak}
          unit="days"
          icon="trophy"
          color="blue"
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Consistency Score</h3>
          <DataChart 
            data={consistencyChartData} 
            type="line" 
            height={300}
            isLoading={isLoading || (Array.isArray(habitAnalytics) && habitAnalytics.length === 0)}
            options={{
              scales: {
                y: {
                  suggestedMin: 0,
                  suggestedMax: 100,
                  title: {
                    display: true,
                    text: 'Score (%)'
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Habits by Completion Rate</h3>
          <DataChart 
            data={habitRatesChartData} 
            type="bar" 
            height={300}
            isLoading={isLoading || habitCompletionRates.length === 0}
            options={{
              indexAxis: 'y',
              scales: {
                x: {
                  suggestedMin: 0,
                  suggestedMax: 100,
                  title: {
                    display: true,
                    text: 'Completion Rate (%)'
                  }
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Habit Calendar</h3>
        <HabitCalendar 
          data={calendarData}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
