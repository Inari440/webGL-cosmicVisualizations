/**
 * Mandelbulb Explorer - WebGL Rendering Module
 * Enhanced version with improved shader performance and visual effects
 */

// WebGL setup
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

// Global variables
let cameraDistance = 2.5;
let cameraTarget = [0, 0, 0];
let rotationX = 0;
let rotationY = 0;
let fpsCounter = 0;
let lastTimestamp = 0;
let fps = 0;
let statsElement = document.getElementById("stats");
let lastFrameTime = 0;
let isRendering = false;
let renderProgress = 0;
let isLightTheme = false; // Added variable to track theme

// Enhanced parameter presets with more distinctive variations
const presets = {
   default: {
      power: 8.0,
      iterations: 9,
      maxSteps: 100,
      epsilon: 0.001,
      bailout: 2.0,
      ambient: 0.2,
      diffuse: 0.7,
      specular: 0.3,
      shininess: 30.0,
      colorMode: 0,
      colorScale: 0.5,
      colorCycles: 3.0,
      fogDensity: 0.15,
      quality: 1.0,
   },
   psychedelic: {
      power: 9.2,
      iterations: 8,
      maxSteps: 100,
      epsilon: 0.001,
      bailout: 3.0,
      ambient: 0.3,
      diffuse: 0.6,
      specular: 0.5,
      shininess: 20.0,
      colorMode: 2,
      colorScale: 1.2,
      colorCycles: 6.0,
      fogDensity: 0.05,
      quality: 1.0,
   },
   fiery: {
      power: 7.5,
      iterations: 8,
      maxSteps: 100,
      epsilon: 0.001,
      bailout: 2.0,
      ambient: 0.2,
      diffuse: 0.8,
      specular: 0.4,
      shininess: 40.0,
      colorMode: 1,
      colorScale: 0.7,
      colorCycles: 2.0,
      fogDensity: 0.12,
      quality: 1.0,
   },
   ocean: {
      power: 8.3,
      iterations: 7,
      maxSteps: 100,
      epsilon: 0.001,
      bailout: 2.0,
      ambient: 0.3,
      diffuse: 0.6,
      specular: 0.7,
      shininess: 50.0,
      colorMode: 2,
      colorScale: 0.5,
      colorCycles: 3.0,
      fogDensity: 0.2,
      quality: 1.0,
   },
   performance: {
      power: 8.0,
      iterations: 5,
      maxSteps: 60,
      epsilon: 0.002,
      bailout: 2.0,
      ambient: 0.3,
      diffuse: 0.7,
      specular: 0.2,
      shininess: 20.0,
      colorMode: 3,
      colorScale: 0.5,
      colorCycles: 3.0,
      fogDensity: 0.1,
      quality: 0.5,
   },
   midnight: {
      power: 8.8,
      iterations: 10,
      maxSteps: 120,
      epsilon: 0.0008,
      bailout: 2.5,
      ambient: 0.15,
      diffuse: 0.65,
      specular: 0.8,
      shininess: 60.0,
      colorMode: 5,
      colorScale: 0.6,
      colorCycles: 5.0,
      fogDensity: 0.25,
      quality: 1.0,
   },
};

// Active parameters
const params = Object.assign({}, presets.default);

// Initialize WebGL
if (!gl) {
   alert("WebGL not supported by your browser");
   document.getElementById("loading-overlay").innerHTML =
      '<div class="loading-text">WebGL not supported by your browser. Please try a different browser or update your graphics drivers.</div>';
} else {
   initWebGL();
}

/**
 * Initialize WebGL rendering with enhanced loading sequence
 */
function initWebGL() {
   // Improved loading simulation with more realistic progress
   simulateLoading();

   // Set up rendering pipeline
   setupShaders();
   
   // Check initial theme setting
   isLightTheme = document.body.classList.contains('light-theme');
   
   // Note: We're not adding event listener here anymore as it's handled in main.js
   // We'll update the isLightTheme variable via the window.updateThemeState function
}

/**
 * Simulate loading progress with more realistic stages
 */
