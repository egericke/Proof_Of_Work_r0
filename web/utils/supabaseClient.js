// web/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { fallbackWorkoutData, fallbackTimeData, fallbackHabitData, fallbackVo2MaxData } from './fallbackData';

export const getSupabaseClient = () => {
  // This function should only run on the client side
  if (typeof window === 'undefined') {
    return null;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing - check your environment variables');
    return getMockSupabaseClient();
  }
  
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return getMockSupabaseClient();
  }
};

// Create a mock Supabase client that returns fallback data
function getMockSupabaseClient() {
  console.warn('Using mock Supabase client with fallback data');
  
  return {
    from: (table) => {
      return {
        select: () => mockSelect(table),
        insert: () => ({ error: null }),
        update: () => ({ error: null }),
        delete: () => ({ error: null }),
      };
    },
  };
  
  function mockSelect(table) {
    const queryBuilder = {
      order: () => queryBuilder,
      limit: () => queryBuilder,
      gte: () => queryBuilder,
      lte: () => queryBuilder,
      eq: () => queryBuilder,
      then: (callback) => {
        let mockData;
        
        switch (table) {
          case 'workout_stats':
            mockData = { data: fallbackWorkoutData || [], error: null };
            break;
          case 'toggl_time':
            mockData = { data: fallbackTimeData || [], error: null };
            break;
          case 'habit_tracking':
            mockData = { data: fallbackHabitData || [], error: null };
            break;
          case 'vo2max_tests':
            mockData = { data: fallbackVo2MaxData || [], error: null };
            break;
          default:
            mockData = { data: [], error: null };
        }
        
        return Promise.resolve(callback(mockData));
      },
    };
    
    // Add direct awaited execution for use with async/await style
    queryBuilder.execute = async () => {
      let mockData;
      
      switch (table) {
        case 'workout_stats':
          mockData = { data: fallbackWorkoutData || [], error: null };
          break;
        case 'toggl_time':
          mockData = { data: fallbackTimeData || [], error: null };
          break;
        case 'habit_tracking':
          mockData = { data: fallbackHabitData || [], error: null };
          break;
        case 'vo2max_tests':
          mockData = { data: fallbackVo2MaxData || [], error: null };
          break;
        default:
          mockData = { data: [], error: null };
      }
      
      return mockData;
    };
    
    return queryBuilder;
  }
}
