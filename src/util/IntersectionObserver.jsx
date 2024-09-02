import { useEffect } from "react";

export function useIntersectionObserver(ref, onVisible, onHidden, threshold = 0.5, root = null, rootMargin = 0) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
        } else {
          onHidden();
        }
      },
      {
        root: root ? root.current : null, // viewport
        rootMargin: (rootMargin < 0 ? '-' : "") + `${Math.abs(rootMargin)}px`,
        threshold: threshold,
      }
    );

    const currentElement = ref.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [ref, onVisible, onHidden, threshold]);
}