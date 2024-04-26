import React, { useEffect, useRef } from "react";
import Scene from "./fractalScene";
import { isMobileClient } from "../../../util/misc";
import { isMobile } from "mobile-device-detect";

export default ({
  canvas2D,
  onWebGLUnavailable,
  onSceneCreated,
  shouldRender = true,
  usePostProcessing = true,
  xDriftFactor,
  yDriftFactor,
  noiseScale,
  distortion,
}) => {
  const canvas3DRef = React.useRef(null);
  const scene = useRef(new Scene());

  useEffect(() => {
    scene.current.setParams(
      xDriftFactor,
      yDriftFactor,
      noiseScale,
      distortion,
      shouldRender,
      usePostProcessing
    );
  }, [
    xDriftFactor,
    yDriftFactor,
    noiseScale,
    distortion,
    shouldRender,
    usePostProcessing,
  ]);

  useEffect(() => {
    if (!canvas3DRef.current || isMobileClient() || isMobile) {
      onWebGLUnavailable();
      return;
    }

    if (canvas3DRef.current) {
      const gl = canvas3DRef.current.getContext("webgl2");
      if (!gl) {
        onWebGLUnavailable();
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const bsr =
        //@ts-ignore
        gl.webkitBackingStorePixelRatio ||
        //@ts-ignore
        gl.mozBackingStorePixelRatio ||
        //@ts-ignore
        gl.msBackingStorePixelRatio ||
        //@ts-ignore
        gl.oBackingStorePixelRatio ||
        //@ts-ignore
        gl.backingStorePixelRatio ||
        1;

      const ratio = dpr / bsr;

      canvas3DRef.current.width = window.innerWidth * ratio;
      canvas3DRef.current.height = window.innerHeight * ratio;
      canvas3DRef.current.style.width = `${window.innerWidth}px`;
      canvas3DRef.current.style.height = `${window.innerHeight}px`;
    }
  }, [canvas3DRef.current]);

  useEffect(() => {
    if (!canvas3DRef.current) {
      return;
    }

    if (canvas3DRef.current) {
      const gl = canvas3DRef.current.getContext("webgl2");
      if (!gl) {
        return;
      }

      if (canvas2D) {
        console.log('creating scene')
        scene.current.dispose();
        scene.current.initScene(canvas2D, canvas3DRef.current, onSceneCreated);
      }
    }

    return () => {
      // dispose
      scene.current.dispose();
    };
  }, [canvas2D, canvas3DRef.current]);

  useEffect(() => {
    return () => {
      // dispose
      scene.current.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvas3DRef}
        className="canvas"
        style={{
          display: shouldRender ? "block" : "none",
        }}
      ></canvas>
    </>
  );
};
