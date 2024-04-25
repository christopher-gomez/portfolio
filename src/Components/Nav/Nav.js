import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/Nav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { toElement as scrollToElement } from "../../util/scroll";
import { hexToRgb } from "../../util/color";
import ScrollButton from "../ScrollButton";
import { isElementInView } from "../../util/misc";

export default (props) => {
  const [state, setState] = useState({ isSticky: false });
  const nav = useRef();

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const handleScroll = () => {
    const elInView = isElementInView(
      document.querySelector(".intro-wrapper"),
      550
    );

    if (!elInView && !stateRef.current.isSticky) {
      setState((state) => ({
        ...state,
        isSticky: true,
      }));
    } else if (elInView && stateRef.current.isSticky) {
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

  useEffect(() => {
    if (nav.current) {
      if(state.isSticky) {
        nav.current.classList.remove("fade-out-top");
        nav.current.classList.add("scrolled");
        nav.current.classList.add("sticky");
        nav.current.classList.add("fade-in-top");
      } else {
        nav.current.classList.remove("fade-in-top");
        nav.current.classList.add("fade-out-top");
      }
    }
  }, [state.isSticky]);

  const scrollToPage = (pageSelector) => {
    const nextPage = document.querySelector(pageSelector);
    scrollToElement(nextPage);
  };

  // const rgb = hexToRgb(props.color.bgColor);
  // const stickyStyles =
  //   state.isSticky || props.forceSticky
  //     ? {
  //         backgroundColor: rgb
  //           ? `rgba(${rgb.r},${rgb.g},${rgb.b},1)`
  //           : `var(--bg-color)`,
  //         color: "black",
  //       }
  //     : {
  //         backgroundColor: rgb
  //           ? `rgba(${rgb.r},${rgb.g},${rgb.b},.1)`
  //           : `var(--bg-color)`,
  //         color: "black",
  //       };
  return (
    <header>
      <nav
        role="navigation"
        className={`nav js-scroll fade-out-top`}
        ref={nav}
        // style={stickyStyles}
      >
        <div
          className="left-container"
          onClick={(e) => scrollToPage(".landing")}
        >
          <p>Christopher Gomez</p>
        </div>
        <div className="menu">
          <ScrollButton scrollTarget=".portfolio">Portfolio</ScrollButton>
          <ScrollButton scrollTarget=".about">About</ScrollButton>
        </div>
      </nav>
    </header>
  );
};
