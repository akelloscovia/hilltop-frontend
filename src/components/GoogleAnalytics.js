import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function GoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const GA_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
    
    if (!GA_ID) {
      console.warn('Google Analytics ID not configured');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', GA_ID);

    // Track page views
    gtag('event', 'page_view', {
      page_path: location.pathname,
      page_title: document.title
    });
  }, [location]);

  return null;
}
