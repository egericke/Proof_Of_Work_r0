// web/components/panels/FitnessPanel.js
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import WorkoutCard from '../ui/WorkoutCard';
import MetricInput from '../ui/MetricInput';
import StatsGrid from '../ui/StatsGrid';

export default function FitnessPanel({ supabase, dateRange }) {
  const [workouts, setWorkouts] = useState([]);
  const [vo2MaxHistory, setVo2MaxHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutStats, setWorkoutStats] = useState({
    totalDistance: 0,
    totalCalories: 0,
    totalTime: 0,
    avgHeartRate: 0
  });

  // Format dates for API calls
  const formatDateParam = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch fitness data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Format date range for API calls
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        
        // Fetch workout stats
        const workoutsResponse = await fetch(`/api/workouts?start_date=${startDateStr}&end_date=${endDateStr}`);
        const workoutsData = await workoutsResponse.json();
        
        // Fetch VO2 Max history
        const vo2MaxResponse = await fetch(`/api/vo2max?start_date=${startDateStr}&end_date=${endDateStr}`);
        const vo2MaxData = await vo2MaxResponse.json();
        
        if (workoutsData.data) {
          setWorkouts(workoutsData.data);
          
          // Calculate workout stats
          const totalDistance = workoutsData.data.reduce((sum, w) => sum + (w.distance || 0), 0);
          const totalCalories = workoutsData.data.reduce((sum, w) => sum + (w.calories || 0), 0);
          const totalTime = workoutsData.data.reduce((sum, w) => sum + (w.time || 0), 0);
          
          const heartRateWorkouts = workoutsData.data.filter(w => w.avg_hr);
          const avgHeartRate = heartRateWorkouts.length 
            ? heartRateWorkouts.reduce((sum, w) => sum + w.avg_hr, 0) / heartRateWorkouts.length 
            : 0;
            
          setWorkoutStats({
            totalDistance: parseFloat((totalDistance / 1000).toFixed(1)), // Convert to km
            totalCalories: totalCalories,
            totalTime: Math.round(totalTime / 60), // Convert to minutes
            avgHeartRate: Math.round(avgHeartRate)
          });
        }
        
        if (vo2MaxData.history) {
          setVo2MaxHistory(vo2MaxData.history);
        }
      } catch (error) {
        console.error('Error fetching fitness data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [supabase, dateRange]);

  // VO2 Max Chart Data
  const vo2MaxChartData = {
    labels: vo2MaxHistory.map(d => d.test_date),
    datasets: [
      {
        label: 'VO₂ Max',
        data: vo2MaxHistory.map(d => d.vo2max_value),
        borderColor: 'rgba(139, 92, 246, 0.8)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.3,
        fill: true
      }
    ]
  };
  
  // Workout activity by type
  const activityTypes = workouts.reduce((acc, workout) => {
    const type = workout.activity_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  const activityChartData = {
    labels: Object.keys(activityTypes),
    datasets: [
      {
        data: Object.values(activityTypes),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  // Handle VO2 Max Input
  const handleVo2MaxSubmit = async (value) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/vo2max', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_date: today,
          vo2max_value: parseFloat(value)
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save VO2 Max value');
      }
      
      // Refresh VO2 Max data
      const refreshResponse = await fetch(`/api/vo2max?start_date=${formatDateParam(dateRange.startDate)}&end_date=${formatDateParam(dateRange.endDate)}`);
      const refreshData = await refreshResponse.json();
      
      if (refreshData.history) {
        setVo2MaxHistory(refreshData.history);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving VO2 Max:', error);
      return false;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Fitness Tracker
        </h2>
        
        <MetricInput 
          label="Add VO₂ Max Reading" 
          placeholder="e.g. 42.5"
          unit="ml/kg/min"
          onSubmit={handleVo2MaxSubmit}
        />
      </div>
      
      <StatsGrid 
        stats={[
          { title: 'Total Distance', value: workoutStats.totalDistance, unit: 'km', icon: 'map' },
          { title: 'Total Calories', value: workoutStats.totalCalories, unit: 'kcal', icon: 'flame' },
          { title: 'Active Time', value: workoutStats.totalTime, unit: 'min', icon: 'clock' },
          { title: 'Avg Heart Rate', value: workoutStats.avgHeartRate, unit: 'bpm', icon: 'heart' }
        ]}
        isLoading={isLoading}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">VO₂ Max Trend</h3>
          <DataChart 
            data={vo2MaxChartData} 
            type="line" 
            height={300}
            isLoading={isLoading || vo2MaxHistory.length === 0}
            options={{
              scales: {
                y: {
                  min: Math.max(0, Math.min(...vo2MaxHistory.map(d => d.vo2max_value || 0)) - 5),
                  max: Math.max(...vo2MaxHistory.map(d => d.vo2max_value || 0)) + 5
                }
              }
            }}
          />
        </div>
        
        <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Activity Types</h3>
          <DataChart 
            data={activityChartData} 
            type="doughnut" 
            height={250}
            isLoading={isLoading || workouts.length === 0}
            options={{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
        <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Workouts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <WorkoutCard key={i} isLoading={true} />
            ))
          ) : workouts.length > 0 ? (
            workouts.slice(0, 6).map((workout, index) => (
              <WorkoutCard
                key={index}
                activityType={workout.activity_type}
                title={workout.title}
                date={workout.date}
                distance={workout.distance}
                duration={workout.time}
                calories={workout.calories}
                heartRate={workout.avg_hr}
              />
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-gray-400">
              No workouts found in the selected date range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
