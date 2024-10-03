export function isElementInView(el, scrollPercentage = 0) {
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Convert scrollPercentage from a percentage of the viewport height to pixels
  const scrollOffset = windowHeight * (scrollPercentage / 100);

  // Check visibility with the scroll offset considered
  const isVisible =
    rect.top <= windowHeight - scrollOffset && rect.bottom >= scrollOffset;

  return isVisible;
}

export function isMobileClient() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for various mobile device user agent strings
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent
  );
}

export function smoothLerp(start, end, factor) {
  // speed is a value between 0 and 1. The closer to 1, the faster it converges.
  return start + (end - start) * factor;
}

export function applyEasing(timeProgress, easingType, maxThreshold, minThreshold, overshoot = 1.70158) {
  const c1 = overshoot;
  const c2 = c1 * 1.525;
  const c3 = c1 + 1;
  const n1 = 7.5625;
  const d1 = 2.75;

  // Helper function to apply max threshold
  function applyMaxThreshold(value) {
    return maxThreshold !== undefined ? Math.min(value, maxThreshold) : value;
  }

  function applyMinThreshold(value) {
    return minThreshold !== undefined ? Math.max(value, minThreshold) : value;
  }

  function applyThresholds(value) {
    return applyMaxThreshold(applyMinThreshold(value));
  }

  let easedValue;

  switch (easingType) {
    case "linear":
      easedValue = timeProgress;
      break;

    // Quadratic
    case "easeInQuad":
      easedValue = timeProgress * timeProgress;
      break;
    case "easeOutQuad":
      easedValue = 1 - (1 - timeProgress) * (1 - timeProgress);
      break;
    case "easeInOutQuad":
      easedValue =
        timeProgress < 0.5
          ? 2 * timeProgress * timeProgress
          : 1 - Math.pow(-2 * timeProgress + 2, 2) / 2;
      break;

    // Cubic
    case "easeInCubic":
      easedValue = timeProgress * timeProgress * timeProgress;
      break;
    case "easeOutCubic":
      easedValue = 1 - Math.pow(1 - timeProgress, 3);
      break;
    case "easeInOutCubic":
      easedValue =
        timeProgress < 0.5
          ? 4 * timeProgress * timeProgress * timeProgress
          : 1 - Math.pow(-2 * timeProgress + 2, 3) / 2;
      break;

    // Quartic
    case "easeInQuart":
      easedValue = timeProgress * timeProgress * timeProgress * timeProgress;
      break;
    case "easeOutQuart":
      easedValue = 1 - Math.pow(1 - timeProgress, 4);
      break;
    case "easeInOutQuart":
      easedValue =
        timeProgress < 0.5
          ? 8 * timeProgress * timeProgress * timeProgress * timeProgress
          : 1 - Math.pow(-2 * timeProgress + 2, 4) / 2;
      break;

    // Quintic
    case "easeInQuint":
      easedValue =
        timeProgress *
        timeProgress *
        timeProgress *
        timeProgress *
        timeProgress;
      break;
    case "easeOutQuint":
      easedValue = 1 - Math.pow(1 - timeProgress, 5);
      break;
    case "easeInOutQuint":
      easedValue =
        timeProgress < 0.5
          ? 16 *
            timeProgress *
            timeProgress *
            timeProgress *
            timeProgress *
            timeProgress
          : 1 - Math.pow(-2 * timeProgress + 2, 5) / 2;
      break;

    // Sine
    case "easeInSine":
      easedValue = 1 - Math.cos((timeProgress * Math.PI) / 2);
      break;
    case "easeOutSine":
      easedValue = Math.sin((timeProgress * Math.PI) / 2);
      break;
    case "easeInOutSine":
      easedValue = -(Math.cos(Math.PI * timeProgress) - 1) / 2;
      break;

    // Exponential
    case "easeInExpo":
      easedValue = timeProgress === 0 ? 0 : Math.pow(2, 10 * timeProgress - 10);
      break;
    case "easeOutExpo":
      easedValue = timeProgress === 1 ? 1 : 1 - Math.pow(2, -10 * timeProgress);
      break;
    case "easeInOutExpo":
      easedValue =
        timeProgress === 0
          ? 0
          : timeProgress === 1
          ? 1
          : timeProgress < 0.5
          ? Math.pow(2, 20 * timeProgress - 10) / 2
          : (2 - Math.pow(2, -20 * timeProgress + 10)) / 2;
      break;

    // Circular
    case "easeInCirc":
      easedValue = 1 - Math.sqrt(1 - Math.pow(timeProgress, 2));
      break;
    case "easeOutCirc":
      easedValue = Math.sqrt(1 - Math.pow(timeProgress - 1, 2));
      break;
    case "easeInOutCirc":
      easedValue =
        timeProgress < 0.5
          ? (1 - Math.sqrt(1 - Math.pow(2 * timeProgress, 2))) / 2
          : (Math.sqrt(1 - Math.pow(-2 * timeProgress + 2, 2)) + 1) / 2;
      break;

    // Elastic
    case "easeInElastic":
      easedValue =
        timeProgress === 0
          ? 0
          : timeProgress === 1
          ? 1
          : -Math.pow(2, 10 * timeProgress - 10) *
            Math.sin(((timeProgress * 10 - 10.75) * (2 * Math.PI)) / 3);
      break;
    case "easeOutElastic":
      easedValue =
        timeProgress === 0
          ? 0
          : timeProgress === 1
          ? 1
          : Math.pow(2, -10 * timeProgress) *
              Math.sin(((timeProgress * 10 - 0.75) * (2 * Math.PI)) / 3) +
            1;
      break;
    case "easeInOutElastic":
      easedValue =
        timeProgress === 0
          ? 0
          : timeProgress === 1
          ? 1
          : timeProgress < 0.5
          ? -(
              Math.pow(2, 20 * timeProgress - 10) *
              Math.sin(((20 * timeProgress - 11.125) * (2 * Math.PI)) / 4.5)
            ) / 2
          : (Math.pow(2, -20 * timeProgress + 10) *
              Math.sin(((20 * timeProgress - 11.125) * (2 * Math.PI)) / 4.5)) /
              2 +
            1;
      break;

    // Back
    case "easeInBack":
      easedValue =
        c3 * timeProgress * timeProgress * timeProgress -
        c1 * timeProgress * timeProgress;
      break;
    case "easeOutBack":
      easedValue =
        1 +
        c3 * Math.pow(timeProgress - 1, 3) +
        c1 * Math.pow(timeProgress - 1, 2);
      break;
    case "easeInOutBack":
      easedValue =
        timeProgress < 0.5
          ? (Math.pow(2 * timeProgress, 2) *
              ((c2 + 1) * 2 * timeProgress - c2)) /
            2
          : (Math.pow(2 * timeProgress - 2, 2) *
              ((c2 + 1) * (timeProgress * 2 - 2) + c2) +
              2) /
            2;
      break;

    // Bounce
    case "easeInBounce":
      easedValue = 1 - applyEasing(1 - timeProgress, "easeOutBounce");
      break;
    case "easeOutBounce":
      if (timeProgress < 1 / d1) {
        easedValue = n1 * timeProgress * timeProgress;
      } else if (timeProgress < 2 / d1) {
        easedValue = n1 * (timeProgress -= 1.5 / d1) * timeProgress + 0.75;
      } else if (timeProgress < 2.5 / d1) {
        easedValue = n1 * (timeProgress -= 2.25 / d1) * timeProgress + 0.9375;
      } else {
        easedValue =
          n1 * (timeProgress -= 2.625 / d1) * timeProgress + 0.984375;
      }
      break;
    case "easeInOutBounce":
      easedValue =
        timeProgress < 0.5
          ? (1 - applyEasing(1 - 2 * timeProgress, "easeOutBounce")) / 2
          : (1 + applyEasing(2 * timeProgress - 1, "easeOutBounce")) / 2;
      break;

    default:
      easedValue = timeProgress;
  }

  // Apply the max threshold if defined
  return applyThresholds(easedValue);
}
