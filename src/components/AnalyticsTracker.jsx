import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This is the helper function that sends the page view event.
const trackPageView = (path) => {
  // Check if the gtag function exists on the window object.
  if (typeof window.gtag === 'function') {
    window.gtag('config', 'G-SSFNG2R1J7', {
      page_path: path,
    });
    console.log(`GA PageView tracked for: ${path}`);
  }
};

const AnalyticsTracker = () => {
  const location = useLocation();

  // This effect will run every time the URL 'location' changes.
  useEffect(() => {
    // We send the full path, including any search parameters.
    trackPageView(location.pathname + location.search);
  }, [location]);

  // This component doesn't render anything visible to the user.
  return null;
};

export default AnalyticsTracker;