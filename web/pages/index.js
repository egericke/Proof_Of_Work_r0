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
  // If there's a severe error from getServerSideProps, display it here
  // This gives us an additional layer of error handling before passing to DashboardLayout
  if (initialError && initialError.includes("Configuration issue")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Configuration Error</h1>
          <p className="text-gray-300 mb-6">{initialError}</p>
          <p className="text-gray-400 text-sm mb-6">
            This is likely an environment configuration issue. Please check your Vercel environment variables.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, render the dashboard with all our data (and any non-critical errors)
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

    // Log environment variables status
    console.log('Server: Environment variables check:', { 
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey ? 'Set' : 'Not set'
    });

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
    console.log('Server: Supabase client created');

    // Calculate date range for data fetching (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    console.log('Server: Data fetch date range:', { startDateStr, endDateStr });

    // Parallel data fetching for all panels
    console.log('Server: Starting parallel data fetching...');
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
    ]).catch(error => {
      console.error('Server: Promise.all error:', error);
      throw error; // Re-throw to be caught by outer catch
    });

    // Process workout data - handle possible errors
    if (workoutsResponse?.error) {
      console.error('Server: Error fetching workout data:', workoutsResponse.error);
      initialWorkoutsData = fallbackWorkoutData || [];
    } else {
      initialWorkoutsData = workoutsResponse?.data || [];
      console.log('Server: Workouts data fetched:', { 
        count: initialWorkoutsData.length,
        sample: initialWorkoutsData.length > 0 ? 
          JSON.stringify(initialWorkoutsData[0]).substring(0, 200) + '...' : 
          'No data'
      });
    }

    // Process VO2Max data - handle possible errors
    if (vo2maxResponse?.error) {
      console.error('Server: Error fetching VO2Max data:', vo2maxResponse.error);
      initialVo2MaxData = fallbackVo2MaxData || [];
    } else {
      initialVo2MaxData = vo2maxResponse?.data || [];
      console.log('Server: VO2Max data fetched:', { 
        count: initialVo2MaxData.length,
        sample: initialVo2MaxData.length > 0 ? 
          JSON.stringify(initialVo2MaxData[0]).substring(0, 200) + '...' : 
          'No data'
      });
    }

    // Process time data - handle possible errors
    if (timeResponse?.error) {
      console.error('Server: Error fetching time data:', timeResponse.error);
      initialTimeData = fallbackTimeData || [];
    } else {
      initialTimeData = timeResponse?.data || [];
      console.log('Server: Time data fetched:', { 
        count: initialTimeData.length,
        sample: initialTimeData.length > 0 ? 
          JSON.stringify(initialTimeData[0]).substring(0, 200) + '...' : 
          'No data'
      });
    }

    // Process habits data - handle possible errors
    if (habitsResponse?.error) {
      console.error('Server: Error fetching habits data:', habitsResponse.error);
      initialHabitsData = fallbackHabitData || [];
    } else {
      initialHabitsData = habitsResponse?.data || [];
      console.log('Server: Habits data fetched:', { 
        count: initialHabitsData.length,
        sample: initialHabitsData.length > 0 ? 
          JSON.stringify(initialHabitsData[0]).substring(0, 200) + '...' : 
          'No data'
      });
    }

    // Check if any errors occurred and set an appropriate error message
    if (workoutsResponse?.error || vo2maxResponse?.error || timeResponse?.error || habitsResponse?.error) {
      initialError = "Some data failed to load, using fallbacks for affected data";
      console.warn('Server: Data fetch completed with some errors:', initialError);
    } else {
      console.log('Server: All data fetched successfully');
    }

  } catch (error) {
    console.error('Server: Fatal error in getServerSideProps:', error);
    initialError = error.message || "Failed to load initial data";
    
    // Use fallback data if fetching fails
    initialWorkoutsData = fallbackWorkoutData || [];
    initialVo2MaxData = fallbackVo2MaxData || [];
    initialTimeData = fallbackTimeData || [];
    initialHabitsData = fallbackHabitData || [];
    
    console.log('Server: Fallback data used due to error:', {
      workouts: initialWorkoutsData.length,
      vo2max: initialVo2MaxData.length,
      time: initialTimeData.length,
      habits: initialHabitsData.length
    });
  }

  // Final validation to ensure all data is properly structured
  // This is crucial to prevent "Cannot read properties of undefined (reading 'map')" errors
  if (!Array.isArray(initialWorkoutsData)) {
    console.error('Server: initialWorkoutsData is not an array, using empty array');
    initialWorkoutsData = [];
  }
  if (!Array.isArray(initialVo2MaxData)) {
    console.error('Server: initialVo2MaxData is not an array, using empty array');
    initialVo2MaxData = [];
  }
  if (!Array.isArray(initialTimeData)) {
    console.error('Server: initialTimeData is not an array, using empty array');
    initialTimeData = [];
  }
  if (!Array.isArray(initialHabitsData)) {
    console.error('Server: initialHabitsData is not an array, using empty array');
    initialHabitsData = [];
  }

  // Final logging to confirm what's being returned to the client
  console.log('Server: Final getServerSideProps result:', {
    hasError: !!initialError,
    errorMessage: initialError,
    dataCounts: {
      workouts: initialWorkoutsData.length,
      vo2max: initialVo2MaxData.length,
      time: initialTimeData.length,
      habits: initialHabitsData.length
    }
  });

  // Ensure all data fields are serializable arrays (never undefined)
  return {
    props: {
      initialWorkoutsData: initialWorkoutsData,
      initialVo2MaxData: initialVo2MaxData, 
      initialTimeData: initialTimeData,
      initialHabitsData: initialHabitsData,
      initialError: initialError || null
    }
  };
}
