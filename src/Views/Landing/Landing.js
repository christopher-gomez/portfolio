import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faCodepen,
  faLinkedinIn,
  faGithubSquare,
} from "@fortawesome/free-brands-svg-icons";
import "../../styles/CSS/Landing.css";
import ScrollArrow from "../../Components/ScrollArrow/ScrollArrow";
import GlowingText from "../../Components/GlowingText/GlowingText.js";

export default ({ drawX, eraseX, isDrawing, isErasing, color }) => {
  const linkContainer = useRef(null);
  const tagline = "Creator | Engineer | Scientist".split("");

  const [state, setState] = useState({
    prevColor: null,
    curColor: null,
    isDrawing,
  });

  useEffect(() => {
    setState((state) => ({
      ...state,
      prevColor: state.curColor,
      curColor: color,
    }));
  }, [color]);

  useEffect(() => {
    setState((state) => ({ ...state, isDrawing }));
  }, [isDrawing]);

  const elementInView = (el, percentageScroll = -250) => {
    if (el == undefined) return false;
    const elementTop = el.getBoundingClientRect().top;

    return elementTop >= percentageScroll;
  };

  const displayScrollElement = (element) => {
    element.classList.remove("fade-out-bottom");
    element.classList.add("scrolled");
    element.classList.add("fade-in-bottom");
  };

  const hideScrollElement = (element) => {
    element.classList.remove("fade-in-bottom");
    element.classList.remove("scrolled");
    element.classList.add("fade-out-top");
  };

  useEffect(() => {
    const handleScrollAnimation = (e) => {
      if (elementInView(document.querySelector(".landing"))) {
        displayScrollElement(linkContainer.current);
      } else {
        hideScrollElement(linkContainer.current);
      }
    };

    const handleResize = () => {
      setState((state) => ({ ...state, prevColor: null, isDrawing: true }));
    };

    if (linkContainer.current) {
      window.addEventListener("scroll", handleScrollAnimation);
      window.addEventListener("resize", handleResize);
      displayScrollElement(linkContainer.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScrollAnimation);
      window.removeEventListener("resize", handleResize);
    };
  }, [linkContainer]);

  return (
    <div className="landing" id="landing">
      <main>
        <div className="wrapper">
          <div className="intro">
            {"Christopher Gomez".split("").map((letter, i) => {
              return (
                <span
                  style={{
                    color: !elementInView(
                      document.querySelector(".landing"),
                      -100
                    )
                      ? "var(--text-color)"
                      : isErasing && eraseX <= 0.4 +(i * .5)
                      ? "var(--bg-color)"
                      : isDrawing && drawX >= 0.5 +(i * .5)
                      ? "var(--bg-color)"
                      : isDrawing
                      ? state.curColor.textColor
                      : "var(--bg-color)",
                  }}
                >
                  {letter}
                </span>
              );
            })}
            {/* <GlowingText delay={1000} letters={"Christopher Gomez".split("")} /> */}
          </div>
          {/* <div className='tagline'>
              <GlowingText delay={1000} letters={tagline}/>
            </div> */}
          <div className="social animate-icons js-scroll" ref={linkContainer}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/christophgomez"
            >
              <FontAwesomeIcon
                style={{
                  transition: "color .25s ease-out",
                  color: !elementInView(
                    document.querySelector(".landing"),
                    -100
                  )
                    ? "var(--text-color)"
                    : isErasing && eraseX <= 0.415
                    ? "var(--bg-color)"
                    : isDrawing && drawX >= 0.45
                    ? "var(--bg-color)"
                    : isDrawing && state.prevColor
                    ? state.prevColor.textColor
                    : isDrawing
                    ? state.curColor.textColor
                    : "var(--bg-color)",
                }}
                icon={faGithubSquare}
              />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.linkedin.com/in/christopher-gomez-8489a7186/"
            >
              <FontAwesomeIcon
                style={{
                  transition: "color .25s ease-out",
                  color: !elementInView(
                    document.querySelector(".landing"),
                    -100
                  )
                    ? "var(--text-color)"
                    : isErasing && eraseX <= 0.46
                    ? "var(--bg-color)"
                    : isDrawing && drawX >= 0.5
                    ? "var(--bg-color)"
                    : isDrawing && state.prevColor
                    ? state.prevColor.textColor
                    : isDrawing
                    ? state.curColor.textColor
                    : "var(--bg-color)",
                }}
                icon={faLinkedinIn}
              />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://codepen.io/christophergomez"
            >
              <FontAwesomeIcon
                style={{
                  transition: "color .25s ease-out",
                  color: !elementInView(
                    document.querySelector(".landing"),
                    -100
                  )
                    ? "var(--text-color)"
                    : isErasing && eraseX <= 0.515
                    ? "var(--bg-color)"
                    : isDrawing && drawX >= 0.54
                    ? "var(--bg-color)"
                    : isDrawing && state.prevColor
                    ? state.prevColor.textColor
                    : isDrawing
                    ? state.curColor.textColor
                    : "var(--bg-color)",
                }}
                icon={faCodepen}
              />
            </a>
          </div>
        </div>
      </main>
      <ScrollArrow to=".portfolio" />
    </div>
  );
};
