// web/components/DashboardLayout.js
import { useState, useEffect, lazy, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import LoadingOverlay from './LoadingOverlay';
import DebugPanel from './DebugPanel';

// Lazy load panel components for better performance
const OverviewPanel = lazy(() => import('./panels/OverviewPanel'));
const FitnessPanel = lazy(() => import('./panels/FitnessPanel'));
const TimePanel = lazy(() => import('./panels/TimePanel'));
const HabitsPanel = lazy(() => import('./panels/HabitsPanel'));

export default function DashboardLayout() {
  const [supabase, setSupabase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Close sidebar when resizing to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render loading fallback for lazy loaded components
  const renderLoadingFallback = () => (
    <div className="flex items-center justify-center h-full p-8">
      <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Render active panel based on selection
  const renderActivePanel = () => {
    if (!supabase) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-xl text-red-400 mb-4">Database connection error</div>
          <p className="text-gray-400 max-w-md text-center">
            Unable to connect to the database. Please check your Supabase credentials 
            and make sure they are properly configured in your environment variables.
          </p>
        </div>
      );
    }

    return (
      <Suspense fallback={renderLoadingFallback()}>
        {activePanel === 'overview' && <OverviewPanel supabase={supabase} dateRange={dateRange} />}
        {activePanel === 'fitness' && <FitnessPanel supabase={supabase} dateRange={dateRange} />}
        {activePanel === 'time' && <TimePanel supabase={supabase} dateRange={dateRange} />}
        {activePanel === 'habits' && <HabitsPanel supabase={supabase} dateRange={dateRange} />}
      </Suspense>
    );
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

        {/* Sidebar with improved mobile handling */}
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
      
      {/* Debug panel for development */}
      <DebugPanel supabase={supabase} />
    </div>
  );
}
