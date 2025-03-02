// web/components/panels/OverviewPanel.js
import { useState, useEffect } from 'react';
import StatsCard from '../ui/StatsCard';
import DataChart from '../ui/DataChart';
import QuoteCard from '../ui/QuoteCard';
import ActivityFeed from '../ui/ActivityFeed';
import { getSupabaseClient } from '../../utils/supabaseClient';

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
          const { data: vo2MaxData } = await supabase
            .from('vo2max_tests')
            .select('*')
            .order('test_date', { ascending: false })
            .limit(1);

          if (vo2MaxData && vo2MaxData.length > 0) {
            vo2MaxValue = vo2MaxData[0].vo2max_value;
          }

          const { data: workoutsData } = await supabase
            .from('workout_stats')
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr);

          if (workoutsData) {
            workoutCount = workoutsData.length;
            const workoutActivities = (workoutsData || []).slice(0, 3).map((workout) => ({
              type: 'workout',
              title: workout.title || workout.activity_type,
              date: new Date(workout.date).toLocaleDateString(),
              value: `${(workout.distance / 1000).toFixed(2)} km`,
            }));
            if (workoutActivities.length > 0) {
              recentItems = [...workoutActivities, ...recentItems.slice(0, 3 - workoutActivities.length)];
            }
          }

          const { data: togglData } = await supabase
            .from('toggl_time')
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr);

          if (togglData) {
            deepWorkHours = (togglData || [])
              .filter((entry) => entry.bucket === 'Deep Work')
              .reduce((sum, entry) => sum + entry.hours, 0);
          }

          const { data: habitsData } = await supabase
            .from('habit_tracking')
            .select('*')
            .gte('habit_date', startDateStr)
            .lte('habit_date', endDateStr);

          if (habitsData) {
            const habitsByDate = {};
            (habitsData || []).forEach((habit) => {
              if (!habitsByDate[habit.habit_date]) {
                habitsByDate[habit.habit_date] = { total: 0, completed: 0 };
              }
              habitsByDate[habit.habit_date].total++;
              if (habit.completed) habitsByDate[habit.habit_date].completed++;
            });
            habitStreakCount = Object.keys(habitsByDate).filter(
              (date) => habitsByDate[date].completed / habitsByDate[date].total >= 0.8
            ).length;
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
          vo2Max: { value: vo2MaxValue, trend: vo2MaxTrend },
          workouts: { value: workoutCount, trend: 0 },
          focusHours: { value: deepWorkHours.toFixed(1), trend: 0 },
          habitStreak: { value: habitStreakCount, trend: 0 },
        });
        setActivityData(chartData);
        setRecentActivities(recentItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setRecentActivities(fallbackActivities);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange]);

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
            quote="Consistency over intensity. Those who show up every day outperform those who show up occasionally with maximum effort."
            author="James Clear"
          />
          <ActivityFeed activities={recentActivities || []} isLoading={isLoading} />
        </div>
      </div>

      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-6 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Dashboard Inspiration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg bg-gray-800/50 border border-blue-500/10">
            <h4 className="text-blue-300 font-medium mb-2">Naval Ravikant</h4>
            <p className="text-gray-300 text-sm">
              Prioritizing health, learning, and deep work as foundational elements for personal growth and wealth creation.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-purple-500/10">
            <h4 className="text-purple-300 font-medium mb-2">Peter Attia</h4>
            <p className="text-gray-300 text-sm">
              Tracking fitness metrics like VO2 max, strength, and other longevity indicators to optimize health over the long term.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-green-500/10">
            <h4 className="text-green-300 font-medium mb-2">Balaji Srinivasan</h4>
            <p className="text-gray-300 text-sm">
              Public accountability through "Proof of Workout" concept, encouraging transparency in fitness and productivity efforts.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-amber-500/10">
            <h4 className="text-amber-300 font-medium mb-2">James Clear</h4>
            <p className="text-gray-300 text-sm">
              Emphasizing small, consistent habits to drive meaningful change. Making habit data public reinforces accountability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
