export function isElementInView(el, scrollPercentage = 0) {
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Convert scrollPercentage from a percentage of the viewport height to pixels
  const scrollOffset = windowHeight * (scrollPercentage / 100);

  // Check visibility with the scroll offset considered
  const isVisible = (rect.top <= windowHeight - scrollOffset) && (rect.bottom >= scrollOffset);

  return isVisible;
}

export function isMobileClient() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for various mobile device user agent strings
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}