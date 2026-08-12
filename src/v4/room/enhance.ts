/**
 * The 3D room is progressive enhancement. Narrow or touch-first devices keep
 * the complete HTML menu and a code-native line drawing without downloading
 * three.js.
 */
export function canRenderRoom(): boolean {
  if (!window.matchMedia("(min-width: 900px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(hover: none)").matches) return false;
  if ((navigator.hardwareConcurrency ?? 4) < 4) return false;
  return hasWebGL();
}
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
