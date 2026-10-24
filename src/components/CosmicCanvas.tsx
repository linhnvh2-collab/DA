import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CelestialBody, CosmicScaleLevel, GraphicsQuality, ScaleMode, InteractionMode, CollisionEvent } from '../types/celestial';
import { CELESTIAL_BODIES } from '../data/celestialData';
import { getProceduralTexture } from '../utils/proceduralTextures';
import { cosmicAudio } from '../utils/audioSynthesizer';

// Zero GC reusable math helpers
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3Cam = new THREE.Vector3();
const _colorA = new THREE.Color();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _plane = new THREE.Plane();
const _planeIntersect = new THREE.Vector3();

interface CosmicCanvasProps {
  currentScale: CosmicScaleLevel;
  selectedBody: CelestialBody | null;
  onSelectBody: (body: CelestialBody | null) => void;
  scaleMode: ScaleMode;
  interactionMode: InteractionMode;
  simSpeed: number;
  showOrbits: boolean;
  showLabels: boolean;
  showGrid: boolean;
  showHabitableZone: boolean;
  showAsteroidBelt: boolean;
  graphicsQuality: GraphicsQuality;
  supernovaTrigger: number;
  resetUniverseTrigger: number;
  onCollision: (event: CollisionEvent) => void;
  onResetViewRef?: React.MutableRefObject<(() => void) | null>;
}

interface BodyMeshBundle {
  body: CelestialBody;
  meshGroup: THREE.Group;
  surfaceMesh?: THREE.Mesh;
  cloudMesh?: THREE.Mesh;
  atmosphereGlowMesh?: THREE.Mesh;
  ringsMesh?: THREE.Mesh;
  orbitLine?: THREE.Line;
  orbitPoints?: THREE.Vector3[];
  currentAngle: number;
  currentPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  isDragged: boolean;
  isDestroyed: boolean;
  initialRadius: number;
}

interface ExplosionParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface ShockwaveRing {
  mesh: THREE.Mesh;
  currentRadius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: THREE.Color;
}

