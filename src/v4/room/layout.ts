/**
 * Version 4 keeps the measured bedroom proportions while reducing the room to
 * the objects approved in the visual study. Units are metres. Negative Z
 * points from the doorway towards the window.
 */
export const ROOM = {
  width: 3.4,
  depth: 4.8,
  height: 2.7,
  zBack: -3.6,
  zFront: 1.2,
};

export const MONO = {
  void: 0xf4f1ea,
  paper: 0xfbfaf6,
  paperShade: 0xeeeae2,
  graphiteWash: 0xd8d3ca,
  ink: 0x292825,
  graphite: 0x706c65,
  shadow: 0xaaa49a,
};

/** Stable room colours shared by every immersive destination. */
export const ROOM_COLOURS = {
  void: 0xeee7db,
  ivory: 0xf1e9dc,
  ivoryShade: 0xd9cdbc,
  oak: 0xa77b56,
  fabric: 0x81919c,
  graphite: 0x302f2c,
  graphiteSoft: 0x68645e,
} as const;

export const TARGET_PALETTES = {
  figure: {
    primary: 0x687b86,
    secondary: 0xb97865,
    accent: 0xd5c5ac,
  },
  monitor: {
    primary: 0x2f6970,
    secondary: 0x86a0a0,
    accent: 0xd5a84a,
  },
  mac: {
    primary: 0x3f526b,
    secondary: 0xa46b58,
    accent: 0xc9a45b,
  },
  achievements: {
    primary: 0x705845,
    secondary: 0xb39861,
    accent: 0x754f57,
  },
  window: {
    primary: 0x7393a1,
    secondary: 0x7e956f,
    accent: 0xd7b66a,
  },
} as const;

export type TargetName = keyof typeof TARGET_PALETTES;
export type ColourRole = keyof (typeof TARGET_PALETTES)[TargetName];
