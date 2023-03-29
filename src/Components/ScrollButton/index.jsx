import React from "react";
import { toElement as scrollToElement } from "../../util/scroll";
import "../../styles/CSS/ScrollButton.css";

export default ({ children, scrollTarget, ...others }) => {
  const scrollToPage = () => {
    const nextPage = document.querySelector(scrollTarget);
    if (nextPage) scrollToElement(nextPage);
  };

  return (
    <div
      className="menu__item"
      onClick={(e) => scrollToPage()}
      {...others}
      role="link"
      aria-label={scrollTarget ? "Scroll to " + scrollTarget.slice(1) : ""}
    >
      {children}
    </div>
  );
};
