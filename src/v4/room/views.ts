import type { TargetName } from "./layout";

export interface View {
  position: [number, number, number];
  target: [number, number, number];
  parent?: "wide";
}

/** Reference camera converted from Blender Z-up to glTF Y-up.
 * Destination keys preserve existing links; figure now means the notebook,
 * mac the project board, and window the camera and photographs.
 */
export const VIEWS: Record<"wide" | TargetName, View> = {
  wide: {
    position: [0.0, 2.56, 1.70],
    target: [0.05, 1.06, -0.14],
  },
  figure: {
    position: [-0.16, 1.48, 0.94],
    target: [-0.16, 0.77, 0.33],
    parent: "wide",
  },
  monitor: {
    position: [-0.55, 1.47, 0.76],
    target: [-0.58, 1.03, -0.30],
    parent: "wide",
  },
  mac: {
    position: [-0.64, 1.66, 1.18],
    target: [-0.72, 1.45, -0.55],
    parent: "wide",
  },
  achievements: {
    position: [0.70, 1.38, 0.74],
    target: [0.70, 0.94, -0.33],
    parent: "wide",
  },
  window: {
    position: [1.10, 1.35, 0.88],
    target: [1.10, 0.81, 0.20],
    parent: "wide",
  },
};
