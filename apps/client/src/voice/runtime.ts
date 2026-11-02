import { create } from "zustand";
import { GIFTS, type GiftKey } from "@chapel/shared";
import {
  safeDisplayName,
  spokenName,
  type ProductionSettings,
} from "../../../../packages/shared/src/production";
import { chapelAudio } from "../audio/runtime";
import { LineRotation } from "./lines";
import { BrowserSpeechProvider, RecordedClipProvider } from "./providers";
import { VoiceQueue, type VoiceJob } from "./queue";
export const browserVoice = new BrowserSpeechProvider(),
  recordedVoice = new RecordedClipProvider();
export const useVoiceState = create<{
  banner: VoiceJob | null;
  until: number;
  minimumUntil: number;
  fading: boolean;
  status: string;
  skipped: number;
  speaking: boolean;
  version: number;
}>(() => ({
  banner: null,
  until: 0,
  minimumUntil: 0,
  fading: false,
  status: "Not enabled",
  skipped: 0,
  speaking: false,
  version: 0,
}));
const rotation = new LineRotation();
export const voiceQueue = new VoiceQueue(
  (job) =>
    useVoiceState.setState({
      banner: job,
      fading: false,
      minimumUntil: Date.now() + 4500,
      until:
        Date.now() +
        Math.min(10000, Math.max(4500, (job.text.length * 70) / job.rate)),
    }),
  (active) => {
    chapelAudio.duck(active);
    useVoiceState.setState((s) => ({
      speaking: active,
      fading: false,
      until: active
        ? Date.now() + 10500
        : Math.max(s.minimumUntil, Date.now() + 700),
    }));
  },
  (status) => useVoiceState.setState({ status, skipped: voiceQueue.skipped }),
);
export function queueWish(
  id: string,
  key: GiftKey,
  name: string,
  settings: ProductionSettings,
) {
  const line = rotation.next(settings.locale, key);
  const read = settings.readNames ? spokenName(name) : "";
  voiceQueue.enqueue({
    id,
    clipKey: `${key}-${line.variant}`,
    text:
      (read && settings.provider === "browser" ? read + ". " : "") + line.text,
    name: safeDisplayName(name),
    locale: settings.locale,
    voiceURI: settings.voiceURI[settings.locale],
    rate: settings.rate,
    volume: settings.mix.voice * settings.mix.master,
    created: Date.now(),
    expires: Date.now() + 10000,
    priority: GIFTS[key].priority,
    enabled:
      settings.voiceEnabled &&
      settings.mix.voice > 0 &&
      settings.mix.master > 0 &&
      chapelAudio.context?.state === "running",
    provider: settings.provider === "browser" ? browserVoice : recordedVoice,
  });
}
if (typeof speechSynthesis !== "undefined")
  speechSynthesis.addEventListener("voiceschanged", () =>
    useVoiceState.setState((s) => ({ version: s.version + 1 })),
  );
