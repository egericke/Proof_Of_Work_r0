// web/pages/fitness.js
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function FitnessPage() {
  const [workouts, setWorkouts] = useState([]);
  const [vo2Max, setVo2Max] = useState(null);
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
        const { data: workoutsData, error: workoutsError } = await supabase
          .from('workout_stats')
          .select('*')
          .order('date', { ascending: false })
          .limit(10);
          
        if (workoutsError) throw workoutsError;
        
        // Get latest VO2 max
        const { data: vo2MaxData, error: vo2MaxError } = await supabase
          .from('vo2max_tests')
          .select('*')
          .order('test_date', { ascending: false })
          .limit(1);
          
        if (vo2MaxError) throw vo2MaxError;
        
        setWorkouts(workoutsData || []);
        setVo2Max(vo2MaxData?.[0] || null);
        
      } catch (err) {
        console.error("Error fetching fitness data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  function formatDistance(meters) {
    if (!meters) return '0 km';
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(2)} km`;
  }
  
  function formatDuration(seconds) {
    if (!seconds) return '0 min';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Fitness Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 bg-red-900 bg-opacity-30 rounded border border-red-500">
          <p className="font-bold">Error loading data:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* VO2 Max Card */}
          <div className="bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-medium text-blue-300 mb-4">Your Fitness Stats</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {vo2Max && (
                <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Latest VO₂ Max</p>
                  <p className="text-2xl font-bold">{vo2Max.vo2max_value} <span className="text-sm">ml/kg/min</span></p>
                  <p className="text-xs text-gray-400 mt-1">
                    Recorded on: {new Date(vo2Max.test_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Workouts</p>
                <p className="text-2xl font-bold">{workouts.length}</p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Distance</p>
                <p className="text-2xl font-bold">
                  {formatDistance(workouts.reduce((sum, w) => sum + (w.distance || 0), 0))}
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Calories</p>
                <p className="text-2xl font-bold">
                  {workouts.reduce((sum, w) => sum + (w.calories || 0), 0)} kcal
                </p>
              </div>
            </div>
          </div>
          
          {/* Workouts List */}
          <div className="bg-gray-800 rounded-lg p-4 shadow">
            <h2 className="text-lg font-medium text-blue-300 mb-4">Recent Workouts</h2>
            
            {workouts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No workout data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.map((workout, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{workout.title || workout.activity_type}</h3>
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">
                          {workout.activity_type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {new Date(workout.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {workout.distance && (
                        <div className="min-w-24">
                          <p className="text-gray-400 text-xs">Distance</p>
                          <p className="font-medium">{formatDistance(workout.distance)}</p>
                        </div>
                      )}
                      
                      {workout.time && (
                        <div className="min-w-24">
                          <p className="text-gray-400 text-xs">Duration</p>
                          <p className="font-medium">{formatDuration(workout.time)}</p>
                        </div>
                      )}
                      
                      {workout.calories && (
                        <div className="min-w-24">
                          <p className="text-gray-400 text-xs">Calories</p>
                          <p className="font-medium">{workout.calories} kcal</p>
                        </div>
                      )}
                      
                      {workout.avg_hr && (
                        <div className="min-w-24">
                          <p className="text-gray-400 text-xs">Avg Heart Rate</p>
                          <p className="font-medium">{workout.avg_hr} bpm</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
