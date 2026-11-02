import { create } from "zustand";
export type AudioLayer = "music" | "ambient" | "sfx";
export type AudioMix = Record<AudioLayer, number>;
const initial: AudioMix = { music: 0.22, ambient: 0.14, sfx: 0.45 };
function restore(): AudioMix {
  try {
    const data = JSON.parse(localStorage.getItem("chapel-audio") ?? "{}");
    return Object.fromEntries(
      Object.entries(initial).map(([k, v]) => [
        k,
        typeof data[k] === "number" ? Math.max(0, Math.min(1, data[k])) : v,
      ]),
    ) as AudioMix;
  } catch {
    return initial;
  }
}
export const useAudioSettings = create<{
  mix: AudioMix;
  set: (layer: AudioLayer, value: number) => void;
  contextTime: number;
  chord: number;
  running: boolean;
  voices: number;
  level: number;
  triggers: number;
}>((set, get) => ({
  mix: restore(),
  contextTime: 0,
  chord: -1,
  running: false,
  voices: 0,
  level: 0,
  triggers: 0,
  set: (layer, value) => {
    const mix = { ...get().mix, [layer]: Math.max(0, Math.min(1, value)) };
    set({ mix });
    try {
      localStorage.setItem("chapel-audio", JSON.stringify(mix));
    } catch {}
  },
}));
window.addEventListener("storage", (event) => {
  if (event.key === "chapel-audio")
    useAudioSettings.setState({ mix: restore() });
});
