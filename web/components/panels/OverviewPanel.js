// web/components/panels/OverviewPanel.js
import { useState, useEffect } from 'react';
import StatsCard from '../ui/StatsCard';
import DataChart from '../ui/DataChart';
import QuoteCard from '../ui/QuoteCard';
import ActivityFeed from '../ui/ActivityFeed';

export default function OverviewPanel({ supabase, dateRange }) {
  const [stats, setStats] = useState({
    vo2Max: { value: 0, trend: 0 },
    workouts: { value: 0, trend: 0 },
    focusHours: { value: 0, trend: 0 },
    habitStreak: { value: 0, trend: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Format dates for queries
        const startDate = dateRange.startDate.toISOString().split('T')[0];
        const endDate = dateRange.endDate.toISOString().split('T')[0];
        
        // Get latest VO2 Max
        const { data: vo2MaxData } = await supabase
          .from('vo2max_tests')
          .select('vo2max_value')
          .order('test_date', { ascending: false })
          .limit(1);

        // Count workouts in date range
        const { data: workoutsData, count: workoutsCount } = await supabase
          .from('workout_stats')
          .select('id', { count: 'exact' })
          .gte('date', startDate)
          .lte('date', endDate);

        // Get Toggl focus hours
        const { data: togglData } = await supabase
          .from('toggl_time')
          .select('bucket, hours')
          .eq('bucket', 'Deep Work')
          .gte('date', startDate)
          .lte('date', endDate);

        // Get habit streak
        const { data: habitsData } = await supabase
          .from('habit_analytics')
          .select('consistency_score')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });

        // Calculate values
        const focusHours = togglData.reduce((sum, entry) => sum + entry.hours, 0);
        const habitStreak = habitsData.length > 0 ? 
          habitsData.filter(h => h.consistency_score >= 80).length : 0;

        setStats({
          vo2Max: { 
            value: vo2MaxData?.[0]?.vo2max_value || 0, 
            trend: 5 // Placeholder trend value
          },
          workouts: { 
            value: workoutsCount || 0, 
            trend: 10 // Placeholder trend value
          },
          focusHours: { 
            value: parseFloat(focusHours.toFixed(1)) || 0, 
            trend: -2 // Placeholder trend value
          },
          habitStreak: { 
            value: habitStreak, 
            trend: 15 // Placeholder trend value
          }
        });
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase, dateRange]);

  // Some sample chart data (would be replaced with real data)
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Workouts',
        data: [0, 1, 1, 0, 1, 1, 0],
        borderColor: 'rgba(66, 153, 225, 0.8)',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
      },
      {
        label: 'Focus Hours',
        data: [4.5, 5.2, 3.8, 6.1, 4.3, 1.5, 0.8],
        borderColor: 'rgba(236, 72, 153, 0.8)',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Dashboard Overview
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="VO₂ Max" 
          value={stats.vo2Max.value} 
          unit="ml/kg/min" 
          trend={stats.vo2Max.trend} 
          icon="heart" 
          isLoading={isLoading}
          color="purple"
        />
        <StatsCard 
          title="Workouts" 
          value={stats.workouts.value} 
          unit="sessions" 
          trend={stats.workouts.trend} 
          icon="activity" 
          isLoading={isLoading}
          color="blue"
        />
        <StatsCard 
          title="Focus Time" 
          value={stats.focusHours.value} 
          unit="hours" 
          trend={stats.focusHours.trend} 
          icon="clock" 
          isLoading={isLoading}
          color="green"
        />
        <StatsCard 
          title="Habit Streak" 
          value={stats.habitStreak.value} 
          unit="days" 
          trend={stats.habitStreak.trend} 
          icon="check-circle" 
          isLoading={isLoading}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Weekly Activity</h3>
          <DataChart 
            data={chartData} 
            type="line" 
            height={300} 
            isLoading={isLoading}
          />
        </div>
        
        <div className="flex flex-col gap-6">
          <QuoteCard 
            quote="Consistency over intensity. Those who show up every day outperform those who show up occasionally with maximum effort."
            author="James Clear"
          />
          
          <ActivityFeed 
            activities={[
              { type: 'workout', title: 'Morning Run', date: '2 hours ago', value: '5.3 km' },
              { type: 'focus', title: 'Deep Work', date: 'Yesterday', value: '2.5 hrs' },
              { type: 'habit', title: 'Meditation', date: 'Yesterday', value: 'Completed' },
            ]}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