function simulateLoading() {
   let progress = 0;
   const progressBar = document.getElementById("loading-progress");
   const loadingText = document.querySelector(".loading-text");

   // Calculate realistic intervals based on how complex each step should appear
   const intervals = [
      { target: 15, text: "Initializing WebGL context..." },
      { target: 30, text: "Compiling shaders..." },
      { target: 45, text: "Initializing 3D environment..." },
      { target: 60, text: "Setting up fractal parameters..." },
      { target: 75, text: "Preparing rendering pipeline..." },
      { target: 90, text: "Optimizing performance..." },
      { target: 100, text: "Ready!" },
   ];

   let currentInterval = 0;

   // Enhanced loading simulation with variable speed
   const loadingInterval = setInterval(() => {
      const interval = intervals[currentInterval];

      // Approach target with easing
      const step = Math.max(1, (interval.target - progress) / 10);
      progress += step;
      progressBar.style.width = progress + "%";

      // Update text when crossing thresholds
      if (progress >= interval.target) {
         loadingText.textContent = interval.text;
         currentInterval++;

         // Add subtle animation to text
         loadingText.style.transition = "transform 0.3s ease-out";
         loadingText.style.transform = "scale(1.03)";
         setTimeout(() => {
            loadingText.style.transform = "scale(1)";
         }, 300);
      }

      // Complete loading sequence
      if (currentInterval >= intervals.length) {
         clearInterval(loadingInterval);

         // Add final animation before hiding overlay
         setTimeout(() => {
            progressBar.style.transition = "transform 0.5s ease-out";
            progressBar.style.transform = "scaleX(1.03)";
            setTimeout(() => {
               document.getElementById("loading-overlay").style.opacity = "0";
               setTimeout(() => {
                  document.getElementById("loading-overlay").style.display = "none";
               }, 500);
            }, 500);
         }, 500);
      }
   }, 100);
}

/**
 * Set up WebGL shaders with enhanced rendering techniques
 */
