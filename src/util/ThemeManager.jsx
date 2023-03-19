import React, { useEffect, useState } from "react";

export default ({ children }) => {
  const [state, setState] = useState({
    color: null,
  });

  useEffect(() => {
    toggleRandomTheme(["her-red", "vivid-blue", "orange", "dark-slate-blue"]);
  }, []);

  const toggleRandomTheme = (filter) => {
    let themes = [
      // her red
      {
        name: "her-red",
        textColor: "#B23D2B",
        bgColor: "#fff",
        altBg: "#2C303B",
        altText: "#fff",
      },
      //   vivid blue
      {
        name: "vivid-blue",
        textColor: "#0074D9",
        bgColor: "#fff",
        altBg: "#2C303B",
        altText: "#fff",
      },
      //   seafoam green
      {
        name: "sea-foam-green",
        textColor: "#415554",
        bgColor: "#fff",
        altBg: "#2C303B",
        altText: "#fff",
      },
      //   dark slate blue
      {
        name: "dark-slate-blue",
        textColor: "#2C303B",
        bgColor: "#fff",
        altBg: "#2C303B",
        altText: "#fff",
      },
      // //   orange
      // {
      //   name: "orange",
      //   textColor: "#FF851B",
      //   bgColor: "#fff",
      //   altBg: "#FF851B",
      //   altText: "#fff",
      // },
      //   light blue
      //   {
      //     name: "light-blue",
      //     textColor: "#5EA9BE",
      //     bgColor: "#fff",
      //     altBg: "#5EA9BE",
      //     altText: "#fff",
      //   },
      //   facebook blue
    //   {
    //     name: "facebook-blue",
    //     textColor: "#00537D",
    //     bgColor: "#fff",
    //     altBg: "#00537D",
    //     altText: "#fff",
    //   },
    ];

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

    let root = document.documentElement;
    root.style.setProperty("--text-color", color.textColor);
    root.style.setProperty("--bg-color", color.bgColor);
    root.style.setProperty("--alt-bg", color.altBg);
    root.style.setProperty("--alt-text", color.altText);

    setState((state) => ({ ...state, color: color }));
    //root.style.setProperty('--highlight-color', highlightColor);
  };

  if (!state.color) return null;

  const childrenWithProps = React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      toggleRandomTheme,
      color: state.color,
    });
  });

  return <>{childrenWithProps}</>;
};
