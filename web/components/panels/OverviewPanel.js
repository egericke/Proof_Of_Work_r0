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

  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
          console.warn('OverviewPanel: Invalid dateRange provided, using fallback data');
          setRecentActivities(fallbackActivities || []);
          return;
        }

        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = getSupabaseClient();

        let vo2MaxValue = fallbackVo2Max.value;
        let vo2MaxTrend = fallbackVo2Max.trend;
        let workoutCount = 0;
        let deepWorkHours = 0;
        let habitStreakCount = 0;
        let recentItems = [...(fallbackActivities || [])];

        if (supabase) {
          try {
            // VO2 max query
            const vo2MaxQuery = supabase
              .from('vo2max_tests')
              .select('*')
              .order('test_date', { ascending: false })
              .limit(1);

            // Workouts query
            const workoutsQuery = supabase
              .from('workout_stats')
              .select('*')
              .gte('date', startDateStr)
              .lte('date', endDateStr);

            // Toggl time query
            const togglQuery = supabase
              .from('toggl_time')
              .select('*')
              .gte('date', startDateStr)
              .lte('date', endDateStr);

            // Habits query
            const habitsQuery = supabase
              .from('habit_tracking')
              .select('*')
              .gte('habit_date', startDateStr)
              .lte('habit_date', endDateStr);

            // Use execute for mockClient or standard await pattern
            const vo2MaxResult = vo2MaxQuery.execute 
              ? await vo2MaxQuery.execute() 
              : await vo2MaxQuery;
              
            const workoutsResult = workoutsQuery.execute 
              ? await workoutsQuery.execute() 
              : await workoutsQuery;
              
            const togglResult = togglQuery.execute 
              ? await togglQuery.execute() 
              : await togglQuery;
              
            const habitsResult = habitsQuery.execute 
              ? await habitsQuery.execute() 
              : await habitsQuery;

            // Extract data and handle errors
            const { data: vo2MaxData, error: vo2MaxError } = vo2MaxResult;
            const { data: workoutsData, error: workoutsError } = workoutsResult;
            const { data: togglData, error: togglError } = togglResult;
            const { data: habitsData, error: habitsError } = habitsResult;

            // Process VO2 max data
            if (!vo2MaxError && vo2MaxData && Array.isArray(vo2MaxData) && vo2MaxData.length > 0) {
              vo2MaxValue = vo2MaxData[0].vo2max_value;
            }

            // Process workouts data
            if (!workoutsError && workoutsData && Array.isArray(workoutsData)) {
              workoutCount = workoutsData.length;
              const workoutActivities = workoutsData.slice(0, 3).map(workout => ({
                type: 'workout',
                title: workout?.title || workout?.activity_type || 'Workout',
                date: workout?.date ? new Date(workout.date).toLocaleDateString() : 'Unknown',
                value: `${((workout?.distance || 0) / 1000).toFixed(2)} km`,
              }));
              if (workoutActivities.length > 0) {
                recentItems = [...workoutActivities, ...(recentItems || []).slice(0, 3 - workoutActivities.length)];
              }
            }

            // Process toggl data
            if (!togglError && togglData && Array.isArray(togglData)) {
              deepWorkHours = togglData
                .filter(entry => entry && entry.bucket === 'Deep Work')
                .reduce((sum, entry) => sum + (entry?.hours || 0), 0);
            }

            // Process habits data
            if (!habitsError && habitsData && Array.isArray(habitsData)) {
              const habitsByDate = {};
              habitsData.forEach(habit => {
                if (!habit) return;
                if (!habitsByDate[habit.habit_date]) {
                  habitsByDate[habit.habit_date] = { total: 0, completed: 0 };
                }
                habitsByDate[habit.habit_date].total++;
                if (habit.completed) habitsByDate[habit.habit_date].completed++;
              });
              habitStreakCount = Object.keys(habitsByDate).filter(date => {
                const dayData = habitsByDate[date];
                return dayData.completed / dayData.total >= 0.8;
              }).length;
            }
          } catch (supabaseError) {
            console.error('Supabase query error:', supabaseError);
            // Continue with fallback data
          }
        }

        const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
            },
          ],
        };

        setStats({
          vo2Max: { value: vo2MaxValue || 0, trend: vo2MaxTrend || 0 },
          workouts: { value: workoutCount || 0, trend: 0 },
          focusHours: { value: deepWorkHours ? deepWorkHours.toFixed(1) : '0.0', trend: 0 },
          habitStreak: { value: habitStreakCount || 0, trend: 0 },
        });
        setActivityData(chartData);
        setRecentActivities(recentItems || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setRecentActivities(fallbackActivities || []);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [dateRange]);

  console.log('Rendering OverviewPanel with recentActivities:', recentActivities);

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
                'y-axis-1': { type: 'linear', position: 'left', title: { display: true, text: 'Workouts' }, suggestedMin: 0, suggestedMax: 2, ticks: { stepSize: 1 } },
                'y-axis-2': { type: 'linear', position: 'right', title: { display: true, text: 'Hours' }, suggestedMin: 0, grid: { drawOnChartArea: false } },
              },
            }}
          />
        </div>
        <div className="flex flex-col gap-6">
          <QuoteCard
            quote="Consistency over intensity. Those who show up every day outperform those who show up occasionally with maximum effort."
            author="James Clear"
          />
          <ActivityFeed activities={recentActivities} isLoading={isLoading} />
        </div>
      </div>
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Dashboard Inspiration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Naval Ravikant', text: 'Prioritizing health, learning, and deep work...', color: 'blue' },
            { name: 'Peter Attia', text: 'Tracking fitness metrics like VO2 max...', color: 'purple' },
            { name: 'Balaji Srinivasan', text: 'Public accountability through "Proof of Workout"...', color: 'green' },
            { name: 'James Clear', text: 'Emphasizing small, consistent habits...', color: 'amber' },
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg bg-gray-800/50 border border-${item.color}-500/10`}>
              <h4 className={`text-${item.color}-300 font-medium mb-2`}>{item.name}</h4>
              <p className="text-gray-300 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
