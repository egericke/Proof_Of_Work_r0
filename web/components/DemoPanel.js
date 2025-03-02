// web/components/DemoPanel.js
import React from 'react';
import StatsCard from './ui/StatsCard';
import DataChart from './ui/DataChart';
import QuoteCard from './ui/QuoteCard';
import ActivityFeed from './ui/ActivityFeed';

/**
 * A demo panel to show when Supabase is not available
 * This displays static sample data and explanations
 */
export default function DemoPanel() {
  // Demo stats
  const demoStats = {
    vo2Max: { value: 42.5, trend: 2.1 },
    workouts: { value: 8, trend: -1 },
    focusHours: { value: 28.5, trend: 5 },
    habitStreak: { value: 12, trend: 3 }
  };
  
  // Demo chart data
  const demoChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Workouts',
        data: [1, 0, 1, 1, 0, 1, 0],
        borderColor: 'rgba(66, 153, 225, 0.8)',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Focus Hours',
        data: [4.5, 5.2, 3.8, 6.1, 4.3, 1.5, 0.8],
        borderColor: 'rgba(236, 72, 153, 0.8)',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        yAxisID: 'y-axis-2',
      }
    ]
  };
  
  // Demo activities
  const demoActivities = [
    {
      type: 'workout',
      title: 'Morning Run',
      date: new Date().toLocaleDateString(),
      value: '5.2 km'
    },
    {
      type: 'focus',
      title: 'Deep Work',
      date: new Date().toLocaleDateString(),
      value: '3.5 hrs'
    },
    {
      type: 'habit',
      title: 'Daily Habits',
      date: new Date().toLocaleDateString(),
      value: '5/6 complete'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Dashboard Overview
        </h2>
        
        <div className="bg-amber-900/30 text-amber-300 px-3 py-1 text-sm rounded-full border border-amber-500/30">
          Demo Mode
        </div>
      </div>
      
      <div className="bg-gray-800/60 rounded-lg border border-blue-500/20 p-4 mb-6">
        <h3 className="text-lg font-medium text-blue-300 mb-2">Database Connection Required</h3>
        <p className="text-gray-300 mb-4">
          You're seeing sample data because the dashboard couldn't connect to a Supabase database.
          To see your real data, make sure:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
          <li>You've created a Supabase project</li>
          <li>Your environment variables are set correctly in <code className="bg-gray-700 px-1 rounded">.env.local</code></li>
          <li>The required database tables exist in your Supabase project</li>
        </ul>
        <p className="text-gray-400 text-sm">
          Check the debugging panel in the bottom-right corner for more information.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="VO₂ Max" 
          value={demoStats.vo2Max.value} 
          unit="ml/kg/min" 
          trend={demoStats.vo2Max.trend} 
          icon="heart" 
          isLoading={false}
          color="purple"
        />
        <StatsCard 
          title="Workouts" 
          value={demoStats.workouts.value} 
          unit="sessions" 
          trend={demoStats.workouts.trend} 
          icon="activity" 
          isLoading={false}
          color="blue"
        />
        <StatsCard 
          title="Focus Time" 
          value={demoStats.focusHours.value} 
          unit="hours" 
          trend={demoStats.focusHours.trend} 
          icon="clock" 
          isLoading={false}
          color="green"
        />
        <StatsCard 
          title="Habit Streak" 
          value={demoStats.habitStreak.value} 
          unit="days" 
          trend={demoStats.habitStreak.trend} 
          icon="check-circle" 
          isLoading={false}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Weekly Activity</h3>
          <DataChart 
            data={demoChartData} 
            type="line" 
            height={300} 
            isLoading={false}
            options={{
              scales: {
                'y-axis-1': {
                  type: 'linear',
                  position: 'left',
                  title: {
                    display: true,
                    text: 'Workouts'
                  },
                  suggestedMin: 0,
                  suggestedMax: 2,
                  ticks: {
                    stepSize: 1
                  }
                },
                'y-axis-2': {
                  type: 'linear',
                  position: 'right',
                  title: {
                    display: true,
                    text: 'Hours'
                  },
                  suggestedMin: 0,
                  grid: {
                    drawOnChartArea: false
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="flex flex-col gap-6">
          <QuoteCard 
            quote="Consistency over intensity. Those who show up every day outperform those who show up occasionally with maximum effort."
            author="James Clear"
          />
          
          <ActivityFeed 
            activities={demoActivities}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}
