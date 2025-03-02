// web/components/ui/WorkoutCard.js
import React from 'react';

const formatDistance = (distance) => {
  if (!distance) return '0 km';
  return `${(distance / 1000).toFixed(2)} km`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
};

const getActivityIcon = (type) => {
  if (!type) return null;
  
  switch (type.toLowerCase()) {
    case 'running':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'cycling':
    case 'indoor_cycling':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case 'swimming':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
};

export default function WorkoutCard({ 
  activityType, 
  title, 
  date, 
  distance, 
  duration, 
  calories, 
  heartRate, 
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm animate-pulse">
        <div className="h-5 w-24 bg-gray-700 rounded mb-2"></div>
        <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="h-5 w-16 bg-gray-700 rounded"></div>
          <div className="h-5 w-16 bg-gray-700 rounded"></div>
          <div className="h-5 w-16 bg-gray-700 rounded"></div>
          <div className="h-5 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Format date string safely
  let formattedDate = 'Unknown date';
  if (date) {
    try {
      formattedDate = new Date(date).toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
    }
  }
  
  // Default title if not provided
  const workoutTitle = title || (activityType ? `${activityType} workout` : 'Workout');
  
  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-gray-400 text-sm">{formattedDate}</span>
          <h3 className="text-white font-medium">{workoutTitle}</h3>
        </div>
        
        <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
          {getActivityIcon(activityType)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
        {distance && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-gray-300">{formatDistance(distance)}</span>
          </div>
        )}
        
        {duration && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-300">{formatDuration(duration)}</span>
          </div>
        )}
        
        {calories && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <span className="text-gray-300">{calories} kcal</span>
          </div>
        )}
        
        {heartRate && (
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-gray-300">{heartRate} bpm</span>
          </div>
        )}
      </div>
    </div>
  );
}
