
  // Vertex shader for particles
  export const VertexShader = 
`
// Define the maximum number of simultaneous bursts
#define MAX_BURSTS 5

uniform vec3 uClickPositions[MAX_BURSTS];
uniform float uBurstTimes[MAX_BURSTS];
uniform int uActiveBursts;  // Number of active bursts

uniform float uTime;
attribute float size;       // Add a size attribute
attribute float phase;      // Add a phase attribute
attribute float life;       // Life of the particle
attribute float permanent;  // Whether the particle is permanent or temporary
attribute float maxLife;

uniform float uHasBloom;  // Bloom effect flag

varying float vLife;         // Pass life to fragment shader
varying float vPermanent;    // Pass permanent status to fragment shader
varying float vMaxLife;      // Maximum life of the particle
varying float vPhase;
varying vec3 modPos;
varying float vDiffColor;
varying float vHasBloom;

vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float permute(float x) {
    return floor(mod(((x * 34.0) + 1.0) * x, 289.0));
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip) {
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p, s;

    p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;

    return p;
}

float sNoise(vec4 v) {
    const vec2 C = vec2(0.138196601125010504, 0.309016994374947451);

    // First corner
    vec4 i = floor(v + dot(v, C.yyyy));
    vec4 x0 = v - i + dot(i, C.xxxx);

    // Rank sorting
    vec4 i0;
    vec3 isX = step(x0.yzw, x0.xxx);
    vec3 isYZ = step(x0.zww, x0.yyz);

    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;

    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // Clamp values
    vec4 i3 = clamp(i0, 0.0, 1.0);
    vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
    vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);

    vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
    vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
    vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
    vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

    // Permutations
    i = mod(i, 289.0);
    float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute(permute(permute(permute(i.w + vec4(i1.w, i2.w, i3.w, 1.0)) + i.z + vec4(i1.z, i2.z, i3.z, 1.0)) + i.y + vec4(i1.y, i2.y, i3.y, 1.0)) + i.x + vec4(i1.x, i2.x, i3.x, 1.0));

    vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);

    vec4 p0 = grad4(j0, ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4, p4));

    vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;

    return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2))) + dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));
}

float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

float easeOutCubic(float t) {
    return 1.0 - pow(1.0 - t, 3.0);
}

float easeInCubic(float t) {
    return t * t * t;
}

float easeInOutSquared(float t) {
    return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0;
}

float easeOutSquared(float t) {
    return 1.0 - (1.0 - t) * (1.0 - t);
}


void main() {
    vPhase = phase;  // Pass the phase to the fragment shader
    vLife = life;
    vPermanent = permanent;  // Pass permanent status
    vMaxLife = maxLife;  // Pass maximum life to the fragment shader

    vHasBloom = uHasBloom;  // Pass bloom effect flag

    float timeOffset = uTime * 0.15 + vPhase;
    vec4 posTime = vec4(position, timeOffset * 0.025);
    float noiseValue = sNoise(posTime);
    
    modPos = position;

    if (vPermanent != 0.0) {
        modPos.x += noiseValue * 2.75;  // Apply noise uniformly.
        modPos.y += noiseValue * 0.15;  // Apply noise uniformly.
        modPos.z += noiseValue * 0.025; // Apply noise uniformly.

        // Buoyancy effect - particles slowly rise up.
        float buoyancy = sin(timeOffset + modPos.y) * 0.15;

        // Horizontal wave movement.
        float wave = sin(timeOffset + modPos.x) * 0.1;

        // Apply noise and buoyancy to modify position.
        modPos.y += buoyancy;
        modPos.x += wave;
    } else {
     // Calculate the progression of the particle's life (from 0.0 to 1.0)
float lifeProgress = clamp(life / maxLife, 0.0, 1.0);
      // Generate random spherical coordinates for expansion direction
      float burstStrength = easeOutSquared(lifeProgress) * 4.0;  // Smooth expansion with linear start and ease out
      float burstSeed = dot(position.xy + phase, vec2(12.9898, 78.233)) * phase;
      float theta = mod(burstSeed, 6.28318530718);
      float phi = acos(2.0 * fract(burstSeed * 0.1) - 1.0);
                
      vec3 sphericalDirection = vec3(
          sin(phi) * cos(theta),
          sin(phi) * sin(theta),
          cos(phi)
      );

      modPos += sphericalDirection * burstStrength * 0.05;
// Calculate time offset for buoyancy effect
timeOffset = life * 0.15 + vPhase;

// Use an easing function to make buoyancy stronger towards the end of life
float buoyancyStrength = easeInCubic(lifeProgress);  // Starts small, grows stronger

// Calculate buoyancy with the easing function applied
float buoyancy = sin(timeOffset + modPos.y) * 0.15 * buoyancyStrength;  // Scale buoyancy by life progression
        float wave = sin(timeOffset + modPos.x) * 0.1 * buoyancyStrength;  // Scale wave by life progression

// Apply buoyancy to modPos (Y direction)
modPos.y += buoyancy;
modPos.x += wave;
    }

    // Apply multiple burst effects
    bool foundPrev = false;
    for (int i = 0; i < 5; i++) {
        vec3 burstPosition = uClickPositions[i];
        float burstTime = uBurstTimes[i];

        // Convert modPos to clip space and then to screen space
        vec4 clipSpacePos = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
        vec3 screenSpacePos = clipSpacePos.xyz / clipSpacePos.w;
        vec2 screenPos = screenSpacePos.xy * 0.5 + 0.5;

        // // Convert burst position from screen space to world space using unprojection
        vec4 burstPosClip = vec4((burstPosition.xy * 2.0 - 1.0), -1.0, 1.0);  // Z set to -1.0 for near plane
        vec4 burstPositionWorld = inverse(projectionMatrix) * burstPosClip;
        burstPositionWorld /= burstPositionWorld.w;  // Perspective divide to get world-space position

        // Calculate distance from the click position in screen space
        float dist = distance(screenPos, burstPosition.xy);

        // Clamp uBurstTime to ensure it doesn't exceed the intended duration
        float clampedBurstTime = min(burstTime, 2.0);

        // Apply burst effect only within a certain radius
        float radius = .1 * (1.0 - smoothstep(0.0, 2.0, clampedBurstTime));  // Decreases over time

        if (dist <= radius && vPermanent != 0.0) {
        float origZ = modPos.z;
                foundPrev = true;
// Calculate the force of the burst based on distance and time
float burstStrength = (1.0 - (dist / radius)) * easeOutCubic(clamp(clampedBurstTime / 2.0, 0.0, 1.0)) * 10.0;  // Smooth expansion with linear start and ease out

// Generate a random direction for spherical distribution
float burstSeed = dot(position.xy, vec2(12.9898, 78.233)) * phase;
float theta = mod(burstSeed, 6.28318530718);  // Random angle between 0 and 2π
float phi = acos(2.0 * fract(burstSeed * 0.1) - 1.0);  // Random angle between 0 and π
                
vec3 sphericalDirection = vec3(
    sin(phi) * cos(theta),
    sin(phi) * sin(theta),
    0.
);

// Ensure proper outward direction calculation
// Transform modPos to world space, then calculate the outward direction from the click point
vec3 worldPos = (modelMatrix * vec4(vec3(modPos.xy, 0.0), 1.0)).xyz;
vec2 outwardDirection = normalize(worldPos.xy - burstPositionWorld.xy);  // Outward direction on the 2D plane

// Correct the direction by making sure it's outward and clamping if needed
if (dot(outwardDirection, worldPos.xy - burstPositionWorld.xy) < 0.0) {
    outwardDirection *= -1.0;  // Invert direction if pointing inward
}

// Mix the outward direction with some randomness for spherical distribution
vec3 finalDirection = normalize(mix(vec3(outwardDirection.xy, 0.), sphericalDirection, 0.5));
finalDirection.z = 0.0;  // Ensure no movement in the z-axis
// Apply burst effect to modPos
modPos += finalDirection * burstStrength * 0.05;  // Gradually apply the burst over time
modPos.z = origZ;  // Ensure no movement in the z-axis

                // vDiffColor = 1.0;
        }
    }

    // Breathing size effect
    float breathAmplitude = 0.25;
    float breath = (1.0 + breathAmplitude * sin(uTime + vPhase)) * size;

    // Calculate distance from the camera along z-axis
    float distanceFromCamera = cameraPosition.z - modPos.z;
    float zFadeStart = cameraPosition.z - 10.0;  // Start fading 10 units in front of the camera
    float zFadeEnd = cameraPosition.z;  // End fading exactly at the camera
    float fadeFactor = clamp((distanceFromCamera - 10.0) / 10.0, 0.0, 1.0);

    // Compute point size
    gl_PointSize = breath + (100.0 / size) * fadeFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(modPos, 1.0);
}
`;

  // Fragment shader for particles
  export const FragmentShader = `
  uniform sampler2D pointTexture;
  uniform float uTime;
  // varying vec3 vColor;
  varying float vPhase; // The phase shift of each particle
  uniform float uElapsedTime; // Time since the particles started
  varying vec3 modPos;
  varying float vDiffColor;
  out vec4 fragColor;
  varying float vLife;  // Life of the particle
  varying float vMaxLife;  // Maximum life of the particle
  varying float vPermanent;  // Permanent status (1.0 = permanent, 0.0 = temporary)
  varying float vHasBloom;
  
  void main() {
    float fadeInDuration = 5.0; // Duration of the fade-in effect in seconds

    if(vPermanent == 0.0) {
        fadeInDuration = 0.0;  // Shorter fade-in for temporary particles
    }

    float maxAlpha = 0.6; // Maximum alpha value

    // if (vHasBloom > 0.0) {
    //     maxAlpha = 0.5;  // Increase max alpha for particles with bloom
    // }
  
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

    if(vPermanent == 0.0) {
      float fadeOutDuration = 1.0; // Duration of the fade-out effect in seconds
      if (vLife >= vMaxLife - fadeOutDuration) {
        // Start fading out the particle in the last 1 second of its life
        float lifeRemaining = clamp(1.0 - (vLife - (vMaxLife - fadeOutDuration)) / fadeOutDuration, 0.0, 1.0);
        alpha *= lifeRemaining;
      }
    }


    float finalAlpha = texColor.a * alpha * alphaGradient;

    fragColor = vec4(texColor.rgb, finalAlpha);
  }
  `;
