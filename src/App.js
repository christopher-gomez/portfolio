import React, { useEffect, useRef, useState } from "react";
import "./styles/CSS/App.css";
import Nav from "./Components/Nav/Nav";
import Landing from "./Views/Landing/Landing";
import About from "./Views/About/About";
import Portfolio from "./Views/Portfolio/Portfolio";
import ScrollTop from "./Components/ScrollTop/ScrollTop";
import FractalBg from "./Components/FractalBg";
import ThemeManager from "./util/ThemeManager";
import { calcElemScrollY } from "./util/scroll";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Markdown from "./Components/Markdown";
import Transition from "./Components/Transition";
// import { faClose, faExpand } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { toElement } from "./util/scroll";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Box, CircularProgress, Typography } from "@mui/material";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FB_APP_ID,
  measurementId: process.env.REACT_APP_FB_MEASUREMENT_ID,
};

// Initialize Firebase
const fb = initializeApp(firebaseConfig);
const analytics = getAnalytics(fb);
// console.log(analytics);

// const views = [".landing", ".portfolio", ".about"];

const App = () => {
  const [state, setState] = useState({
    drawX: 0,
    eraseX: 0,
    isErasing: false,
    isDrawing: true,
    bgOpacity: 1,
    contentShowing: true,
    bgBlur: 0,
    curView: 0,
    hack: false,
  });

  const [shouldHideNav, setShouldHideNav] = useState(true);

  // const isScrolling = useRef(false);

  // const scrollTimer = useRef();

  // const elementInView = (el, percentageScroll = -250) => {
  //   if (el == undefined) return false;
  //   const elementTop = document.querySelector(el).getBoundingClientRect().top;

  //   return elementTop >= percentageScroll;
  // };

  // const curScrollDir = useRef(1);
  // const handleScrollY = () => {
  //   let info;

  //   if (state.contentShowing) info = calcElemScrollY(".landing");
  //   else info = calcElemScrollY("#root");

  //   var amt = info.percentage <= 0.75 ? 0.75 : info.percentage;
  //   var blur = info.percentage <= 0.9 ? (100 - info.percentage * 100) / 10 : 0;
  //   setState((state) => ({ ...state, bgOpacity: amt, bgBlur: blur }));

  //   // const checkScroll = () => {
  //   //   if (elementInView(views[state.curView], 100)) {
  //   //     isScrolling.current = false;
  //   //   } else {
  //   //     scrollTimer.current = setTimeout(() => {
  //   //       checkScroll();
  //   //     }, 500);
  //   //   }
  //   // };

  //   // if (isScrolling.current) checkScroll();
  // };

  // const handleResize = () => {
  //   setState((state) => ({
  //     ...state,
  //     drawX: 0,
  //     eraseX: 0,
  //     isErasing: false,
  //     isDrawing: true,
  //     forceStickyNav: false,
  //   }));
  // };

  const [loaded, setLoaded] = useState(false);
  const [initted, setInitted] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // window.addEventListener("scroll", handleScrollY);
    // window.addEventListener("resize", handleResize);

    // window.onscroll = function () {
    //   if (isScrolling.current === false) {
    //     isScrolling.current = true;
    //     let nextView = state.curView;
    //     nextView += 1;

    //     if (nextView > views.length - 1) nextView = 0;
    //     setState((s) => ({ ...s, curView: nextView }));

    //     window.setTimeout(() => {
    //       isScrolling.current = true;
    //       toElement(document.querySelector(views[nextView]));
    //     }, 150);
    //   }
    // };

    // handleScrollY();
    // handleResize();

    let timeout;
    timeout = setTimeout(() => {
      setLoaded(true);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      // window.removeEventListener("scroll", handleScrollY);
      // window.removeEventListener("resize", handleResize);

      // window.onscroll = undefined;
    };
  }, []);

  useEffect(() => {
    if (!state.contentShowing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [state.contentShowing]);

  // useEffect(() => {
  //   // console.log("introComplete", introComplete);
  // }, [introComplete]);

  const [canDisplayFractal, setCanDisplayFractal] = useState(false);

  const [shouldUseWebGL, setShouldUseWebGL] = useState(true);

  const style = !introComplete
    ? { maxHeight: "100vh", overflow: "hidden" }
    : {};
  return (
    <div style={style}>
      <ThemeManager>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyItems: "center",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            background: "black",
            zIndex: 2000,
            display: initted ? "none" : "flex",
            opacity: loaded ? 0 : 1,
            transition: "opacity 1s",
          }}
          onTransitionEnd={() => {
            setInitted(true);
          }}
        >
          <CircularProgress />
        </Box>
        <Box
          sx={{ opacity: 0 }}
          className={`${
            canDisplayFractal && introComplete ? "fade-in-intro" : ""
          }`}
        >
          <FractalBg
            loaded={introComplete}
            introComplete={introComplete}
            onSceneCreated={() => {
              setCanDisplayFractal(true);
            }}
            useWebGL={shouldUseWebGL}
            allowZenMode={true}
            onToggleUI={(showing) => {
              setState((state) => ({
                ...state,
                contentShowing: !showing,
                bgOpacity: 1,
                forceStickyNav: showing,
              }));
            }}
          />
        </Box>
        <Nav introComplete={introComplete} />
        <Transition visible={state.contentShowing}>
          <Landing
            {...state}
            onRenderChoice={(choice) => {
              if (choice === "webgl") {
                setShouldUseWebGL(true);
              } else {
                setShouldUseWebGL(false);
              }
            }}
            isZenMode={!state.contentShowing}
            loaded={initted}
            onIntroComplete={() => {
              setIntroComplete(true);

              // setTimeout(() => {
              // setCanDisplayFractal(true);
              // }, 0);
            }}
          />
          <Portfolio
            onCardHover={(hovered) => {
              if (hovered) {
                document.querySelector(".App").classList.add("hovered");
              } else {
                document.querySelector(".App").classList.remove("hovered");
              }
            }}
            setShouldHideNav={setShouldHideNav}
          />
          <About />
          <ScrollTop />
        </Transition>
      </ThemeManager>
    </div>
  );
};

const Router = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/resume" element={<Markdown />} />
          <Route exact path="/" element={<App />} />

          {process.env.NODE_ENV === "development" && (
            <Route
              path="/test"
              element={
                <ThemeManager>
                  <Box
                    sx={{
                      minHeight: "100vh",
                      minWidth: "100vw",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FractalBg
                      loaded={true}
                      allowZenMode={true}
                      introComplete={true}
                    />
                  </Box>
                </ThemeManager>
              }
            />
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default Router;
