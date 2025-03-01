import { getSupabaseClient } from '../utils/supabaseClient';

// Fallback data if Supabase connection fails
const fallbackWorkouts = [
  {
    id: 1,
    date: '2023-01-10',
    activity_type: 'Running',
    title: 'Morning Run',
    distance: 5200,
    time: 1800,
    calories: 450,
    avg_hr: 155
  },
  // Add more fallback data as needed
];

export async function getWorkouts(startDate, endDate, limit = 20) {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return { data: fallbackWorkouts, success: true, fallback: true };
    }
    
    // Build query
    let query = supabase.from('workout_stats').select('*');
    
    // Add date filters if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Execute query
    const { data, error } = await query
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return {
      data: data && data.length > 0 ? data : fallbackWorkouts,
      success: true,
      fallback: !data || data.length === 0
    };
  } catch (error) {
    console.error('Error fetching workout data:', error);
    return { 
      data: fallbackWorkouts, 
      success: true, 
      fallback: true,
      error: error.message
    };
  }
}
