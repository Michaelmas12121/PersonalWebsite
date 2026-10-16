/** Content palettes; legacy target keys preserve existing room links. */
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
