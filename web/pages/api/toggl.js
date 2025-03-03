// web/pages/api/toggl.js
import { createClient } from '@supabase/supabase-js';

// Fallback data to use if database table doesn't exist
const fallbackData = [
  { date: '2023-01-10', bucket: 'Deep Work', hours: 4.5 },
  { date: '2023-01-10', bucket: 'Meetings', hours: 2.0 },
  { date: '2023-01-11', bucket: 'Deep Work', hours: 3.8 },
  { date: '2023-01-11', bucket: 'Learning', hours: 1.5 },
  { date: '2023-01-12', bucket: 'Deep Work', hours: 5.2 },
  { date: '2023-01-12', bucket: 'Meetings', hours: 1.0 },
  { date: '2023-01-13', bucket: 'Learning', hours: 3.5 }
];

export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase credentials - using fallback data');
      return sendFallbackResponse(res);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get query parameters
    const { start_date, end_date, bucket } = req.query;
    
    try {
      // Build query - use toggl_entries instead of toggl_time
      console.log('API: Starting toggl_entries query');
      let query = supabase.from('toggl_entries').select('*');
      
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
      console.log(`API: toggl_entries query completed - ${error ? 'Error: ' + error.message : 'Success - ' + (data?.length || 0) + ' records'}`);
      
      if (error) {
        // Check if the error is due to missing table
        if (error.code === '42P01') {
          console.warn('Table toggl_entries does not exist - using fallback data');
          return sendFallbackResponse(res);
        }
        throw error;
      }
      
      // Process real data
      const bucketTotals = {};
      const dateBreakdown = {};
      
      if (data && data.length > 0) {
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
        
        // Return real data
        return res.status(200).json({
          raw: data,
          summary: {
            bucketTotals,
            dateBreakdown
          },
          success: true
        });
      } else {
        // No data found, use fallback
        return sendFallbackResponse(res);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return sendFallbackResponse(res);
    }
  } catch (error) {
    console.error('General API Error:', error);
    return sendFallbackResponse(res);
  }
}

// Helper function to send consistent fallback response
function sendFallbackResponse(res) {
  // Process fallback data
  const bucketTotals = {};
  const dateBreakdown = {};
  
  fallbackData.forEach(entry => {
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
  
  return res.status(200).json({
    raw: fallbackData,
    summary: {
      bucketTotals,
      dateBreakdown
    },
    success: true,
    fallback: true
  });
}
