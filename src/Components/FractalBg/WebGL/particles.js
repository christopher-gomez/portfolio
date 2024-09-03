import * as THREE from "three";
import { hslToRgb } from "../../../util/color";

export function CreateParticles(camera) {
  // Vertex shader for particles
  const particleVertexShader = `
  // Define the maximum number of simultaneous bursts
#define MAX_BURSTS 5

uniform vec3 uClickPositions[MAX_BURSTS];
uniform float uBurstTimes[MAX_BURSTS];
uniform int uActiveBursts;  // Number of active bursts

uniform float uTime;
attribute float size; // Add a size attribute
attribute float phase; // Add a phase attribute
varying vec3 vColor;
varying float vPhase;
varying vec3 modPos;
varying float vDiffColor;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float sNoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}

               float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}


void main() {
    vColor = color; // Pass color to fragment shader
    vPhase = phase; // Pass the phase to the fragment shader

    // Use noise to modify the position
    // modPos.x += noise(position + vec3(uTime * .025, 0.0, 0.0)) * 10.0;
    // modPos.y += noise(position + vec3(0.0, uTime * .025, 0.0)) * 10.0;
    // modPos.z += noise(position + vec3(0.0, 0.0, uTime * .05)) * 10.0;    

    // modPos = position + noiseValue * 2.5;

    // Fluid-like movement
    // vec3 noiseDirection = vec3(-1.0, 1.0, 1.0); // Adjust to change the movement direction and proportion
    // float timeFactor = uTime * 0.05; // Adjust time scaling for speed

    // // Create a 3D noise position offset based on position and time
    // // Adding time to the different dimensions gives a swirling effect
    // vec4 noisePosTimeX = vec4(position.x, position.y, position.z, timeFactor);
    // vec4 noisePosTimeY = vec4(position.x, position.y, position.z, timeFactor); // Offset time for different noise results
    // vec4 noisePosTimeZ = vec4(position.x, position.y, position.z, timeFactor + 200.0); // Offset time for different noise results


    // // Calculate noise values for each axis
    // float noiseValueX = sNoise(noisePosTimeX);
    // float noiseValueY = sNoise(noisePosTimeY);
    
    // vec4 posTime = vec4(position, sin(timeOffset * .5) * .5 + cos(timeOffset * .5) * .5);
    // float noiseValueZ = sNoise(posTime);

    // // Apply the noise to the particle positions
    // vec3 modPos = position;
    // modPos.x += noiseValueX * noiseDirection.x;
    // modPos.y += noiseValueY * noiseDirection.y;
    // modPos.z += position.z + noiseValueZ * .5;
    float timeOffset = uTime * .15 + vPhase;
    vec4 posTime = vec4(position, timeOffset * .025);
    float noiseValue = sNoise(posTime);
    
    modPos = position;
    modPos.x += noiseValue * 2.75; // Apply noise uniformly.
    modPos.y += noiseValue * .15; // Apply noise uniformly.
    modPos.z += noiseValue * .025; // Apply noise uniformly.

    // Buoyancy effect - particles slowly rise up.
    float buoyancy = sin(timeOffset + modPos.y) * .15;

    // Horizontal wave movement.
    float wave = sin(timeOffset + modPos.x) * .1;

    // Apply noise and buoyancy to modify position.
    modPos.y += buoyancy; // Apply buoyancy to y-axis.
    modPos.x += wave; // Apply wave to x-axis.

    // Apply multiple burst effects

    bool foundPrev = false;
    for (int i = 0; i < 5; i++) {
        vec3 burstPosition = uClickPositions[i];
        float burstTime = uBurstTimes[i];

        // Convert modPos to clip space and then to screen space
        vec4 clipSpacePos = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
        vec3 screenSpacePos = clipSpacePos.xyz / clipSpacePos.w;
        vec2 screenPos = screenSpacePos.xy * 0.5 + 0.5;

        // Calculate distance from the click position in screen space
        float dist = distance(screenPos, burstPosition.xy);

        // Clamp uBurstTime to ensure it doesn't exceed the intended duration
        float clampedBurstTime = min(burstTime, 2.0);

        // Apply burst effect only within a certain radius
        float radius = 0.1 * (1.0 - smoothstep(0.0, 2.0, clampedBurstTime));  // Decreases over time
        // float radius = 0.075;
        if (dist <= radius) {
            foundPrev = true;
            // Calculate the force of the burst based on distance and time
            float burstFactor = 10.5 * (1.0 - smoothstep(0.0, 2.0, clampedBurstTime));  // Decreases over time
            float burstStrength = (1.0 - (dist / radius)) * burstFactor;  // Adjust the strength
            // Adjust burstEffect using the clamped time
                float easedTime = easeInOutCubic(clampedBurstTime / 2.0);  // Normalize time to [0, 1]

                float burstEffect = burstStrength;
            // float burstEffect = burstStrength * easedTime; // Decreases over time     
                        // float burstEffect = burstStrength * (1.0 - smoothstep(0.0, 2.0, clampedBurstTime)); // Decreases over time            
       
float burstSeed = dot(position.xy, vec2(12.9898, 78.233)) * burstPosition.x * burstPosition.y * float(i + 1); // Use burst index to vary the seed for each burst
float theta = mod(burstSeed, 6.28318530718);  // Random angle between 0 and 2π
float phi = acos(2.0 * fract(burstSeed * 0.1) - 1.0); // Random angle between 0 and π
            
            vec3 sphericalDirection = vec3(
                sin(phi) * cos(theta),
                sin(phi) * sin(theta),
                0.0
            );
            
            vec3 burstDirection = normalize(sphericalDirection);
            modPos += sphericalDirection * burstEffect * burstTime * .05;  // Gradually apply the burst over time
            // vDiffColor = 1.0;
        }
        // else {
        //   if(!foundPrev)
        //     vDiffColor = 0.0;
        // }
    }
    
    // Breathing size effect
    float breathAmplitude = .25;
    
    // Independent breathing rates for each particle
    // Create a random speed factor for each particle, this can be passed as an attribute or uniform if varying for each
    float breathingRate = vPhase * 0.15; // just as an example
    
    // Apply the breathing effect
    float breath = (1.0 + breathAmplitude * sin(uTime + vPhase)) * size;

    // Calculate distance from the camera along z-axis
    float distanceFromCamera = cameraPosition.z - modPos.z;
    float zFadeStart = cameraPosition.z - 10.0; // Adjusted to start fading 10 units in front of the camera
    float zFadeEnd = cameraPosition.z; // End fading exactly at the camera
    float fadeFactor = clamp((distanceFromCamera - 10.0) / 10.0, 0.0, 1.0);

    // Compute point size
    gl_PointSize = breath + (100.0 / size) * fadeFactor; // Adjust the 300.0 factor to scale the points

    gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
}
`;

  // Fragment shader for particles
  const particleFragmentShader = `
  uniform sampler2D pointTexture;
  uniform float uTime;
  varying vec3 vColor;
  varying float vPhase; // The phase shift of each particle
  uniform float uElapsedTime; // Time since the particles started
  varying vec3 modPos;
  varying float vDiffColor;
  out vec4 fragColor;
  
  void main() {
    float fadeInDuration = 10.0; // Duration of the fade-in effect in seconds
    float maxAlpha = 0.6; // Maximum alpha value
  
    // Calculate base alpha based on fade-in time
    float baseAlpha = maxAlpha * clamp(uElapsedTime / fadeInDuration, 0.0, 1.0);
  
    float distance = length(gl_PointCoord - vec2(0.5, 0.5));
    float alphaGradient = 1.0 - smoothstep(0.8, 0.9, distance); // Soft edges
  
    // Apply the flickering effect smoothly
    float flickerFrequency = 0.85; // Adjust frequency for a slower flicker
    float flickerAmplitude = .5; // Reduce amplitude for subtle flickering
  
    // Ensure the flicker effect is smooth and continuous
    float flicker = sin(uElapsedTime * flickerFrequency + vPhase * 6.28318) * flickerAmplitude + 1.0;
  
    // Interpolate the alpha to smoothly transition to the flickering effect
    float alpha = mix(baseAlpha, maxAlpha * flicker, smoothstep(fadeInDuration * 0.9, fadeInDuration, uElapsedTime));
  
    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
  
    // Define gradient colors
    vec3 endColor = vec3(1.0, 1.0, 1.0);
    vec3 startColor = vec3(120. / 255., 163. / 255., 211. / 255.);
  
    // Calculate gradient factor based on position or time
    float gradientFactor = smoothstep(0.0, 1.0, length(modPos.xyz) / 3.5); // Adjust the division factor for different gradients
  
    // Interpolate between the start and end colors
    vec3 gradientColor = mix(startColor, endColor, gradientFactor);
  
    if (vDiffColor > 0.0) {
      texColor.rgb = vec3(0.0, 1.0, 0.0);
    } else {
      texColor.rgb *= gradientColor;
    }
  
    fragColor = vec4(texColor.rgb, texColor.a * alpha * alphaGradient);
  }
  `;
  

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

  const N = 2000;

  var position = new THREE.BufferAttribute(new Float32Array(3 * N), 3),
    color = new THREE.BufferAttribute(new Float32Array(3 * N), 3),
    v = new THREE.Vector3(),
    sizes = new THREE.BufferAttribute(new Float32Array(N), 1),
    phases = new THREE.BufferAttribute(new Float32Array(N), 1);
  // Define a base hue for your particles
  const colorVariation = 100; // Variation in hue for each particle
  const baseHue = 0; // For completely random base hues

  for (var i = 0; i < N; i++) {
    v.randomDirection().setLength(10 * Math.pow(Math.random(), 1));
    position.setXYZ(i, v.x, 0, v.z);
    // position.setZ(i, Math.min(camera.position.z + 5, position.getZ(i)));

    const hue = (baseHue + colorVariation * Math.random()) % 1.0;
    const saturation = .15; // Adjust for desired saturation
    const lightness = 0.9; // Adjust for desired lightness

    let { r, g, b } = hslToRgb(hue, saturation, lightness);
    color.setXYZ(i, r / 255, g / 255, b / 255); // Ensure colors are normalized between 0 and 1
    sizes.setX(i, 5.5 + Math.random() * 20.25);
    phases.setX(i, Math.random() * 2 * Math.PI);
  }

  var pointGeom = new THREE.BufferGeometry();
  pointGeom.setAttribute("position", position);
  pointGeom.setAttribute("color", color);
  pointGeom.setAttribute("size", sizes);
  pointGeom.setAttribute("phase", phases);

  //   console.log('cam pos: '+camera.position.clone().toArray().toString())

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
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
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
