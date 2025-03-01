// web/utils/fallbackData.js
export const fallbackWorkouts = [
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

export const fallbackVo2Max = {
  test_date: '2023-01-05',
  vo2max_value: 42.5,
  notes: 'Fallback data'
};

export const fallbackHabits = {
  habits: [
    { id: 1, habit_date: '2023-01-10', habit_name: 'Meditation', completed: true },
    { id: 2, habit_date: '2023-01-10', habit_name: 'Reading', completed: true },
    { id: 3, habit_date: '2023-01-10', habit_name: 'Exercise', completed: false },
    // Add more fallback data
  ],
  summary: {
    totalCount: 3,
    completedCount: 2,
    completionRate: 66.7,
    habitsByDate: {
      '2023-01-10': { total: 3, completed: 2 }
    },
    habitsByName: {
      'Meditation': { total: 1, completed: 1, rate: 100 },
      'Reading': { total: 1, completed: 1, rate: 100 },
      'Exercise': { total: 1, completed: 0, rate: 0 }
    }
  }
};

export const fallbackTogglData = {
  raw: [
    { date: '2023-01-10', bucket: 'Deep Work', hours: 4.5 },
    { date: '2023-01-10', bucket: 'Meetings', hours: 2.0 },
    { date: '2023-01-11', bucket: 'Deep Work', hours: 3.8 },
    { date: '2023-01-11', bucket: 'Learning', hours: 1.5 },
    // Add more fallback data
  ],
  summary: {
    bucketTotals: {
      'Deep Work': 8.3,
      'Meetings': 2.0,
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
      }
    }
  }
};
