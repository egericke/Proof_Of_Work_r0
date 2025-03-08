// web/components/panels/OverviewPanel.js
import { useState, useEffect } from 'react';
import StatsCard from '../ui/StatsCard';
import DataChart from '../ui/DataChart';
import QuoteCard from '../ui/QuoteCard';
import ActivityFeed from '../ui/ActivityFeed';
import { getSupabaseClient } from '../../utils/supabaseClient';

// Fallback data
const fallbackVo2Max = { value: 42.5, trend: 1.5 };
const fallbackActivities = [
  { type: 'workout', title: 'Morning Run', date: '2023-01-10', value: '5.20 km' },
  { type: 'focus', title: 'Deep Work', date: '2023-01-09', value: '4.5 hrs' },
  { type: 'habit', title: 'Daily Habits', date: '2023-01-10', value: '4/5 complete' },
];

export default function OverviewPanel({ dateRange }) {
  const [stats, setStats] = useState({
    vo2Max: { value: 0, trend: 0 },
    workouts: { value: 0, trend: 0 },
    focusHours: { value: 0, trend: 0 },
    habitStreak: { value: 0, trend: 0 },
  });
  const [activityData, setActivityData] = useState({ labels: [], datasets: [] });
  const [recentActivities, setRecentActivities] = useState([]);
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

        let vo2MaxValue = fallbackVo2Max.value;
        let vo2MaxTrend = fallbackVo2Max.trend;
        let workoutCount = 0;
        let deepWorkHours = 0;
        let habitStreakCount = 0;
        let recentItems = [...fallbackActivities];

        if (supabase) {
          // Fetch VO2 Max
          const { data: vo2MaxData, error: vo2Error } = await supabase
            .from('vo2max_tests')
            .select('*')
            .order('test_date', { ascending: false })
            .limit(1);
          if (vo2Error) throw vo2Error;
          if (vo2MaxData?.length) vo2MaxValue = vo2MaxData[0].vo2max_value;

          // Fetch Workouts
          const { data: workoutsData, error: workoutError } = await supabase
            .from('workout_stats')
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr);
          if (workoutError) throw workoutError;
          if (workoutsData) {
            workoutCount = workoutsData.length;
            const workoutActivities = workoutsData.slice(0, 3).map((workout) => ({
              type: 'workout',
              title: workout.title || workout.activity_type,
              date: new Date(workout.date).toLocaleDateString(),
              value: `${(workout.distance / 1000).toFixed(2)} km`,
            }));
            recentItems = [...workoutActivities, ...recentItems.slice(workoutActivities.length)];
          }

          // Fetch Toggl Data
          const { data: togglData, error: togglError } = await supabase
            .from('toggl_entries') // Changed to match README consistency
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr);
          if (togglError) throw togglError;
          if (togglData) {
            deepWorkHours = togglData
              .filter((entry) => entry.bucket === 'Deep Work')
              .reduce((sum, entry) => sum + (entry.hours || 0), 0);
          }

          // Fetch Habits
          const { data: habitsData, error: habitError } = await supabase
            .from('habit_tracking')
            .select('*')
            .gte('habit_date', startDateStr)
            .lte('habit_date', endDateStr);
          if (habitError) throw habitError;
          if (habitsData) {
            const habitsByDate = {};
            habitsData.forEach((habit) => {
              if (!habitsByDate[habit.habit_date]) {
                habitsByDate[habit.habit_date] = { total: 0, completed: 0 };
              }
              habitsByDate[habit.habit_date].total++;
              if (habit.completed) habitsByDate[habit.habit_date].completed++;
            });
            habitStreakCount = Object.values(habitsByDate).filter(
              (day) => day.completed / day.total >= 0.8
            ).length;
          }
        }

        // Prepare chart data
        const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chartData = {
          labels: chartLabels,
          datasets: [
            {
              label: 'Workouts',
              data: [1, 0, 1, 1, 0, 1, 0], // Replace with real data if available
              borderColor: 'rgba(66, 153, 225, 0.8)',
              backgroundColor: 'rgba(66, 153, 225, 0.2)',
              yAxisID: 'y-axis-1',
            },
            {
              label: 'Focus Hours',
              data: [4.5, 5.2, 3.8, 6.1, 4.3, 1.5, 0.8], // Replace with real data
              borderColor: 'rgba(236, 72, 153, 0.8)',
              backgroundColor: 'rgba(236, 72, 153, 0.2)',
              yAxisID: 'y-axis-2',
            },
          ],
        };

        setStats({
          vo2Max: { value: vo2MaxValue, trend: vo2MaxTrend },
          workouts: { value: workoutCount, trend: 0 },
          focusHours: { value: deepWorkHours.toFixed(1), trend: 0 },
          habitStreak: { value: habitStreakCount, trend: 0 },
        });
        setActivityData(chartData);
        setRecentActivities(recentItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
        <p className="font-bold">Error loading Overview:</p>
        <p>{error}</p>
      </div>
    );
  }

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
            isLoading={isLoading || !activityData.labels.length}
            options={{
              scales: {
                'y-axis-1': {
                  type: 'linear',
                  position: 'left',
                  title: { display: true, text: 'Workouts' },
                  suggestedMin: 0,
                  suggestedMax: 2,
                  ticks: { stepSize: 1 },
                },
                'y-axis-2': {
                  type: 'linear',
                  position: 'right',
                  title: { display: true, text: 'Hours' },
                  suggestedMin: 0,
                  grid: { drawOnChartArea: false },
                },
              },
            }}
          />
        </div>

        <div className="flex flex-col gap-6">
          <QuoteCard
            quote="Consistency over intensity."
            author="James Clear"
          />
          <ActivityFeed activities={recentActivities} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
