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
import { Button, Typography } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";

const WebGLChecker = ({ onContinued, onRenderChoice, loaded }) => {
  const [shouldContinue, setShouldContinue] = useState(false);

  const [value, setValue] = useState(null);
  const [dontShowAgain, setDontShowAgain] = useState(null);

  const didntSeeRef = useRef(false);

  useEffect(() => {
    if (dontShowAgain === null) return;

    localStorage.setItem("skip-render-check", dontShowAgain);
  }, [dontShowAgain]);

  useEffect(() => {
    if (value === null) return;

    localStorage.setItem("render-engine", value);
    if (onRenderChoice) onRenderChoice(value);
  }, [value]);

  useEffect(() => {
    // check if device is webgl compatible
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
    const isWebGL = !!gl;

    if (localStorage.getItem("render-engine")) {
      console.log(
        'localStorage.getItem("render-engine")',
        localStorage.getItem("render-engine")
      );
      setValue(localStorage.getItem("render-engine"));
    } else {
      setValue("webgl");
    }

    if (localStorage.getItem("skip-render-check") === "true" || !isWebGL) {
      didntSeeRef.current = true;
      setDontShowAgain(true);
      setShouldContinue(true);
    } else {
      setDontShowAgain(false);
    }
  }, []);

  const [outFinished, setOutFinished] = useState(false);

  useEffect(() => {
    if (shouldContinue && (didntSeeRef.current || outFinished)) {
      if (onContinued) onContinued();
    }
  }, [shouldContinue, outFinished]);

  return (
    <>
      <div
        className={`js-scroll ${
          loaded && !shouldContinue ? "fade-in" : ""
        } ${shouldContinue && !didntSeeRef.current ? "fade-out-top" : ""}`}
        onAnimationEnd={() => {
          if (shouldContinue) {
            window.setTimeout(() => {
              setOutFinished(true);
            }, 500)
          }
        }}
      >
        <div className="intro" style={{ paddingBottom: "0" }}>
          <div style={{ paddingBottom: ".25em" }}>
            <Typography sx={{ textAlign: "center" }} variant="h4">
              Select a Rendering Engine
            </Typography>
          </div>
          <div
            className="menu"
            style={{
              display: "flex",
              flexFlow: "column",
              alignContent: "center",
              justifyContent: "center",
              alignItems: "center",
              justifyItems: "center",
            }}
          >
            <FormControl>
              <RadioGroup
                sx={{
                  padding: "0 1.5em",
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  justifyItems: "center",
                }}
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                <FormControlLabel
                  value="webgl"
                  control={<Radio />}
                  label="ThreeJS WebGL"
                />
                <FormControlLabel
                  value="canvas"
                  control={<Radio />}
                  label="HTML5 2D Canvas"
                />
              </RadioGroup>
            </FormControl>
            <Button
              variant="contained"
              sx={{
                m: "1em 0",
                backgroundColor: "white",
                color: "black",
                border: "1px solid black",
                ">*": { color: "black !important" },
              }}
              onClick={() => {
                setShouldContinue(true);
              }}
            >
              <Typography variant="button">Continue</Typography>
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={dontShowAgain}
                  onChange={(_, checked) => {
                    setDontShowAgain(checked);
                  }}
                />
              }
              label={
                <Typography variant="caption">Don't show this again</Typography>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

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
  onRenderChoice,
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

  const handleVisible = () => {
    if (!loaded) return;

    displayScrollElement(nameContainer.current);
    displayScrollElement(arrowContainer.current, "fade-in-grow");
    wrapperRef.current.classList.remove("hidden-bg");
  };

  const handleHidden = () => {
    if (!loaded) return;

    _onIntroComplete();

    hideScrollElement(nameContainer.current);
    hideScrollElement(arrowContainer.current, "fade-out-shrink");
    wrapperRef.current.classList.add("hidden-bg");
  };

  useIntersectionObserver(
    wrapperRef,
    handleVisible,
    handleHidden,
    0.99,
    null,
    -120
  );

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

      // if (wrapperRef.current) {
      //   wrapperRef.current.classList.remove("no-blur");
      // }
    }
  };

  const [FTUEComplete, setFTUEComplete] = useState(false);

  return (
    <div className="landing" id="landing">
      <main id="intro-wrapper-container">
        <div
          className={`intro-wrapper blur-container white-border no-blur${
            !introStarted ? "hidden-bg" : ""
          } ${isZenMode ? "hidden-bg no-blur" : ""}`}
          ref={wrapperRef}
          onAnimationStart={(e) => {
            if (wrapperRef.current && !introComplete.current) {
              wrapperRef.current.classList.add("no-blur");
            }
          }}
          onPointerEnter={() => {
            if (!introComplete.current) return;

            wrapperRef.current.classList.remove("no-blur");
          }}
          onPointerLeave={() => {
            wrapperRef.current.classList.add("no-blur");
          }}
        >
          {FTUEComplete ? (
            <div
              className="js-scroll"
              ref={nameContainer}
              onAnimationStart={(e) => {
                setIntroStarted(true);
              }}
              onAnimationEnd={(e) => {
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
          ) : (
            <WebGLChecker
              onContinued={() => setFTUEComplete(true)}
              onRenderChoice={onRenderChoice}
              loaded={loaded}
            />
          )}
        </div>
      </main>
      {FTUEComplete && (
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
      )}
    </div>
  );
};
