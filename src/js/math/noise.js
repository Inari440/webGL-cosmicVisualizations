/**
 * Noise functions for WebGL simulations
 */

/**
 * 3D Simplex Noise implementation
 * Based on Stefan Gustavson's implementation
 */
class SimplexNoise {
    constructor(seed = Math.random()) {
        this.perm = new Uint8Array(512);
        this.seed(seed);
    }
    
    seed(seed) {
        if (seed > 0 && seed < 1) {
            seed *= 65536;
        }
        
        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }
        
        const p = this.perm;
        for (let i = 0; i < 256; i++) {
            let v;
            if (i & 1) {
                v = (seed * i) ^ (seed >> 8) & 0xFF;
            } else {
                v = seed * (i ^ (seed >> 8) & 0xFF);
            }
            
            p[i] = p[i + 256] = v & 0xFF;
        }
    }
    
    noise3D(x, y, z) {
        const permMod12 = (n) => this.perm[n] % 12;
        const dot = (g, x, y, z) => g[0] * x + g[1] * y + g[2] * z;
        
        const F3 = 1.0 / 3.0;
        const G3 = 1.0 / 6.0;
        
        const s = (x + y + z) * F3;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);
        
        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        
        const x0 = x - X0;
        const y0 = y - Y0;
        const z0 = z - Z0;
        
        let i1, j1, k1;
        let i2, j2, k2;
        
        if (x0 >= y0) {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        } else {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }
        
        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        
        const x2 = x0 - i2 + 2.0 * G3;
        const y2 = y0 - j2 + 2.0 * G3;
        const z2 = z0 - k2 + 2.0 * G3;
        
        const x3 = x0 - 1.0 + 3.0 * G3;
        const y3 = y0 - 1.0 + 3.0 * G3;
        const z3 = z0 - 1.0 + 3.0 * G3;
        
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        
        const grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
        
        const gi0 = permMod12(ii + this.perm[jj + this.perm[kk]]);
        const gi1 = permMod12(ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]);
        const gi2 = permMod12(ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]);
        const gi3 = permMod12(ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]);
        
        const t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        const n0 = t0 < 0 ? 0.0 : Math.pow(t0, 4) * dot(grad3[gi0], x0, y0, z0);
        
        const t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        const n1 = t1 < 0 ? 0.0 : Math.pow(t1, 4) * dot(grad3[gi1], x1, y1, z1);
        
        const t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        const n2 = t2 < 0 ? 0.0 : Math.pow(t2, 4) * dot(grad3[gi2], x2, y2, z2);
        
        const t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        const n3 = t3 < 0 ? 0.0 : Math.pow(t3, 4) * dot(grad3[gi3], x3, y3, z3);
        
        return 32.0 * (n0 + n1 + n2 + n3);
    }
    
    /**
     * Get FBM (Fractional Brownian Motion) noise
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @param {number} octaves - Number of octaves
     * @param {number} lacunarity - Frequency multiplier
     * @param {number} gain - Amplitude multiplier
     * @returns {number} FBM noise value (-1 to 1)
     */
    fbm(x, y, z, octaves = 6, lacunarity = 2.0, gain = 0.5) {
        let frequency = 1.0;
        let amplitude = 0.5;
        let value = 0.0;
        let maxValue = 0.0;
        
        for (let i = 0; i < octaves; i++) {
            value += amplitude * this.noise3D(
                x * frequency,
                y * frequency,
                z * frequency
            );
            maxValue += amplitude;
            frequency *= lacunarity;
            amplitude *= gain;
        }
        
        return value / maxValue;
    }
}

/**
 * Calculate curl of a noise field (for curl noise)
 * @param {SimplexNoise} noise - Noise generator instance
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {number} epsilon - Small value for finite difference
 * @returns {Array<number>} Curl vector [x, y, z]
 */
function curlNoise(noise, x, y, z, epsilon = 0.0001) {
    const n1 = noise.noise3D(x, y + epsilon, z) - noise.noise3D(x, y - epsilon, z);
    const n2 = noise.noise3D(x, y, z + epsilon) - noise.noise3D(x, y, z - epsilon);
    const n3 = noise.noise3D(x + epsilon, y, z) - noise.noise3D(x - epsilon, y, z);
    const n4 = noise.noise3D(x, y, z + epsilon) - noise.noise3D(x, y, z - epsilon);
    const n5 = noise.noise3D(x + epsilon, y, z) - noise.noise3D(x - epsilon, y, z);
    const n6 = noise.noise3D(x, y + epsilon, z) - noise.noise3D(x, y - epsilon, z);
    
    const curl = [
        (n1 - n2) / (2 * epsilon),
        (n3 - n4) / (2 * epsilon), 
        (n5 - n6) / (2 * epsilon)
    ];
    
    return curl;
}

/**
 * Calculate flow curl noise with time
 * @param {SimplexNoise} noise - Noise generator instance
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {number} t - Time value
 * @param {number} scale - Scale factor
 * @returns {Array<number>} Curl vector [x, y, z]
 */
function flowCurlNoise(noise, x, y, z, t, scale = 1.0) {
    const nx = x * scale;
    const ny = y * scale;
    const nz = z * scale;
    const nt = t * 0.2;
    
    const curl = curlNoise(noise, nx + nt, ny + nt, nz + nt);
    return curl;
}

// Export noise utilities
export {
    SimplexNoise,
    curlNoise,
    flowCurlNoise
}; 