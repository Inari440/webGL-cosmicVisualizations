/**
 * Common utilities for WebGL Cosmic Visualizations
 */

/**
 * Initialize WebGL context with error handling
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @returns {WebGLRenderingContext} WebGL context
 */
function initWebGL(canvas) {
    let gl = null;
    
    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch(e) {
        console.error("Unable to initialize WebGL. Your browser may not support it.", e);
    }
    
    if (!gl) {
        console.error("WebGL not supported");
        document.body.innerHTML = '<p class="error">Unable to initialize WebGL. Your browser may not support it.</p>';
    }
    
    return gl;
}

/**
 * Create and compile a shader
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {string} source - GLSL source code
 * @param {number} type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @returns {WebGLShader} Compiled shader
 */
function createShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

/**
 * Create and link a shader program
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {WebGLShader} vertexShader - Vertex shader
 * @param {WebGLShader} fragmentShader - Fragment shader
 * @returns {WebGLProgram} Linked shader program
 */
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    
    return program;
}

/**
 * Handle theme switching functionality
 * @param {Function} onThemeChange - Callback function to execute when theme changes
 * @returns {boolean} Current theme state (true for light theme)
 */
function initThemeToggle(onThemeChange) {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');
    
    let isLightTheme = false;
    
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        isLightTheme = true;
    } else if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-theme');
    } else {
        isLightTheme = true;
        document.body.classList.add('light-theme');
    }
    
    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            isLightTheme = true;
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            isLightTheme = false;
        }
        
        if (onThemeChange) {
            onThemeChange(isLightTheme);
        }
    });
    
    return isLightTheme;
}

/**
 * Create a slider control with label
 * @param {string} id - Slider element ID
 * @param {string} label - Label text
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} value - Initial value
 * @param {number} step - Step size
 * @param {Function} onChange - Callback function on change
 * @returns {HTMLElement} Div containing the slider and label
 */
function createSlider(id, label, min, max, value, step, onChange) {
    const container = document.createElement('div');
    container.className = 'slider-container';
    
    const labelElem = document.createElement('label');
    labelElem.htmlFor = id;
    labelElem.textContent = label;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'slider-value';
    valueDisplay.textContent = value;
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = step;
    
    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;
        if (onChange) {
            onChange(parseFloat(slider.value));
        }
    });
    
    labelElem.appendChild(valueDisplay);
    container.appendChild(labelElem);
    container.appendChild(slider);
    
    return container;
}

/**
 * Load a text file from the server 
 * @param {string} url - URL of the file to load
 * @returns {Promise<string>} Promise resolving to the file content
 */
function loadTextResource(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.text();
        })
        .catch(error => {
            console.error("Failed to load resource:", url, error);
            throw error;
        });
}

// Export utilities
export {
    initWebGL,
    createShader,
    createProgram,
    initThemeToggle,
    createSlider,
    loadTextResource
}; 