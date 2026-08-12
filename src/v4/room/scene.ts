import * as THREE from "three";
import {
  MONO,
  ROOM,
  ROOM_COLOURS,
  TARGET_PALETTES,
  type ColourRole,
  type TargetName,
} from "./layout";
import { VIEWS } from "./views";

export interface PortalFrame {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

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
  onHover?: (label: string | null) => void;
  onLeave?: () => void;
  onPortalFrame?: (viewName: string, frame: PortalFrame) => void;
}

interface PaintedSurface {
  material: THREE.MeshBasicMaterial;
  mono: THREE.Color;
  room: THREE.Color;
  position: THREE.Vector3;
  target?: TargetName;
  amount: number;
}

const LABELS: Record<TargetName, string> = {
  figure: "Who am I — the figure",
  monitor: "Continue — the desk display",
  mac: "What I've done — the Mac on the bed",
  achievements: "Achievements — the display shelf",
  window: "Gallery — the window",
};

const EASE = (value: number) =>
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

const CAMERA_DURATIONS: Record<"wide" | TargetName, number> = {
  wide: 1220,
  figure: 1180,
  monitor: 1580,
  mac: 1500,
  achievements: 1180,
  window: 1640,
};

export function createRoom(options: RoomOptions): RoomHandle {
  const { canvas } = options;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const monoBackground = new THREE.Color(MONO.void);
  const roomBackground = new THREE.Color(ROOM_COLOURS.void);
  scene.background = monoBackground.clone();
  const camera = new THREE.PerspectiveCamera(51, 1, 0.1, 30);
  const cameraTarget = new THREE.Vector3();
  const clock = new THREE.Clock();

  const painted: PaintedSurface[] = [];
  const pickable: THREE.Mesh[] = [];
  const outlines = new Map<TargetName, THREE.LineBasicMaterial[]>();
  const portalAnchors = new Map<TargetName, THREE.Object3D>();
  let activeTarget: TargetName | null = null;
  let hoveredTarget: TargetName | null = null;

  function roomColour(mono: number, target: TargetName | undefined, role: ColourRole) {
    if (target) return TARGET_PALETTES[target][role];
    if (mono === MONO.paper) return ROOM_COLOURS.ivory;
    if (mono === MONO.paperShade) return ROOM_COLOURS.ivoryShade;
    if (mono === MONO.graphiteWash) return ROOM_COLOURS.fabric;
    if (mono === MONO.ink) return ROOM_COLOURS.graphite;
    if (mono === MONO.graphite) return ROOM_COLOURS.graphiteSoft;
    return mono;
  }

  function materialFor(
    mono = MONO.paper,
    target?: TargetName,
    role: ColourRole = "primary",
    position: [number, number, number] = [0, 0, 0],
    roomOverride?: number,
  ) {
    const material = new THREE.MeshBasicMaterial({
      color: mono,
      toneMapped: false,
    });
    painted.push({
      material,
      mono: new THREE.Color(mono),
      room: new THREE.Color(roomOverride ?? roomColour(mono, target, role)),
      position: new THREE.Vector3(...position),
      target,
      amount: 0,
    });
    return material;
  }

  function registerTarget(mesh: THREE.Mesh, target: TargetName) {
    mesh.userData.target = target;
    mesh.userData.label = LABELS[target];
    pickable.push(mesh);
  }

  function addSketchEdges(mesh: THREE.Mesh, target?: TargetName, opacity = 0.6) {
    const geometry = new THREE.EdgesGeometry(mesh.geometry, 18);
    const mainMaterial = new THREE.LineBasicMaterial({
      color: MONO.ink,
      transparent: true,
      opacity,
      toneMapped: false,
    });
    const main = new THREE.LineSegments(geometry, mainMaterial);
    mesh.add(main);

    const graphiteMaterial = new THREE.LineBasicMaterial({
      color: MONO.graphite,
      transparent: true,
      opacity: opacity * 0.22,
      toneMapped: false,
    });
    const graphite = new THREE.LineSegments(geometry, graphiteMaterial);
    graphite.position.set(0.004, -0.003, 0.005);
    graphite.scale.setScalar(1.006);
    mesh.add(graphite);

    if (target) {
      const materials = outlines.get(target) ?? [];
      materials.push(mainMaterial, graphiteMaterial);
      outlines.set(target, materials);
    }
  }

  interface BoxOptions {
    mono?: number;
    target?: TargetName;
    role?: ColourRole;
    room?: number;
    rotation?: [number, number, number];
    outlineOpacity?: number;
  }

  function addBox(
    size: [number, number, number],
    position: [number, number, number],
    boxOptions: BoxOptions = {},
  ) {
    const geometry = new THREE.BoxGeometry(...size);
    const mesh = new THREE.Mesh(
      geometry,
      materialFor(
        boxOptions.mono ?? MONO.paper,
        boxOptions.target,
        boxOptions.role,
        position,
        boxOptions.room,
      ),
    );
    mesh.position.set(...position);
    if (boxOptions.rotation) mesh.rotation.set(...boxOptions.rotation);
    addSketchEdges(mesh, boxOptions.target, boxOptions.outlineOpacity);
    if (boxOptions.target) registerTarget(mesh, boxOptions.target);
    scene.add(mesh);
    return mesh;
  }

  function addPlane(
    size: [number, number],
    position: [number, number, number],
    rotation: [number, number, number],
    planeOptions: BoxOptions = {},
  ) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(...size),
      materialFor(
        planeOptions.mono ?? MONO.paper,
        planeOptions.target,
        planeOptions.role,
        position,
        planeOptions.room,
      ),
    );
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    addSketchEdges(mesh, planeOptions.target, planeOptions.outlineOpacity);
    if (planeOptions.target) registerTarget(mesh, planeOptions.target);
    scene.add(mesh);
    return mesh;
  }

  interface FacetedOptions extends BoxOptions {
    scale?: [number, number, number];
  }

  function addFaceted(
    geometry: THREE.BufferGeometry,
    position: [number, number, number],
    facetedOptions: FacetedOptions = {},
  ) {
    const mesh = new THREE.Mesh(
      geometry,
      materialFor(
        facetedOptions.mono ?? MONO.paper,
        facetedOptions.target,
        facetedOptions.role,
        position,
        facetedOptions.room,
      ),
    );
    mesh.position.set(...position);
    if (facetedOptions.rotation) mesh.rotation.set(...facetedOptions.rotation);
    if (facetedOptions.scale) mesh.scale.set(...facetedOptions.scale);
    addSketchEdges(mesh, facetedOptions.target, facetedOptions.outlineOpacity);
    if (facetedOptions.target) registerTarget(mesh, facetedOptions.target);
    scene.add(mesh);
    return mesh;
  }

  function addAvatarLimb(
    start: [number, number, number],
    end: [number, number, number],
    radius: number,
    limbOptions: FacetedOptions = {},
  ) {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    const mesh = addFaceted(
      new THREE.CylinderGeometry(radius * 0.88, radius, direction.length(), 6),
      from.clone().add(to).multiplyScalar(0.5).toArray() as [number, number, number],
      limbOptions,
    );
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    return mesh;
  }

  function addSoftShadow(x: number, z: number, width: number, depth: number) {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 36),
      new THREE.MeshBasicMaterial({
        color: MONO.shadow,
        transparent: true,
        opacity: 0.055,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    shadow.scale.set(width, depth, 1);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.008, z);
    scene.add(shadow);
  }

  const midZ = (ROOM.zBack + ROOM.zFront) / 2;
  addPlane([ROOM.width, ROOM.depth], [0, 0, midZ], [-Math.PI / 2, 0, 0], {
    mono: MONO.paperShade,
    room: ROOM_COLOURS.ivoryShade,
    outlineOpacity: 0.3,
  });
  addPlane([ROOM.width, ROOM.height], [0, ROOM.height / 2, ROOM.zBack], [0, 0, 0], {
    mono: MONO.paper,
    outlineOpacity: 0.24,
  });
  addPlane([ROOM.depth, ROOM.height], [-ROOM.width / 2, ROOM.height / 2, midZ], [0, Math.PI / 2, 0], {
    mono: MONO.paper,
    outlineOpacity: 0.24,
  });
  addPlane([ROOM.depth, ROOM.height], [ROOM.width / 2, ROOM.height / 2, midZ], [0, -Math.PI / 2, 0], {
    mono: MONO.paper,
    outlineOpacity: 0.24,
  });

  // Slightly wandering floor seams preserve the perspective without looking
  // like a CAD grid.
  for (let index = 0; index < 7; index += 1) {
    const x = -1.45 + index * 0.48;
    const points: THREE.Vector3[] = [];
    for (let step = 0; step <= 18; step += 1) {
      const ratio = step / 18;
      points.push(
        new THREE.Vector3(
          x + Math.sin(step * 1.7 + index) * 0.006,
          0.012,
          ROOM.zFront - ratio * ROOM.depth,
        ),
      );
    }
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: MONO.graphite,
          transparent: true,
          opacity: 0.12,
          toneMapped: false,
        }),
      ),
    );
  }

  // Window and deep sill.
  const windowPortal = addPlane([2.22, 1.42], [0, 1.54, ROOM.zBack + 0.012], [0, 0, 0], {
    mono: MONO.paperShade,
    target: "window",
    role: "secondary",
    outlineOpacity: 0.7,
  });
  portalAnchors.set("window", windowPortal);
  addBox([0.045, 1.42, 0.06], [0, 1.54, ROOM.zBack + 0.045], {
    target: "window",
    role: "primary",
  });
  addBox([2.22, 0.045, 0.06], [0, 1.54, ROOM.zBack + 0.045], {
    target: "window",
    role: "primary",
  });
  addBox([2.52, 0.09, 0.4], [0, 0.78, ROOM.zBack + 0.2], {
    target: "window",
    role: "accent",
    outlineOpacity: 0.58,
  });
  addBox([0.09, 1.56, 0.1], [-1.16, 1.54, ROOM.zBack + 0.05], {
    target: "window",
    role: "primary",
  });
  addBox([0.09, 1.56, 0.1], [1.16, 1.54, ROOM.zBack + 0.05], {
    target: "window",
    role: "primary",
  });

  // Long desk and the single cabinet mounted above it.
  addBox([0.66, 0.06, 3.08], [-1.36, 0.74, -1.72], {
    mono: MONO.paperShade,
    room: ROOM_COLOURS.oak,
    outlineOpacity: 0.62,
  });
  addBox([0.055, 0.7, 0.055], [-1.08, 0.36, -3.12], {
    room: ROOM_COLOURS.oak,
    outlineOpacity: 0.42,
  });
  addBox([0.055, 0.7, 0.055], [-1.08, 0.36, -0.34], {
    room: ROOM_COLOURS.oak,
    outlineOpacity: 0.42,
  });
  addBox([0.43, 0.64, 1.72], [-1.47, 2.06, -2.38], {
    mono: MONO.paperShade,
    outlineOpacity: 0.58,
  });
  addBox([0.025, 0.56, 0.025], [-1.245, 2.06, -2.38], { outlineOpacity: 0.26 });

  // Desktop display: one screen and its integrated stand, with no accessories.
  addBox([0.055, 0.5, 0.88], [-1.03, 1.14, -1.95], {
    target: "monitor",
    role: "primary",
    rotation: [0, -0.4, 0],
    outlineOpacity: 0.78,
  });
  const monitorPortal = addPlane([0.8, 0.42], [-1.008, 1.14, -1.94], [0, Math.PI / 2 - 0.4, 0], {
    target: "monitor",
    role: "secondary",
    outlineOpacity: 0.2,
  });
  portalAnchors.set("monitor", monitorPortal);
  addBox([0.045, 0.24, 0.045], [-1.03, 0.84, -1.95], {
    target: "monitor",
    role: "accent",
    rotation: [0, -0.4, 0],
    outlineOpacity: 0.5,
  });
  addBox([0.16, 0.025, 0.28], [-1.03, 0.725, -1.95], {
    target: "monitor",
    role: "accent",
    rotation: [0, -0.4, 0],
    outlineOpacity: 0.5,
  });
  const monitorHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.8, 1.12),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  monitorHit.position.set(-0.96, 1.06, -1.95);
  monitorHit.rotation.y = -0.4;
  registerTarget(monitorHit, "monitor");
  scene.add(monitorHit);

  // Bed, minimal pillow, and the single cabinet above the bed.
  addBox([1.02, 0.25, 2.64], [1.12, 0.16, -1.72], {
    mono: MONO.paperShade,
    room: ROOM_COLOURS.oak,
    outlineOpacity: 0.64,
  });
  addBox([0.96, 0.18, 2.54], [1.12, 0.37, -1.72], {
    mono: MONO.paper,
    room: ROOM_COLOURS.fabric,
    outlineOpacity: 0.42,
  });
  addBox([0.68, 0.14, 0.4], [1.12, 0.54, -2.82], {
    mono: MONO.paperShade,
    room: ROOM_COLOURS.fabric,
    rotation: [0.03, -0.08, 0.02],
    outlineOpacity: 0.42,
  });
  addBox([0.43, 0.66, 1.96], [1.47, 2.06, -2.28], {
    mono: MONO.paperShade,
    outlineOpacity: 0.58,
  });
  addBox([0.025, 0.58, 0.025], [1.245, 2.06, -2.28], { outlineOpacity: 0.24 });

  // The open Mac on the bed. The screen stays blank in monochrome and receives
  // the approved three-colour wash only after its content panel opens.
  addBox([0.58, 0.035, 0.4], [1.06, 0.57, -1.23], {
    target: "mac",
    role: "accent",
    rotation: [0, -0.08, 0],
    outlineOpacity: 0.72,
  });
  addBox([0.58, 0.38, 0.025], [1.08, 0.77, -1.41], {
    target: "mac",
    role: "primary",
    rotation: [-0.08, -0.08, 0],
    outlineOpacity: 0.75,
  });
  const macPortal = addPlane([0.5, 0.3], [1.08, 0.77, -1.394], [-0.08, -0.08, 0], {
    target: "mac",
    role: "secondary",
    outlineOpacity: 0.16,
  });
  portalAnchors.set("mac", macPortal);
  const macHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.72, 0.78),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  macHit.position.set(1.07, 0.66, -1.3);
  registerTarget(macHit, "mac");
  scene.add(macHit);

  // Achievements shelf: a divided display structure, not a collection of
  // invented trophies or decorative objects.
  addBox([0.22, 0.045, 1.34], [-1.57, 1.92, 0.03], {
    target: "achievements",
    role: "primary",
    outlineOpacity: 0.72,
  });
  addBox([0.22, 0.045, 1.34], [-1.57, 1.24, 0.03], {
    target: "achievements",
    role: "primary",
    outlineOpacity: 0.72,
  });
  addBox([0.235, 0.035, 1.26], [-1.445, 1.58, 0.03], {
    target: "achievements",
    role: "secondary",
    outlineOpacity: 0.5,
  });
  for (const [index, z] of [-0.63, -0.21, 0.21, 0.69].entries()) {
    addBox([0.22, 0.68, 0.035], [-1.57, 1.58, z], {
      target: "achievements",
      role: index === 1 || index === 2 ? "accent" : "secondary",
      outlineOpacity: 0.46,
    });
  }
  const achievementsHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.76, 1.46),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  achievementsHit.position.set(-1.54, 1.58, 0.03);
  registerTarget(achievementsHit, "achievements");
  scene.add(achievementsHit);

  // The chair and avatar face the desk display. The avatar is deliberately
  // faceted rather than realistic, but the contact points still follow a real
  // seated pose: pelvis on the cushion, thighs above it, and shins below it.
  addBox([0.54, 0.08, 0.52], [-0.6, 0.47, -1.46], {
    target: "figure",
    role: "primary",
    outlineOpacity: 0.74,
  });
  addBox([0.065, 0.64, 0.46], [-0.34, 0.79, -1.46], {
    target: "figure",
    role: "secondary",
    rotation: [0, 0, 0.045],
    outlineOpacity: 0.72,
  });
  for (const [x, z] of [
    [-0.84, -1.65],
    [-0.84, -1.27],
    [-0.4, -1.65],
    [-0.4, -1.27],
  ] as const) {
    addBox([0.035, 0.45, 0.035], [x, 0.23, z], {
      target: "figure",
      role: "accent",
      rotation: [0.03, 0, x < -0.6 ? -0.035 : 0.035],
      outlineOpacity: 0.52,
    });
  }

  addFaceted(new THREE.IcosahedronGeometry(0.16, 1), [-0.55, 0.59, -1.46], {
    mono: MONO.graphite,
    scale: [0.82, 0.46, 1.12],
    outlineOpacity: 0.5,
  });
  addAvatarLimb([-0.64, 1.22, -1.46], [-0.53, 0.7, -1.46], 0.18, {
    target: "figure",
    role: "primary",
    scale: [0.7, 1, 1.18],
    outlineOpacity: 0.66,
  });

  // The open neckline avoids a rigid collar shape. Fine drawstrings preserve
  // the hoodie identity without adding another large form around the neck.
  addAvatarLimb([-0.755, 1.18, -1.51], [-0.73, 1, -1.51], 0.006, {
    mono: MONO.graphite,
    outlineOpacity: 0.26,
  });
  addAvatarLimb([-0.755, 1.18, -1.41], [-0.73, 1, -1.41], 0.006, {
    mono: MONO.graphite,
    outlineOpacity: 0.26,
  });
  addFaceted(new THREE.CylinderGeometry(0.06, 0.066, 0.12, 7), [-0.69, 1.3, -1.46], {
    target: "figure",
    role: "secondary",
    outlineOpacity: 0.4,
  });

  addFaceted(new THREE.CylinderGeometry(0.175, 0.13, 0.32, 7, 2), [-0.7, 1.49, -1.46], {
    target: "figure",
    role: "secondary",
    scale: [0.92, 1, 1],
    outlineOpacity: 0.48,
  });
  addFaceted(new THREE.IcosahedronGeometry(0.19, 1), [-0.68, 1.64, -1.46], {
    mono: MONO.ink,
    scale: [1.02, 0.6, 1.02],
    outlineOpacity: 0.34,
  });
  for (const [z, y, tilt] of [
    [-1.59, 1.6, -0.16],
    [-1.52, 1.63, -0.07],
    [-1.45, 1.64, 0.03],
    [-1.38, 1.63, 0.12],
  ] as const) {
    addFaceted(new THREE.ConeGeometry(0.045, 0.12, 4), [-0.83, y, z], {
      mono: MONO.ink,
      rotation: [tilt, 0, Math.PI / 2],
      outlineOpacity: 0.3,
    });
  }
  for (const [x, z, leanX, leanZ] of [
    [-0.78, -1.57, -0.16, 0.24],
    [-0.72, -1.5, -0.08, 0.12],
    [-0.68, -1.43, 0.02, -0.04],
    [-0.64, -1.36, 0.1, -0.14],
    [-0.6, -1.53, -0.05, 0.04],
    [-0.57, -1.42, 0.12, -0.2],
  ] as const) {
    addFaceted(new THREE.ConeGeometry(0.034, 0.08, 4), [x, 1.72, z], {
      mono: MONO.ink,
      rotation: [leanX, 0, leanZ],
      outlineOpacity: 0.3,
    });
  }
  addFaceted(new THREE.SphereGeometry(0.027, 6, 4), [-0.69, 1.49, -1.625], {
    target: "figure",
    role: "secondary",
    scale: [0.55, 1, 0.78],
    outlineOpacity: 0.34,
  });
  addFaceted(new THREE.SphereGeometry(0.027, 6, 4), [-0.69, 1.49, -1.295], {
    target: "figure",
    role: "secondary",
    scale: [0.55, 1, 0.78],
    outlineOpacity: 0.34,
  });

  for (const [shoulderZ, elbowZ, handZ] of [
    [-1.6, -1.62, -1.63],
    [-1.32, -1.3, -1.29],
  ] as const) {
    addAvatarLimb([-0.63, 1.18, shoulderZ], [-0.83, 0.98, elbowZ], 0.07, {
      target: "figure",
      role: "primary",
      outlineOpacity: 0.52,
    });
    addAvatarLimb([-0.83, 0.98, elbowZ], [-0.98, 0.8, handZ], 0.062, {
      target: "figure",
      role: "primary",
      outlineOpacity: 0.5,
    });
    addFaceted(new THREE.IcosahedronGeometry(0.065, 0), [-0.98, 0.79, handZ], {
      target: "figure",
      role: "secondary",
      scale: [0.85, 0.62, 0.92],
      outlineOpacity: 0.4,
    });
  }

  for (const z of [-1.59, -1.33] as const) {
    addAvatarLimb([-0.6, 0.6, z], [-0.9, 0.57, z], 0.078, {
      mono: MONO.graphite,
      outlineOpacity: 0.48,
    });
    addFaceted(new THREE.IcosahedronGeometry(0.083, 0), [-0.9, 0.56, z], {
      mono: MONO.graphite,
      scale: [0.92, 0.9, 1],
      outlineOpacity: 0.38,
    });
    addAvatarLimb([-0.9, 0.53, z], [-0.88, 0.17, z], 0.068, {
      mono: MONO.graphite,
      outlineOpacity: 0.46,
    });
    addFaceted(new THREE.BoxGeometry(0.18, 0.07, 0.11), [-0.96, 0.08, z], {
      mono: MONO.ink,
      rotation: [0, 0, -0.08],
      outlineOpacity: 0.34,
    });
  }

  function addFaceLine(points: THREE.Vector3[]) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const mainMaterial = new THREE.LineBasicMaterial({
      color: MONO.ink,
      transparent: true,
      opacity: 0.86,
      depthTest: false,
      toneMapped: false,
    });
    const graphiteMaterial = new THREE.LineBasicMaterial({
      color: MONO.graphite,
      transparent: true,
      opacity: 0.18,
      depthTest: false,
      toneMapped: false,
    });
    const main = new THREE.Line(geometry, mainMaterial);
    const echo = new THREE.Line(geometry, graphiteMaterial);
    main.renderOrder = 6;
    echo.renderOrder = 5;
    echo.position.set(-0.004, -0.003, 0.004);
    scene.add(main, echo);
    const materials = outlines.get("figure") ?? [];
    materials.push(mainMaterial, graphiteMaterial);
    outlines.set("figure", materials);
  }

  addFaceLine([
    new THREE.Vector3(-0.862, 1.49, -1.46),
    new THREE.Vector3(-0.878, 1.445, -1.455),
    new THREE.Vector3(-0.865, 1.43, -1.475),
  ]);
  for (const [y, z, width] of [
    [1.505, -1.515, 0.048],
    [1.505, -1.405, 0.048],
    [1.472, -1.515, 0.022],
    [1.472, -1.405, 0.022],
    [1.39, -1.46, 0.052],
  ] as const) {
    addFaceted(new THREE.BoxGeometry(0.009, 0.008, width), [-0.867, y, z], {
      mono: MONO.ink,
      outlineOpacity: 0.2,
    });
  }

  // A broad invisible target keeps the deliberately thin figure easy to click.
  const figureHit = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 1.45, 0.58),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  figureHit.position.set(-0.58, 0.86, -1.46);
  registerTarget(figureHit, "figure");
  scene.add(figureHit);

  addSoftShadow(-0.62, -1.46, 0.82, 0.76);
  addSoftShadow(1.1, -1.7, 1.16, 2.75);

  const initial = options.initialView && options.initialView in VIEWS
    ? (options.initialView as keyof typeof VIEWS)
    : "wide";
  let currentView: keyof typeof VIEWS = initial;
  camera.position.set(...VIEWS[initial].position);
  cameraTarget.set(...VIEWS[initial].target);
  camera.lookAt(cameraTarget);

  interface Motion {
    fromPosition: THREE.Vector3;
    toPosition: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    startedAt: number;
    duration: number;
    source: keyof typeof VIEWS;
    destination: keyof typeof VIEWS;
  }
  let motion: Motion | null = null;

  function hasRoomColour(view: keyof typeof VIEWS): view is TargetName {
    return view !== "wide";
  }

  function cascadeAmount(
    surface: PaintedSurface,
    progress: number,
    originName: TargetName,
    entering: boolean,
  ) {
    const origin = VIEWS[originName].target;
    const dx = surface.position.x - origin[0];
    const dy = surface.position.y - origin[1];
    const dz = surface.position.z - origin[2];
    const distance = Math.min(1, Math.hypot(dx, dy, dz) / 4.6);
    const delay = entering
      ? 0.08 + distance * 0.28
      : 0.06 + (1 - distance) * 0.25;
    const local = Math.min(1, Math.max(0, (progress - delay) / (0.9 - delay)));
    return entering ? EASE(local) : 1 - EASE(local);
  }

  function colourAmount(surface: PaintedSurface, progress: number | null) {
    if (motion && progress !== null) {
      if (hasRoomColour(motion.destination)) {
        return cascadeAmount(surface, progress, motion.destination, true);
      }
      if (motion.source !== "wide") {
        return cascadeAmount(surface, progress, motion.source, false);
      }
      return 0;
    }
    if (hasRoomColour(currentView)) return 1;
    return surface.target && surface.target === activeTarget ? 1 : 0;
  }

  function backgroundAmount(progress: number | null) {
    if (motion && progress !== null) {
      const eased = EASE(Math.min(1, Math.max(0, (progress - 0.08) / 0.82)));
      if (hasRoomColour(motion.destination)) return eased;
      if (motion.destination === "wide" && hasRoomColour(motion.source)) return 1 - eased;
      return 0;
    }
    return hasRoomColour(currentView) ? 1 : 0;
  }

  function projectPortalFrame(target: TargetName) {
    const anchor = portalAnchors.get(target);
    if (!anchor) return;
    anchor.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(anchor);
    const bounds = canvas.getBoundingClientRect();
    const corners = [
      [box.min.x, box.min.y, box.min.z],
      [box.min.x, box.min.y, box.max.z],
      [box.min.x, box.max.y, box.min.z],
      [box.min.x, box.max.y, box.max.z],
      [box.max.x, box.min.y, box.min.z],
      [box.max.x, box.min.y, box.max.z],
      [box.max.x, box.max.y, box.min.z],
      [box.max.x, box.max.y, box.max.z],
    ] as const;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const corner of corners) {
      const projected = new THREE.Vector3(...corner).project(camera);
      const x = bounds.left + (projected.x + 1) * bounds.width / 2;
      const y = bounds.top + (1 - projected.y) * bounds.height / 2;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    const padding = target === "window" ? 0 : 8;
    options.onPortalFrame?.(target, {
      top: Math.max(0, minY - padding),
      right: Math.max(0, window.innerWidth - maxX - padding),
      bottom: Math.max(0, window.innerHeight - maxY - padding),
      left: Math.max(0, minX - padding),
    });
  }

  function setOutlineState(target: TargetName | null) {
    for (const [name, materials] of outlines) {
      const highlighted = name === target;
      for (let index = 0; index < materials.length; index += 2) {
        materials[index].opacity = highlighted ? 0.92 : 0.54;
        if (materials[index + 1]) {
          materials[index + 1].opacity = highlighted ? 0.24 : 0.11;
        }
      }
    }
  }

  function goTo(destination: keyof typeof VIEWS) {
    if (motion || destination === currentView) return;
    const source = currentView;
    activeTarget = null;
    hoveredTarget = null;
    setOutlineState(null);
    options.onHover?.(null);
    options.onLeave?.();
    const view = VIEWS[destination];
    motion = {
      fromPosition: camera.position.clone(),
      toPosition: new THREE.Vector3(...view.position),
      fromTarget: cameraTarget.clone(),
      toTarget: new THREE.Vector3(...view.target),
      startedAt: performance.now(),
      duration: CAMERA_DURATIONS[destination],
      source,
      destination,
    };
  }

  function pickTarget(event: PointerEvent): TargetName | null {
    if (currentView !== "wide" || motion) return null;
    const bounds = canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.intersectObjects(pickable, false)[0];
    return (intersection?.object.userData.target as TargetName | undefined) ?? null;
  }

  function onPointerMove(event: PointerEvent) {
    const target = pickTarget(event);
    if (target === hoveredTarget) return;
    hoveredTarget = target;
    setOutlineState(target);
    options.onHover?.(target ? LABELS[target] : null);
    canvas.style.cursor = target ? "pointer" : "default";
  }

  function onPointerLeave() {
    hoveredTarget = null;
    setOutlineState(null);
    options.onHover?.(null);
    canvas.style.cursor = "default";
  }

  function onClick(event: PointerEvent) {
    const target = pickTarget(event);
    if (target) goTo(target);
  }

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("click", onClick);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let frame = 0;
  function render(now: number) {
    const delta = Math.min(clock.getDelta(), 0.05);
    let motionProgress: number | null = null;
    if (motion) {
      const progress = Math.min((now - motion.startedAt) / motion.duration, 1);
      motionProgress = progress;
      const eased = EASE(progress);
      camera.position.lerpVectors(motion.fromPosition, motion.toPosition, eased);
      cameraTarget.lerpVectors(motion.fromTarget, motion.toTarget, eased);
      camera.lookAt(cameraTarget);
      if (progress >= 1) {
        currentView = motion.destination;
        const arrived = currentView;
        motion = null;
        activeTarget = arrived === "wide" ? null : arrived;
        if (arrived !== "wide") projectPortalFrame(arrived);
        options.onArrive?.(arrived);
      }
    }

    for (const surface of painted) {
      const desired = colourAmount(surface, motionProgress);
      const followsMotion = Boolean(motion);
      surface.amount = followsMotion
        ? desired
        : surface.amount + (desired - surface.amount) * Math.min(1, delta * 4.2);
      surface.material.color.lerpColors(surface.mono, surface.room, surface.amount);
    }

    const backgroundMix = backgroundAmount(motionProgress);
    (scene.background as THREE.Color).lerpColors(
      monoBackground,
      roomBackground,
      backgroundMix,
    );

    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  }
  frame = requestAnimationFrame(render);

  if (initial !== "wide") {
    activeTarget = initial;
    queueMicrotask(() => {
      projectPortalFrame(initial);
      options.onArrive?.(initial);
    });
  }

  return {
    goTo(viewName) {
      goTo(viewName);
    },
    back() {
      if (currentView === "wide") return;
      goTo("wide");
    },
    current() {
      return currentView;
    },
    dispose() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
      renderer.dispose();
    },
  };
}
