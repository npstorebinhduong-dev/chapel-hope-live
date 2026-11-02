import { create } from "zustand";
export const QUALITY = {
  low: {
    dpr: 0.65,
    shadows: false,
    shadowSize: 512,
    particles: 12,
    details: 8,
  },
  balanced: {
    dpr: 1,
    shadows: true,
    shadowSize: 1024,
    particles: 32,
    details: 24,
  },
  high: {
    dpr: 1.5,
    shadows: true,
    shadowSize: 2048,
    particles: 64,
    details: 48,
  },
} as const;
export type Quality = keyof typeof QUALITY;
export const useQuality = create<{
  level: Quality;
  set: (level: Quality) => void;
}>((set) => ({
  level: "balanced",
  set: (level) => {
    set({ level });
    try {
      localStorage.setItem("chapel-quality", level);
    } catch {
      /* Restricted file/private mode: keep the in-memory setting. */
    }
  },
}));
const restore = () => {
  try {
    const value = localStorage.getItem("chapel-quality");
    if (value && value in QUALITY)
      useQuality.setState({ level: value as Quality });
  } catch {
    /* Browser storage is optional for local HTML previews. */
  }
};
restore();
window.addEventListener("storage", restore);