function setupShaders() {
   // Enhanced vertex shader with transformation support
   const vertexShaderSource = `
attribute vec4 aPosition;
varying vec2 vTexCoord;
void main() {
  vTexCoord = aPosition.xy * 0.5 + 0.5;
  gl_Position = aPosition;
}
`;

   // Enhanced fragment shader with improved Mandelbulb rendering
   const fragmentShaderSource = `
precision mediump float;
varying vec2 vTexCoord;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uCamera;
uniform mat3 uRotation;
uniform bool uIsLightTheme; // New uniform for theme

// Fractal parameters
uniform float uPower;
uniform int uIterations;
uniform int uMaxSteps;
uniform float uEpsilon;
uniform float uBailout;

// Lighting parameters
uniform float uAmbient;
uniform float uDiffuse;
uniform float uSpecular;
uniform float uShininess;

// Visual parameters
uniform int uColorMode;
uniform float uColorScale;
uniform float uColorCycles;
uniform float uFogDensity;

// Constants
#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define MAX_ITERATIONS 16

// Mandelbulb distance estimation function with optimization
float DE(vec3 pos) {
  vec3 z = pos;
  float dr = 1.0;
  float r = 0.0;
  float power = uPower;
  float bailout = uBailout;

  // Loop unrolling for better performance
  for (int i = 0; i < MAX_ITERATIONS; i++) {
    if (i >= uIterations) break;

    r = length(z);

    // Early bailout optimization
    if (r > bailout) break;

    // Convert to polar coordinates
    float theta = atan(z.y, z.x);
    float phi = acos(z.z / r);

    // Calculate derivative for better gradient estimation
    dr = pow(r, power - 1.0) * power * dr + 1.0;

    // Scale and rotate (optimized)
    float zr = pow(r, power);
    theta = theta * power;
    phi = phi * power;

    // Convert back to cartesian with precomputed trigonometric functions
    float sinPhi = sin(phi);
    z = zr * vec3(
      sinPhi * cos(theta),
      sinPhi * sin(theta),
      cos(phi)
    );

    // Add original position
    z += pos;
  }

  // Enhanced distance estimation formula for better surface detail
  return 0.5 * log(r) * r / dr;
}

// Calculate normal vector with improved accuracy
vec3 calculateNormal(vec3 p) {
  const float h = 0.0001;
  vec2 k = vec2(1.0, -1.0);

  return normalize(
    k.xyy * DE(p + k.xyy * h) +
    k.yxy * DE(p + k.yxy * h) +
    k.yyx * DE(p + k.yyx * h) +
    k.xxx * DE(p + k.xxx * h)
  );
}

// Enhanced color functions with smoother gradients
vec3 colorByMode(float t, int mode) {
  // Apply repeatable but non-looping color mapping
  t = fract(t * uColorScale);

  // Base colors for each mode
  vec3 col;

  if (mode == 0) { // Grayscale (enhanced contrast)
    col = vec3(0.2 + 0.6 * t);
  }
  else if (mode == 1) { // Fiery
    col = vec3(
      0.5 + 0.5 * sin(t * 3.0 * uColorCycles),
      0.2 + 0.3 * sin(t * 2.5 * uColorCycles + 0.5),
      0.1 + 0.2 * sin(t * 2.0 * uColorCycles + 1.0)
    );
  }
  else if (mode == 2) { // Ocean Blue
    col = vec3(
      0.1 + 0.1 * sin(t * 3.0 * uColorCycles),
      0.2 + 0.2 * sin(t * 5.0 * uColorCycles + 1.0),
      0.3 + 0.5 * sin(t * uColorCycles + 2.0)
    );
  }
  else if (mode == 3) { // Monochrome (subtle gradient)
    float v = 0.1 + 0.25 * t;
    col = vec3(v, v * 1.05, v * 1.1);
  }
  else if (mode == 4) { // Midnight
    col = vec3(
      0.1 + 0.2 * sin(t * TWO_PI),
      0.2 + 0.2 * sin(t * TWO_PI + 2.0),
      0.4 + 0.4 * sin(t * TWO_PI + 4.0)
    );
  }
  else if (mode == 5) { // Neon
    col = vec3(
      0.1 + 0.3 * sin(t * uColorCycles * 0.8 + 2.0),
      0.0 + 0.2 * sin(t * uColorCycles * 1.5 + 4.0),
      0.5 + 0.5 * sin(t * uColorCycles * 0.7)
    );
  }
  else { // Fallback (smooth rainbow)
    col = vec3(
      0.5 + 0.5 * sin(t * TWO_PI),
      0.5 + 0.5 * sin(t * TWO_PI + 2.0),
      0.5 + 0.5 * sin(t * TWO_PI + 4.0)
    );
  }

  // Add subtle variation based on time for subtle animation in materials
  float timeVariation = sin(uTime * 0.2) * 0.05;
  return clamp(col + vec3(timeVariation), 0.0, 1.0);
}

// Enhanced ray marching with adaptive step sizing and improved effects
vec4 raymarch(vec3 ro, vec3 rd) {
  float t = 0.01;
  float tmax = 20.0;
  float glow = 0.0;
  float steps = 0.0;

  // Distance counter for enhanced coloring
  float distanceTraveled = 0.0;

  // Improved ambient occlusion accumulation
  float ao = 0.0;

  // Adaptive step size factor based on distance from camera
  float adaptiveFactor = 0.5 + 0.5 * (1.0 - exp(-length(ro) * 0.1));

  // Ray marching loop
  for (int i = 0; i < 200; i++) {
    if (i >= uMaxSteps) break;
    steps += 1.0;

    vec3 pos = ro + rd * t;
    float d = DE(pos);

    // Accumulate distance
    distanceTraveled += d;

    // Enhanced glow accumulation with distance falloff
    glow += 1.0 / (1.0 + d * d * 100.0) * (1.0 - float(i) / float(uMaxSteps));

    // Ambient occlusion approximation
    ao += d * exp(-float(i) * 0.05);

    // Hit surface with enhanced precision at close distances
    if (d < uEpsilon * t) {
      // Calculate normal
      vec3 normal = calculateNormal(pos);

      // Enhanced lighting with dual light sources and rim lighting
      vec3 lightDir1 = normalize(vec3(1.0, 0.8, 0.6));
      vec3 lightDir2 = normalize(vec3(-0.5, 0.2, 0.3));
      vec3 viewDir = -rd;
      vec3 halfDir1 = normalize(lightDir1 + viewDir);
      vec3 halfDir2 = normalize(lightDir2 + viewDir);

      // Lighting components with physically-based shading
      float diffuse1 = max(0.0, dot(normal, lightDir1));
      float diffuse2 = max(0.0, dot(normal, lightDir2)) * 0.4; // Secondary light is dimmer

      // Blinn-Phong specular reflection
      float specular1 = pow(max(0.0, dot(normal, halfDir1)), uShininess);
      float specular2 = pow(max(0.0, dot(normal, halfDir2)), uShininess) * 0.3;

      // Fresnel/rim lighting effect for edge highlighting
      float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), 4.0);

      // Dynamic base color based on position and distance
      float colorParam = 0.5 + 0.5 * sin(length(pos) * 3.0 + distanceTraveled * 0.1);
      vec3 baseColor = colorByMode(colorParam, uColorMode);

      // Apply ambient occlusion
      float aoFactor = clamp(ao / float(steps), 0.0, 1.0);

      // Combine lighting components
      vec3 color = vec3(0.0);
      color += baseColor * uAmbient * (0.5 + 0.5 * aoFactor); // Ambient with AO
      color += baseColor * uDiffuse * diffuse1; // Primary light
      color += baseColor * uDiffuse * 0.5 * diffuse2; // Secondary light
      color += vec3(1.0, 0.98, 0.95) * uSpecular * specular1; // Primary specular
      color += vec3(0.9, 0.95, 1.0) * uSpecular * specular2; // Secondary specular
      color += baseColor * fresnel * 0.3; // Rim lighting

      // Distance-based fog with color tinting
      float fogFactor = 1.0 - exp(-t * uFogDensity);
      
      // Choose fog color based on theme
      vec3 fogColor;
      if (uIsLightTheme) {
        fogColor = vec3(0.95, 0.95, 0.97); // Light theme base fog
        
        // Tint light fog based on color mode
        if (uColorMode == 1) { // Fiery
          fogColor = vec3(0.98, 0.95, 0.93);
        } else if (uColorMode == 2) { // Ocean
          fogColor = vec3(0.95, 0.97, 1.0);
        } else if (uColorMode == 5) { // Neon
          fogColor = vec3(0.97, 0.95, 1.0);
        }
      } else {
        fogColor = vec3(0.01, 0.01, 0.03); // Dark theme base fog
        
        // Tint dark fog based on color mode (original)
        if (uColorMode == 1) { // Fiery
          fogColor = vec3(0.03, 0.01, 0.01);
        } else if (uColorMode == 2) { // Ocean
          fogColor = vec3(0.01, 0.02, 0.05);
        } else if (uColorMode == 5) { // Neon
          fogColor = vec3(0.02, 0.0, 0.08);
        }
      }

      // Apply fog
      color = mix(color, fogColor, fogFactor);

      // Return final color with full opacity
      return vec4(color, 1.0);
    }

    // Escaped condition optimization
    if (t > tmax) break;

    // Adaptive step size for better performance and quality
    t += max(d * adaptiveFactor, 0.005);
  }

  // Choose background color based on theme
  vec3 bgColor;
  if (uIsLightTheme) {
    bgColor = vec3(0.97, 0.97, 0.99); // Light theme base background
    
    // Customize light background based on color mode
    if (uColorMode == 1) { // Fiery
      bgColor = vec3(0.99, 0.97, 0.96);
    } else if (uColorMode == 2) { // Ocean
      bgColor = vec3(0.96, 0.98, 1.0);
    } else if (uColorMode == 5) { // Neon
      bgColor = vec3(0.98, 0.96, 1.0);
    }
  } else {
    bgColor = vec3(0.0, 0.0, 0.02); // Dark theme base background (original)
    
    // Customize dark background based on color mode (original)
    if (uColorMode == 1) { // Fiery
      bgColor = vec3(0.02, 0.0, 0.01);
    } else if (uColorMode == 2) { // Ocean
      bgColor = vec3(0.0, 0.01, 0.03);
    } else if (uColorMode == 5) { // Neon
      bgColor = vec3(0.01, 0.0, 0.04);
    }
  }

  // Apply accumulated glow
  float glowFactor = pow(glow * 0.01, 1.5) * (uIsLightTheme ? 0.2 : 0.4); // Reduced glow for light theme

  // Select glow color based on color mode and theme
  vec3 glowColor;
  if (uIsLightTheme) {
    // Light theme glow colors
    if (uColorMode == 0) glowColor = vec3(0.7, 0.7, 0.7); // Grayscale
    else if (uColorMode == 1) glowColor = vec3(0.8, 0.5, 0.3); // Fiery
    else if (uColorMode == 2) glowColor = vec3(0.4, 0.6, 0.9); // Ocean
    else if (uColorMode == 5) glowColor = vec3(0.6, 0.3, 0.9); // Neon
    else glowColor = vec3(0.6, 0.6, 0.7); // Default
  } else {
    // Dark theme glow colors (original)
    if (uColorMode == 0) glowColor = vec3(0.4, 0.4, 0.4); // Grayscale
    else if (uColorMode == 1) glowColor = vec3(0.5, 0.3, 0.2); // Fiery
    else if (uColorMode == 2) glowColor = vec3(0.2, 0.3, 0.6); // Ocean
    else if (uColorMode == 5) glowColor = vec3(0.4, 0.0, 0.7); // Neon
    else glowColor = vec3(0.3, 0.3, 0.4); // Default
  }

  // Apply glow with slight time variation for subtle animation
  float timeFactor = 0.95 + 0.05 * sin(uTime * 0.5);
  glowFactor *= timeFactor;

  // Return background with applied glow
  return vec4(mix(bgColor, glowColor, glowFactor), 1.0);
}

void main() {
  // Set up camera ray
  vec2 uv = vTexCoord * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  // Ray origin and direction
  vec3 ro = uCamera;
  vec3 rd = normalize(uRotation * vec3(uv, -1.5));

  // Perform enhanced ray marching
  vec4 color = raymarch(ro, rd);

  // Post-processing effects

  // Enhanced vignette with subtle color tinting
  float vignette = 1.0 - 0.3 * length(vTexCoord - 0.5);
  vignette = pow(vignette, 1.5); // More natural falloff
  
  // Softer vignette for light theme
  if (uIsLightTheme) {
    vignette = mix(vignette, 1.0, 0.6); // Reduce vignette intensity for light theme
  }
  
  color.rgb *= vignette;

  // Subtle film grain with time variation for animation
  float noise = fract(sin(dot(vTexCoord, vec2(12.9898, 78.233)) * 43758.5453 + uTime));
  color.rgb += (noise - 0.5) * (uIsLightTheme ? 0.015 : 0.025); // Less noise for light theme

  // Subtle chromatic aberration at edges
  float distFromCenter = length(vTexCoord - 0.5) * 2.0;
  vec2 dir = normalize(vTexCoord - 0.5);
  float aberrationStrength = 0.003 * distFromCenter * distFromCenter;

  vec4 rColor = raymarch(ro, normalize(uRotation * vec3(uv + dir * aberrationStrength, -1.5)));
  vec4 bColor = raymarch(ro, normalize(uRotation * vec3(uv - dir * aberrationStrength, -1.5)));

  // Apply subtle RGB split only at edges for performance
  if (distFromCenter > 0.7) {
    color.r = mix(color.r, rColor.r, distFromCenter - 0.7);
    color.b = mix(color.b, bColor.b, distFromCenter - 0.7);
  }

  // Contrast enhancement
  color.rgb = pow(color.rgb, vec3(uIsLightTheme ? 1.01 : 1.02)); // Slightly less contrast for light theme

  // Output final color
  gl_FragColor = color;
}
`;

   // Compile shader function
   function compileShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
         console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
         return null;
      }

      return shader;
   }

   // Create and link program function
   function createProgram(vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
         console.error("Program linking error:", gl.getProgramInfoLog(program));
         return null;
      }

      return program;
   }

   // Compile shaders
   const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
   const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

   if (!vertexShader || !fragmentShader) {
      document.getElementById("loading-overlay").innerHTML =
         '<div class="loading-text">Shader compilation failed. Please try a different browser or update your graphics drivers.</div>';
      return;
   }

   // Create program
   const program = createProgram(vertexShader, fragmentShader);

   if (!program) {
      document.getElementById("loading-overlay").innerHTML =
         '<div class="loading-text">Program linking failed. Please try a different browser or update your graphics drivers.</div>';
      return;
   }

   // Create quad geometry
   const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
   const positionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

   // Setup attributes and uniforms
   const positionLocation = gl.getAttribLocation(program, "aPosition");

   // Get all uniform locations
   const uniforms = {
      resolution: gl.getUniformLocation(program, "uResolution"),
      time: gl.getUniformLocation(program, "uTime"),
      camera: gl.getUniformLocation(program, "uCamera"),
      rotation: gl.getUniformLocation(program, "uRotation"),
      isLightTheme: gl.getUniformLocation(program, "uIsLightTheme"), // Add new uniform

      // Fractal parameters
      power: gl.getUniformLocation(program, "uPower"),
      iterations: gl.getUniformLocation(program, "uIterations"),
      maxSteps: gl.getUniformLocation(program, "uMaxSteps"),
      epsilon: gl.getUniformLocation(program, "uEpsilon"),
      bailout: gl.getUniformLocation(program, "uBailout"),

      // Lighting parameters
      ambient: gl.getUniformLocation(program, "uAmbient"),
      diffuse: gl.getUniformLocation(program, "uDiffuse"),
      specular: gl.getUniformLocation(program, "uSpecular"),
      shininess: gl.getUniformLocation(program, "uShininess"),

      // Visual parameters
      colorMode: gl.getUniformLocation(program, "uColorMode"),
      colorScale: gl.getUniformLocation(program, "uColorScale"),
      colorCycles: gl.getUniformLocation(program, "uColorCycles"),
      fogDensity: gl.getUniformLocation(program, "uFogDensity"),
   };

   // Set up render progress indicator
   const renderProgressBar = document.createElement("div");
   renderProgressBar.id = "render-progress";
   renderProgressBar.innerHTML = '<div class="render-progress-inner"></div>';
   document.body.appendChild(renderProgressBar);

   // Start the animation loop
   requestAnimationFrame(render);

   /**
    * Main render function, called every frame with enhanced performance monitoring
    */
   function render(time) {
      // Calculate elapsed time and FPS
      time *= 0.001; // Convert to seconds
      const deltaTime = time - lastFrameTime;
      lastFrameTime = time;

      // Update FPS counter
      fpsCounter++;
      if (time - lastTimestamp >= 1.0) {
         fps = fpsCounter;
         fpsCounter = 0;
         lastTimestamp = time;

         // Update stats display with enhanced info
         const targetWidth = Math.round(canvas.width * params.quality);
         const targetHeight = Math.round(canvas.height * params.quality);
         statsElement.textContent = `FPS: ${fps} | Resolution: ${targetWidth}x${targetHeight} | Power: ${params.power.toFixed(
            1
         )}`;
      }

      // Auto-rotation if enabled
      if (window.autoRotate && window.autoRotate()) {
         rotationY += 0.005 * window.rotationSpeed();
         // Add slight oscillation to X rotation for more interesting movement
         rotationX += 0.0005 * Math.sin(time * 0.2) * window.rotationSpeed();
         isRendering = true;
      }

      // Resize canvas to fill window
      const targetWidth = window.innerWidth;
      const targetHeight = window.innerHeight;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
         canvas.width = targetWidth;
         canvas.height = targetHeight;
         isRendering = true;
      }

      // Apply quality scaling for rendering
      const qualityWidth = Math.floor(canvas.width * params.quality);
      const qualityHeight = Math.floor(canvas.height * params.quality);

      // Set the viewport to the scaled size
      gl.viewport(0, 0, qualityWidth, qualityHeight);

      // Clear canvas
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use shader program
      gl.useProgram(program);

      // Set up vertex attributes
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Calculate camera position and rotation matrix
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      // Rotation matrix (3x3)
      const rotationMatrix = [
         cosY,
         0,
         -sinY,
         sinY * sinX,
         cosX,
         cosY * sinX,
         sinY * cosX,
         -sinX,
         cosY * cosX,
      ];

      // Calculate camera position from rotation and distance
      const cameraX = cameraTarget[0] + cameraDistance * sinY * cosX;
      const cameraY = cameraTarget[1] + cameraDistance * sinX;
      const cameraZ = cameraTarget[2] + cameraDistance * cosY * cosX;

      // Set all uniforms
      gl.uniform2f(uniforms.resolution, qualityWidth, qualityHeight);
      gl.uniform1f(uniforms.time, time);
      gl.uniform3f(uniforms.camera, cameraX, cameraY, cameraZ);
      gl.uniformMatrix3fv(uniforms.rotation, false, rotationMatrix);
      gl.uniform1i(uniforms.isLightTheme, isLightTheme ? 1 : 0); // Set theme uniform

      // Fractal parameters
      gl.uniform1f(uniforms.power, params.power);
      gl.uniform1i(uniforms.iterations, params.iterations);
      gl.uniform1i(uniforms.maxSteps, params.maxSteps);
      gl.uniform1f(uniforms.epsilon, params.epsilon);
      gl.uniform1f(uniforms.bailout, params.bailout);

      // Lighting parameters
      gl.uniform1f(uniforms.ambient, params.ambient);
      gl.uniform1f(uniforms.diffuse, params.diffuse);
      gl.uniform1f(uniforms.specular, params.specular);
      gl.uniform1f(uniforms.shininess, params.shininess);

      // Visual parameters
      gl.uniform1i(uniforms.colorMode, params.colorMode);
      gl.uniform1f(uniforms.colorScale, params.colorScale);
      gl.uniform1f(uniforms.colorCycles, params.colorCycles);
      gl.uniform1f(uniforms.fogDensity, params.fogDensity);

      // Draw the quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Update rendering status with smooth transition
      if (isRendering) {
         renderProgress += (100 - renderProgress) * Math.min(deltaTime * 10, 1);

         if (renderProgress > 99) {
            renderProgress = 0;
            isRendering = false;

            // Update status
            if (window.setStatusRendering) {
               window.setStatusRendering("Render complete");
            } else {
               document.getElementById("status-rendering").textContent = "Render complete";
            }

            // Hide progress bar
            document.querySelector("#render-progress").style.opacity = "0";
         } else {
            // Update progress bar
            document.querySelector(
               "#render-progress .render-progress-inner"
            ).style.width = `${renderProgress}%`;
            document.querySelector("#render-progress").style.opacity = "1";
         }
      }

      // Request next frame
      requestAnimationFrame(render);
   }
}

// Add custom rendering progress bar styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
   #render-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: rgba(0, 0, 0, 0.1);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
   }

   .light-theme #render-progress {
      background: rgba(0, 0, 0, 0.05);
   }

   #render-progress .render-progress-inner {
      height: 100%;
      width: 0;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      transition: width 0.2s ease-out;
   }
`;
document.head.appendChild(styleSheet);

// Expose a function to trigger rendering
function triggerRendering() {
   isRendering = true;
   renderProgress = 0;
}

// Make functions accessible globally
window.triggerRendering = triggerRendering;

// Add global function to update theme state
window.updateThemeState = function(isLight) {
   isLightTheme = isLight;
   triggerRendering(); // Re-render with new theme
};
