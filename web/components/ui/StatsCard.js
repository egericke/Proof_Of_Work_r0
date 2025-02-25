// web/components/ui/StatsCard.js
import React from 'react';

const iconMap = {
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  activity: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  clock: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'check-circle': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const colorMap = {
  blue: 'from-blue-400 to-blue-600',
  purple: 'from-purple-400 to-purple-600',
  green: 'from-green-400 to-green-600',
  amber: 'from-amber-400 to-amber-600',
  red: 'from-red-400 to-red-600'
};

export default function StatsCard({ title, value, unit, trend, icon, isLoading, color = 'blue' }) {
  const gradientColor = colorMap[color] || colorMap.blue;
  
  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 w-16 bg-gray-700 rounded mb-4"></div>
          <div className="h-8 w-28 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-20 bg-gray-700 rounded"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <div className={`p-2 rounded-full bg-gradient-to-br ${gradientColor} bg-opacity-20 text-white`}>
              {iconMap[icon] || iconMap.activity}
            </div>
          </div>
          
          <div className="flex items-end">
            <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradientColor}`}>
              {value}
            </div>
            {unit && <div className="ml-1 text-sm text-gray-400 mb-1">{unit}</div>}
          </div>
          
          {trend !== undefined && (
            <div className="mt-2 flex items-center">
              {trend > 0 ? (
                <span className="text-green-500 flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  +{trend}%
                </span>
              ) : trend < 0 ? (
                <span className="text-red-500 flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                  </svg>
                  {trend}%
                </span>
              ) : (
                <span className="text-gray-500 flex items-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a1 1 0 010 2H5.414l4.293 4.293a1 1 0 010 1.414L5.414 16H7a1 1 0 110 2H3a1 1 0 01-1-1v-4a1 1 0 112 0v1.586l4.293-4.293a1 1 0 010-1.414L4 6.414V8a1 1 0 01-2 0V4a1 1 0 011-1h4z" clipRule="evenodd" />
                  </svg>
                  No change
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
