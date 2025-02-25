// web/pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    workouts: [],
    timeEntries: [],
    habits: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Fetch all data needed for the dashboard
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Check connection to Supabase
        const { data: connectionTest, error: connectionError } = await supabase.from('workout_stats').select('count');
        
        if (connectionError) {
          throw new Error(`Supabase connection error: ${connectionError.message}`);
        }
        
        // Fetch workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from('workout_stats')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
          
        if (workoutsError) throw new Error(`Error fetching workouts: ${workoutsError.message}`);
        
        // Fetch time entries
        const { data: timeEntries, error: timeError } = await supabase
          .from('toggl_time')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
          
        if (timeError) throw new Error(`Error fetching time entries: ${timeError.message}`);
        
        // Fetch habits
        const { data: habits, error: habitsError } = await supabase
          .from('habit_tracking')
          .select('*')
          .order('habit_date', { ascending: false })
          .limit(5);
          
        if (habitsError) throw new Error(`Error fetching habits: ${habitsError.message}`);
        
        // Update state with fetched data
        setDashboardData({
          workouts: workouts || [],
          timeEntries: timeEntries || [],
          habits: habits || []
        });
        setDataError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDataError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  // Prepare some basic stats
  const stats = {
    totalWorkouts: dashboardData.workouts.length,
    totalHabits: dashboardData.habits.length,
    totalTimeEntries: dashboardData.timeEntries.length,
    completedHabits: dashboardData.habits.filter(h => h.completed).length
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>My Daily Proof | Dashboard</title>
        <meta name="description" content="Personal health and productivity tracking dashboard" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                MY DAILY PROOF
              </h1>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-300 text-sm mr-2">Dashboard User</span>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">DP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="bg-gray-800 md:w-64 p-4 md:min-h-screen">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center p-2 rounded-md ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('fitness')}
              className={`w-full flex items-center p-2 rounded-md ${
                activeTab === 'fitness' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Fitness
            </button>
            
            <button
              onClick={() => setActiveTab('time')}
              className={`w-full flex items-center p-2 rounded-md ${
                activeTab === 'time' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time
            </button>
            
            <button
              onClick={() => setActiveTab('habits')}
              className={`w-full flex items-center p-2 rounded-md ${
                activeTab === 'habits' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Habits
            </button>
          </div>
        </nav>

        {/* Main dashboard area */}
        <main className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : dataError ? (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-white mb-6">
              <h3 className="text-xl font-bold mb-2">Data Connection Error</h3>
              <p>{dataError}</p>
              <p className="mt-2 text-gray-300">Please check your Supabase connection and environment variables.</p>
            </div>
          ) : (
            <>
              {/* Overview Panel */}
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Dashboard Overview
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Stats Cards */}
                    <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
                      <h3 className="text-gray-400 text-sm font-medium">Workouts</h3>
                      <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
                      <h3 className="text-gray-400 text-sm font-medium">Time Entries</h3>
                      <p className="text-2xl font-bold text-white">{stats.totalTimeEntries}</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
                      <h3 className="text-gray-400 text-sm font-medium">Habits Tracked</h3>
                      <p className="text-2xl font-bold text-white">{stats.totalHabits}</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
                      <h3 className="text-gray-400 text-sm font-medium">Habits Completed</h3>
                      <p className="text-2xl font-bold text-white">{stats.completedHabits}</p>
                    </div>
                  </div>
                  
                  {/* Recent Data Section */}
                  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-white">Recent Data</h3>
                    
                    {/* Display some recent workouts */}
                    {dashboardData.workouts.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium mb-2 text-gray-300">Recent Workouts</h4>
                        <div className="space-y-2">
                          {dashboardData.workouts.slice(0, 3).map((workout, i) => (
                            <div key={i} className="bg-gray-700 p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{workout.title || workout.activity_type}</span>
                                <span className="text-gray-300">{new Date(workout.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 mb-4">No workout data available</p>
                    )}
                    
                    {/* Display some recent time entries */}
                    {dashboardData.timeEntries.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium mb-2 text-gray-300">Recent Time Tracking</h4>
                        <div className="space-y-2">
                          {dashboardData.timeEntries.slice(0, 3).map((entry, i) => (
                            <div key={i} className="bg-gray-700 p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{entry.bucket || 'Uncategorized'}</span>
                                <span className="text-gray-300">{entry.hours} hours</span>
                              </div>
                              <div className="text-sm text-gray-400">{new Date(entry.date).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 mb-4">No time tracking data available</p>
                    )}
                    
                    {/* Display some recent habits */}
                    {dashboardData.habits.length > 0 ? (
                      <div>
                        <h4 className="text-lg font-medium mb-2 text-gray-300">Recent Habits</h4>
                        <div className="space-y-2">
                          {dashboardData.habits.slice(0, 3).map((habit, i) => (
                            <div key={i} className="bg-gray-700 p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{habit.habit_name}</span>
                                <span className={habit.completed ? "text-green-400" : "text-red-400"}>
                                  {habit.completed ? "Completed" : "Missed"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-400">{new Date(habit.habit_date).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">No habit data available</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Placeholder content for other tabs */}
              {activeTab === 'fitness' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Fitness Tracking
                  </h2>
                  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-white">Your Workouts</h3>
                    {dashboardData.workouts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dashboardData.workouts.map((workout, i) => (
                          <div key={i} className="bg-gray-700 p-4 rounded-md">
                            <div className="font-bold">{workout.title || workout.activity_type}</div>
                            <div className="text-gray-300">{new Date(workout.date).toLocaleDateString()}</div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              {workout.distance && <div>Distance: {(workout.distance / 1000).toFixed(2)} km</div>}
                              {workout.calories && <div>Calories: {workout.calories}</div>}
                              {workout.time && <div>Time: {Math.floor(workout.time / 60)} min</div>}
                              {workout.avg_hr && <div>Avg HR: {workout.avg_hr} bpm</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No workout data available</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'time' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Time Management
                  </h2>
                  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-white">Your Time Tracking</h3>
                    {dashboardData.timeEntries.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.timeEntries.map((entry, i) => (
                          <div key={i} className="bg-gray-700 p-4 rounded-md">
                            <div className="flex justify-between">
                              <span className="font-bold">{entry.bucket || 'Uncategorized'}</span>
                              <span className="text-gray-300">{entry.hours} hours</span>
                            </div>
                            <div className="text-gray-400">{new Date(entry.date).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No time tracking data available</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'habits' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Habit Tracking
                  </h2>
                  <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-white">Your Habits</h3>
                    {dashboardData.habits.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.habits.map((habit, i) => (
                          <div key={i} className="bg-gray-700 p-4 rounded-md">
                            <div className="flex justify-between">
                              <span className="font-bold">{habit.habit_name}</span>
                              <span className={habit.completed ? "text-green-400" : "text-red-400"}>
                                {habit.completed ? "Completed" : "Missed"}
                              </span>
                            </div>
                            <div className="text-gray-400">{new Date(habit.habit_date).toLocaleDateString()}</div>
                            {habit.notes && <div className="mt-2 text-gray-300">{habit.notes}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No habit data available</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
