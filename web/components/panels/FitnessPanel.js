// web/components/panels/FitnessPanel.js
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import WorkoutCard from '../ui/WorkoutCard';
import MetricInput from '../ui/MetricInput';
import StatsGrid from '../ui/StatsGrid';
import { getSupabaseClient } from '../../utils/supabaseClient';

const fallbackWorkouts = [
  { id: 1, date: '2023-01-10', activity_type: 'Running', title: 'Morning Run', distance: 5200, time: 1800, calories: 450, avg_hr: 155 },
  { id: 2, date: '2023-01-08', activity_type: 'Cycling', title: 'Weekend Ride', distance: 15000, time: 3600, calories: 620, avg_hr: 145 }
];
const fallbackVo2MaxHistory = [
  { test_date: '2023-01-05', vo2max_value: 42.5 },
  { test_date: '2023-01-15', vo2max_value: 43.2 },
  { test_date: '2023-01-25', vo2max_value: 44.1 }
];

export default function FitnessPanel({ dateRange }) {
  const [workouts, setWorkouts] = useState([]);
  const [vo2MaxHistory, setVo2MaxHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutStats, setWorkoutStats] = useState({
    totalDistance: 0,
    totalCalories: 0,
    totalTime: 0,
    avgHeartRate: 0
  });

  const formatDateParam = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = getSupabaseClient();
        let workoutsData = fallbackWorkouts;
        let vo2MaxData = fallbackVo2MaxHistory;

        if (supabase) {
          const { data: workoutsFetched } = await supabase
            .from('workout_stats')
            .select('*')
            .gte('date', startDateStr)
            .lte('date', endDateStr)
            .order('date', { ascending: false });
          if (workoutsFetched?.length > 0) workoutsData = workoutsFetched;

          const { data: vo2MaxFetched } = await supabase
            .from('vo2max_tests')
            .select('*')
            .gte('test_date', startDateStr)
            .lte('test_date', endDateStr)
            .order('test_date', { ascending: true });
          if (vo2MaxFetched?.length > 0) vo2MaxData = vo2MaxFetched;
        }

        setWorkouts(workoutsData);
        const totalDistance = workoutsData.reduce((sum, w) => sum + (w.distance || 0), 0);
        const totalCalories = workoutsData.reduce((sum, w) => sum + (w.calories || 0), 0);
        const totalTime = workoutsData.reduce((sum, w) => sum + (w.time || 0), 0);
        const heartRateWorkouts = workoutsData.filter(w => w.avg_hr);
        const avgHeartRate = heartRateWorkouts.length
          ? heartRateWorkouts.reduce((sum, w) => sum + w.avg_hr, 0) / heartRateWorkouts.length
          : 0;
        setWorkoutStats({
          totalDistance: parseFloat((totalDistance / 1000).toFixed(1)),
          totalCalories,
          totalTime: Math.round(totalTime / 60),
          avgHeartRate: Math.round(avgHeartRate)
        });
        setVo2MaxHistory(vo2MaxData);
      } catch (error) {
        console.error('Error fetching fitness data:', error);
        setWorkouts(fallbackWorkouts);
        setVo2MaxHistory(fallbackVo2MaxHistory);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [dateRange]);

  const vo2MaxChartData = {
    labels: vo2MaxHistory.map(d => d.test_date),
    datasets: [
      {
        label: 'VO₂ Max',
        data: vo2MaxHistory.map(d => d.vo2max_value),
        borderColor: 'rgba(139, 92, 246, 0.8)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const activityTypes = workouts.reduce((acc, workout) => {
    const type = workout.activity_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const activityChartData = {
    labels: Object.keys(activityTypes),
    datasets: [
      {
        data: Object.values(activityTypes),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const handleVo2MaxSubmit = async (value) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('vo2max_tests')
        .upsert({ test_date: today, vo2max_value: parseFloat(value), notes: '' }, { onConflict: 'test_date' });
      if (error) throw error;

      const { data: refreshData } = await supabase
        .from('vo2max_tests')
        .select('*')
        .gte('test_date', formatDateParam(dateRange.startDate))
        .lte('test_date', formatDateParam(dateRange.endDate))
        .order('test_date', { ascending: true });
      if (refreshData) setVo2MaxHistory(refreshData);
      return true;
    } catch (error) {
      console.error('Error saving VO2 Max:', error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Fitness Tracker
        </h2>
        <MetricInput
          label="Add VO₂ Max Reading"
          placeholder="e.g. 42.5"
          unit="ml/kg/min"
          onSubmit={handleVo2MaxSubmit}
        />
      </div>
      <StatsGrid
        stats={[
          { title: 'Total Distance', value: workoutStats.totalDistance, unit: 'km', icon: 'map' },
          { title: 'Total Calories', value: workoutStats.totalCalories, unit: 'kcal', icon: 'flame' },
          { title: 'Active Time', value: workoutStats.totalTime, unit: 'min', icon: 'clock' },
          { title: 'Avg Heart Rate', value: workoutStats.avgHeartRate, unit: 'bpm', icon: 'heart' }
        ]}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">VO₂ Max Trend</h3>
          <DataChart
            data={vo2MaxChartData}
            type="line"
            height={300}
            isLoading={isLoading || vo2MaxHistory.length === 0}
            options={{
              scales: {
                y: {
                  min: Math.max(0, Math.min(...vo2MaxHistory.map(d => d.vo2max_value || 0)) - 5),
                  max: Math.max(...vo2MaxHistory.map(d => d.vo2max_value || 0)) + 5
                }
              }
            }}
          />
        </div>
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Activity Types</h3>
          <DataChart
            data={activityChartData}
            type="doughnut"
            height={250}
            isLoading={isLoading || workouts.length === 0}
            options={{ plugins: { legend: { position: 'bottom' } } }}
          />
        </div>
      </div>
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Workouts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <WorkoutCard key={i} isLoading={true} />)
          ) : workouts?.length > 0 ? (
            workouts?.slice(0, 6).map((workout, index) => (
              <WorkoutCard
                key={index}
                activityType={workout.activity_type}
                title={workout.title}
                date={workout.date}
                distance={workout.distance}
                duration={workout.time}
                calories={workout.calories}
                heartRate={workout.avg_hr}
              />
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-gray-400">
              No workouts found in the selected date range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
