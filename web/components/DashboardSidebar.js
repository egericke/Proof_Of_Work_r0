// web/components/DashboardSidebar.js
import React from 'react';

const menuItems = [
  {
    id: 'overview',
    name: 'Overview',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'time',
    name: 'Time',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'habits',
    name: 'Habits',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  }
];

export default function DashboardSidebar({ activePanel, setActivePanel, isOpen, setIsOpen }) {
  const handleMenuClick = (panelId) => {
    setActivePanel(panelId);
    // Close sidebar after selection on mobile
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
  
  return (
    <div 
      className={`fixed inset-y-0 left-0 transform md:relative md:translate-x-0 z-30 transition duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        w-64 md:w-16 lg:w-64 bg-gray-900 border-r border-blue-500/30 overflow-y-auto`}
    >
      <div className="flex justify-between items-center px-4 h-16 border-b border-blue-500/30 md:hidden">
        <div className="font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Dashboard
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="flex flex-col h-full py-6">
        <div className="hidden md:flex lg:hidden items-center justify-center mb-8">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">DP</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center justify-center mb-8">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">DP</span>
          </div>
        </div>
        
        <div className="space-y-2 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center py-3 px-2 md:justify-center lg:justify-start lg:pl-4 rounded-md transition-all duration-300 group ${
                activePanel === item.id 
                  ? 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center lg:justify-start w-full lg:w-auto">
                <span className="inline-flex items-center justify-center h-8 w-8">
                  {item.icon}
                </span>
                <span className="lg:block hidden md:hidden ml-3 font-medium">{item.name}</span>
              </div>
              
              {activePanel === item.id && (
                <div className="hidden lg:block h-8 w-1 bg-blue-500 rounded-full absolute right-0 transform -translate-x-3"></div>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-auto px-2">
          <button className="w-full flex items-center py-3 px-2 md:justify-center lg:justify-start lg:pl-4 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-300 group">
            <div className="flex items-center justify-center lg:justify-start w-full lg:w-auto">
              <span className="inline-flex items-center justify-center h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span className="lg:block hidden md:hidden ml-3 font-medium">Settings</span>
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
}
