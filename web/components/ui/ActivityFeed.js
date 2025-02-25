// web/components/ui/ActivityFeed.js
import React from 'react';

const iconMap = {
  workout: (
    <div className="rounded-full bg-blue-500/20 p-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  ),
  focus: (
    <div className="rounded-full bg-purple-500/20 p-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
  ),
  habit: (
    <div className="rounded-full bg-amber-500/20 p-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  )
};

export default function ActivityFeed({ activities, isLoading }) {
  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
      <h3 className="text-lg font-medium text-blue-300 mb-4">Recent Activity</h3>
      
      {isLoading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-start space-x-3 mb-4 animate-pulse">
            <div className="rounded-full bg-gray-700 h-9 w-9"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 w-24 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 w-16 rounded"></div>
            </div>
            <div className="h-4 bg-gray-700 w-12 rounded"></div>
          </div>
        ))
      ) : activities.length > 0 ? (
        activities.map((activity, i) => (
          <div 
            key={i} 
            className="flex items-start space-x-3 mb-4 p-2 rounded-md transition-all duration-300 hover:bg-gray-700/30"
          >
            {iconMap[activity.type] || iconMap.workout}
            
            <div className="flex-1">
              <p className="text-white font-medium">{activity.title}</p>
              <p className="text-gray-400 text-sm">{activity.date}</p>
            </div>
            
            <div className="text-blue-300 font-medium">
              {activity.value}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          No recent activity
        </div>
      )}
    </div>
  );
}
