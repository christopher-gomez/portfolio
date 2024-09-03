import * as THREE from "three";
import { CreateParticles } from "./particles";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import fractalShader from "./fractalShader";
import floorDiffuse from "../../../Assets/Textures/Hardwood/hardwood2_diffuse.jpg";
import floorBump from "../../../Assets/Textures/Hardwood/hardwood2_bump.jpg";
import floorRoughness from "../../../Assets/Textures/Hardwood/hardwood2_roughness.jpg";
import { createNoise3D } from "simplex-noise";
import Stats from "stats.js";

var ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;

export default class Scene {
  shouldRender = true;
  shouldUsePostProcessing = true;

  uXDriftFactor = 0.01;
  uYDriftFactor = 0.05;
  uNoiseScale = 1.75;
  uDistortion = 0.01;

  cameraStartPosition = new THREE.Vector3(0, 0, 13);
  cameraEndPosition = new THREE.Vector3(0, 0, 12);
  orbitControls = null;
  useOrbitControls = true;
  canBurstInteract = false;

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

  calculateRatio() {
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

  burstIndex = 0;

  /**
   *
   * @param {HTMLCanvasElement} canvas2D
   * @param {HTMLCanvasElement} canvas3D
   * @param {(canvas: HTMLCanvasElement) => void} onSceneCreated
   */
  initScene(canvas2D, canvas3D, onSceneCreated) {
    this.dispose();

    this.clock = new THREE.Clock();
    let texture = new THREE.CanvasTexture(canvas2D);
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    this.fractalTexture = texture;

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
    this.calculateRatio();
    renderer.setPixelRatio(this.ratio);

    // this.orbitControls = new OrbitControls(camera, renderer.domElement);

    // if (this.useOrbitControls) this.orbitControls.update();

    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
    scene.add(hemiLight);

    // const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    // const bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);

    // const bulbMat = new THREE.MeshStandardMaterial({
    //   emissive: 0xffffee,
    //   emissiveIntensity: 1,
    //   color: 0x000000,
    // });
    // bulbLightMatRef.current = bulbMat;

    this.bulbLights = [];

    // for(let i = -3; i < 4; i+=3) {
    //   const pLight = new THREE.PointLight(0xffee88, 1, 100, 2);
    //   // pLight.userData.isBloomTarget = true;
    //   // pLight.layers.enable(BLOOM_SCENE);
    //   pLight.position.set(i, 2, -5.5);
    //   // pLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    //   pLight.castShadow = true;
    //   pLight.userData.originalX = pLight.position.x;
    //   pLight.userData.originalY = pLight.position.y;
    //   pLight.userData.originalZ = pLight.position.z;
    //   scene.add(pLight);
    //   this.bulbLights.push(pLight);
    // }

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

    // scene.add(new THREE.AmbientLight(0xffffff, 10)); // Add some ambient light

    // var light = new THREE.DirectionalLight("white", 0.5);
    // light.position.set(1, 1, 1);
    // scene.add(light);
    // lightRef.current = light;

    // var globe = new THREE.Mesh(
    //   new THREE.IcosahedronGeometry(2, 2),
    //   new THREE.MeshStandardMaterial({
    //     color: "dimgray",
    //     flatShading: true,
    //     metalness: 0.9,
    //     roughness: 0.6,
    //   })
    // );
    // globe.visible = false;
    // scene.add(globe);

    // var cosmos = new THREE.Mesh(
    //   new THREE.IcosahedronGeometry(30, 5),
    //   new THREE.MeshStandardMaterial({
    //     color: "navy",
    //     flatShading: true,
    //     side: THREE.BackSide,
    //     metalness: 0.8,
    //     roughness: 0.3,
    //   })
    // );
    // // cosmos.position.set(0, 0, 1);
    // scene.add(cosmos);
    // cosmosRef.current = cosmos;

    // var cosmos2 = cosmos.clone();
    // // cosmos2.position.set(0, 0, 1);
    // cosmos2.rotation.y = 0.1;
    // scene.add(cosmos2);
    // cosmos2Ref.current = cosmos2;

    const floorMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.8,
      color: "white",
      metalness: 0.7,
      iridesence: 0.9,
      sheen: 0.8,
      // clearcoat: .4
      // bumpScale: 1,
    });

