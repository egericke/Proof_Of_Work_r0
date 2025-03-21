// components/ui/IndividualHabitDashboard.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

const habitColors = {
  'Meditation': {
    primary: 'rgba(59, 130, 246, 0.8)', // blue
    secondary: 'rgba(59, 130, 246, 0.2)',
    border: 'rgba(59, 130, 246, 1)'
  },
  'Exercise': {
    primary: 'rgba(16, 185, 129, 0.8)', // green
    secondary: 'rgba(16, 185, 129, 0.2)',
    border: 'rgba(16, 185, 129, 1)'
  },
  'Reading': {
    primary: 'rgba(139, 92, 246, 0.8)', // purple
    secondary: 'rgba(139, 92, 246, 0.2)',
    border: 'rgba(139, 92, 246, 1)'
  },
  'Journaling': {
    primary: 'rgba(245, 158, 11, 0.8)', // amber
    secondary: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 1)'
  },
  'Cold Plunge': {
    primary: 'rgba(14, 165, 233, 0.8)', // sky
    secondary: 'rgba(14, 165, 233, 0.2)',
    border: 'rgba(14, 165, 233, 1)'
  },
  'default': {
    primary: 'rgba(156, 163, 175, 0.8)', // gray
    secondary: 'rgba(156, 163, 175, 0.2)',
    border: 'rgba(156, 163, 175, 1)'
  }
};

import HabitCalendar from './HabitCalendar';
// In the return statement:
<HabitCalendar data={heatmapData} />

export default function IndividualHabitDashboard({ habitName, habitData }) {
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    completionRate: 0,
    totalCompleted: 0,
    totalAttempted: 0,
  });
  
  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: []
  });
  
  const [monthlyData, setMonthlyData] = useState([]);
  const [expandedView, setExpandedView] = useState(false);
  
  // Get color scheme for this habit
  const colorScheme = habitColors[habitName] || habitColors.default;
  
  // Process habit data on initial load
  useEffect(() => {
    if (!habitData || !habitData.entries) return;
    
    // Sort entries by date
    const sortedEntries = [...habitData.entries].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    let streakBroken = false;
    
    while (!streakBroken) {
      const entry = sortedEntries.find(e => e.date === checkDate);
      
      if (entry && entry.completed) {
        currentStreak++;
        // Move to previous day
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toISOString().split('T')[0];
      } else {
        streakBroken = true;
      }
    }
    
    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedEntries.length; i++) {
      if (sortedEntries[i].completed) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // Calculate completion rate
    const totalAttempted = sortedEntries.length;
    const totalCompleted = sortedEntries.filter(e => e.completed).length;
    const completionRate = totalAttempted > 0 
      ? Math.round((totalCompleted / totalAttempted) * 100) 
      : 0;
    
    // Create monthly data for heat map
    const months = {};
    sortedEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = {
          name: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          days: {}
        };
      }
      
      months[monthKey].days[date.getDate()] = entry.completed;
    });
    
    // Process trend data (moving 7-day completion rate)
    const labels = [];
    const completionData = [];
    
    // Calculate 7-day moving average
    for (let i = 6; i < sortedEntries.length; i++) {
      const weekEntries = sortedEntries.slice(i - 6, i + 1);
      const weekCompleted = weekEntries.filter(e => e.completed).length;
      const weekRate = Math.round((weekCompleted / 7) * 100);
      
      labels.push(sortedEntries[i].date);
      completionData.push(weekRate);
    }
    
    // Update states
    setStats({
      currentStreak,
      bestStreak,
      completionRate,
      totalCompleted,
      totalAttempted
    });
    
    setTrendData({
      labels,
      datasets: [
        {
          label: '7-Day Completion Rate (%)',
          data: completionData,
          borderColor: colorScheme.border,
          backgroundColor: colorScheme.secondary,
          tension: 0.4,
          fill: true
        }
      ]
    });
    
    setMonthlyData(Object.values(months));
    
  }, [habitData, habitName]);
  
  // Chart options for trend line
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Completion rate: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };
  
  // Render monthly heat map
  const renderHeatMap = (month) => {
    // Get the number of days in the month
    const [year, monthNum] = month.name.split(' ')[1] + '-' + 
      String(new Date(Date.parse(month.name + ' 1')).getMonth() + 1).padStart(2, '0');
    const daysInMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    
    // Create day cells
    const dayCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const isCompleted = month.days[day];
      const cellClass = isCompleted === true 
        ? `bg-${colorScheme.primary.replace('rgba(', '').replace(')', '').split(',')[0]}-500` 
        : isCompleted === false 
          ? 'bg-red-500' 
          : 'bg-gray-700';
      
      dayCells.push(
        <div 
          key={`${month.name}-${day}`}
          className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs ${cellClass}`}
          title={`${month.name} ${day}: ${isCompleted ? 'Completed' : isCompleted === false ? 'Not completed' : 'No data'}`}
        >
          {day}
        </div>
      );
    }
    
    return (
      <div key={month.name} className="mb-4">
        <h5 className="text-sm text-gray-300 mb-1">{month.name}</h5>
        <div className="grid grid-cols-7 gap-1">
          {dayCells}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm mb-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium" style={{ color: colorScheme.border }}>
          {habitName}
        </h3>
        <button 
          onClick={() => setExpandedView(!expandedView)}
          className="p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-gray-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {expandedView ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-400">Current Streak</p>
          <p className="text-xl font-bold">{stats.currentStreak} <span className="text-xs">days</span></p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-400">Best Streak</p>
          <p className="text-xl font-bold">{stats.bestStreak} <span className="text-xs">days</span></p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-400">Completion Rate</p>
          <p className="text-xl font-bold">{stats.completionRate}%</p>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-400">Total Completed</p>
          <p className="text-xl font-bold">{stats.totalCompleted} <span className="text-xs">/ {stats.totalAttempted}</span></p>
        </div>
      </div>
      
      {/* Expanded Content */}
      {expandedView && (
        <div className="mt-4">
          {/* Trend Chart */}
          <div className="bg-gray-700 p-3 rounded mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Consistency Trend</h4>
            <div style={{ height: '200px' }}>
              {trendData.labels.length > 0 ? (
                <Line data={trendData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Not enough data to display trend
                </div>
              )}
            </div>
          </div>
          
          {/* Monthly Heat Maps */}
          <div className="bg-gray-700 p-3 rounded">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Monthly View</h4>
            {monthlyData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {monthlyData.map(month => renderHeatMap(month))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">
                No data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
