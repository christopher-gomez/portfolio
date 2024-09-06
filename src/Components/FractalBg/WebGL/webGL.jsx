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
  canBurstInteract = false,
  shouldBlur = false,
  xDriftFactor,
  yDriftFactor,
  noiseScale,
  distortion,
  loaded,
  introComplete
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
      usePostProcessing,
      canBurstInteract,
      shouldBlur,
      introComplete
    );
  }, [
    xDriftFactor,
    yDriftFactor,
    noiseScale,
    distortion,
    shouldRender,
    usePostProcessing,
    canBurstInteract,
    shouldBlur,
    introComplete
  ]);

  useEffect(() => {
    const onResize = () => {
      const gl = canvas3DRef.current.getContext("webgl2");

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

      // create();
    };

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
      window.addEventListener("resize", onResize);
    }

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [canvas3DRef.current]);

  const create = () => {
    if (!canvas3DRef.current || !canvas2D) {
      return;
    }

    const gl = canvas3DRef.current.getContext("webgl2");
    if (!gl) {
      return;
    }

    scene.current.dispose();
    scene.current.initScene(canvas2D, canvas3DRef.current, onSceneCreated);
  };

  useEffect(() => {
    if (!loaded) return;

    if (canvas2D && canvas3DRef.current) create();

    return () => {
      // clearTimeout(time);
      // dispose
      if (scene.current) scene.current.dispose();
    };
  }, [canvas2D, canvas3DRef.current, loaded]);

  useEffect(() => {
    return () => {
      // dispose
      if (scene.current) scene.current.dispose();
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
