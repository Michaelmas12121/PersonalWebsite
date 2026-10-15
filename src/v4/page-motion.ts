import { canRenderRoom } from "./room/enhance";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
const canWarm = () => !connection?.saveData && !/2g/.test(connection?.effectiveType ?? "");
const warmed = new Set<string>();
const pendingImages = new Set<HTMLImageElement>();
let roomPrepared = false;
let intentTimer: number | undefined;

function warm(link: HTMLAnchorElement) {
  if (!canWarm()) return;
  if (link.classList.contains("room-door") && !roomPrepared && canRenderRoom()) {
    roomPrepared = true;
    // Only explicit door intent on a capable device may prepare the 3D code.
    void import("./room/scene").catch(() => { roomPrepared = false; });
  }
  if (!link.dataset.previewImages || warmed.has(link.href)) return;
  warmed.add(link.href);
  const previews: { src: string; srcset: string; sizes: string }[] = JSON.parse(link.dataset.previewImages);
  for (const preview of previews.slice(0, innerWidth <= 700 ? 1 : 3)) {
    const image = new Image();
    image.fetchPriority = "low";
    image.decoding = "async";
    image.sizes = preview.sizes;
    image.srcset = preview.srcset;
    image.src = preview.src;
    pendingImages.add(image);
    void image.decode().catch(() => undefined).finally(() => pendingImages.delete(image));
  }
}
for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-astro-prefetch]")) {
  const prepare = () => {
    clearTimeout(intentTimer);
    intentTimer = window.setTimeout(() => warm(link), 160);
  };
  link.addEventListener("pointerenter", prepare);
  link.addEventListener("focus", prepare);
  link.addEventListener("pointerleave", () => clearTimeout(intentTimer));
  link.addEventListener("blur", () => clearTimeout(intentTimer));
  link.addEventListener("pointerdown", () => warm(link), { passive: true });
}

const home = document.querySelector<HTMLElement>(".portrait-home");
if (home) {
  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  let frame = 0;
  let x = 0, y = 0;
  const update = () => {
    frame = 0;
    home.style.setProperty("--pointer-x", `${x}px`);
    home.style.setProperty("--pointer-y", `${y}px`);
  };
  home.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !pointer.matches) return;
    x = (event.clientX / innerWidth - .5) * 12;
    y = (event.clientY / innerHeight - .5) * 10;
    if (!frame) frame = requestAnimationFrame(update);
  });
  const reset = () => { x = 0; y = 0; if (!frame) frame = requestAnimationFrame(update); };
  home.addEventListener("pointerleave", reset);
  reducedMotion.addEventListener("change", reset);
}

// Browsers without cross-document transitions retain an immediate navigation
// and a short arrival animation; content is never held behind a loading screen.
if (!("onpagereveal" in window) && !reducedMotion.matches) {
  const content = document.querySelector(".category-grid, .poster");
  if (content) content.animate([{ opacity: .4, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: "ease-out" });
}
