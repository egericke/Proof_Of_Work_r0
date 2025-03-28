// web/pages/api/toggl.js
import { createClient } from '@supabase/supabase-js';
import { fallbackTimeData } from '../../utils/fallbackData'; // Import updated fallback structure

// Helper function to send consistent fallback response
function sendFallbackResponse(res) {
  // Process fallback data
  const bucketTotals = {};
  const dateBreakdown = {};
  fallbackTimeData.forEach(entry => {
    const category = entry.project_name || 'No Project';
    const hours = (entry.duration_seconds || 0) / 3600;
    
    bucketTotals[category] = (bucketTotals[category] || 0) + hours;
    
    if (entry.date) {
      if (!dateBreakdown[entry.date]) dateBreakdown[entry.date] = {};
      dateBreakdown[entry.date][category] = (dateBreakdown[entry.date][category] || 0) + hours;
    }
  });

  return res.status(200).json({
    raw: fallbackTimeData, // Send the raw fallback
    summary: { bucketTotals, dateBreakdown },
    success: true,
    fallback: true
  });
}


export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('API/toggl: Missing Supabase credentials - using fallback data');
      return sendFallbackResponse(res);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { start_date, end_date, project_name } = req.query; // Changed 'bucket' to 'project_name'

    try {
      // Build query using correct columns
      console.log('API/toggl: Starting toggl_entries query');
      let query = supabase.from('toggl_entries').select('date, project_name, duration_seconds'); // Select correct columns

      if (start_date) query = query.gte('date', start_date);
      if (end_date) query = query.lte('date', end_date);
      if (project_name) query = query.eq('project_name', project_name); // Filter by project_name

      const { data, error } = await query.order('date', { ascending: true });
      console.log(`API/toggl: Query completed - ${error ? 'Error: ' + error.message : 'Success - ' + (data?.length || 0) + ' records'}`);

      if (error) {
        if (error.code === '42P01') { // Table doesn't exist
          console.warn('API/toggl: Table toggl_entries does not exist - using fallback data');
          return sendFallbackResponse(res);
        }
        throw error;
      }

      // Process real data
      const bucketTotals = {}; // Keep using 'bucket' concept for summary if desired
      const dateBreakdown = {};

      if (data && data.length > 0) {
        data.forEach(entry => {
          const category = entry.project_name || 'No Project';
          const hours = (entry.duration_seconds || 0) / 3600;

          bucketTotals[category] = (bucketTotals[category] || 0) + hours;

          if (entry.date) {
            if (!dateBreakdown[entry.date]) dateBreakdown[entry.date] = {};
            dateBreakdown[entry.date][category] = (dateBreakdown[entry.date][category] || 0) + hours;
          }
        });

        return res.status(200).json({
          raw: data, // Send raw data with duration_seconds
          summary: { bucketTotals, dateBreakdown }, // Summary uses hours
          success: true
        });
      } else {
        // No data found, use fallback
        return sendFallbackResponse(res);
      }
    } catch (dbError) {
      console.error('API/toggl: Database error:', dbError);
      return sendFallbackResponse(res);
    }
  } catch (error) {
    console.error('API/toggl: General API Error:', error);
    return sendFallbackResponse(res);
  }
}
