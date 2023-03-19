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

const App = () => {
  const [state, setState] = useState({
    drawX: 0,
    eraseX: 0,
    isErasing: false,
    isDrawing: false,
    bgOpacity: 1,
  });

  // const curScrollDir = useRef(1);
  const handleScrollY = () => {
    let info = calcElemScrollY(".landing");

    var amt = info.percentage >= 0.65 ? info.percentage : 0.65;
    setState((state) => ({ ...state, bgOpacity: amt }));
  };

  const handleResize = () => {
    setState((state) => ({
      ...state,
      drawX: 0,
      eraseX: 0,
      isErasing: false,
      isDrawing: true,
    }));
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollY);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScrollY);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          exact
          path="/resume"
          element={
            <div className="App">
              <Markdown />
            </div>
          }
        />
        <Route
          exact
          path="/"
          element={
            <div className="App">
              <ThemeManager>
                <FractalBg
                  bgOpacity={state.bgOpacity}
                  onFractalPosition={({
                    drawX,
                    drawY,
                    eraseX,
                    eraseY,
                    isDrawing,
                    isErasing,
                  }) => {
                    setState((state) => ({
                      ...state,
                      drawX: isDrawing && drawX ? drawX : state.drawX,
                      eraseX: isErasing && eraseX ? eraseX : state.eraseX,
                      isErasing,
                      isDrawing,
                    }));
                  }}
                />
                <Nav />
                <ScrollTop />
                <Landing {...state} />
                <Portfolio />
                <About />
              </ThemeManager>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
