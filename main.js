/**
 * Mandelbulb Explorer - Professional UI and Interaction
 * Refined interaction module with enhanced visual feedback and microinteractions
 */

document.addEventListener("DOMContentLoaded", () => {
   // Global state for UI interaction
   let isDragging = false;
   let isPanning = false;
   let lastX = 0;
   let lastY = 0;
   let autoRotate = false;
   let rotationSpeed = 1.0;
   let activeTooltip = null;
   let currentPreset = "default";
   let isRendering = false;

   // Determine which page we're on
   const isCosmicParticlesPage = window.location.href.includes("cosmic-particles.html");

   // ===== UI Elements Setup =====
   setupPanels();
   setupSliders();
   setupColorSwatches();
   setupButtons();
   setupKeyboardShortcuts();
   setupMouseControls();
   setupUIAnimations();

   // Show welcome modal on first visit
   if (!localStorage.getItem("mandelbulb_welcomed") && !isCosmicParticlesPage) {
      setTimeout(() => {
         document.getElementById("welcome-modal").style.display = "flex";
         animateWelcomeModal();
      }, 800);
      localStorage.setItem("mandelbulb_welcomed", "true");
   } else if (!localStorage.getItem("particles_welcomed") && isCosmicParticlesPage) {
      setTimeout(() => {
         document.getElementById("welcome-modal").style.display = "flex";
         animateWelcomeModal();
      }, 800);
      localStorage.setItem("particles_welcomed", "true");
   }

   // ===== Animation and UI Enhancement Functions =====

   /**
    * Sets up animations for UI elements on page load
    */
   function setupUIAnimations() {
      // Animate UI container panels with staggered delay
      const panels = document.querySelectorAll(".panel");
      panels.forEach((panel, index) => {
         panel.style.opacity = "0";
         panel.style.transform = "translateX(10px)";
         setTimeout(() => {
            panel.style.transition = "all 0.4s ease";
            panel.style.opacity = "1";
            panel.style.transform = "translateX(0)";
         }, 100 + index * 50);
      });

      // Animate control buttons
      const controlButtons = document.querySelectorAll(".control-button");
      controlButtons.forEach((button, index) => {
         button.style.opacity = "0";
         button.style.transform = "translateY(10px)";
         setTimeout(() => {
            button.style.transition = "all 0.4s ease";
            button.style.opacity = "1";
            button.style.transform = "translateY(0)";
         }, 300 + index * 50);
      });

      // Add subtle hover effects to interactive elements
      addHoverEffects();

      // Add active slider effect - updates the track visualization
      document.querySelectorAll(".slider").forEach((slider) => {
         updateSliderTrack(slider.id);
      });
   }

   /**
    * Animates the welcome modal elements with fluid motion
    */
   function animateWelcomeModal() {
      const modalContent = document.querySelector(".modal-content");
      const featureItems = document.querySelectorAll(".feature-item");

      // Animate modal appearance with clean fade in
      modalContent.style.opacity = "0";
      modalContent.style.transform = "translateY(10px)";

      setTimeout(() => {
         modalContent.style.transition = "all 0.4s ease";
         modalContent.style.opacity = "1";
         modalContent.style.transform = "translateY(0)";
      }, 100);

      // Simple staggered animation for feature items
      featureItems.forEach((item, index) => {
         item.style.opacity = "0";
         item.style.transform = "translateY(10px)";

         setTimeout(() => {
            item.style.transition = "all 0.4s ease";
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
         }, 300 + index * 80);
      });
   }

   /**
    * Adds hover effects to buttons and interactive elements
    */
   function addHoverEffects() {
      // Button hover effect with subtle transform
      document.querySelectorAll(".button").forEach((button) => {
         button.addEventListener("mouseenter", () => {
            button.style.transform = "translateY(-1px)";
            const icon = button.querySelector(".icon");
            if (icon) icon.style.transform = "translateY(-1px)";
         });

         button.addEventListener("mouseleave", () => {
            button.style.transform = "";
            const icon = button.querySelector(".icon");
            if (icon) icon.style.transform = "";
         });
      });

      // Control buttons with subtle effect
      document.querySelectorAll(".control-button").forEach((button) => {
         button.addEventListener("mouseenter", () => {
            button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
         });

         button.addEventListener("mouseleave", () => {
            button.style.boxShadow = "";
         });
      });
   }

   /**
    * Set up expandable panels with smooth animations
    */
   function setupPanels() {
      document.querySelectorAll(".panel-header").forEach((header) => {
         header.addEventListener("click", () => {
            const panel = header.parentElement;
            const collapseIcon = header.querySelector(".collapse-icon");
            const content = panel.querySelector(".panel-content");

            // Add visual feedback on click
            addClickRipple(header, event);

            // Toggle expanded state with refined animation
            if (panel.classList.contains("expanded")) {
               // Set explicit height before collapsing
               content.style.height = content.scrollHeight + "px";
               content.style.overflow = "hidden";

               // Trigger transition with requestAnimationFrame for smoother animation
               requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                     content.style.height = "0";
                     collapseIcon.style.transform = "rotate(0deg)";
                  });
               });

               // Remove expanded class after transition
               content.addEventListener(
                  "transitionend",
                  function handler() {
                     panel.classList.remove("expanded");
                     content.style.height = "";
                     content.style.overflow = "";
                     content.removeEventListener("transitionend", handler);
                  },
                  { once: true }
               );
            } else {
               panel.classList.add("expanded");
               content.style.height = "0";
               content.style.overflow = "hidden";

               // Calculate height and set it for animation
               requestAnimationFrame(() => {
                  content.style.height = content.scrollHeight + "px";
                  collapseIcon.style.transform = "rotate(180deg)";

                  // Clear styles after animation completes
                  content.addEventListener(
                     "transitionend",
                     function handler() {
                        content.style.height = "";
                        content.style.overflow = "";
                        content.removeEventListener("transitionend", handler);
                     },
                     { once: true }
                  );
               });
            }
         });
      });
   }

   /**
    * Add subtle feedback effect on button/element click
    */
   function addClickRipple(element, event) {
      // Instead of visible ripple, use a more subtle feedback
      element.style.transition = "background-color 0.15s ease";
      
      // Save original background
      const originalBg = element.style.backgroundColor;
      
      // Apply subtle color change
      if (element.classList.contains('primary')) {
         element.style.backgroundColor = "var(--accent-dark)";
      } else {
         element.style.backgroundColor = "rgba(50, 50, 60, 0.2)";
      }
      
      // Reset after short delay
      setTimeout(() => {
         element.style.backgroundColor = originalBg;
         element.style.transition = "";
      }, 150);
   }

   /**
    * Set up all sliders with visual track updates and feedback
    */
   function setupSliders() {
      // Add track element to each slider
      document.querySelectorAll(".slider").forEach((slider) => {
         const container = slider.closest(".slider-container");

         // Create and append track element if it doesn't exist
         if (!container.querySelector(".slider-track")) {
            const track = document.createElement("div");
            track.classList.add("slider-track");
            container.appendChild(track);

            // Position it correctly
            track.style.position = "absolute";
            track.style.height = "4px";
            track.style.borderRadius = "2px";
            track.style.background = "var(--gradient-accent)";
            track.style.pointerEvents = "none";

            // Calculate position relative to slider
            const sliderRect = slider.getBoundingClientRect();
            track.style.top = slider.offsetTop + sliderRect.height / 2 - 2 + "px";
            track.style.left = "0";

            // Initial update
            updateSliderTrack(slider.id);
         }

         // Update visual track on slider change
         slider.addEventListener("input", (e) => {
            updateSliderTrack(slider.id);

            // Value element animation
            const valueElement = container.querySelector(".slider-value");
            valueElement.classList.add("value-updated");
            setTimeout(() => {
               valueElement.classList.remove("value-updated");
            }, 300);

            // Add rendering status update
            setStatusRendering();
         });
      });

      // Setup sliders based on which page we're on
      if (isCosmicParticlesPage) {
         setupParticleSliders();
      } else {
         setupMandelbulbSliders();
      }

      // Rotation speed slider (common to both pages)
      setupSlider("rotation-speed-slider", "rotation-speed-value", (value) => {
         rotationSpeed = value;
         return value.toFixed(1);
      });
   }

   /**
    * Set up sliders specific to the Mandelbulb page
    */
   function setupMandelbulbSliders() {
      // Power slider
      setupSlider("power-slider", "power-value", (value) => {
         params.power = value;
         return value.toFixed(1);
      });

      // Iterations slider
      setupSlider("iterations-slider", "iterations-value", (value) => {
         params.iterations = parseInt(value);
         return value;
      });

      // Bailout slider
      setupSlider("bailout-slider", "bailout-value", (value) => {
         params.bailout = value;
         return value.toFixed(1);
      });

      // Quality slider
      setupSlider("quality-slider", "quality-value", (value) => {
         params.quality = value;
         return value.toFixed(2);
      });

      // Epsilon slider
      setupSlider("epsilon-slider", "epsilon-value", (value) => {
         params.epsilon = value;
         return value.toFixed(4);
      });

      // Max steps slider
      setupSlider("max-steps-slider", "max-steps-value", (value) => {
         params.maxSteps = parseInt(value);
         return value;
      });

      // Ambient slider
      setupSlider("ambient-slider", "ambient-value", (value) => {
         params.ambient = value;
         return value.toFixed(2);
      });

      // Diffuse slider
      setupSlider("diffuse-slider", "diffuse-value", (value) => {
         params.diffuse = value;
         return value.toFixed(2);
      });

      // Specular slider
      setupSlider("specular-slider", "specular-value", (value) => {
         params.specular = value;
         return value.toFixed(2);
      });

      // Shininess slider
      setupSlider("shininess-slider", "shininess-value", (value) => {
         params.shininess = value;
         return value.toFixed(0);
      });

      // Fog density slider
      setupSlider("fog-density-slider", "fog-density-value", (value) => {
         params.fogDensity = value;
         return value.toFixed(2);
      });

      // Color scale slider
      setupSlider("color-scale-slider", "color-scale-value", (value) => {
         params.colorScale = value;
         return value.toFixed(1);
      });

      // Color cycles slider
      setupSlider("color-cycles-slider", "color-cycles-value", (value) => {
         params.colorCycles = value;
         return value.toFixed(1);
      });
   }

   /**
    * Set up sliders specific to the Cosmic Particles page
    */
   function setupParticleSliders() {
      // Particle count slider
      setupSlider("count-slider", "count-value", (value) => {
         params.particleCount = parseInt(value);
         return value.toLocaleString();
      });

      // Particle size slider
      setupSlider("size-slider", "size-value", (value) => {
         params.particleSize = value;
         return value.toFixed(1);
      });

      // Animation speed slider
      setupSlider("speed-slider", "speed-value", (value) => {
         params.animationSpeed = value;
         return value.toFixed(1);
      });

      // Noise scale slider
      setupSlider("noise-scale-slider", "noise-scale-value", (value) => {
         params.noiseScale = value;
         return value.toFixed(1);
      });

      // Curl intensity slider
      setupSlider("curl-intensity-slider", "curl-intensity-value", (value) => {
         params.curlIntensity = value;
         return value.toFixed(1);
      });

      // Turbulence slider
      setupSlider("turbulence-slider", "turbulence-value", (value) => {
         params.turbulence = value;
         return value.toFixed(1);
      });

      // Color intensity slider
      setupSlider("color-intensity-slider", "color-intensity-value", (value) => {
         params.colorIntensity = value;
         return value.toFixed(1);
      });

      // Glow intensity slider
      setupSlider("glow-intensity-slider", "glow-intensity-value", (value) => {
         params.glowIntensity = value;
         return value.toFixed(1);
      });
   }

   /**
    * Updates the visual track of a slider
    */
   function updateSliderTrack(sliderId) {
      const slider = document.getElementById(sliderId);
      const container = slider.closest(".slider-container");
      const track = container.querySelector(".slider-track");

      if (!track) return;

      const value = parseFloat(slider.value);
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const percent = ((value - min) / (max - min)) * 100;

      // Update track width - use CSS variable for animation
      container.style.setProperty("--slider-percent", percent + "%");
      track.style.width = percent + "%";
   }

   /**
    * Helper to set up individual sliders with enhanced feedback
    */
   function setupSlider(sliderId, valueId, callback) {
      const slider = document.getElementById(sliderId);
      const valueElement = document.getElementById(valueId);

      slider.addEventListener("input", () => {
         const value = parseFloat(slider.value);
         valueElement.textContent = callback(value);
         setStatusRendering();

         // Add visual feedback when dragging
         slider.classList.add("active-slider");

         // Change cursor to grabbing
         slider.style.cursor = "grabbing";

         // Add active class to container for styling
         slider.closest(".slider-container").classList.add("active");
      });

      // Reset styles when done dragging
      slider.addEventListener("mouseup", () => {
         slider.classList.remove("active-slider");
         slider.style.cursor = "";
         slider.closest(".slider-container").classList.remove("active");
      });

      slider.addEventListener("mouseleave", () => {
         if (!slider.classList.contains("active-slider")) return;
         slider.classList.remove("active-slider");
         slider.style.cursor = "";
         slider.closest(".slider-container").classList.remove("active");
      });
   }

   /**
    * Set up color swatches with enhanced selection effects
    */
   function setupColorSwatches() {
      document.querySelectorAll(".color-swatch").forEach((swatch) => {
         swatch.addEventListener("click", () => {
            // Remove active class with animating transition
            const activeSwatch = document.querySelector(".color-swatch.active");
            if (activeSwatch) {
               activeSwatch.classList.add("deactivating");
               setTimeout(() => {
                  activeSwatch.classList.remove("active");
                  activeSwatch.classList.remove("deactivating");
               }, 200);
            }

            // Add active class with pulse animation
            setTimeout(() => {
               swatch.classList.add("active");
               swatch.classList.add("pulse");

               // Add visual feedback
               addClickRipple(swatch, event);

               setTimeout(() => {
                  swatch.classList.remove("pulse");
               }, 800);

               // Update model parameter
               params.colorMode = parseInt(swatch.getAttribute("data-mode"));
               setStatusRendering();

               // Show feedback message
               const colorNames = [
                  "Grayscale",
                  "Slate",
                  "Dark Blue",
                  "Monochrome",
                  "Midnight",
                  "Neon",
               ];
               const colorMode = parseInt(swatch.getAttribute("data-mode"));
               showNotification("Color Changed", `Color mode set to ${colorNames[colorMode]}`);
            }, 210);
         });
      });
   }

   /**
    * Setup all button interactions and click handlers
    */
   function setupButtons() {
      // Help button
      document.getElementById("help-button").addEventListener("click", (e) => {
         document.getElementById("help-panel").classList.add("visible");
         addClickRipple(document.getElementById("help-button"), e);
      });

      // Close help panel
      document.getElementById("close-help").addEventListener("click", () => {
         document.getElementById("help-panel").classList.remove("visible");
      });

      // Close welcome modal
      document.getElementById("close-welcome").addEventListener("click", () => {
         fadeOutElement(document.getElementById("welcome-modal"));
      });

      // Theme toggle button
      const themeToggle = document.getElementById("theme-toggle");
      if (themeToggle) {
         const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
         
         // Check for saved theme preference or use system preference
         const savedTheme = localStorage.getItem("theme");
         if (savedTheme === "light") {
            document.body.classList.add("light-theme");
            themeToggle.querySelector(".icon").textContent = "light_mode";
         } else if (savedTheme === "dark") {
            document.body.classList.remove("light-theme");
            themeToggle.querySelector(".icon").textContent = "dark_mode";
         } else if (prefersDarkScheme.matches) {
            document.body.classList.remove("light-theme");
            themeToggle.querySelector(".icon").textContent = "dark_mode";
         } else {
            document.body.classList.add("light-theme");
            themeToggle.querySelector(".icon").textContent = "light_mode";
         }
         
         // Sync initial theme state with WebGL renderer
         if (window.updateThemeState) {
            window.updateThemeState(document.body.classList.contains("light-theme"));
         }
         
         // Toggle theme when button is clicked
         themeToggle.addEventListener("click", (e) => {
            // Toggle the theme class
            document.body.classList.toggle("light-theme");
            
            // Determine if we're now in light theme
            const isLightTheme = document.body.classList.contains("light-theme");
            
            // Update localStorage
            localStorage.setItem("theme", isLightTheme ? "light" : "dark");
            
            // Update icon
            themeToggle.querySelector(".icon").textContent = isLightTheme ? "light_mode" : "dark_mode";
            
            // Sync with WebGL renderer - this is crucial!
            if (window.updateThemeState) {
               window.updateThemeState(isLightTheme);
            } else {
               console.warn("WebGL renderer theme update function not available");
            }
            
            // Add visual feedback
            addClickRipple(themeToggle, e);
            
            // Show notification of theme change
            const themeName = isLightTheme ? "Light" : "Dark";
            showNotification("Theme Changed", `${themeName} theme activated`, 2000);
         });
      }

      // Auto-rotate checkbox with animation
      const autoRotateCheckbox = document.getElementById("auto-rotate-checkbox");
      if (autoRotateCheckbox) {
         const rotationSpeedSlider = document.getElementById("rotation-speed-slider");

         autoRotateCheckbox.addEventListener("change", () => {
            autoRotate = autoRotateCheckbox.checked;
            if (rotationSpeedSlider) rotationSpeedSlider.disabled = !autoRotate;

            // Animate slider container
            if (rotationSpeedSlider) {
               const sliderContainer = rotationSpeedSlider.closest(".slider-container");

               if (autoRotate) {
                  sliderContainer.classList.add("active");
                  setTimeout(() => {
                     sliderContainer.classList.remove("active");
                  }, 600);

                  // Enable slider with animation
                  rotationSpeedSlider.style.opacity = "0.5";
                  setTimeout(() => {
                     rotationSpeedSlider.style.transition = "opacity 0.3s ease";
                     rotationSpeedSlider.style.opacity = "1";
                  }, 10);
               } else {
                  // Disable slider with animation
                  rotationSpeedSlider.style.transition = "opacity 0.3s ease";
                  rotationSpeedSlider.style.opacity = "0.5";
               }
            }
            
            setStatusRendering(autoRotate ? "Auto-rotating camera..." : "Camera rotation stopped");
            
            // Show notification
            showNotification(
               "Auto-rotation",
               autoRotate ? "Camera auto-rotation enabled" : "Camera auto-rotation disabled"
            );
         });
      }
      
      // Load preset button
      document.getElementById("load-preset-btn").addEventListener("click", (e) => {
         const presetSelector = document.getElementById("preset-selector");

         // Add ripple effect
         addClickRipple(document.getElementById("load-preset-btn"), e);

         // Apply preset with visual transitions
         if (presetSelector.value !== currentPreset) {
            currentPreset = presetSelector.value;
            animatePresetChange();
            loadPreset(presetSelector.value);
         } else {
            showNotification("No Change", "This preset is already active");
         }
      });

      // Save image button
      document.querySelectorAll("#save-image-btn").forEach((btn) => {
         btn.addEventListener("click", (e) => {
            addClickRipple(e.currentTarget, e);
            triggerShutterAnimation();
            saveImage();
         });
      });

      // Camera control buttons
      const zoomInBtn = document.getElementById("zoom-in-btn");
      if (zoomInBtn) {
         zoomInBtn.addEventListener("click", (e) => {
            addClickRipple(zoomInBtn, e);
            cameraDistance = Math.max(0.5, cameraDistance - 0.2);
            setStatusRendering("Zooming in...");
         });
      }
      
      const resetViewBtn = document.getElementById("reset-view-btn");
      if (resetViewBtn) {
         resetViewBtn.addEventListener("click", (e) => {
            addClickRipple(resetViewBtn, e);
            resetCamera();
            showNotification("Camera Reset", "Camera position has been reset to default view");
         });
      }
      
      const zoomOutBtn = document.getElementById("zoom-out-btn");
      if (zoomOutBtn) {
         zoomOutBtn.addEventListener("click", (e) => {
            addClickRipple(zoomOutBtn, e);
            cameraDistance = Math.min(10.0, cameraDistance + 0.2);
            setStatusRendering("Zooming out...");
         });
      }
   }

   /**
    * Animate preset changing with smooth transitions
    */
   function animatePresetChange() {
      // Fade transition for canvas
      const canvas = document.getElementById("canvas");
      canvas.style.transition = "opacity 0.2s ease";
      canvas.style.opacity = "0.8";
      
      setTimeout(() => {
         canvas.style.opacity = "1";
      }, 200);
   }

   /**
    * Trigger camera shutter animation
    */
   function triggerShutterAnimation() {
      // Create simple flash effect
      const shutter = document.createElement("div");
      shutter.style.position = "fixed";
      shutter.style.top = "0";
      shutter.style.left = "0";
      shutter.style.width = "100%";
      shutter.style.height = "100%";
      shutter.style.backgroundColor = "white";
      shutter.style.opacity = "0";
      shutter.style.transition = "opacity 0.15s ease";
      shutter.style.pointerEvents = "none";
      shutter.style.zIndex = "999";

      document.body.appendChild(shutter);

      // Clean flash animation
      setTimeout(() => {
         shutter.style.opacity = "0.7";
         setTimeout(() => {
            shutter.style.opacity = "0";
            setTimeout(() => {
               shutter.remove();
            }, 150);
         }, 80);
      }, 10);

      // Simple camera sound effect
      const shutterSound = new Audio(
         "data:audio/wav;base64,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"
      );
      shutterSound.play();
   }

   /**
    * Setup keyboard shortcuts with enhanced visual feedback
    */
   function setupKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
         // Show key press indicator
         showKeyPressIndicator(e.key);

         // 'H' key toggles help panel
         if (e.key === "h" || e.key === "H") {
            document.getElementById("help-panel").classList.toggle("visible");
         }

         // 'R' key resets camera
         if (e.key === "r" || e.key === "R") {
            resetCamera();
            showNotification("Camera Reset", "Camera position has been reset to default view");
         }

         // 'S' key saves image
         if (e.key === "s" || e.key === "S") {
            triggerShutterAnimation();
            saveImage();
         }

         // Space key toggles auto-rotation
         if (e.key === " ") {
            const autoRotateCheckbox = document.getElementById("auto-rotate-checkbox");
            autoRotate = !autoRotate;
            autoRotateCheckbox.checked = autoRotate;

            // Trigger checkbox change event to update UI
            const event = new Event("change");
            autoRotateCheckbox.dispatchEvent(event);
         }

         // '+' key increases detail
         if (e.key === "+" || e.key === "=") {
            params.epsilon = Math.max(0.0001, params.epsilon * 0.8);

            // Update slider values
            const epsilonSlider = document.getElementById("epsilon-slider");
            epsilonSlider.value = params.epsilon;
            document.getElementById("epsilon-value").textContent = params.epsilon.toFixed(4);

            // Update slider visuals
            updateSliderTrack("epsilon-slider");

            // Add feedback
            setStatusRendering("Detail increased...");
            showNotification("Detail Increased", "Surface detail level has been increased");

            // Highlight the slider with pulse animation
            const sliderContainer = epsilonSlider.closest(".slider-container");
            sliderContainer.classList.add("active");
            setTimeout(() => {
               sliderContainer.classList.remove("active");
            }, 400);
         }

         // '-' key decreases detail
         if (e.key === "-" || e.key === "_") {
            params.epsilon = Math.min(0.01, params.epsilon * 1.25);

            // Update slider values
            const epsilonSlider = document.getElementById("epsilon-slider");
            epsilonSlider.value = params.epsilon;
            document.getElementById("epsilon-value").textContent = params.epsilon.toFixed(4);

            // Update slider visuals
            updateSliderTrack("epsilon-slider");

            // Add feedback
            setStatusRendering("Detail decreased...");
            showNotification("Detail Decreased", "Surface detail level has been decreased");

            // Highlight the slider with pulse animation
            const sliderContainer = epsilonSlider.closest(".slider-container");
            sliderContainer.classList.add("active");
            setTimeout(() => {
               sliderContainer.classList.remove("active");
            }, 400);
         }
      });
   }

   /**
    * Show visual feedback for keyboard shortcuts
    */
   function showKeyPressIndicator(key) {
      // Create key press indicator with enhanced visual design
      let keyDisplay = key;
      if (key === " ") keyDisplay = "SPACE";
      if (key === "+" || key === "=") keyDisplay = "+";
      if (key === "-" || key === "_") keyDisplay = "-";

      const indicator = document.createElement("div");
      indicator.textContent = keyDisplay.toUpperCase();
      indicator.style.position = "fixed";
      indicator.style.bottom = "60px";
      indicator.style.left = "50%";
      indicator.style.transform = "translateX(-50%) translateY(20px)";
      indicator.style.backgroundColor = "rgba(22, 22, 38, 0.9)";
      indicator.style.color = "var(--text-primary)";
      indicator.style.padding = "8px 16px";
      indicator.style.borderRadius = "6px";
      indicator.style.fontFamily = "var(--font-family-mono)";
      indicator.style.fontSize = "14px";
      indicator.style.fontWeight = "500";
      indicator.style.opacity = "0";
      indicator.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
      indicator.style.zIndex = "1000";
      indicator.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
      indicator.style.border = "1px solid rgba(255, 255, 255, 0.1)";

      document.body.appendChild(indicator);

      // Animate in with bouncy effect
      setTimeout(() => {
         indicator.style.opacity = "1";
         indicator.style.transform = "translateX(-50%) translateY(0)";

         // Animate out
         setTimeout(() => {
            indicator.style.opacity = "0";
            indicator.style.transform = "translateX(-50%) translateY(-20px)";

            // Remove
            setTimeout(() => {
               indicator.remove();
            }, 300);
         }, 800);
      }, 10);
   }

   /**
    * Set up mouse controls with enhanced feedback
    */
   function setupMouseControls() {
      const canvas = document.getElementById("canvas");

      // Prevent context menu on right-click
      canvas.addEventListener("contextmenu", (e) => {
         e.preventDefault();
      });

      // Mouse down events
      canvas.addEventListener("mousedown", (e) => {
         if (e.button === 0) {
            // Left button
            isDragging = true;
            canvas.style.cursor = "grabbing";
            setStatusRendering("Rotating view...");
         } else if (e.button === 2) {
            // Right button
            isPanning = true;
            canvas.style.cursor = "move";
            setStatusRendering("Panning view...");
         }
         lastX = e.clientX;
         lastY = e.clientY;

         // Show interaction feedback
         if (isDragging || isPanning) {
            const interactionElement = document.createElement("div");
            interactionElement.classList.add("interaction-feedback");
            interactionElement.style.left = e.clientX + "px";
            interactionElement.style.top = e.clientY + "px";
            document.body.appendChild(interactionElement);

            setTimeout(() => {
               interactionElement.remove();
            }, 500);
         }
      });

      // Mouse move events
      canvas.addEventListener("mousemove", (e) => {
         // Update mouse position in status bar
         updateMousePositionStatus(e);

         if (isDragging) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            // Rotate camera with interpolation for smoother motion
            const sensitivity = 0.003; // Reduced for better precision
            rotationY += deltaX * sensitivity * (cameraDistance * 0.7); // Scale by distance for consistent feel
            rotationX += deltaY * sensitivity * (cameraDistance * 0.7);

            // Clamp vertical rotation to avoid flipping
            rotationX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotationX));
         } else if (isPanning) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            // Calculate camera vectors for panning
            panCamera(deltaX, deltaY);
         }

         lastX = e.clientX;
         lastY = e.clientY;
      });

      // Mouse up event
      window.addEventListener("mouseup", () => {
         if (isDragging || isPanning) {
            canvas.style.cursor = "default";

            if (isDragging || isPanning) {
               setStatusRendering("View adjusted");
            }

            isDragging = false;
            isPanning = false;
         }
      });

      // Mouse wheel event for zooming with enhanced visual feedback
      canvas.addEventListener("wheel", (e) => {
         e.preventDefault();

         // Adaptive zoom speed based on distance
         const zoomSpeed = 0.0005 * (cameraDistance * 0.7);
         const prevDistance = cameraDistance;
         cameraDistance += e.deltaY * zoomSpeed;

         // Clamp distance with smooth limits
         cameraDistance = Math.max(0.5, Math.min(10.0, cameraDistance));

         // Only show indicator if actually zoomed
         if (prevDistance !== cameraDistance) {
            // Show zoom indicator
            showZoomIndicator(e.deltaY > 0 ? "out" : "in", e.clientX, e.clientY);
            setStatusRendering(e.deltaY > 0 ? "Zooming out..." : "Zooming in...");
         }
      });

      // Mouse enter/leave for canvas
      canvas.addEventListener("mouseenter", () => {
         canvas.style.cursor = "default";
      });

      // Add hover effect when mouse is over canvas
      canvas.addEventListener("mouseover", () => {
         // Subtle glow effect on relevant controls
         document.querySelectorAll(".control-button").forEach((btn) => {
            btn.classList.add("pulse");
            setTimeout(() => {
               btn.classList.remove("pulse");
            }, 1000);
         });
      });
   }

   /**
    * Show zoom indicator animation
    */
   function showZoomIndicator(direction, x, y) {
      const indicator = document.createElement("div");
      indicator.textContent = direction === "in" ? "+" : "-";
      indicator.style.position = "absolute";
      indicator.style.left = x + "px";
      indicator.style.top = y + "px";
      indicator.style.width = "40px";
      indicator.style.height = "40px";
      indicator.style.borderRadius = "50%";
      indicator.style.background = "rgba(22, 22, 38, 0.7)";
      indicator.style.color = "var(--text-primary)";
      indicator.style.display = "flex";
      indicator.style.alignItems = "center";
      indicator.style.justifyContent = "center";
      indicator.style.fontSize = "20px";
      indicator.style.fontWeight = "bold";
      indicator.style.transform = "translate(-50%, -50%) scale(0.5)";
      indicator.style.opacity = "0.8";
      indicator.style.pointerEvents = "none";
      indicator.style.zIndex = "10";
      indicator.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
      indicator.style.border = "1px solid rgba(255, 255, 255, 0.1)";
      indicator.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

      document.body.appendChild(indicator);

      // Animate with bounce effect
      requestAnimationFrame(() => {
         indicator.style.transform = "translate(-50%, -50%) scale(1)";

         setTimeout(() => {
            indicator.style.opacity = "0";
            indicator.style.transform = "translate(-50%, -50%) scale(1.5)";

            setTimeout(() => {
               indicator.remove();
            }, 300);
         }, 300);
      });
   }

   /**
    * Update the mouse position status display with world coordinate estimation
    */
   function updateMousePositionStatus(e) {
      const canvas = document.getElementById("canvas");
      const rect = canvas.getBoundingClientRect();

      // Calculate normalized device coordinates
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Apply aspect ratio correction
      const aspectCorrectX = mouseX * (rect.width / rect.height);

      // Display coordinates
      document.getElementById("status-mouse").textContent = `X: ${aspectCorrectX.toFixed(
         2
      )}, Y: ${mouseY.toFixed(2)}, Z: ${cameraDistance.toFixed(2)}`;
   }

   /**
    * Pan the camera based on mouse movement with improved smoothness
    */
   function panCamera(deltaX, deltaY) {
      // Calculate camera right and up vectors using rotation matrix
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      // Right vector
      const rightX = cosY;
      const rightY = 0;
      const rightZ = -sinY;

      // Up vector
      const upX = sinY * sinX;
      const upY = cosX;
      const upZ = cosY * sinX;

      // Pan speed based on distance - scale for better control
      const panSpeed = cameraDistance * 0.002;

      // Update target position with smooth interpolation
      cameraTarget[0] -= (rightX * deltaX + upX * deltaY) * panSpeed;
      cameraTarget[1] -= upY * deltaY * panSpeed;
      cameraTarget[2] -= (rightZ * deltaX + upZ * deltaY) * panSpeed;
   }

   /**
    * Reset camera to default position with enhanced animation
    */
   function resetCamera() {
      // Save current values for animation
      const startRotationX = rotationX;
      const startRotationY = rotationY;
      const startDistance = cameraDistance;
      const startTarget = [...cameraTarget];

      // Animate camera reset over 700ms with easing
      const startTime = Date.now();
      const duration = 700;

      function animateReset() {
         const elapsed = Date.now() - startTime;
         const progress = Math.min(1, elapsed / duration);

         // Easing function (cubic bezier approximation)
         const eased = 1 - Math.pow(1 - progress, 3);

         // Interpolate values
         rotationX = startRotationX * (1 - eased);
         rotationY = startRotationY * (1 - eased);
         cameraDistance = startDistance + (2.5 - startDistance) * eased;

         cameraTarget[0] = startTarget[0] * (1 - eased);
         cameraTarget[1] = startTarget[1] * (1 - eased);
         cameraTarget[2] = startTarget[2] * (1 - eased);

         if (progress < 1) {
            requestAnimationFrame(animateReset);
         } else {
            // Ensure we hit the exact target values
            rotationX = 0;
            rotationY = 0;
            cameraDistance = 2.5;
            cameraTarget = [0, 0, 0];

            // Status update
            setStatusRendering("Camera position reset");
         }
      }

      // Start animation
      setStatusRendering("Resetting camera...");
      animateReset();
   }

   /**
    * Load a preset configuration with enhanced transition animations
    */
   function loadPreset(presetName) {
      if (presets[presetName]) {
         // Get current and new settings for animation
         const currentSettings = { ...params };
         const newSettings = presets[presetName];

         // Status update
         setStatusRendering(`Loading ${presetName} preset...`);

         // Immediately update critical parameters that don't animate well
         params.colorMode = newSettings.colorMode;

         // Update color swatch selection with animation
         document.querySelectorAll(".color-swatch").forEach((swatch) => {
            swatch.classList.remove("active");
         });

         const activeSwatch = document.querySelector(
            `.color-swatch[data-mode="${params.colorMode}"]`
         );
         activeSwatch.classList.add("active");
         activeSwatch.classList.add("pulse");
         setTimeout(() => {
            activeSwatch.classList.remove("pulse");
         }, 800);

         // Animate remaining parameters with improved interpolation
         const startTime = Date.now();
         const duration = 800; // Longer for smoother effect

         function animateParams() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);

            // Easing function (custom cubic bezier approximation)
            const eased =
               progress < 0.5
                  ? 4 * progress * progress * progress
                  : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Interpolate parameters
            for (const key in newSettings) {
               if (
                  key !== "colorMode" &&
                  params[key] !== undefined &&
                  currentSettings[key] !== undefined
               ) {
                  params[key] =
                     currentSettings[key] + (newSettings[key] - currentSettings[key]) * eased;
               }
            }

            // Update UI to match current params
            updateAllUIFromParams();

            if (progress < 1) {
               requestAnimationFrame(animateParams);
            } else {
               // Ensure we hit exact values
               Object.assign(params, newSettings);
               updateAllUIFromParams();

               // Final status update
               setStatusRendering(`${presetName} preset loaded`);
            }
         }

         // Start animation
         animateParams();

         // Show notification
         showNotification(
            "Preset Loaded",
            `The "${presetName}" preset has been applied successfully`
         );
      }
   }

   /**
    * Update all UI elements to match current parameters
    */
   function updateAllUIFromParams() {
      if (isCosmicParticlesPage) {
         // Update particle system sliders
         if (document.getElementById("count-slider")) {
            updateSliderValue("count-slider", "count-value", params.particleCount.toLocaleString());
            updateSliderValue("size-slider", "size-value", params.particleSize.toFixed(1));
            updateSliderValue("speed-slider", "speed-value", params.animationSpeed.toFixed(1));
            updateSliderValue("noise-scale-slider", "noise-scale-value", params.noiseScale.toFixed(1));
            updateSliderValue("curl-intensity-slider", "curl-intensity-value", params.curlIntensity.toFixed(1));
            updateSliderValue("turbulence-slider", "turbulence-value", params.turbulence.toFixed(1));
            updateSliderValue("color-intensity-slider", "color-intensity-value", params.colorIntensity.toFixed(1));
            updateSliderValue("glow-intensity-slider", "glow-intensity-value", params.glowIntensity.toFixed(1));
         }
      } else {
         // Update mandelbulb sliders
         if (document.getElementById("power-slider")) {
            updateSliderValue("power-slider", "power-value", params.power.toFixed(1));
            updateSliderValue("iterations-slider", "iterations-value", params.iterations);
            updateSliderValue("bailout-slider", "bailout-value", params.bailout.toFixed(1));
            updateSliderValue("epsilon-slider", "epsilon-value", params.epsilon.toFixed(4));
            updateSliderValue("max-steps-slider", "max-steps-value", params.maxSteps);
            updateSliderValue("quality-slider", "quality-value", params.quality.toFixed(2));
            updateSliderValue("ambient-slider", "ambient-value", params.ambient.toFixed(2));
            updateSliderValue("diffuse-slider", "diffuse-value", params.diffuse.toFixed(2));
            updateSliderValue("specular-slider", "specular-value", params.specular.toFixed(2));
            updateSliderValue("shininess-slider", "shininess-value", params.shininess.toFixed(0));
            updateSliderValue("fog-density-slider", "fog-density-value", params.fogDensity.toFixed(2));
            updateSliderValue("color-scale-slider", "color-scale-value", params.colorScale.toFixed(1));
            updateSliderValue("color-cycles-slider", "color-cycles-value", params.colorCycles.toFixed(1));
         }
      }

      // Update color swatches
      document.querySelectorAll(".color-swatch").forEach((swatch) => {
         swatch.classList.remove("active");
      });
      
      const activeSwatchSelector = document.querySelector(`.color-swatch[data-mode="${params.colorMode}"]`);
      if (activeSwatchSelector) {
         activeSwatchSelector.classList.add("active");
      }
   }

   /**
    * Helper function to update slider value and track
    */
   function updateSliderValue(sliderId, valueId, displayValue) {
      const slider = document.getElementById(sliderId);
      const valueElement = document.getElementById(valueId);

      // Update value
      slider.value = params[sliderId.replace("-slider", "")];
      valueElement.textContent = displayValue;

      // Update track
      updateSliderTrack(sliderId);
   }

   /**
    * Save the current canvas view as an image with enhanced naming
    */
   function saveImage() {
      const canvas = document.getElementById("canvas");
      const link = document.createElement("a");

      // Create more descriptive filename with preset info
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const presetName = currentPreset || "custom";
      const power = params.power.toString().replace(".", "_");

      link.download = `mandelbulb-${presetName}-p${power}-${timestamp}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showNotification(
         "Image Saved",
         "Your Mandelbulb image has been saved to your downloads folder"
      );
   }

   /**
    * Fade out an element with smooth transition
    */
   function fadeOutElement(element) {
      // Add transition with modern cubic-bezier timing
      element.style.transition = "all 0.5s cubic-bezier(0.21, 1.02, 0.73, 1)";
      element.style.opacity = "0";
      element.style.transform = "scale(0.98)";

      // Remove after animation
      setTimeout(() => {
         element.style.display = "none";
      }, 500);
   }

   /**
    * Show a notification with clean minimal animation
    */
   function showNotification(title, message, duration = 2500) {
      const notification = document.getElementById("notification");
      const titleElement = notification.querySelector(".notification-title");
      const messageElement = notification.querySelector(".notification-message");

      // Update content
      titleElement.textContent = title;
      messageElement.textContent = message;

      // Remove any existing transition and reset
      notification.style.transition = "none";
      notification.classList.remove("show");

      // Force reflow
      notification.getBoundingClientRect();

      // Add clean minimal animation
      notification.style.transition = "all 0.3s ease";
      notification.classList.add("show");

      // Auto-dismiss with fade out animation
      setTimeout(() => {
         notification.style.transition = "all 0.3s ease";
         notification.classList.remove("show");
      }, duration);
   }

   /**
    * Set status bar rendering message with animation
    */
   function setStatusRendering(message = "Rendering...") {
      const statusElement = document.getElementById("status-rendering");
      isRendering = true;

      // Add animation class for transition
      statusElement.classList.add("status-updating");

      // Update text
      statusElement.textContent = message;

      // Add subtle shimmer effect
      statusElement.classList.add("shimmer");

      // Remove animation class after transition
      setTimeout(() => {
         statusElement.classList.remove("status-updating");

         // Remove shimmer after longer delay
         setTimeout(() => {
            statusElement.classList.remove("shimmer");
            isRendering = false;

            // Set to complete if message was "Rendering..."
            if (message === "Rendering...") {
               statusElement.textContent = "Render complete";
            }
         }, 1000);
      }, 300);
   }

   // Make functions accessible globally for external components
   window.autoRotate = () => autoRotate;
   window.rotationSpeed = () => rotationSpeed;
   window.showNotification = showNotification;
   window.setStatusRendering = setStatusRendering;
   window.updateSliderTrack = updateSliderTrack;
});
