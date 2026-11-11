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
    // If navigating to testimonials hash or query, leave scrolling to the HomePage handler
    if (hash === '#testimonials' || (search && search.includes('testimonials'))) {
      return;
    }

    // If navigating to any other anchor hash, smooth scroll to that element
    if (hash) {
      try {
        const id = decodeURIComponent(hash.replace(/^#/, ''));
        // Ignore hash route paths (e.g. #/finance) or empty IDs
        if (id && !id.startsWith('/')) {
          const el = document.getElementById(id) || document.querySelector(hash);
          if (el) {
            setTimeout(() => {
              const navHeight = 85;
              const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
              window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            }, 80);
            return;
          }
        }
      } catch {
        // Fallback silently if hash contains invalid selector characters
      }
    }

    // Otherwise, immediately scroll to top of the page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, hash, search]);

  return null;
}
