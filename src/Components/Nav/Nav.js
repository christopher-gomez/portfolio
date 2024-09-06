import React, { useEffect, useRef } from "react";
import "../../styles/CSS/Nav.css";
import { toElement as scrollToElement } from "../../util/scroll";
import ScrollButton from "../ScrollButton";
import { useIntersectionObserver } from "../../util/IntersectionObserver";

export default ({ introComplete }) => {
  const nav = useRef();

  const introRef = useRef();
  const introContainerRef = useRef();

  const introCompleteRef = useRef(false);

  useEffect(() => {
    introCompleteRef.current = introComplete;
  }, [introComplete]);

  const handleVisible = () => {
    if (!nav.current) return;

    nav.current.classList.remove("fade-in-top");
    nav.current.classList.add("fade-out-top-nav");
  };

  const handleHidden = () => {
    if (!nav.current) return;

    nav.current.classList.remove("fade-out-top-nav");
    nav.current.classList.add("scrolled");
    nav.current.classList.add("sticky");
    nav.current.classList.add("fade-in-top");
  };

  useIntersectionObserver(
    introRef,
    handleVisible,
    handleHidden,
    0.99,
    null,
    -120
  );

  useEffect(() => {
    // window.addEventListener("scroll", handleScroll);

    introRef.current = document.querySelector(".intro-wrapper");
    introContainerRef.current = document.querySelector(
      "intro-wrapper-container"
    );

    return () => {
      // window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToPage = (pageSelector) => {
    const nextPage = document.querySelector(pageSelector);
    scrollToElement(nextPage);
  };

  return (
    <header>
      <nav
        role="navigation"
        className={`nav js-scroll nav-start`}
        onAnimationEnd={() => {
          if(nav.current) {
            nav.current.classList.remove("nav-start");
          }
        }}
        ref={nav}
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
