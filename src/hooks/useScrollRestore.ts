import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Saves scroll position when leaving a route and restores it when returning.
 * This preserves the user's place in long pages (home gallery, vibe matcher, etc.).
 */
const useScrollRestore = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const key = `scroll_${pathname}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      // Small delay to let the DOM render before scrolling
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(saved, 10));
      });
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };
  }, [pathname]);
};

export default useScrollRestore;
