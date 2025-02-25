// web/components/ui/TimeDistribution.js
import React from 'react';

const colorMap = {
  'Deep Work': 'bg-blue-500',
  'Health/Fitness': 'bg-green-500',
  'Learning': 'bg-purple-500',
  'Social': 'bg-amber-500',
  'Rest': 'bg-red-400',
  'Other': 'bg-gray-500'
};

export default function TimeDistribution({ data, isLoading }) {
  // Sort by hours descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
        
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <div className="h-4 w-24 bg-gray-700 rounded"></div>
              <div className="h-4 w-12 bg-gray-700 rounded"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No time data available for the selected period
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sortedData.map((item, index) => (
          <div 
            key={index}
            className="bg-gray-800 bg-opacity-40 rounded-lg p-4 backdrop-blur-sm border border-blue-500/10"
          >
            <div className="flex justify-between items-start">
              <h4 className="text-white font-medium">{item.name}</h4>
              <span className="text-blue-400 font-medium">{item.percentage}%</span>
            </div>
            
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-semibold text-white">{item.value.toFixed(1)}</span>
              <span className="ml-1 text-sm text-gray-400">hours</span>
            </div>
            
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${colorMap[item.name] || 'bg-blue-500'}`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 backdrop-blur-sm mt-6">
        <h4 className="text-white font-medium mb-3">Overall Distribution</h4>
        <div className="w-full h-8 flex rounded-full overflow-hidden">
          {sortedData.map((item, index) => (
            <div
              key={index}
              className={`h-full ${colorMap[item.name] || 'bg-blue-500'} relative group`}
              style={{ width: `${item.percentage}%` }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap transition-opacity duration-200">
                {item.name}: {item.percentage}%
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4">
          {sortedData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 ${colorMap[item.name] || 'bg-blue-500'} rounded-full mr-2`}></div>
              <span className="text-sm text-gray-300">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
