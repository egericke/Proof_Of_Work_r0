// web/components/LoadingOverlay.js
import React, { useState, useEffect } from 'react';

export default function LoadingOverlay() {
  const [loadingTime, setLoadingTime] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Count how long we've been loading
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setLoadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Show debug info after 10 seconds of loading
  useEffect(() => {
    if (loadingTime >= 10) {
      setShowDebugInfo(true);
    }
  }, [loadingTime]);
  
  // Force dashboard to render after 15 seconds - REFACTORED to avoid script injection
  useEffect(() => {
    if (loadingTime >= 15 && typeof window !== 'undefined') {
      try {
        // Find any loading state variable and set it to false
        for (const key in window) {
          if (key.startsWith('__NEXT_DATA__')) {
            console.log('Attempting emergency render bypass');
            // Force a refresh without the loading overlay
            window.location.href = '/diagnostic';
            break;
          }
        }
      } catch (e) {
        console.error('Error in emergency render bypass:', e);
      }
    }
  }, [loadingTime]);

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
        <p className="text-blue-300 mt-2 animate-pulse">Loading your personal dashboard... {loadingTime}s</p>
        
        {showDebugInfo && (
          <div className="mt-8 max-w-md px-4 py-3 bg-gray-800 rounded-lg text-gray-300 text-sm">
            <p className="text-yellow-400 font-semibold mb-2">Loading is taking longer than expected.</p>
            <p className="mb-2">This could be caused by:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Slow or unstable internet connection</li>
              <li>Browser compatibility issues</li>
              <li>Missing environment variables</li>
              <li>JavaScript errors</li>
            </ul>
            <div className="flex justify-between">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/diagnostic'}
                className="px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
              >
                Run Diagnostics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
