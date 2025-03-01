// web/pages/api/workouts.js
import { createClient } from '@supabase/supabase-js';
import { fallbackWorkouts } from '../../utils/fallbackData';

export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured, using fallback data');
      return res.status(200).json({
        data: fallbackWorkouts,
        count: fallbackWorkouts.length,
        success: true,
        fallback: true
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get query parameters
    const { start_date, end_date, limit = 20 } = req.query;
    
    // Build query
    let query = supabase.from('workout_stats').select('*');
    
    // Add date filters if provided
    if (start_date) {
      query = query.gte('date', start_date);
    }
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    // Execute query
    const { data, error } = await query
      .order('date', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) {
      throw error;
    }
    
    // Return results
    return res.status(200).json({
      data: data && data.length > 0 ? data : fallbackWorkouts,
      count: data ? data.length : fallbackWorkouts.length,
      success: true,
      fallback: !data || data.length === 0
    });
  } catch (error) {
    console.error('API Error:', error);
    
    // Return fallback data on error
    return res.status(200).json({
      data: fallbackWorkouts,
      count: fallbackWorkouts.length,
      success: true,
      fallback: true,
      error: error.message || 'Failed to fetch workout data'
    });
  }
}
