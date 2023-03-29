const isSmoothScrollSupported = ((document || {}).documentElement || {}).style
  ? "scrollBehavior" in document.documentElement.style
  : false;

export const toTop = () => {
  if (isSmoothScrollSupported) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  } else {
    window.scrollTo(0, 0);
  }
};

export const to = (ycoordinate) => {
  if (isSmoothScrollSupported) {
    window.scroll({
      top: ycoordinate,
      left: 0,
      behavior: "smooth",
    });
  } else {
    window.scrollTo(0, ycoordinate);
  }
};

export const toElement = (element) => {
  if (element) {
    if (isSmoothScrollSupported) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      element.scrollIntoView();
    }
  }
};

var calcTop = function (rect, win) {
  return Math.max(rect.height + rect.y, 0) / rect.height;
};

var calcBottom = function (rect, win) {
  return Math.max(win.height - rect.y, 0) / rect.height;
};

export const calcElemScrollY = (selector) => {
  let element = document.querySelector(selector);

  if (!element) element = document.querySelector("#root");

  var win = { height: window.innerHeight };
  var rect = element.getBoundingClientRect();

  var obj = {
    element: element,
    percentage:
      rect.y < 0
        ? calcTop(rect, win)
        : rect.y + rect.height > win.height
        ? calcBottom(rect, win)
        : 1,
    location:
      rect.y < 0
        ? "top"
        : rect.y + rect.height > win.height
        ? "bottom"
        : "middle",
  };

  return obj;
};

export default {
  toTop,
  to,
  toElement,
  calcElemScrollY,
};
