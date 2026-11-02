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
    localStorage.setItem("chapel-quality", level);
  },
}));
const restore = () => {
  const value = localStorage.getItem("chapel-quality");
  if (value && value in QUALITY)
    useQuality.setState({ level: value as Quality });
};
restore();
window.addEventListener("storage", restore);
