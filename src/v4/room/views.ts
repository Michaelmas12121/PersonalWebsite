import type { TargetName } from "./layout";

export interface View {
  position: [number, number, number];
  target: [number, number, number];
  parent?: "wide";
}

/** Fixed views keep the room legible and make every move intentional. */
export const VIEWS: Record<"wide" | TargetName, View> = {
  wide: {
    position: [0.05, 1.55, 1.08],
    target: [0.0, 1.12, -2.55],
  },
  figure: {
    position: [-2.08, 1.5, -1.0],
    target: [-0.67, 1.2, -1.46],
    parent: "wide",
  },
  monitor: {
    position: [0.3, 1.48, -1.48],
    target: [-1.04, 1.14, -1.95],
    parent: "wide",
  },
  mac: {
    position: [0.15, 1.24, -0.18],
    target: [1.02, 0.72, -1.34],
    parent: "wide",
  },
  achievements: {
    position: [0.1, 1.56, 0.96],
    target: [-1.57, 1.58, 0.02],
    parent: "wide",
  },
  window: {
    position: [0.0, 1.47, -1.02],
    target: [0.0, 1.5, -3.58],
    parent: "wide",
  },
};
