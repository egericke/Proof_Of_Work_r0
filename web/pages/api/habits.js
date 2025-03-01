// web/pages/api/habits.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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
    
    // Get query parameters
    const { start_date, end_date } = req.query;
    
    // Default to 30 days ago if no start date provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const queryStartDate = start_date || defaultStartDate.toISOString().split('T')[0];
    const queryEndDate = end_date || new Date().toISOString().split('T')[0];
    
    // Fetch habits data
    const { data: habitsData, error: habitsError } = await supabase
      .from('habit_tracking')
      .select('*')
      .gte('habit_date', queryStartDate)
      .lte('habit_date', queryEndDate)
      .order('habit_date', { ascending: true });
    
    if (habitsError) {
      throw habitsError;
    }
    
    // Fetch habit analytics (if available)
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('habit_analytics')
      .select('*')
      .gte('date', queryStartDate)
      .lte('date', queryEndDate)
      .order('date', { ascending: true });
    
    // Process habits data for summary statistics
    const habitsByDate = {};
    const habitsByName = {};
    let completedCount = 0;
    let totalCount = habitsData ? habitsData.length : 0;
    
    if (habitsData) {
      habitsData.forEach(habit => {
        // By date
        if (!habitsByDate[habit.habit_date]) {
          habitsByDate[habit.habit_date] = {
            total: 0,
            completed: 0
          };
        }
        
        habitsByDate[habit.habit_date].total++;
        if (habit.completed) {
          habitsByDate[habit.habit_date].completed++;
          completedCount++;
        }
        
        // By name
        const habitName = habit.habit_name || 'Unnamed';
        if (!habitsByName[habitName]) {
          habitsByName[habitName] = {
            total: 0,
            completed: 0
          };
        }
        
        habitsByName[habitName].total++;
        if (habit.completed) {
          habitsByName[habitName].completed++;
        }
      });
    }
    
    // Calculate completion rates for habits
    Object.keys(habitsByName).forEach(name => {
      const habit = habitsByName[name];
      habit.rate = habit.total > 0 
        ? Math.round((habit.completed / habit.total) * 100) 
        : 0;
    });
    
    // Return processed data
    return res.status(200).json({
      habits: habitsData || [],
      analytics: analyticsData || [],
      summary: {
        totalCount,
        completedCount,
        completionRate: totalCount > 0 
          ? Math.round((completedCount / totalCount) * 100) 
          : 0,
        habitsByDate,
        habitsByName
      },
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch habits data',
      success: false
    });
  }
}
