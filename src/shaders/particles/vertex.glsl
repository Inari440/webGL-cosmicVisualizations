attribute vec3 aPosition;
attribute vec3 aVelocity;
attribute float aSize;
attribute vec3 aColor;
attribute float aAge;
attribute float aLife;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uTime;
uniform float uParticleSize;
uniform bool uIsLightTheme;

varying vec3 vColor;
varying float vAlpha;

void main() {
    // Apply velocity to position based on age
    vec3 pos = aPosition;
    
    // Calculate particle alpha based on age
    float normalizedAge = aAge / aLife;
    float alpha = 1.0 - normalizedAge;
    
    // Fade in at beginning
    alpha *= smoothstep(0.0, 0.1, normalizedAge);
    
    // Transform position
    vec4 mvPosition = uModelViewMatrix * vec4(pos, 1.0);
    
    // Calculate size based on distance (perspective)
    float size = aSize * uParticleSize;
    
    // Adjust color for theme
    vec3 particleColor = aColor;
    if (uIsLightTheme) {
        // Make colors more pastel/bright in light theme
        particleColor = mix(particleColor, vec3(1.0), 0.2);
    }
    
    // Pass variables to fragment shader
    vColor = particleColor;
    vAlpha = alpha;
    
    // Set point size
    gl_PointSize = size * (1.0 / -mvPosition.z);
    
    // Output position
    gl_Position = uProjectionMatrix * mvPosition;
} 