import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every route transition (e.g. clicking Destinations, Tours, About, Contact)
 * automatically scrolls the window to the very top (0, 0), avoiding landing at the footer.
 * If navigating to an anchor hash (e.g. #testimonials), it smoothly scrolls to that element.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If navigating to an anchor hash, smooth scroll to that element
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
      return;
    }

    // Otherwise, immediately scroll to top of the page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, hash]);

  return null;
}
