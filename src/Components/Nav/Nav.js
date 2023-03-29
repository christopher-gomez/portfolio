import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/Nav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { toElement as scrollToElement } from "../../util/scroll";
import { hexToRgb } from "../../util/color";

export default (props) => {
  const [state, setState] = useState({ isSticky: false });
  const nav = useRef();

  const elementInView = (el) => {
    if (el == undefined) return false;
    var rect = el.getBoundingClientRect();
    return (
      rect.y + rect.height - rect.height > 0 || rect.y > window.innerHeight
    );
  };

  const handleScroll = () => {
    if (!elementInView(document.querySelector(".intro-wrapper"))) {
      setState((state) => ({
        ...state,
        isSticky: true,
      }));
    } else {
      setState((state) => ({
        ...state,
        isSticky: false,
      }));
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const stickyClass = useRef("nav");

  useEffect(() => {
    stickyClass.current = state.isSticky
      ? "scrolled fade-in-top sticky"
      : "fade-out-top";
  }, [state.isSticky]);

  const scrollToPage = (pageSelector) => {
    const nextPage = document.querySelector(pageSelector);
    scrollToElement(nextPage);
  };

  const rgb = hexToRgb(props.color.bgColor);
  const stickyStyles =
    state.isSticky || props.forceSticky
      ? {
          backgroundColor: rgb
            ? `rgba(${rgb.r},${rgb.g},${rgb.b},1)`
            : `var(--bg-color)`,
          color: "black",
        }
      : {
          backgroundColor: rgb
            ? `rgba(${rgb.r},${rgb.g},${rgb.b},.1)`
            : `var(--bg-color)`,
          color: "black",
        };
  return (
    <header>
      <nav
        className={`nav js-scroll ${stickyClass.current}`}
        ref={nav}
        style={stickyStyles}
      >
        <div
          className="left-container"
          onClick={(e) => scrollToPage(".landing")}
        >
          <p>Christopher Gomez</p>
          {/* <div
            onClick={() => props.toggleRandomTheme()}
            className="magic-wand bounce-xy"
          >
            <FontAwesomeIcon
              style={{ color: "var(--text-color)" }}
              icon={faPaintBrush}
            />
            <div className="magic-text">Color Me!</div>
          </div> */}
        </div>
        <div className="menu">
          <div
            className="menu__item"
            onClick={(e) => scrollToPage(".portfolio")}
          >
            Portfolio
          </div>
          <div className="menu__item" onClick={(e) => scrollToPage(".about")}>
            About
          </div>
        </div>
      </nav>
    </header>
  );
};
