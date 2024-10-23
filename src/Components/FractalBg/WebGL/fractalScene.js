import * as THREE from "three";
import { FragmentShader, VertexShader } from "./particles";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import fractalShader from "./fractalShader";
import { createNoise3D } from "simplex-noise";
import Stats from "stats.js";
import { applyEasing, smoothLerp } from "../../../util/misc";

var ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1,
  NO_BLOOM_SCENE = 2;

/**
 * Description placeholder
 *
 * @type {{ firstFullRenderComplete: boolean; beganCompleteSequence: boolean; hitClimax: boolean; hitLow: boolean; totallyComplete: boolean; }}
 */
var INITIAL_FIRST_RENDER_COMPLETE_STATE = {
  firstFullRenderComplete: false,
  beganCompleteSequence: false,
  hitClimax: false,
  hitLow: false,
  totallyComplete: true,
};

var INITIAL_FRACTAL_UNIFORM_TRANSITION_STATE = {
  noiseScale: {
    target: 1.75,
    previousTarget: 1.75,
    original: 1.75,
    current: 1.75,
    start: 1.75,
    factor: 0,
    state: "idle",
    currentTime: 0,
    duration: 100,

    hitDisturbedPeak: false,

    EASE_TYPE: "linear",

    BLURRED_TARGET: 4.0,
    UNBLURRED_TARGET: 1.75,
  },
  distortion: {
    target: 0.0,
    previousTarget: 0.0,
    current: 0.0,
    start: 0.0,

    original: 0.01,
    state: "idle",
    currentTime: 0,
    unblurredDuration: 10,
    blurredDuration: 10,

    EASE_TYPE: "linear",

    BLURRED_TARGET: 1.0,
    UNBLURRED_TARGET: 0.0,

    factor: 0,
  },
  xDriftFactor: {
    target: 0.1,
    previousTarget: 0.1,
    original: 0.1,
    current: 0.1,
    start: 0.1,
    state: "idle",
    currentTime: 0,
    unblurredDuration: 0.25,
    blurredDuration: 0.25,
    EASE_TYPE: "linear",
    BLURRED_TARGET: 0.01,
    UNBLURRED_TARGET: 0.1,
  },
  yDriftFactor: {
    target: 0.05,
    previousTarget: 0.05,
    original: 0.05,
    current: 0.05,
    start: 0.05,
    state: "idle",
    currentTime: 0,
    unblurredDuration: 0.25,
    blurredDuration: 0.25,
    EASE_TYPE: "linear",
    BLURRED_TARGET: 0.01,
    UNBLURRED_TARGET: 0.05,
  },
};

/**
 * Description placeholder
 *
 * @type {{ flashClimax: boolean; flashFinish: boolean; flashTime: number; flashDuration: number; }}
 */
var INITIAL_BLUR_EFFECT_STATE = {
  flashClimax: false,
  flashFinish: false,
  flashTime: 0,
  flashDuration: 5.5,
};

var INITIAL_BLOOM_STATE = {
  targetStrength: 0,
  previousTargetStrength: 0,
  currentStrength: 0,
  startStrength: 0,
  currentStrengthTransitionEasing: "linear",
  currentMaxStrengthThreshold: undefined,
  strengthIntroDone: false,
  UNBLURRED_STRENGTH: 0.25,
  BLURRED_STRENGTH: 0.85,
  INTRO_TARGET_STRENGTH_TRANSITION_EASING: "easeOutBack",
  UNBLURRED_TARGET_STRENGTH_TRANSITION_EASING: "easeOutSine",
  BLURRED_TARGET_STRENGTH_TRANSITION_EASING: "linear",
  UNBLURRED_MAX_STRENGTH_THRESHOLD: undefined,
  BLURRED_MAX_STRENGTH_THRESHOLD: 1.0,

  targetRadius: 0,
  controlledRadius: 0,
  previousTargetRadius: 0,
  currentRadius: 0,
  UNBLURRED_RADIUS: 0.5,
  BLURRED_RADIUS: 1.0,
  TARGET_RADIUS_TRANSITION_EASE: "easeInOutBack",

  currentTransitionTime: 0,
  currentTransitionDuration: 0,
  INTRO_TRANSITION_DURATION: 2.0,
  UNBLURRED_TRANSITION_DURATION: 2.5,
  BLURRED_TRANSITION_DURATION: 5.0,

  overrideBloomBehavior: false,
};

export default class Scene {
  shouldRender = true;
  shouldUsePostProcessing = true;

  cameraStartPosition = new THREE.Vector3(0, 0, 13);
  cameraEndPosition = new THREE.Vector3(0, 0, 12);
  canBurstInteract = false;
  shouldBlur = false;

  burstIndex = 0;

  firstCreate = true;

  firstRenderCompleteState = INITIAL_FIRST_RENDER_COMPLETE_STATE;

  fractalUniformTransitionState = INITIAL_FRACTAL_UNIFORM_TRANSITION_STATE;

  drawCompleted = false;

  totalTime = 0;
  flowTime = 0;
  resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

  bokehPassBlurred = false;

  blurEffectState = INITIAL_BLUR_EFFECT_STATE;

  bloomState = INITIAL_BLOOM_STATE;

  lastRealWorldTime = performance.now();

  _vec = new THREE.Vector3();
  _worldPos = new THREE.Vector3();
  _localPos = new THREE.Vector3();
  _mouseCast = new THREE.Vector2();
  _raycaster = new THREE.Raycaster();

  keysDown = {};
  needsKeyReset = false;

  shouldHideBloomTargetsOnFinalComposition = true;

  writeDebug = /*process.env.NODE_ENV === "development"*/ false;

  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  static IsWebGL2Available(canvas) {
    try {
      return !!canvas.getContext("webgl2");
    } catch (e) {
      return false;
    }
  }

  /**
   *
   * @param {HTMLCanvasElement} canvas2D
   * @param {HTMLCanvasElement} canvas3D
   * @param {(canvas: HTMLCanvasElement) => void} onSceneCreated
   */
  constructor() {
    this.noise3D = createNoise3D(Math.random);

    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats.domElement);

