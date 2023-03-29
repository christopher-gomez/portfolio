import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { toElement as scrollToElement } from "../../util/scroll";
import "../../styles/CSS/ScrollArrow.css";

export default ({ to, text, prev }) => {
  const [opacity, setOpacity] = useState(0.5);
  const scrollToNext = () => {
    const element = document.querySelector(to);
    scrollToElement(element);
  };
  return (
    <div className="scroll">
      <div className="arrow bounce">
        {text && <div className="scroll-text">{text}</div>}

        {prev ? (
          <FontAwesomeIcon
            style={{ color: "var(--text-color)", opacity: opacity }}
            icon={faChevronUp}
            size="2x"
            onClick={() => scrollToNext()}
            onPointerEnter={() => {
              setOpacity(1);
            }}
            onPointerLeave={() => {
              setOpacity(0.5);
            }}
          />
        ) : (
          <FontAwesomeIcon
            style={{ color: "var(--text-color)", opacity: opacity }}
            icon={faChevronDown}
            size="2x"
            onClick={() => scrollToNext()}
            onPointerEnter={() => {
              setOpacity(1);
            }}
            onPointerLeave={() => {
              setOpacity(0.5);
            }}
          />
        )}
      </div>
    </div>
  );
};
