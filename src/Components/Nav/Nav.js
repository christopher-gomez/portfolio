import React, { useEffect, useRef } from "react";
import "../../styles/CSS/Nav.css";
import { toElement as scrollToElement } from "../../util/scroll";
import ScrollButton from "../ScrollButton";
import { useIntersectionObserver } from "../../util/IntersectionObserver";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

export default ({ introComplete, modalOpen, onSetModalClosed }) => {
  const nav = useRef();

  const introRef = useRef();
  const introContainerRef = useRef();

  const introCompleteRef = useRef(false);

  useEffect(() => {
    isVisible.current = false;
  }, [modalOpen]);

  useEffect(() => {
    introCompleteRef.current = introComplete;
  }, [introComplete]);

  const isVisible = useRef(false);

  const handleVisible = () => {
    if (!nav.current) return;

    console.log('intro ref visible');

    nav.current.classList.remove("fade-in-top");
    nav.current.classList.add("fade-out-top-nav");
    isVisible.current = true;
  };

  const handleHidden = () => {
    if (!nav.current) return;

    console.log('intro ref hidden');

    nav.current.classList.remove("fade-out-top-nav");
    nav.current.classList.add("scrolled");
    nav.current.classList.add("sticky");
    nav.current.classList.add("fade-in-top");
    isVisible.current = false;
  };

  useIntersectionObserver(
    introRef,
    handleVisible,
    handleHidden,
    0.99,
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
        className={`nav js-scroll nav-start ${modalOpen ? "modal-open" : ""}`}
        onAnimationEnd={() => {
          if (nav.current) {
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
          {modalOpen ? (
            <>
              <IconButton
                onClick={() => {
                  onSetModalClosed();
                }}
                sx={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <Close sx={{ color: "white !important" }} />
              </IconButton>
            </>
          ) : (
            <>
              <ScrollButton scrollTarget=".portfolio">Portfolio</ScrollButton>
              <ScrollButton scrollTarget=".about">About</ScrollButton>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
