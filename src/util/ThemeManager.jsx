import React, { useEffect, useState } from "react";
import themes from "../styles/theme";

export default ({ children }) => {
  const [state, setState] = useState({
    color: null,
  });

  useEffect(() => {
    // toggleRandomTheme(["dark-slate-blue"]);
  }, []);

  useEffect(() => {
    if (state.color === null || state.color === undefined) {
      toggleRandomTheme();
      return;
    }

    const color = state.color;

    let root = document.documentElement;
    root.style.setProperty("--text-color", color.textColor);
    root.style.setProperty("--bg-color", color.bgColor);
    root.style.setProperty("--alt-bg", color.altBg);
    root.style.setProperty("--alt-text", color.altText);
  }, [state.color]);

  const toggleRandomTheme = (filter) => {
    let t;
    if (filter !== undefined) {
      t = themes.filter((x) => {
        return (
          filter.includes(x.name) ||
          filter.includes(x.textColor) ||
          filter.includes(x.altBg) ||
          filter.includes(x.altText) ||
          filter.includes(x.bgColor)
        );
      });
    } else {
      t = themes;
    }

    if (t.length == 0) return;

    if (t.length == 1 && state.color !== null) {
      // this triggers an effect that re-selects and re-renders with the same theme, in case any
      // thing like animations are waiting on a new color
      setState((s) => ({ ...s, color: null }));
      return;
    }

    if (t.length == 1) {
      setState((state) => ({ ...state, color: t[0] }));
      return;
    }

    let color = t[Math.floor(Math.random() * t.length)];

    if (state.color !== null) {
      while (
        color.textColor === state.color.textColor &&
        color.bgColor === state.color.bgColor &&
        t.length > 1
      ) {
        color = t[Math.floor(Math.random() * t.length)];
      }
    }

    setState((state) => ({ ...state, color: color }));
    //root.style.setProperty('--highlight-color', highlightColor);
  };

  if (!state.color) return null;

  const childrenWithProps = React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      // toggleRandomTheme,
      color: state.color,
    });
  });

  return <>{childrenWithProps}</>;
};
