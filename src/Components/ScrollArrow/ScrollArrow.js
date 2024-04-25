import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { toElement as scrollToElement } from "../../util/scroll";
import "../../styles/CSS/ScrollArrow.css";

export default ({ to, text, prev, shouldBounce = true }) => {
  const [opacity, setOpacity] = useState(.5);
  const scrollToNext = () => {
    const element = document.querySelector(to);
    scrollToElement(element);
  };
  return (
    <div className="scroll">
      <div
        className={`arrow ${shouldBounce ? "bounce" : ""}`}
        onAnimationStart={(e) => e.stopPropagation()}
        onAnimationEnd={(e) => e.stopPropagation()}
      >
        {text && <div className="scroll-text">{text}</div>}

        {prev ? (
          <FontAwesomeIcon
            style={{ color: "white", opacity: opacity }}
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
            style={{ color: 'white', opacity: opacity }}
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