interface AsteroidProjectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  tailParticles: THREE.Vector3[];
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
  currentScale,
  selectedBody,
  onSelectBody,
  scaleMode,
  interactionMode,
  simSpeed,
  showOrbits,
  showLabels,
  showGrid,
  showHabitableZone,
  showAsteroidBelt,
  graphicsQuality,
  supernovaTrigger,
  resetUniverseTrigger,
  onCollision,
  onResetViewRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [screenLabels, setScreenLabels] = useState<Array<{ id: string; name: string; x: number; y: number; visible: boolean; isSelected: boolean }>>([]);
  const [draggedBodyName, setDraggedBodyName] = useState<string | null>(null);

  // References to keep in loop without re-triggering useEffect
  const stateRef = useRef({
    currentScale,
    selectedBody,
    scaleMode,
    interactionMode,
    simSpeed,
    showOrbits,
    showLabels,
    showGrid,
    showHabitableZone,
    showAsteroidBelt,
    graphicsQuality,
  });

  stateRef.current = {
    currentScale,
    selectedBody,
    scaleMode,
    interactionMode,
    simSpeed,
    showOrbits,
    showLabels,
    showGrid,
    showHabitableZone,
    showAsteroidBelt,
    graphicsQuality,
  };

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bodyBundlesRef = useRef<Map<string, BodyMeshBundle>>(new Map());
  const cameraTargetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 140, 200));
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraCurrentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Particle & Debris Systems
  const explosionsRef = useRef<ExplosionParticle[]>([]);
  const explosionMeshRef = useRef<THREE.Points | null>(null);
  const shockwavesRef = useRef<ShockwaveRing[]>([]);
  const projectilesRef = useRef<AsteroidProjectile[]>([]);

  // Dragging Body state
  const activeDraggedBundleRef = useRef<BodyMeshBundle | null>(null);
  const dragTargetPlanePosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragIndicatorMeshRef = useRef<THREE.Mesh | null>(null);

  // Cannon Slingshot Aiming state
  const isAimingCannonRef = useRef(false);
  const cannonStartPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const cannonCurrentPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const trajectoryLineRef = useRef<THREE.Line | null>(null);

  // Spacetime Gravity Grid
  const gravityGridMeshRef = useRef<THREE.Mesh | null>(null);

  // Manual Orbit controls state
  const isDraggingCameraRef = useRef(false);
  const isRightDraggingCameraRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 100, theta: Math.PI / 4, phi: Math.PI / 3 });
  const panOffsetRef = useRef(new THREE.Vector3());

  // Function to fly camera to selected body or scale
  const focusOnTarget = useCallback((targetId: string | null, scale: CosmicScaleLevel) => {
    cosmicAudio.playFlySound();
    if (!targetId) {
      switch (scale) {
        case 'earth_moon': {
          const earthBundle = bodyBundlesRef.current.get('earth');
          if (earthBundle) {
            const ep = earthBundle.currentPosition;
            cameraLookAtRef.current.copy(ep);
            cameraTargetPosRef.current.set(ep.x + 8, ep.y + 4, ep.z + 11);
          } else {
            cameraTargetPosRef.current.set(0, 8, 14);
            cameraLookAtRef.current.set(0, 0, 0);
          }
          panOffsetRef.current.set(0, 0, 0);
          break;
        }
        case 'solar_system':
          cameraTargetPosRef.current.set(0, 140, 200);
          cameraLookAtRef.current.set(0, 0, 0);
          panOffsetRef.current.set(0, 0, 0);
          break;
        case 'stellar_neighborhood':
          cameraTargetPosRef.current.set(0, 150, 260);
          cameraLookAtRef.current.set(0, 0, 0);
          panOffsetRef.current.set(0, 0, 0);
          break;
        case 'milky_way':
          cameraTargetPosRef.current.set(0, 160, 200);
          cameraLookAtRef.current.set(0, 0, 0);
          panOffsetRef.current.set(0, 0, 0);
          break;
        case 'local_group':
          cameraTargetPosRef.current.set(0, 240, 320);
          cameraLookAtRef.current.set(0, 0, 0);
          panOffsetRef.current.set(0, 0, 0);
          break;
        case 'observable_universe':
          cameraTargetPosRef.current.set(0, 320, 420);
          cameraLookAtRef.current.set(0, 0, 0);
          panOffsetRef.current.set(0, 0, 0);
          break;
      }
      return;
    }

    const bundle = bodyBundlesRef.current.get(targetId);
    if (!bundle) return;

    const b = bundle.body;
    const bodyPos = bundle.currentPosition;
    cameraLookAtRef.current.copy(bodyPos);

    const dist = b.camDistance * (stateRef.current.scaleMode === 'scientific' ? 0.9 : 1.0);
    cameraTargetPosRef.current.set(
      bodyPos.x + dist * 0.7,
      bodyPos.y + dist * 0.5,
      bodyPos.z + dist * 0.8
    );
  }, []);

  // Expose reset view to parent
  useEffect(() => {
    if (onResetViewRef) {
      onResetViewRef.current = () => {
        onSelectBody(null);
        focusOnTarget(null, stateRef.current.currentScale);
      };
    }
  }, [focusOnTarget, onResetViewRef, onSelectBody]);

  // Handle scale or selectedBody change
  useEffect(() => {
    focusOnTarget(selectedBody?.id || null, currentScale);
  }, [currentScale, selectedBody, focusOnTarget]);

  // Spawn Shockwave Ring
  const spawnShockwave = (position: THREE.Vector3, colorHex: string, maxRadius = 30) => {
    if (!sceneRef.current) return;
    const ringGeo = new THREE.RingGeometry(1, 2.5, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(position);
    ringMesh.rotation.x = Math.PI / 2;
    sceneRef.current.add(ringMesh);

    shockwavesRef.current.push({
      mesh: ringMesh,
      currentRadius: 2.5,
      maxRadius,
      speed: 35,
      alpha: 1.0,
      color: new THREE.Color(colorHex),
    });
  };

  // Trigger Collision Event
  const triggerPlanetaryCollision = (bundleA: BodyMeshBundle, bundleB: BodyMeshBundle) => {
    const posA = bundleA.currentPosition;
    const posB = bundleB.currentPosition;
    const midPos = _vec3A.copy(posA).add(posB).multiplyScalar(0.5);

    // Audio & Shockwave
    cosmicAudio.playCollisionSound(1.2);
    spawnShockwave(midPos, '#ff9900', 45);
    spawnShockwave(midPos, '#00ffff', 60);

    // Blast Debris Particles
    const count = 450;
    const colorMix1 = new THREE.Color(bundleA.body.colorHex);
    const colorMix2 = new THREE.Color(bundleB.body.colorHex);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = Math.random() * 45 + 10;

      const vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );

      const baseCol = Math.random() > 0.5 ? colorMix1 : colorMix2;
      explosionsRef.current.push({
        position: midPos.clone(),
        velocity: vel,
        color: baseCol.clone().offsetHSL((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.2),
        size: Math.random() * 3.5 + 1.5,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 2.8 + 1.2,
      });
    }

    // Determine consequence
    let consequence = `Va chạm hủy diệt giữa ${bundleA.body.nameVi} và ${bundleB.body.nameVi}!`;
    if (bundleA.body.type === 'star' || bundleB.body.type === 'star') {
      consequence = `${bundleA.body.type === 'star' ? bundleB.body.nameVi : bundleA.body.nameVi} đã rơi vào lõi thiêu rụi của ${bundleA.body.type === 'star' ? bundleA.body.nameVi : bundleB.body.nameVi}!`;
    } else if (bundleA.body.type === 'black_hole' || bundleB.body.type === 'black_hole') {
      consequence = `Vật chất bị nghiền nát và nuốt trọn vào đĩa chân trời sự kiện của Lỗ đen!`;
    }

    // Mark smaller body as destroyed or scatter it
    if (bundleA.body.visualRadius >= bundleB.body.visualRadius && bundleA.body.type !== 'moon') {
      bundleB.isDestroyed = true;
      bundleB.meshGroup.visible = false;
      if (bundleB.orbitLine) bundleB.orbitLine.visible = false;
    } else {
      bundleA.isDestroyed = true;
      bundleA.meshGroup.visible = false;
      if (bundleA.orbitLine) bundleA.orbitLine.visible = false;
    }

    // Dispatch event to parent UI
    onCollision({
      id: `${Date.now()}-${Math.random()}`,
      body1Name: bundleA.body.nameVi,
      body2Name: bundleB.body.nameVi,
      energyJoules: `${(Math.random() * 8 + 1.5).toFixed(2)} × 10³² Joules`,
      consequenceVi: consequence,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Handle supernova trigger from parent
  useEffect(() => {
    if (supernovaTrigger <= 0) return;
    cosmicAudio.playExplosionSound();

    let centerPos = new THREE.Vector3(0, 0, 0);
    let burstColor = new THREE.Color('#ffaa00');
    if (stateRef.current.selectedBody) {
      const b = bodyBundlesRef.current.get(stateRef.current.selectedBody.id);
      if (b) {
        centerPos.copy(b.currentPosition);
        burstColor = new THREE.Color(b.body.glowColorHex || b.body.colorHex || '#ffaa00');
      }
    }

    spawnShockwave(centerPos, '#ff3300', 80);
    spawnShockwave(centerPos, '#00d2d3', 110);

    const count = 600;
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = Math.random() * 50 + 12;

      const vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );

      explosionsRef.current.push({
        position: centerPos.clone(),
        velocity: vel,
        color: burstColor.clone().offsetHSL((Math.random() - 0.5) * 0.25, 0, (Math.random() - 0.5) * 0.2),
        size: Math.random() * 4 + 2,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 3.0 + 1.5,
      });
    }
  }, [supernovaTrigger]);

  // Handle Universe Reset Trigger (Reconstruct universe)
  useEffect(() => {
    if (resetUniverseTrigger <= 0) return;
    cosmicAudio.playRestoreSound();

    bodyBundlesRef.current.forEach((bundle) => {
      bundle.isDestroyed = false;
      bundle.isDragged = false;
      bundle.meshGroup.visible = true;
      if (bundle.orbitLine) bundle.orbitLine.visible = true;

      // Re-anchor to initial orbit
      const r = stateRef.current.scaleMode === 'scientific' ? bundle.body.orbitRadiusScientific : bundle.body.orbitRadiusVisual;
      if (r > 0) {
        bundle.currentPosition.x = Math.cos(bundle.currentAngle) * r;
        bundle.currentPosition.z = Math.sin(bundle.currentAngle) * r;
        bundle.currentPosition.y = 0;
        bundle.meshGroup.position.copy(bundle.currentPosition);
      }
    });

    spawnShockwave(new THREE.Vector3(0, 0, 0), '#00f2fe', 120);
  }, [resetUniverseTrigger]);

  // Main Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060c1d);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
    camera.position.set(0, 140, 200);
    cameraRef.current = camera;
    cameraCurrentLookAtRef.current.set(0, 0, 0);

    // 3. Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: stateRef.current.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Multi-Angle Cosmic Lights (Omni-Illumination to prevent dark shadowing)
    const sunLight = new THREE.PointLight(0xfffdf5, 3.2, 1400, 0.05);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Camera Headlight: attached to camera so the visible hemisphere of every celestial body is always illuminated!
    const cameraLight = new THREE.DirectionalLight(0xffffff, 1.4);
    camera.add(cameraLight);
    scene.add(camera);

    // Warm/cool cosmic ambient light to reveal full planetary surface textures
    const ambientLight = new THREE.AmbientLight(0x566d99, 0.95);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x7ea7ff, 0x1f2c4a, 0.75);
    scene.add(hemiLight);

    // 5a. Starfield Sky Background
    const starCount = stateRef.current.graphicsQuality === 'low' ? 4000 : 12000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const spectralColors = [
      new THREE.Color('#9bb0ff'),
      new THREE.Color('#bbccff'),
      new THREE.Color('#f8f9ff'),
      new THREE.Color('#ffffed'),
      new THREE.Color('#ffd2a1'),
      new THREE.Color('#ff9977'),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 1800 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;

      starSizes[i] = Math.random() * 2.2 + 0.8;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 5b. Deep Space Glowing Nebula Clouds (cyan, purple, rose cosmic clouds)
    const nebulaCount = stateRef.current.graphicsQuality === 'low' ? 800 : 2500;
    const nebGeo = new THREE.BufferGeometry();
    const nebPos = new Float32Array(nebulaCount * 3);
    const nebCols = new Float32Array(nebulaCount * 3);
    const nebColorsList = [
      new THREE.Color('#38ada9'),
      new THREE.Color('#6c5ce7'),
      new THREE.Color('#e056fd'),
      new THREE.Color('#00d2d3'),
      new THREE.Color('#4834d4'),
    ];
    for (let i = 0; i < nebulaCount; i++) {
      const r = 900 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      nebPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      nebPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      nebPos[i * 3 + 2] = r * Math.cos(phi);

      const col = nebColorsList[Math.floor(Math.random() * nebColorsList.length)];
      nebCols[i * 3] = col.r;
      nebCols[i * 3 + 1] = col.g;
      nebCols[i * 3 + 2] = col.b;
    }
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
    nebGeo.setAttribute('color', new THREE.BufferAttribute(nebCols, 3));
    const nebMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebulaField = new THREE.Points(nebGeo, nebMat);
    scene.add(nebulaField);

    // 6. Deep Space: Milky Way Spiral Galaxy Disk
    const milkyWayGroup = new THREE.Group();
    milkyWayGroup.name = 'milky_way_group';
    const mwStarCount = stateRef.current.graphicsQuality === 'low' ? 6000 : 18000;
    const mwGeo = new THREE.BufferGeometry();
    const mwPos = new Float32Array(mwStarCount * 3);
    const mwCols = new Float32Array(mwStarCount * 3);

    const arms = 4;
    const armTwist = 3.5;
    for (let i = 0; i < mwStarCount; i++) {
      const armIdx = i % arms;
      const dist = Math.pow(Math.random(), 2) * 55 + 2;
      const angle = (armIdx * ((Math.PI * 2) / arms)) + (dist / 55) * armTwist + (Math.random() - 0.5) * 0.45;
      const spreadX = (Math.random() - 0.5) * (dist * 0.22);
      const spreadZ = (Math.random() - 0.5) * (dist * 0.22);
      const spreadY = (Math.random() - 0.5) * (8 * Math.exp(-dist / 25));

      mwPos[i * 3] = Math.cos(angle) * dist + spreadX;
      mwPos[i * 3 + 1] = spreadY;
      mwPos[i * 3 + 2] = Math.sin(angle) * dist + spreadZ;

      const coreMix = Math.max(0, 1 - dist / 22);
      const starColor = new THREE.Color().lerpColors(
        new THREE.Color('#48dbfb'),
        new THREE.Color('#ffbe76'),
        coreMix
      );
      if (Math.random() > 0.85) starColor.set('#f368e0');

      mwCols[i * 3] = starColor.r;
      mwCols[i * 3 + 1] = starColor.g;
      mwCols[i * 3 + 2] = starColor.b;
    }
    mwGeo.setAttribute('position', new THREE.BufferAttribute(mwPos, 3));
    mwGeo.setAttribute('color', new THREE.BufferAttribute(mwCols, 3));
    const mwMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mwPoints = new THREE.Points(mwGeo, mwMat);
    milkyWayGroup.add(mwPoints);

    const coreTex = getProceduralTexture('galaxy_core', renderer);
    const coreMat = new THREE.SpriteMaterial({
      map: coreTex,
      color: 0xffeaa7,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const coreSprite = new THREE.Sprite(coreMat);
    coreSprite.scale.set(30, 30, 1);
    milkyWayGroup.add(coreSprite);

    milkyWayGroup.position.set(0, 0, 0);
    milkyWayGroup.visible = false;
    scene.add(milkyWayGroup);

    // 6b. Deep Space: Cosmic Web Structure (for Observable Universe scale)
    const cosmicWebGroup = new THREE.Group();
    cosmicWebGroup.name = 'cosmic_web_group';
    const webNodesCount = 1200;
    const webNodePositions: THREE.Vector3[] = [];
    const webGeo = new THREE.BufferGeometry();
    const webPos = new Float32Array(webNodesCount * 3);
    const webCols = new Float32Array(webNodesCount * 3);

    const webColors = [
      new THREE.Color('#0abde3'),
      new THREE.Color('#9c88ff'),
      new THREE.Color('#ff9ff3'),
      new THREE.Color('#48dbfb'),
      new THREE.Color('#5f27cd'),
    ];

    for (let i = 0; i < webNodesCount; i++) {
      const rad = 60 + Math.pow(Math.random(), 0.7) * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const px = rad * Math.sin(phi) * Math.cos(theta);
      const py = rad * Math.sin(phi) * Math.sin(theta) * 0.7;
      const pz = rad * Math.cos(phi);
      webNodePositions.push(new THREE.Vector3(px, py, pz));

      webPos[i * 3] = px;
      webPos[i * 3 + 1] = py;
      webPos[i * 3 + 2] = pz;

      const col = webColors[i % webColors.length];
      webCols[i * 3] = col.r;
      webCols[i * 3 + 1] = col.g;
      webCols[i * 3 + 2] = col.b;
    }

    webGeo.setAttribute('position', new THREE.BufferAttribute(webPos, 3));
    webGeo.setAttribute('color', new THREE.BufferAttribute(webCols, 3));
    const webMat = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const webPoints = new THREE.Points(webGeo, webMat);
    cosmicWebGroup.add(webPoints);

    // Filament lines linking nearby galaxy clusters
    const filamentPts: THREE.Vector3[] = [];
    for (let i = 0; i < webNodesCount; i += 3) {
      const pA = webNodePositions[i];
      for (let j = i + 1; j < Math.min(i + 12, webNodesCount); j++) {
        const pB = webNodePositions[j];
        if (pA.distanceTo(pB) < 42) {
          filamentPts.push(pA, pB);
        }
      }
    }
    if (filamentPts.length > 0) {
      const filGeo = new THREE.BufferGeometry().setFromPoints(filamentPts);
      const filMat = new THREE.LineBasicMaterial({
        color: 0x48dbfb,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
      });
      const filLines = new THREE.LineSegments(filGeo, filMat);
      cosmicWebGroup.add(filLines);
    }

    cosmicWebGroup.visible = false;
    scene.add(cosmicWebGroup);

    // 7. Asteroid Belt
    const asteroidGroup = new THREE.Group();
    asteroidGroup.name = 'asteroid_group';
    const asteroidCount = 1800;
    const astGeo = new THREE.BufferGeometry();
    const astPos = new Float32Array(asteroidCount * 3);
    const astCols = new Float32Array(asteroidCount * 3);

    for (let i = 0; i < asteroidCount; i++) {
      const rad = 50 + Math.random() * 7;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.5;

      astPos[i * 3] = Math.cos(angle) * rad;
      astPos[i * 3 + 1] = y;
      astPos[i * 3 + 2] = Math.sin(angle) * rad;

      const shade = 0.5 + Math.random() * 0.35;
      astCols[i * 3] = shade * 0.9;
      astCols[i * 3 + 1] = shade * 0.85;
      astCols[i * 3 + 2] = shade * 0.8;
    }
    astGeo.setAttribute('position', new THREE.BufferAttribute(astPos, 3));
    astGeo.setAttribute('color', new THREE.BufferAttribute(astCols, 3));
    const astMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const astPoints = new THREE.Points(astGeo, astMat);
    asteroidGroup.add(astPoints);
    scene.add(asteroidGroup);

    // 8. Habitable Zone Ring
    const habRingGeo = new THREE.RingGeometry(31, 44, 64);
    const habRingMat = new THREE.MeshBasicMaterial({
      color: 0x2ed573,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const habRingMesh = new THREE.Mesh(habRingGeo, habRingMat);
    habRingMesh.rotation.x = Math.PI / 2;
    habRingMesh.name = 'habitable_zone_mesh';
    scene.add(habRingMesh);

    // 9. Celestial Grid
    const gridHelper = new THREE.GridHelper(300, 30, 0x1e3799, 0x0c2461);
    gridHelper.position.y = -0.1;
    gridHelper.name = 'celestial_grid';
    scene.add(gridHelper);

    // 10. Einstein Spacetime Gravity Well Grid
    const gwGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    const gwMat = new THREE.MeshBasicMaterial({
      color: 0x00d2d3,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const gwMesh = new THREE.Mesh(gwGeo, gwMat);
    gwMesh.rotation.x = -Math.PI / 2;
    gwMesh.position.y = -1.5;
    scene.add(gwMesh);
    gravityGridMeshRef.current = gwMesh;

    // 11. Dragging Ring Indicator (shows on plane below dragged planet)
    const dragIndGeo = new THREE.RingGeometry(2, 2.8, 32);
    const dragIndMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const dragIndMesh = new THREE.Mesh(dragIndGeo, dragIndMat);
    dragIndMesh.rotation.x = Math.PI / 2;
    dragIndMesh.visible = false;
    scene.add(dragIndMesh);
    dragIndicatorMeshRef.current = dragIndMesh;

    // 12. Trajectory Aiming Line for Asteroid Cannon
    const trajLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const trajLineMat = new THREE.LineBasicMaterial({
      color: 0xff3838,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const trajLine = new THREE.Line(trajLineGeo, trajLineMat);
    trajLine.visible = false;
    scene.add(trajLine);
    trajectoryLineRef.current = trajLine;

    // 13. Build Celestial Bodies Meshes & Orbits
    bodyBundlesRef.current.clear();
    CELESTIAL_BODIES.forEach((body) => {
      // 1. Macro Cosmic Structures: Milky Way & Observable Universe are represented by dedicated particle & cosmic web groups, NOT solid spheres!
      if (body.id === 'milky_way' || body.id === 'observable_universe') {
        const meshGroup = new THREE.Group();
        meshGroup.name = `body_${body.id}`;
        scene.add(meshGroup);

        bodyBundlesRef.current.set(body.id, {
          body,
          meshGroup,
          currentAngle: 0,
          currentPosition: new THREE.Vector3(0, 0, 0),
          velocity: new THREE.Vector3(),
          isDragged: false,
          isDestroyed: false,
          initialRadius: 0,
        });
        return;
      }

      // 2. Andromeda Galaxy: rendered as a majestic spiral particle galaxy disc
      if (body.id === 'andromeda_galaxy') {
        const meshGroup = new THREE.Group();
        meshGroup.name = `body_${body.id}`;

        const andrGeo = new THREE.BufferGeometry();
        const andrCount = 3500;
        const andrPos = new Float32Array(andrCount * 3);
        const andrCols = new Float32Array(andrCount * 3);
        const arms = 2;
        for (let i = 0; i < andrCount; i++) {
          const arm = i % arms;
          const dist = Math.pow(Math.random(), 1.8) * 32 + 1;
          const ang = arm * Math.PI + (dist / 32) * 3.8 + (Math.random() - 0.5) * 0.35;
          const sx = Math.cos(ang) * dist + (Math.random() - 0.5) * (dist * 0.2);
          const sz = Math.sin(ang) * dist + (Math.random() - 0.5) * (dist * 0.2);
          const sy = (Math.random() - 0.5) * (5 * Math.exp(-dist / 15));
          andrPos[i * 3] = sx;
          andrPos[i * 3 + 1] = sy;
          andrPos[i * 3 + 2] = sz;

          const col = new THREE.Color().lerpColors(new THREE.Color('#48dbfb'), new THREE.Color('#ffeaa7'), Math.max(0, 1 - dist / 12));
          andrCols[i * 3] = col.r;
          andrCols[i * 3 + 1] = col.g;
          andrCols[i * 3 + 2] = col.b;
        }
        andrGeo.setAttribute('position', new THREE.BufferAttribute(andrPos, 3));
        andrGeo.setAttribute('color', new THREE.BufferAttribute(andrCols, 3));
        const andrMat = new THREE.PointsMaterial({
          size: 1.5,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const andrPoints = new THREE.Points(andrGeo, andrMat);
        meshGroup.add(andrPoints);

        const andrCoreTex = getProceduralTexture('galaxy_core', renderer);
        const andrCoreMat = new THREE.SpriteMaterial({
          map: andrCoreTex,
          color: 0xffeaa7,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
        });
        const andrCore = new THREE.Sprite(andrCoreMat);
        andrCore.scale.set(16, 16, 1);
        meshGroup.add(andrCore);

        meshGroup.rotation.x = THREE.MathUtils.degToRad(35);
        meshGroup.rotation.z = THREE.MathUtils.degToRad(25);
        meshGroup.userData = { bodyId: body.id, isCelestialTarget: true };

        const initialAngle = 0;
        const initialPos = new THREE.Vector3(120, 20, 0);
        meshGroup.position.copy(initialPos);
        scene.add(meshGroup);

        bodyBundlesRef.current.set(body.id, {
          body,
          meshGroup,
          currentAngle: initialAngle,
          currentPosition: initialPos,
          velocity: new THREE.Vector3(),
          isDragged: false,
          isDestroyed: false,
          initialRadius: 35,
        });
        return;
      }

      const meshGroup = new THREE.Group();
      meshGroup.name = `body_${body.id}`;

      const rad = body.visualRadius;
      const sphereGeo = new THREE.SphereGeometry(rad, 48, 36);

      let surfaceMat: THREE.Material;
      if (body.type === 'star') {
        const sunTex = getProceduralTexture(body.id === 'sun' ? 'sun' : 'star_glow', renderer);
        surfaceMat = new THREE.MeshBasicMaterial({
          map: sunTex,
          color: new THREE.Color(body.colorHex),
        });
      } else {
        const tex = getProceduralTexture(body.id, renderer);
        surfaceMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.75,
          metalness: 0.1,
        });
      }

      const surfaceMesh = new THREE.Mesh(sphereGeo, surfaceMat);
      surfaceMesh.castShadow = true;
      surfaceMesh.receiveShadow = true;
      surfaceMesh.rotation.z = THREE.MathUtils.degToRad(body.axialTiltDeg);
      surfaceMesh.userData = { bodyId: body.id, isCelestialTarget: true };
      meshGroup.add(surfaceMesh);

      // Atmospheric Glow
      let atmosphereGlowMesh: THREE.Mesh | undefined;
      if (body.hasAtmosphereGlow) {
        const glowGeo = new THREE.SphereGeometry(rad * 1.14, 32, 24);
        const glowMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(body.glowColorHex || body.colorHex),
          transparent: true,
          opacity: body.type === 'star' ? 0.38 : 0.22,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        atmosphereGlowMesh = new THREE.Mesh(glowGeo, glowMat);
        meshGroup.add(atmosphereGlowMesh);
      }

      // Earth Clouds
      let cloudMesh: THREE.Mesh | undefined;
      if (body.hasClouds) {
        const cloudGeo = new THREE.SphereGeometry(rad * 1.025, 48, 32);
        const cloudTex = getProceduralTexture('earth_clouds', renderer);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
          roughness: 0.9,
        });
        cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        meshGroup.add(cloudMesh);
      }

      // Planetary Rings
      let ringsMesh: THREE.Mesh | undefined;
      if (body.hasRings && body.ringInnerRadius && body.ringOuterRadius) {
        const ringGeo = new THREE.RingGeometry(body.ringInnerRadius, body.ringOuterRadius, 64);
        const ringTex = getProceduralTexture('saturn_rings', renderer);
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92,
          roughness: 0.6,
        });
        ringsMesh = new THREE.Mesh(ringGeo, ringMat);
        ringsMesh.rotation.x = Math.PI / 2;
        ringsMesh.rotation.y = THREE.MathUtils.degToRad(body.axialTiltDeg);
        meshGroup.add(ringsMesh);
      }

      // Luminous Beacon Halo: ensures every planet is clearly visible from afar without being lost in darkness
      if (body.type === 'planet' || body.type === 'dwarf_planet' || body.id === 'moon') {
        const beaconGeo = new THREE.RingGeometry(rad * 1.25, rad * 1.45, 32);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(body.glowColorHex || body.colorHex),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.rotation.x = Math.PI / 2;
        beaconMesh.name = `beacon_${body.id}`;
        meshGroup.add(beaconMesh);
      }

      // Orbit Line Path
      let orbitLine: THREE.Line | undefined;
      let orbitPts: THREE.Vector3[] | undefined;
      if (body.orbitRadiusVisual > 0 && (body.scaleLevel === 'solar_system' || body.scaleLevel === 'earth_moon')) {
        const segments = 120;
        orbitPts = [];
        for (let s = 0; s <= segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          const inc = THREE.MathUtils.degToRad(body.orbitInclinationDeg);
          const x = Math.cos(theta) * body.orbitRadiusVisual;
          const z = Math.sin(theta) * body.orbitRadiusVisual;
          const y = Math.sin(theta) * Math.sin(inc) * (body.orbitRadiusVisual * 0.2);
          orbitPts.push(new THREE.Vector3(x, y, z));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
        const orbitMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(body.colorHex),
          transparent: true,
          opacity: 0.55,
        });
        orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);
      }

      const initialAngle = Math.random() * Math.PI * 2;
      const initialPos = new THREE.Vector3();
      if (body.orbitRadiusVisual > 0) {
        initialPos.x = Math.cos(initialAngle) * body.orbitRadiusVisual;
        initialPos.z = Math.sin(initialAngle) * body.orbitRadiusVisual;
      }
      meshGroup.position.copy(initialPos);
      scene.add(meshGroup);

      bodyBundlesRef.current.set(body.id, {
        body,
        meshGroup,
        surfaceMesh,
        cloudMesh,
        atmosphereGlowMesh,
        ringsMesh,
        orbitLine,
        orbitPoints: orbitPts,
        currentAngle: initialAngle,
        currentPosition: initialPos,
        velocity: new THREE.Vector3(),
        isDragged: false,
        isDestroyed: false,
        initialRadius: rad,
      });
    });

    // 14. Supernova Particle Mesh Pool
    const maxParticles = 1200;
    const expGeo = new THREE.BufferGeometry();
    const expPos = new Float32Array(maxParticles * 3);
    const expCols = new Float32Array(maxParticles * 3);
    expGeo.setAttribute('position', new THREE.BufferAttribute(expPos, 3));
    expGeo.setAttribute('color', new THREE.BufferAttribute(expCols, 3));

    const expMat = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const expMesh = new THREE.Points(expGeo, expMat);
    scene.add(expMesh);
    explosionMeshRef.current = expMesh;

    // 15. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 16. Mouse / Touch Events (Interactive Dragging & Asteroid Cannon)
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const isRight = 'button' in e && e.button === 2;
      prevPointerRef.current = { x: clientX, y: clientY };

      if (!container) return;
      const rect = container.getBoundingClientRect();
      _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);

      // Check for Asteroid Cannon Aiming Mode
      if (stateRef.current.interactionMode === 'asteroid_cannon' && !isRight) {
        _plane.set(new THREE.Vector3(0, 1, 0), 0);
        if (_raycaster.ray.intersectPlane(_plane, _planeIntersect)) {
          isAimingCannonRef.current = true;
          cannonStartPosRef.current.copy(_planeIntersect);
          cannonCurrentPosRef.current.copy(_planeIntersect);
          if (trajectoryLineRef.current) {
            trajectoryLineRef.current.visible = true;
          }
          return;
        }
      }

      // Check Raycast against Celestial Bodies for Direct Grab & Drag
      const intersects = _raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find((i) => {
        if (!i.object.userData?.isCelestialTarget) return false;
        const b = bodyBundlesRef.current.get(i.object.userData.bodyId);
        return b && b.meshGroup.visible && !b.isDestroyed;
      });

      if (hit && !isRight) {
        const bodyId = hit.object.userData.bodyId;
        const bundle = bodyBundlesRef.current.get(bodyId);
        if (bundle && !bundle.isDestroyed) {
          // Enter Body Drag Mode!
          cosmicAudio.playPickupSound();
          activeDraggedBundleRef.current = bundle;
          bundle.isDragged = true;
          setDraggedBodyName(bundle.body.nameVi);

          if (dragIndicatorMeshRef.current) {
            dragIndicatorMeshRef.current.visible = true;
            dragIndicatorMeshRef.current.scale.setScalar(bundle.body.visualRadius * 0.9);
          }
          container.style.cursor = 'grabbing';
          return;
        }
      }

      // Otherwise, standard camera rotation / panning
      isDraggingCameraRef.current = true;
      isRightDraggingCameraRef.current = isRight;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_mouse, camera);

      // 1. Handling Direct Celestial Dragging
      if (activeDraggedBundleRef.current) {
        const bundle = activeDraggedBundleRef.current;
        // Project onto orbital plane at height y
        _plane.set(new THREE.Vector3(0, 1, 0), -bundle.currentPosition.y);
        if (_raycaster.ray.intersectPlane(_plane, _planeIntersect)) {
          dragTargetPlanePosRef.current.copy(_planeIntersect);
          bundle.currentPosition.x = _planeIntersect.x;
          bundle.currentPosition.z = _planeIntersect.z;
          bundle.meshGroup.position.copy(bundle.currentPosition);

          if (dragIndicatorMeshRef.current) {
            dragIndicatorMeshRef.current.position.set(_planeIntersect.x, -0.2, _planeIntersect.z);
          }

          // Check real-time collision against other celestial bodies while dragging!
          bodyBundlesRef.current.forEach((otherBundle) => {
            if (otherBundle.body.id === bundle.body.id || otherBundle.isDestroyed) return;
            const dist = bundle.currentPosition.distanceTo(otherBundle.currentPosition);
            const colDist = (bundle.body.visualRadius + otherBundle.body.visualRadius) * 1.05;

            if (dist < colDist) {
              triggerPlanetaryCollision(bundle, otherBundle);
            }
          });
        }
        return;
      }

      // 2. Handling Asteroid Cannon Aiming
      if (isAimingCannonRef.current) {
        _plane.set(new THREE.Vector3(0, 1, 0), 0);
        if (_raycaster.ray.intersectPlane(_plane, _planeIntersect)) {
          cannonCurrentPosRef.current.copy(_planeIntersect);
          if (trajectoryLineRef.current) {
            const positions = trajectoryLineRef.current.geometry.attributes.position as THREE.BufferAttribute;
            positions.setXYZ(0, cannonStartPosRef.current.x, 0.5, cannonStartPosRef.current.z);
            positions.setXYZ(1, cannonCurrentPosRef.current.x, 0.5, cannonCurrentPosRef.current.z);
            positions.needsUpdate = true;
          }
        }
        return;
      }

      // 3. Hover indication when idle
      if (!isDraggingCameraRef.current) {
        const intersects = _raycaster.intersectObjects(scene.children, true);
        const hit = intersects.find((i) => {
          if (!i.object.userData?.isCelestialTarget) return false;
          const b = bodyBundlesRef.current.get(i.object.userData.bodyId);
          return b && b.meshGroup.visible && !b.isDestroyed;
        });
        if (hit) {
          container.style.cursor = 'grab';
        } else {
          container.style.cursor = 'default';
        }
        return;
      }

      // 4. Camera Orbiting / Panning
      const deltaX = clientX - prevPointerRef.current.x;
      const deltaY = clientY - prevPointerRef.current.y;
      prevPointerRef.current = { x: clientX, y: clientY };

      if (isRightDraggingCameraRef.current) {
        _vec3Cam.copy(camera.position).sub(cameraLookAtRef.current).normalize();
        const right = new THREE.Vector3().crossVectors(camera.up, _vec3Cam).normalize();
        panOffsetRef.current.addScaledVector(right, -deltaX * 0.15);
        panOffsetRef.current.addScaledVector(camera.up, deltaY * 0.15);
      } else {
        sphericalRef.current.theta -= deltaX * 0.006;
        sphericalRef.current.phi = Math.max(0.08, Math.min(Math.PI - 0.08, sphericalRef.current.phi - deltaY * 0.006));

        const r = camera.position.distanceTo(cameraLookAtRef.current);
        cameraTargetPosRef.current.set(
          cameraLookAtRef.current.x + r * Math.sin(sphericalRef.current.phi) * Math.sin(sphericalRef.current.theta),
          cameraLookAtRef.current.y + r * Math.cos(sphericalRef.current.phi),
          cameraLookAtRef.current.z + r * Math.sin(sphericalRef.current.phi) * Math.cos(sphericalRef.current.theta)
        );
      }
    };

    const handlePointerUp = () => {
      // Release Dragged Body
      if (activeDraggedBundleRef.current) {
        activeDraggedBundleRef.current.isDragged = false;
        // Recalculate new orbital radius from center
        const newR = Math.sqrt(
          activeDraggedBundleRef.current.currentPosition.x ** 2 +
          activeDraggedBundleRef.current.currentPosition.z ** 2
        );
        activeDraggedBundleRef.current.currentAngle = Math.atan2(
          activeDraggedBundleRef.current.currentPosition.z,
          activeDraggedBundleRef.current.currentPosition.x
        );
        activeDraggedBundleRef.current = null;
        setDraggedBodyName(null);

        if (dragIndicatorMeshRef.current) {
          dragIndicatorMeshRef.current.visible = false;
        }
      }

      // Release Asteroid Slingshot
      if (isAimingCannonRef.current) {
        isAimingCannonRef.current = false;
        if (trajectoryLineRef.current) trajectoryLineRef.current.visible = false;

        // Slingshot force vector (pull back to fire forward)
        const impulse = _vec3A.copy(cannonStartPosRef.current).sub(cannonCurrentPosRef.current).multiplyScalar(0.85);
        if (impulse.length() > 2) {
          cosmicAudio.playLaunchAsteroidSound();

          // Spawn high-speed meteoroid mesh
          const astMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.4, 1),
            new THREE.MeshStandardMaterial({
              color: 0xff4757,
              roughness: 0.8,
              emissive: 0xff3838,
              emissiveIntensity: 0.4,
            })
          );
          astMesh.position.copy(cannonStartPosRef.current);
          scene.add(astMesh);

          projectilesRef.current.push({
            mesh: astMesh,
            velocity: impulse,
            life: 0,
            maxLife: 8.0,
            tailParticles: [],
          });
        }
      }

      isDraggingCameraRef.current = false;
      isRightDraggingCameraRef.current = false;
      if (container) container.style.cursor = 'default';
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.12 : 0.89;
      const dir = _vec3A.copy(camera.position).sub(cameraLookAtRef.current);
      const newLen = Math.max(3.5, Math.min(2500, dir.length() * zoomFactor));
      dir.setLength(newLen);
      cameraTargetPosRef.current.copy(cameraLookAtRef.current).add(dir);
    };

    const handleClick = (e: MouseEvent) => {
      if (!container || activeDraggedBundleRef.current || isAimingCannonRef.current) return;
      const rect = container.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _raycaster.setFromCamera(_mouse, camera);
      const intersects = _raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find((i) => {
        if (!i.object.userData?.isCelestialTarget) return false;
        const b = bodyBundlesRef.current.get(i.object.userData.bodyId);
        return b && b.meshGroup.visible && !b.isDestroyed;
      });

      if (hit) {
        const bodyId = hit.object.userData.bodyId;
        const body = CELESTIAL_BODIES.find((b) => b.id === bodyId);
        if (body) {
          cosmicAudio.playSelectSound();
          onSelectBody(body);
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('touchstart', handlePointerDown);
    container.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    // 17. Main Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const state = stateRef.current;
      const speedMult = state.simSpeed;

      // 17a. Rotate & Orbit Celestial Bodies with Scale-Based Visibility
      bodyBundlesRef.current.forEach((bundle) => {
        if (bundle.isDestroyed) {
          bundle.meshGroup.visible = false;
          if (bundle.orbitLine) bundle.orbitLine.visible = false;
          return;
        }
        const b = bundle.body;

        // Determine whether this celestial body belongs in the current scale level
        let isVisible = false;
        switch (state.currentScale) {
          case 'earth_moon':
            isVisible = b.id === 'earth' || b.id === 'moon' || b.id === 'sun';
            break;
          case 'solar_system':
            // Sun and all Solar System bodies (planets, dwarf planets, moons, comets, asteroids)
            isVisible = b.scaleLevel === 'solar_system' || b.scaleLevel === 'earth_moon';
            break;
          case 'stellar_neighborhood':
            isVisible = b.scaleLevel === 'stellar_neighborhood' || b.id === 'sun';
            break;
          case 'milky_way':
            isVisible = b.scaleLevel === 'milky_way' || b.id === 'sun';
            break;
          case 'local_group':
            isVisible = b.scaleLevel === 'local_group' || b.scaleLevel === 'milky_way';
            break;
          case 'observable_universe':
            isVisible = b.scaleLevel === 'observable_universe';
            break;
        }

        // Always show the specifically selected body
        if (state.selectedBody && state.selectedBody.id === b.id) {
          isVisible = true;
        }

        bundle.meshGroup.visible = isVisible;
        if (!isVisible) {
          if (bundle.orbitLine) bundle.orbitLine.visible = false;
          return;
        }

        if (bundle.surfaceMesh) {
          bundle.surfaceMesh.rotation.y += b.rotationSpeed * speedMult * 0.4;
        }
        if (bundle.cloudMesh) {
          bundle.cloudMesh.rotation.y += (b.rotationSpeed * 1.25) * speedMult * 0.4;
        }

        // Orbit if not currently dragged by user
        if (b.orbitRadiusVisual > 0 && speedMult > 0 && !bundle.isDragged) {
          const r = state.scaleMode === 'scientific' ? b.orbitRadiusScientific : b.orbitRadiusVisual;
          bundle.currentAngle += b.orbitSpeed * speedMult * delta * 0.8;
          const inc = THREE.MathUtils.degToRad(b.orbitInclinationDeg);

          if (b.parentBodyId && b.parentBodyId !== 'sun') {
            const parentBundle = bodyBundlesRef.current.get(b.parentBodyId);
            if (parentBundle) {
              const localX = Math.cos(bundle.currentAngle) * r;
              const localZ = Math.sin(bundle.currentAngle) * r;
              const localY = Math.sin(bundle.currentAngle) * Math.sin(inc) * (r * 0.2);
              bundle.currentPosition.set(
                parentBundle.currentPosition.x + localX,
                parentBundle.currentPosition.y + localY,
                parentBundle.currentPosition.z + localZ
              );
            }
          } else {
            bundle.currentPosition.x = Math.cos(bundle.currentAngle) * r;
            bundle.currentPosition.z = Math.sin(bundle.currentAngle) * r;
            bundle.currentPosition.y = Math.sin(bundle.currentAngle) * Math.sin(inc) * (r * 0.2);
          }

          bundle.meshGroup.position.copy(bundle.currentPosition);
        }

        if (bundle.orbitLine) {
          bundle.orbitLine.visible = state.showOrbits && bundle.meshGroup.visible && !bundle.isDestroyed && bundle.body.orbitRadiusVisual > 0;
        }

        if (bundle.surfaceMesh) {
          const currentRad = state.scaleMode === 'scientific' ? b.scientificRadius : b.visualRadius;
          const currentScale = currentRad / b.visualRadius;
          bundle.surfaceMesh.scale.setScalar(currentScale);
        }
      });

      // 17b. Animate Spacetime Gravity Well Distortion
      if (gravityGridMeshRef.current) {
        const gwGeo = gravityGridMeshRef.current.geometry as THREE.PlaneGeometry;
        const posAttr = gwGeo.attributes.position as THREE.BufferAttribute;
        const isGwActive = state.interactionMode === 'gravity_well';
        gravityGridMeshRef.current.visible = isGwActive;

        if (isGwActive) {
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i); // corresponds to world z
            let depth = 0;

            bodyBundlesRef.current.forEach((bundle) => {
              if (bundle.isDestroyed) return;
              const dx = x - bundle.currentPosition.x;
              const dz = -y - bundle.currentPosition.z;
              const d2 = dx * dx + dz * dz + 12;
              const massFactor = bundle.body.type === 'star' ? 140 : bundle.body.visualRadius * 12;
              depth -= massFactor / Math.sqrt(d2);
            });

            posAttr.setZ(i, depth * 0.2);
          }
          posAttr.needsUpdate = true;
          gwGeo.computeVertexNormals();
        }
      }

      // 17c. Update Asteroid Projectiles (Collisions & Trajectories)
      if (projectilesRef.current.length > 0) {
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
          const p = projectilesRef.current[i];
          p.life += delta;
          p.mesh.position.addScaledVector(p.velocity, delta);

          // Gravitational attraction from Sun
          const sunDist = p.mesh.position.length();
          if (sunDist > 1) {
            const sunGrav = _vec3A.copy(p.mesh.position).normalize().multiplyScalar(-60 / (sunDist + 5));
            p.velocity.addScaledVector(sunGrav, delta);
          }

          // Check collision with planets or stars!
          let collided = false;
          bodyBundlesRef.current.forEach((bundle) => {
            if (bundle.isDestroyed || collided) return;
            const dist = p.mesh.position.distanceTo(bundle.currentPosition);
            if (dist < bundle.body.visualRadius * 1.1 + 1.2) {
              collided = true;
              cosmicAudio.playCollisionSound(0.9);
              spawnShockwave(p.mesh.position, '#ff5252', 25);

              // Spawn impact flash debris
              for (let d = 0; d < 120; d++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const spd = Math.random() * 30 + 5;
                explosionsRef.current.push({
                  position: p.mesh.position.clone(),
                  velocity: new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * spd,
                    Math.sin(phi) * Math.sin(theta) * spd,
                    Math.cos(phi) * spd
                  ),
                  color: new THREE.Color('#ff7675'),
                  size: Math.random() * 2.5 + 1,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 1.4,
                });
              }

              onCollision({
                id: `${Date.now()}-${Math.random()}`,
                body1Name: 'Thiên thạch (Asteroid)',
                body2Name: bundle.body.nameVi,
                energyJoules: `${(Math.random() * 5 + 1.2).toFixed(2)} × 10²⁴ Joules (Tương đương 10,000 quả bom H)`,
                consequenceVi: `Thiên thạch va chạm tạo hố va chạm khổng lồ trên bề mặt ${bundle.body.nameVi}!`,
                timestamp: new Date().toLocaleTimeString(),
              });
            }
          });

          // Asteroid Belt scatter interactions: when projectile flies through belt
          const distFromCenter = Math.sqrt(p.mesh.position.x ** 2 + p.mesh.position.z ** 2);
          if (distFromCenter > 48 && distFromCenter < 58 && Math.abs(p.mesh.position.y) < 3) {
            if (Math.random() > 0.6) {
              explosionsRef.current.push({
                position: p.mesh.position.clone(),
                velocity: new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 5, (Math.random() - 0.5) * 8),
                color: new THREE.Color('#ffeaa7'),
                size: 2,
                alpha: 1,
                life: 0,
                maxLife: 0.6,
              });
            }
          }

          if (collided || p.life >= p.maxLife || p.mesh.position.length() > 500) {
            scene.remove(p.mesh);
            projectilesRef.current.splice(i, 1);
          }
        }
      }

      // 17d. Animate Expanding Shockwave Rings
      if (shockwavesRef.current.length > 0) {
        for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
          const sw = shockwavesRef.current[i];
          sw.currentRadius += sw.speed * delta;
          const scale = sw.currentRadius;
          sw.mesh.scale.set(scale, scale, 1);

          const mat = sw.mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, 1 - sw.currentRadius / sw.maxRadius);

          if (sw.currentRadius >= sw.maxRadius) {
            scene.remove(sw.mesh);
            shockwavesRef.current.splice(i, 1);
          }
        }
      }

      // 17e. Animate Explosions & Debris
      if (explosionsRef.current.length > 0 && explosionMeshRef.current) {
        const positions = explosionMeshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const colors = explosionMeshRef.current.geometry.attributes.color as THREE.BufferAttribute;

        let activeCount = 0;
        for (let i = 0; i < explosionsRef.current.length; i++) {
          const p = explosionsRef.current[i];
          p.life += delta;
          if (p.life < p.maxLife) {
            p.position.addScaledVector(p.velocity, delta);
            p.velocity.multiplyScalar(0.975);
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);

            positions.setXYZ(activeCount, p.position.x, p.position.y, p.position.z);
            _colorA.copy(p.color).multiplyScalar(p.alpha);
            colors.setXYZ(activeCount, _colorA.r, _colorA.g, _colorA.b);
            activeCount++;
          }
        }

        positions.needsUpdate = true;
        colors.needsUpdate = true;
        explosionMeshRef.current.geometry.setDrawRange(0, activeCount);
        explosionsRef.current = explosionsRef.current.filter((p) => p.life < p.maxLife);
      }

      // 17f. Deep Space & Asteroid Belt rotation
      milkyWayGroup.rotation.y += 0.0004 * (speedMult > 0 ? 1 : 0.2);
      milkyWayGroup.visible = state.currentScale === 'milky_way' || state.currentScale === 'local_group';

      cosmicWebGroup.rotation.y += 0.0002;
      cosmicWebGroup.visible = state.currentScale === 'observable_universe';

      asteroidGroup.rotation.y += 0.001 * speedMult;
      asteroidGroup.visible = state.showAsteroidBelt && state.currentScale === 'solar_system';

      habRingMesh.visible = state.showHabitableZone && state.currentScale === 'solar_system';
      gridHelper.visible = state.showGrid;

      // 17g. Camera Flight Damping
      if (state.selectedBody && !activeDraggedBundleRef.current) {
        const activeBundle = bodyBundlesRef.current.get(state.selectedBody.id);
        if (activeBundle && !activeBundle.isDestroyed) {
          cameraLookAtRef.current.copy(activeBundle.currentPosition);
          const offsetDist = state.selectedBody.camDistance * (state.scaleMode === 'scientific' ? 0.9 : 1.0);
          cameraTargetPosRef.current.set(
            activeBundle.currentPosition.x + offsetDist * 0.7,
            activeBundle.currentPosition.y + offsetDist * 0.45,
            activeBundle.currentPosition.z + offsetDist * 0.75
          );
        }
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraTargetPosRef.current.x + panOffsetRef.current.x, 3.8, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraTargetPosRef.current.y + panOffsetRef.current.y, 3.8, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraTargetPosRef.current.z + panOffsetRef.current.z, 3.8, delta);

      cameraCurrentLookAtRef.current.x = THREE.MathUtils.damp(cameraCurrentLookAtRef.current.x, cameraLookAtRef.current.x, 4.2, delta);
      cameraCurrentLookAtRef.current.y = THREE.MathUtils.damp(cameraCurrentLookAtRef.current.y, cameraLookAtRef.current.y, 4.2, delta);
      cameraCurrentLookAtRef.current.z = THREE.MathUtils.damp(cameraCurrentLookAtRef.current.z, cameraLookAtRef.current.z, 4.2, delta);

      camera.lookAt(cameraCurrentLookAtRef.current);

      // 17h. 2D Projected Labels
      if (state.showLabels && container) {
        const labels: Array<{ id: string; name: string; x: number; y: number; visible: boolean; isSelected: boolean }> = [];
        bodyBundlesRef.current.forEach((bundle) => {
          if (bundle.isDestroyed || !bundle.meshGroup.visible) return;
          if (bundle.body.id === 'milky_way' || bundle.body.id === 'observable_universe') return;

          _vec3A.copy(bundle.currentPosition);
          _vec3A.project(camera);

          const isBehind = _vec3A.z > 1;
          const screenX = (_vec3A.x * 0.5 + 0.5) * container.clientWidth;
          const screenY = (-(_vec3A.y * 0.5) + 0.5) * container.clientHeight;

          labels.push({
            id: bundle.body.id,
            name: bundle.body.nameVi,
            x: screenX,
            y: screenY,
            visible: !isBehind && screenX > 20 && screenX < container.clientWidth - 20 && screenY > 20 && screenY < container.clientHeight - 20,
            isSelected: state.selectedBody?.id === bundle.body.id,
          });
        });
        setScreenLabels(labels);
      } else {
        setScreenLabels([]);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('touchstart', handlePointerDown);
      container.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Dragging Status Indicator */}
      {draggedBodyName && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono shadow-2xl backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Đang giữ & di chuyển thiên thể: <strong className="text-white">{draggedBodyName}</strong> (Kéo vào hành tinh khác để tạo vụ nổ va chạm!)</span>
        </div>
      )}

      {/* 2D Interactive Celestial Labels */}
      {showLabels &&
        screenLabels.map((lbl) => {
          if (!lbl.visible) return null;
          return (
            <div
              key={lbl.id}
              onClick={() => {
                const target = CELESTIAL_BODIES.find((b) => b.id === lbl.id);
                if (target) {
                  cosmicAudio.playSelectSound();
                  onSelectBody(target);
                }
              }}
              style={{
                transform: `translate(${lbl.x}px, ${lbl.y}px) translate(-50%, -100%)`,
              }}
              className={`absolute top-0 left-0 pointer-events-auto px-2 py-0.5 rounded text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer shadow-lg backdrop-blur-xs flex items-center gap-1.5 ${
                lbl.isSelected
                  ? 'bg-cyan-500/80 text-white border border-cyan-300 shadow-cyan-500/50 scale-110 z-20'
                  : 'bg-slate-950/80 text-slate-300 border border-slate-700/60 hover:border-cyan-400 hover:text-cyan-200 hover:bg-slate-900/90 z-10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${lbl.isSelected ? 'bg-white' : 'bg-cyan-400'}`} />
              <span>{lbl.name}</span>
            </div>
          );
        })}
    </div>
  );
};
