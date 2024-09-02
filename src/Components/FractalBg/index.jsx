import { faClose, faLeaf } from "@fortawesome/free-solid-svg-icons";
import PaletteIcon from "@mui/icons-material/Palette";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   FormControlLabel,
//   FormGroup,
//   List,
//   Slider,
//   SwipeableDrawer,
//   Switch,
// } from "@mui/material";
// import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/FractalBG.css";
import {
  generateRandomColor,
  rgbaToHex,
  rgbaToObject,
  saturateByTenth,
} from "../../util/color";
import Backdrop from "../Backdrop";
import Link from "../Link";
import { isElementInView, isMobileClient } from "../../util/misc";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  Dashboard,
  Pause,
  PlayArrow,
  Refresh,
  West,
} from "@mui/icons-material";
import { SketchPicker } from "react-color";
import { createNoise3D } from "simplex-noise";
import WebGL from "./WebGL";
import SettingsMenu from "./SettingsMenu";
import BrushIcon from "@mui/icons-material/Brush";
import { isMobile } from "mobile-device-detect";
import { useIntersectionObserver } from "../../util/IntersectionObserver";

const Noise = createNoise3D();

const originalFractalProperties = {
  /* In other experiments, you may wish to use more fractal curves ("paths")
  and allow the radius of them to vary. If so, modify the next three variables.
   */
  numPaths: 3,
  maxMaxRad: 260,
  minMaxRad: 200,
  webGLColors: [
    "rgba(255,255,255,.1)",
    /*"rgba(255,255,255,.2),"*/ "rgba(120,163,211,.3)",
  ],
  nonWebGLColors: [
    "rgba(255,255,255,.4)",
    /*"rgba(255,255,255,.2),"*/ "rgba(120,163,211,.8)",
  ],
  colors: [
    "rgba(255,255,255,.1)",
    /*"rgba(255,255,255,.2),"*/ "rgba(120,163,211,.3)",
  ],
  colorsChanged: false,
  /* We draw closed curves with varying radius. The factor below should be set between 0 and 1, representing the size of the smallest radius with respect to the largest possible.
   */
  minRadFactor: 0.0001,
  /* The number of subdividing steps to take when creating a single fractal curve. 
   Can use more, but anything over 10 (thus 1024 points) is overkill for a moderately sized canvas.
   */
  iterations: 6,
  lineWidth: 0.35,
  webGL: {
    xDriftFactor: 0.1,
    yDriftFactor: 0.05,
    noiseScale: 1.75,
    distortion: 0.01,
  },
};

/**
 * @param {{color: {bgColor: string, textColor: string, altBg: string, altText: string}}}
 */
