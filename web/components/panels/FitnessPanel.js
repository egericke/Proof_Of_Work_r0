// web/components/panels/FitnessPanel.js
import React, { useState, useEffect, useMemo } from 'react';
import DataChart from '../ui/DataChart';
import WorkoutCard from '../ui/WorkoutCard';
import MetricInput from '../ui/MetricInput';
import StatsGrid from '../ui/StatsGrid';
import { getSupabaseClient } from '../../utils/supabaseClient';

// Fallback data
const fallbackWorkouts = [
  { id: 1, date: '2023-01-10', activity_type: 'Running', title: 'Morning Run', distance: 5200, time: 1800, calories: 450, avg_hr: 155 },
  { id: 2, date: '2023-01-08', activity_type: 'Cycling', title: 'Weekend Ride', distance: 15000, time: 3600, calories: 620, avg_hr: 145 },
];
const fallbackVo2MaxHistory = [
  { test_date: '2023-01-05', vo2max_value: 42.5 },
  { test_date: '2023-01-15', vo2max_value: 43.2 },
  { test_date: '2023-01-25', vo2max_value: 44.1 },
];

function FitnessPanel({ 
  dateRange, 
  supabase: propSupabase, 
  initialWorkouts = [], 
  initialVo2MaxHistory = [] 
}) {
  // Ensure dateRange is defined with fallback values
  if (!dateRange) {
    dateRange = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    };
  }
  
  // Initialize state with server-fetched data or empty arrays
  const [workouts, setWorkouts] = useState(
    Array.isArray(initialWorkouts) && initialWorkouts.length > 0 
      ? initialWorkouts 
      : []
  );
  const [vo2MaxHistory, setVo2MaxHistory] = useState(
    Array.isArray(initialVo2MaxHistory) && initialVo2MaxHistory.length > 0 
      ? initialVo2MaxHistory 
      : []
  );
  
  // Don't show loading state if we already have data
  const [isLoading, setIsLoading] = useState(
    !(initialWorkouts?.length && initialVo2MaxHistory?.length)
  );
  const [error, setError] = useState(null);
  const [workoutStats, setWorkoutStats] = useState({
    totalDistance: 0,
    totalCalories: 0,
    totalTime: 0,
    avgHeartRate: 0,
  });

  const formatDateParam = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date object');
      }
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error('Date formatting error:', err);
      return new Date().toISOString().split('T')[0]; // Use today as fallback
    }
  };

  useEffect(() => {
    // Skip data fetching if we already have data from server-side props
    const hasInitialWorkoutData = Array.isArray(initialWorkouts) && initialWorkouts.length > 0 && workouts === initialWorkouts;
    const hasInitialVo2MaxData = Array.isArray(initialVo2MaxHistory) && initialVo2MaxHistory.length > 0 && vo2MaxHistory === initialVo2MaxHistory;
    
    if (hasInitialWorkoutData && hasInitialVo2MaxData) {
      console.log('FitnessPanel: Using server-fetched initial data - workouts:', initialWorkouts.length, 'vo2max:', initialVo2MaxHistory.length);
      
      // Calculate initial stats from preloaded data
      const validWorkouts = initialWorkouts.filter(w => w !== null);
      const totalDistance = validWorkouts.reduce((sum, w) => sum + (typeof w.distance === 'number' ? w.distance : 0), 0);
      const totalCalories = validWorkouts.reduce((sum, w) => sum + (typeof w.calories === 'number' ? w.calories : 0), 0);
      const totalTime = validWorkouts.reduce((sum, w) => sum + (typeof w.time === 'number' ? w.time : 0), 0);
      
      const heartRateWorkouts = validWorkouts.filter(w => typeof w.avg_hr === 'number');
      const avgHeartRate = heartRateWorkouts.length
        ? heartRateWorkouts.reduce((sum, w) => sum + w.avg_hr, 0) / heartRateWorkouts.length
        : 0;

      setWorkoutStats({
        totalDistance: parseFloat((totalDistance / 1000).toFixed(1)),
        totalCalories,
        totalTime: Math.round(totalTime / 60),
        avgHeartRate: Math.round(avgHeartRate),
      });
      
      return; // Skip fetching - we already have pre-loaded data
    }
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
          console.warn('FitnessPanel: Invalid dateRange provided, using fallback data');
          setWorkouts(fallbackWorkouts || []);
          setVo2MaxHistory(fallbackVo2MaxHistory || []);
          return;
        }

        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        const supabase = propSupabase || getSupabaseClient();

        let workoutsData = fallbackWorkouts || [];
        let vo2MaxData = fallbackVo2MaxHistory || [];

        if (supabase) {
          try {
            // Workout stats query
            const workoutsQuery = supabase
              .from('workout_stats')
              .select('*')
              .gte('date', startDateStr)
              .lte('date', endDateStr)
              .order('date', { ascending: false });

            // VO2 max query
            const vo2MaxQuery = supabase
              .from('vo2max_tests')
              .select('*')
              .gte('test_date', startDateStr)
              .lte('test_date', endDateStr)
              .order('test_date', { ascending: true });

            // Use execute for mockClient or standard await pattern for workouts
            const workoutsResult = workoutsQuery.execute 
              ? await workoutsQuery.execute() 
              : await workoutsQuery;
            
            // Use execute for mockClient or standard await pattern for vo2max
            const vo2MaxResult = vo2MaxQuery.execute 
              ? await vo2MaxQuery.execute() 
              : await vo2MaxQuery;

            const { data: workoutsFetched, error: workoutsError } = workoutsResult || { data: null, error: null };

            // Detailed error logging to help debug Vercel deployment issues
            if (workoutsError) {
              console.error('Supabase fitness query error details:', {
                message: workoutsError.message,
                code: workoutsError.code,
                details: workoutsError.details,
                hint: workoutsError.hint
              });
              setError(workoutsError.message);
              throw workoutsError;
            }

            const { data: vo2MaxFetched, error: vo2MaxError } = vo2MaxResult || { data: null, error: null };

            // Detailed error logging to help debug Vercel deployment issues
            if (vo2MaxError) {
              console.error('Supabase vo2max query error details:', {
                message: vo2MaxError.message,
                code: vo2MaxError.code,
                details: vo2MaxError.details,
                hint: vo2MaxError.hint
              });
              setError(vo2MaxError.message);
              throw vo2MaxError;
            }
            
            // Log the actual data received for debugging
            console.log('Workouts data received:', workoutsFetched ? 
              `Array with ${workoutsFetched.length} items` : 'No data (null/undefined)');
            console.log('VO2Max data received:', vo2MaxFetched ? 
              `Array with ${vo2MaxFetched.length} items` : 'No data (null/undefined)');
              
            if (workoutsFetched && Array.isArray(workoutsFetched) && workoutsFetched.length > 0) {
              workoutsData = workoutsFetched;
            } else {
              console.log('Using fallback data for workouts since query returned empty results');
            }
            
            if (vo2MaxFetched && Array.isArray(vo2MaxFetched) && vo2MaxFetched.length > 0) {
              vo2MaxData = vo2MaxFetched;
            } else {
              console.log('Using fallback data for VO2Max since query returned empty results');
            }
          } catch (supabaseError) {
            console.error('Supabase query error:', supabaseError);
            // Continue with fallback data
          }
        }

        setWorkouts(workoutsData);
        const totalDistance = (workoutsData || []).reduce((sum, w) => sum + (w?.distance || 0), 0);
        const totalCalories = (workoutsData || []).reduce((sum, w) => sum + (w?.calories || 0), 0);
        const totalTime = (workoutsData || []).reduce((sum, w) => sum + (w?.time || 0), 0);
        const heartRateWorkouts = (workoutsData || []).filter(w => w && w.avg_hr);
        const avgHeartRate = heartRateWorkouts.length
          ? heartRateWorkouts.reduce((sum, w) => sum + (w?.avg_hr || 0), 0) / heartRateWorkouts.length
          : 0;

        setWorkoutStats({
          totalDistance: parseFloat((totalDistance / 1000).toFixed(1)),
          totalCalories,
          totalTime: Math.round(totalTime / 60),
          avgHeartRate: Math.round(avgHeartRate),
        });
        setVo2MaxHistory(vo2MaxData);
      } catch (error) {
        console.error('Error fetching fitness data:', error);
        setWorkouts(fallbackWorkouts || []);
        setVo2MaxHistory(fallbackVo2MaxHistory || []);
        setError(`Failed to load fitness data: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [dateRange, initialWorkouts, initialVo2MaxHistory, workouts, vo2MaxHistory]);

  // Use useMemo for chart data to avoid unnecessary recalculations
  const vo2MaxChartData = useMemo(() => {
    // Validate vo2MaxHistory is an array and filter out any null/undefined entries
    const validHistory = Array.isArray(vo2MaxHistory) ? vo2MaxHistory.filter(d => d !== null && d !== undefined) : [];
    console.log(`Preparing VO2Max chart with ${validHistory.length} data points`);
    
    // Return default empty chart structure if no valid data
    if (validHistory.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'VO₂ Max',
            data: [],
            borderColor: 'rgba(139, 92, 246, 0.8)',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            tension: 0.3,
            fill: true,
          },
        ],
      };
    }
    
    return {
      labels: validHistory.map(d => d && typeof d.test_date === 'string' ? d.test_date : ''),
      datasets: [
        {
          label: 'VO₂ Max',
          data: validHistory.map(d => d && typeof d.vo2max_value === 'number' ? d.vo2max_value : 0),
          borderColor: 'rgba(139, 92, 246, 0.8)',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [vo2MaxHistory]);

  // Use useMemo for activity types calculation
  const activityChartData = useMemo(() => {
    // Validate workouts is an array and filter out any null/undefined entries
    const validWorkouts = Array.isArray(workouts) ? workouts.filter(w => w !== null) : [];
    console.log(`Preparing activity chart with ${validWorkouts.length} workouts`);
    
    const activityTypes = validWorkouts.reduce((acc, workout) => {
      const type = workout && workout.activity_type ? workout.activity_type : 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      labels: Object.keys(activityTypes),
      datasets: [
        {
          data: Object.values(activityTypes),
          backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(139, 92, 246, 0.8)'],
          borderWidth: 0,
        },
      ],
    };
  }, [workouts]);

  const handleVo2MaxSubmit = async (value) => {
    try {
      setError(null);
      const supabase = propSupabase || getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not available');
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('vo2max_tests')
        .upsert({ test_date: today, vo2max_value: parseFloat(value), notes: '' }, { onConflict: 'test_date' });
      if (error) {
        console.error('Error saving VO2 max:', error);
        setError(`Failed to save VO2 max: ${error.message}`);
        throw error;
      }

      const query = supabase
        .from('vo2max_tests')
        .select('*')
        .gte('test_date', formatDateParam(dateRange.startDate))
        .lte('test_date', formatDateParam(dateRange.endDate))
        .order('test_date', { ascending: true });
        
      const result = query.execute 
        ? await query.execute() 
        : await query;
      
      const { data: refreshData, error: refreshError } = result || { data: null, error: null };
      
      if (refreshError) {
        console.error('Error refreshing VO2 max data:', refreshError);
        setError(`Failed to refresh VO2 max data: ${refreshError.message}`);
        throw refreshError;
      }
      
      if (refreshData && Array.isArray(refreshData)) {
        setVo2MaxHistory(refreshData);
      }
      return true;
    } catch (error) {
      console.error('Error saving VO2 Max:', error);
      setError(`Failed to save VO2 max: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  console.log('Rendering FitnessPanel with workouts:', Array.isArray(workouts) ? workouts.length : 'not an array');

  // If there's an error, show it to the user
  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Fitness Tracker
        </h2>
        <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-6 text-center">
          <h3 className="text-xl text-red-400 mb-3">Error Loading Fitness Data</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Fitness Tracker
        </h2>
        <MetricInput label="Add VO₂ Max Reading" placeholder="e.g. 42.5" unit="ml/kg/min" onSubmit={handleVo2MaxSubmit} />
      </div>
      <StatsGrid
        stats={[
          { title: 'Total Distance', value: workoutStats.totalDistance, unit: 'km', icon: 'map' },
          { title: 'Total Calories', value: workoutStats.totalCalories, unit: 'kcal', icon: 'flame' },
          { title: 'Active Time', value: workoutStats.totalTime, unit: 'min', icon: 'clock' },
          { title: 'Avg Heart Rate', value: workoutStats.avgHeartRate, unit: 'bpm', icon: 'heart' },
        ]}
        isLoading={isLoading}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">VO₂ Max Trend</h3>
          {vo2MaxHistory && vo2MaxHistory.length > 0 ? (
            <DataChart
              data={vo2MaxChartData}
              type="line"
              height={300}
              isLoading={isLoading}
              options={{
                scales: {
                  y: {
                    min: Math.max(0, Math.min(...vo2MaxHistory.filter(d => d && typeof d.vo2max_value === 'number').map(d => d.vo2max_value)) - 5),
                    max: Math.max(...vo2MaxHistory.filter(d => d && typeof d.vo2max_value === 'number').map(d => d.vo2max_value)) + 5,
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p>No VO₂ Max data available for the selected date range</p>
            </div>
          )}
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
          ) : (workouts || []).length > 0 ? (
            Array.isArray(workouts) ?
              workouts.filter(w => w !== null && w !== undefined)
                .slice(0, 6)
                .map((workout, index) => (
                  <WorkoutCard
                    key={index}
                    activityType={workout?.activity_type || 'Unknown'}
                    title={workout?.title || 'Workout'}
                    date={workout?.date || 'Unknown date'}
                    distance={workout?.distance || 0}
                    duration={workout?.time || 0}
                    calories={workout?.calories || 0}
                    heartRate={workout?.avg_hr || 0}
                  />
                ))
              : <div className="col-span-3 py-8 text-center text-gray-400">Error: Invalid workout data format.</div>
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

// Define default props
FitnessPanel.defaultProps = {
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  }
};

export default FitnessPanel;
