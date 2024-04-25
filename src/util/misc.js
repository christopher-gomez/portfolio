export function isElementInView(el, scrollPercentage = 0) {
  if (el == undefined) return false;
  
  var rect = el.getBoundingClientRect();
  var isVisible =
    rect.top - scrollPercentage < window.innerHeight &&
    rect.bottom - scrollPercentage >= 0;
  return isVisible;
}