export default (props) => {
  const {
    bgType,
    onFractalPosition,
    bgOpacity,
    bgBlur,
    toggleRandomTheme,
    allowZenMode,
    onToggleUI,
    onFadeOutBegin,
    onFadeOutEnd,
    loaded,
    ...others
  } = props;

  const [UIState, setUIState] = useState({
    active: false,
    infoFocused: false,
    curFPS: 0,
    fadeHide: false,
    controlsOpen: false,
  });

  const [closingUI, setClosingUI] = useState(false);
  const closingUIRef = useRef(closingUI);

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(-1);

  useEffect(() => {
    if (!colorModalOpen) setEditingColor(-1);
  }, [colorModalOpen]);

  useEffect(() => {
    closingUIRef.current = closingUI;
    if (closingUI) setUIState((state) => ({ ...state, fadeHide: true }));
  }, [closingUI]);

  const UIStateRef = useRef(UIState);

  const [fractalPropertiesState, setFractalPropertiesState] = useState(
    originalFractalProperties
  );

  const fractalPropertiesStateRef = useRef(fractalPropertiesState);
  useEffect(() => {
    fractalPropertiesStateRef.current = fractalPropertiesState;
  }, [fractalPropertiesState]);

  const [animationState, setAnimationState] = useState({
    isDrawing: false,
    drawCompleted: false,
    isErasing: false,
    eraseCompleted: false,
    shouldEraseOnRedraw: false,
    shouldAutoRedraw: false,
    drawsPerFrame: isMobile ? 6 : 12,
    fpsLimit: -1,
    autoRedrawOnResize: true,
    isPaused: false,
    useWebGL: true,
  });

  const animationStateRef = useRef(animationState);

  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

  const drawCanvas = useRef();

  const fractalRef = useRef({
    paths: [],
    prevPaths: [],
    updateId: undefined,
    drawCount: 0,
    // theta: 0,
    previousDelta: 0,
    shouldAnimate: true,
    frameTime: 0,
    curSinFactor: -20,
    ctx: null,
    curNumPaths: 1,
  });

  const animationRunning = useRef(false);
  // const drawCanvasElem = useRef();
  const canvasElemInitialPos = useRef();
  const canvasElemTotalOffset = useRef(0);
  const prevScroll = useRef(window.scrollY);
  const canvasScrollAnimFrame = useRef();

  const TWO_PI = 2 * Math.PI;

  const resizeTimeoutRef = useRef();

  const [drawCanvasInfo, setDrawCanvasInfo] = useState(null);
  const [webglContext, setWebGLContext] = useState(null);

  const handleResize = () => {
    // if (UIStateRef.current.active) return;

    // if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);

    // setAnimationState((state) => ({
    //   ...state,
    //   isDrawing: false,
    //   drawCompleted: false,
    //   isErasing: false,
    //   eraseCompleted: false,
    // }));

    // if (onFractalPosition !== undefined)
    //   onFractalPosition({
    //     eraseX: 0,
    //     eraseY: 0,
    //     drawX: 0,
    //     drawY: 0,
    //     isDrawing: true,
    //     isErasing: false,
    //   });

    // cancelAnimation(fractalRef.current);

    if (drawCanvas.current) {
      let ctxRef = drawCanvas.current.getContext("2d");

      const dpr = window.devicePixelRatio || 1;
      const bsr =
        //@ts-ignore
        ctxRef.webkitBackingStorePixelRatio ||
        //@ts-ignore
        ctxRef.mozBackingStorePixelRatio ||
        //@ts-ignore
        ctxRef.msBackingStorePixelRatio ||
        //@ts-ignore
        ctxRef.oBackingStorePixelRatio ||
        //@ts-ignore
        ctxRef.backingStorePixelRatio ||
        1;

      const ratio = dpr / bsr;

      drawCanvas.current.width = window.innerWidth * ratio;
      drawCanvas.current.height = window.innerHeight * ratio;
      drawCanvas.current.style.width = `${window.innerWidth}px`;
      drawCanvas.current.style.height = `${window.innerHeight}px`;

      // drawCanvasElem.current.height = window.innerHeight;
      // drawCanvasElem.current.width = window.innerWidth;

      // if (!UIStateRef.current.active)
      //   resizeTimeoutRef.current = setTimeout(() => init(), 250);
      beginErase();
    }
  };

  const [mouseMoveTimeoutTime, setMouseMoveTimeoutTime] = useState(-1);
  const mouseMoveTimeoutTimeRef = useRef(mouseMoveTimeoutTime);

  useEffect(() => {
    mouseMoveTimeoutTimeRef.current = mouseMoveTimeoutTime;
  }, [mouseMoveTimeoutTime]);

  const processUIState = (shouldSetFadeHide = true) => {
    clearTimeout(mouseMoveTimeout.current);

    if (document.body.style.cursor !== "auto")
      document.body.style.cursor = "auto";

    if (!UIStateRef.current.active || closingUIRef.current) return;

    if (UIStateRef.current.fadeHide && shouldSetFadeHide)
      setUIState((state) => ({ ...state, fadeHide: false }));

    if (mouseMoveTimeoutTimeRef.current === -1) return;

    mouseMoveTimeout.current = setTimeout(() => {
      if (UIStateRef.current.infoFocused) return;

      document.body.style.cursor = "none";
      setUIState((state) => ({
        ...state,
        fadeHide: true,
        // menuShowing: false,
      }));
    }, mouseMoveTimeoutTimeRef.current);
  };

  const scrollDirection = useRef(null);

  useEffect(() => {
    if (drawCanvas.current) {
      canvasElemInitialPos.current = drawCanvas.current.offsetTop;
    }

    // window.removeEventListener("scroll", handleScrollY);
    // window.addEventListener("scroll", handleScrollY);
    window.removeEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);

    // handleResize();

    return () => {
      // window.removeEventListener("scroll", handleScrollY);
      window.removeEventListener("resize", handleResize);
    };
  }, [drawCanvas.current]);

  // const handleScrollY = () => {
  //   if (UIStateRef.current.active) return;

  //   if (!isElementInView(document.querySelector(".intro-wrapper"), 50)) {
  //     document.querySelector("#zen-viewer").style.display = "none";
  //   } else {
  //     document.querySelector("#zen-viewer").style.display = "block";
  //   }

  //   return;

  //   // if (animationStateRef.current.useWebGL) return;

  //   // if (!drawCanvas.current) return;

  //   // if (!canvasElemInitialPos.current) {
  //   //   canvasElemInitialPos.current = drawCanvas.current.offsetTop;
  //   // }

  //   // const ease = 0.01;

  //   // function animate_scroll() {
  //   //   // let curScrollDir = scrollingDir.current;
  //   //   // const currentScrollY = window.scrollY;

  //   //   // let changedDirections = false;
  //   //   // const prevScrollDir = scrollDirection.current;

  //   //   // if (
  //   //   //   currentScrollY > prevScroll.current &&
  //   //   //   scrollDirection.current !== "down"
  //   //   // ) {
  //   //   //   scrollDirection.current = "down";
  //   //   // } else if (
  //   //   //   currentScrollY < prevScroll.current &&
  //   //   //   scrollDirection.current !== "up"
  //   //   // ) {
  //   //   //   scrollDirection.current = "up";
  //   //   // }

  //   //   // prevScroll.current = currentScrollY;

  //   //   // if (prevScrollDir !== scrollDirection.current) changedDirections = true;

  //   //   // if (changedDirections) {
  //   //   //   cancelAnimationFrame(canvasScrollAnimFrame.current);
  //   //   //   animationRunning.current = false;
  //   //   //   canvasScrollAnimFrame.current = null;
  //   //   // }

  //   //   if (!animationRunning.current) {
  //   //     animationRunning.current = true;
  //   //     animation_loop();
  //   //   }
  //   // }

  //   // function lerp(start, end, alpha) {
  //   //   return start * (1 - alpha) + end * alpha;
  //   // }

  //   // function animation_loop() {
  //   //   let current_offset = window.scrollY;

  //   //   canvasElemTotalOffset.current = lerp(
  //   //     canvasElemTotalOffset.current,
  //   //     current_offset,
  //   //     ease // Alpha value for interpolation, you might need to adjust the ease value for smoothness
  //   //   );

  //   //   let shouldStop = false;
  //   //   if (Math.abs(current_offset - canvasElemTotalOffset.current) < 10) {
  //   //     // scrollAmt.current = 0;
  //   //     shouldStop = true;
  //   //     // canvasElemTotalOffset.current = current_offset;
  //   //   }

  //   //   // if(canvasElemTotalOffset.current >= 2500) canvasElemTotalOffset.current = 2500;

  //   //   const newTop = -canvasElemTotalOffset.current * 0.15;

  //   //   // if (newTop >= -300)
  //   //   drawCanvas.current.style.top = `${newTop}px`;

  //   //   if (!shouldStop)
  //   //     canvasScrollAnimFrame.current = requestAnimationFrame(animation_loop);
  //   //   else {
  //   //     cancelAnimationFrame(canvasScrollAnimFrame.current);
  //   //     animationRunning.current = false;
  //   //   }
  //   // }

  //   // animate_scroll();
  // };

  const introRef = useRef();
  const introContainerRef = useRef();

  useIntersectionObserver(
    introRef,
    () => {
      document.querySelector("#zen-viewer").style.display = "block";
    },
    () => {
      document.querySelector("#zen-viewer").style.display = "none";
    },
    0.99,
    null,
    -200
  );

  useEffect(() => {
    const handleMouseMove = () => {
      processUIState();
    };

    introRef.current = document.querySelector(".intro-wrapper");
    introContainerRef.current = document.querySelector("#intro-wrapper-container");

    if (isMobile || isMobileClient()) setWebGLAvailable(false);

    window.addEventListener("pointermove", handleMouseMove);

    return () => {
      if (fractalRef.current) cancelAnimation(fractalRef.current);

      if (canvasScrollAnimFrame.current)
        cancelAnimationFrame(canvasScrollAnimFrame.current);

      cancelAnimationFrame(noiseAnimRef.current);

      window.removeEventListener("pointermove", handleMouseMove);

      clearTimeout(mouseMoveTimeout.current);
    };
  }, []);

  const activeTimeoutRef = useRef();

  useEffect(() => {
    UIStateRef.current = UIState;
    clearTimeout(activeTimeoutRef.current);
    processUIState(false);

    if (UIState.active) {
      setClosingUI(false);
      activeTimeoutRef.current = setTimeout(() => {
        processUIState();
      }, 500);
    }
    // else {
    //   setUIState((state) => ({ ...state, fadeHide: true }));
    // }

    return () => {
      clearTimeout(activeTimeoutRef.current);
    };
  }, [UIState.active]);

  useEffect(() => {
    UIStateRef.current = UIState;
    processUIState();
  }, [UIState.infoFocused]);

  useEffect(() => {
    UIStateRef.current = UIState;
  }, [UIState.fadeHide]);

  const [webGLAvailable, setWebGLAvailable] = useState(true);

  useEffect(() => {
    if (drawCanvas.current) {
      // handleResize();

      fractalRef.current.ctx = drawCanvas.current.getContext("2d", {
        willReadFrequently: true,
        imageSmoothingEnabled: true,
      });

      textureRef.current = drawCanvas.current;
    }
  }, [drawCanvas.current]);

  // useEffect(() => {
  //   if (!animationState.useWebGL || !webGLAvailable) {
  //     if (drawCanvas.current) drawCanvas.current = drawCanvas.current;
  //   }
  // }, [animationState.useWebGL, webGLAvailable, drawCanvas.current]);

  useEffect(() => {
    // setFractalPropertiesState((s) => ({
    //   ...s,
    //   colors: animationState.useWebGL ? s.webGLColors : s.nonWebGLColors,
    //   colorsChanged: false,
    // }));
    if (fractalRef.current && fractalRef.current.paths.length > 0) {
      beginErase();
    }
  }, [animationState.useWebGL]);

  useEffect(() => {
    // resetFractalPathsColors(fractalRef.current);
  }, [fractalPropertiesState.colors]);

  useEffect(() => {
    // if (!loaded) return;

    // console.log("isDrawing changed to ", animationState.isDrawing);
    cancelAnimation(fractalRef.current);

    fractalPropertiesStateRef.current = fractalPropertiesState;

    if (animationState.isDrawing) {
      // console.log("beginning draw through draw effect beginAnimate");
      beginAnimate(fractalRef.current, false);
    } else if (
      fractalRef.current.prevPaths.length > 0 &&
      animationState.shouldAutoRedraw
    ) {
      // console.log("beginning erase through draw effect beginErase");
      beginErase();
    } else if (
      !animationState.shouldEraseOnRedraw &&
      fractalRef.current.paths.length === 0 &&
      fractalRef.current.prevPaths.length === 0
    ) {
      init();
    }
    // }
  }, [animationState.isDrawing]);

  const [canLoadWebGL, setCanLoadWebGL] = useState(false);

  const [canAnimate, setCanAnimate] = useState(false);
  const canAnimateRef = useRef(canAnimate);

  useEffect(() => {
    setCanAnimate(loaded);
  }, [loaded]);

  useEffect(() => {
    canAnimateRef.current = canAnimate;
  }, [canAnimate]);

  // useEffect(() => {
  //   if (!loaded) return;
  //   else if (
  //     !animationState.shouldEraseOnRedraw &&
  //     fractalRef.current.paths.length === 0 &&
  //     fractalRef.current.prevPaths.length === 0
  //   ) {
  //     init();
  //     setCanLoadWebGL(true);
  //   }
  // }, [loaded]);

  useEffect(() => {
    // console.log("isErasing changed to ", animationState.isErasing);
    cancelAnimation(fractalRef.current);

    fractalPropertiesStateRef.current = fractalPropertiesState;

    if (animationState.isErasing) {
      // console.log("beginning erase through beginAnimate");
      beginAnimate(fractalRef.current, true);
    } else {
      if (
        animationState.shouldAutoRedraw ||
        (animationState.shouldEraseOnRedraw && !animationState.isDrawing)
      ) {
        // console.log("beginning draw through erase effect init");
        init();
      }
    }
  }, [animationState.isErasing]);

  function clearCanvas(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function init(isErase) {
    console.groupCollapsed("init");
    console.trace();
    console.groupEnd();
    // console.log("init");
    if (
      isErase === undefined &&
      animationStateRef.current.shouldEraseOnRedraw &&
      !animationStateRef.current.isDrawing &&
      animationStateRef.current.drawCompleted
    ) {
      // console.log("beginning erase through init");
      beginErase();
      return;
    }

    let fractal = fractalRef.current;
    let _ctx = fractal.ctx;

    if (!isErase) {
      _ctx.canvas.height = window.innerHeight;
      _ctx.canvas.width = window.innerWidth;
      _ctx.globalCompositeOperation = "source-over";
    } else {
      _ctx.globalCompositeOperation = "destination-out";
    }

    fractal.drawCount = 0;

    _ctx.setTransform(1, 0, 0, 1, 0, 0);

    fractal.curNumPaths = fractalPropertiesStateRef.current.numPaths;
    fractal.curNumIterations = fractalPropertiesStateRef.current.iterations;

    if (!isErase) {
      // console.log("init setting drawing");
      clearCanvas(_ctx);
      setPaths(fractal);
      setAnimationState((state) => ({ ...state, isDrawing: true }));
    } else {
      // console.log("init setting erasing");
      setAnimationState((state) => ({ ...state, isErasing: true }));
    }

    return fractal;
  }

  function beginAnimate(fractal, isErase) {
    cancelAnimation(fractal);

    fractal.shouldAnimate = true;
    fractal.frameTime = 0;
    fractal.animationTimeStart = Date.now();

    if (animTimeStartElemRef.current) {
      animTimeStartElemRef.current.innerText =
        "Start: " + new Date(fractal.animationTimeStart).toLocaleTimeString();
    }

    // console.log("beginning animate with curSinFactor", fractal.curSinFactor);

    fractal.updateId = requestAnimationFrame((d) => {
      onAnimate(d, fractal, isErase);
    });
  }

  function onAnimate(currentDelta, fractal, isErase) {
    if (!fractal.updateId) return;

    if (fractal.shouldAnimate)
      fractal.updateId = requestAnimationFrame((d) => {
        onAnimate(d, fractal, isErase);
      });

    if (animationStateRef.current.isPaused || !canAnimateRef.current) return;

    // If browser doesn't support requestAnimationFrame, generate our own timestamp using Date:
    var delta = currentDelta || new Date().getTime();
    if (!fractal.previousDelta) {
      fractal.previousDelta = delta;
    }
    var timeDifference = delta - fractal.previousDelta;

    // Determine if it's time to update the frame based on the FPS limit
    if (
      animationStateRef.current.fpsLimit !== -1 &&
      timeDifference < 1000 / animationStateRef.current.fpsLimit &&
      fractal.shouldAnimate
    ) {
      return;
    } else if (fractal.shouldAnimate) {
      fractal.frameTime +=
        (timeDifference - fractal.frameTime) /
        (animationStateRef.current.fpsLimit === -1
          ? 30
          : animationStateRef.current.fpsLimit);
      // Update the previousDelta to the current timestamp
      fractal.previousDelta = delta;

      // Calculate the FPS based on the average frame time
      const fps = Math.round(1000 / fractal.frameTime);
      if (fpsElemRef.current) fpsElemRef.current.innerText = fps + " FPS";

      fractal.shouldAnimate = false;

      onFrame(fractal, isErase, currentDelta);

      if (fractal.updateId) fractal.shouldAnimate = true;
    }
  }

  function onFrame(fractal, isErase, time) {
    let drawsPerFrame = animationStateRef.current.drawsPerFrame;

    if (fractal.updateId === null) {
      // console.warn("fractal.updateId is null onFrame, ending animation");
      fractal.shouldAnimate = false;
      return;
    }

    const onComplete = () => {
      if (fractal.updateId === null) return;

      cancelAnimation(fractal);

      if (animTimeEndElemRef.current)
        animTimeEndElemRef.current.innerText =
          "End: " + new Date().toLocaleTimeString();
      if (animDurationElemRef.current)
        animDurationElemRef.current.innerText =
          "Duration: " + (Date.now() - fractal.animationTimeStart) / 1000 + "s";

      if (finalDrawCountElemRef.current)
        finalDrawCountElemRef.current.innerText =
          "Final Draw Count: " + fractal.drawCount;

      fractal.frameTime = 0;
      fractal.previousDelta = null;

      if (!isErase) fractal.prevPaths = [...fractal.paths];
      else {
        // console.log('isErase onComplete');
        fractal.prevPaths = [];
        fractal.paths = [];
      }

      // if (!isErase) {
      //   textureRef.current = fractal.ctx.canvas;
      // }

      // if (!isErase) noiseAnimRef.current = startNoiseAnimation(fractal);

      setAnimationState((s) => ({
        ...s,
        isDrawing: isErase ? s.isDrawing : false,
        drawCompleted: isErase ? false : s.drawCompleted,
        isErasing: isErase ? false : s.isErasing,
        eraseCompleted: isErase ? true : s.eraseCompleted,
      }));
    };

    //draw paths
    for (let j = 0; j < drawsPerFrame; j++) {
      fractal.drawCount++;

      if (isErase) fractal.prevPaths = redrawFractal(fractal, onComplete);
      else {
        fractal.paths = draw(fractal, onComplete);
        fractal.prevPaths = [...fractal.paths];
      }
    }

    return fractal;
  }

  const noiseAnimRef = useRef();

  function getGradient(minR, maxR, ctx, isErase) {
    // console.log("getting gradient for", isErase ? "erase" : "draw");

    let grad = ctx.createRadialGradient(0, 0, minR, 0, 0, maxR);

    if (!isErase) {
      if (fractalPropertiesStateRef.current.colors.length === 0) {
        var color1 = generateRandomColor();
        var color2 = generateRandomColor();
        var colorstring1 = `rgba(${color1.rgb.r},${color1.rgb.g},${color1.rgb.b},1)`;
        var colorstring2 = `rgba(${color2.rgb.r},${color2.rgb.g},${color2.rgb.b},.5)`;
        setFractalPropertiesState((state) => ({
          ...state,
          colors: [colorstring1, colorstring2],
          colorsChanged: true,
        }));
        grad.addColorStop(0, colorstring1);
        grad.addColorStop(1, colorstring2);
        // grad.addColorStop(1, "rgba(0,170,200,0.2)");
        // grad.addColorStop(0, "rgba(0,20,170,0.2)");
      } else {
        if (fractalPropertiesStateRef.current.colors.length === 1) {
          grad.addColorStop(0, fractalPropertiesStateRef.current.colors[0]);
          let { r, g, b, a } = rgbaToObject(
            fractalPropertiesStateRef.current.colors[0]
          );
          let sat = { r, g, b };
          for (let i = 0; i < 10; i++) {
            sat = saturateByTenth({ ...sat });
          }

          grad.addColorStop(1, `rgba(${sat.r},${sat.g},${sat.b},${a / 4})`);
        } else {
          let colors;

          if (fractalPropertiesStateRef.current.colorsChanged)
            colors = fractalPropertiesStateRef.current.colors;
          else {
            if (animationStateRef.current.useWebGL)
              colors = fractalPropertiesStateRef.current.webGLColors;
            else colors = fractalPropertiesStateRef.current.nonWebGLColors;
          }

          for (let i = 0; i < colors.length; i++) {
            grad.addColorStop(i / (colors.length - 1), colors[i]);
          }
        }
      }
    } else {
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,1)");
    }

    return grad;
  }

  function setPaths(fractal) {
    // console.log("setting paths");

    var i;
    var maxR, minR;
    var grad;

    let paths = [];

    for (i = 0; i < fractal.curNumPaths; i++) {
      maxR =
        fractalPropertiesStateRef.current.minMaxRad +
        Math.random() *
          (fractalPropertiesStateRef.current.maxMaxRad -
            fractalPropertiesStateRef.current.minMaxRad);
      minR = fractalPropertiesStateRef.current.minRadFactor * maxR;

      grad = getGradient(minR, maxR, fractal.ctx);

      let originalPhase = Math.random() * TWO_PI;
      let originalGlobalPhase = Math.random() * TWO_PI;

      var newCircle = {
        centerX: -maxR,
        centerY: drawCanvas.current.height / 2 - 15,
        maxRad: maxR,
        minRad: minR,
        color: grad, //can set a gradient or solid color here.
        param: 0,
        changeSpeed: 1 / 250,
        originalPhase: originalPhase,
        phase: originalPhase, //the phase to use for a single fractal curve.
        globalPhase: originalGlobalPhase, //the curve as a whole will rise and fall by a sinusoid.
        lines: [],
      };

      newCircle.pointList1 = setLinePoints(fractal.curNumIterations);
      newCircle.pointList2 = setLinePoints(fractal.curNumIterations);

      newCircle.originalPointLists = {
        pointList1: { i: 0, list: [newCircle.pointList1] },
        pointList2: { i: 0, list: [newCircle.pointList2] },
      };

      paths.push(newCircle);

      // fractal.theta = newCircle.phase;
    }

    fractal.curSinFactor = Math.floor(Math.random() * (-10 + 70 + 1)) - 70;

    // console.log("set growingFractal curSinFactor to", fractal.curSinFactor);

    fractal.paths = paths;
  }

  function resetFractalPathsColors(fractal) {
    for (const circle of fractal.paths) {
      circle.color = getGradient(circle.minRad, circle.maxRad, fractal.ctx);
    }
  }

  function setLinePoints(iterations) {
    var pointList = {};
    pointList.first = { x: 0, y: 1 };
    var lastPoint = { x: 1, y: 1 };
    var minY = Math.random();
    var maxY = 1;
    var point;
    var nextPoint;
    var dx, newX, newY;

    pointList.first.next = lastPoint;
    for (var i = 0; i < iterations; i++) {
      point = pointList.first;
      while (point.next != null) {
        nextPoint = point.next;

        dx = nextPoint.x - point.x;
        newX = 0.5 * (point.x + nextPoint.x);

        newY = 0.5 * (point.y + nextPoint.y);
        newY += dx * (Math.random() * 2 - 1);

        var newPoint = { x: newX, y: newY };

        //min, max
        if (newY < minY) {
          minY = newY;
        } else if (newY > maxY) {
          maxY = newY;
        }

        //put between points
        newPoint.next = nextPoint;
        point.next = newPoint;

        point = nextPoint;
      }
    }

    //normalize to values between 0 and 1
    if (maxY != minY) {
      var normalizeRate = 1 / (maxY - minY);
      point = pointList.first;
      while (point != null) {
        point.y = normalizeRate * (point.y - minY);
        point = point.next;
      }
    }
    //unlikely that max = min, but could happen if using zero iterations. In this case, set all points equal to 1.
    else {
      point = pointList.first;
      while (point != null) {
        point.y = 1;
        point = point.next;
      }
    }

    return pointList;
  }

  function draw(fractal, onEndReached) {
    var i;
    var fractalPath;
    var rad;
    var point1, point2;
    var x0, y0;
    var cosParam;

    var xSqueeze = 0.5;

    var yOffset;

    let endReached = false;

    let _ctx = fractal.ctx;
    let theta;
    const paths = [...fractal.paths];
    let drawCount = fractal.drawCount;

    for (i = 0; i < paths.length; i++) {
      fractalPath = paths[i];
      fractalPath.param += fractalPath.changeSpeed;

      if (fractalPath.param >= 1) {
        fractalPath.param = 0;

        fractalPath.pointList1 = fractalPath.pointList2;
        fractalPath.originalPointLists.pointList1.list.push(
          fractalPath.pointList1
        );
        fractalPath.pointList2 = setLinePoints(fractal.curNumIterations);
        fractalPath.originalPointLists.pointList2.list.push(
          fractalPath.pointList2
        );
      }

      if (!fractalPath.pointList1 || !fractalPath.pointList2) {
        endReached = true;
        break;
      }

      _ctx.strokeStyle = fractalPath.color;
      _ctx.lineWidth = fractalPropertiesStateRef.current.lineWidth;
      _ctx.fillStyle = fractalPath.color;

      _ctx.beginPath();

      point1 = fractalPath.pointList1.first;
      point2 = fractalPath.pointList2.first;

      //slowly rotate
      fractalPath.phase += 0.0005;

      theta = fractalPath.phase;

      let move = (_ctx.canvas.width + _ctx.canvas.width * 0.05) * 0.0005;

      //move center
      fractalPath.centerX += move; //~.6-.9

      fractalPath.centerY +=
        (_ctx.canvas.height + _ctx.canvas.height * 0.0005) * 0.00000005; //~0.0001

      cosParam = 0.5 - 0.5 * Math.cos(Math.PI * fractalPath.param);

      rad =
        fractalPath.minRad +
        (point1.y + cosParam * (point2.y - point1.y)) *
          (fractalPath.maxRad - fractalPath.minRad);

      yOffset =
        fractal.curSinFactor *
          Math.sin(fractalPath.globalPhase + (drawCount / 1000) * TWO_PI) -
        50;

      //stop when off screen
      if (
        fractalPath.centerX >=
        drawCanvas.current.width + fractalPath.maxRad * 1.25
      ) {
        endReached = true;
        break;
      }

      //we are drawing in new position by applying a transform. We are doing this so the gradient will move with the drawing.
      _ctx.setTransform(
        xSqueeze,
        0,
        0,
        1,
        fractalPath.centerX,
        fractalPath.centerY + yOffset
      );

      //Drawing the curve involves stepping through a linked list of points defined by a fractal subdivision process.
      //It is like drawing a circle, except with varying radius.
      x0 = xSqueeze * rad * Math.cos(theta);
      y0 = rad * Math.sin(theta);

      const transform = [
        xSqueeze,
        0,
        0,
        1,
        fractalPath.centerX,
        fractalPath.centerY + yOffset,
      ];

      fractalPath.lines.push({
        transform: transform,
        points: [{ x: x0, y: y0 }],
      });

      _ctx.lineTo(x0, y0);

      while (point1.next != null) {
        point1 = point1.next;
        point2 = point2.next;

        theta =
          TWO_PI * (point1.x + cosParam * (point2.x - point1.x)) +
          fractalPath.phase;
        rad =
          fractalPath.minRad +
          (point1.y + cosParam * (point2.y - point1.y)) *
            (fractalPath.maxRad - fractalPath.minRad);
        x0 = xSqueeze * rad * Math.cos(theta);
        y0 = rad * Math.sin(theta);
        fractalPath.lines[fractalPath.lines.length - 1].points.push({
          x: x0,
          y: y0,
        });

        _ctx.lineTo(x0, y0);
      }

      _ctx.closePath();
      _ctx.stroke();

      paths[i] = fractalPath;
    }

    if (endReached) {
      onEndReached(paths);
    }

    return paths;
  }

  function applyNoiseToPoint(x, y, time) {
    // Here, noiseScale controls the 'frequency' of the noise
    const noiseScale = 0.005;
    const noiseStrength = 50; // This controls the 'amplitude' of the noise

    // Get noise-based offsets for x and y
    const noiseX = Noise(x * noiseScale, y * noiseScale, time) * noiseStrength;
    const noiseY =
      Noise(x * noiseScale, y * noiseScale, time + 10000) * noiseStrength; // Offset time for y to get a different noise value

    return { x: x + noiseX, y: y + noiseY };
  }

  function redrawFractal(fractal, onComplete) {
    const ctx = fractal.ctx;

    const paths = [...fractal.prevPaths];

    ctx.lineWidth = fractalPropertiesStateRef.current.lineWidth * 3.5;

    let endReached = false;

    for (let i = 0; i < paths.length; i++) {
      const fractalPath = paths[i];
      ctx.strokeStyle = fractalPath.color;
      ctx.fillStyle = fractalPath.color;

      const lines = fractalPath.lines;

      if (fractalPath.noiseCurLine === undefined) fractalPath.noiseCurLine = 0;
      else {
        if (fractalPath.noiseCurLine === lines.length - 1) {
          endReached = true;
          break;
        }

        fractalPath.noiseCurLine =
          (fractalPath.noiseCurLine + 1) % lines.length;
      }

      const transform = lines[fractalPath.noiseCurLine].transform;
      const points = lines[fractalPath.noiseCurLine].points;

      ctx.beginPath();

      ctx.setTransform(
        transform[0],
        transform[1],
        transform[2],
        transform[3],
        transform[4],
        transform[5]
      );

      for (let j = 0; j < points.length; j++) {
        ctx.lineTo(points[j].x, points[j].y);
      }

      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }

    if (endReached) {
      onComplete();
    }

    return paths;
  }

  function createTexture(ctx) {
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function beginErase() {
    // console.groupCollapsed("beginErase");
    // console.trace();
    // console.groupEnd();
    // console.log("beginErase called", fractalRef.current);
    if (!animationState.shouldEraseOnRedraw) {
      // console.log("beginErase called but shouldEraseOnRedraw is false");
      init();
      return;
    }

    if (animationState.isDrawing) {
      setAnimationState((s) => ({ ...s, isDrawing: false }));
    }

    // copyFractalPaths();

    if (fractalRef.current.paths.length > 0) {
      let paths = [...fractalRef.current.paths];

      for (let i = 0; i < paths.length; i++) {
        let _fractalPath = paths[i];
        let grad = getGradient(
          _fractalPath.minRad,
          _fractalPath.maxRad,
          fractalRef.current.ctx,
          true
        );

        paths[i].color = grad;
      }

      fractalRef.current.prevPaths = paths;
      init(true);
    } else {
      init();
    }
  }

  function cancelAnimation(fractal) {
    fractal.shouldAnimate = false;
    cancelAnimationFrame(fractal.updateId);
    fractal.updateId = null;
  }

  const zenViewerStyle = !UIState.active
    ? { bottom: "0", left: "0", padding: "1rem 1rem" }
    : { top: "1em", right: "1em" };

  const mouseMoveTimeout = useRef(null);

  const fpsElemRef = useRef();
  const animTimeStartElemRef = useRef();
  const animTimeEndElemRef = useRef();
  const animDurationElemRef = useRef();
  const finalDrawCountElemRef = useRef();

  const textureRef = useRef();

  return (
    <>
      {allowZenMode && (
        <Backdrop
          open={UIState.active}
          sx={{ background: "transparent !important" }}
        >
          <div
            className={"blueprint-container"}
            style={{ backgroundColor: "transparent !important" }}
          >
            <div
              style={{ width: "40vw" }}
              onPointerEnter={() => {
                setUIState((state) => ({
                  ...state,
                  infoFocused: true,
                }));
              }}
              onPointerLeave={() => {
                setUIState((state) => ({
                  ...state,
                  infoFocused: false,
                }));
              }}
            >
              <div
                className={`blueprint-header blur-container shadow ${
                  UIState.fadeHide ? "slide-out-left" : "slide-in-left"
                }`}
                id="fractal-info-container"
                onAnimationEnd={() => {
                  if (closingUI) {
                    if (onToggleUI) onToggleUI(false);
                    setUIState((state) => ({ ...state, active: false }));
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <Typography variant="overline" sx={{ fontStyle: "italic" }}>
                    FRACTAL CURVES
                  </Typography>
                  <div style={{ display: "flex" }}>
                    <Tooltip
                      arrow
                      title={
                        <div style={{ textAlign: "right" }}>
                          <Typography sx={{ fontSize: ".75rem" }}>
                            Hide
                          </Typography>
                        </div>
                      }
                      placement="left"
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          document.body.style.cursor = "none";

                          setUIState((state) => ({
                            ...state,
                            fadeHide: true,
                            // menuShowing: false,
                          }));
                        }}
                      >
                        <West />
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      arrow
                      title={
                        mouseMoveTimeoutTime === -1 ? (
                          <div style={{ textAlign: "center" }}>
                            <Typography sx={{ fontSize: ".75rem" }}>
                              Zen Mode.
                            </Typography>
                            <Typography sx={{ fontSize: ".65rem" }}>
                              <small>
                                Allow the UI to fade out when not in use.
                              </small>
                            </Typography>
                          </div>
                        ) : (
                          <div style={{ textAlign: "center" }}>
                            <Typography sx={{ fontSize: ".75rem" }}>
                              Controls Mode.
                            </Typography>
                            <Typography sx={{ fontSize: ".65rem" }}>
                              <small>Prevent the UI from fading out.</small>
                            </Typography>
                          </div>
                        )
                      }
                      placement="bottom"
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          setMouseMoveTimeoutTime((time) =>
                            time === -1 ? 1000 : -1
                          );
                        }}
                      >
                        {mouseMoveTimeoutTime === -1 ? (
                          <FontAwesomeIcon icon={faLeaf} />
                        ) : (
                          <Dashboard />
                        )}
                      </IconButton>
                    </Tooltip>
                    {(animationState.isDrawing || animationState.isErasing) && (
                      <Tooltip
                        arrow
                        title={
                          animationState.isPaused ? (
                            <div
                              style={{
                                textAlign: UIState.controlsOpen
                                  ? "left"
                                  : "center",
                              }}
                            >
                              <Typography sx={{ fontSize: ".75rem" }}>
                                Play
                              </Typography>
                            </div>
                          ) : (
                            <div
                              style={{
                                textAlign: UIState.controlsOpen
                                  ? "left"
                                  : "center",
                              }}
                            >
                              <Typography sx={{ fontSize: ".75rem" }}>
                                Pause
                              </Typography>
                            </div>
                          )
                        }
                        placement={UIState.controlsOpen ? "right" : "bottom"}
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            setAnimationState((state) => ({
                              ...state,
                              isPaused: !state.isPaused,
                            }));
                          }}
                        >
                          {animationState.isPaused ? <PlayArrow /> : <Pause />}
                        </IconButton>
                      </Tooltip>
                    )}
                    {!UIState.controlsOpen && (
                      <Tooltip
                        title={
                          <div style={{ textAlign: "left" }}>
                            <Typography sx={{ fontSize: ".75rem" }}>
                              Redraw
                            </Typography>
                          </div>
                        }
                        placement="right"
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => {
                            beginErase();
                          }}
                        >
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <hr
                  style={{
                    color: "black",
                    width: "100%",
                    height: "1px",
                    marginTop: 0,
                  }}
                />
                <div
                  style={{
                    lineHeight: "1.5rem",
                  }}
                >
                  <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                    A fractal generated using a recursive algorithm called{" "}
                    <Link
                      href="https://en.wikipedia.org/wiki/Mandelbrot_set"
                      newTab
                    >
                      "The Mandelbrot Set"
                    </Link>
                    ; a well-known mathematical set of complex numbers.
                  </Typography>
                </div>
                <SettingsMenu
                  UIState={UIState}
                  setUIState={setUIState}
                  fractalPropertiesState={fractalPropertiesState}
                  setFractalPropertiesState={setFractalPropertiesState}
                  animationState={animationState}
                  setAnimationState={setAnimationState}
                  setColorModalOpen={setColorModalOpen}
                  setEditingColorIndex={setEditingColor}
                  webGLAvailable={webGLAvailable}
                  beginErase={beginErase}
                  originalFractalProperties={originalFractalProperties}
                />
              </div>
            </div>
            <div
              className={`foot ${UIState.fadeHide ? "fade-out" : "fade-in"}`}
            >
              <div
                className="source"
                onPointerEnter={() => {
                  setUIState((state) => ({
                    ...state,
                    infoFocused: true,
                  }));
                }}
                onPointerLeave={() => {
                  setUIState((state) => ({
                    ...state,
                    infoFocused: false,
                  }));
                }}
              >
                <Link
                  newTab
                  href="https://github.com/christopher-gomez/portfolio/blob/master/src/Components/FractalBg/index.jsx"
                >
                  Source
                </Link>
              </div>
              <div className="fps">
                {/* <p ref={animTimeStartElemRef}></p> */}
                {/* <p ref={animTimeEndElemRef}></p> */}
                {/* <p ref={animDurationElemRef}></p> */}
                {/* <p ref={finalDrawCountElemRef}></p> */}
                {/* <p ref={fpsElemRef}></p> */}
              </div>
            </div>

            <FontAwesomeIcon
              style={{
                position: "fixed",
                zIndex: 3,
                cursor: "pointer",
                color: "white",
                backgroundColor: "transparent !important",
                ...zenViewerStyle,
              }}
              className={`${
                UIState.fadeHide ? "slide-out-right" : "slide-in-right"
              }`}
              icon={faClose}
              size="2x"
              onPointerEnter={() => {
                setUIState((state) => ({
                  ...state,
                  infoFocused: true,
                }));
              }}
              onPointerLeave={() => {
                setUIState((state) => ({
                  ...state,
                  infoFocused: false,
                }));
              }}
              onClick={() => {
                // if (UIState.infoShowing) {
                //   setUIState((state) => ({ ...state, infoShowing: false }));
                //   return;
                // }
                setClosingUI(true);
                // setUIState((state) => ({
                //   ...state,
                //   // infoShowing: false,
                //   active: false,
                // }));
              }}
            />
          </div>
        </Backdrop>
      )}

      <Dialog
        onClose={() => setColorModalOpen(false)}
        open={colorModalOpen}
        PaperProps={{
          sx: {
            background: "transparent",
            boxShadow: "none",
            outline: "none",
            alignItems: "center",
          },
        }}
      >
        <SketchPicker
          color={
            fractalPropertiesState.colors.length > 0
              ? editingColor !== -1
                ? rgbaToHex(fractalPropertiesState.colors[editingColor])
                : rgbaToHex(
                    fractalPropertiesState.colors[
                      fractalPropertiesState.colors.length - 1
                    ]
                  )
              : "#ffffff"
          }
          onChangeComplete={(color) => {
            const colors = [...fractalPropertiesState.colors];

            let index = editingColor === -1 ? colors.length - 1 : editingColor;
            colors[
              index
            ] = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
            setFractalPropertiesState((s) => ({
              ...s,
              colors,
              colorsChanged: true,
            }));
          }}
        />
        <DialogActions
          sx={{
            background: "transparent",
            justifyContent: "center",
            display: "inline-flex",
          }}
        >
          <Button
            onClick={() => {
              const color = generateRandomColor();
              const colors = [...fractalPropertiesState.colors];
              colors[
                colors.length - 1
              ] = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},1)`;
              setFractalPropertiesState((s) => ({
                ...s,
                colors,
                colorsChanged: true,
              }));
            }}
            variant="contained"
          >
            Random
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const colors = [...fractalPropertiesState.colors];
              if (editingColor === -1) {
                colors.pop();
              } else {
                colors.splice(editingColor, 1);
              }
              setFractalPropertiesState((s) => ({
                ...s,
                colors,
                colorsChanged: true,
              }));
              setColorModalOpen(false);
            }}
          >
            Delete
          </Button>
          <Button onClick={() => setColorModalOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      {webGLAvailable && !UIState.active && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 1000,
            ">*": {
              color: "white",
              fontSize: ".65em !important",
              mb: ".5em !important",
            },
          }}
        >
          <Typography
            onClick={() => {
              setAnimationState((s) => ({ ...s, useWebGL: !s.useWebGL }));
            }}
            sx={{
              color: "white",
              textDecoration: "underline",

              "&:hover": {
                cursor: "pointer",
                textDecoration: "underline",
                fontWeight: "bold",
              },
            }}
          >
            {animationState.useWebGL
              ? "Disable WebGL for better performance"
              : "Enable WebGL for better visuals."}
          </Typography>
          {/* <Typography>
            Device Memory: {navigator.deviceMemory || "Unknown"}
          </Typography>
          <Typography>
            Logical Cores: {navigator.hardwareConcurrency || "Unknown"}
          </Typography>
          {drawCanvasInfo !== null && (
            <>
              <Typography>GPU: {drawCanvasInfo.gpu}</Typography>
              <Typography>
                Max Texture Size: {drawCanvasInfo.maxTextureSize}
              </Typography>
              <Typography>
                Max Vertex Uniform Vectors:{" "}
                {drawCanvasInfo.maxVertexUniformVectors}
              </Typography>
            </>
          )} */}
        </Box>
      )}

      {/* {webGLAvailable && !animationState.useWebGL && !UIState.active && (
        <Typography
          onClick={() => {
            setAnimationState((s) => ({ ...s, useWebGL: true }));
          }}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            color: "white",
            zIndex: 1000,
            fontSize: ".65em",
            color: "white",
            textDecoration: "underline",

            "&:hover": {
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "bold",
            },
          }}
        >
          Enable WebGL for better visuals.
        </Typography>
      )} */}

      <div className={bgType ?? "fractal"}>
        <canvas
          ref={drawCanvas}
          className={"canvas"}
          id="draw"
          style={{
            display: animationState.useWebGL ? "none" : "block",
          }}
        />
        <WebGL
          loaded={true}
          canvas2D={textureRef.current}
          shouldRender={animationState.useWebGL}
          onSceneCreated={(canvas, renderer) => {
            // drawCanvasElem.current = canvas;
            // console.log("WebGL Scene Created");
            const gl = renderer.getContext();
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            const gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            const maxVertexUniformVectors = gl.getParameter(
              gl.MAX_VERTEX_UNIFORM_VECTORS
            );
            setDrawCanvasInfo({
              gpu,
              maxTextureSize,
              maxVertexUniformVectors,
            });
          }}
          onWebGLUnavailable={() => {
            // originalFractalProperties.colors = [
            //   "rgba(255,255,255,.3)",
            //   "rgba(255,255,255,.6)",
            // ];
            setAnimationState((s) => ({ ...s, useWebGL: false }));
            setWebGLAvailable(false);
            // drawCanvasElem.current = drawCanvas.current;
          }}
          xDriftFactor={fractalPropertiesState.webGL.xDriftFactor}
          yDriftFactor={fractalPropertiesState.webGL.yDriftFactor}
          noiseScale={fractalPropertiesState.webGL.noiseScale}
          distortion={fractalPropertiesState.webGL.distortion}
        />
        {!UIState.active /*&& (bgBlur === undefined || bgBlur <= 0.2)*/ && (
          <IconButton
            size="large"
            id="zen-viewer"
            sx={{
              position: "fixed",
              zIndex: 1000,
              cursor: "pointer",
              color: "white",
              transform: "scale(1.5)",
              ...zenViewerStyle,
              zIndex: 99999,
            }}
            onClick={() => {
              if (onToggleUI) onToggleUI(true);
              // if (!drawParams.isDrawing) handleResize();

              setUIState((state) => ({
                ...state,
                // infoShowing: false,
                active: true,
              }));
            }}
            className={"brush-icon wiggle"}
          >
            <BrushIcon />
          </IconButton>
        )}
      </div>
    </>
  );
};
