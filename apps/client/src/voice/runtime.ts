import { gratitude, invitations, acknowledgements } from "./engagementLines";
import type { EngagementNotice } from "../../../../packages/shared/src/engagement";
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
const thanksTurns = new Map<GiftKey, number>();
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
  const wish = rotation.next(settings.locale, key);
  const turn = thanksTurns.get(key) ?? 0;
  thanksTurns.set(key, turn + 1);
  const useThanks = settings.thanksEnabled && turn % 5 >= 3;
  const line = useThanks
    ? {
        text: gratitude[settings.locale][key][(turn % 5) - 3],
        variant: (turn % 5) - 3,
      }
    : wish;
  const read = settings.readNames ? spokenName(name) : "";
  voiceQueue.enqueue({
    id,
    clipKey: `${useThanks ? "thanks-" : ""}${key}-${line.variant}`,
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
export function queueCommunity(
  notice: EngagementNotice,
  settings: ProductionSettings,
) {
  const lines = notice.invitation
    ? invitations[settings.locale][notice.kind as "amen" | "like" | "share"]
    : acknowledgements[settings.locale][notice.kind];
  const variant =
    (notice.variant + (settings.engagement.promptVariant === "B" ? 2 : 0)) %
    lines.length;
  voiceQueue.enqueue({
    id: notice.id,
    clipKey: `${notice.invitation ? "invite" : "ack"}-${notice.kind}-${variant}`,
    text: lines[variant],
    name: notice.name ? safeDisplayName(notice.name) : "",
    locale: settings.locale,
    voiceURI: settings.voiceURI[settings.locale],
    rate: settings.rate,
    volume: settings.mix.voice * settings.mix.master,
    created: Date.now(),
    expires: Date.now() + 10000,
    priority: notice.invitation ? -2 : -1,
    enabled:
      settings.voiceEnabled &&
      (notice.invitation || settings.thanksEnabled) &&
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
