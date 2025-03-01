// web/pages/index.js
import React, { useState } from 'react';

// Extremely simplified dashboard with no dependencies
export default function MinimalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Very simple content that should render without issues
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow">
        <h1 className="text-xl font-bold">MY DAILY PROOF</h1>
        <p className="text-sm text-gray-400">Minimal Dashboard</p>
      </header>
      
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left p-2 rounded ${activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('fitness')}
              className={`w-full text-left p-2 rounded ${activeTab === 'fitness' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              Fitness
            </button>
            <button
              onClick={() => setActiveTab('time')}
              className={`w-full text-left p-2 rounded ${activeTab === 'time' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              Time
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`w-full text-left p-2 rounded ${activeTab === 'habits' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              Habits
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p>This is a minimal fallback dashboard to diagnose rendering issues.</p>
            <p className="mt-2">The main dashboard may be experiencing one of these problems:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>JavaScript errors during initialization</li>
              <li>Issues with Supabase connection</li>
              <li>React hydration mismatches</li>
              <li>Missing dependencies</li>
              <li>Browser compatibility issues</li>
            </ul>
            
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <p className="font-semibold">Next Steps:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Check the browser console for errors (F12 or Cmd+Option+I)</li>
                <li>Verify .env.local has the correct Supabase variables</li>
                <li>Try running in a different browser</li>
                <li>Make sure you're running the latest Node.js version</li>
                <li>Clear browser cache or use incognito mode</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
