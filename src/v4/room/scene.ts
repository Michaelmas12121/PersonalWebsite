// This entire module stays behind the capability-gated dynamic import.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import modelUrl from "../../assets/room/desk-room.glb?url";
import { type TargetName } from "./layout";
import { VIEWS } from "./views";

export interface PortalFrame { top: number; right: number; bottom: number; left: number }
export interface RoomHandle {
  goTo(viewName: TargetName): void;
  back(): void;
  current(): string;
  dispose(): void;
}
export interface RoomOptions {
  canvas: HTMLCanvasElement;
  initialView?: string;
  onArrive?: (viewName: string) => void;
  onHover?: (target: TargetName | null) => void;
  onLeave?: () => void;
  onPortalFrame?: (viewName: string, frame: PortalFrame) => void;
}

const ease = (t: number) => t * t * (3 - 2 * t);
type ViewName = keyof typeof VIEWS;

export async function createRoom(options: RoomOptions): Promise<RoomHandle> {
  // Do not replace the usable poster until the model has actually loaded.
  const gltf = await new GLTFLoader().loadAsync(modelUrl);
  const { canvas } = options;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (error) {
    disposeModel(gltf.scene);
    throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcbd6d8);
  scene.fog = new THREE.Fog(0xcbd6d8, 100, 680);
  scene.add(gltf.scene);
  scene.add(new THREE.HemisphereLight(0xd5e8f3, 0x8b6c4e, 2.3));
  const sunlight = new THREE.DirectionalLight(0xffe1b2, 3.5);
  sunlight.position.set(3, 5, -4);
  sunlight.target.position.set(0, 0.75, 0);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.1, far: 15 });
  sunlight.shadow.normalBias = 0.015;
  sunlight.shadow.bias = -0.00015;
  scene.add(sunlight, sunlight.target);
  const fill = new THREE.DirectionalLight(0xd9e8f5, 0.7);
  fill.position.set(-3, 3, 2);
  scene.add(fill);
  const lamp = new THREE.PointLight(0xffcf86, 0.8, 1.6, 2);
  lamp.position.set(0.82, 1.13, -0.26);
  scene.add(lamp);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.02, 1500);
  const cameraTarget = new THREE.Vector3();
  const pickable: THREE.Mesh[] = [];
  const portals = new Map<TargetName, THREE.Object3D>();
  const outlines = new Map<TargetName, THREE.LineBasicMaterial>();
  const white = new THREE.Color(0xffefc7);
  const charcoal = new THREE.Color(0x3d3932);
  const feedback: {
    mesh: THREE.Mesh; target: TargetName; amount: number;
    position: THREE.Vector3; corners?: Float32Array;
    glow?: THREE.MeshStandardMaterial; glowBase?: number;
  }[] = [];
  gltf.scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const mesh = object as THREE.Mesh;
    mesh.castShadow = !mesh.userData.backdrop;
    mesh.receiveShadow = !mesh.userData.backdrop;
    if (!mesh.userData.backdrop) pickable.push(mesh);
    const target = mesh.userData.target as TargetName | undefined;
    if (mesh.userData.portal) portals.set(mesh.userData.portal, mesh);
    const paper = mesh.name === 'notebook' || mesh.name.startsWith('polaroid_') || mesh.name.startsWith('wall_clip_');
    if (target && paper) {
      mesh.geometry = mesh.geometry.clone();
      feedback.push({ mesh, target, amount: 0, position: mesh.position.clone(), corners: new Float32Array(mesh.geometry.attributes.position.array) });
    }
    if (target && (mesh.name === 'mon_screen' || mesh.name.startsWith('tr_cup_'))) {
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      mesh.material = material;
      material.emissive.set(0xe3d8b7);
      material.emissiveMap = material.map;
      material.emissiveIntensity = 0.03;
      feedback.push({ mesh, target, amount: 0, position: mesh.position.clone(), glow: material, glowBase: 0.03 });
    }
    // Restrained silhouettes retain the reference's illustrated character.
    if (!paper && !mesh.userData.backdrop && !mesh.name.includes('caps') && mesh.geometry.attributes.position.count < 2500) {
      let ink = target ? outlines.get(target) : undefined;
      if (!ink) {
        ink = new THREE.LineBasicMaterial({ color: charcoal, transparent: true, opacity: 0.18, depthWrite: false });
        if (target) outlines.set(target, ink);
      }
      const edges = new THREE.EdgesGeometry(mesh.geometry, 40);
      mesh.add(new THREE.LineSegments(edges, ink));
    }
  });
  scene.updateMatrixWorld(true);

  let currentView: ViewName = options.initialView && Object.hasOwn(VIEWS, options.initialView)
    ? options.initialView as ViewName : 'wide';
  camera.position.set(...VIEWS[currentView].position);
  cameraTarget.set(...VIEWS[currentView].target);
  camera.lookAt(cameraTarget);
  let hoveredTarget: TargetName | null = null;
  let disposed = false;
  let frame = 0;
  let feedbackFrame = 0;
  let motion: {
    fromPosition: THREE.Vector3; toPosition: THREE.Vector3;
    fromTarget: THREE.Vector3; toTarget: THREE.Vector3;
    startedAt: number; duration: number; destination: ViewName;
  } | null = null;

  function draw() {
    if (disposed) return;
    renderer.render(scene, camera);
    renderer.shadowMap.autoUpdate = false;
  }
  function projectPortalFrame(target: TargetName) {
    const anchor = portals.get(target);
    if (!anchor) return;
    const box = new THREE.Box3().setFromObject(anchor);
    const bounds = canvas.getBoundingClientRect();
    const points: THREE.Vector3[] = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) points.push(new THREE.Vector3(x, y, z).project(camera));
    const xs = points.map(p => bounds.left + (p.x + 1) * bounds.width / 2);
    const ys = points.map(p => bounds.top + (1 - p.y) * bounds.height / 2);
    options.onPortalFrame?.(target, {
      top: Math.max(0, Math.min(...ys)), right: Math.max(0, window.innerWidth - Math.max(...xs)),
      bottom: Math.max(0, window.innerHeight - Math.max(...ys)), left: Math.max(0, Math.min(...xs)),
    });
  }
  function animateFeedback(target: TargetName | null, immediate = false) {
    cancelAnimationFrame(feedbackFrame);
    const starts = feedback.map(item => item.amount);
    const startedAt = performance.now();
    const tick = (now: number) => {
      if (disposed) return;
      const t = immediate ? 1 : Math.min((now - startedAt) / 280, 1);
      feedback.forEach((item, index) => {
        item.amount = THREE.MathUtils.lerp(starts[index], item.target === target ? 1 : 0, ease(t));
        if (item.corners) {
          const vertices = item.mesh.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < vertices.count; i++) {
            const x = item.corners[i * 3], y = item.corners[i * 3 + 1];
            const corner = x > 0 && y < 0 ? 1 : 0;
            vertices.setZ(i, item.corners[i * 3 + 2] + corner * item.amount * 0.012);
          }
          vertices.needsUpdate = true;
          item.mesh.geometry.computeVertexNormals();
          if (item.mesh.name.startsWith('polaroid_')) item.mesh.position.y = item.position.y + item.amount * 0.008;
        }
        if (item.glow) item.glow.emissiveIntensity = item.glowBase! + item.amount * (item.target === 'monitor' ? 0.24 : 0.09);
      });
      renderer.shadowMap.needsUpdate = true;
      draw();
      if (t < 1) feedbackFrame = requestAnimationFrame(tick);
    };
    tick(startedAt);
  }
  function highlight(target: TargetName | null, immediate = false) {
    hoveredTarget = target;
    for (const [name, material] of outlines) {
      material.color.copy(name === target ? white : charcoal);
      material.opacity = name === target ? 0.9 : 0.18;
    }
    options.onHover?.(target);
    canvas.style.cursor = target ? 'pointer' : 'default';
    animateFeedback(target, immediate);
  }
  function animate(now: number) {
    if (disposed || !motion) return;
    const t = Math.min((now - motion.startedAt) / motion.duration, 1);
    const amount = ease(t);
    camera.position.lerpVectors(motion.fromPosition, motion.toPosition, amount);
    cameraTarget.lerpVectors(motion.fromTarget, motion.toTarget, amount);
    camera.lookAt(cameraTarget);
    draw();
    if (t < 1) {
      frame = requestAnimationFrame(animate);
    } else {
      currentView = motion.destination;
      motion = null;
      if (currentView !== 'wide') projectPortalFrame(currentView);
      options.onArrive?.(currentView);
    }
  }
  function goTo(destination: ViewName) {
    if (disposed || motion || currentView === destination) return;
    highlight(null, true);
    options.onLeave?.();
    motion = {
      fromPosition: camera.position.clone(), toPosition: new THREE.Vector3(...VIEWS[destination].position),
      fromTarget: cameraTarget.clone(), toTarget: new THREE.Vector3(...VIEWS[destination].target),
      startedAt: performance.now(), duration: destination === 'wide' ? 1000 : 1100, destination,
    };
    frame = requestAnimationFrame(animate);
  }
  const raycaster = new THREE.Raycaster();
  function pick(event: MouseEvent): TargetName | null {
    if (currentView !== 'wide' || motion) return null;
    const bounds = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2), camera);
    // All room meshes participate so targets cannot be clicked through furniture.
    const hit = raycaster.intersectObjects(pickable, false)[0];
    return hit?.object.userData.target ?? null;
  }
  function pointerMove(event: PointerEvent) {
    const target = pick(event);
    if (target !== hoveredTarget) highlight(target);
  }
  function pointerLeave() { highlight(null); }
  function click(event: MouseEvent) { const target = pick(event); if (target) goTo(target); }
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.setFocalLength(23);
    camera.updateProjectionMatrix();
    draw();
    if (currentView !== 'wide' && !motion) projectPortalFrame(currentView);
  }
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('click', click);
  window.addEventListener('resize', resize);
  resize();
  if (currentView !== 'wide') queueMicrotask(() => {
    if (disposed) return;
    projectPortalFrame(currentView as TargetName);
    options.onArrive?.(currentView);
  });
  return {
    goTo, back() { goTo('wide'); }, current() { return currentView; },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(feedbackFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('click', click);
      disposeModel(gltf.scene);
      sunlight.shadow.dispose();
      renderer.dispose();
    },
  };
}

function disposeModel(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  const materials = new Set<THREE.Material>();
  const geometries = new Set<THREE.BufferGeometry>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  textures.forEach(texture => { texture.dispose(); if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) texture.image.close(); });
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
}
