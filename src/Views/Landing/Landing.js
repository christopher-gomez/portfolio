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
import ColorCharacters from "../../Components/GlowingText/ColorCharacters";

export default ({ drawX, eraseX, isDrawing, isErasing, color, hack }) => {
  const linkContainer = useRef(null);
  const nameContainer = useRef(null);
  const arrowContainer = useRef(null);
  const tagline = "Creator | Engineer | Scientist".split("");

  const [state, setState] = useState({
    prevColor: null,
    curColor: null,
    isDrawing: true,
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

  const x = useRef(0);
  useEffect(() => {
    x.current = drawX;
  }, [drawX]);

  const elementInView = (el, percentageScroll = undefined) => {
    if (el == undefined) return false;
    var rect = el.getBoundingClientRect();
    return (
      rect.y + rect.height + (percentageScroll ?? -rect.height) > 0 ||
      rect.y - (percentageScroll ?? 0) > window.innerHeight
    );
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

  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    const handleScrollAnimation = (e) => {
      if (elementInView(wrapperRef.current)) {
        displayScrollElement(linkContainer.current);
        displayScrollElement(nameContainer.current);
      } else {
        hideScrollElement(linkContainer.current);
        hideScrollElement(nameContainer.current);
      }

      if (elementInView(wrapperRef.current)) {
        if (wrapperRef.current) {
          wrapperRef.current.classList.add("blurred");
        }

        displayScrollElement(arrowContainer.current);
      } else {
        if (wrapperRef.current) {
          wrapperRef.current.classList.remove("blurred");
        }

        hideScrollElement(arrowContainer.current);
      }
    };

    const handleResize = () => {
      setState((state) => ({ ...state, prevColor: null, isDrawing: true }));
    };

    if (linkContainer.current) {
      setTimeout(() => {
        displayScrollElement(linkContainer.current);
      }, 500);
    }

    if (nameContainer.current) {
      setTimeout(() => {
        displayScrollElement(nameContainer.current);
      }, 500);
    }

    if (arrowContainer.current) {
      setTimeout(() => {
        displayScrollElement(arrowContainer.current);
      }, 500);
    }

    window.removeEventListener("scroll", handleScrollAnimation);
    window.removeEventListener("resize", handleResize);

    window.addEventListener("scroll", handleScrollAnimation);
    window.addEventListener("resize", handleResize);
    isInitialized.current = true;

    return () => {
      window.removeEventListener("scroll", handleScrollAnimation);
      window.removeEventListener("resize", handleResize);
      isInitialized.current = false;
    };
  }, []);

  const wrapperRef = useRef();

  return (
    <div className="landing" id="landing">
      <main>
        <div className="intro-wrapper" ref={wrapperRef}>
          <div className="intro js-scroll" ref={nameContainer}>
            <ColorCharacters
              string={"Christopher Gomez"}
              color={(i) =>
                (() => {
                  let string =
                    !elementInView(wrapperRef.current, -350) || hack
                      ? "black"
                      : state.isDrawing && x.current >= 0.36 + i * 0.015
                      ? "white"
                      : "black";

                  return string;
                })()
              }
            />
            <div className="menu">
              <div
                className="menu__item"
                onClick={(e) => this.scrollToPage(".portfolio")}
              >
                <ColorCharacters
                  string={"Portfolio"}
                  color={(i) =>
                    (() => {
                      return !elementInView(wrapperRef.current, -300) || hack
                        ? "black"
                        : state.isDrawing && x.current >= 0.4 + i * 0.015
                        ? "white"
                        : "black";
                    })()
                  }
                />
              </div>
              <div
                className="menu__item"
                onClick={(e) => this.scrollToPage(".about")}
              >
                <ColorCharacters
                  string={"About"}
                  color={(i) =>
                    (() => {
                      return !elementInView(wrapperRef.current, -300) || hack
                        ? "black"
                        : state.isDrawing && x.current >= 0.5 + i * 0.015
                        ? "white"
                        : "black";
                    })()
                  }
                />{" "}
              </div>
            </div>
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
                  color:
                    !elementInView(wrapperRef.current, -250) || hack
                      ? "black"
                      : isErasing && eraseX <= 0.415
                      ? "white"
                      : isDrawing && drawX >= 0.45
                      ? "white"
                      : isDrawing
                      ? "black"
                      : "white",
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
                  color:
                    !elementInView(wrapperRef.current, -250) || hack
                      ? "black"
                      : isErasing && eraseX <= 0.46
                      ? "white"
                      : isDrawing && drawX >= 0.5
                      ? "white"
                      : isDrawing
                      ? "black"
                      : "white",
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
                  color:
                    !elementInView(wrapperRef.current, -250) || hack
                      ? "black"
                      : isErasing && eraseX <= 0.515
                      ? "white"
                      : isDrawing && drawX >= 0.54
                      ? "white"
                      : isDrawing
                      ? "black"
                      : "white",
                }}
                icon={faCodepen}
              />
            </a>
          </div>
        </div>
      </main>
      <span className="js-scroll" style={{ zIndex: 1 }} ref={arrowContainer}>
        <ScrollArrow to=".portfolio" />
      </span>
    </div>
  );
};
