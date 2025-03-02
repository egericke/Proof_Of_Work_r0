// web/lib/api-utils.js - Create this file first
export function handleDatabaseError(res, fallbackData, error = null) {
  console.warn(`Database error detected${error ? ': ' + error.message : ''}. Using fallback data.`);
  
  // Return a successful response with fallback data
  return res.status(200).json({
    ...fallbackData,
    success: true,
    fallback: true,
    error: error ? error.message : 'Database connection failed'
  });
}

// Update each API route to use this pattern (example for /api/toggl.js)
// web/pages/api/toggl.js
import { createClient } from '@supabase/supabase-js';
import { handleDatabaseError } from '../../lib/api-utils';

// Fallback data
const fallbackData = {
  raw: [
    { date: '2023-01-10', bucket: 'Deep Work', hours: 4.5 },
    { date: '2023-01-10', bucket: 'Meetings', hours: 2.0 },
    { date: '2023-01-11', bucket: 'Deep Work', hours: 3.8 },
    { date: '2023-01-11', bucket: 'Learning', hours: 1.5 },
    { date: '2023-01-12', bucket: 'Deep Work', hours: 5.2 },
    { date: '2023-01-12', bucket: 'Meetings', hours: 1.0 }
  ],
  summary: {
    bucketTotals: {
      'Deep Work': 13.5,
      'Meetings': 3.0,
      'Learning': 1.5
    },
    dateBreakdown: {
      '2023-01-10': {
        'Deep Work': 4.5,
        'Meetings': 2.0
      },
      '2023-01-11': {
        'Deep Work': 3.8,
        'Learning': 1.5
      },
      '2023-01-12': {
        'Deep Work': 5.2,
        'Meetings': 1.0
      }
    }
  }
};

export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return handleDatabaseError(res, fallbackData);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get query parameters
    const { start_date, end_date, bucket } = req.query;
    
    try {
      // Build query
      let query = supabase.from('toggl_time').select('*');
      
      // Add filters if provided
      if (start_date) {
        query = query.gte('date', start_date);
      }
      if (end_date) {
        query = query.lte('date', end_date);
      }
      if (bucket) {
        query = query.eq('bucket', bucket);
      }
      
      // Execute query
      const { data, error } = await query.order('date', { ascending: true });
      
      if (error) {
        // Check if the error is due to missing table
        if (error.code === '42P01') {
          return handleDatabaseError(res, fallbackData, error);
        }
        throw error;
      }
      
      // If no data, use fallback
      if (!data || data.length === 0) {
        return handleDatabaseError(res, fallbackData);
      }
      
      // Process data for summary statistics
      const bucketTotals = {};
      const dateBreakdown = {};
      
      data.forEach(entry => {
        // Calculate bucket totals
        if (!bucketTotals[entry.bucket]) {
          bucketTotals[entry.bucket] = 0;
        }
        bucketTotals[entry.bucket] += entry.hours;
        
        // Calculate date breakdown
        if (!dateBreakdown[entry.date]) {
          dateBreakdown[entry.date] = {};
        }
        if (!dateBreakdown[entry.date][entry.bucket]) {
          dateBreakdown[entry.date][entry.bucket] = 0;
        }
        dateBreakdown[entry.date][entry.bucket] += entry.hours;
      });
      
      // Return processed data
      return res.status(200).json({
        raw: data,
        summary: {
          bucketTotals,
          dateBreakdown
        },
        success: true
      });
    } catch (error) {
      return handleDatabaseError(res, fallbackData, error);
    }
  } catch (error) {
    return handleDatabaseError(res, fallbackData, error);
  }
}
