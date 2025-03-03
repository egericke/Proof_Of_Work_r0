// web/utils/fallbackData.js
export const fallbackWorkoutData = [
  {
    id: 1,
    date: '2023-01-10',
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
  // Add more fallback data as needed
];

export const fallbackVo2MaxData = [
  {
    id: 1,
    test_date: '2023-01-15',
    vo2max_value: 42.5,
    notes: 'Fallback data'
  },
  {
    id: 2,
    test_date: '2023-01-05',
    vo2max_value: 41.0,
    notes: 'Fallback data'
  }
];

export const fallbackHabitData = [
  { id: 1, habit_date: '2023-01-10', habit_name: 'Meditation', completed: true },
  { id: 2, habit_date: '2023-01-10', habit_name: 'Reading', completed: true },
  { id: 3, habit_date: '2023-01-10', habit_name: 'Exercise', completed: false },
  { id: 4, habit_date: '2023-01-11', habit_name: 'Meditation', completed: true },
  { id: 5, habit_date: '2023-01-11', habit_name: 'Reading', completed: true },
  { id: 6, habit_date: '2023-01-11', habit_name: 'Exercise', completed: true },
  { id: 7, habit_date: '2023-01-12', habit_name: 'Meditation', completed: false },
  { id: 8, habit_date: '2023-01-12', habit_name: 'Reading', completed: true },
  { id: 9, habit_date: '2023-01-12', habit_name: 'Exercise', completed: true }
];

export const fallbackTimeData = [
  { id: 1, date: '2023-01-10', bucket: 'Deep Work', hours: 4.5 },
  { id: 2, date: '2023-01-10', bucket: 'Meetings', hours: 2.0 },
  { id: 3, date: '2023-01-11', bucket: 'Deep Work', hours: 3.8 },
  { id: 4, date: '2023-01-11', bucket: 'Learning', hours: 1.5 },
  { id: 5, date: '2023-01-12', bucket: 'Deep Work', hours: 5.2 },
  { id: 6, date: '2023-01-12', bucket: 'Health & Fitness', hours: 1.0 },
  { id: 7, date: '2023-01-13', bucket: 'Deep Work', hours: 4.1 },
  { id: 8, date: '2023-01-13', bucket: 'Meetings', hours: 3.0 }
];

// Keep these for backward compatibility
export const fallbackWorkouts = fallbackWorkoutData;
export const fallbackVo2Max = fallbackVo2MaxData[0];
export const fallbackHabits = {
  habits: fallbackHabitData,
  summary: {
    totalCount: fallbackHabitData.length,
    completedCount: fallbackHabitData.filter(h => h.completed).length,
    completionRate: (fallbackHabitData.filter(h => h.completed).length / fallbackHabitData.length) * 100,
    habitsByDate: {
      '2023-01-10': { total: 3, completed: 2 },
      '2023-01-11': { total: 3, completed: 3 },
      '2023-01-12': { total: 3, completed: 2 }
    },
    habitsByName: {
      'Meditation': { total: 3, completed: 2, rate: 66.7 },
      'Reading': { total: 3, completed: 3, rate: 100 },
      'Exercise': { total: 3, completed: 2, rate: 66.7 }
    }
  }
};

export const fallbackTogglData = {
  raw: fallbackTimeData,
  summary: {
    bucketTotals: {
      'Deep Work': 17.6,
      'Meetings': 5.0,
      'Learning': 1.5,
      'Health & Fitness': 1.0
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
        'Health & Fitness': 1.0
      },
      '2023-01-13': {
        'Deep Work': 4.1,
        'Meetings': 3.0
      }
    }
  }
};
