precision highp float;

varying vec3 vColor;
varying float vAlpha;
uniform bool uIsLightTheme;

void main() {
    // Calculate distance from center of point (for circular particles)
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distSq = dot(coord, coord);
    
    // Discard pixels outside the circular radius
    if (distSq > 0.25) discard;
    
    // Soft particle edge
    float smoothEdge = 1.0 - smoothstep(0.2, 0.25, distSq);
    
    // Create a glow effect
    float glow = pow(smoothEdge, 1.5);
    
    // Adjusted color based on theme
    vec3 color = vColor;
    
    // Create a brighter core
    vec3 coreColor;
    if (uIsLightTheme) {
        coreColor = vec3(1.0);
    } else {
        coreColor = vec3(0.9, 0.95, 1.0);
    }
    
    // Mix core color with particle color based on distance from center
    color = mix(coreColor, color, smoothstep(0.0, 0.15, distSq));
    
    // Apply alpha based on particle age and glow
    float alpha = vAlpha * glow;
    
    // Additive blending in dark theme, normal blending in light theme
    if (uIsLightTheme) {
        gl_FragColor = vec4(color, alpha * 0.8);
    } else {
        // Higher alpha for additive blending
        gl_FragColor = vec4(color * alpha, alpha);
    }
} 