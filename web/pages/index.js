// web/pages/index.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    workouts: { count: 0, latest: null },
    toggl: { hours: 0, categories: [] },
    habits: { count: 0, completed: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase environment variables are not set");
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Get workouts data
        const { data: workouts, error: workoutsError } = await supabase
          .from('workout_stats')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
          
        if (workoutsError) throw workoutsError;
        
        // Get toggl data
        const { data: togglData, error: togglError } = await supabase
          .from('toggl_time')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);
          
        if (togglError) throw togglError;
        
        // Get habits data
        const { data: habitsData, error: habitsError } = await supabase
          .from('habit_tracking')
          .select('*')
          .order('habit_date', { ascending: false })
          .limit(10);
          
        if (habitsError) throw habitsError;
        
        // Process the data
        const workoutsCount = workouts?.length || 0;
        const latestWorkout = workouts?.[0] || null;
        
        // Calculate total toggl hours
        const togglHours = togglData?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;
        
        // Get unique toggl categories
        const togglCategories = togglData 
          ? [...new Set(togglData.map(entry => entry.bucket))]
          : [];
          
        // Calculate habits stats
        const habitsCount = habitsData?.length || 0;
        const completedHabits = habitsData?.filter(h => h.completed)?.length || 0;
        
        setStats({
          workouts: { count: workoutsCount, latest: latestWorkout },
          toggl: { hours: togglHours, categories: togglCategories },
          habits: { count: habitsCount, completed: completedHabits }
        });
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fitness', label: 'Fitness', href: '/fitness' },
    { id: 'toggl', label: 'Time Tracking', href: '/toggl' },
    { id: 'habits', label: 'Habits', href: '/habits' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>My Daily Proof | Dashboard</title>
        <meta name="description" content="Personal fitness and productivity tracking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-blue-400">MY DAILY PROOF</h1>
          <p className="text-gray-400">Personal Fitness and Productivity Dashboard</p>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            {tabs.map(tab => (
              tab.href ? (
                <Link 
                  key={tab.id}
                  href={tab.href}
                  className="px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  {tab.label}
                </Link>
              ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 transition-colors ${
                    activeTab === tab.id 
                      ? 'text-white border-b-2 border-blue-500' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              )
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 text-white">
            <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
            <p>{error}</p>
            <p className="mt-2 text-gray-300">
              Check your Supabase connection and environment variables.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fitness Stats */}
              <div className="bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="text-lg font-medium text-blue-300 mb-3">Fitness</h3>
                <p className="text-2xl font-bold">{stats.workouts.count}</p>
                <p className="text-gray-400">workouts recorded</p>
                {stats.workouts.latest && (
                  <div className="mt-3 text-sm">
                    <p className="text-gray-300">Latest: {stats.workouts.latest.activity_type}</p>
                    <p className="text-gray-400">
                      {new Date(stats.workouts.latest.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  <Link href="/fitness" className="text-blue-400 hover:text-blue-300 text-sm">
                    View fitness data →
                  </Link>
                </div>
              </div>
              
              {/* Time Tracking */}
              <div className="bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="text-lg font-medium text-purple-300 mb-3">Time Tracking</h3>
                <p className="text-2xl font-bold">{stats.toggl.hours.toFixed(1)}</p>
                <p className="text-gray-400">hours tracked</p>
                {stats.toggl.categories.length > 0 && (
                  <div className="mt-3 text-sm">
                    <p className="text-gray-300">Categories:</p>
                    <p className="text-gray-400">
                      {stats.toggl.categories.slice(0, 3).join(', ')}
                      {stats.toggl.categories.length > 3 && '...'}
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  <Link href="/toggl" className="text-purple-400 hover:text-purple-300 text-sm">
                    View time data →
                  </Link>
                </div>
              </div>
              
              {/* Habits */}
              <div className="bg-gray-800 rounded-lg p-4 shadow">
                <h3 className="text-lg font-medium text-green-300 mb-3">Habits</h3>
                <p className="text-2xl font-bold">
                  {stats.habits.completed}/{stats.habits.count}
                </p>
                <p className="text-gray-400">habits completed</p>
                {stats.habits.count > 0 && (
                  <div className="mt-3 text-sm">
                    <p className="text-gray-300">
                      Completion rate: 
                      {Math.round(stats.habits.completed / stats.habits.count * 100)}%
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  <Link href="/habits" className="text-green-400 hover:text-green-300 text-sm">
                    View habits →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-xl font-medium text-blue-300 mb-4">Welcome to Your Dashboard</h3>
              <p className="text-gray-300 mb-4">
                This dashboard integrates data from multiple sources:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Fitness data from Garmin and Strava</li>
                <li>Time tracking from Toggl</li>
                <li>Habit tracking from your custom system</li>
              </ul>
              <p className="text-gray-400">
                Use the navigation tabs to explore detailed visualizations for each category.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