    this.stats = stats;
  }

  /**
   *
   * @param {HTMLCanvasElement} canvas2D
   * @param {HTMLCanvasElement} canvas3D
   * @param {(canvas: HTMLCanvasElement) => void} onSceneCreated
   */
  initScene(canvas2D, canvas3D, onSceneCreated) {
    console.groupCollapsed("Scene.initScene");
    console.trace();
    console.groupEnd();
    this.dispose();

    this.clock = new THREE.Clock();

    let scene = new THREE.Scene();
    this.scene = scene;
    const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.copy(this.cameraStartPosition);
    this.camera = camera;

    let renderer = new THREE.WebGLRenderer({
      canvas: canvas3D,
      alpha: true,
      antialias: true,
      // powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0); // Set clear color to black with full transparency
    renderer.getContext().enable(renderer.getContext().DEPTH_TEST);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor(0xffffff, 1); // Set clear color to dark
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer = renderer;
    this._calculateRatio();
    renderer.setPixelRatio(this.ratio);

    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
    scene.add(hemiLight);

    this.bulbLights = [];

    for (let i = -3; i < 4; i += 3) {
      const pLight = new THREE.PointLight(0xffffff, 1, 100, 2);
      pLight.position.set(i, 0, 5);
      // pLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
      pLight.castShadow = true;
      pLight.userData.originalX = pLight.position.x;
      pLight.userData.originalY = pLight.position.y;
      pLight.userData.originalZ = pLight.position.z;
      scene.add(pLight);
      this.bulbLights.push(pLight);
    }

    const floorMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.8,
      color: "white",
      metalness: 0.7,
      iridesence: 0.9,
      sheen: 0.8,
      // clearcoat: .4
      // bumpScale: 1,
    });

    const largePlaneGeo = new THREE.PlaneGeometry(20, 20);

    // (0, -1, 0)
    const floorMesh = new THREE.Mesh(largePlaneGeo, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    floorMesh.position.setY(-1.0);
    scene.add(floorMesh);

    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(BLOOM_SCENE);
    this.noBloomLayer = new THREE.Layers();
    this.noBloomLayer.set(NO_BLOOM_SCENE);

    this.ignoreBloomPassMat = new THREE.MeshBasicMaterial({
      color: "black",
      transparent: true,
      opacity: 0,
    });
    this.sceneObjectsMats = {};

    const particleSystem = this._createParticleSystem();
    this.pointGeom = particleSystem.geometry;
    this.pointMat = particleSystem.material;
    this.particles = particleSystem.points;
    this.particles.name = "Particles";
    this.particles.position.set(0, 0, 10);
    this.particles.userData.isBloomTarget = true;

    const MAX_BURSTS = 5; // Maximum number of simultaneous bursts
    this.burstIndex = 0; // Current index for the next burst

    this.burstTimes = new Float32Array(MAX_BURSTS).fill(0);

    this.burstPositions = new Array(MAX_BURSTS);
    for (let i = 0; i < MAX_BURSTS; i++) {
      this.burstPositions[i] = new THREE.Vector3();
    }

    scene.add(this.particles);

    this._createFractalMesh(canvas2D);

    this._setupPostProccesing(renderer, scene, camera);

    // window.addEventListener("resize", this._onWindowResize.bind(this));
    window.addEventListener("click", this._onClick.bind(this));
    window.addEventListener("keydown", this._onKeyDown.bind(this));
    window.addEventListener("keyup", this._onKeyUp.bind(this));

    this._createDebugInfoContainer();

    onSceneCreated(canvas3D, renderer, scene, camera);
    this.clock.start();
    this.sceneInitted = true;
    this._render();
  }

  sceneInitted = false;

  setCanvas(canvas2D) {
    console.groupCollapsed("Scene.setCanvas");
    console.trace();
    console.groupEnd();
    this.canvas2D = canvas2D;
  }

  /**
   * Description placeholder
   *
   * @param {{ xDriftFactor: number;
   * yDriftFactor: number;
   * noiseScale: number;
   * distortion: number;
   * shouldRender: boolean;
   * usePostProcessing: boolean;
   * canBurstInteract: boolean;
   * shouldBlur: boolean;
   * introComplete: boolean;
   * onFireWorkIntroComplete: () => void;
   * redraw: () => void;
   * firstFullRenderComplete: boolean;
   * onSetXDriftFactor: (xDriftFactor: number) => void;
   * onSetYDriftFactor: (yDriftFactor: number) => void;
   * onSetNoiseScale: (noiseScale: number) => void;
   * onSetDistortion: (distortion: number) => void;
   * drawCompleted: boolean;
   * isDrawing: boolean;
   * }} params
   * @returns
   */
  setParams(params) {
    if (!this.sceneInitted) return;

    const {
      xDriftFactor,
      yDriftFactor,
      noiseScale,
      distortion,
      shouldRender,
      usePostProcessing,
      canBurstInteract,
      shouldBlur,
      introComplete,
      onFireWorkIntroComplete,
      redraw,
      firstFullRenderComplete,
      onSetXDriftFactor,
      onSetYDriftFactor,
      onSetNoiseScale,
      onSetDistortion,
      drawCompleted,
      isDrawing,
    } = params;
    console.groupCollapsed("Scene.setParams");
    console.log("params", params);
    console.trace();
    console.groupEnd();
    if (!firstFullRenderComplete) {
      this.fractalUniformTransitionState.noiseScale.original = noiseScale;
      this.fractalUniformTransitionState.distortion.original = distortion;
      this.fractalUniformTransitionState.xDriftFactor.original = xDriftFactor;
      this.fractalUniformTransitionState.yDriftFactor.original = yDriftFactor;
    }

    this.fractalUniformTransitionState.distortion.original = distortion;

    this.fractalUniformTransitionState.noiseScale.start =
      this.fractalUniformTransitionState.noiseScale.current;
    // this.fractalUniformTransitionState.distortion.start =
    //   this.fractalUniformTransitionState.distortion.current;
    this.fractalUniformTransitionState.xDriftFactor.start =
      this.fractalUniformTransitionState.xDriftFactor.current;
    this.fractalUniformTransitionState.yDriftFactor.start =
      this.fractalUniformTransitionState.yDriftFactor.current;

    this.fractalUniformTransitionState.noiseScale.current = noiseScale;
    // this.fractalUniformTransitionState.distortion.current = distortion;
    // this.fractalUniformTransitionState.xDriftFactor.current = xDriftFactor;
    // this.fractalUniformTransitionState.yDriftFactor.current = yDriftFactor;

    this.fractalUniformTransitionState.noiseScale.target = noiseScale;
    // this.fractalUniformTransitionState.distortion.target = distortion;
    this.fractalUniformTransitionState.xDriftFactor.target = xDriftFactor;
    this.fractalUniformTransitionState.yDriftFactor.target = yDriftFactor;

    this.shouldRender = shouldRender;
    this.shouldUsePostProcessing = usePostProcessing;
    this.canBurstInteract = canBurstInteract;
    this.shouldBlur = shouldBlur;
    this.onFireWorkIntroComplete = onFireWorkIntroComplete;
    this.introComplete = introComplete;
    this.redraw = redraw;

    this.firstRenderCompleteState.firstFullRenderComplete =
      firstFullRenderComplete;

    this.onSetXDriftFactor = onSetXDriftFactor;
    this.onSetYDriftFactor = onSetYDriftFactor;
    this.onSetNoiseScale = onSetNoiseScale;
    this.onSetDistortion = onSetDistortion;
    this.drawCompleted = drawCompleted;

    if (introComplete && !this.didRedraw) {
      console.log("redrawing");
      this._addParticles(250, new THREE.Vector3(0, 0.4, 0));
      this._addParticles(150, new THREE.Vector3(-0.35, 0.3, 0));
      this._addParticles(150, new THREE.Vector3(0.35, 0.3, 0));
      this._addParticles(75, new THREE.Vector3(-0.5, 0.15, 0));
      this._addParticles(75, new THREE.Vector3(0.5, 0.15, 0));
      window.setTimeout(() => {
        this.didRedraw = true;
        redraw();
      }, 1000);
    } else if (introComplete && this.didRedraw && isDrawing) {
      this.canDrawFractal = true;
    }
  }

  didRedraw = false;
  canDrawFractal = false;

  dispose() {
    console.groupCollapsed("Scene.dispose");
    console.trace();
    console.groupEnd();

    this.sceneInitted = false;

    // window.clearTimeout(this.beginDrawTimeout);
    window.clearTimeout(this.cleanTimeout);
    window.clearTimeout(this.resizeTimeout);
    cancelAnimationFrame(this.animationFrame);

    this._disposeDebugInfoContainer();
    this._disposePostProcessing();
    this._disposeFractalMesh();

    this.ignoreBloomPassMat?.dispose();

    if (
      this.sceneObjectsMats &&
      Object.keys(this.sceneObjectsMats).length > 0
    ) {
      for (let key in this.sceneObjectsMats) {
        this.sceneObjectsMats[key].dispose();
      }
    }

    if (this.pointMat) this.pointMat.dispose();
    if (this.pointGeom) this.pointGeom.dispose();
    if (this.particles) this.particles.geometry.dispose();

    if (this.scene) {
      for (const obj of this.scene.children) {
        if (obj instanceof THREE.Mesh) {
          this.scene.remove(obj);
          obj.geometry.dispose();
          obj.material.dispose();
        }
      }
    }

    if (this.bulbLights) {
      for (const light of this.bulbLights) {
        light.dispose();
      }
    }

    this.renderer?.clear();
    this.renderer?.dispose();
    // this.scene?.dispose();
    // this.camera?.dispose();

    // this.renderer = null;
    // this.scene = null;
    // this.camera = null;

    this.burstIndex = 0;
    this.keysDown = {};

    // shouldRender = true;
    // shouldUsePostProcessing = true;

    // cameraStartPosition = new THREE.Vector3(0, 0, 13);
    // cameraEndPosition = new THREE.Vector3(0, 0, 12);
    // canBurstInteract = false;
    // shouldBlur = false;

    this.burstIndex = 0;

    // this.firstCreate = true;

    this.firstRenderCompleteState = INITIAL_FIRST_RENDER_COMPLETE_STATE;

    // this.fractalUniformTransitionState =
    //   INITIAL_FRACTAL_UNIFORM_TRANSITION_STATE;

    this.drawCompleted = false;

    this.totalTime = 0;
    this.flowTime = 0;
    // resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // bokehPassBlurred = false;

    this.blurEffectState = INITIAL_BLUR_EFFECT_STATE;

    this.bloomState = INITIAL_BLOOM_STATE;

    // lastRealWorldTime = performance.now();

    this._vec = new THREE.Vector3();
    this._worldPos = new THREE.Vector3();
    this._localPos = new THREE.Vector3();
    this._mouseCast = new THREE.Vector2();
    this._raycaster = new THREE.Raycaster();

    this.keysDown = {};
    this.needsKeyReset = false;

    this.shouldHideBloomTargetsOnFinalComposition = true;

    // this.overrideBloomBehavior = false;

    this.lastRealWorldTime = performance.now();
    window.removeEventListener("click", this._onClick);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }

  _getRealDelta() {
    const currentRealWorldTime = performance.now();
    const delta = (currentRealWorldTime - this.lastRealWorldTime) / 1000;
    this.lastRealWorldTime = currentRealWorldTime;
    return delta;
  }

  _render(time) {
    this.stats.begin();

    const realWorldDeltaSeconds = this._getRealDelta();

    if (this.shouldRender) {
      const deltaTime = this.clock.getDelta();

      time = time / 1000;

      this.flowTime = time;

      this._calculateRatio();
      this.resolution.set(
        window.innerWidth * this.ratio,
        window.innerHeight * this.ratio
      );

      if (this.writeDebug) this.infoContainer.innerHTML = "";

      if (this.light && this.camera) {
        this.light.position.copy(this.camera.position);
      }

      if (this.particles) {
        this.particles.material.uniforms.uTime.value = time;
        this.particles.material.uniforms.uHasBloom.value = this.bloomLayer.test(
          this.particles.layers
        )
          ? 1.0
          : 0;

        this.particles.material.uniforms.uElapsedTime.value += deltaTime;

        this.particles.material.uniforms.cameraPosition.value =
          this.camera.position.clone();

        for (let i = 0; i < 5; i++) {
          this.burstTimes[i] += deltaTime;
        }

        this.particles.material.uniforms.uBurstTimes.value = this.burstTimes;

        this._updateParticles(deltaTime);
      }

      if (this.canDrawFractal) {
        if (this.fractalTexture) this.fractalTexture.needsUpdate = true;

        this._updateFractalMaterialUniforms(realWorldDeltaSeconds);

        if (this.fractalMaterial) {
          this.fractalMaterial.uniforms.uTime.value = this.flowTime;
          this.fractalMaterial.uniforms.uResolution.value = this.resolution;
          this.fractalMaterial.uniforms.uXDriftFactor.value =
            this.fractalUniformTransitionState.xDriftFactor.current;
          this.fractalMaterial.uniforms.uYDriftFactor.value =
            this.fractalUniformTransitionState.yDriftFactor.current;
          this.fractalMaterial.uniforms.uNoiseScale.value =
            this.fractalUniformTransitionState.noiseScale.current;

          // this.fractalMaterial.uniforms.uDisturbedNoiseScale.value =
          //   this.fractalUniformTransitionState.noiseScale.current;

          // this.fractalMaterial.uniforms.uDisturbedNoiseScaleFactor.value =
          //   this.fractalUniformTransitionState.noiseScale.factor;

          this.fractalMaterial.uniforms.uDistortion.value =
            this.fractalUniformTransitionState.distortion.original;

          this.fractalMaterial.uniforms.uDisturbedDistortion.value =
            this.fractalUniformTransitionState.distortion.current;

          this.fractalMaterial.uniforms.uDisturbedDistortionFactor.value =
            this.fractalUniformTransitionState.distortion.factor;

          this.fractalMaterial.needsUpdate = true;

          // let debugStr = "Fractal Noise Distortion<br>";
          // for (const property in this.fractalUniformTransitionState) {
          //   const state = this.fractalUniformTransitionState[property];

          //   if (
          //     state.currentTime < state.duration &&
          //     state.current !== state.target
          //   )
          //     state.currentTime += realWorldDeltaSeconds;

          //   const timeProgress = Math.min(
          //     state.currentTime / state.duration,
          //     1.0
          //   );

          //   const easedProgress = applyEasing(timeProgress, state.EASE_TYPE);

          //   // Apply epsilon to handle floating-point imprecision
          //   const epsilon = 1e-6;
          //   const correctedEasedProgress =
          //     Math.abs(easedProgress - 1) < epsilon ? 1 : easedProgress;

          //   state.current =
          //     state.start +
          //     (state.target - state.start) * correctedEasedProgress;

          //   if (property === "noiseScale") {

          //     if(state.state === "disturbed")
          //     state.factor = THREE.MathUtils.lerp(
          //       state.factor,
          //       // !state.hitDisturbedPeak ? 1 : 0,
          //       0,
          //       0.01
          //     );

          //     // if (!state.hitDisturbedPeak && state.factor >= 0.99) {
          //     //   state.hitDisturbedPeak = true;
          //     // }

          //     if (
          //       // state.hitDisturbedPeak &&
          //       state.current * state.factor <= 1e-1
          //     ) {
          //       state.current = state.target;
          //     }
          //   }

          //   if (state.current === state.target) {
          //     state.state = "idle";

          //     // if (property === "noiseScale") {
          //     //   state.hitDisturbedPeak = false;
          //     // }

          //     // if (state.current !== state.original) {
          //     //   state.target = state.original;
          //     //   state.currentTime = 0;
          //     //   state.state = "disturbed"
          //     // }
          //   }

          //   // Debugging output
          //   if (this.writeDebug) {
          //     debugStr += `${property}: ${state.current}<br>
          //       Target: ${state.target}<br>
          //       Time: ${state.currentTime}<br>
          //       Duration: ${state.duration}<br>
          //       Progress: ${timeProgress}<br>
          //       Corrected Eased Progress: ${correctedEasedProgress}<br>
          //       State: ${state.state}<br>`;

          //     if (property === "noiseScale") {
          //       debugStr += `Factor: ${state.factor}<br>
          //         Noise Scale * Factor: ${state.current * state.factor}<br>
          //         Hit Disturbed Peak: ${state.hitDisturbedPeak}<br>
          //         `;
          //     }
          //   }
          // }

          // if (this.writeDebug) this.infoContainer.innerHTML = debugStr;

          // console.log("this.uNoiseScale", this.uNoiseScale);
        }
      }

      if (this.bulbLights) {
        // if (this.bulbLightMat) {
        //   this.bulbLightMat.emissiveIntensity =
        //     this.bulbLight.intensity / Math.pow(0.02, 2.0);
        // }

        this.bulbLights.forEach((light, index) => {
          // Constants to scale the movement; adjust as needed for your scene size
          const xAmplitude = 0; // Maximum deviation in the x-axis
          const zAmplitude = 0; // Maximum deviation in the z-axis
          const yAmplitude = 0; // Maximum deviation in the y-axis
          const xMax = 4;
          const xMin = -4;
          const yMin = 0;
          const yMax = 3;

          // Base movement speed; adjust time factor to speed up or slow down
          const timeFactor = 0.2;
          const t = time * timeFactor + (index + 1) * Math.PI; // Offset each light for variation
          light.intensity = 0.75 + Math.sin(t) * 0.25;

          // Calculate positions
          const rawX = light.userData.originalX + xAmplitude * Math.sin(t);
          const rawY =
            light.userData.originalY + yAmplitude * Math.sin(t) * Math.cos(t);
          const z = light.userData.originalZ + zAmplitude * Math.sin(t);

          // Apply clamping to y
          const y = Math.max(yMin, Math.min(yMax, rawY));

          // Apply clamping to x
          const x = Math.max(xMin, Math.min(xMax, rawX));

          // Set positions
          light.position.x = x;
          light.position.y = y;
          light.position.z = z;

          // light.position.y += buoyancy;
          // light.position.x += wave;
        });

        // this.bulbLight.position.x = Math.sin(timeRef.current * 0.5);
        // this.bulbLight.position.y = Math.cos(timeRef.current * 0.5);
        // this.bulbLight.position.z = Math.sin(timeRef.current * 0.5) + 4;
      }

      if (
        !this.shouldUsePostProcessing &&
        this.renderer &&
        this.scene &&
        this.camera
      ) {
        this.renderer.render(this.scene, this.camera);
      }

      this._renderPostProcessing(realWorldDeltaSeconds);
    }

    this.stats.end();
    this.animationFrame = requestAnimationFrame(this._render.bind(this));
  }

  _updateFractalMaterialUniforms(realWorldDeltaSeconds) {
    return;

    let debugStr = "Fractal Noise Distortion<br>";

    for (const prop in this.fractalUniformTransitionState) {
      if (prop === "noiseScale") continue;

      this.fractalUniformTransitionState[prop].target = this.shouldBlur
        ? this.fractalUniformTransitionState[prop].BLURRED_TARGET
        : this.fractalUniformTransitionState[prop].UNBLURRED_TARGET;

      let duration = this.shouldBlur
        ? this.fractalUniformTransitionState[prop].blurredDuration
        : this.fractalUniformTransitionState[prop].unblurredDuration;

      if (
        this.fractalUniformTransitionState[prop].target !==
        this.fractalUniformTransitionState[prop].previousTarget
      ) {
        this.fractalUniformTransitionState[prop].currentTime = 0;
        this.fractalUniformTransitionState[prop].start =
          this.fractalUniformTransitionState[prop].current;

        if (prop === "distortion") {
          this.fractalUniformTransitionState[prop].start =
            this.fractalUniformTransitionState[prop].current *
            this.fractalUniformTransitionState[prop].factor;
          this.fractalUniformTransitionState[prop].factor = this.shouldBlur
            ? 1
            : 0;
        }
      }

      this.fractalUniformTransitionState[prop].previousTarget =
        this.fractalUniformTransitionState[prop].target;

      if (
        this.fractalUniformTransitionState[prop].currentTime < duration &&
        this.fractalUniformTransitionState[prop].current !==
          this.fractalUniformTransitionState[prop].target
      )
        this.fractalUniformTransitionState[prop].currentTime +=
          realWorldDeltaSeconds;

      // Ensure timeProgress doesn't exceed 1.0
      let timeProgress = Math.min(
        this.fractalUniformTransitionState[prop].currentTime / duration,
        1.0
      );

      if (isNaN(timeProgress)) timeProgress = 1;

      let easedProgress = applyEasing(
        timeProgress,
        this.fractalUniformTransitionState[prop].EASE_TYPE
      );

      // Apply epsilon to handle floating-point imprecision
      const epsilon = 1e-6;
      let correctedEasedProgress =
        Math.abs(easedProgress - 1) < epsilon ? 1 : easedProgress;

      this.fractalUniformTransitionState[prop].current =
        this.fractalUniformTransitionState[prop].start +
        (this.fractalUniformTransitionState[prop].target -
          this.fractalUniformTransitionState[prop].start) *
          correctedEasedProgress;

      if (prop === "distortion") {
        this.fractalUniformTransitionState[prop].factor = THREE.MathUtils.lerp(
          this.fractalUniformTransitionState[prop].factor,
          this.shouldBlur ? 0 : 1,
          0.01
        );
      }

      if (this.writeDebug) {
        debugStr += `${prop}: ${this.fractalUniformTransitionState[prop].current}<br>
        Target: ${this.fractalUniformTransitionState[prop].target}<br>
        Time: ${this.fractalUniformTransitionState[prop].currentTime}<br>
        Progress: ${timeProgress}<br>
        Corrected Eased Progress: ${correctedEasedProgress}<br>
        BLURRED_TARGET: ${this.fractalUniformTransitionState[prop].BLURRED_TARGET}<br>
        UNBLURRED_TARGET: ${this.fractalUniformTransitionState[prop].UNBLURRED_TARGET}<br>
        `;

        if (prop === "distortion") {
          debugStr += `Factor: ${this.fractalUniformTransitionState[prop].factor}<br>`;
        }
      }
    }

    if (this.writeDebug) this.infoContainer.innerHTML = debugStr;
  }

  _renderPostProcessing(realWorldDeltaSeconds) {
    if (!this.shouldBlur) {
      this.blurEffectState.flashClimax = false;
      this.blurEffectState.flashFinish = false;
      this.blurEffectState.flashTime = 0;
    }

    let debugStr = "";

    if (
      this.shouldUsePostProcessing &&
      this.scene &&
      this.bloomLayer &&
      this.ignoreBloomPassMat &&
      this.sceneObjectsMats &&
      this.finalComposer
    ) {
      if (this.bloomPass) {
        this.bloomPass.setSize(this.resolution.x, this.resolution.y);
        this.bloomPass.resolution.set(this.resolution.x, this.resolution.y);
      }

      if (this.fractalMesh && !this.bloomState.overrideBloomBehavior) {
        if (this.shouldBlur && this.blurEffectState.flashClimax) {
          // disable bloom
          if (this.bloomLayer.test(this.fractalMesh.layers) === true) {
            this._toggleFractalBloom();
          }
        } else if (!this.shouldBlur) {
          // enable bloom
          if (this.bloomLayer.test(this.fractalMesh.layers) === false) {
            this._toggleFractalBloom();
          }
        }
      }

      if (this.particles && !this.bloomState.overrideBloomBehavior) {
        if (this.shouldBlur && this.blurEffectState.flashClimax) {
          if (this.bloomLayer.test(this.particles.layers) === false) {
            this._toggleParticleBloom();
          }
        } else if (!this.shouldBlur) {
          if (this.bloomLayer.test(this.particles.layers) === true) {
            this._toggleParticleBloom();
          }
        }
      }

      if (this.bokehPass && this.firstRenderCompleteState.totallyComplete) {
        // Update the focus in the bokehPass with the new focus value
        this.bokehPass.uniforms.focus.value = THREE.MathUtils.lerp(
          this.bokehPass.uniforms.focus.value,
          this.shouldBlur && this.blurEffectState.flashClimax ? 90.0 : 0.0,
          0.02
        );

        if (this.bokehPass.uniforms.focus.value >= 90) {
          this.bokehPassBlurred = true;
        } else {
          this.bokehPassBlurred = false;
        }
      }

      if (this.bloomPass) {
        if (this.shouldBlur && this.canDrawFractal)
          this.bloomState.strengthIntroDone = true;

        this.bloomState.targetStrength = this.shouldBlur
          ? this.bloomState.BLURRED_STRENGTH
          : this.drawCompleted || this.bloomState.strengthIntroDone
          ? this.bloomState.UNBLURRED_STRENGTH
          : 0;

        if (
          this.bloomState.targetStrength !==
          this.bloomState.previousTargetStrength
        ) {
          this.bloomState.startStrength = this.bloomPass.strength;

          this.bloomState.currentTransitionTime = 0;

          this.bloomState.currentTransitionDuration = this.shouldBlur
            ? this.bloomState.BLURRED_TRANSITION_DURATION
            : this.bloomState.strengthIntroDone
            ? this.bloomState.UNBLURRED_TRANSITION_DURATION
            : this.bloomState.INTRO_TRANSITION_DURATION;

          this.bloomState.currentStrengthTransitionEasing = this.shouldBlur
            ? this.bloomState.BLURRED_TARGET_STRENGTH_TRANSITION_EASING
            : this.bloomState.strengthIntroDone
            ? this.bloomState.UNBLURRED_TARGET_STRENGTH_TRANSITION_EASING
            : this.bloomState.INTRO_TARGET_STRENGTH_TRANSITION_EASING;

          this.bloomState.currentMaxStrengthThreshold = this.shouldBlur
            ? this.bloomState.BLURRED_MAX_STRENGTH_THRESHOLD
            : this.bloomState.UNBLURRED_MAX_STRENGTH_THRESHOLD;

          console.groupCollapsed("Bloom Transition");
          console.log(
            "this.bloomState.targetStrength",
            this.bloomState.targetStrength
          );
          console.log(
            "this.bloomState.previousTargetStrength",
            this.bloomState.previousTargetStrength
          );

          console.log(
            "this.bloomState.currentTransitionTime",
            this.bloomState.currentTransitionTime
          );
          console.log(
            "this.bloomState.currentTransitionDuration",
            this.bloomState.currentTransitionDuration
          );
          console.log(
            "this.bloomState.currentStrengthTransitionEasing",
            this.bloomState.currentStrengthTransitionEasing
          );
          console.log(
            "this.bloomState.currentMaxStrengthThreshold",
            this.bloomState.currentMaxStrengthThreshold
          );

          console.groupEnd();
        }

        this.bloomState.previousTargetStrength = this.bloomState.targetStrength;

        if (
          this.bloomState.currentTransitionTime <
          this.bloomState.currentTransitionDuration
        )
          this.bloomState.currentTransitionTime += realWorldDeltaSeconds;

        // Ensure timeProgress doesn't exceed 1.0
        let timeProgress = Math.min(
          this.bloomState.currentTransitionTime /
            this.bloomState.currentTransitionDuration,
          1.0
        );

        if (isNaN(timeProgress)) timeProgress = 1;

        const easedProgress = applyEasing(
          timeProgress,
          this.bloomState.currentStrengthTransitionEasing,
          this.bloomState.currentMaxStrengthThreshold,
          0,
          10.70158
        );

        // Apply epsilon to handle floating-point imprecision
        const epsilon = 1e-6;
        const correctedEasedProgress =
          Math.abs(easedProgress - 1) < epsilon ? 1 : easedProgress;

        this.bloomState.currentStrength = this.bloomState.strengthIntroDone
          ? this.bloomState.startStrength +
            (this.bloomState.targetStrength - this.bloomState.startStrength) *
              correctedEasedProgress
          : this.bloomState.targetStrength * correctedEasedProgress;

        this.bloomPass.strength = this.bloomState.currentStrength;

        if (
          this.bloomPass.strength >= this.bloomState.UNBLURRED_STRENGTH &&
          timeProgress >= 1.0
        )
          this.bloomState.strengthIntroDone = true;

        this.bloomState.targetRadius = this.bloomState.overrideBloomBehavior
          ? this.bloomState.controlledRadius
          : this.shouldBlur
          ? this.bloomState.BLURRED_RADIUS
          : this.bloomState.UNBLURRED_RADIUS;

        if (!this.bloomState.overrideBloomBehavior) {
          this.bloomState.controlledRadius = this.bloomState.targetRadius;
        }

        this.bloomPass.radius = THREE.MathUtils.lerp(
          this.bloomPass.radius,
          this.shouldBlur && this.blurEffectState.flashClimax ? 1.5 : 0.1,
          0.009
        );

        if (this.writeDebug) {
          debugStr += `<h4>Bloom State</h4>
        Override Bloom Behavior: ${this.bloomState.overrideBloomBehavior}<br/>
        Fractal Has Bloom: ${this.bloomLayer.test(this.fractalMesh.layers)}<br/>
        Particles Have Bloom: ${this.bloomLayer.test(
          this.particles.layers
        )}<br/>
        Current Bloom Strength: ${this.bloomPass.strength}<br/>
        Start Bloom Strength: ${this.bloomState.startStrength}<br/>
        Target Strength: ${this.bloomState.targetStrength}<br/>
        Previous Target Strength: ${this.bloomState.previousTargetStrength}<br/>
        Current Transition Time: ${this.bloomState.currentTransitionTime}<br/>
        Current Transition Duration: ${
          this.bloomState.currentTransitionDuration
        }<br/>
        Current Strength Transition Easing: ${
          this.bloomState.currentStrengthTransitionEasing
        }<br/>
        Current Max Strength Threshold: ${
          this.bloomState.currentMaxStrengthThreshold
        }<br/>
        Time Progress: ${timeProgress}<br/>
        Eased Progress: ${easedProgress}<br/>
        Strength Intro Done: ${this.bloomState.strengthIntroDone}<br/>
        <br/>
        Bloom Radius: ${this.bloomPass.radius}<br/>
        `;

          this.infoContainer.innerHTML =
            this.infoContainer.innerHTML == ""
              ? debugStr
              : this.infoContainer.innerHTML + "<br/>" + debugStr;
        }
      }

      if (this.vignettePass && this.firstRenderCompleteState.totallyComplete) {
        this.vignettePass.uniforms.vignetteStrength.value =
          THREE.MathUtils.lerp(
            this.vignettePass.uniforms.vignetteStrength.value,
            this.shouldBlur && this.blurEffectState.flashClimax ? 1.25 : 0,
            0.009
          );
      }

      if (this.flashPass && this.firstRenderCompleteState.totallyComplete) {
        if (this.shouldBlur) {
          this.blurEffectState.flashClimax = true;

          // Increment the flash time
          this.blurEffectState.flashTime += realWorldDeltaSeconds;

          // Ensure timeProgress doesn't exceed 1.0
          const timeProgress = Math.min(
            this.blurEffectState.flashTime / this.blurEffectState.flashDuration,
            1.0
          );

          // Apply quadratic ease-in for smoother start
          const easedProgress = 1 - (1 - timeProgress) * (1 - timeProgress);

          // Set the alpha to smoothly ease in from 1 to 0
          this.flashPass.uniforms.flashAlpha.value = 0.85 - easedProgress;
        } else {
          // Reset flash time and alpha when shouldBlur is false
          this.blurEffectState.flashTime = 0;
          this.flashPass.uniforms.flashAlpha.value = 0.0;
        }
      }

      let bloomObjects = "";

      this.scene.traverse((obj) => {
        if (this.bloomLayer.test(obj.layers) === false) {
          this.sceneObjectsMats[obj.uuid] = obj.material;
          obj.material = this.ignoreBloomPassMat; // Use material that ignores bloom
        } else {
          bloomObjects += obj.name + "\n";
        }
      });

      // this.infoContainer.innerHTML = "Bloom Objects:\n" + bloomObjects;

      // 2. Render the bloom pass (for objects in the bloom layer)
      this.bloomComposer.render();

      // Restore the original materials
      this.scene.traverse((obj) => {
        if (this.sceneObjectsMats[obj.uuid]) {
          obj.material = this.sceneObjectsMats[obj.uuid]; // Restore original material
          delete this.sceneObjectsMats[obj.uuid];
        } else {
          if (this.shouldHideBloomTargetsOnFinalComposition) {
            this.sceneObjectsMats[obj.uuid] = obj.material;
            obj.material = this.ignoreBloomPassMat; // bloom object ignored in normal render
          }
        }
      });

      this.finalComposer.render();

      if (this.shouldHideBloomTargetsOnFinalComposition) {
        this.scene.traverse((obj) => {
          if (this.sceneObjectsMats[obj.uuid]) {
            obj.material = this.sceneObjectsMats[obj.uuid]; // Restore original material
            delete this.sceneObjectsMats[obj.uuid];
          }
        });
      }
    } else {
      console.log("this.shouldUsePostProcessing", this.shouldUsePostProcessing);
      console.log("this.scene", this.scene);
      console.log("this.bloomLayer", this.bloomLayer);
      console.log("this.ignoreBloomPassMat", this.ignoreBloomPassMat);
      console.log("this.sceneObjectsMats", this.sceneObjectsMats);
      console.log("this.finalComposer", this.finalComposer);
    }
  }
  /**
   *
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  _setupPostProccesing(renderer, scene, camera) {
    this._disposePostProcessing();

    var renderScene = new RenderPass(scene, camera);

    // Bloom Pass
    var bloomPass = new UnrealBloomPass(
      new THREE.Vector2(
        window.innerWidth * this.ratio,
        window.innerHeight * this.ratio
      )
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.35;
    bloomPass.radius = 0.5;

    // Depth of Field (Bokeh) Pass
    var bokehPass = new BokehPass(scene, camera, {
      focus: 0.0,
      aperture: 0.0001,
      maxblur: 1.0,
    });

    // Create a render target for the base scene
    // var renderTarget = new THREE.WebGLRenderTarget(
    //   window.innerWidth,
    //   window.innerHeight
    // );

    const VignetteShader = {
      uniforms: {
        tDiffuse: { value: null }, // Input texture
        vignetteStrength: { value: 0.5 }, // Strength of vignette
        resolution: {
          value: new THREE.Vector2(
            window.innerWidth * this.ratio,
            window.innerHeight * this.ratio
          ),
        },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float vignetteStrength;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main() {
          vec2 position = (vUv - vec2(0.5)) * resolution / min(resolution.x, resolution.y);
          float vignette = 1.0 - dot(position, position);
          vignette = smoothstep(0.0, 1.0, vignette);
          vec4 color = texture2D(tDiffuse, vUv);
          color.rgb *= mix(1.0, vignette, vignetteStrength);
          gl_FragColor = color;
        }`,
    };

    var vignettePass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: VignetteShader.uniforms,
        vertexShader: VignetteShader.vertexShader,
        fragmentShader: VignetteShader.fragmentShader,
      })
    );
    vignettePass.renderToScreen = true; // Render the vignette effect
    vignettePass.uniforms.vignetteStrength.value = 0; // Set vignette strength (0.0 to 1.0)

    const FlashShader = {
      uniforms: {
        tDiffuse: { value: null }, // Input texture (the scene)
        flashAlpha: { value: 0.0 }, // Alpha value for the flash effect (0.0 = no flash, 1.0 = full white)
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float flashAlpha;
        varying vec2 vUv;

        void main() {
          vec4 sceneColor = texture2D(tDiffuse, vUv); // Sample the base scene
          vec4 flashColor = vec4(0.0, 0.0, 0.0, flashAlpha); // White color with dynamic alpha
          gl_FragColor = mix(sceneColor, flashColor, flashAlpha); // Blend between scene and flash
        }
      `,
    };

    var flashPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: FlashShader.uniforms,
        vertexShader: FlashShader.vertexShader,
        fragmentShader: FlashShader.fragmentShader,
      })
    );

    flashPass.renderToScreen = true;
    flashPass.uniforms.flashAlpha.value = 0.0;

    // Bloom Composer: Only render objects that require bloom
    var bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene); // Render the scene for bloom
    bloomComposer.addPass(bloomPass); // Bloom pass
    bloomComposer.renderToScreen = false;
    // Final Shader Pass: Combines the base texture and bloom texture
    var finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null }, // Base scene texture
          bloomTexture: { value: bloomComposer.renderTarget2.texture }, // Bloom output
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }`,
        fragmentShader: `
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          void main() {
            gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
          }`,
      }),
      "baseTexture"
    );
    finalPass.needsSwap = true;

    // Final Composer: Combines base and bloom
    // const outputPass = new OutputPass();
    var finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene); // Render the base scene
    // finalComposer.addPass(bloomPass); // Bloom pass
    finalComposer.addPass(finalPass); // Final pass to merge base and bloom
    finalComposer.addPass(bokehPass); // Depth of Field pass
    // finalComposer.addPass(outputPass);
    finalComposer.addPass(vignettePass); // Add vignette pass at the end
    finalComposer.addPass(flashPass); // Flash pass at the end

    this.finalComposer = finalComposer;
    this.finalPass = finalPass;
    this.renderPass = renderScene;
    this.bloomComposer = bloomComposer;
    this.bloomPass = bloomPass;
    this.bokehPass = bokehPass;
    this.vignettePass = vignettePass;
    this.flashPass = flashPass;
  }

  _disposePostProcessing() {
    // Dispose of final composer and its render targets
    if (this.finalComposer) {
      this.finalComposer.renderTarget1.dispose();
      this.finalComposer.renderTarget2.dispose();
      this.finalComposer = null;
    }

    // Dispose of bloom composer
    if (this.bloomComposer) {
      this.bloomComposer.renderTarget1.dispose();
      this.bloomComposer.renderTarget2.dispose();
      this.bloomComposer = null;
    }

    // Dispose bloom pass resources
    if (this.bloomPass) {
      this.bloomPass.dispose();
      this.bloomPass = null;
    }

    // Dispose bokeh pass render targets
    if (this.bokehPass && this.bokehPass.renderTarget) {
      this.bokehPass.renderTarget.dispose();
      this.bokehPass = null;
    }

    // Dispose vignette pass resources
    if (this.vignettePass) {
      if (this.vignettePass.material) {
        this.vignettePass.material.dispose();
      }
      this.vignettePass = null;
    }

    // Dispose flash pass resources
    if (this.flashPass) {
      if (this.flashPass.material) {
        this.flashPass.material.dispose();
      }
      this.flashPass = null;
    }

    // Dispose of render pass
    if (this.renderPass) {
      this.renderPass = null; // No disposal needed, RenderPass doesn't hold any resources
    }

    // Dispose of final pass
    if (this.finalPass) {
      if (this.finalPass.material) {
        this.finalPass.material.dispose();
      }
      this.finalPass = null;
    }
  }

  _createFractalMesh(canvas2D) {
    this._disposeFractalMesh();

    this.canvas2D = canvas2D;
    let texture = new THREE.CanvasTexture(canvas2D);
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    this.fractalTexture = texture;

    const uniforms = {
      uFractalTexture: { value: texture },
      uAlphaMode: { value: 0 },
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          window.innerWidth * this.ratio,
          window.innerHeight * this.ratio
        ),
      },
      uXDriftFactor: {
        value: this.fractalUniformTransitionState.xDriftFactor.current,
      },
      uYDriftFactor: {
        value: this.fractalUniformTransitionState.yDriftFactor.current,
      },
      uNoiseScale: {
        value: this.fractalUniformTransitionState.noiseScale.current,
      },
      uDisturbedNoiseScale: {
        value: 0,
      },
      uDisturbedNoiseScaleFactor: {
        value: 0,
      },
      uDistortion: {
        value: this.fractalUniformTransitionState.distortion.current,
      },
      uDisturbedDistortion: {
        value: 0,
      },
      uDisturbedDistortionFactor: {
        value: 0,
      },
    };

    let material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: fractalShader.vertexShader,
      fragmentShader: fractalShader.fragmentShader,
      vertexColors: true,
      glslVersion: THREE.GLSL3,
      transparent: true,
      blending: THREE.AdditiveBlending,
      // alphaTest: 0.05, // Optional alpha threshold for material
      // depthWrite: true,
      // depthTest: true
    });

    this.fractalMaterial = material;

    let geometry = new THREE.PlaneGeometry(2, 2);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "Fractal";
    mesh.position.set(0, 0, 11);
    mesh.userData.isBloomTarget = true;

    this.fractalMesh = mesh;
    this._scaleFractal();
    // mesh.renderOrder = 1;
    mesh.layers.enable(BLOOM_SCENE);
    // mesh.layers.enable(NO_BLOOM_SCENE);
    this.scene.add(mesh);
  }

  _disposeFractalMesh() {
    if (this.fractalMesh) {
      // Remove the mesh from the scene
      this.scene.remove(this.fractalMesh);

      // Dispose of geometry
      if (this.fractalMesh.geometry) {
        this.fractalMesh.geometry.dispose();
      }

      // Dispose of material
      if (this.fractalMesh.material) {
        this.fractalMesh.material.dispose();
      }

      // Dispose of fractal texture
      if (this.fractalTexture) {
        this.fractalTexture.dispose();
      }

      // Set to null for garbage collection
      this.fractalMesh = null;
      this.fractalMaterial = null;
      this.fractalTexture = null;
    }
  }

  _scaleFractal() {
    // Calculate the appropriate scale for the fractal mesh
    const distance = this.camera.position.z - this.fractalMesh.position.z;
    const vFov = (this.camera.fov * Math.PI) / 180; // Convert vertical FOV to radians
    const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
    const planeWidthAtDistance = planeHeightAtDistance * this.camera.aspect;

    // Apply the new scale based on the window size and camera aspect
    this.fractalMesh.scale.x = planeWidthAtDistance;
    this.fractalMesh.scale.y = planeHeightAtDistance;

    console.groupCollapsed("Scene._scaleFractal");
    console.log("distance", distance);
    console.log("vFov", vFov);
    console.log("planeHeightAtDistance", planeHeightAtDistance);
    console.log("planeWidthAtDistance", planeWidthAtDistance);
    console.log("this.camera.aspect", this.camera.aspect);
    console.log("this.fractalMesh.scale", this.fractalMesh.scale);

    console.groupEnd();
  }

  _onClick(event) {
    this._vec.set(
      event.clientX / window.innerWidth,
      1 - event.clientY / window.innerHeight,
      0
    );

    const ndcX = (event.clientX / window.innerWidth) * 2 - 1; // Range [-1, 1]
    const ndcY = -(event.clientY / window.innerHeight) * 2 + 1; // Range [-1, 1]
    this._mouseCast.set(ndcX, ndcY);

    this._worldPos.set(ndcX, ndcY, 0.5); // Z is in the range [0, 1]
    this._worldPos.unproject(this.camera);
    this._worldPos.sub(this.camera.position).normalize();

    const distance = (10 - this.camera.position.z) / this._worldPos.z; // on the particle system plane?

    this._localPos
      .copy(this.camera.position)
      .add(this._worldPos.multiplyScalar(distance));

    this.particles.worldToLocal(this._localPos);

    this._applyParticleDisturbance(this._vec);

    this._applyFractalDisturbance(this._mouseCast);

    this._addParticles(Math.random() * 150 + 50, this._localPos);
  }

  _applyFractalDisturbance(clickPosition) {
    if (
      !this.fractalMesh ||
      !this.fractalMaterial ||
      !this._raycaster ||
      !this.camera ||
      !this.drawCompleted ||
      true
    )
      return;

    console.groupCollapsed("Scene._applyFractalDisturbance");
    console.log("clickPosition", clickPosition);

    this._raycaster.setFromCamera(clickPosition, this.camera);

    if (this.fractalMesh) {
      const intersects = this._raycaster.intersectObject(this.fractalMesh);

      function checkTextureAlphaAtUV(uv, texture) {
        // Get the texture image and canvas
        const canvas = texture.image;
        const ctx = canvas.getContext("2d");

        // Calculate pixel coordinates from UV coordinates
        const x = Math.floor(uv.x * canvas.width);
        const y = Math.floor(uv.y * canvas.height);

        // Get the pixel data (RGBA) from the texture at (x, y)
        const pixel = ctx.getImageData(x, y, 1, 1).data;

        // Check the alpha value (pixel[3] is the alpha channel)
        if (pixel[3] > 0) {
          return true; // Opaque pixel
          // Handle click on fractal
        } else {
          return false; // Transparent pixel
          // Handle click on background
        }
      }

      if (intersects.length > 0) {
        const intersection = intersects[0];

        // Step 2: Get UV coordinates of the intersection point
        const uv = intersection.uv;
        console.log("Click on fractal", intersects[0], uv);

        // Step 3: Check the texture alpha value at the clicked UV coordinate
        if (
          checkTextureAlphaAtUV(
            uv,
            this.fractalMaterial.uniforms.uFractalTexture.value
          )
        ) {
          console.log("Clicked On Fractal Opaque Pixel");
          // console.log("Change the fractal texture");
          // this._setFractalUniformValues(
          //   this.targetXDriftFactor,
          //   this.targetYDriftFactor,
          //   this.targetDistortion,
          //   3.5
          // );

          if (this.fractalUniformTransitionState.noiseScale.state === "idle") {
            this.fractalUniformTransitionState.noiseScale.current += 2;
            this.fractalUniformTransitionState.noiseScale.factor = 1;
            this.fractalUniformTransitionState.noiseScale.start =
              this.fractalUniformTransitionState.noiseScale.current;
            this.fractalUniformTransitionState.noiseScale.target =
              this.fractalUniformTransitionState.noiseScale.original;
            this.fractalUniformTransitionState.noiseScale.state = "disturbed";
            this.fractalUniformTransitionState.noiseScale.currentTime = 0;
            this.fractalUniformTransitionState.noiseScale.hitDisturbedPeak = false;
          } else {
            // this.fractalUniformTransitionState.noiseScale.current += 10;
            this.fractalUniformTransitionState.noiseScale.current =
              this.fractalUniformTransitionState.noiseScale.current *
                this.fractalUniformTransitionState.noiseScale.factor +
              2;
            this.fractalUniformTransitionState.noiseScale.start =
              this.fractalUniformTransitionState.noiseScale.current;
            this.fractalUniformTransitionState.noiseScale.currentTime = 0;
            // this.fractalUniformTransitionState.noiseScale.currentTime -= 5;
            // if (
            //   this.fractalUniformTransitionState.noiseScale.currentTime <= 0
            // ) {
            //   this.fractalUniformTransitionState.noiseScale.currentTime = 0;
            // }
            this.fractalUniformTransitionState.noiseScale.factor += 0.25;
          }

          // if (
          //   this.fractalUniformTransitionState.yDriftFactor.state === "idle"
          // ) {
          //   this.fractalUniformTransitionState.yDriftFactor.target =
          //     Math.random() * (0.15 - 0.06) + 0.06;
          //   this.fractalUniformTransitionState.yDriftFactor.state = "disturbed";
          // } else {
          //   this.fractalUniformTransitionState.yDriftFactor.target += 0.05;
          // }

          // if (this.fractalUniformTransitionState.distortion.state === "idle") {
          //   this.fractalUniformTransitionState.distortion.target =
          //     Math.random() * (0.05 - 0.02) + 0.02;
          //   this.fractalUniformTransitionState.distortion.state = "disturbed";
          // } else {
          //   this.fractalUniformTransitionState.distortion.target +=
          //     Math.random() * (0.05 - 0.02) + 0.02;

          //   if (this.fractalUniformTransitionState.distortion.target > 0.06) {
          //     this.fractalUniformTransitionState.distortion.target = 0.06;
          //   }
          // }
        }
      }
    }
  }

  _applyParticleDisturbance(clickPosition) {
    this.burstTimes[this.burstIndex] = 0.0; // Reset the burst time for this burst
    this.particles.material.uniforms.uClickPositions.value[
      this.burstIndex
    ].copy(clickPosition.clone());

    // Update the index for the next burst
    this.burstIndex = (this.burstIndex + 1) % 5;
  }

  _createParticleTexture() {
    const size = 128; // Texture size. Can be changed to suit your needs.
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    // Create radial gradient
    const center = size / 2;
    // Create radial gradient with smoother transitions
    const gradient = context.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      center
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)"); // Solid white in the center
    gradient.addColorStop(0.1, "rgba(255,255,255,0.9)"); // Almost solid
    gradient.addColorStop(0.25, "rgba(255,255,255,0.5)"); // Half transparency
    gradient.addColorStop(0.5, "rgba(255,255,255,0.1)"); // Mostly transparent
    gradient.addColorStop(1, "rgba(255,255,255,0)"); // Fully transparent at the edges

    // Apply the gradient to the canvas
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    var pointTex = new THREE.CanvasTexture(canvas);
    pointTex.minFilter = THREE.LinearFilter;
    pointTex.magFilter = THREE.LinearFilter;
    //   pointTex.colorSpace = THREE.SRGBColorSpace;

    return pointTex;
  }

  _createParticleSystem(numParticles = 2000) {
    const pointTex = this._createParticleTexture();
    const pointGeom = this._addParticles(numParticles);

    const clickPositions = new Array(5);
    for (let i = 0; i < clickPositions.length; i++) {
      clickPositions[i] = new THREE.Vector3();
    }
    // Create a shader material for the particles
    const pointMat = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: pointTex },
        uClickPositions: { value: clickPositions },
        uTime: { value: 0 },
        uBurstTimes: { value: new Float32Array(5).fill(0) },
        uActiveBursts: { value: 0 },
        uElapsedTime: { value: 0 },
        cameraPosition: { value: new THREE.Vector3(0, 0, 12) },
        uHasBloom: { value: 0 },
      },
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
      sizeAttenuation: true,
      glslVersion: THREE.GLSL3,
    });

    return {
      points: new THREE.Points(pointGeom, pointMat),
      geometry: pointGeom,
      material: pointMat,
    };
  }

  _addParticles(numParticles, position = null) {
    if (!this.pointGeom) {
      const N = numParticles;

      var position = new THREE.BufferAttribute(new Float32Array(3 * N), 3),
        // color = new THREE.BufferAttribute(new Float32Array(3 * N), 3),
        v = new THREE.Vector3(),
        sizes = new THREE.BufferAttribute(new Float32Array(N), 1),
        permanents = new THREE.BufferAttribute(new Float32Array(N), 1),
        lives = new THREE.BufferAttribute(new Float32Array(N), 1),
        maxLives = new THREE.BufferAttribute(new Float32Array(N), 1),
        phases = new THREE.BufferAttribute(new Float32Array(N), 1);
      // Define a base hue for your particles
      // const colorVariation = 100; // Variation in hue for each particle
      // const baseHue = 0; // For completely random base hues

      for (var i = 0; i < N; i++) {
        v.randomDirection().setLength(10 * Math.pow(Math.random(), 1));
        position.setXYZ(i, v.x, 0, v.z);
        // position.setZ(i, Math.min(camera.position.z + 5, position.getZ(i)));

        // const hue = (baseHue + colorVariation * Math.random()) % 1.0;
        // const saturation = 0.15; // Adjust for desired saturation
        // const lightness = 0.9; // Adjust for desired lightness

        // let { r, g, b } = hslToRgb(hue, saturation, lightness);
        // color.setXYZ(i, r / 255, g / 255, b / 255); // Ensure colors are normalized between 0 and 1
        sizes.setX(i, 5.5 + Math.random() * 25.25);
        phases.setX(i, Math.random() * 2 * Math.PI);
        permanents.setX(i, 1.0);
        lives.setX(i, 0.0);
        maxLives.setX(i, 0.0);
      }

      var pointGeom = new THREE.BufferGeometry();
      pointGeom.setAttribute("position", position);
      // pointGeom.setAttribute("color", color);
      pointGeom.setAttribute("size", sizes);
      pointGeom.setAttribute("phase", phases);
      pointGeom.setAttribute("permanent", permanents);
      pointGeom.setAttribute("life", lives);
      pointGeom.setAttribute("maxLife", maxLives);

      return pointGeom;
    } else if (position) {
      const pointGeom = this.pointGeom;

      const currentCount = pointGeom.attributes.position.count;
      const newCount = currentCount + numParticles;

      // Create new Float32Arrays with the updated size
      const newPositions = new Float32Array(newCount * 3);
      // const newColors = new Float32Array(newCount * 3);
      const newSizes = new Float32Array(newCount);
      const newPhases = new Float32Array(newCount);
      const newPermanents = new Float32Array(newCount);
      const newLives = new Float32Array(newCount);
      const newMaxLives = new Float32Array(newCount);

      // Copy the existing data into the new arrays
      newPositions.set(pointGeom.attributes.position.array);
      // newColors.set(pointGeom.attributes.color.array);
      newSizes.set(pointGeom.attributes.size.array);
      newPhases.set(pointGeom.attributes.phase.array);
      newPermanents.set(pointGeom.attributes.permanent.array);
      newLives.set(pointGeom.attributes.life.array);
      newMaxLives.set(pointGeom.attributes.maxLife.array);

      // Create a vector to randomize positions
      // const v = new THREE.Vector3();
      // const colorVariation = 100;
      // const baseHue = 0;

      // Add the new particles
      for (let i = currentCount; i < newCount; i++) {
        // Set random position for each particle
        // v.randomDirection().setLength(10 * Math.pow(Math.random(), 1));

        newPositions[i * 3] = position.x;
        newPositions[i * 3 + 1] = position.y;
        newPositions[i * 3 + 2] = position.z;

        // Set random color for each particle using HSL
        // const hue = (baseHue + colorVariation * Math.random()) % 1.0;
        // const saturation = 0.15;
        // const lightness = 0.9;
        // const { r, g, b } = hslToRgb(hue, saturation, lightness);
        // newColors[i * 3] = r / 255;
        // newColors[i * 3 + 1] = g / 255;
        // newColors[i * 3 + 2] = b / 255;

        // Set random size and phase
        newSizes[i] = 5.5 + Math.random() * 25.25;
        newPhases[i] = Math.random() * 2 * Math.PI;
        newPermanents[i] = 0.0;
        newLives[i] = 0.0;
        newMaxLives[i] = Math.random() * (Math.random() * 5.0 + 3.0) + 1.0;
      }

      // Update the geometry attributes with the new data
      pointGeom.setAttribute(
        "position",
        new THREE.BufferAttribute(newPositions, 3)
      );
      // pointGeom.setAttribute("color", new THREE.BufferAttribute(newColors, 3));
      pointGeom.setAttribute("size", new THREE.BufferAttribute(newSizes, 1));
      pointGeom.setAttribute("phase", new THREE.BufferAttribute(newPhases, 1));
      pointGeom.setAttribute(
        "permanent",
        new THREE.BufferAttribute(newPermanents, 1)
      );
      pointGeom.setAttribute("life", new THREE.BufferAttribute(newLives, 1));
      pointGeom.setAttribute(
        "maxLife",
        new THREE.BufferAttribute(newMaxLives, 1)
      );

      // Inform Three.js that the attributes have been updated
      pointGeom.attributes.position.needsUpdate = true;
      // pointGeom.attributes.color.needsUpdate = true;
      pointGeom.attributes.size.needsUpdate = true;
      pointGeom.attributes.phase.needsUpdate = true;
      pointGeom.attributes.permanent.needsUpdate = true;
      pointGeom.attributes.life.needsUpdate = true;
      pointGeom.attributes.maxLife.needsUpdate = true;
    }
  }

  _updateParticles(deltaTime) {
    if (!this.pointGeom) return;
    const pointGeom = this.pointGeom;

    const positions = pointGeom.attributes.position.array;
    const sizes = pointGeom.attributes.size.array;
    const phases = pointGeom.attributes.phase.array;
    const lives = pointGeom.attributes.life.array;
    const permanents = pointGeom.attributes.permanent.array; // Permanent flag
    const maxLives = pointGeom.attributes.maxLife.array;

    let activeParticleCount = 0; // Counter for active particles
    let hasTemporaryParticles = false;
    let particleDied = false; // To track if any particle exceeded its lifespan

    // Create an array to track which particles are still alive
    let aliveParticles = [];

    // First pass: loop to determine which particles are still alive
    for (let i = 0; i < lives.length; i++) {
      // Check if there are any temporary particles
      if (permanents[i] === 0.0) {
        lives[i] += deltaTime;

        // Remove the temporary particle if it exceeds its lifespan
        if (lives[i] >= maxLives[i]) {
          particleDied = true;
          continue; // Skip this particle since it's dead
        }

        hasTemporaryParticles = true; // Mark that temporary particles still exist
      }

      // If the particle is still alive, push its index to the aliveParticles array
      aliveParticles.push(i);
    }

    // If no temporary particles remain and no particles died this frame, exit
    if (!hasTemporaryParticles && !particleDied) {
      return;
    }

    // Second pass: Compact the particle data to remove dead particles
    for (let i = 0; i < aliveParticles.length; i++) {
      const idx = aliveParticles[i];
      const destIdx = activeParticleCount;

      // Copy positions and other attributes for active particles
      positions[destIdx * 3] = positions[idx * 3];
      positions[destIdx * 3 + 1] = positions[idx * 3 + 1];
      positions[destIdx * 3 + 2] = positions[idx * 3 + 2];

      sizes[destIdx] = sizes[idx];
      phases[destIdx] = phases[idx];
      lives[destIdx] = lives[idx];
      maxLives[destIdx] = maxLives[idx];
      permanents[destIdx] = permanents[idx]; // Permanent flag

      activeParticleCount++; // Increment the count of active particles
    }

    // Update the BufferGeometry to only include active particles
    pointGeom.setDrawRange(0, activeParticleCount); // Render only active particles

    // Now, update the BufferAttributes to reflect the new set of active particles
    pointGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions.subarray(0, activeParticleCount * 3),
        3
      )
    );
    pointGeom.setAttribute(
      "size",
      new THREE.BufferAttribute(sizes.subarray(0, activeParticleCount), 1)
    );
    pointGeom.setAttribute(
      "phase",
      new THREE.BufferAttribute(phases.subarray(0, activeParticleCount), 1)
    );
    pointGeom.setAttribute(
      "permanent",
      new THREE.BufferAttribute(permanents.subarray(0, activeParticleCount), 1)
    );
    pointGeom.setAttribute(
      "life",
      new THREE.BufferAttribute(lives.subarray(0, activeParticleCount), 1)
    );
    pointGeom.setAttribute(
      "maxLife",
      new THREE.BufferAttribute(maxLives.subarray(0, activeParticleCount), 1)
    );

    // Mark the attributes as needing an update
    pointGeom.attributes.position.needsUpdate = true;
    pointGeom.attributes.size.needsUpdate = true;
    pointGeom.attributes.phase.needsUpdate = true;
    pointGeom.attributes.life.needsUpdate = true;
    pointGeom.attributes.permanent.needsUpdate = true;
    pointGeom.attributes.maxLife.needsUpdate = true;
  }

  _calculateRatio() {
    const gl = this.renderer.getContext();
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

    this.ratio = ratio;
  }

  _onWindowResize() {
    console.groupCollapsed("Scene._onWindowResize");
    console.trace();
    console.groupEnd();
    this._disposeFractalMesh();

    window.clearTimeout(this.cleanTimeout);
    window.clearTimeout(this.resizeTimeout);
    window.cancelAnimationFrame(this.animationFrame);

    // Update renderer size and pixel ratio
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this._calculateRatio();
    this.renderer.setPixelRatio(this.ratio);

    // Update camera aspect and projection matrix
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this._setupPostProccesing(this.renderer, this.scene, this.camera);

    this._createFractalMesh(this.canvas2D);

    // Reapply texture and rescale after resize completes
    this.cleanTimeout = window.setTimeout(() => {
      this._render();
    }, 100);
  }

  _onKeyDown(e) {
    this.keysDown[e.key] = true;

    if (this.needsKeyReset) return;

    if (this.keysDown["b"] && this.keysDown["p"]) {
      this._toggleParticleBloom();

      this.needsKeyReset = true;
      return;
    }

    if (this.keysDown["b"] && this.keysDown["f"]) {
      this._toggleFractalBloom();

      this.needsKeyReset = true;
      return;
    }

    if (
      this.keysDown["b"] &&
      this.keysDown["h"] &&
      process.env.NODE_ENV === "development"
    ) {
      this._toggleFinalCompositionBloomHide();

      this.needsKeyReset = true;
      return;
    }

    if (this.keysDown["b"] && this.keysDown["r"]) {
      if (this.keysDown["ArrowUp"]) {
        this._incrementControlledBloomRadius(0.1);
        this.needsKeyReset = true;
        return;
      } else if (this.keysDown["ArrowDown"]) {
        this._incrementControlledBloomRadius(-0.1);
        this.needsKeyReset = true;
        return;
      }
    }

    if (
      this.keysDown["b"] &&
      this.keysDown["l"] &&
      process.env.NODE_ENV === "development"
    ) {
      this.shouldBlur = !this.shouldBlur;

      this.needsKeyReset = true;
      return;
    }

    if (
      this.keysDown["f"] &&
      this.keysDown["a"] &&
      process.env.NODE_ENV === "development"
    ) {
      this._toggleFractalAlphaMode();

      this.needsKeyReset = true;
      return;
    }

    if (
      this.keysDown["b"] &&
      this.keysDown["o"] &&
      process.env.NODE_ENV === "development"
    ) {
      this._toggleBloomBehaviorOverride();

      this.needsKeyReset = true;
      return;
    }

    if (this.keysDown["d"] && process.env.NODE_ENV === "development") {
      this._toggleDebugInfoContainer();
      this.needsKeyReset = true;
      return;
    }
  }

  _onKeyUp(e) {
    this.keysDown[e.key] = false;
    this.needsKeyReset = false;
  }

  _toggleParticleBloom() {
    if (this.particles && this.particles.layers) {
      if (this.bloomLayer.test(this.particles.layers) === false) {
        console.log("Enabling bloom for particles");
        this.particles.layers.enable(BLOOM_SCENE);
        this.particles.layers.disable(NO_BLOOM_SCENE);
      } else {
        console.log("Disabling bloom for particles");
        this.particles.layers.disable(BLOOM_SCENE);
        this.particles.layers.enable(NO_BLOOM_SCENE);
      }

      // console.log(
      //   "this.bloomLayer.test(this.particles.layers)",
      //   this.bloomLayer.test(this.particles.layers)
      // );
    }
  }

  _toggleFinalCompositionBloomHide() {
    this.shouldHideBloomTargetsOnFinalComposition =
      !this.shouldHideBloomTargetsOnFinalComposition;

    // console.log(
    //   "this.shouldHideBloomTargetsOnFinalComposition",
    //   this.shouldHideBloomTargetsOnFinalComposition
    // );
  }

  _toggleFractalBloom() {
    if (this.fractalMesh && this.fractalMesh.layers) {
      if (this.bloomLayer.test(this.fractalMesh.layers) === false) {
        console.log("Enabling bloom for fractal mesh");
        this.fractalMesh.layers.enable(BLOOM_SCENE);
        this.fractalMesh.layers.disable(NO_BLOOM_SCENE);
      } else {
        console.log("Disabling bloom for fractal mesh");
        this.fractalMesh.layers.disable(BLOOM_SCENE);
        this.fractalMesh.layers.enable(NO_BLOOM_SCENE);
      }
    }
  }

  _toggleFractalAlphaMode() {
    if (this.fractalMaterial) {
      this.fractalMaterial.uniforms.uAlphaMode.value =
        this.fractalMaterial.uniforms.uAlphaMode.value === 0 ? 1 : 0;
    }
  }

  _toggleBloomBehaviorOverride() {
    if (process.env.NODE_ENV !== "development") return;
    this.bloomState.overrideBloomBehavior =
      !this.bloomState.overrideBloomBehavior;
  }

  _incrementControlledBloomRadius(inc) {
    this.bloomState.controlledRadius += inc;

    if (this.bloomState.controlledRadius < 0) {
      this.bloomState.controlledRadius = 0;
    }
  }

  _createDebugInfoContainer() {
    if (this.writeDebug) {
      this.infoContainer = document.createElement("div");
      this.infoContainer.style.position = "absolute";
      this.infoContainer.style.top = "8em";
      this.infoContainer.style.right = "0";
      this.infoContainer.style.width = "auto";
      this.infoContainer.style.textAlign = "right";
      this.infoContainer.style.color = "white";
      this.infoContainer.style.padding = "5px";
      this.infoContainer.style.fontFamily = "monospace";
      this.infoContainer.style.fontSize = "12px";
      this.infoContainer.style.zIndex = "1000";
      this.infoContainer.id = "fractal-info";
      this.infoContainer.style.pointerEvents = "none";
      this.infoContainer.style.borderRadius = "5px";
      this.infoContainer.style.padding = "10px";
      this.infoContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      this.renderer.domElement.parentElement.appendChild(this.infoContainer);
    }
  }

  _disposeDebugInfoContainer() {
    if (this.infoContainer) {
      this.infoContainer.remove();
      this.infoContainer = null;
    }
  }

  _toggleDebugInfoContainer() {
    if (process.env.NODE_ENV !== "development") return;

    this.writeDebug = !this.writeDebug;

    if (this.writeDebug) {
      this._createDebugInfoContainer();
    } else {
      this._disposeDebugInfoContainer();
    }
  }
}
