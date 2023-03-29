import {
  faBars,
  faClose,
  faExpand,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FormControlLabel,
  FormGroup,
  List,
  Slider,
  SwipeableDrawer,
  Switch,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import "../../styles/CSS/FractalBG.css";
import { hexToRgb, saturateByTenth } from "../../util/color";
import { calcElemScrollY } from "../../util/scroll";
import Backdrop from "../Backdrop";

/**
 * @param {{color: {bgColor: string, textColor: string, altBg: string, altText: string}}}
 */
export default (props) => {
  const {
    bgType,
    onFractalPosition,
    color,
    bgOpacity,
    bgBlur,
    toggleRandomTheme,
    allowZenMode,
    onToggleUI,
    onFadeOutBegin,
    onFadeOutEnd,
    ...others
  } = props;

  const [UIState, setUIState] = useState({
    active: false,
    infoShowing: false,
    curFPS: 0,
    fadeHide: true,
    menuShowing: false,
  });

  useEffect(() => {
    const handleMouseMove = () => {
      clearTimeout(mouseMoveTimeout.current);
      document.body.style.cursor = "auto";
      setUIState((state) => ({ ...state, fadeHide: false }));

      mouseMoveTimeout.current = setTimeout(() => {
        document.body.style.cursor = "none";
        setUIState((state) => ({
          ...state,
          fadeHide: true,
          menuShowing: false,
        }));
      }, 3000);
    };

    if (UIState.active || UIState.infoShowing || UIState.menuShowing) {
      clearTimeout(mouseMoveTimeout.current);
      mouseMoveTimeout.current = setTimeout(() => {
        document.body.style.cursor = "none";
        setUIState((state) => ({
          ...state,
          fadeHide: true,
          menuShowing: false,
        }));
      }, 3000);
      window.addEventListener("pointermove", handleMouseMove);
    } else {
      clearTimeout(mouseMoveTimeout.current);
      window.removeEventListener("pointermove", handleMouseMove);
      document.body.style.cursor = "auto";
      setUIState((state) => ({ ...state, fadeHide: false }));
    }

    return () => {
      clearTimeout(mouseMoveTimeout.current);
      window.removeEventListener("pointermove", handleMouseMove);
    };
  }, [UIState.active, UIState.infoShowing, UIState.menuShowing]);

  const [drawParams, setDrawParams] = useState({
    /* In other experiments, you may wish to use more fractal curves ("paths")
    and allow the radius of them to vary. If so, modify the next three variables.
     */
    numPaths: 2,
    maxMaxRad: 350,
    minMaxRad: 200,

    /* We draw closed curves with varying radius. The factor below should be set between 0 and 1,
    representing the size of the smallest radius with respect to the largest possible.
    */
    minRadFactor: 0.0025,

    /* The number of subdividing steps to take when creating a single fractal curve. 
     Can use more, but anything over 10 (thus 1024 points) is overkill for a moderately sized canvas.
     */
    iterations: 6,

    //number of curves to draw on every tick of the timer
    drawsPerFrame: 6,

    bgColor: "#FFFFFF",

    lineWidth: 0.5,

    isDrawing: false,
    isErasing: false,

    curDrawnFrame: null,

    // bgOpacity: 1,
    // bgBlur: 0,

    shouldAutoChangeColor: false,
  });

  const drawCanvas = useRef();
  const eraseCanvas = useRef();
  const drawCtx = useRef();
  const eraseCtx = useRef();

  const growingFractal = useRef({
    paths: [],
    updateId: undefined,
    drawCount: 0,
    theta: 0,
    previousDelta: 0,
    fpsLimit: 30,
    shouldAnimate: true,
    frameTime: 0,
    curSinFactor: -20,
  });
  const shrinkingFractal = useRef({
    ...growingFractal.current,
    shouldAnimate: false,
  });

  const curColor = useRef(null);

  const scrollAmt = useRef(0);
  const animationRunning = useRef(false);
  const drawCanvasElem = useRef();
  const eraseCanvasElem = useRef();
  const canvasElemInitialPos = useRef();
  const canvasElemTotalOffset = useRef(0);
  const scrollingDir = useRef(1);
  const canvasScrollAnimFrame = useRef();

  const TWO_PI = 2 * Math.PI;

  const resizeTimeoutRef = useRef();

  useEffect(() => {
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);

    setDrawParams((state) => ({
      ...state,
      isDrawing: false,
      isErasing: false,
    }));

    if (onFractalPosition !== undefined)
      onFractalPosition({
        eraseX: 0,
        eraseY: 0,
        drawX: 0,
        drawY: 0,
        isDrawing: true,
        isErasing: false,
      });

    if (eraseCanvas.current) {
      cancelAnimationFrame(shrinkingFractal.current.updateId);
      shrinkingFractal.current.updateId = null;
      curShrinkFPS.current = 0;

      eraseCanvas.current.height = window.innerHeight + 100;
      eraseCanvas.current.width = window.innerWidth;
    }

    if (drawCanvas.current) {
      cancelAnimationFrame(growingFractal.current.updateId);
      growingFractal.current.updateId = null;
      curGrowFPS.current = 0;

      drawCanvas.current.height = window.innerHeight + 100;
      drawCanvas.current.width = window.innerWidth;

      resizeTimeoutRef.current = setTimeout(() => init(), 500);
    }
  }, [drawParams.numPaths]);

  const handleResize = () => {
    if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);

    setDrawParams((state) => ({
      ...state,
      isDrawing: false,
      isErasing: false,
    }));

    if (onFractalPosition !== undefined)
      onFractalPosition({
        eraseX: 0,
        eraseY: 0,
        drawX: 0,
        drawY: 0,
        isDrawing: true,
        isErasing: false,
      });

    if (eraseCanvas.current) {
      cancelAnimationFrame(shrinkingFractal.current.updateId);
      shrinkingFractal.current.updateId = null;
      curShrinkFPS.current = 0;

      eraseCanvas.current.height = window.innerHeight + 100;
      eraseCanvas.current.width = window.innerWidth;
    }

    if (drawCanvas.current) {
      cancelAnimationFrame(growingFractal.current.updateId);
      growingFractal.current.updateId = null;
      curGrowFPS.current = 0;

      drawCanvas.current.height = window.innerHeight + 100;
      drawCanvas.current.width = window.innerWidth;

      resizeTimeoutRef.current = setTimeout(() => init(), 500);
    }
  };

  useEffect(() => {
    const handleScrollY = () => {
      if (!drawCanvasElem.current) {
        drawCanvasElem.current = document.querySelector("#draw");
        canvasElemInitialPos.current = drawCanvasElem.current.offsetTop;
      }

      if (!eraseCanvasElem.current) {
        eraseCanvasElem.current = document.querySelector("#erase");
      }

      const ease = 0.05;

      function animate_scroll() {
        scrollAmt.current++;

        let curScrollDir = scrollingDir.current;

        let info = calcElemScrollY(".canvas");
        if (info.percentage < scrollingDir.current) scrollingDir.current = 0;
        else scrollingDir.current = 1;

        if (
          curScrollDir != scrollingDir.current &&
          canvasScrollAnimFrame.current
        ) {
          cancelAnimationFrame(canvasScrollAnimFrame.current);
          animationRunning.current = false;
          scrollAmt.current = 0;
          canvasScrollAnimFrame.current = null;
        }

        if (!animationRunning.current) {
          animationRunning.current = true;
          animation_loop();
        }
      }

      function animation_loop() {
        let current_offset = window.pageYOffset;

        let difference = current_offset - canvasElemTotalOffset.current;
        difference *= ease;

        if (Math.abs(difference) < 0.025) {
          scrollAmt.current = 0;

          canvasElemTotalOffset.current = current_offset;
          animationRunning.current = false;
          canvasScrollAnimFrame.current = null;
          return;
        }

        canvasElemTotalOffset.current += difference;

        drawCanvasElem.current.style.top = `${
          canvasElemInitialPos.current - canvasElemTotalOffset.current * 0.15
        }px`;

        eraseCanvasElem.current.style.top = `${
          canvasElemInitialPos.current - canvasElemTotalOffset.current * 0.15
        }px`;

        canvasScrollAnimFrame.current = requestAnimationFrame(animation_loop);
      }

      animate_scroll();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScrollY);

    return () => {
      if (growingFractal.current.updateId)
        cancelAnimationFrame(growingFractal.current.updateId);

      if (shrinkingFractal.current.updateId)
        cancelAnimationFrame(shrinkingFractal.current.updateId);

      if (canvasScrollAnimFrame.current)
        cancelAnimationFrame(canvasScrollAnimFrame.current);

      curGrowFPS.current = 0;
      curShrinkFPS.current = 0;

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScrollY);
    };
  }, []);

  useEffect(() => {
    if (drawCanvas.current) {
      drawCanvas.current.height = window.innerHeight + 100;
      drawCanvas.current.width = window.innerWidth;
      drawCtx.current = drawCanvas.current.getContext("2d");
    }
  }, [drawCanvas]);

  useEffect(() => {
    if (eraseCanvas.current) {
      eraseCanvas.current.height = window.innerHeight + 100;
      eraseCanvas.current.width = window.innerWidth;
      eraseCtx.current = eraseCanvas.current.getContext("2d");
    }
  }, [eraseCanvas]);

  useEffect(() => {
    if (curColor.current === null) {
      curColor.current = color;

      cancelAnimationFrame(growingFractal.current.updateId);
      curGrowFPS.current = 0;
      curShrinkFPS.current = 0;

      if (drawCtx.current) {
        clearCanvas(drawCtx.current);
      }

      if (eraseCtx.current) {
        clearCanvas(eraseCtx.current);
      }

      init();
    } else {
      curColor.current = color;

      for (let i = 0; i < growingFractal.current.paths.length; i++) {
        let c = growingFractal.current.paths[i];
        c.color = getGradient(c.originalMaxR, c.originalMinR);
        growingFractal.current.paths[i] = c;
      }

      for (let i = 0; i < shrinkingFractal.current.paths.length; i++) {
        let c = shrinkingFractal.current.paths[i];
        c.color = getGradient(c.originalMaxR, c.originalMinR, true);
        shrinkingFractal.current.paths[i] = c;
      }

      if (!drawParams.isDrawing) init();
    }
  }, [color]);

  // useEffect(() => {
  //   if (bgOpacity !== undefined) {
  //     setDrawParams((state) => ({ ...state, bgOpacity: bgOpacity }));
  //   }
  // }, [bgOpacity]);

  // useEffect(() => {
  //   if (bgBlur !== undefined) {
  //     setDrawParams((state) => ({ ...state, bgBlur: bgBlur }));
  //   }
  // }, [bgBlur]);

  useEffect(() => {
    if (drawParams.isDrawing) {
      if (growingFractal.current.updateId) {
        growingFractal.current.shouldAnimate = false;
        cancelAnimationFrame(growingFractal.current.updateId);
        curGrowFPS.current = 0;
      }

      // growingFractal.current.updateId = setInterval(() => {
      //   onTimer();
      // }, 1000 / 64);
      beginAnimate(growingFractal.current, false);
    } else {
      growingFractal.current.shouldAnimate = false;

      if (growingFractal.current.updateId) {
        cancelAnimationFrame(growingFractal.current.updateId);
        growingFractal.current.updateId = null;
        curGrowFPS.current = 0;
      }
    }
  }, [drawParams.isDrawing]);

  useEffect(() => {
    if (drawParams.isErasing) {
      if (shrinkingFractal.current.updateId) {
        shrinkingFractal.current.shouldAnimate = false;
        cancelAnimationFrame(shrinkingFractal.current.updateId);
        curShrinkFPS.current = 0;
      }

      // shrinkingFractal.current.updateId = setInterval(() => {
      //   onTimer(true);
      // }, 1000 / 64);
      beginAnimate(shrinkingFractal.current, true);
    } else {
      shrinkingFractal.current.shouldAnimate = false;

      if (shrinkingFractal.current.updateId) {
        cancelAnimationFrame(shrinkingFractal.current.updateId);
        shrinkingFractal.current.updateId = null;
        curShrinkFPS.current = 0;
      }
    }
  }, [drawParams.isErasing]);

  function clearCanvas(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function init(isErase) {
    let fractal = isErase ? shrinkingFractal.current : growingFractal.current;
    let _ctx = isErase ? eraseCtx.current : drawCtx.current;

    fractal.drawCount = 0;

    _ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (!isErase) {
      clearCanvas(_ctx);
      setPaths();
      setDrawParams((state) => ({ ...state, isDrawing: true }));
    } else setDrawParams((state) => ({ ...state, isErasing: true }));

    return fractal;
  }

  function getGradient(maxR, minR, isErase) {
    //define gradient

    let cx = isErase ? eraseCtx.current : drawCtx.current;

    let grad = cx.createRadialGradient(0, 0, minR, 0, 0, maxR);

    if (!isErase) {
      if (curColor.current == null) {
        grad.addColorStop(1, "rgba(0,170,200,0.2)");
        grad.addColorStop(0, "rgba(0,20,170,0.2)");
      } else {
        let { r, g, b } = hexToRgb(curColor.current.textColor);

        grad.addColorStop(0, `rgba(${r},${g},${b},.8)`);

        let sat = { r, g, b };
        for (let i = 0; i < 10; i++) {
          sat = saturateByTenth({ ...sat });
        }

        grad.addColorStop(1, `rgba(${sat.r},${sat.g},${sat.b},0.1)`);
      }
    } else {
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,1)");
    }

    return grad;
  }

  function setPaths() {
    var i;
    var maxR, minR;
    var grad;

    let paths = [];

    for (i = 0; i < drawParams.numPaths; i++) {
      maxR =
        drawParams.minMaxRad +
        Math.random() * (drawParams.maxMaxRad - drawParams.minMaxRad);
      minR = drawParams.minRadFactor * maxR;

      grad = getGradient(maxR, minR);

      let originalPhase = Math.random() * TWO_PI;
      let originalGlobalPhase = Math.random() * TWO_PI;

      var newCircle = {
        originalMaxR: maxR,
        originalMinR: minR,
        centerX: -maxR,
        centerY: drawCanvas.current.height / 2 - 50,
        maxRad: maxR,
        minRad: minR,
        color: grad, //can set a gradient or solid color here.
        //fillColor: "rgba(0,0,0,1)",
        param: 0,
        changeSpeed: 1 / 250,
        originalPhase: originalPhase,
        phase: originalPhase, //the phase to use for a single fractal curve.
        originalGlobalPhase: originalGlobalPhase,
        globalPhase: originalGlobalPhase, //the curve as a whole will rise and fall by a sinusoid.
      };

      newCircle.pointList1 = setLinePoints(drawParams.iterations);
      newCircle.pointList2 = setLinePoints(drawParams.iterations);

      newCircle.originalPointLists = {
        pointList1: { i: 0, list: [newCircle.pointList1] },
        pointList2: { i: 0, list: [newCircle.pointList2] },
      };

      paths.push(newCircle);

      growingFractal.current.theta = newCircle.phase;
    }

    growingFractal.current.curSinFactor =
      Math.floor(Math.random() * (-20 + 80 + 1)) - 80;
    growingFractal.current.paths = paths;
  }

  //Here is the function that defines a noisy (but not wildly varying) data set which we will use to draw the curves.
  function setLinePoints(iterations, curPos) {
    var pointList = {};
    pointList.first = { x: 0, y: 1 };
    var lastPoint = { x: 1, y: 1 };
    var minY = 0.9;
    var maxY = 1;
    var point;
    var nextPoint;
    var dx, newX, newY;
    var ratio;

    var minRatio = 0.5;

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

  function beginAnimate(fractal, isErase) {
    fractal.shouldAnimate = false;
    cancelAnimationFrame(fractal.updateId);

    fractal.shouldAnimate = true;
    fractal.frameTime = 0;
    fractal.updateId = requestAnimationFrame((d) => {
      animate(d, fractal, isErase);
    });
  }

  const curGrowFPS = useRef(60);
  const curShrinkFPS = useRef(60);
  function animate(currentDelta, fractal, isErase) {
    if (!fractal.updateId) return;

    if (fractal.shouldAnimate)
      fractal.updateId = requestAnimationFrame((d) => {
        animate(d, fractal, isErase);
      });

    //if browser doesn't support requestAnimationFrame, generate our own timestamp using Date:
    var delta = currentDelta || new Date().getTime();
    delta = delta - fractal.previousDelta;
    fractal.previousDelta = currentDelta;

    fractal.frameTime += (delta - fractal.frameTime) / 40;

    if (
      1000 / fractal.frameTime < 1000 / fractal.fpsLimit ||
      !fractal.shouldAnimate
    ) {
      return;
    }

    if (!isErase) curGrowFPS.current = Math.round(1000 / fractal.frameTime);
    else curShrinkFPS.current = Math.round(1000 / fractal.frameTime);

    fractal.shouldAnimate = false;
    onTimer(isErase);

    if (fractal.updateId) fractal.shouldAnimate = true;
  }

  const eraseTimeout = useRef();

  function onTimer(isErase) {
    let drawsPerFrame = drawParams.drawsPerFrame;

    let fractal = isErase ? shrinkingFractal.current : growingFractal.current;

    //draw paths
    for (let j = 0; j < drawsPerFrame; j++) {
      fractal.drawCount++;
      fractal.paths = draw(
        [...fractal.paths],
        fractal.drawCount,
        (paths) => {
          if (fractal.updateId === null) return;

          cancelAnimationFrame(fractal.updateId);
          fractal.updateId = null;

          if (!isErase) {
            // curGrowFPS.current = 0;

            // if (shrinkingFractal.current.paths.find((x) => paths.includes(x)))
            //   return;

            for (let i = 0; i < paths.length; i++) {
              let _fractal = paths[i];
              let grad = getGradient(
                _fractal.originalMaxR,
                _fractal.originalMinR,
                true
              );

              _fractal.centerX = -_fractal.originalMaxR;
              _fractal.centerY = drawCanvas.current.height / 2 - 50;
              _fractal.maxRad = _fractal.originalMaxR;
              _fractal.minRad = _fractal.originalMinR;
              _fractal.color = grad;
              //circle.fillColor: "rgba(0,0,0,1)",
              _fractal.param = 0;
              _fractal.changeSpeed = 1 / 250;
              _fractal.phase = _fractal.originalPhase;
              _fractal.globalPhase = _fractal.originalGlobalPhase;
              _fractal.color = grad;
              _fractal.pointList1 =
                _fractal.originalPointLists.pointList1.list[0];
              _fractal.pointList2 =
                _fractal.originalPointLists.pointList2.list[0];
              paths[i] = _fractal;
            }
            shrinkingFractal.current.theta = paths[0].phase;
            shrinkingFractal.current.paths = paths;
          } else {
            curShrinkFPS.current = 0;
          }
        },
        isErase
      );
    }

    if (fractal.updateId === null) {
      fractal.shouldAnimate = false;

      if (!isErase) {
        if (shrinkingFractal.current.paths.length > 0) {
          let temp = drawCtx.current.getImageData(
            0,
            0,
            drawCanvas.current.width,
            drawCanvas.current.height
          );

          eraseCanvas.current.height = window.innerHeight + 100;
          eraseCanvas.current.width = window.innerWidth;

          eraseCtx.current.putImageData(temp, 0, 0);

          clearCanvas(drawCtx.current);

          eraseTimeout.current = window.setTimeout(() => {
            eraseCanvas.current.classList.add("fade");
          }, 250);
        } else init();
      } else {
        setDrawParams((state) => ({ ...state, isErasing: false }));
      }
    }

    return fractal;
  }

  function draw(paths, drawCount, onEndReached, isErase) {
    var i;
    var c;
    var rad;
    var point1, point2;
    var x0, y0;
    var cosParam;

    var xSqueeze = isErase ? 0.5 : 0.5; //cheap 3D effect by shortening in x direction.

    var yOffset;

    let endReached = false;

    let _ctx = isErase ? eraseCtx.current : drawCtx.current;
    let theta = isErase
      ? shrinkingFractal.current.theta
      : growingFractal.current.theta;

    for (i = 0; i < paths.length; i++) {
      c = paths[i];
      c.param += c.changeSpeed;

      if (c.param >= 1) {
        c.param = 0;

        if (isErase) {
          const bubbleSort = (list) => {
            let sentinel = { next: list.first };

            let dirty = true;
            while (dirty) {
              dirty = false;
              let node = sentinel;
              while (node.next && node.next.next) {
                let first = node.next;
                let second = first.next;
                if (first.x > second.x) {
                  // swap
                  node.next = second;
                  first.next = second.next;
                  second.next = first;
                  dirty = true;
                }
                node = node.next;
              }
            }

            return list;
          };

          c.pointList1 =
            c.originalPointLists.pointList1.list[
              ++c.originalPointLists.pointList1.i
            ];

          // if (
          //   c.pointList1.first !== undefined &&
          //   c.pointList1.first.next !== undefined
          // )
          //   c.pointList1 = bubbleSort(c.pointList1);

          c.pointList2 =
            c.originalPointLists.pointList2.list[
              ++c.originalPointLists.pointList2.i
            ];

          // if (
          //   c.pointList2.first !== undefined &&
          //   c.pointList2.first.next !== undefined
          // )
          //   c.pointList2 = bubbleSort(c.pointList2);
        } else {
          c.pointList1 = c.pointList2;
          c.originalPointLists.pointList1.list.push(c.pointList1);
          c.pointList2 = setLinePoints(drawParams.iterations);
          c.originalPointLists.pointList2.list.push(c.pointList2);
        }
      }

      cosParam = 0.5 - 0.5 * Math.cos(Math.PI * c.param);

      _ctx.strokeStyle = c.color;
      _ctx.lineWidth = drawParams.lineWidth;
      _ctx.fillStyle = c.color;

      _ctx.beginPath();

      point1 = c.pointList1.first;
      point2 = c.pointList2.first;

      //slowly rotate
      c.phase += 0.0005;

      theta = c.phase;
      //move center
      c.centerX += 0.7;
      c.centerY += 0.0001;

      rad =
        c.minRad +
        (point1.y + cosParam * (point2.y - point1.y)) * (c.maxRad - c.minRad) +
        (isErase ? 0 : 0);

      yOffset =
        growingFractal.current.curSinFactor *
          Math.sin(c.globalPhase + (drawCount / 1000) * TWO_PI) -
        60;

      //stop when off screen
      if (c.centerX > drawCanvas.current.width + drawParams.maxMaxRad) {
        endReached = true;
        break;
      }

      //we are drawing in new position by applying a transform. We are doing this so the gradient will move with the drawing.
      _ctx.setTransform(xSqueeze, 0, 0, 1, c.centerX, c.centerY + yOffset);

      //Drawing the curve involves stepping through a linked list of points defined by a fractal subdivision process.
      //It is like drawing a circle, except with varying radius.
      x0 = xSqueeze * rad * Math.cos(theta);
      y0 = rad * Math.sin(theta);

      _ctx.lineTo(x0, y0);

      while (point1.next != null) {
        point1 = point1.next;
        point2 = point2.next;

        theta =
          TWO_PI * (point1.x + cosParam * (point2.x - point1.x)) + c.phase;
        rad =
          c.minRad +
          (point1.y + cosParam * (point2.y - point1.y)) *
            (c.maxRad - c.minRad) +
          (isErase ? 100 : 0);
        x0 = xSqueeze * rad * Math.cos(theta);
        y0 = rad * Math.sin(theta);
        _ctx.lineTo(x0, y0);
      }
      _ctx.closePath();
      _ctx.stroke();

      if (onFractalPosition !== undefined)
        onFractalPosition({
          eraseX:
            drawParams.isErasing && isErase
              ? c.centerX / eraseCanvas.current.width
              : null,
          eraseY:
            drawParams.isErasing && isErase
              ? (c.centerY + yOffset) / drawCanvas.current.height
              : null,
          drawX:
            drawParams.isDrawing && !isErase
              ? c.centerX / drawCanvas.current.width
              : null,
          drawY:
            drawParams.isDrawing && !isErase
              ? (c.centerY + yOffset) / drawCanvas.current.height
              : null,
          isErasing: drawParams.isErasing,
          isDrawing: drawParams.isDrawing,
        });

      if (isErase) {
        _ctx.fill();
      }

      paths[i] = c;
    }

    if (endReached) {
      if (onEndReached !== undefined) onEndReached(paths);
    }

    return paths;
  }

  const { r, g, b } = hexToRgb(color.textColor);
  const zenViewerStyle = !UIState.active
    ? { bottom: "0", left: "0", padding: "1rem 1rem" }
    : { top: "1em", right: "1em" };

  const mouseMoveTimeout = useRef(null);
  return (
    <>
      {allowZenMode && (
        <Backdrop
          sx={{
            color: "black",
            zIndex: (theme) => theme.zIndex.drawer + 2,
            backgroundColor: UIState.active ? `rgba(0,0,0,0)` : "transparent",
            // backdropFilter: UIState.infoShowing ? 'blur(5px)' : 'none',
          }}
          open={UIState.active}
          // onClick={() => setUIState((state) => ({ ...state, infoShowing: false }))}
        >
          <div
            className={
              "blueprint-container" + (UIState.fadeHide ? " fade" : "")
            }
          >
            <>
              {!UIState.infoShowing && !UIState.menuShowing && (
                <>
                  <FontAwesomeIcon
                    icon={faBars}
                    size="2x"
                    style={{
                      position: "fixed",
                      left: "1.5vw",
                      top: "1.5vh",
                      cursor: "pointer",
                      zIndex: 3,
                      color: "black",
                    }}
                    onClick={() => {
                      setUIState((state) => ({
                        ...state,
                        menuShowing: true,
                      }));
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    size="2x"
                    style={{
                      position: "fixed",
                      right: "1.5vw",
                      bottom: "1.5vh",
                      cursor: "pointer",
                      zIndex: 3,
                      color: "black",
                    }}
                    onClick={() => {
                      setUIState((state) => ({
                        ...state,
                        infoShowing: true,
                      }));
                    }}
                  />
                </>
              )}
              {UIState.infoShowing && !UIState.menuShowing && (
                <>
                  <div className="blueprint-header">
                    <div style={{ display: "flex" }}>
                      <h1>FRACTAL CURVES</h1>
                      {/* <FontAwesomeIcon
                        style={{ marginLeft: "auto" }}
                        icon={faClose}
                        size="2x"
                      /> */}
                    </div>
                    <div
                      style={{
                        marginRight: "55vw",
                        lineHeight: "1.5rem",
                      }}
                    >
                      <p>
                        A fractal generated using a recursive algorithm called
                        the{" "}
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href="https://en.wikipedia.org/wiki/Mandelbrot_set"
                        >
                          "Mandelbrot Set"
                        </a>
                        , a well-known mathematical set of complex numbers.
                      </p>
                      {/* <br/>
                        <p>
                          From ChatGPT: "Overall, the code in this file is quite
                          complex and uses several advanced techniques such as
                          recursion and the Mandelbrot set algorithm. It appears
                          to be well-written and efficiently implemented."
                        </p> */}
                    </div>
                    {/* <div>
                      <p>Growth FPS</p>
                      <p>{curGrowFPS.current} FPS</p>
                    </div>
                    <div>
                      <p>Erase FPS</p>
                      <p>{curShrinkFPS.current} FPS</p>
                    </div> */}
                  </div>
                  <div className="foot">
                    <div className="source">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/christopher-gomez/portfolio/blob/master/src/Components/FractalBg/index.jsx"
                      >
                        Source
                      </a>
                    </div>
                    <div className="fps">
                      <p>
                        {curGrowFPS.current > 0 && curShrinkFPS.current > 0
                          ? Math.round(
                              (curGrowFPS.current + curShrinkFPS.current) / 2
                            )
                          : curGrowFPS.current > 0
                          ? curGrowFPS.current
                          : curShrinkFPS.current > 0
                          ? curShrinkFPS.current
                          : 0}{" "}
                        FPS
                      </p>
                    </div>
                  </div>
                </>
              )}
              <SwipeableDrawer
                sx={{
                  "& .MuiBackdrop-root": {
                    backgroundColor: UIState.active
                      ? `rgba(0,0,0,.15)`
                      : "transparent",
                  },
                }}
                anchor={"left"}
                open={UIState.menuShowing && !UIState.infoShowing}
                onClose={(event) => {
                  if (
                    event &&
                    event.type === "keydown" &&
                    (event.key === "Tab" || event.key === "Shift")
                  ) {
                    return;
                  }

                  setUIState((s) => ({
                    ...s,
                    menuShowing: false,
                  }));
                }}
                onOpen={(event) => {
                  if (
                    event &&
                    event.type === "keydown" &&
                    (event.key === "Tab" || event.key === "Shift")
                  ) {
                    return;
                  }

                  setUIState((s) => ({
                    ...s,
                    menuShowing: true,
                    infoShowing: false,
                  }));
                }}
              >
                <Box
                  sx={{
                    width: 250,
                  }}
                  role="presentation"
                  // onClick={toggleDrawer(anchor, false)}
                  // onKeyDown={toggleDrawer(anchor, false)}
                >
                  <List>
                    {/* {["Inbox", "Starred", "Send email", "Drafts"].map(
                        (text, index) => (
                          <ListItem key={text} disablePadding>
                            <ListItemButton>
                              <ListItemText primary={text} />
                            </ListItemButton>
                          </ListItem>
                        )
                      )} */}
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={drawParams.shouldAutoChangeColor}
                            inputProps={{ "aria-label": "controlled" }}
                            onChange={(e) =>
                              (drawParams.shouldAutoChangeColor =
                                e.target.checked)
                            }
                          />
                        }
                        label="Cycle Colors"
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Slider
                            aria-label="Num Fractals"
                            value={drawParams.numPaths}
                            getAriaValueText={() =>
                              drawParams.numPaths.toString()
                            }
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={1}
                            max={2}
                            onChange={(e, v) =>
                              setDrawParams((s) => ({ ...s, numPaths: v }))
                            }
                          />
                        }
                        label="Num Fractals"
                      />
                    </FormGroup>
                  </List>
                  {/* <Divider />
                    <List>
                      {["All mail", "Trash", "Spam"].map((text, index) => (
                        <ListItem key={text} disablePadding>
                          <ListItemButton>
                            <ListItemText primary={text} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List> */}
                </Box>
              </SwipeableDrawer>
            </>

            {!UIState.menuShowing && (
              <FontAwesomeIcon
                style={{
                  position: "fixed",
                  zIndex: 3,
                  cursor: "pointer",
                  color: "black",
                  ...zenViewerStyle,
                }}
                icon={faClose}
                size="2x"
                onClick={() => {
                  if (UIState.infoShowing) {
                    setUIState((state) => ({ ...state, infoShowing: false }));
                    return;
                  }

                  if (onToggleUI) onToggleUI(false);
                  setUIState((state) => ({
                    ...state,
                    infoShowing: false,
                    active: false,
                  }));
                }}
              />
            )}
          </div>
        </Backdrop>
      )}
      <div className={bgType ?? "fractal"}>
        <canvas
          ref={eraseCanvas}
          className={"canvas"}
          id="erase"
          style={{
            opacity: bgOpacity ?? 1,
          }}
          onAnimationEnd={() => {
            setDrawParams((state) => ({ ...state, isDrawing: false }));

            clearCanvas(eraseCtx.current);
            eraseCanvas.current.classList.remove("fade");

            if (onFadeOutEnd) onFadeOutEnd();

            if (drawParams.shouldAutoChangeColor) toggleRandomTheme();
            else
              setTimeout(() => {
                init();
              }, 500);
          }}
          onAnimationStart={() => {
            if (onFadeOutBegin) onFadeOutBegin();
          }}
        />
        <canvas
          ref={drawCanvas}
          className={"canvas"}
          id="draw"
          style={{
            opacity: bgOpacity ?? 1,
          }}
        />
        <div
          style={{
            height: "100%",
            width: "100%",
            backdropFilter: `blur(${bgBlur ?? 0}px)`,
            pointerEvents: "all",
          }}
        ></div>
        {!UIState.active && (bgBlur === undefined || bgBlur <= .2) && (
          <FontAwesomeIcon
            style={{
              position: "fixed",
              zIndex: 1000,
              cursor: "pointer",
              color: "black",
              ...zenViewerStyle,
            }}
            icon={faExpand}
            size="2x"
            onClick={() => {
              if (onToggleUI) onToggleUI(true);
              setUIState((state) => ({
                ...state,
                infoShowing: false,
                active: true,
              }));
            }}
          />
        )}
      </div>
    </>
  );
};
