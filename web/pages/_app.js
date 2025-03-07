// web/pages/_app.js
import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }) {
  // Fix hydration issues and initialize any app-wide state
  useEffect(() => {
    // This ensures that the client and server render match
    document.body.classList.add('dashboard-theme');
    
    // Add global error handler for unhandled errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log to console as usual
      originalConsoleError.apply(console, args);
      
      // Check for common errors related to rendering
      const errorText = args.join(' ');
      if (
        errorText.includes('Cannot read properties of undefined') ||
        errorText.includes('Cannot read properties of null')
      ) {
        // Log to monitoring service if available
        if (window.errorReporter) {
          window.errorReporter.captureException(new Error(`JS Error: ${errorText}`));
        }
      }
    };
    
    // Cleanup
    return () => {
      console.error = originalConsoleError;
    };
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
        
        {/* Add CSP as a meta tag as well for extra protection */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; connect-src 'self' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data:;"
        />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}

export default MyApp;
