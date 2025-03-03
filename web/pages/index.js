import DashboardLayout from '../components/DashboardLayout';
import { createClient } from '@supabase/supabase-js';
import { 
  fallbackWorkoutData, 
  fallbackTimeData, 
  fallbackHabitData, 
  fallbackVo2MaxData 
} from '../utils/fallbackData';

export default function HomePage({ 
  initialWorkoutsData, 
  initialVo2MaxData, 
  initialTimeData, 
  initialHabitsData,
  initialError 
}) {
  return (
    <DashboardLayout 
      initialData={{
        workouts: initialWorkoutsData,
        vo2max: initialVo2MaxData,
        time: initialTimeData,
        habits: initialHabitsData,
        error: initialError
      }}
    />
  );
}

// Server-side data fetching function
export async function getServerSideProps() {
  // Initialize empty data containers with safe fallbacks
  let initialWorkoutsData = [];
  let initialVo2MaxData = [];
  let initialTimeData = [];
  let initialHabitsData = [];
  let initialError = null;
  let supabase = null;

  try {
    // Initialize Supabase client for server-side rendering
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Server: Missing Supabase credentials, using fallback data');
      initialError = "Configuration issue: Missing Supabase credentials";
      return { 
        props: { 
          initialWorkoutsData: fallbackWorkoutData || [], 
          initialVo2MaxData: fallbackVo2MaxData || [], 
          initialTimeData: fallbackTimeData || [], 
          initialHabitsData: fallbackHabitData || [],
          initialError
        } 
      };
    }

    // Create a fresh Supabase client for SSR
    supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Calculate date range for data fetching (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Parallel data fetching for all panels
    const [workoutsResponse, vo2maxResponse, timeResponse, habitsResponse] = await Promise.all([
      // Fetch workout data
      supabase
        .from('workout_stats')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: false }),
      
      // Fetch VO2Max data
      supabase
        .from('vo2max_tests')
        .select('*')
        .order('test_date', { ascending: false }),
      
      // Fetch time tracking data
      supabase
        .from('toggl_time')
        .select('*')
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: true }),
      
      // Fetch habits data
      supabase
        .from('habit_tracking')
        .select('*')
        .gte('habit_date', startDateStr)
        .lte('habit_date', endDateStr)
        .order('habit_date', { ascending: true })
    ]);

    // Process workout data - handle possible errors
    if (workoutsResponse.error) {
      console.error('Server: Error fetching workout data:', workoutsResponse.error);
      initialWorkoutsData = fallbackWorkoutData || [];
    } else {
      initialWorkoutsData = workoutsResponse.data || [];
    }

    // Process VO2Max data - handle possible errors
    if (vo2maxResponse.error) {
      console.error('Server: Error fetching VO2Max data:', vo2maxResponse.error);
      initialVo2MaxData = fallbackVo2MaxData || [];
    } else {
      initialVo2MaxData = vo2maxResponse.data || [];
    }

    // Process time data - handle possible errors
    if (timeResponse.error) {
      console.error('Server: Error fetching time data:', timeResponse.error);
      initialTimeData = fallbackTimeData || [];
    } else {
      initialTimeData = timeResponse.data || [];
    }

    // Process habits data - handle possible errors
    if (habitsResponse.error) {
      console.error('Server: Error fetching habits data:', habitsResponse.error);
      initialHabitsData = fallbackHabitData || [];
    } else {
      initialHabitsData = habitsResponse.data || [];
    }

    // Data verification log
    console.log('Server: Data fetched successfully', {
      workouts: initialWorkoutsData.length,
      vo2max: initialVo2MaxData.length,
      time: initialTimeData.length,
      habits: initialHabitsData.length
    });

  } catch (error) {
    console.error('Server: Error in getServerSideProps:', error);
    initialError = error.message || "Failed to load initial data";
    
    // Use fallback data if fetching fails
    initialWorkoutsData = fallbackWorkoutData || [];
    initialVo2MaxData = fallbackVo2MaxData || [];
    initialTimeData = fallbackTimeData || [];
    initialHabitsData = fallbackHabitData || [];
  }

  // Ensure all data fields are serializable arrays (never undefined)
  return {
    props: {
      initialWorkoutsData: Array.isArray(initialWorkoutsData) ? initialWorkoutsData : [],
      initialVo2MaxData: Array.isArray(initialVo2MaxData) ? initialVo2MaxData : [], 
      initialTimeData: Array.isArray(initialTimeData) ? initialTimeData : [],
      initialHabitsData: Array.isArray(initialHabitsData) ? initialHabitsData : [],
      initialError: initialError || null
    }
  };
}
