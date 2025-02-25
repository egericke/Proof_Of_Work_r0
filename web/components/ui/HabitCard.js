// web/components/ui/HabitCard.js
import React from 'react';

const iconMap = {
  'list-check': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  percent: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  flame: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  trophy: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

export default function HabitCard({ title, value, unit, icon, isLoading, color = 'blue' }) {
  const gradientColor = colorMap[color] || colorMap.blue;

  if (isLoading) {
    return (
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
          <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-8 w-20 bg-gray-700 rounded mt-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`p-2 rounded-full bg-gradient-to-br ${gradientColor} bg-opacity-20 text-white`}>
          {iconMap[icon] || (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline">
        <span className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradientColor}`}>
          {value}
        </span>
        {unit && <span className="ml-1 text-sm text-gray-400">{unit}</span>}
      </div>
    </div>
  );
}
