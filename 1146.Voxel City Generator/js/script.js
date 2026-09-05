import React, { StrictMode, useEffect, useEffectEvent, useMemo, useReducer, useRef } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/addons/controls/OrbitControls.js";
import { GUI } from "https://esm.sh/dat.gui";
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null,
    React.createElement(VoxelCity, null)));
const DEFAULT_CITY_CONFIG = {
    seed: 77345,
    daylight: 12,
    gridChaos: 0.25,
    commercialDensity: 0.65,
    residentialDensity: 0.7,
    blocks: 16,
    lotsPerBlock: 3,
    lotSize: 6,
    lotMargin: 2,
    streetWidth: 5,
    padOverhang: 1,
    padThickness: 0.5,
    maxHeight: 32,
    minBuildingHeight: 3,
    heightVariance: 0.6,
    setbackFrequency: 0.55,
    vacantLotChance: 0.1,
    minResidentialScale: 3,
    residentialHeightFactor: 0.3,
    windowDensity: 0.85,
    windowLitChance: 0.25,
    windowFloorHeight: 2,
    treeMin: 3,
    treeSpread: 5,
    neighborhoodPaletteSync: true
};
const DISTRICT_PALETTES = [
    // steel & slate
    [
        "hsl(220, 25%, 90%)",
        "hsl(220, 25%, 60%)",
        "hsl(220, 25%, 45%)",
        "hsl(220, 25%, 30%)"
    ],
    // brick & sand
    [
        "hsl(25, 55%, 85%)",
        "hsl(25, 55%, 60%)",
        "hsl(25, 55%, 50%)",
        "hsl(25, 55%, 35%)"
    ],
    // verdigris
    [
        "hsl(130, 25%, 90%)",
        "hsl(130, 25%, 70%)",
        "hsl(130, 25%, 40%)",
        "hsl(130, 25%, 25%)"
    ],
    // dusk violet
    [
        "hsl(260, 30%, 90%)",
        "hsl(260, 30%, 65%)",
        "hsl(260, 30%, 45%)",
        "hsl(260, 30%, 30%)"
    ],
    // limestone
    [
        "hsl(30, 20%, 90%)",
        "hsl(30, 20%, 70%)",
        "hsl(30, 20%, 50%)",
        "hsl(30, 20%, 30%)"
    ]
];
const PARK_GREEN = new THREE.Color("hsl(105, 30%, 40%)");
const TREE_GREEN = new THREE.Color("hsl(105, 30%, 30%)");
const SIDEWALK = new THREE.Color("hsl(60, 5%, 60%)");
const AMBIENT_DAY = new THREE.Color("hsl(210, 40%, 75%)");
const AMBIENT_NIGHT = new THREE.Color("hsl(235, 55%, 22%)");
const SKY_DAY = new THREE.Color("hsl(200, 70%, 70%)");
const SKY_DUSK = new THREE.Color("hsl(20, 70%, 45%)");
const SKY_NIGHT = new THREE.Color("hsl(230, 50%, 10%)");
const SUN_DAY = new THREE.Color("hsl(40, 100%, 95%)");
const SUN_DUSK = new THREE.Color("hsl(18, 90%, 62%)");
const SUN_MAX_INTENSITY = 2.4;
const HOURS_PER_DAY = 24;
const SUNRISE_HOUR = 6;
const SUN_TILT = 0.35;
const SHADOW_MAX_STRETCH = 3.5;
const ROAD_GRAY = "hsl(220, 5%, 30%)";
const WINDOW_LIT = new THREE.Color("hsl(45, 95%, 78%)");
const WINDOW_DARK = new THREE.Color("hsl(215, 25%, 20%)");
const WINDOW_DEPTH = 0.08;
const WINDOW_MAX_HEIGHT = 1.5;
const MAX_WINDOW_INSTANCES = 400000;
const WINDOW_FACES = [
    { nx: 1, nz: 0 },
    { nx: -1, nz: 0 },
    { nx: 0, nz: 1 },
    { nx: 0, nz: -1 }
];
const GUI_FOLDERS = [
    {
        folder: "Architecture",
        params: [
            { key: "heightVariance", label: "Height variance", min: 0, max: 1, step: 0.01 },
            { key: "maxHeight", label: "Max height", min: 1, max: 120, step: 1 },
            { key: "minBuildingHeight", label: "Min height", min: 1, max: 50, step: 1 },
            { key: "minResidentialScale", label: "Min residential scale", min: 1, max: 50, step: 1 },
            { key: "residentialHeightFactor", label: "Residential height factor", min: 0.01, max: 1, step: 0.01 },
            { key: "setbackFrequency", label: "Setback chance", min: 0, max: 1, step: 0.01 },
            { key: "vacantLotChance", label: "Vacant lot chance", min: 0, max: 1, step: 0.01 },
        ],
    },
    {
        folder: "City Grid",
        params: [
            { key: "blocks", label: "Blocks per side", min: 1, max: 40, step: 1 },
            { key: "lotMargin", label: "Lot margin", min: 0, max: 8, step: 1 },
            { key: "lotSize", label: "Lot size", min: 3, max: 16, step: 1 },
            { key: "lotsPerBlock", label: "Lots per block", min: 1, max: 8, step: 1 },
            { key: "streetWidth", label: "Street width", min: 0, max: 24, step: 1 },
        ],
    },
    {
        folder: "Ground & Pads",
        params: [
            { key: "padOverhang", label: "Pad overhang", min: 0, max: 8, step: 0.25 },
            { key: "padThickness", label: "Pad thickness", min: 0.05, max: 1, step: 0.05 },
        ],
    },
    {
        folder: "Macro Planning",
        params: [
            { key: "gridChaos", label: "Grid chaos", min: 0, max: 1, step: 0.01 },
            { key: "commercialDensity", label: "Commercial density", min: 0, max: 1, step: 0.01 },
            { key: "residentialDensity", label: "Residential density", min: 0, max: 1, step: 0.01 },
        ],
    },
    {
        folder: "Parks",
        params: [
            { key: "treeMin", label: "Trees (min)", min: 0, max: 40, step: 1 },
            { key: "treeSpread", label: "Trees (spread)", min: 0, max: 40, step: 1 },
        ],
    },
    {
        folder: "Windows",
        params: [
            { key: "windowDensity", label: "Density", min: 0, max: 1, step: 0.01 },
            { key: "windowFloorHeight", label: "Floor height", min: 1, max: 8, step: 1 },
            { key: "windowLitChance", label: "Lit chance", min: 0, max: 1, step: 0.01 },
        ]
    },
];
const LIMITS = {
    blocks: {
        min: 1,
        max: 40
    },
    lotsPerBlock: {
        min: 1,
        max: 8
    },
    lotSize: {
        min: 3,
        max: 16
    }
};
const PAD_COLOR = {
    commercial: SIDEWALK,
    residential: SIDEWALK,
    park: PARK_GREEN,
};
const ZONE_HEIGHT_SCALE = {
    commercial: (cfg) => cfg.maxHeight,
    residential: (cfg) => Math.max(cfg.minResidentialScale, cfg.maxHeight * cfg.residentialHeightFactor),
    park: () => 0,
};
const ZONE_EMITTERS = {
    commercial: emitLots,
    residential: emitLots,
    park: emitParkTrees,
};
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}
function clampInt(value, min, max) {
    return clamp(Math.round(value), min, max);
}
function sanitize(cfg) {
    const lotSize = clampInt(cfg.lotSize, LIMITS.lotSize.min, LIMITS.lotSize.max);
    const streetWidth = clamp(cfg.streetWidth, 0, 24);
    return Object.assign(Object.assign({}, cfg), { seed: Math.floor(cfg.seed), daylight: clamp(cfg.daylight, 0, HOURS_PER_DAY), gridChaos: clamp(cfg.gridChaos, 0, 1), commercialDensity: clamp(cfg.commercialDensity, 0, 1), residentialDensity: clamp(cfg.residentialDensity, 0, 1), blocks: clampInt(cfg.blocks, LIMITS.blocks.min, LIMITS.blocks.max), lotsPerBlock: clampInt(cfg.lotsPerBlock, LIMITS.lotsPerBlock.min, LIMITS.lotsPerBlock.max), lotSize, lotMargin: clampInt(cfg.lotMargin, 0, lotSize - 2), streetWidth, padOverhang: clamp(cfg.padOverhang, 0, streetWidth), padThickness: clamp(cfg.padThickness, 0.05, 1), maxHeight: clampInt(cfg.maxHeight, 1, 200), minBuildingHeight: clampInt(cfg.minBuildingHeight, 1, 50), heightVariance: clamp(cfg.heightVariance, 0, 1), setbackFrequency: clamp(cfg.setbackFrequency, 0, 1), vacantLotChance: clamp(cfg.vacantLotChance, 0, 1), minResidentialScale: clampInt(cfg.minResidentialScale, 1, 50), residentialHeightFactor: clamp(cfg.residentialHeightFactor, 0.01, 1), windowDensity: clamp(cfg.windowDensity, 0, 1), windowLitChance: clamp(cfg.windowLitChance, 0, 1), windowFloorHeight: clampInt(cfg.windowFloorHeight, 1, 8), treeMin: clampInt(cfg.treeMin, 0, 40), treeSpread: clampInt(cfg.treeSpread, 0, 40) });
}
function deriveMetrics(cfg) {
    const blockSize = cfg.lotsPerBlock * cfg.lotSize;
    const blockPitch = blockSize + cfg.streetWidth;
    return { blockSize, blockPitch, citySpan: cfg.blocks * blockPitch };
}
function districtIndex(bx, by, cfg) {
    const n = Utils.valueNoise2(bx * 0.16, by * 0.16, cfg.seed ^ 0x2545f491);
    return Math.min(Math.floor(n * DISTRICT_PALETTES.length), DISTRICT_PALETTES.length - 1);
}
function buildingColor(rand, district, cfg) {
    if (cfg.neighborhoodPaletteSync) {
        const palette = DISTRICT_PALETTES[district];
        return new THREE.Color(palette[Math.floor(rand() * palette.length)]);
    }
    return new THREE.Color().setHSL(rand(), 0.3 + rand() * 0.35, 0.42 + rand() * 0.22);
}
function planBlock(bx, by, ctx) {
    const { cfg, metrics } = ctx;
    const half = metrics.citySpan / 2;
    const centerX = bx * metrics.blockPitch - half + metrics.blockSize / 2;
    const centerZ = by * metrics.blockPitch - half + metrics.blockSize / 2;
    const zone = Utils.pickZone(bx, by, cfg);
    return {
        zone,
        district: districtIndex(bx, by, cfg),
        centerX,
        centerZ,
        originX: centerX - metrics.blockSize / 2,
        originZ: centerZ - metrics.blockSize / 2,
        baseHeight: 0.35 + 0.65 * Utils.valueNoise2(bx * 0.6, by * 0.6, cfg.seed ^ 0x3c6ef372),
        heightScale: ZONE_HEIGHT_SCALE[zone](cfg),
    };
}
function emitWindowPane(ctx, grid, face, wy, offset) {
    const { windows, windowRand, cfg } = ctx;
    if (windowRand() > cfg.windowDensity)
        return;
    const lit = windowRand() < ctx.windowPalette.litChance;
    // Wall-local placement, rotated into the tier's own frame.
    const lx = face.nx * grid.wall + face.nz * offset;
    const lz = face.nz * grid.wall + face.nx * offset;
    windows.push({
        x: grid.cx + lx * grid.cos + lz * grid.sin,
        y: wy - grid.paneH / 2,
        z: grid.cz - lx * grid.sin + lz * grid.cos,
        sx: Math.abs(face.nx) * WINDOW_DEPTH + Math.abs(face.nz) * grid.paneW,
        sy: grid.paneH,
        sz: Math.abs(face.nz) * WINDOW_DEPTH + Math.abs(face.nx) * grid.paneW,
        rotY: grid.rotY,
        color: (lit ? ctx.windowPalette.lit : ctx.windowPalette.dark)
            .clone()
            .offsetHSL(0, 0, (windowRand() - 0.5) * 0.08)
    });
}
function emitTierWindows(ctx, cx, cz, baseY, tierH, size, rotY) {
    const { cfg } = ctx;
    if (cfg.windowDensity <= 0)
        return;
    if (ctx.windows.length >= MAX_WINDOW_INSTANCES)
        return;
    const rows = Math.floor(tierH / cfg.windowFloorHeight);
    if (rows < 1)
        return;
    const cols = Math.max(1, Math.round(size / 2));
    const spacing = size / cols;
    const grid = {
        cx,
        cz,
        wall: size / 2,
        paneW: spacing * 0.5,
        paneH: Math.min(WINDOW_MAX_HEIGHT, cfg.windowFloorHeight * 0.5),
        rotY,
        cos: Math.cos(rotY),
        sin: Math.sin(rotY)
    };
    for (let r = 0; r < rows; r++) {
        const wy = baseY + cfg.windowFloorHeight * (r + 0.5);
        for (let c = 0; c < cols; c++) {
            const offset = -size / 2 + spacing * (c + 0.5);
            for (const face of WINDOW_FACES) {
                emitWindowPane(ctx, grid, face, wy, offset);
            }
        }
    }
}
function emitBuilding(ctx, plan, cx, cz, totalHeight) {
    const { out, rand, cfg } = ctx;
    let size = cfg.lotSize - cfg.lotMargin;
    let y = 0;
    const baseColor = buildingColor(rand, plan.district, cfg);
    const rotY = (rand() - 0.5) * cfg.gridChaos * 0.35; // slight grid distortion
    while (y < totalHeight && size >= 2) {
        const remaining = totalHeight - y;
        const tierH = Utils.nextTierHeight(remaining, rand, cfg);
        // Upper tiers get subtly lighter for readable silhouettes.
        const tint = baseColor.clone().offsetHSL(0, 0, Math.min(0.12, y * 0.004));
        out.push({
            x: cx,
            y,
            z: cz,
            sx: size,
            sy: tierH,
            sz: size,
            rotY,
            color: tint
        });
        emitTierWindows(ctx, cx, cz, y, tierH, size, rotY);
        y += tierH;
        if (tierH === remaining)
            break;
        size -= 2; // step inward one voxel per side
    }
}
function emitLot(ctx, plan, lx, lz) {
    const { rand, cfg } = ctx;
    if (rand() < cfg.vacantLotChance)
        return;
    const lotRoll = rand();
    const height = Math.max(cfg.minBuildingHeight, Math.round(Utils.lerp(plan.baseHeight, lotRoll, cfg.heightVariance) * plan.heightScale));
    // gridChaos jitters each lot off its perfect grid position.
    const jitter = cfg.gridChaos * (cfg.streetWidth * 0.5);
    const cx = plan.originX + cfg.lotSize / 2 + lx * cfg.lotSize + (rand() - 0.5) * jitter;
    const cz = plan.originZ + cfg.lotSize / 2 + lz * cfg.lotSize + (rand() - 0.5) * jitter;
    emitBuilding(ctx, plan, cx, cz, height);
}
function emitLots(ctx, plan) {
    for (let lx = 0; lx < ctx.cfg.lotsPerBlock; lx++) {
        for (let lz = 0; lz < ctx.cfg.lotsPerBlock; lz++) {
            emitLot(ctx, plan, lx, lz);
        }
    }
}
function emitParkTrees(ctx, plan) {
    const { out, rand, cfg, metrics } = ctx;
    const trees = cfg.treeMin + Math.floor(rand() * cfg.treeSpread);
    const spread = Math.max(0, metrics.blockSize - 3);
    for (let t = 0; t < trees; t++) {
        const tx = plan.centerX + (rand() - 0.5) * spread;
        const tz = plan.centerZ + (rand() - 0.5) * spread;
        const th = 1 + Math.round(rand() * 2);
        out.push({
            x: tx,
            y: cfg.padThickness,
            z: tz,
            sx: 1,
            sy: th,
            sz: 1,
            rotY: 0,
            color: TREE_GREEN.clone(),
        });
    }
}
function emitPad(ctx, plan) {
    const { cfg, metrics } = ctx;
    ctx.out.push({
        x: plan.centerX,
        y: 0,
        z: plan.centerZ,
        sx: metrics.blockSize + cfg.padOverhang,
        sy: cfg.padThickness,
        sz: metrics.blockSize + cfg.padOverhang,
        rotY: 0,
        color: PAD_COLOR[plan.zone].clone(),
    });
}
function emitBlock(ctx, bx, by) {
    const plan = planBlock(bx, by, ctx);
    emitPad(ctx, plan);
    ZONE_EMITTERS[plan.zone](ctx, plan);
}
function generateCity(cfg, metrics) {
    const ctx = {
        out: [],
        windows: [],
        windowPalette: buildWindowPalette(cfg),
        rand: Utils.mulberry32(cfg.seed),
        // Separate stream, so window rolls never perturb the city layout.
        windowRand: Utils.mulberry32(cfg.seed ^ 0x5bf03635),
        cfg,
        metrics
    };
    for (let bx = 0; bx < cfg.blocks; bx++) {
        for (let by = 0; by < cfg.blocks; by++) {
            emitBlock(ctx, bx, by);
        }
    }
    return {
        solids: ctx.out,
        windows: ctx.windows
    };
}
function createScene(mount, cfg, metrics, className) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    Utils.styleCanvasFullscreen(renderer.domElement, className);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SKY_DAY);
    const fog = new THREE.Fog(SKY_DAY, 1, 2);
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 10);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.49; // stay above ground
    controls.minDistance = 15;
    const sun = new THREE.DirectionalLight(SUN_DAY, SUN_MAX_INTENSITY);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0005;
    sun.shadow.radius = 3;
    scene.add(sun);
    const ambient = new THREE.AmbientLight(AMBIENT_DAY, 0.9);
    scene.add(ambient);
    // Unit plane, scaled in applyMetrics — avoids rebuilding geometry per tweak.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshLambertMaterial({ color: ROAD_GRAY }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const refs = {
        renderer,
        scene,
        camera,
        controls,
        sun,
        ambient,
        fog,
        boxGeometry: new THREE.BoxGeometry(1, 1, 1),
        material: new THREE.MeshLambertMaterial(),
        cityMesh: null,
        windowMesh: null,
        windowMaterial: new THREE.MeshBasicMaterial(),
        ground,
        frameId: 0,
    };
    applyMetrics(refs, metrics);
    applyDaylight(refs, cfg, metrics);
    resetView(refs, metrics);
    return refs;
}
function buildWindowPalette(cfg) {
    const solar = solarState(cfg.daylight);
    return windowPalette(cfg, skyColor(solar), solar);
}
function solarState(hour) {
    const angle = ((hour - SUNRISE_HOUR) / (HOURS_PER_DAY / 2)) * Math.PI;
    const elevation = Math.sin(angle);
    const east = -Math.cos(angle);
    // Tilt keeps the noon sun off dead-centre, so buildings always cast something.
    const length = Math.hypot(east, elevation, SUN_TILT);
    return {
        dirX: east / length,
        dirY: elevation / length,
        dirZ: SUN_TILT / length,
        elevation,
        dayFactor: smoothstep(-0.3, 0.3, elevation)
    };
}
function skyColor(solar) {
    // Night -> dusk while the sun is below the horizon, dusk -> day above it.
    return solar.dayFactor < 0.5
        ? SKY_NIGHT.clone().lerp(SKY_DUSK, smoothstep(0, 0.5, solar.dayFactor))
        : SKY_DUSK.clone().lerp(SKY_DAY, smoothstep(0.5, 1, solar.dayFactor));
}
function windowPalette(cfg, sky, solar) {
    const darkness = 1 - solar.dayFactor;
    return {
        lit: WINDOW_LIT.clone(),
        // By day, dark glass reads as a sky reflection rather than a black hole.
        dark: WINDOW_DARK.clone().lerp(sky.clone().multiplyScalar(0.55), solar.dayFactor),
        litChance: cfg.windowLitChance * darkness
    };
}
function applyDaylight(refs, cfg, metrics) {
    const solar = solarState(cfg.daylight);
    const sky = skyColor(solar);
    if (refs.scene.background instanceof THREE.Color)
        refs.scene.background.copy(sky);
    refs.fog.color.copy(sky);
    const radius = metrics.citySpan * 0.9;
    refs.sun.position.set(solar.dirX * radius, solar.dirY * radius, solar.dirZ * radius);
    refs.sun.intensity = SUN_MAX_INTENSITY * smoothstep(-0.1, 0.3, solar.elevation);
    refs.sun.color.copy(SUN_DUSK).lerp(SUN_DAY, smoothstep(0.05, 0.4, solar.elevation));
    // Nothing to project once the sun is down; skip the shadow pass entirely.
    refs.sun.castShadow = solar.elevation > 0;
    applyShadowFrustum(refs, metrics, solar);
    refs.ambient.color.copy(AMBIENT_NIGHT).lerp(AMBIENT_DAY, solar.dayFactor);
    refs.ambient.intensity = Utils.lerp(0.15, 0.9, solar.dayFactor);
}
function applyShadowFrustum(refs, metrics, solar) {
    const stretch = clamp(1 / Math.max(solar.dirY, 0.2), 1, SHADOW_MAX_STRETCH);
    const extent = metrics.citySpan * 0.7 * stretch;
    const camera = refs.sun.shadow.camera;
    camera.left = -extent;
    camera.right = extent;
    camera.top = extent;
    camera.bottom = -extent;
    camera.far = metrics.citySpan * 0.9 + extent * 2;
    camera.updateProjectionMatrix();
}
function applyMetrics(refs, metrics) {
    const span = metrics.citySpan;
    refs.camera.far = span * 4;
    refs.camera.updateProjectionMatrix();
    refs.fog.near = span * 0.9;
    refs.fog.far = span * 2.4;
    refs.controls.maxDistance = span * 1.8;
    refs.ground.scale.set(span * 3, span * 3, 1);
}
function disposeCityMeshes(refs) {
    if (refs.cityMesh) {
        refs.scene.remove(refs.cityMesh);
        refs.cityMesh.dispose();
        refs.cityMesh = null;
    }
    if (refs.windowMesh) {
        refs.scene.remove(refs.windowMesh);
        refs.windowMesh.dispose();
        refs.windowMesh = null;
    }
}
function resetView(refs, metrics) {
    const span = metrics.citySpan;
    refs.camera.position.set(span * 0.55, span * 0.45, span * 0.55);
    refs.controls.target.set(0, 6, 0);
    refs.controls.update();
}
function createGui(target, actions, onCommit) {
    var _a, _b;
    const gui = new GUI({ width: 320 });
    (_a = gui.domElement.parentElement) === null || _a === void 0 ? void 0 : _a.style.setProperty("z-index", "1");
    gui.add(target, "seed").step(1).name("Seed").onFinishChange(onCommit);
    gui.add(target, "daylight", 0, HOURS_PER_DAY, 0.25).name("Hour of day").onChange(onCommit);
    gui.add(target, "neighborhoodPaletteSync").name("Palette sync").onFinishChange(onCommit);
    gui.add(actions, "randomizeSeed").name("Randomize seed");
    gui.add(actions, "resetView").name("Reset View");
    for (const spec of GUI_FOLDERS) {
        const folder = gui.addFolder(spec.folder);
        for (const param of spec.params) {
            folder
                .add(target, param.key, param.min, param.max, param.step)
                .name(param.label)
                .onFinishChange(onCommit);
        }
    }
    (_b = gui.__folders["City Grid"]) === null || _b === void 0 ? void 0 : _b.open();
    return gui;
}
function VoxelCity({ config: userConfig, mount, className, showGui = true, }) {
    const sceneRef = useRef(null);
    const guiRef = useRef(null);
    const configKey = JSON.stringify(userConfig !== null && userConfig !== void 0 ? userConfig : {});
    const baseConfig = useMemo(() => sanitize(Object.assign(Object.assign({}, DEFAULT_CITY_CONFIG), JSON.parse(configKey))), [configKey]);
    const liveConfig = useRef(Object.assign({}, baseConfig));
    const appliedBase = useRef(baseConfig);
    const [revision, bumpRevision] = useReducer((n) => n + 1, 0);
    const rebuildCity = useEffectEvent(() => {
        var _a;
        const refs = sceneRef.current;
        if (!refs)
            return;
        const cfg = sanitize(liveConfig.current);
        Object.assign(liveConfig.current, cfg);
        (_a = guiRef.current) === null || _a === void 0 ? void 0 : _a.updateDisplay();
        const metrics = deriveMetrics(cfg);
        applyMetrics(refs, metrics);
        applyDaylight(refs, cfg, metrics);
        disposeCityMeshes(refs);
        const geometry = generateCity(cfg, metrics);
        refs.cityMesh = Utils.buildCityMesh(geometry.solids, refs.boxGeometry, refs.material);
        refs.scene.add(refs.cityMesh);
        if (geometry.windows.length === 0)
            return;
        refs.windowMesh = Utils.buildCityMesh(geometry.windows, refs.boxGeometry, refs.windowMaterial);
        // Panes sit proud of the wall by a fraction of a voxel; letting them cast
        // or receive shadows only produces acne along every facade.
        refs.windowMesh.castShadow = false;
        refs.windowMesh.receiveShadow = false;
        refs.scene.add(refs.windowMesh);
    });
    const resolveMount = useEffectEvent(() => mount !== null && mount !== void 0 ? mount : document.body);
    const resolveClassName = useEffectEvent(() => className);
    const resolveShowGui = useEffectEvent(() => showGui);
    useEffect(() => {
        var _a;
        const cfg = liveConfig.current;
        const refs = createScene(resolveMount(), cfg, deriveMetrics(cfg), resolveClassName());
        sceneRef.current = refs;
        if (resolveShowGui()) {
            guiRef.current = createGui(cfg, {
                randomizeSeed: () => {
                    var _a;
                    cfg.seed = Math.floor(Utils.random() * 1000000);
                    (_a = guiRef.current) === null || _a === void 0 ? void 0 : _a.updateDisplay();
                    bumpRevision();
                },
                resetView: () => resetView(refs, deriveMetrics(sanitize(cfg))),
            }, bumpRevision);
        }
        const animate = () => {
            refs.frameId = requestAnimationFrame(animate);
            refs.controls.update();
            refs.renderer.render(refs.scene, refs.camera);
        };
        animate();
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (w === 0 || h === 0)
                return;
            refs.camera.aspect = w / h;
            refs.camera.updateProjectionMatrix();
            refs.renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);
        (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.addEventListener("resize", handleResize);
        return () => {
            var _a, _b;
            window.removeEventListener("resize", handleResize);
            (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.removeEventListener("resize", handleResize);
            (_b = guiRef.current) === null || _b === void 0 ? void 0 : _b.destroy();
            guiRef.current = null;
            disposeCityMeshes(refs);
            refs.windowMaterial.dispose();
            Utils.disposeScene(refs);
            sceneRef.current = null;
        };
    }, []);
    useEffect(() => {
        var _a;
        if (appliedBase.current !== baseConfig) {
            Object.assign(liveConfig.current, baseConfig);
            appliedBase.current = baseConfig;
            (_a = guiRef.current) === null || _a === void 0 ? void 0 : _a.updateDisplay();
        }
        rebuildCity();
    }, [baseConfig, revision]);
    return null;
}
class Utils {
    static random() {
        return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    }
    static mulberry32(seed) {
        let a = seed >>> 0;
        return () => {
            // Must wrap modulo 2^32; plain truncation would let `a` drift past 2^53
            // and silently degrade the sequence.
            a = (a + 0x6d2b79f5) % 0x100000000;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    static hash2(ix, iy, seed) {
        let h = Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iy, 0x165667b1) ^ seed;
        h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
        h ^= h >>> 13;
        return (h >>> 0) / 4294967296;
    }
    static valueNoise2(x, y, seed) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);
        const a = this.hash2(ix, iy, seed);
        const b = this.hash2(ix + 1, iy, seed);
        const c = this.hash2(ix, iy + 1, seed);
        const d = this.hash2(ix + 1, iy + 1, seed);
        const top = a + (b - a) * sx;
        const bot = c + (d - c) * sx;
        return top + (bot - top) * sy;
    }
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    static pickZone(bx, by, cfg) {
        const comm = this.valueNoise2(bx * 0.35, by * 0.35, cfg.seed ^ 0x9e3779b9) * cfg.commercialDensity;
        const res = this.valueNoise2(bx * 0.35 + 71.3, by * 0.35 + 19.7, cfg.seed ^ 0x51ab7c11) * cfg.residentialDensity;
        if (Math.max(comm, res) < 0.12)
            return "park";
        return comm >= res ? "commercial" : "residential";
    }
    static nextTierHeight(remaining, rand, cfg) {
        if (remaining <= 3 || rand() >= cfg.setbackFrequency)
            return remaining;
        return Math.max(2, Math.round(remaining * (0.35 + rand() * 0.4)));
    }
    static buildCityMesh(instances, geometry, material) {
        const mesh = new THREE.InstancedMesh(geometry, material, instances.length);
        const temp = new THREE.Object3D();
        for (let i = 0; i < instances.length; i++) {
            const v = instances[i];
            temp.position.set(v.x, v.y + v.sy / 2, v.z);
            temp.rotation.set(0, v.rotY, 0);
            temp.scale.set(v.sx, v.sy, v.sz);
            temp.updateMatrix();
            mesh.setMatrixAt(i, temp.matrix);
            mesh.setColorAt(i, v.color);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor)
            mesh.instanceColor.needsUpdate = true;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }
    static styleCanvasFullscreen(canvas, className) {
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.display = "block";
        canvas.style.touchAction = "none";
        canvas.style.outline = "none";
        if (className)
            canvas.className = className;
    }
    static disposeScene(refs) {
        cancelAnimationFrame(refs.frameId);
        refs.controls.dispose();
        if (refs.cityMesh) {
            refs.scene.remove(refs.cityMesh);
            refs.cityMesh.dispose();
        }
        refs.boxGeometry.dispose();
        refs.material.dispose();
        refs.ground.geometry.dispose();
        refs.ground.material.dispose();
        refs.renderer.dispose();
        refs.renderer.domElement.remove();
    }
}