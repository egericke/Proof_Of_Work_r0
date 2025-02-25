// web/components/ui/HabitCalendar.js
import React from 'react';

export default function HabitCalendar({ data, startDate, endDate, isLoading }) {
  // Generate days between startDate and endDate
  const getDaysArray = (start, end) => {
    const arr = [];
    const dt = new Date(start);
    
    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    
    return arr;
  };
  
  const days = getDaysArray(startDate, endDate);
  
  // Group days by month
  const monthsData = days.reduce((acc, day) => {
    const monthKey = day.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    
    acc[monthKey].push(day);
    return acc;
  }, {});
  
  // Get completion rate for a date
  const getCompletionRate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = data[dateStr];
    
    if (!dayData) return 0;
    
    return dayData.total > 0 
      ? Math.round((dayData.completed / dayData.total) * 100) 
      : 0;
  };
  
  // Get cell color based on completion rate
  const getCellColor = (rate) => {
    if (rate === 0) return 'bg-gray-800';
    if (rate < 25) return 'bg-red-900';
    if (rate < 50) return 'bg-red-700';
    if (rate < 75) return 'bg-amber-600';
    if (rate < 100) return 'bg-green-600';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-48 bg-gray-700 rounded"></div>
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(0).map((_, i) => (
            <div key={i} className="h-10 w-full bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-4 pb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-800 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-400">Not tracked</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-900 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-400">0-25%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-700 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-400">25-50%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-600 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-400">50-75%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-400">75-99%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
          <span className="text-sm text-gray-400">100%</span>
        </div>
      </div>
      
      {Object.entries(monthsData).map(([month, daysInMonth]) => {
        // Get the day of week of the first day (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfWeek = daysInMonth[0].getDay();
        
        // Create empty cells for padding at the start
        const paddingCells = Array(firstDayOfWeek).fill(null);
        
        return (
          <div key={month} className="mb-6">
            <h4 className="text-lg font-medium text-white mb-2">{month}</h4>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs text-gray-500">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {/* Padding cells */}
              {paddingCells.map((_, index) => (
                <div key={`padding-${index}`} className="aspect-square"></div>
              ))}
              
              {/* Day cells */}
              {daysInMonth.map(day => {
                const dateStr = day.toISOString().split('T')[0];
                const dayData = data[dateStr];
                const completionRate = getCompletionRate(day);
                const cellColor = getCellColor(completionRate);
                
                return (
                  <div 
                    key={dateStr}
                    className={`aspect-square relative group ${cellColor} rounded-md transition-all duration-300 hover:scale-105 cursor-default`}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-medium">{day.getDate()}</span>
                      {dayData && (
                        <span className="text-xs text-white/70">{dayData.completed}/{dayData.total}</span>
                      )}
                    </div>
                    
                    {dayData && (
                      <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap transition-opacity duration-200">
                        <div className="text-center font-medium mb-1">
                          {new Date(dateStr).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </div>
                        <div>Completed: {dayData.completed}/{dayData.total}</div>
                        <div>Rate: {completionRate}%</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
