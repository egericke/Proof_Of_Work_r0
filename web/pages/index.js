// web/pages/index.js
import Head from 'next/head';
import DashboardLayout from '../components/DashboardLayout';

export default function Home() {
  return (
    <>
      <Head>
        <title>My Daily Proof | Personal Dashboard</title>
        <meta name="description" content="Personal fitness, productivity, and habit tracking dashboard" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@500;700&display=swap" rel="stylesheet" />
      </Head>
      
      <DashboardLayout />
    </>
  );
}
