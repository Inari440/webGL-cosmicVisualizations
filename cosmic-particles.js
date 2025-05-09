/**
 * Cosmic Particles - WebGL Particle System
 * Simulates flowing cosmic particles with curl noise field
 */

// WebGL setup
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

// Global variables
let cameraDistance = 40.0;
let cameraTarget = [0, 0, 0];
let rotationX = 0.3; // Start with slight downward view
let rotationY = 0.0; // Start looking straight at the galaxy
let fpsCounter = 0;
let lastTimestamp = 0;
let fps = 0;
let statsElement = document.getElementById("stats");
let lastFrameTime = 0;
let isRendering = false;
let renderProgress = 0;
let isLightTheme = false;

// Particle system parameters
const presets = {
   default: {
      particleCount: 45000,
      particleSize: 2.0,
      animationSpeed: 1.0,
      noiseScale: 3.0,
      curlIntensity: 1.5,
      turbulence: 0.5,
      colorMode: 0,
      colorIntensity: 0.8,
      glowIntensity: 1.0,
      quality: 1.0,
   },
   nebula: {
      particleCount: 80000,
      particleSize: 1.8,
      animationSpeed: 0.7,
      noiseScale: 2.5,
      curlIntensity: 1.8,
      turbulence: 0.8,
      colorMode: 1,
      colorIntensity: 1.2,
      glowIntensity: 1.5,
      quality: 1.0,
   },
   galaxy: {
      particleCount: 150000,
      particleSize: 0.8, // Smaller stars
      animationSpeed: 0.05,
      noiseScale: 8.0,
      curlIntensity: 0.3,
      turbulence: 0.02,
      colorMode: 6,
      colorIntensity: 1.4,
      glowIntensity: 1.8, // More glow for brightness
      quality: 1.0,
   },
   stardust: {
      particleCount: 150000,
      particleSize: 1.0,
      animationSpeed: 1.2,
      noiseScale: 2.0,
      curlIntensity: 1.0,
      turbulence: 0.6,
      colorMode: 3,
      colorIntensity: 0.7,
      glowIntensity: 0.8,
      quality: 1.0,
   },
   energetic: {
      particleCount: 70000,
      particleSize: 2.2,
      animationSpeed: 1.5,
      noiseScale: 1.5,
      curlIntensity: 2.5,
      turbulence: 1.2,
      colorMode: 4,
      colorIntensity: 1.5,
      glowIntensity: 1.8,
      quality: 1.0,
   },
   performance: {
      particleCount: 20000,
      particleSize: 3.0,
      animationSpeed: 0.8,
      noiseScale: 5.0,
      curlIntensity: 1.0,
      turbulence: 0.3,
      colorMode: 0,
      colorIntensity: 0.7,
      glowIntensity: 0.6,
      quality: 0.5,
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
 * Initialize WebGL rendering with loading sequence
 */
function initWebGL() {
   // Loading simulation
   simulateLoading();

   // Set up rendering pipeline
   setupShaders();
   
   // Check initial theme setting
   isLightTheme = document.body.classList.contains('light-theme');
}

/**
 * Simulate loading progress with realistic stages
 */
function simulateLoading() {
   let progress = 0;
   const progressBar = document.getElementById("loading-progress");
   const loadingText = document.querySelector(".loading-text");

   // Calculate realistic intervals based on how complex each step should appear
   const intervals = [
      { target: 15, text: "Initializing WebGL context..." },
      { target: 30, text: "Configuring particle system..." },
      { target: 45, text: "Generating flow fields..." },
      { target: 60, text: "Building particle buffer..." },
      { target: 75, text: "Compiling shaders..." },
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
 * Set up WebGL shaders for particle rendering
 */
function setupShaders() {
   // Vertex shader for particle rendering
   const vertexShaderSource = `
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aOffset;
attribute float aAge;
attribute float aLife;
attribute float aSize;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uTime;
uniform float uParticleSize;
uniform bool uIsLightTheme;

varying float vAge;
varying float vLife;

void main() {
   // Calculate normalized age
   vAge = aAge;
   vLife = aLife;
   
   // Apply position offset
   vec3 newPosition = aPosition;
   
   // Calculate size with time variation for subtle animation
   float scaledSize = aSize * uParticleSize * (0.9 + 0.1 * sin(uTime * 0.5 + aPosition.x * 10.0));
   
   // Pass position to fragment shader
   gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(newPosition, 1.0);
   
   // Calculate point size based on distance and normalize for consistent size
   float dist = length(gl_Position.xyz);
   gl_PointSize = scaledSize * (40.0 / dist);
}
`;

   // Fragment shader for particle rendering with glow
   const fragmentShaderSource = `
precision mediump float;

uniform float uTime;
uniform int uColorMode;
uniform float uColorIntensity;
uniform float uGlowIntensity;
uniform bool uIsLightTheme;

varying float vAge;
varying float vLife;

// Constants
#define PI 3.14159265359
#define TWO_PI 6.28318530718

// Function to create soft particle with antialiasing
float softCircle(vec2 uv, float radius) {
   float dist = length(uv - vec2(0.5));
   return smoothstep(radius, radius * 0.8, dist);
}

// Enhanced color functions with smoother gradients
vec3 colorByMode(float t, int mode) {
   // Base colors for each mode
   vec3 col;
   
   // Apply repeatable but non-looping color mapping
   t = fract(t);

   if (mode == 0) { // Cosmic blue
      col = vec3(
         0.1 + 0.1 * sin(t * TWO_PI),
         0.3 + 0.3 * sin(t * TWO_PI + 1.0),
         0.6 + 0.4 * sin(t * TWO_PI + 3.0)
      );
   }
   else if (mode == 1) { // Nebula purple
      col = vec3(
         0.5 + 0.4 * sin(t * TWO_PI + 2.0),
         0.2 + 0.2 * sin(t * TWO_PI + 1.0),
         0.5 + 0.4 * sin(t * TWO_PI)
      );
   }
   else if (mode == 2) { // Aurora
      col = vec3(
         0.1 + 0.1 * sin(t * TWO_PI),
         0.5 + 0.4 * sin(t * TWO_PI + 2.0),
         0.3 + 0.3 * sin(t * TWO_PI + 4.0)
      );
   }
   else if (mode == 3) { // Moonlight
      float v = 0.6 + 0.3 * sin(t * TWO_PI);
      col = vec3(v, v * 1.05, v * 1.1) * vec3(0.8, 0.9, 1.0);
   }
   else if (mode == 4) { // Sunset
      col = vec3(
         0.8 + 0.2 * sin(t * TWO_PI),
         0.4 + 0.2 * sin(t * TWO_PI + 2.5),
         0.2 + 0.3 * sin(t * TWO_PI + 1.0)
      );
   }
   else if (mode == 5) { // Rainbow
      col = vec3(
         0.5 + 0.5 * sin(t * TWO_PI),
         0.5 + 0.5 * sin(t * TWO_PI + TWO_PI/3.0),
         0.5 + 0.5 * sin(t * TWO_PI + 2.0*TWO_PI/3.0)
      );
   }
   else if (mode == 6) { // Galaxy (white/blue stars)
      // Distance from center of time cycle affects color
      float bright = pow(0.5 + 0.5 * sin(t * TWO_PI), 4.0); // Sharper brightness peaks
      
      // Create color variation from blue-white to yellow-white
      float temp = fract(t * 3.7); // Use fraction for color temperature variation
      
      // Color temperature based on blackbody radiation (stars)
      if (temp < 0.6) { // Blue-white stars (hotter)
         col = vec3(
            0.7 + 0.3 * bright, // Red component
            0.8 + 0.2 * bright, // Green component
            1.0             // Blue component (strongest)
         );
      } else if (temp < 0.9) { // White stars (medium temp)
         col = vec3(
            0.9 + 0.1 * bright, // Red component
            0.9 + 0.1 * bright, // Green component  
            0.9 + 0.1 * bright  // Blue component
         );
      } else { // Yellow/orange stars (cooler)
         col = vec3(
            1.0,             // Red component
            0.8 + 0.1 * bright, // Green component
            0.5 + 0.1 * bright  // Blue component (weakest)
         );
      }
      
      // Brightness boost in center for central bulge effect
      float boost = pow(0.5 + 0.5 * sin(t * 5.0), 8.0) * 0.5; // Sharp occasional brightness boosts
      col += vec3(boost);
   }
   else { // Fallback (smooth rainbow)
      col = vec3(
         0.5 + 0.5 * sin(t * TWO_PI),
         0.5 + 0.5 * sin(t * TWO_PI + 2.0),
         0.5 + 0.5 * sin(t * TWO_PI + 4.0)
      );
   }

   // Adjust colors for light theme if needed
   if (uIsLightTheme && mode != 6) { // Don't adjust galaxy colors for light theme
      // For light theme, we want more saturated and brighter colors
      col = pow(col, vec3(0.7)) * 1.1;
   }

   // Add subtle variation based on time for animation
   float timeVariation = sin(uTime * 0.3) * 0.05;
   return clamp(col + vec3(timeVariation), 0.0, 1.0);
}

void main() {
   // Create a soft particle shape
   vec2 uv = gl_PointCoord;
   float circle = softCircle(uv, 0.5);
   
   // Adjust alpha based on particle age
   float ageRatio = vAge / vLife;
   
   // Particle gets more transparent as it ages
   float alpha = circle * (1.0 - pow(ageRatio, 2.0));
   
   // Calculate base color based on position and time
   float colorParam = fract(vAge * 0.1 + uTime * 0.05);
   vec3 baseColor = colorByMode(colorParam, uColorMode) * uColorIntensity;
   
   // Add glow effect
   float glow = uGlowIntensity * 0.4 * (1.0 - ageRatio) * circle;
   baseColor += glow * colorByMode(colorParam + 0.25, uColorMode);
   
   // Adjust the background color based on theme
   vec3 bgColor = uIsLightTheme ? vec3(1.0) : vec3(0.0);
   
   // Special treatment for galaxy mode
   if (uColorMode == 6) {
      // Make small bright center for particles
      float centerGlow = smoothstep(0.3, 0.0, length(uv - vec2(0.5)));
      baseColor += centerGlow * 0.5 * vec3(1.0);
      
      // Make darker background
      bgColor = vec3(0.0);
      
      // Randomize brightness based on position to create twinkling effect
      float twinkle = sin(uTime * (0.5 + (colorParam * 2.0)) + colorParam * 100.0) * 0.15 + 0.85;
      baseColor *= twinkle;
   }
   
   // Output final color with alpha
   gl_FragColor = vec4(baseColor, alpha);
}
`;

   // Compile shaders
   const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
   const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

   if (!vertexShader || !fragmentShader) {
      document.getElementById("loading-overlay").innerHTML =
         '<div class="loading-text">Shader compilation failed. Please try a different browser or update your graphics drivers.</div>';
      return;
   }

   // Create and link program
   const program = createProgram(vertexShader, fragmentShader);
   if (!program) {
      document.getElementById("loading-overlay").innerHTML =
         '<div class="loading-text">Program linking failed. Please try a different browser or update your graphics drivers.</div>';
      return;
   }

   // Create particle system
   createParticleSystem(program);
}

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

/**
 * Create and initialize the particle system
 */
function createParticleSystem(program) {
   // Get attribute and uniform locations
   const attributes = {
      position: gl.getAttribLocation(program, "aPosition"),
      offset: gl.getAttribLocation(program, "aOffset"),
      age: gl.getAttribLocation(program, "aAge"),
      life: gl.getAttribLocation(program, "aLife"),
      size: gl.getAttribLocation(program, "aSize"),
   };

   // Log attribute locations for debugging
   console.log("Attribute locations:", attributes);

   const uniforms = {
      modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
      projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
      time: gl.getUniformLocation(program, "uTime"),
      particleSize: gl.getUniformLocation(program, "uParticleSize"),
      colorMode: gl.getUniformLocation(program, "uColorMode"),
      colorIntensity: gl.getUniformLocation(program, "uColorIntensity"),
      glowIntensity: gl.getUniformLocation(program, "uGlowIntensity"),
      isLightTheme: gl.getUniformLocation(program, "uIsLightTheme")
   };

   // Create particle buffers
   let maxParticles = 200000; // Maximum potential particles
   
   // Initial particle data setup
   const particles = new Float32Array(maxParticles * 8); // position(3), offset(2), age, life, size
   
   // Initialize particles
   initializeParticles(particles, params.particleCount);
   
   // Create position buffer
   const particleBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW);
   
   // Set up render progress indicator
   const renderProgressBar = document.createElement("div");
   renderProgressBar.id = "render-progress";
   renderProgressBar.innerHTML = '<div class="render-progress-inner"></div>';
   document.body.appendChild(renderProgressBar);

   // Start animation loop
   let previousParticleCount = params.particleCount;
   let particleData = particles;
   
   function render(time) {
      time *= 0.001; // Convert to seconds
      const deltaTime = time - lastFrameTime;
      lastFrameTime = time;

      // Update FPS counter
      fpsCounter++;
      if (time - lastTimestamp >= 1.0) {
         fps = fpsCounter;
         fpsCounter = 0;
         lastTimestamp = time;

         // Update stats display
         statsElement.textContent = `FPS: ${fps} | Particles: ${params.particleCount.toLocaleString()}`;
      }

      // Auto-rotation if enabled
      if (window.autoRotate && window.autoRotate()) {
         rotationY += 0.08 * deltaTime * window.rotationSpeed();
         rotationX += 0.03 * deltaTime * window.rotationSpeed() * Math.sin(time * 0.2);
         isRendering = true;
      }

      // Handle particle count changes
      if (previousParticleCount !== params.particleCount) {
         // Reinitialize particles with new count
         initializeParticles(particleData, params.particleCount);
         previousParticleCount = params.particleCount;
      }

      // Update particle positions
      updateParticles(particleData, params.particleCount, time, deltaTime * params.animationSpeed * 0.5); // Slow down movement by 50%

      // Buffer the updated particle data
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, particleData, gl.DYNAMIC_DRAW);

      // Resize canvas to fill window
      const targetWidth = window.innerWidth;
      const targetHeight = window.innerHeight;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
         canvas.width = targetWidth;
         canvas.height = targetHeight;
         isRendering = true;
      }

      // Quality scaling
      const qualityWidth = Math.floor(canvas.width * params.quality);
      const qualityHeight = Math.floor(canvas.height * params.quality);
      gl.viewport(0, 0, qualityWidth, qualityHeight);

      // Clear canvas with background color
      if (isLightTheme) {
         gl.clearColor(0.98, 0.98, 0.99, 1.0);
      } else {
         gl.clearColor(0.02, 0.02, 0.05, 1.0);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Enable blending for particles
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      
      // Use the shader program
      gl.useProgram(program);

      // Calculate projection and view matrices
      const aspect = canvas.width / canvas.height;
      const projectionMatrix = createPerspectiveMatrix(60, aspect, 0.1, 100);
      
      // Calculate camera position and view matrix
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);

      const cameraX = cameraTarget[0] + cameraDistance * sinY * cosX;
      const cameraY = cameraTarget[1] + cameraDistance * sinX;
      const cameraZ = cameraTarget[2] + cameraDistance * cosY * cosX;

      const viewMatrix = createViewMatrix([cameraX, cameraY, cameraZ], cameraTarget, [0, 1, 0]);
      
      // Combine view and model matrices
      const modelViewMatrix = viewMatrix;

      // Set uniforms
      gl.uniformMatrix4fv(uniforms.modelViewMatrix, false, modelViewMatrix);
      gl.uniformMatrix4fv(uniforms.projectionMatrix, false, projectionMatrix);
      gl.uniform1f(uniforms.time, time);
      gl.uniform1f(uniforms.particleSize, params.particleSize);
      gl.uniform1i(uniforms.colorMode, params.colorMode);
      gl.uniform1f(uniforms.colorIntensity, params.colorIntensity);
      gl.uniform1f(uniforms.glowIntensity, params.glowIntensity);
      gl.uniform1i(uniforms.isLightTheme, isLightTheme ? 1 : 0);

      // Set up attribute pointers
      gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
      
      // Only enable and set attributes that exist in the shader
      if (attributes.position >= 0) {
         gl.enableVertexAttribArray(attributes.position);
         gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 32, 0);
      }
      
      if (attributes.offset >= 0) {
         gl.enableVertexAttribArray(attributes.offset);
         gl.vertexAttribPointer(attributes.offset, 2, gl.FLOAT, false, 32, 12);
      }
      
      if (attributes.age >= 0) {
         gl.enableVertexAttribArray(attributes.age);
         gl.vertexAttribPointer(attributes.age, 1, gl.FLOAT, false, 32, 20);
      }
      
      if (attributes.life >= 0) {
         gl.enableVertexAttribArray(attributes.life);
         gl.vertexAttribPointer(attributes.life, 1, gl.FLOAT, false, 32, 24);
      }
      
      if (attributes.size >= 0) {
         gl.enableVertexAttribArray(attributes.size);
         gl.vertexAttribPointer(attributes.size, 1, gl.FLOAT, false, 32, 28);
      }

      // Draw particles
      gl.drawArrays(gl.POINTS, 0, params.particleCount);

      // Update rendering status
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

   // Start rendering
   requestAnimationFrame(render);
}

/**
 * Initialize particles with random positions and properties
 */
function initializeParticles(particles, count) {
   // Counter for central bulge particles
   const bulgeFraction = 0.3; // 30% of particles in the central bulge
   const bulgeCount = Math.floor(count * bulgeFraction);
   const diskCount = count - bulgeCount;
   
   // Generate bulge particles (central spherical concentration)
   for (let i = 0; i < bulgeCount; i++) {
      const baseIndex = i * 8;
      
      // Spherical distribution with gaussian falloff
      const u = Math.random();
      const v = Math.random();
      const w = Math.random();
      
      // Box-Muller transform for gaussian falloff
      const r = Math.abs(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)) * 2.5;
      const theta = 2 * Math.PI * w;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Convert to cartesian
      particles[baseIndex] = r * Math.sin(phi) * Math.cos(theta);     // x
      particles[baseIndex + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5; // y (flatter)
      particles[baseIndex + 2] = r * Math.cos(phi);                   // z
      
      // Random offset for position variation
      particles[baseIndex + 3] = Math.random() * 2 - 1;  // offset x
      particles[baseIndex + 4] = Math.random() * 2 - 1;  // offset y
      
      // Age and life values - longer life for stability
      particles[baseIndex + 5] = Math.random() * 10;     // current age
      particles[baseIndex + 6] = 10 + Math.random() * 20; // life
      
      // Size - smaller particles in bulge for star-like appearance
      const distanceFromCenter = Math.sqrt(
         particles[baseIndex] * particles[baseIndex] + 
         particles[baseIndex + 1] * particles[baseIndex + 1] + 
         particles[baseIndex + 2] * particles[baseIndex + 2]
      );
      
      // Central stars are brighter
      particles[baseIndex + 7] = 0.3 + (distanceFromCenter / 5.0) * 0.7 * Math.random(); 
   }
   
   // Generate disk particles (spiral arms)
   for (let i = bulgeCount; i < count; i++) {
      const baseIndex = i * 8;
      
      // Galaxy disk distribution with spiral arms
      const armCount = 4; // Number of spiral arms
      
      // Radius with density gradient (more particles toward center)
      // Use mix of random distributions for natural look
      let radius;
      if (Math.random() < 0.7) {
         // Power distribution for higher density in center
         radius = Math.pow(Math.random(), 2) * 15 + 3;
      } else {
         // Some particles stretch further out
         radius = Math.pow(Math.random(), 1.5) * 25 + 5;
      }
      
      // Very thin height distribution for flat disk
      const height = (Math.random() * 2 - 1) * (0.2 + radius * 0.02);
      
      // Random angle
      const angle = Math.random() * Math.PI * 2;
      
      // Determine which arm this particle belongs to
      const arm = Math.floor(Math.random() * armCount);
      const armOffset = (arm / armCount) * Math.PI * 2;
      
      // Spiral factor increases with radius
      const spiralTightness = 0.4 + Math.random() * 0.3;
      const spiralAngle = angle + armOffset + (radius * spiralTightness);
      
      // Add some arm width variation
      const armWidth = 0.15 + 0.05 * Math.random();
      const armFactor = Math.random() > armWidth ? 1.0 : 1.2; // Some particles outside main arms
      
      // Convert to cartesian with spiral pattern
      particles[baseIndex] = radius * Math.cos(spiralAngle) * armFactor;     // x
      particles[baseIndex + 1] = height;                                     // y
      particles[baseIndex + 2] = radius * Math.sin(spiralAngle) * armFactor; // z
      
      // Random offset for position variation
      particles[baseIndex + 3] = Math.random() * 2 - 1;  // offset x
      particles[baseIndex + 4] = Math.random() * 2 - 1;  // offset y
      
      // Age and life values
      particles[baseIndex + 5] = Math.random() * 10;      // current age
      particles[baseIndex + 6] = 10 + Math.random() * 20; // life
      
      // Size - brightness varies along arms
      const distanceFromCenter = Math.sqrt(
         particles[baseIndex] * particles[baseIndex] + 
         particles[baseIndex + 2] * particles[baseIndex + 2]
      );
      
      // Brightness adjustment with some randomness
      const brightness = Math.random() * 0.5 + 0.5; // Random factor to vary star brightness
      particles[baseIndex + 7] = (0.2 + (distanceFromCenter / 25) * 0.6) * brightness; 
   }
}

/**
 * Update particle positions and properties
 */
function updateParticles(particles, count, time, deltaTime) {
   // Calculate noise scale based on parameter
   const noiseScale = 1.0 / params.noiseScale;
   
   for (let i = 0; i < count; i++) {
      const baseIndex = i * 8;
      
      // Current position
      let x = particles[baseIndex];
      let y = particles[baseIndex + 1];
      let z = particles[baseIndex + 2];
      
      // Current age and life
      let age = particles[baseIndex + 5];
      const life = particles[baseIndex + 6];
      
      // Update age and recycle if necessary
      age += deltaTime;
      if (age > life) {
         // Reset particle using galaxy formation with spiral arms
         const armCount = 4;
         
         // Box-Muller transform for gaussian-like distribution
         const u = Math.random();
         const v = Math.random();
         const radius = Math.abs(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * 5) + 1;
         
         // Very thin height distribution for flatter galaxy
         const height = (Math.random() * 2 - 1) * (0.5 + radius * 0.05);
         
         // Random angle
         const angle = Math.random() * Math.PI * 2;
         
         // Determine which arm this particle belongs to
         const arm = Math.floor(Math.random() * armCount);
         const armOffset = (arm / armCount) * Math.PI * 2;
         
         // Spiral factor increases with radius
         const spiralTightness = 0.4 + Math.random() * 0.3;
         const spiralAngle = angle + armOffset + (radius * spiralTightness);
         
         // Convert to cartesian with spiral pattern
         x = radius * Math.cos(spiralAngle);
         y = height;
         z = radius * Math.sin(spiralAngle);
         
         // Reset age
         age = 0;
         
         // Update offsets
         particles[baseIndex + 3] = Math.random() * 2 - 1;
         particles[baseIndex + 4] = Math.random() * 2 - 1;
      } else {
         // Apply curl noise movement
         const noiseTime = time * 0.05; // Slower time progression for noise
         const nx = x * noiseScale;
         const ny = y * noiseScale;
         const nz = z * noiseScale;
         
         // Generate curl noise vector
         const curl = generateCurlNoise(nx, ny, nz, noiseTime);
         
         // Almost no turbulence for galaxy formation
         const turbulence = params.turbulence * 0.3;
         const turbX = (Math.random() * 2 - 1) * turbulence * deltaTime;
         const turbY = (Math.random() * 2 - 1) * turbulence * deltaTime;
         const turbZ = (Math.random() * 2 - 1) * turbulence * deltaTime;
         
         // Calculate distance from center for orbital movement influence
         const dist = Math.sqrt(x*x + z*z); // XZ plane for galaxy rotation
         
         // Orbital velocity factor - Keplerian motion (faster near center)
         // v ∝ 1/√r for orbital velocity in gravitational systems
         const orbitalFactor = dist < 0.1 ? 1.0 : 0.4 / Math.sqrt(dist);
         
         // Calculate orbital direction vector (perpendicular to radius)
         const dx = -z / (dist + 0.0001); // Avoid division by zero
         const dz = x / (dist + 0.0001);
         
         // Even stronger orbital dominance for galaxy effect
         const blendFactor = Math.min(0.95, 0.8 + 0.15 * (1.0 - Math.min(1.0, dist / 15.0)));
         
         // Extremely slow movement overall
         const speedScale = 0.1 + (dist / 30.0) * 0.1; // 0.1 to 0.2x speed
         
         // Update position with combined movement - extremely slow motion
         x += (((curl[0] * params.curlIntensity * (1-blendFactor)) + 
               (dx * orbitalFactor * blendFactor) + turbX) * 
               deltaTime * 1.5 * speedScale);
               
         // Almost no vertical movement for very flat galaxy
         y += (((curl[1] * params.curlIntensity * 0.05) + turbY) * 
               deltaTime * 0.5 * speedScale);
               
         z += (((curl[2] * params.curlIntensity * (1-blendFactor)) + 
               (dz * orbitalFactor * blendFactor) + turbZ) * 
               deltaTime * 1.5 * speedScale);
         
         // Containment - soft boundary
         const totalDist = Math.sqrt(x*x + y*y + z*z);
         if (totalDist > 30) {
            const scale = 29 / totalDist;
            x *= scale;
            y *= scale;
            z *= scale;
         }
         
         // Even stronger pull toward galactic plane (y=0) for flatter galaxy
         const planePull = 0.25;
         y -= y * planePull * deltaTime;
      }
      
      // Update particle data
      particles[baseIndex] = x;
      particles[baseIndex + 1] = y;
      particles[baseIndex + 2] = z;
      particles[baseIndex + 5] = age;
   }
}

/**
 * Generate curl noise for fluid-like motion
 */
function generateCurlNoise(x, y, z, time) {
   // Apply time to coordinates for animation
   const tx = x + time;
   const ty = y + time * 0.8;
   const tz = z + time * 1.2;
   
   // Epsilon for gradient calculation
   const eps = 0.0001;
   
   // Calculate noise gradients
   const n1 = simplexNoise(tx + eps, ty, tz) - simplexNoise(tx - eps, ty, tz);
   const n2 = simplexNoise(tx, ty + eps, tz) - simplexNoise(tx, ty - eps, tz);
   const n3 = simplexNoise(tx, ty, tz + eps) - simplexNoise(tx, ty, tz - eps);
   
   const n4 = simplexNoise(tx, ty + eps, tz + eps) - simplexNoise(tx, ty - eps, tz - eps);
   const n5 = simplexNoise(tx + eps, ty, tz + eps) - simplexNoise(tx - eps, ty, tz - eps);
   const n6 = simplexNoise(tx + eps, ty + eps, tz) - simplexNoise(tx - eps, ty - eps, tz);
   
   // Calculate curl
   let curlX = (n2 - n3) / (2 * eps);
   let curlY = (n3 - n1) / (2 * eps);
   let curlZ = (n1 - n2) / (2 * eps);
   
   // Add higher frequency details
   const scale = 0.3;
   curlX += (n4 - n6) * scale;
   curlY += (n5 - n4) * scale;
   curlZ += (n6 - n5) * scale;
   
   // Return curl vector
   return [curlX, curlY, curlZ];
}

/**
 * Simplified version of simplex noise for motion
 */
function simplexNoise(x, y, z) {
   // This is a very simple pseudo-noise function for demonstration
   // In a real implementation, you'd use a proper 3D simplex noise
   const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
   const t = Math.sin(x * 39.346 + y * 11.135 + z * 83.155) * 53758.5453;
   return (Math.sin(s + t) + 1) * 0.5;
}

/**
 * Create a perspective matrix
 */
function createPerspectiveMatrix(fovDegrees, aspect, near, far) {
   const fovRadians = fovDegrees * Math.PI / 180;
   const f = 1.0 / Math.tan(fovRadians / 2);
   const rangeInv = 1 / (near - far);
   
   return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
   ];
}

