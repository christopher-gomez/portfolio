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
import { detectLineWrap } from "../../util/text";
import Link from "../../Components/Link";
import ScrollButton from "../../Components/ScrollButton";

export default ({ drawX, eraseX, isDrawing, isErasing, color, hack }) => {
  const linkContainer = useRef(null);
  const nameContainer = useRef(null);
  const arrowContainer = useRef(null);
  const wrapperRef = useRef();
  const charContainer = useRef();
  const isInitialized = useRef(false);
  const x = useRef(0);

  // const tagline = "Creator | Engineer | Scientist".split("");

  const [state, setState] = useState({
    prevColor: null,
    curColor: null,
    isDrawing: true,
    wrapped: false,
  });

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

  useEffect(() => {
    x.current = drawX;
  }, [drawX]);

  const wrapCheckTimeout = useRef();

  const resizing = useRef(false);

  useEffect(() => {
    function checkLineWrap() {
      if (!charContainer.current) return;

      clearTimeout(wrapCheckTimeout.current);
      resizing.current = true;

      wrapCheckTimeout.current = setTimeout(() => {
        detectLineWrap(
          charContainer.current,
          () => {
            setState((s) => ({ ...s, wrapped: true }));
            console.log("wrap");
          },
          () => {
            setState((s) => ({ ...s, wrapped: false }));
            console.log("not wrap");
          }
        );
        resizing.current = false;
      }, 250);
    }

    if (charContainer.current) {
      // handles window resize events
      window.addEventListener("resize", checkLineWrap);
      checkLineWrap();
    } else {
      window.removeEventListener("resize", checkLineWrap);
    }

    return () => {
      window.removeEventListener("resize", checkLineWrap);
    };
  }, [charContainer.current]);

  return (
    <div className="landing" id="landing">
      <main>
        <div className="intro-wrapper" ref={wrapperRef}>
          <div className="intro js-scroll" ref={nameContainer}>
            <ColorCharacters
              ref={charContainer}
              style={
                !resizing.current && state.wrapped
                  ? { display: "none", ">*": { display: "none" } }
                  : {}
              }
              string={"Christopher Gomez"}
              color={(i) =>
                (() => {
                  let string = "";

                  if (!state.wrapped || resizing.current)
                    string =
                      !elementInView(wrapperRef.current, -475) || hack
                        ? "black"
                        : state.isDrawing && x.current >= 0.36 + i * 0.015
                        ? "white"
                        : "black";
                  else string = "transparent";

                  return string;
                })()
              }
            />
            <div
              style={
                !resizing.current && state.wrapped
                  ? {}
                  : { display: "none", ">*": { display: "none" } }
              }
            >
              <ColorCharacters
                // ref={charContainer}
                string={"Christopher"}
                color={(i) =>
                  (() => {
                    let string =
                      !elementInView(wrapperRef.current, -475) || hack
                        ? "black"
                        : state.isDrawing && x.current >= 0.36 + i * 0.035
                        ? "white"
                        : "black";

                    return string;
                  })()
                }
              />
              <ColorCharacters
                // ref={charContainer}
                string={"Gomez"}
                color={(i) =>
                  (() => {
                    let string =
                      !elementInView(wrapperRef.current, -475) || hack
                        ? "black"
                        : state.isDrawing && x.current >= 0.4 + i * 0.035
                        ? "white"
                        : "black";

                    return string;
                  })()
                }
              />
            </div>

            <div className="menu">
              <ScrollButton scrollTarget=".portfolio">
                <ColorCharacters
                  string={"Portfolio"}
                  color={(i) =>
                    (() => {
                      return !elementInView(wrapperRef.current, -475) || hack
                        ? "black"
                        : state.isDrawing && x.current >= 0.4 + i * 0.015
                        ? "white"
                        : "black";
                    })()
                  }
                />
              </ScrollButton>
              <ScrollButton scrollTarget=".about">
                <ColorCharacters
                  string={"About"}
                  color={(i) =>
                    (() => {
                      return !elementInView(wrapperRef.current, -475) || hack
                        ? "black"
                        : state.isDrawing && x.current >= 0.5 + i * 0.015
                        ? "white"
                        : "black";
                    })()
                  }
                />
              </ScrollButton>
            </div>
            {/* <GlowingText delay={1000} letters={"Christopher Gomez".split("")} /> */}
          </div>
          {/* <div className='tagline'>
              <GlowingText delay={1000} letters={tagline}/>
            </div> */}
          <div className="social animate-icons js-scroll" ref={linkContainer}>
            <Link newTab href="https://github.com/christopher-gomez">
              <FontAwesomeIcon
                style={{
                  transition: "color .25s ease-out",
                  color:
                    !elementInView(wrapperRef.current, -475) || hack
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
            </Link>
            <Link
              newTab
              href="https://www.linkedin.com/in/christopher-gomez-8489a7186/"
            >
              <FontAwesomeIcon
                style={{
                  transition: "color .25s ease-out",
                  color:
                    !elementInView(wrapperRef.current, -475) || hack
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
            </Link>
            <Link newTab href="https://codepen.io/christophergomez">
              <FontAwesomeIcon
                style={{
                  transition: "color .25s ease-out",
                  color:
                    !elementInView(wrapperRef.current, -475) || hack
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
            </Link>
          </div>
        </div>
      </main>
      <span className="js-scroll" style={{ zIndex: 1 }} ref={arrowContainer}>
        <ScrollArrow to=".portfolio" />
      </span>
    </div>
  );
};
