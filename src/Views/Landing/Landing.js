import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // faGithub,
  // faLinkedin,
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
import { isElementInView } from "../../util/misc";
import { useIntersectionObserver } from "../../util/IntersectionObserver";

export default ({
  drawX,
  eraseX,
  isDrawing,
  isErasing,
  color,
  hack,
  isZenMode,
  loaded,
  onIntroComplete,
}) => {
  // const linkContainer = useRef(null);
  const nameContainer = useRef(null);
  const arrowContainer = useRef(null);
  const wrapperRef = useRef();
  const charContainer = useRef();
  const x = useRef(0);

  // const tagline = "Creator | Engineer | Scientist".split("");

  const [state, setState] = useState({
    prevColor: null,
    curColor: null,
    isDrawing: true,
    wrapped: false,
  });

  const displayScrollElement = (
    element,
    transitionAnim = "fade-in-bottom",
    shouldLog = false
  ) => {
    if (!element) return;

    if (shouldLog) console.log("displaying element with anim", transitionAnim);

    element.classList.remove("fade-out-shrink");
    element.classList.remove("fade-out-top");
    element.classList.remove("fade-out-bottom");
    element.classList.add("scrolled");
    element.classList.add(transitionAnim);
  };

  const hideScrollElement = (
    element,
    transitionAnim = "fade-out-top",
    shouldLog = false
  ) => {
    if (!element) return;

    if (shouldLog) console.log("hiding element with anim", transitionAnim);

    element.classList.remove("fade-in-grow");
    element.classList.remove("fade-in-bottom");
    element.classList.remove("fade-in-top");
    // element.classList.remove("scrolled");
    element.classList.add(transitionAnim);
  };

  const [elementsHidden, setElementsHidden] = useState(true);
  const elementsHiddenRef = useRef(false);

  useEffect(() => {
    elementsHiddenRef.current = elementsHidden;
  }, [elementsHidden]);

  const handleVisible = () => {
    if (!loaded) return;

    setElementsHidden(false);
    displayScrollElement(nameContainer.current);
    displayScrollElement(arrowContainer.current, "fade-in-grow");
    wrapperRef.current.classList.remove("hidden-bg");
  };

  const handleHidden = () => {
    if (!loaded) return;

    _onIntroComplete();

    setElementsHidden(true);
    hideScrollElement(nameContainer.current);
    hideScrollElement(arrowContainer.current, "fade-out-shrink");
    wrapperRef.current.classList.add("hidden-bg");
  };

  useIntersectionObserver(wrapperRef, handleVisible, handleHidden, 0.99, null, -120);

  useEffect(() => {
    return () => {
      clearTimeout(arrowBounceTimeout.current);
      clearTimeout(wrapCheckTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (loaded) handleVisible();
  }, [loaded]);

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
          },
          () => {
            setState((s) => ({ ...s, wrapped: false }));
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

  const [shouldArrowBounce, setShouldArrowBounce] = useState(false);
  const arrowBounceTimeout = useRef();

  const [introStarted, setIntroStarted] = useState(false);

  const [sIntroComplete, setIntroComplete] = useState(false);
  const introComplete = useRef(false);

  useEffect(() => {
    introComplete.current = sIntroComplete;
  }, [sIntroComplete]);

  const _onIntroComplete = () => {
    if (!introComplete.current) {
      // introComplete.current = true;
      setIntroComplete(true);
      if (onIntroComplete) onIntroComplete();

      if (wrapperRef.current) {
        wrapperRef.current.classList.remove("no-blur");
      }
    }
  };

  return (
    <div className="landing" id="landing">
      <main id="intro-wrapper-container">
        <div
          className={`intro-wrapper blur-container no-blur no-border ${
            !introStarted ? "hidden-bg" : ""
          } ${isZenMode ? "hidden-bg" : ""}`}
          ref={wrapperRef}
        >
          <div
            className="js-scroll"
            ref={nameContainer}
            onAnimationStart={(e) => {
              // console.log("animation start", e.target);
              setIntroStarted(true);
            }}
            onAnimationEnd={(e) => {
              // console.log("animation end", e.target);

              _onIntroComplete();
            }}
          >
            <div className="intro">
              <div style={{ paddingBottom: ".25em" }}>
                <ColorCharacters
                  ref={charContainer}
                  style={
                    !resizing.current && state.wrapped
                      ? { display: "none", ">*": { display: "none" } }
                      : { fontWeight: "bold" }
                  }
                  string={"Christopher Gomez"}
                  className="Outlined-Text"
                  color={(i) => "white"}
                />
                <div
                  style={
                    !resizing.current && state.wrapped
                      ? { fontWeight: "bold" }
                      : { display: "none", ">*": { display: "none" } }
                  }
                >
                  <ColorCharacters
                    // ref={charContainer}
                    string={"Christopher"}
                    className="Outlined-Text"
                    color={(i) => "white"}
                  />
                  <ColorCharacters
                    // ref={charContainer}
                    string={"Gomez"}
                    className="Outlined-Text"
                    color={(i) => "white"}
                  />
                </div>
              </div>
              <div className="menu">
                <ScrollButton scrollTarget=".portfolio">
                  <ColorCharacters
                    string={"Portfolio"}
                    color={(i) => "white"}
                  />
                </ScrollButton>
                <ScrollButton scrollTarget=".about">
                  <ColorCharacters string={"About"} color={(i) => "white"} />
                </ScrollButton>
              </div>
              {/* <GlowingText delay={1000} letters={"Christopher Gomez".split("")} /> */}
            </div>
            {/* <div className='tagline'>
              <GlowingText delay={1000} letters={tagline}/>
            </div> */}
            <div className="social animate-icons">
              <Link newTab href="https://github.com/christopher-gomez">
                <FontAwesomeIcon
                  style={{
                    // transition: "color .25s ease-out",
                    color: "white",
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
                    // transition: "color .25s ease-out",
                    color: "white",
                  }}
                  icon={faLinkedinIn}
                />
              </Link>
              <Link newTab href="https://codepen.io/christophergomez">
                <FontAwesomeIcon
                  style={{
                    // transition: "color .25s ease-out",
                    color: "white",
                  }}
                  icon={faCodepen}
                />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <span
        className="js-scroll"
        style={{ zIndex: 1 }}
        ref={arrowContainer}
        onAnimationStart={(e) => {
          // console.log("animation start", e);
          clearTimeout(arrowBounceTimeout.current);
          setShouldArrowBounce(false);
        }}
        onAnimationEnd={(e) => {
          // console.log("animation end", e);

          arrowBounceTimeout.current = setTimeout(() => {
            setShouldArrowBounce(true);
          }, 1000);
        }}
        onPointerEnter={() => {
          setShouldArrowBounce(false);
        }}
        onPointerLeave={() => {
          setShouldArrowBounce(true);
        }}
      >
        <ScrollArrow to=".portfolio" shouldBounce={shouldArrowBounce} />
      </span>
    </div>
  );
};
