/**
 * Matrix and vector operations for 3D graphics
 */

/**
 * Creates a 4x4 identity matrix
 * @returns {Float32Array} Identity matrix
 */
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Creates a perspective projection matrix
 * @param {number} fieldOfViewRadians - Field of view in radians
 * @param {number} aspect - Aspect ratio (width/height)
 * @param {number} near - Near clipping plane
 * @param {number} far - Far clipping plane
 * @returns {Float32Array} Projection matrix
 */
function createPerspectiveMatrix(fieldOfViewRadians, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewRadians);
    const rangeInv = 1.0 / (near - far);
    
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ]);
}

/**
 * Creates a translation matrix
 * @param {number} tx - X translation
 * @param {number} ty - Y translation
 * @param {number} tz - Z translation
 * @returns {Float32Array} Translation matrix
 */
function createTranslationMatrix(tx, ty, tz) {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1
    ]);
}

/**
 * Creates a rotation matrix around the X axis
 * @param {number} angleInRadians - Rotation angle in radians
 * @returns {Float32Array} Rotation matrix
 */
function createRotationXMatrix(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    
    return new Float32Array([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Creates a rotation matrix around the Y axis
 * @param {number} angleInRadians - Rotation angle in radians
 * @returns {Float32Array} Rotation matrix
 */
function createRotationYMatrix(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    
    return new Float32Array([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Creates a rotation matrix around the Z axis
 * @param {number} angleInRadians - Rotation angle in radians
 * @returns {Float32Array} Rotation matrix
 */
function createRotationZMatrix(angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    
    return new Float32Array([
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Creates a scaling matrix
 * @param {number} sx - X scale factor
 * @param {number} sy - Y scale factor
 * @param {number} sz - Z scale factor
 * @returns {Float32Array} Scaling matrix
 */
function createScalingMatrix(sx, sy, sz) {
    return new Float32Array([
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Multiplies two 4x4 matrices
 * @param {Float32Array} a - First matrix
 * @param {Float32Array} b - Second matrix
 * @returns {Float32Array} Result of a * b
 */
function multiplyMatrices(a, b) {
    const result = new Float32Array(16);
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[i * 4 + k] * b[k * 4 + j];
            }
            result[i * 4 + j] = sum;
        }
    }
    
    return result;
}

/**
 * Creates a camera/view matrix
 * @param {Array<number>} eye - Camera position [x, y, z]
 * @param {Array<number>} target - Look-at target [x, y, z]
 * @param {Array<number>} up - Up vector [x, y, z]
 * @returns {Float32Array} View matrix
 */
function createLookAtMatrix(eye, target, up) {
    const zAxis = normalize(subtractVectors(eye, target));
    const xAxis = normalize(crossProduct(up, zAxis));
    const yAxis = crossProduct(zAxis, xAxis);
    
    return new Float32Array([
        xAxis[0], xAxis[1], xAxis[2], 0,
        yAxis[0], yAxis[1], yAxis[2], 0,
        zAxis[0], zAxis[1], zAxis[2], 0,
        eye[0], eye[1], eye[2], 1
    ]);
}

/**
 * Subtracts two vectors
 * @param {Array<number>} a - First vector
 * @param {Array<number>} b - Second vector
 * @returns {Array<number>} Result of a - b
 */
function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Normalizes a vector
 * @param {Array<number>} v - Vector to normalize
 * @returns {Array<number>} Normalized vector
 */
function normalize(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    }
    return [0, 0, 0];
}

/**
 * Computes the cross product of two vectors
 * @param {Array<number>} a - First vector
 * @param {Array<number>} b - Second vector
 * @returns {Array<number>} Cross product
 */
function crossProduct(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

// Export matrix utilities
export {
    createIdentityMatrix,
    createPerspectiveMatrix,
    createTranslationMatrix,
    createRotationXMatrix,
    createRotationYMatrix,
    createRotationZMatrix,
    createScalingMatrix,
    multiplyMatrices,
    createLookAtMatrix,
    normalize,
    subtractVectors,
    crossProduct
}; 