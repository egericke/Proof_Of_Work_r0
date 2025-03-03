// web/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { fallbackWorkoutData, fallbackTimeData, fallbackHabitData, fallbackVo2MaxData } from './fallbackData';

// Create a singleton instance that persists between rerenders
let supabaseInstance = null;

export const getSupabaseClient = () => {
  // If we already have an instance, return it (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // For SSR, we need to provide fallback data
  if (typeof window === 'undefined') {
    return getMockSupabaseClient('server-side');
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing - check your environment variables');
    supabaseInstance = getMockSupabaseClient('missing-credentials');
    return supabaseInstance;
  }
  
  try {
    // Store the instance for future use
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabaseInstance = getMockSupabaseClient('client-error');
    return supabaseInstance;
  }
};

// Create a mock Supabase client that returns fallback data
function getMockSupabaseClient(reason) {
  console.warn(`Using mock Supabase client with fallback data (reason: ${reason || 'unknown'})`);
  
  // Prepare the mock data with defaults to ensure arrays are always available
  const safeWorkoutData = Array.isArray(fallbackWorkoutData) ? fallbackWorkoutData : [];
  const safeTimeData = Array.isArray(fallbackTimeData) ? fallbackTimeData : [];
  const safeHabitData = Array.isArray(fallbackHabitData) ? fallbackHabitData : [];
  const safeVo2MaxData = Array.isArray(fallbackVo2MaxData) ? fallbackVo2MaxData : [];
  
  return {
    from: (table) => {
      return {
        select: () => mockSelect(table),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
      };
    },
    auth: {
      onAuthStateChange: () => ({ data: null, error: null, unsubscribe: () => {} }),
    }
  };
  
  function mockSelect(table) {
    let returnData;
        
    switch (table) {
      case 'workout_stats':
        returnData = safeWorkoutData;
        break;
      case 'toggl_time':
        returnData = safeTimeData;
        break;
      case 'habit_tracking':
        returnData = safeHabitData;
        break;
      case 'vo2max_tests':
        returnData = safeVo2MaxData;
        break;
      default:
        returnData = [];
    }
    
    const queryBuilder = {
      order: () => queryBuilder,
      limit: () => queryBuilder,
      gte: () => queryBuilder,
      lte: () => queryBuilder,
      eq: () => queryBuilder,
      neq: () => queryBuilder,
      in: () => queryBuilder,
      is: () => queryBuilder,
      match: () => queryBuilder,
      ilike: () => queryBuilder,
      filter: () => queryBuilder,
      contains: () => queryBuilder,
      
      // Standard Promise-based interface used by Supabase
      then: (callback) => {
        const mockData = { data: returnData, error: null, count: returnData.length };
        return Promise.resolve(callback(mockData));
      },
      
      // Direct awaited execution for use with async/await style
      execute: async () => {
        return { data: returnData, error: null, count: returnData.length };
      },
      
      // Make it directly awaitable (compatible with real Supabase client)
      [Symbol.toStringTag]: 'Promise',
      then: function(onFulfilled, onRejected) {
        const mockData = { data: returnData, error: null, count: returnData.length };
        return Promise.resolve(mockData).then(onFulfilled, onRejected);
      },
      catch: function(onRejected) {
        return Promise.resolve({ data: returnData, error: null }).catch(onRejected);
      },
      finally: function(onFinally) {
        return Promise.resolve({ data: returnData, error: null }).finally(onFinally);
      }
    };
    
    return queryBuilder;
  }
}
