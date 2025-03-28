// web/utils/fallbackData.js

// --- Raw Fallback Data Structures ---

export const fallbackWorkoutData = [
  {
    id: 1,
    date: '2023-01-10', // Using YYYY-MM-DD for consistency
    activity_type: 'Running',
    title: 'Morning Run',
    distance: 5200, // meters
    time: 1800, // seconds
    calories: 450,
    avg_hr: 155
  },
  {
    id: 2,
    date: '2023-01-08',
    activity_type: 'Cycling',
    title: 'Weekend Ride',
    distance: 15000, // meters
    time: 3600, // seconds
    calories: 620,
    avg_hr: 145
  },
  {
    id: 3,
    date: '2023-01-12',
    activity_type: 'Strength Training',
    title: 'Gym Session',
    distance: null,
    time: 2700, // seconds
    calories: 300,
    avg_hr: 120
  }
];

export const fallbackVo2MaxData = [
  {
    id: 1,
    test_date: '2023-01-15', // Using YYYY-MM-DD
    vo2max_value: 42.5,
    notes: 'Fallback data - Test 1'
  },
  {
    id: 2,
    test_date: '2023-01-05',
    vo2max_value: 41.0,
    notes: 'Fallback data - Test 2'
  }
];

export const fallbackHabitData = [
  // Day 1
  { id: 1, habit_date: '2023-01-10', habit_name: 'Meditation', completed: true },
  { id: 2, habit_date: '2023-01-10', habit_name: 'Reading', completed: true },
  { id: 3, habit_date: '2023-01-10', habit_name: 'Exercise', completed: false },
  { id: 10, habit_date: '2023-01-10', habit_name: 'Journaling', completed: true },

  // Day 2
  { id: 4, habit_date: '2023-01-11', habit_name: 'Meditation', completed: true },
  { id: 5, habit_date: '2023-01-11', habit_name: 'Reading', completed: true },
  { id: 6, habit_date: '2023-01-11', habit_name: 'Exercise', completed: true },
  { id: 11, habit_date: '2023-01-11', habit_name: 'Journaling', completed: false },

  // Day 3
  { id: 7, habit_date: '2023-01-12', habit_name: 'Meditation', completed: false },
  { id: 8, habit_date: '2023-01-12', habit_name: 'Reading', completed: true },
  { id: 9, habit_date: '2023-01-12', habit_name: 'Exercise', completed: true },
  { id: 12, habit_date: '2023-01-12', habit_name: 'Journaling', completed: true },
];

// Updated fallback data structure for toggl_entries
// Uses project_name and duration_seconds to match the database schema
export const fallbackTimeData = [
  { id: 1, date: '2023-01-10', project_name: 'Deep Work', duration_seconds: 16200, description: 'Programming' }, // 4.5 hours
  { id: 2, date: '2023-01-10', project_name: 'Meetings', duration_seconds: 7200, description: 'Team standup' }, // 2.0 hours
  { id: 3, date: '2023-01-11', project_name: 'Deep Work', duration_seconds: 13680, description: 'Code review' }, // 3.8 hours
  { id: 4, date: '2023-01-11', project_name: 'Learning', duration_seconds: 5400, description: 'React course' }, // 1.5 hours
  { id: 5, date: '2023-01-12', project_name: 'Deep Work', duration_seconds: 18720, description: 'Feature development' }, // 5.2 hours
  { id: 6, date: '2023-01-12', project_name: 'Health & Fitness', duration_seconds: 3600, description: 'Workout' }, // 1.0 hours
  { id: 7, date: '2023-01-13', project_name: 'Deep Work', duration_seconds: 14760, description: 'API integration' }, // 4.1 hours
  { id: 8, date: '2023-01-13', project_name: 'Meetings', duration_seconds: 10800, description: 'Planning session' }, // 3.0 hours
  { id: 9, date: '2023-01-13', project_name: 'Admin/Misc', duration_seconds: 1800, description: 'Emails' }, // 0.5 hours
];


// --- Processed Fallback Data (for API compatibility if needed) ---

// Keep these exports for potential backward compatibility or direct use in components
export const fallbackWorkouts = fallbackWorkoutData;
export const fallbackVo2Max = fallbackVo2MaxData.length > 0 ? fallbackVo2MaxData[0] : null; // Get the latest entry

// Process fallback habit data into the summary structure expected by some components
const processFallbackHabits = (data) => {
  const habitsByDate = {};
  const habitsByName = {};
  let completedCount = 0;
  let totalCount = data.length;

  data.forEach(habit => {
    const date = habit.habit_date;
    const name = habit.habit_name || 'Unnamed Habit';

    // By date
    if (!habitsByDate[date]) habitsByDate[date] = { total: 0, completed: 0 };
    habitsByDate[date].total++;
    if (habit.completed) habitsByDate[date].completed++;

    // By name
    if (!habitsByName[name]) habitsByName[name] = { total: 0, completed: 0 };
    habitsByName[name].total++;
    if (habit.completed) habitsByName[name].completed++;
  });

  // Calculate completion rates for habitsByName
  Object.keys(habitsByName).forEach(name => {
    const habitStats = habitsByName[name];
    habitStats.rate = habitStats.total > 0
      ? Math.round((habitStats.completed / habitStats.total) * 100)
      : 0;
  });

  // Overall completed count
  completedCount = data.filter(h => h.completed).length;

  return {
    totalCount,
    completedCount,
    completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    habitsByDate,
    habitsByName,
  };
};

export const fallbackHabits = {
  habits: fallbackHabitData,
  summary: processFallbackHabits(fallbackHabitData),
  success: true,
  fallback: true
};


// Process fallback time data into the summary structure
const processFallbackTime = (data) => {
  const bucketTotals = {}; // Using 'bucket' concept for the summary keys
  const dateBreakdown = {};
  data.forEach(entry => {
    const category = entry.project_name || 'No Project'; // Use project_name for grouping
    const hours = (entry.duration_seconds || 0) / 3600; // Convert to hours

    // Sum totals per category (bucket)
    bucketTotals[category] = (bucketTotals[category] || 0) + hours;

    // Breakdown by date
    if (entry.date) {
      if (!dateBreakdown[entry.date]) dateBreakdown[entry.date] = {};
      dateBreakdown[entry.date][category] = (dateBreakdown[entry.date][category] || 0) + hours;
    }
  });
  return { bucketTotals, dateBreakdown };
};

export const fallbackTogglData = {
  raw: fallbackTimeData, // Contains project_name and duration_seconds
  summary: processFallbackTime(fallbackTimeData), // Contains hours grouped by category (project_name)
  success: true,
  fallback: true
};
