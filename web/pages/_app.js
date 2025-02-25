// web/pages/_app.js
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Log to confirm the application is loading
  useEffect(() => {
    console.log('Dashboard application loaded successfully');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
