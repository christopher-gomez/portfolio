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

export default ({
  drawX,
  eraseX,
  isDrawing,
  isErasing,
  color,
  hack,
  isZenMode,
}) => {
  const linkContainer = useRef(null);
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
    element.classList.remove("scrolled");
    element.classList.add(transitionAnim);
  };

  const [elementsHidden, setElementsHidden] = useState(true);
  const elementsHiddenRef = useRef(false);

  useEffect(() => {
    elementsHiddenRef.current = elementsHidden;
  }, [elementsHidden]);

  const hasShown = useRef(false);
  useEffect(() => {
    let fadeInTimeout;
    const handleScrollAnimation = (e) => {
      clearTimeout(fadeInTimeout);
      const elInView = isElementInView(wrapperRef.current, 550);

      if (elementsHiddenRef.current) hasShown.current = true;

      if (elInView && elementsHiddenRef.current) {
        setElementsHidden(false);
        displayScrollElement(linkContainer.current);
        displayScrollElement(nameContainer.current);
        displayScrollElement(arrowContainer.current, "fade-in-grow", true);
        wrapperRef.current.classList.remove("hidden");
      } else if (!elInView && !elementsHiddenRef.current) {
        setElementsHidden(true);
        hideScrollElement(linkContainer.current);
        hideScrollElement(nameContainer.current);
        hideScrollElement(arrowContainer.current, "fade-out-shrink", true);
        wrapperRef.current.classList.add("hidden");
      }

      // if (isElementInView(wrapperRef.current)) {
      //   if (wrapperRef.current) {
      //     wrapperRef.current.classList.add("blurred");
      //   }

      //   // displayScrollElement(arrowContainer.current);
      // } else {
      //   if (wrapperRef.current) {
      //     wrapperRef.current.classList.remove("blurred");
      //   }

      //   // hideScrollElement(arrowContainer.current);
      // }
    };

    // const handleResize = () => {
    //   setState((state) => ({ ...state, prevColor: null, isDrawing: true }));
    // };

    // if (linkContainer.current) {
    //   setTimeout(() => {
    //     displayScrollElement(linkContainer.current);
    //   }, 500);
    // }

    // if (nameContainer.current) {
    //   setTimeout(() => {
    //     displayScrollElement(nameContainer.current);
    //   }, 500);
    // }

    // if (arrowContainer.current) {
    //   setTimeout(() => {
    //     displayScrollElement(arrowContainer.current);
    //   }, 500);
    // }

    window.addEventListener("scroll", handleScrollAnimation);
    // window.addEventListener("resize", handleResize);

    fadeInTimeout = setTimeout(() => {
      handleScrollAnimation();
    }, 1000);
    // handleResize();

    return () => {
      clearTimeout(fadeInTimeout);
      window.removeEventListener("scroll", handleScrollAnimation);
      clearTimeout(arrowBounceTimeout.current);
      clearTimeout(wrapCheckTimeout.current);
      // window.removeEventListener("resize", handleResize);
    };
  }, []);

  // useEffect(() => {
  //   setState((state) => ({
  //     ...state,
  //     prevColor: state.curColor,
  //     curColor: color,
  //   }));
  // }, [color]);

  // useEffect(() => {
  //   setState((state) => ({ ...state, isDrawing }));
  // }, [isDrawing]);

  // useEffect(() => {
  //   x.current = drawX;
  // }, [drawX]);

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

  return (
    <div className="landing" id="landing">
      <main>
        <div
          className={`intro-wrapper blur-container no-border ${
            elementsHidden ? "hidden-complete" : ""
          } ${isZenMode ? "hidden-bg" : ""}`}
          ref={wrapperRef}
        >
          <div className="intro js-scroll" ref={nameContainer}>
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

            <div className="menu">
              <ScrollButton scrollTarget=".portfolio">
                <ColorCharacters string={"Portfolio"} color={(i) => "white"} />
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
          <div className="social animate-icons js-scroll" ref={linkContainer}>
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
      >
        <ScrollArrow to=".portfolio" shouldBounce={shouldArrowBounce} />
      </span>
    </div>
  );
};
