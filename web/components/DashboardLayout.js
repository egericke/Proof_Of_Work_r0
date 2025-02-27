// web/components/DashboardLayout.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import LoadingOverlay from './LoadingOverlay';
import DebugPanel from './DebugPanel';

// Panels
import OverviewPanel from './panels/OverviewPanel';
import FitnessPanel from './panels/FitnessPanel';
import TimePanel from './panels/TimePanel';
import HabitsPanel from './panels/HabitsPanel';

export default function DashboardLayout() {
  const [supabase, setSupabase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date() // Today
  });
  const [userData, setUserData] = useState({
    name: 'Dashboard User',
    avatar: '/avatar-placeholder.png'
  });

  // Initialize Supabase client
  useEffect(() => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not found. Check your environment variables.');
      }
      
      const supabaseClient = createClient(supabaseUrl, supabaseKey);
      setSupabase(supabaseClient);
      
      // Simulate loading time for transitions
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setIsLoading(false);
    }
  }, []);

  // Render active panel based on selection
  const renderActivePanel = () => {
    if (!supabase) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-xl text-red-400 mb-4">Database connection error</div>
          <p className="text-gray-400 max-w-md text-center">
            Unable to connect to the database. Please check your Supabase credentials 
            and make sure they are properly configured in your environment variables.
          </p>
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

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <DashboardHeader 
        userData={userData} 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar 
          activePanel={activePanel} 
          setActivePanel={setActivePanel} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderActivePanel()}
        </main>
      </div>
      
      {/* Debug panel for development */}
      <DebugPanel supabase={supabase} />
    </div>
  );
}
