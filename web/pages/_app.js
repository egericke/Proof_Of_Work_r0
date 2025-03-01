// web/pages/_app.js
import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // Fix hydration issues
  useEffect(() => {
    // This ensures that the client and server render match
    document.body.classList.add('dashboard-theme');
  }, []);
  
  return (
    <>
      <Head>
        <title>My Daily Proof | Personal Dashboard</title>
        <meta name="description" content="Personal fitness, productivity, and habit tracking dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@500;700&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