    // const textureLoader = new THREE.TextureLoader();
    // textureLoader.load(floorDiffuse, function (map) {
    //   map.wrapS = THREE.RepeatWrapping;
    //   map.wrapT = THREE.RepeatWrapping;
    //   map.anisotropy = 4;
    //   map.repeat.set(10, 24);
    //   map.colorSpace = THREE.SRGBColorSpace;
    //   floorMat.map = map;
    //   floorMat.needsUpdate = true;
    // });
    // textureLoader.load(floorBump, function (map) {
    //   map.wrapS = THREE.RepeatWrapping;
    //   map.wrapT = THREE.RepeatWrapping;
    //   map.anisotropy = 4;
    //   map.repeat.set(10, 24);
    //   floorMat.bumpMap = map;
    //   floorMat.needsUpdate = true;
    // });
    // textureLoader.load(floorRoughness, function (map) {
    //   map.wrapS = THREE.RepeatWrapping;
    //   map.wrapT = THREE.RepeatWrapping;
    //   map.anisotropy = 4;
    //   map.repeat.set(10, 24);
    //   floorMat.roughnessMap = map;
    //   floorMat.needsUpdate = true;
    // });

    const largePlaneGeo = new THREE.PlaneGeometry(20, 20);

    // (0, 0, -10)
    // const wallMesh = new THREE.Mesh(largePlaneGeo, floorMat);
    // wallMesh.receiveShadow = true;
    // wallMesh.position.setZ(-7.0);
    // scene.add(wallMesh);

