import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const GTMPageTracker = () => {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  // This effect runs on the initial page load.
  useEffect(() => {
    if (!initialized) {
      window.dataLayer = window.dataLayer || [];
      // This is a standard GTM event for page views
      window.dataLayer.push({
        event: 'pageview',
        page: location.pathname + location.search,
      });
      setInitialized(true);
    }
  }, []);

  // This effect runs every time the location changes.
  useEffect(() => {
    if (initialized) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'pageview',
        page: location.pathname + location.search,
      });
    }
  }, [location, initialized]);

  return null; // This component doesn't render anything.
};

export default GTMPageTracker;