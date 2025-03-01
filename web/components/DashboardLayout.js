// web/components/DashboardLayout.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import LoadingOverlay from './LoadingOverlay';
import DebugPanel from './DebugPanel';

// Panels - Using direct imports for now to ensure they load
import OverviewPanel from './panels/OverviewPanel';
import FitnessPanel from './panels/FitnessPanel';
import TimePanel from './panels/TimePanel';
import HabitsPanel from './panels/HabitsPanel';

// Create a singleton Supabase client for use throughout the app
let supabaseInstance = null;

const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found. Check your environment variables.');
    return null;
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
  return supabaseInstance;
};

export default function DashboardLayout() {
  // Add client-side rendering guard
  const [isMounted, setIsMounted] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false to avoid long loading state
  const [loadError, setLoadError] = useState(null);
  const [activePanel, setActivePanel] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date() // Today
  });
  const [userData, setUserData] = useState({
    name: 'Dashboard User',
    avatar: '/avatar-placeholder.png'
  });

  // Force client-side render
  useEffect(() => {
    setIsMounted(true);
    console.log("DashboardLayout mounted");
  }, []);

  // Initialize Supabase client
  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Use our singleton function to get the client
        const supabaseClient = getSupabaseClient();
        
        if (!supabaseClient) {
          throw new Error('Failed to initialize Supabase client');
        }
        
        setSupabase(supabaseClient);
        console.log("Supabase client initialized successfully");
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        setLoadError(error.message);
      }
    };
    
    if (isMounted) {
      initSupabase();
    }
  }, [isMounted]);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render active panel based on selection
  const renderActivePanel = () => {
    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-xl text-red-400 mb-4">Error loading dashboard</div>
          <p className="text-gray-400 max-w-md text-center mb-4">
            {loadError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activePanel) {
      case 'overview':
        return <OverviewPanel supabase={supabase} dateRange={dateRange} />;
      case 'fitness':
        return <FitnessPanel supabase={supabase} dateRange={dateRange} />;
      case 'time':
        return <TimePanel supabase={supabase} dateRange={dateRange} />;
      case 'habits':
        return <HabitsPanel supabase={supabase} dateRange={dateRange} />;
      default:
        return <OverviewPanel supabase={supabase} dateRange={dateRange} />;
    }
  };

  // Client-side rendering guard
  if (!isMounted) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <DashboardHeader 
        userData={userData} 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <DashboardSidebar 
          activePanel={activePanel} 
          setActivePanel={setActivePanel}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderActivePanel()}
        </main>
      </div>
      
      <DebugPanel supabase={supabase} />
    </div>
  );
}
