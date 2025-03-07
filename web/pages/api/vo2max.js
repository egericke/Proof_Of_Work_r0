// web/pages/api/vo2max.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await getVo2MaxData(req, res);
  } else if (req.method === 'POST') {
    await saveVo2MaxData(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed', success: false });
  }
}

async function getVo2MaxData(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase credentials not configured' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get query parameters for history range
    const { start_date, end_date, latest } = req.query;
    
    // If only latest is requested
    if (latest === 'true') {
      const { data, error } = await supabase
        .from('vo2max_tests')
        .select('*')
        .order('test_date', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      // Always return a consistent data structure with safe defaults
      return res.status(200).json({
        latest: data?.[0] || { 
          test_date: new Date().toISOString().split('T')[0],
          vo2max_value: 0,
          notes: 'No data available' 
        },
        history: data || [],
        success: true
      });
    }
    
    // Otherwise, fetch history
    let query = supabase
      .from('vo2max_tests')
      .select('*');
      
    if (start_date) {
      query = query.gte('test_date', start_date);
    }
    
    if (end_date) {
      query = query.lte('test_date', end_date);
    }
    
    const { data, error } = await query.order('test_date', { ascending: true });
    
    if (error) throw error;
    
    // Always ensure data is an array
    const safeData = Array.isArray(data) ? data : [];
    
    // Calculate trend if we have multiple data points
    let trend = 0;
    if (safeData.length >= 2) {
      try {
        const first = safeData[0]?.vo2max_value;
        const last = safeData[safeData.length - 1]?.vo2max_value;
        
        // Only calculate if both values are valid numbers
        if (typeof first === 'number' && typeof last === 'number' && first !== 0) {
          const change = last - first;
          const percentChange = (change / first) * 100;
          trend = Math.round(percentChange * 10) / 10; // Round to 1 decimal place
        }
      } catch (error) {
        console.error('Error calculating VO2Max trend:', error);
      }
    }
    
    // Create a safe default latest entry if there's no data
    const latestEntry = safeData.length > 0 ? safeData[safeData.length - 1] : {
      test_date: new Date().toISOString().split('T')[0],
      vo2max_value: 0,
      notes: 'No data available'
    };
    
    return res.status(200).json({
      history: safeData,
      latest: latestEntry,
      trend,
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    // Even on error, return a consistent data structure with empty arrays
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch VO2 Max data',
      success: false,
      history: [],
      latest: {
        test_date: new Date().toISOString().split('T')[0],
        vo2max_value: 0,
        notes: 'Error fetching data'
      },
      trend: 0
    });
  }
}

async function saveVo2MaxData(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase credentials not configured' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get data from request body
    const { test_date, vo2max_value, notes } = req.body;
    
    // Validate required fields
    if (!test_date || !vo2max_value) {
      return res.status(400).json({
        error: 'test_date and vo2max_value are required',
        success: false
      });
    }
    
    // Insert data
    const { data, error } = await supabase
      .from('vo2max_tests')
      .upsert({
        test_date,
        vo2max_value: parseFloat(vo2max_value),
        notes: notes || ''
      }, {
        onConflict: 'test_date'
      });
      
    if (error) throw error;
    
    return res.status(200).json({
      message: 'VO2 Max data saved successfully',
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to save VO2 Max data',
      success: false
    });
  }
}
