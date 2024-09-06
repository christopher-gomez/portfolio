import { useEffect, useRef } from "react";

export function useIntersectionObserver(
  ref,
  onVisible,
  onHidden,
  threshold = 0.5,
  root = null,
  rootMargin = 0
) {
  const observerRef = useRef(null);
  const currentEl = useRef(null);
  const create = (ref, onVisible, onHidden, threshold, rootMargin) => {
    if (observerRef.current && currentEl.current) {
      observerRef.current.unobserve(currentEl.current);
    }
    const currentElement = ref.current;
    if (currentElement) {
      const viewportHeight = window.innerHeight;
      const _threshold = Math.min(
        1,
        (viewportHeight / currentElement.clientHeight) * threshold
      ); // element fills 60% of the viewport

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onVisible();
          } else {
            onHidden();
          }
        },
        {
          threshold: _threshold,
          rootMargin: (rootMargin < 0 ? '-' : "") + `${Math.abs(rootMargin)}px`,
        }
      );

      currentEl.current = currentElement;
      observer.observe(currentElement);
      observerRef.current = observer;
    }
  };

  useEffect(() => {
    create(ref, onVisible, onHidden, threshold, rootMargin);

    const onResize = () => {
      create(ref, onVisible, onHidden, threshold, rootMargin);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);

      if (observerRef.current && currentEl.current) {
        observerRef.current.unobserve(currentEl.current);
      }
    };
  }, [ref, onVisible, onHidden, threshold, rootMargin]);
}
