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
import { faClose, faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toElement } from "./util/scroll";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_OHWjOAjgBBerM94fKRBHnodFXgswRFU",
  authDomain: "portfolio-11aff.firebaseapp.com",
  projectId: "portfolio-11aff",
  storageBucket: "portfolio-11aff.appspot.com",
  messagingSenderId: "858628670182",
  appId: "1:858628670182:web:9d22a19fc7672dd85ef127",
  measurementId: "G-ZWVB96GQ8E",
};

// Initialize Firebase
const fb = initializeApp(firebaseConfig);
const analytics = getAnalytics(fb);

const views = [".landing", ".portfolio", ".about"];

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

  // const isScrolling = useRef(false);

  // const scrollTimer = useRef();

  // const elementInView = (el, percentageScroll = -250) => {
  //   if (el == undefined) return false;
  //   const elementTop = document.querySelector(el).getBoundingClientRect().top;

  //   return elementTop >= percentageScroll;
  // };

  // const curScrollDir = useRef(1);
  const handleScrollY = () => {
    let info;

    if (state.contentShowing) info = calcElemScrollY(".landing");
    else info = calcElemScrollY("#root");

    var amt = info.percentage <= 0.75 ? 0.75 : info.percentage;
    var blur = info.percentage <= 0.9 ? (100 - info.percentage * 100) / 10 : 0;
    setState((state) => ({ ...state, bgOpacity: amt, bgBlur: blur }));

    // const checkScroll = () => {
    //   if (elementInView(views[state.curView], 100)) {
    //     isScrolling.current = false;
    //   } else {
    //     scrollTimer.current = setTimeout(() => {
    //       checkScroll();
    //     }, 500);
    //   }
    // };

    // if (isScrolling.current) checkScroll();
  };

  const handleResize = () => {
    setState((state) => ({
      ...state,
      drawX: 0,
      eraseX: 0,
      isErasing: false,
      isDrawing: true,
      forceStickyNav: false,
    }));
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollY);
    window.addEventListener("resize", handleResize);

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

    handleScrollY();
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScrollY);
      window.removeEventListener("resize", handleResize);

      window.onscroll = undefined;
    };
  }, []);

  return (
    <ThemeManager>
      <FractalBg
        allowZenMode={true}
        bgOpacity={state.bgOpacity}
        bgBlur={state.bgBlur}
        onFractalPosition={({
          drawX,
          drawY,
          eraseX,
          eraseY,
          isDrawing,
          isErasing,
        }) => {
          if (state.hack) return;

          setState((state) => ({
            ...state,
            drawX: drawX,
            eraseX: eraseX,
            isErasing,
            isDrawing,
          }));
        }}
        onFadeOutBegin={() => {
          setState((s) => ({ ...s, hack: true }));
        }}
        onFadeOutEnd={() => {
          setState((s) => ({ ...s, hack: false }));
        }}
        onToggleUI={(showing) => {
          setState((state) => ({
            ...state,
            contentShowing: !showing,
            bgOpacity: !showing ? 1 : state.bgOpacity,
            forceStickyNav: showing,
          }));
        }}
      />
      <Nav forceSticky={state.forceStickyNav} />
      <Transition visible={state.contentShowing}>
        <Landing {...state} />
        <Portfolio
          onCardHover={(hovered) => {
            if (hovered) {
              document.querySelector(".App").classList.add("hovered");
            } else {
              document.querySelector(".App").classList.remove("hovered");
            }
          }}
        />
        <About />
        <ScrollTop />
      </Transition>
    </ThemeManager>
  );
};

const Router = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/resume" element={<Markdown />} />
          <Route exact path="/" element={<App />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default Router;
