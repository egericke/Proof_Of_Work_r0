// web/pages/api/toggl.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase credentials not configured' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get query parameters
    const { start_date, end_date, bucket } = req.query;
    
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
      throw error;
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
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch Toggl data',
      success: false
    });
  }
}
