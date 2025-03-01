// web/components/DashboardHeader.js
import { useState } from 'react';
import DateRangePicker from './DateRangePicker';

export default function DashboardHeader({ userData, dateRange, setDateRange, toggleSidebar }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Get current date formatted
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="bg-gray-800 border-b border-blue-500/30 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button 
              onClick={toggleSidebar}
              className="mr-3 md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle sidebar menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                MY DAILY PROOF
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-2 sm:px-3 py-2 text-sm font-medium rounded-md bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 transition-all duration-300 flex items-center space-x-1 sm:space-x-2"
              >
                <span className="hidden xs:inline">
                  {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                </span>
                <span className="xs:hidden">Date</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDatePicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:bg-transparent md:inset-auto md:absolute md:right-0 md:mt-2 md:w-72">
                  <div className="absolute right-4 top-20 w-72 md:right-0 md:top-0 md:w-72 md:static bg-gray-800 rounded-md shadow-lg p-4 border border-blue-500/30">
                    <DateRangePicker 
                      dateRange={dateRange} 
                      setDateRange={setDateRange} 
                      onClose={() => setShowDatePicker(false)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-blue-300">{userData.name}</div>
                <div className="text-xs text-gray-400">{today}</div>
              </div>
              <img 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-blue-500/50" 
                src={userData.avatar} 
                alt={userData.name}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
