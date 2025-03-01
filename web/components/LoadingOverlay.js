// web/components/LoadingOverlay.js
import React from 'react';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="h-24 w-24 rounded-full border-r-4 border-l-4 border-purple-500 animate-spin absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">DP</span>
            </div>
          </div>
        </div>
        <h2 className="text-xl mt-6 text-white font-bold">
          MY DAILY PROOF
        </h2>
        <p className="text-blue-300 mt-2 animate-pulse">Loading your personal dashboard...</p>
      </div>
    </div>
  );
}
