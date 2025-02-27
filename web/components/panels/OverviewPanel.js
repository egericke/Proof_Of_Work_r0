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
  const [activityData, setActivityData] = useState({
    labels: [],
    datasets: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format dates for API calls
  const formatDateParam = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch data from APIs
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Format date range for API calls
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        
        // Fetch VO2 Max data
        const vo2MaxResponse = await fetch(`/api/vo2max?latest=true`);
        const vo2MaxData = await vo2MaxResponse.json();
        
        // Fetch workout stats
        const workoutsResponse = await fetch(`/api/workouts?start_date=${startDateStr}&end_date=${endDateStr}`);
        const workoutsData = await workoutsResponse.json();
        
        // Fetch Toggl data
        const togglResponse = await fetch(`/api/toggl?start_date=${startDateStr}&end_date=${endDateStr}`);
        const togglData = await togglResponse.json();
        
        // Fetch habits data
        const habitsResponse = await fetch(`/api/habits?start_date=${startDateStr}&end_date=${endDateStr}`);
        const habitsData = await habitsResponse.json();
        
        // Calculate total workouts
        const totalWorkouts = workoutsData.data?.length || 0;
        
        // Calculate total deep work hours
        const deepWorkHours = togglData.raw
          ?.filter(entry => entry.bucket === 'Deep Work')
          ?.reduce((sum, entry) => sum + entry.hours, 0) || 0;
        
        // Calculate habit streak
        // (Simplified - actual streak would need consecutive days logic)
        const completedDaysCount = Object.keys(habitsData.summary?.habitsByDate || {})
          .filter(date => {
            const dayData = habitsData.summary.habitsByDate[date];
            return dayData.completed / dayData.total >= 0.8; // 80% completion as threshold
          }).length;
        
        // Gather recent activities for feed
        const recentItems = [];
        
        // Add recent workouts to activities
        if (workoutsData.data && workoutsData.data.length > 0) {
          workoutsData.data.slice(0, 3).forEach(workout => {
            const workoutDate = new Date(workout.date);
            recentItems.push({
              type: 'workout',
              title: workout.title || workout.activity_type,
              date: workoutDate.toLocaleDateString(),
              value: `${(workout.distance / 1000).toFixed(2)} km`
            });
          });
        }
        
        // Add recent toggl entries
        if (togglData.raw && togglData.raw.length > 0) {
          // Group toggl data by date and bucket
          const togglByDate = {};
          togglData.raw.forEach(entry => {
            if (!togglByDate[entry.date]) {
              togglByDate[entry.date] = {};
            }
            if (!togglByDate[entry.date][entry.bucket]) {
              togglByDate[entry.date][entry.bucket] = 0;
            }
            togglByDate[entry.date][entry.bucket] += entry.hours;
          });
          
          // Get 2 most recent dates
          Object.keys(togglByDate)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 2)
            .forEach(date => {
              // Get largest bucket for this date
              const buckets = Object.keys(togglByDate[date]);
              const largestBucket = buckets.reduce(
                (max, bucket) => togglByDate[date][bucket] > togglByDate[date][max] ? bucket : max, 
                buckets[0]
              );
              
              recentItems.push({
                type: 'focus',
                title: largestBucket,
                date: new Date(date).toLocaleDateString(),
                value: `${togglByDate[date][largestBucket].toFixed(1)} hrs`
              });
            });
        }
        
        // Add habits completion status
        if (habitsData.habits && habitsData.habits.length > 0) {
          // Get most recent habit date
          const habitDates = [...new Set(habitsData.habits.map(h => h.habit_date))];
          habitDates.sort((a, b) => new Date(b) - new Date(a));
          
          if (habitDates.length > 0) {
            const latestDate = habitDates[0];
            const habitsForLatestDate = habitsData.habits.filter(h => h.habit_date === latestDate);
            const completed = habitsForLatestDate.filter(h => h.completed).length;
            const total = habitsForLatestDate.length;
            
            recentItems.push({
              type: 'habit',
              title: 'Daily Habits',
              date: new Date(latestDate).toLocaleDateString(),
              value: `${completed}/${total} complete`
            });
          }
        }
        
        // Sort activities by date (most recent first)
        recentItems.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        // Prepare chart data (last 7 days of workouts and focus hours)
        // In a real implementation, you'd want to get more precise data
        // For demo purposes, this uses a set of weekly data points
        const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Simplified dummy data for chart visual
        // In a real implementation, you'd process the actual API response data
        const chartData = {
          labels: chartLabels,
          datasets: [
            {
              label: 'Workouts',
              data: [1, 0, 1, 1, 0, 1, 0],
              borderColor: 'rgba(66, 153, 225, 0.8)',
              backgroundColor: 'rgba(66, 153, 225, 0.2)',
              yAxisID: 'y-axis-1',
            },
            {
              label: 'Focus Hours',
              data: [4.5, 5.2, 3.8, 6.1, 4.3, 1.5, 0.8],
              borderColor: 'rgba(236, 72, 153, 0.8)',
              backgroundColor: 'rgba(236, 72, 153, 0.2)',
              yAxisID: 'y-axis-2',
            }
          ]
        };
        
        // Update state with all fetched data
        setStats({
          vo2Max: { 
            value: vo2MaxData.latest?.vo2max_value || 0,
            trend: vo2MaxData.trend || 0
          },
          workouts: { 
            value: totalWorkouts, 
            trend: 0  // Trend calculation would require historical comparison
          },
          focusHours: { 
            value: deepWorkHours.toFixed(1),
            trend: 0  // Trend calculation would require historical comparison
          },
          habitStreak: { 
            value: completedDaysCount,
            trend: 0  // Trend calculation would require historical comparison
          }
        });
        
        setActivityData(chartData);
        setRecentActivities(recentItems);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase, dateRange]);

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
            data={activityData} 
            type="line" 
            height={300} 
            isLoading={isLoading}
            options={{
              scales: {
                'y-axis-1': {
                  type: 'linear',
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Workouts'
                  },
                  suggestedMin: 0,
                  suggestedMax: 2,
                  ticks: {
                    stepSize: 1
                  }
                },
                'y-axis-2': {
                  type: 'linear',
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Hours'
                  },
                  suggestedMin: 0,
                  grid: {
                    drawOnChartArea: false
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="flex flex-col gap-6">
          <QuoteCard 
            quote="Consistency over intensity. Those who show up every day outperform those who show up occasionally with maximum effort."
            author="James Clear"
          />
          
          <ActivityFeed 
            activities={recentActivities}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Dashboard Inspiration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg bg-gray-800/50 border border-blue-500/10">
            <h4 className="text-blue-300 font-medium mb-2">Naval Ravikant</h4>
            <p className="text-gray-300 text-sm">Prioritizing health, learning, and deep work as foundational elements for personal growth and wealth creation.</p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/50 border border-purple-500/10">
            <h4 className="text-purple-300 font-medium mb-2">Peter Attia</h4>
            <p className="text-gray-300 text-sm">Tracking fitness metrics like VO2 max, strength, and other longevity indicators to optimize health over the long term.</p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/50 border border-green-500/10">
            <h4 className="text-green-300 font-medium mb-2">Balaji Srinivasan</h4>
            <p className="text-gray-300 text-sm">Public accountability through "Proof of Workout" concept, encouraging transparency in fitness and productivity efforts.</p>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-800/50 border border-amber-500/10">
            <h4 className="text-amber-300 font-medium mb-2">James Clear</h4>
            <p className="text-gray-300 text-sm">Emphasizing small, consistent habits to drive meaningful change. Making habit data public reinforces accountability.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
