window.addEventListener("DOMContentLoaded", () => {
    const cube = new WavyCube("canvas");
    cube.init();
});
class WavyCube {
    /**
     * @param el CSS selector for the canvas
     */
    constructor(el) {
        var _a;
        this.cubeSize = 320;
        this.edgeFadeWidth = 15;
        this.lightDir = [0, 0, 1];
        this.lineCount = 16;
        this.lineSpacing = 40;
        this.lineWidth = 2;
        this.maxAmplitude = 32;
        this.rotationSpeed = 0.02;
        this.themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        this.waveFrequency = 0.5;
        this.isDark = false;
        this.width = 0;
        this.height = 0;
        this.rotX = 0;
        this.rotY = 0;
        this.time = 0;
        this.canvas = document.querySelector(el);
        this.ctx = (_a = this.canvas) === null || _a === void 0 ? void 0 : _a.getContext("2d");
    }
    /** Use black or white depending on the color scheme. */
    get lineColor() {
        return this.isDark ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 0%)";
    }
    /** Start the animation. */
    init() {
        this.checkDarkTheme();
        this.resize();
        this.draw();
        this.themeQuery.addEventListener("change", this.checkDarkTheme.bind(this));
        window.addEventListener("resize", this.resize.bind(this));
    }
    /**
     * Matrix vector multiplication
     * @param v Vector
     * @param m Matrix
     */
    applyMatrix(v, m) {
        return [
            v[0] * m[0] + v[1] * m[1] + v[2] * m[2],
            v[0] * m[3] + v[1] * m[4] + v[2] * m[5],
            v[0] * m[6] + v[1] * m[7] + v[2] * m[8]
        ];
    }
    /** Set the theme to dark if the preferred color scheme is so. */
    checkDarkTheme() {
        this.isDark = this.themeQuery.matches;
    }
    /**
     * Basic Vector Math Helpers
     * @param v1 Vector 1
     * @param v2 Vector 2
     */
    dot(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    }
    /** Draw the scene. */
    draw() {
        if (!this.ctx)
            return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = "round";
        // update rotation
        this.rotX = (this.rotX + this.rotationSpeed) % (2 * Math.PI);
        this.rotY = (this.rotY + this.rotationSpeed) % (2 * Math.PI);
        this.time += 0.1;
        const rotMat = this.getRotationMatrix(this.rotX, this.rotY);
        const invRotMat = this.transpose(rotMat);
        // render lines by iterating through the specific number of horizontal lines
        const totalHeight = (this.lineCount - 1) * this.lineSpacing;
        const startY = (this.height / 2) - (totalHeight / 2);
        const r = this.cubeSize / 2;
        for (let i = 0; i < this.lineCount; i++) {
            const screenY = startY + (i * this.lineSpacing);
            this.ctx.beginPath();
            // scan across the screen width
            for (let screenX = 0; screenX < this.width; screenX++) {
                // create ray, map screen coordinate to centered coordinate system
                const cx = screenX - this.width / 2;
                const cy = screenY - this.height / 2;
                const cz = 500;
                // do orthographic for style consistency (lines stay parallel)
                const rayOrigin = [cx, cy, cz];
                const rayDir = [0, 0, -1];
                // transform ray to object space (inverse rotation)
                const localOrigin = this.applyMatrix(rayOrigin, invRotMat);
                const localDir = this.applyMatrix(rayDir, invRotMat);
                // intersect, divide by 2 as box is radius-based
                const hit = this.intersectBox(localOrigin, localDir, r);
                let yOffset = 0;
                if (hit) {
                    const hp = [
                        localOrigin[0] + localDir[0] * hit.t,
                        localOrigin[1] + localDir[1] * hit.t,
                        localOrigin[2] + localDir[2] * hit.t
                    ];
                    /*
                    calculate distance from the hit point to the wireframe edges of the cube
                    - for a point on a face (e.g. X=r), the distance to edge is min(r-|y|, r-|z|)
                    - sort the distances [r-|x|, r-|y|, r-|z|]
                    - the smallest is ~0 (distance to face plane)
                    - the second smallest is distance to nearest edge on that face
                    */
                    const distances = [
                        r - Math.abs(hp[0]),
                        r - Math.abs(hp[1]),
                        r - Math.abs(hp[2])
                    ];
                    distances.sort((a, b) => a - b);
                    const distToEdge = distances[1];
                    // calculate attenuation factor (0 at edge, 1 at center)
                    let edgeFactor = distToEdge / this.edgeFadeWidth;
                    edgeFactor = Math.max(0, Math.min(1, edgeFactor));
                    // smooth the edge factor
                    edgeFactor = edgeFactor * (2 - edgeFactor);
                    // calculate lighting; normal in local space, convert back to scene space
                    const sceneNormal = this.applyMatrix(hit.normal, rotMat);
                    let intensity = this.dot(sceneNormal, this.lightDir);
                    /*
                    base amplitude based on darkness
                    - 1.0 intensity (front) -> 0 wave
                    - -1.0 intensity (back/side) -> 1 wave
                    */
                    let ampFactor = (0.5 - intensity * 0.5) + 0.1;
                    ampFactor = Math.max(0, Math.min(1, ampFactor));
                    ampFactor = ampFactor ** 2 * (3 - 2 * ampFactor);
                    /*
                    calculate wave by using screenX for frequency so waves move across screen or stay static to object
                    - if using use screenX, it’s a scan line effect
                    - if local hit point, texture sticks to cube
                    - for the visual effect, use screenX + this.time
                    */
                    const wave = Math.sin((screenX * this.waveFrequency) + this.time);
                    yOffset = wave * this.maxAmplitude * ampFactor * edgeFactor;
                }
                // draw segment
                if (screenX === 0) {
                    this.ctx.moveTo(screenX, screenY + yOffset);
                }
                else {
                    this.ctx.lineTo(screenX, screenY + yOffset);
                }
            }
            this.ctx.stroke();
        }
        requestAnimationFrame(this.draw.bind(this));
    }
    /**
     * Matrix helper to create rotation matrices.
     * @param rx X radius
     * @param ry Y radius
     */
    getRotationMatrix(rx, ry) {
        const cx = Math.cos(rx);
        const sx = Math.sin(rx);
        const cy = Math.cos(ry);
        const sy = Math.sin(ry);
        // y rotation * x rotation
        return [
            cy, sx * sy, cx * sy,
            0, cx, -sx,
            -sy, sx * cy, cx * cy
        ];
    }
    /**
     * Ray-box intersection using the slab method. Box is defined from -size to +size in X, Y, Z, centered at the origin.
     * @param origin Ray origin point
     * @param dir Ray direction vector
     * @param size Half-width of the box
     */
    intersectBox(origin, dir, size) {
        const tMinRef = {
            t: -Infinity,
            normal: [0, 0, 0]
        };
        const tMaxRef = {
            t: Infinity
        };
        // check X slabs
        if (!this.intersectSlab(origin[0], dir[0], size, 0, tMinRef, tMaxRef)) {
            return null;
        }
        // check Y slabs
        if (!this.intersectSlab(origin[1], dir[1], size, 1, tMinRef, tMaxRef)) {
            return null;
        }
        // check Z slabs
        if (!this.intersectSlab(origin[2], dir[2], size, 2, tMinRef, tMaxRef)) {
            return null;
        }
        // final check for valid intersection
        if (tMinRef.t < 0 || tMinRef.t > tMaxRef.t) {
            return null;
        }
        return {
            t: tMinRef.t,
            normal: tMinRef.normal
        };
    }
    /**
     * Calculate the intersection of a ray with two parallel planes (a slab) along a single axis. Update the overall tMin, tMax, and the potential hit normal.
     * @param originAxis Origin component for the current axis (e.g., origin[0] for X)
     * @param dirAxis Direction component for the current axis (e.g., dir[0] for X)
     * @param size Half-width of the box along this axis
     * @param axisIndex Index of the current axis (0 for X, 1 for Y, 2 for Z)
     * @param tMin Current minimum intersection distance (t-value)
     * @param tMax Current maximum intersection distance (t-value)
     * @param normal Current hit normal vector
     */
    intersectSlab(originAxis, dirAxis, size, axisIndex, tMin, tMax) {
        if (Math.abs(dirAxis) < 1e-5) {
            // ray is parallel to the slab and outside
            if (Math.abs(originAxis) > size) {
                return false;
            }
        }
        else {
            const invDir = 1 / dirAxis;
            let t1 = (-size - originAxis) * invDir;
            let t2 = (size - originAxis) * invDir;
            let n1 = [0, 0, 0];
            let n2 = [0, 0, 0];
            n1[axisIndex] = -1;
            n2[axisIndex] = 1;
            if (t1 > t2) {
                [t1, t2] = [t2, t1];
                n1 = n2;
            }
            if (t1 > tMin.t) {
                tMin.t = t1;
                tMin.normal = n1;
            }
            if (t2 < tMax.t) {
                tMax.t = t2;
            }
        }
        // check if the overall interval has collapsed (missed the box)
        return tMin.t <= tMax.t;
    }
    /** Refresh canvas based on window size. */
    resize() {
        var _a;
        if (!this.canvas)
            return;
        const ratio = window.devicePixelRatio;
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width * ratio;
        this.canvas.height = this.height * ratio;
        this.canvas.style.width = this.width + "px";
        this.canvas.style.height = this.height + "px";
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.scale(ratio, ratio);
    }
    /**
     * Transpose (inverse for rotation matrices)
     * @param m Matrix
     */
    transpose(m) {
        return [
            m[0], m[3], m[6],
            m[1], m[4], m[7],
            m[2], m[5], m[8]
        ];
    }
}
export {};