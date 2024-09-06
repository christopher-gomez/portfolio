import * as THREE from "three";
import { FragmentShader, VertexShader } from "./particles";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import fractalShader from "./fractalShader";
import floorDiffuse from "../../../Assets/Textures/Hardwood/hardwood2_diffuse.jpg";
import floorBump from "../../../Assets/Textures/Hardwood/hardwood2_bump.jpg";
import floorRoughness from "../../../Assets/Textures/Hardwood/hardwood2_roughness.jpg";
import { createNoise3D } from "simplex-noise";
import Stats from "stats.js";
import { hslToRgb } from "../../../util/color";

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
  shouldBlur = false;

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

  firstCreate = true;

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
    const particleSystem = this._createParticleSystem();
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

    const { finalComposer, bloomComposer, bokehPass } =
      this._setupPostProccesing(renderer, scene, camera);
    this.finalComposer = finalComposer;
    this.bloomComposer = bloomComposer;
    this.bokehPass = bokehPass;

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
    canBurstInteract,
    shouldBlur,
    introComplete
  ) {
    this.uXDriftFactor = xDriftFactor;
    this.uYDriftFactor = yDriftFactor;
    this.uNoiseScale = noiseScale;
    this.uDistortion = distortion;
    this.shouldRender = shouldRender;
    this.shouldUsePostProcessing = usePostProcessing;
    this.canBurstInteract = canBurstInteract;
    this.shouldBlur = shouldBlur;

    if(introComplete && this.firstCreate) {
      this.firstCreate = false;

      window.setTimeout(() => {
        this._addParticles(250, new THREE.Vector3(0, .4, 0));
        window.setTimeout(() => {
          this._addParticles(150, new THREE.Vector3(-.35, .3, 0));
          this._addParticles(150, new THREE.Vector3(.35, .3, 0));
          this._addParticles(150, new THREE.Vector3(-.5, .15, 0));
          this._addParticles(150, new THREE.Vector3(.5, .15, 0));
        }, 0)
      }, 0);      
    }
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

        // if (this.delta > 5) {
        this.particles.material.uniforms.uElapsedTime.value += deltaTime;
        // }

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

        this._updateParticles(deltaTime);
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
        if (this.bokehPass) {
          // Update the focus in the bokehPass with the new focus value
          this.bokehPass.uniforms.focus.value = THREE.MathUtils.lerp(
            this.bokehPass.uniforms.focus.value,
            this.shouldBlur ? 100.0 : 0.0,
            0.02
          );
        }

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

    // Depth of Field (Bokeh) Pass
    var bokehPass = new BokehPass(scene, camera, {
      focus: 0.0, // Objects in focus at this distance
      aperture: 0.0001, // Camera aperture size (affects blur)
      maxblur: 1.0, // Maximum blur amount
    });

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
    finalComposer.addPass(bokehPass); // Adding Depth of Field pass
    finalComposer.addPass(finalPass);

    return { finalComposer, bloomComposer, bokehPass };
  }

  _vec = new THREE.Vector3();
  _worldPos = new THREE.Vector3();
  _localPos = new THREE.Vector3();

  _onClick(event) {
    if (!this.canBurstInteract) return;

    this._vec.set(
      event.clientX / window.innerWidth,
      1 - event.clientY / window.innerHeight,
      0
    );

    const ndcX = (event.clientX / window.innerWidth) * 2 - 1; // Range [-1, 1]
    const ndcY = -(event.clientY / window.innerHeight) * 2 + 1; // Range [-1, 1]
    this._worldPos.set(ndcX, ndcY, 0.5); // Z is in the range [0, 1]

    this._worldPos.unproject(this.camera);
    this._worldPos.sub(this.camera.position).normalize();

    const distance = (10 - this.camera.position.z) / this._worldPos.z; // on the particle system plane?

    this._localPos
      .copy(this.camera.position)
      .add(this._worldPos.multiplyScalar(distance));
    this.particles.worldToLocal(this._localPos);

    this._applyRippleEffect(this._vec);

    this._addParticles(Math.random() * 150 + 50, this._localPos);
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

    // const worldPosition = clickPosition.clone();
    // worldPosition.x = worldPosition.x * 2 - 1; // X from [0,1] to [-1,1]
    // worldPosition.y = worldPosition.y * 2 - 1; // Y from [0,1] to [-1,1]
    // // Z can be 0 (near plane), 1 (far plane), or something in between

    // // Step 3: Unproject to world space
    // worldPosition.unproject(this.camera);
    // this.clickPositionDebugCube.position.copy(worldPosition);

    // console.log("clickPosition", clickPosition);
    // console.log("worldPosition", worldPosition);
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

    if (this.keysDown["b"] && this.keysDown["p"]) {
      this._toggleParticleBloom();
    }

    if (this.keysDown["b"] && this.keysDown["f"]) {
      this._toggleFractalBloom();
    }

    if (this.keysDown["b"] && this.keysDown["l"]) {
      this.shouldBlur = !this.shouldBlur;
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
