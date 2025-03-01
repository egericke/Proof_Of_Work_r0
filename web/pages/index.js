// web/pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../components/DashboardLayout';
import LoadingOverlay from '../components/LoadingOverlay';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure dashboard transitions from loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Force loading to end after 2 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Head>
        <title>My Daily Proof | Personal Dashboard</title>
        <meta name="description" content="Personal fitness, productivity, and habit tracking dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {isLoading ? (
        <LoadingOverlay />
      ) : (
        <DashboardLayout />
      )}
    </>
  );
}