/**
 * Create a view matrix
 */
function createViewMatrix(eye, center, up) {
   // Calculate forward (z) vector
   const zx = eye[0] - center[0];
   const zy = eye[1] - center[1];
   const zz = eye[2] - center[2];
   
   // Normalize z
   let zLen = Math.sqrt(zx * zx + zy * zy + zz * zz);
   if (zLen > 0) {
      zLen = 1 / zLen;
   }
   const z = [zx * zLen, zy * zLen, zz * zLen];
   
   // Calculate x vector (right) as cross product of up and z
   const xx = up[1] * z[2] - up[2] * z[1];
   const xy = up[2] * z[0] - up[0] * z[2];
   const xz = up[0] * z[1] - up[1] * z[0];
   
   // Normalize x
   let xLen = Math.sqrt(xx * xx + xy * xy + xz * xz);
   if (xLen > 0) {
      xLen = 1 / xLen;
   }
   const x = [xx * xLen, xy * xLen, xz * xLen];
   
   // Calculate y vector as cross product of z and x
   const yx = z[1] * x[2] - z[2] * x[1];
   const yy = z[2] * x[0] - z[0] * x[2];
   const yz = z[0] * x[1] - z[1] * x[0];
   
   // Create y vector from the calculated components
   const y = [yx, yy, yz];
   
   // Build view matrix
   const matrix = [
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
      -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
      -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
      1
   ];
   
   return matrix;
}

// Expose a function to trigger rendering
function triggerRendering() {
   isRendering = true;
   renderProgress = 0;
}

// Add global function to update theme state
window.updateThemeState = function(isLight) {
   isLightTheme = isLight;
   triggerRendering(); // Re-render with new theme
};

// Make function accessible globally
window.triggerRendering = triggerRendering;

// Add global function to load presets
window.loadPreset = function(presetName) {
   if (presets[presetName]) {
      Object.assign(params, presets[presetName]);
      console.log(`Loaded preset: ${presetName}`);
      triggerRendering();
      
      // Update any UI elements if they exist
      if (document.getElementById("status-rendering")) {
         document.getElementById("status-rendering").textContent = `Galaxy preset loaded`;
      }
   } else {
      console.error(`Preset '${presetName}' not found`);
   }
};
