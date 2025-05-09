precision highp float;

// Camera and rendering settings
uniform vec2 uResolution;
uniform vec3 uCameraPosition;
uniform vec3 uCameraLookAt;
uniform vec3 uCameraUp;
uniform float uFov;

// Fractal parameters
uniform float uPower;
uniform float uIterations;
uniform float uBailout;
uniform float uShadowSoftness;
uniform float uGlowStrength;
uniform float uAmbientOcclusion;
uniform bool uIsLightTheme;

// Time
uniform float uTime;

// Constants
const float PI = 3.14159265359;
const float INFINITY = 1e20;
const float EPSILON = 0.0001;
const int MAX_STEPS = 120;

// Ray structure
struct Ray {
    vec3 origin;
    vec3 direction;
};

// Mandelbulb distance estimation
float mandelbulbDE(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    
    for (int i = 0; i < int(uIterations); i++) {
        r = length(z);
        
        if (r > uBailout) break;
        
        // Convert to polar coordinates
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, uPower - 1.0) * uPower * dr + 1.0;
        
        // Scale and rotate the point
        float zr = pow(r, uPower);
        theta = theta * uPower;
        phi = phi * uPower;
        
        // Convert back to cartesian coordinates
        z = zr * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
        z += pos;
    }
    
    return 0.5 * log(r) * r / dr;
}

// Implement a basic ray marching
float rayMarch(Ray ray, float start, float end, out int steps) {
    float depth = start;
    steps = 0;
    
    for (int i = 0; i < MAX_STEPS; i++) {
        steps = i;
        vec3 p = ray.origin + depth * ray.direction;
        float dist = mandelbulbDE(p);
        
        if (dist < EPSILON) return depth;
        
        depth += dist;
        if (depth >= end) return end;
    }
    
    return end;
}

// Calculate normal at point
vec3 calculateNormal(vec3 p) {
    float h = EPSILON;
    const vec2 k = vec2(1, -1);
    return normalize(k.xyy * mandelbulbDE(p + k.xyy * h) + 
                     k.yxy * mandelbulbDE(p + k.yxy * h) + 
                     k.yyx * mandelbulbDE(p + k.yyx * h) + 
                     k.xxx * mandelbulbDE(p + k.xxx * h));
}

// Calculate ambient occlusion
float ambientOcclusion(vec3 p, vec3 n) {
    float step = 0.01;
    float ao = 0.0;
    float dist;
    
    for (int i = 1; i <= 5; i++) {
        dist = float(i) * step;
        ao += max(0.0, (dist - mandelbulbDE(p + n * dist)) / dist);
    }
    
    return 1.0 - ao * uAmbientOcclusion;
}

// Phong illumination model
vec3 lighting(vec3 p, vec3 normal, vec3 viewDirection, vec3 lightPos, vec3 lightColor, vec3 diffuseColor) {
    // Light direction
    vec3 lightDir = normalize(lightPos - p);
    
    // Ambient
    vec3 ambient = 0.1 * diffuseColor;
    
    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;
    
    // Specular
    vec3 halfwayDir = normalize(lightDir + viewDirection);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    vec3 specular = 0.2 * spec * lightColor;
    
    // Soft shadows
    float shadow = 1.0;
    float shadowRayLength = 0.01;
    float shadowDist = INFINITY;
    
    for (int i = 0; i < 32; i++) {
        vec3 shadowPos = p + lightDir * shadowRayLength;
        shadowDist = mandelbulbDE(shadowPos);
        if (shadowDist < EPSILON) {
            shadow = 0.0;
            break;
        }
        shadow = min(shadow, uShadowSoftness * shadowDist / shadowRayLength);
        shadowRayLength += shadowDist;
        if (shadowRayLength > length(lightPos - p)) break;
    }
    
    // Apply AO
    float ao = ambientOcclusion(p, normal);
    
    // Combine all lighting components
    return ambient * ao + (diffuse + specular) * shadow;
}

// Calculate colors based on position and normal
vec3 colorize(vec3 p, vec3 normal, vec3 viewDirection, int steps) {
    // Base color based on position
    vec3 baseColor = 0.5 + 0.5 * cos(uTime * 0.05 + 6.0 * p.z + vec3(0, 2, 4));
    
    // Light position
    vec3 lightPos = vec3(2.0 * sin(uTime * 0.1), 4.0, 2.0 * cos(uTime * 0.1));
    
    // Apply Phong lighting
    vec3 color = lighting(p, normal, viewDirection, lightPos, vec3(1.0), baseColor);
    
    // Add glow based on iteration count
    float glow = float(steps) / float(MAX_STEPS);
    glow = pow(glow, 2.0) * uGlowStrength;
    
    if (uIsLightTheme) {
        // Light theme glow
        color = mix(color, vec3(0.8, 0.9, 1.0), glow * 0.5);
    } else {
        // Dark theme glow
        color = mix(color, vec3(0.2, 0.4, 1.0), glow);
    }
    
    return color;
}

// Main function
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
    
    // Set up camera
    vec3 forward = normalize(uCameraLookAt - uCameraPosition);
    vec3 right = normalize(cross(forward, uCameraUp));
    vec3 up = cross(right, forward);
    
    // Create ray
    Ray ray;
    ray.origin = uCameraPosition;
    ray.direction = normalize(forward + uFov * (uv.x * right + uv.y * up));
    
    // Ray march
    int steps;
    float dist = rayMarch(ray, 0.0, 100.0, steps);
    
    if (dist < 100.0) {
        // Hit something
        vec3 p = ray.origin + dist * ray.direction;
        vec3 normal = calculateNormal(p);
        vec3 color = colorize(p, normal, -ray.direction, steps);
        
        gl_FragColor = vec4(color, 1.0);
    } else {
        // Background
        vec3 bgColor;
        float t = 0.5 * (ray.direction.y + 1.0);
        
        if (uIsLightTheme) {
            // Light theme background
            bgColor = mix(vec3(0.95, 0.97, 1.0), vec3(0.75, 0.85, 0.95), t); 
        } else {
            // Dark theme background
            bgColor = mix(vec3(0.1, 0.1, 0.2), vec3(0.0, 0.0, 0.0), t);
        }
        
        // Add glow based on direction steps
        float glow = float(steps) / float(MAX_STEPS);
        glow = pow(glow, 3.0) * uGlowStrength * 0.3;
        
        if (uIsLightTheme) {
            bgColor = mix(bgColor, vec3(0.8, 0.9, 1.0), glow * 0.7);
        } else {
            bgColor = mix(bgColor, vec3(0.0, 0.2, 0.5), glow);
        }
        
        gl_FragColor = vec4(bgColor, 1.0);
    }
} 