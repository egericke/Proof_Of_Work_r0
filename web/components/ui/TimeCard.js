// web/components/ui/TimeCard.js
import React from 'react';

const iconMap = {
  clock: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  brain: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

export default function TimeCard({ title, hours, subtitle, icon, isLoading, color = 'blue' }) {
  const gradientColor = colorMap[color] || colorMap.blue;
  
  if (isLoading) {
    return (
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm animate-pulse">
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
          <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-8 w-20 bg-gray-700 rounded mt-4 mb-2"></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className={`p-2 rounded-full bg-gradient-to-br ${gradientColor} bg-opacity-20 text-white`}>
          {iconMap[icon] || iconMap.clock}
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline">
        <span className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradientColor}`}>
          {hours}
        </span>
        <span className="ml-1 text-sm text-gray-400">hours</span>
      </div>
      
      {subtitle && (
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