    // (0, -1, 0)
    const floorMesh = new THREE.Mesh(largePlaneGeo, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    floorMesh.position.setY(-1.0);
    scene.add(floorMesh);

    // point cloud

    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(BLOOM_SCENE);

    this.ignoreBloomPassMat = new THREE.MeshBasicMaterial({
      color: "black",
    });
    this.sceneObjectsMats = {};

    // startTimeRef.current = Date.now();
    const particleSystem = CreateParticles(camera);
    this.pointGeom = particleSystem.geometry;
    this.pointMat = particleSystem.material;
    this.particles = particleSystem.points;
    this.particles.name = "Particles";
    this.particles.position.set(0, 0, 10);
    this.particles.userData.isBloomTarget = true;
    // this.particles.renderOrder = 0;

    const MAX_BURSTS = 5; // Maximum number of simultaneous bursts
    this.burstIndex = 0; // Current index for the next burst

    this.burstTimes = new Float32Array(MAX_BURSTS).fill(0);

    this.burstPositions = new Array(MAX_BURSTS);
    for (let i = 0; i < MAX_BURSTS; i++) {
      this.burstPositions[i] = new THREE.Vector3();
    }

    // this.particles.layers.enable(BLOOM_SCENE);
    scene.add(this.particles);

    const uniforms = {
      uFractalTexture: { value: texture },
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          window.innerWidth * this.ratio,
          window.innerHeight * this.ratio
        ),
      },
      uXDriftFactor: { value: this.uXDriftFactor },
      uYDriftFactor: { value: this.uYDriftFactor },
      uNoiseScale: { value: this.uNoiseScale },
      uDistortion: { value: this.uDistortion },
    };

    let material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: fractalShader.vertexShader,
      fragmentShader: fractalShader.fragmentShader,
      vertexColors: true,
      glslVersion: THREE.GLSL3,
      transparent: true,
      blending: THREE.NormalBlending,
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
    scene.add(mesh);

    this.clickPositionDebugCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: "blue" })
    );

    // scene.add(this.clickPositionDebugCube);

    // const planeMesh = new THREE.Mesh(
    //   geometry,
    //   new THREE.MeshBasicMaterial({ color: "red" })
    // );
    // planeMesh.position.set(0, 0, 9); // i need this mesh to always cover the size of the viewport

    // scene.add(planeMesh);

    // mesh.renderOrder = 1;
    // this.particles.renderOrder = 2;

    const { finalComposer, bloomComposer } = this._setupPostProccesing(
      renderer,
      scene,
      camera
    );
    this.finalComposer = finalComposer;
    this.bloomComposer = bloomComposer;

    window.addEventListener("resize", this._onWindowResize.bind(this));
    window.addEventListener("click", this._onClick.bind(this));
    window.addEventListener("keypress", this._onKeyPress.bind(this));
    window.addEventListener("keydown", this._onKeyDown.bind(this));
    window.addEventListener("keyup", this._onKeyUp.bind(this));
    onSceneCreated(canvas3D, renderer, scene, camera);
    this.clock.start();
    this._animate();
  }

  /**
   *
   * @param {number} xDriftFactor
   * @param {number} yDriftFactor
   * @param {number} noiseScale
   * @param {number} distortion
   * @param {boolean} shouldRender
   * @param {boolean} usePostProcessing
   */
  setParams(
    xDriftFactor,
    yDriftFactor,
    noiseScale,
    distortion,
    shouldRender,
    usePostProcessing,
    canBurstInteract
  ) {
    this.uXDriftFactor = xDriftFactor;
    this.uYDriftFactor = yDriftFactor;
    this.uNoiseScale = noiseScale;
    this.uDistortion = distortion;
    this.shouldRender = shouldRender;
    this.shouldUsePostProcessing = usePostProcessing;
    this.canBurstInteract = canBurstInteract;
  }

  dispose() {
    this.renderer?.dispose();
    this.bloomComposer?.dispose();
    this.finalComposer?.dispose();
    this.fractalTexture?.dispose();
    this.fractalMaterial?.dispose();

    this.ignoreBloomPassMat?.dispose();

    if (
      this.sceneObjectsMats &&
      Object.keys(this.sceneObjectsMats).length > 0
    ) {
      for (let key in this.sceneObjectsMats) {
        this.sceneObjectsMats[key].dispose();
      }
    }
    this.delta = 0;
    this.burstIndex = 0;
    this.keysDown = {};
    window.removeEventListener("resize", this._onWindowResize);
    window.removeEventListener("click", this._onClick);
    window.removeEventListener("keypress", this._onKeyPress);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    cancelAnimationFrame(this.animationFrame);
  }

  _scaleFractal() {
    // Assuming the fractal mesh is a PlaneGeometry aligned with the XY plane
    // and facing the camera, we need to update its scale to cover the viewport.
    // The scale will be based on the camera's view frustum and the aspect ratio.
    const distance = this.camera.position.z - this.fractalMesh.position.z;
    const vFov = (this.camera.fov * Math.PI) / 180; // convert vertical fov to radians
    const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
    const planeWidthAtDistance = planeHeightAtDistance * this.camera.aspect;
    // Scale the fractal mesh to fit the screen
    this.fractalMesh.scale.x = planeWidthAtDistance;
    this.fractalMesh.scale.y = planeHeightAtDistance;
  }

  delta = 0;
  _animate(time) {
    this.stats.begin();

    if (this.shouldRender) {
      // const elapsedTime = clockRef.current.getElapsedTime();

      const deltaTime = this.clock.getDelta();
      this.delta += deltaTime;
      // const msTime = this.clock.getElapsedTime();

      time = time / 1000;

      // if (this.camera) {
      //   let lerpFactor = elapsedTime / 15;
      //   if (lerpFactor < 1.0) {
      //     this.camera.position.lerpVectors(
      //       this.cameraStartPosition,
      //       this.cameraEndPosition,
      //       lerpFactor
      //     );
      //   } else {
      //     this.camera.position.copy(this.cameraEndPosition);
      //   }
      // }

      // if (cosmosRef.current && cosmos2Ref.current) {
      //   const t = time / 10000;

      //   cosmosRef.current.rotation.x = 2 * t;
      //   cosmosRef.current.rotation.y = -2 * t;
      //   cosmos2Ref.current.rotation.x = -1.5 * t;
      //   cosmos2Ref.current.rotation.y = 1.5 * t;
      // }

      if (this.light && this.camera) {
        this.light.position.copy(this.camera.position);
      }

      if (this.particles) {
        this.particles.material.uniforms.uTime.value = time;

        if (this.delta > 5) {
          this.particles.material.uniforms.uElapsedTime.value += deltaTime;
        }

        // this.particles.material.uniforms.uBurstTime.value += deltaTime;
        this.particles.material.uniforms.cameraPosition.value =
          this.camera.position.clone();
        // pointsRef.current.material.uniforms.cameraPosition.value = this.camera.position.clone();

        for (let i = 0; i < 5; i++) {
          this.burstTimes[i] += deltaTime;
        }

        this.particles.material.uniforms.uBurstTimes.value = this.burstTimes;

        // console.log('this.particles.material.uniforms.uBurstTimes.value', this.particles.material.uniforms.uBurstTimes.value);
        // console.log('this.particles.material.uniforms.uClickPositions.value', this.particles.material.uniforms.uClickPositions.value);
      }

      if (this.fractalTexture) this.fractalTexture.needsUpdate = true;

      if (this.fractalMaterial) {
        this.fractalMaterial.uniforms.uTime.value = time;
        this.fractalMaterial.uniforms.uResolution.value = new THREE.Vector2(
          window.innerWidth * this.ratio,
          window.innerHeight * this.ratio
        );
        this.fractalMaterial.uniforms.uXDriftFactor.value = this.uXDriftFactor;
        this.fractalMaterial.uniforms.uYDriftFactor.value = this.uYDriftFactor;
        this.fractalMaterial.uniforms.uNoiseScale.value = this.uNoiseScale;
        this.fractalMaterial.uniforms.uDistortion.value = this.uDistortion;
        this.fractalMaterial.needsUpdate = true;
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

      if (this.orbitControls && this.useOrbitControls)
        this.orbitControls.update();

      if (
        !this.shouldUsePostProcessing &&
        this.renderer &&
        this.scene &&
        this.camera
      ) {
        this.renderer.render(this.scene, this.camera);
      }

      if (
        this.shouldUsePostProcessing &&
        this.scene &&
        this.bloomLayer &&
        this.ignoreBloomPassMat &&
        this.sceneObjectsMats &&
        this.bloomComposer &&
        this.finalComposer
      ) {
        this.scene.traverse((obj) => {
          if (
            obj.userData.isBloomTarget &&
            this.bloomLayer.test(obj.layers) === false
          ) {
            this.sceneObjectsMats[obj.uuid] = obj.material;
            obj.material = this.ignoreBloomPassMat;
          }
        });

        this.bloomComposer.render();
        this.scene.traverse((obj) => {
          if (this.sceneObjectsMats[obj.uuid]) {
            obj.material = this.sceneObjectsMats[obj.uuid];
            delete this.sceneObjectsMats[obj.uuid];
          }
        });

        this.finalComposer.render();
      }
    }

    this.stats.end();

    this.animationFrame = requestAnimationFrame(this._animate.bind(this));
  }

  /**
   *
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   */
  _setupPostProccesing(renderer, scene, camera) {
    var renderScene = new RenderPass(scene, camera);

    var bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight)
    );

    bloomPass.threshold = 0.1;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0.5;

    var bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    var finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
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
        defines: {},
      }),
      "baseTexture"
    );
    finalPass.needsSwap = true;

    var finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);

    return { finalComposer, bloomComposer };
  }

  _vec = new THREE.Vector3();
  _pos = new THREE.Vector3();

  _onClick(event) {
    if (!this.canBurstInteract) return;

    this._vec.set(
      event.clientX / window.innerWidth,
      1 - event.clientY / window.innerHeight,
      0
    );

    // this._vec.unproject(this.camera);
    // this._vec.sub(this.camera.position).normalize();

    // const distance = (10 - this.camera.position.z) / this._vec.z; // on the particle system plane?

    // this._pos
    //   .copy(this.camera.position)
    //   .add(this._vec.multiplyScalar(distance));
    // this.particles.worldToLocal(this._pos);

    this._applyRippleEffect(this._vec);
  }

  _applyRippleEffect(clickPosition) {
    // const rippleRadius = 5; // Radius of the ripple effect
    // const rippleStrength = 10; // How far particles are pushed away

    // const positions = this.pointGeom.attributes.position.array;
    // const numParticles = this.pointGeom.attributes.position.count;

    // for (let i = 0; i < numParticles; i++) {
    //     const particlePos = new THREE.Vector3(
    //         positions[i * 3],
    //         positions[i * 3 + 1],
    //         positions[i * 3 + 2]
    //     );

    //     const distance = particlePos.distanceTo(clickPosition);
    //     if (distance < rippleRadius) {
    //         const offset = particlePos.clone().sub(clickPosition).normalize().multiplyScalar(rippleStrength * (rippleRadius - distance) / rippleRadius);

    //         positions[i * 3] += offset.x;
    //         positions[i * 3 + 1] += offset.y;
    //         positions[i * 3 + 2] += offset.z;
    //     }
    // }

    // Add the new burst to the arrays
    // this.burstPositions[this.burstIndex].copy(clickPosition.clone());
    this.burstTimes[this.burstIndex] = 0.0; // Reset the burst time for this burst
    this.particles.material.uniforms.uClickPositions.value[
      this.burstIndex
    ].copy(clickPosition.clone());

    // Update the index for the next burst
    this.burstIndex = (this.burstIndex + 1) % 5;
    // this.pointMat.uniforms.uActiveBursts.value = this.burstIndex;

    // console.log('this.burstIndex', this.burstIndex);
    // console.log('this.particles.material.uniforms.uClickPositions.value', this.particles.material.uniforms.uClickPositions.value);

    // this.pointGeom.attributes.position.needsUpdate = true;
    // Store the click position in a uniform
    // this.pointMat.uniforms.uClickPosition.value.copy(clickPosition);
    // this.pointMat.uniforms.uBurstTime.value = 0;
    // this.clickPositionDebugCube.position.copy(clickPosition);
    // this.clickPositionDebugCube.position.copy(
    //   this.particles.localToWorld(this.pointMat.uniforms.uClickPosition.value)
    // );

    const worldPosition = clickPosition.clone();
    worldPosition.x = worldPosition.x * 2 - 1; // X from [0,1] to [-1,1]
    worldPosition.y = worldPosition.y * 2 - 1; // Y from [0,1] to [-1,1]
    // Z can be 0 (near plane), 1 (far plane), or something in between

    // Step 3: Unproject to world space
    worldPosition.unproject(this.camera);
    this.clickPositionDebugCube.position.copy(worldPosition);

    // console.log("clickPosition", clickPosition);
    // console.log("worldPosition", worldPosition);
  }

  _onWindowResize() {
    window.clearTimeout(this.cleanTimeout);
    window.cancelAnimationFrame(this.animationFrame);

    // this.renderer.clear();

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.position.copy(this.cameraStartPosition);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.calculateRatio();
    this.renderer.setPixelRatio(this.ratio);

    this.finalComposer.setSize(window.innerWidth, window.innerHeight);
    this.bloomComposer.setSize(window.innerWidth, window.innerHeight);

    // Create a new empty data buffer to fill the texture
    // For simplicity, let's assume the texture is a square of dimension 512x512 and RGBA format
    const size = 512 * 512;
    const data = new Uint8Array(4 * size);

    // Fill the buffer with your new data (e.g., set all pixels to transparent)
    for (let i = 0; i < size; i++) {
      data[4 * i] = 0; // R
      data[4 * i + 1] = 0; // G
      data[4 * i + 2] = 0; // B
      data[4 * i + 3] = 0; // A, 0 is fully transparent
    }

    // Create a new THREE.DataTexture
    const newTexture = new THREE.DataTexture(data, 512, 512, THREE.RGBAFormat);
    newTexture.needsUpdate = true;
    this.fractalTexture.needsUpdate = false;
    this.fractalTexture.dispose();

    this.fractalMaterial.uniforms.uFractalTexture.value = newTexture;
    this.fractalMaterial.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth * this.ratio,
      window.innerHeight * this.ratio
    );
    this._scaleFractal();

    this.cleanTimeout = window.setTimeout(() => {
      this.fractalMaterial.uniforms.uFractalTexture.value = this.fractalTexture;
      this.fractalTexture.needsUpdate = true;
      this._animate();
    }, 100);
  }

  _onKeyPress(e) {
    return;
    if (e.key === "b") {
      this._toggleParticleBloom();
    }
  }

  keysDown = {};
  _onKeyDown(e) {
    this.keysDown[e.key] = true;

    if (this.keysDown["b"] && this.keysDown['p']) {
      this._toggleParticleBloom();
    }

    if (this.keysDown["b"] && this.keysDown['f']) {
      this._toggleFractalBloom();
    }
  }

  _onKeyUp(e) {
    this.keysDown[e.key] = false;
  }

  _toggleParticleBloom() {
    if (this.particles && this.particles.layers) {
      if (this.bloomLayer.test(this.particles.layers) === false) {
        this.particles.layers.enable(BLOOM_SCENE);
      } else {
        this.particles.layers.disable(BLOOM_SCENE);
      }
    }
  }

  _toggleFractalBloom() {
    if (this.fractalMesh && this.fractalMesh.layers) {
      if (this.bloomLayer.test(this.fractalMesh.layers) === false) {
        this.fractalMesh.layers.enable(BLOOM_SCENE);
      } else {
        this.fractalMesh.layers.disable(BLOOM_SCENE);
      }
    }
  }
}
