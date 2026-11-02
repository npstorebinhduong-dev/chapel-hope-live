import { useEffect } from "react";
import { attendeePose, isAttendeeMoving } from "@chapel/shared";
import { renderClock, useSession } from "../store";
import { useAudioSettings } from "./settings";
import { chapelAudio } from "./runtime";
import { defaultProduction } from "../../../../packages/shared/src/production";
import {
  queueWish,
  voiceQueue,
  useVoiceState,
  recordedVoice,
} from "../voice/runtime";
export function useSceneAudio() {
  useEffect(() => {
    const previous = new Map<string, string>();
    let primed = false,
      lastMeter = 0;
    let lastGift = "",
      wasVoiceAllowed = false,
      lastProvider = "";
    const interval = setInterval(() => {
      const s = useSession.getState().snapshot;
      if (!s) return;
      const production = s.production ?? defaultProduction();
      if (production.provider !== lastProvider) {
        lastProvider = production.provider;
        if (lastProvider === "recorded") void recordedVoice.load();
      }
      chapelAudio.sync(production.mix, s.settings.muted);
      const voiceAllowed =
        !s.settings.muted &&
        production.voiceEnabled &&
        production.mix.master > 0 &&
        production.mix.voice > 0;
      if (
        !voiceAllowed &&
        (wasVoiceAllowed ||
          useVoiceState.getState().speaking ||
          voiceQueue.active ||
          voiceQueue.pending.length)
      )
        voiceQueue.stop();
      wasVoiceAllowed = voiceAllowed;
      const voice = useVoiceState.getState();
      if (!voice.speaking && voice.until < Date.now())
        useVoiceState.setState({ banner: null });
      else if (
        !voice.speaking &&
        voice.until < Date.now() + 500 &&
        !voice.fading
      )
        useVoiceState.setState({ fading: true });
      chapelAudio.tick();
      const now = renderClock();
      let walking = false;
      const ids = new Set<string>();
      for (const a of s.attendees) {
        ids.add(a.userId);
        const pose = attendeePose(a, now, s.active),
          before = previous.get(a.userId);
        if (primed && !before && pose.state === "waiting")
          chapelAudio.quiet("arrival");
        if (before && before !== "kneeling" && pose.state === "kneeling")
          chapelAudio.quiet("kneel");
        if (before && before !== "seated" && pose.state === "seated")
          chapelAudio.quiet("seat");
        if (
          before === "seated" &&
          [
            "called_by_gift",
            "walking_in_aisle",
            "returning",
            "leaving",
          ].includes(pose.state)
        )
          chapelAudio.quiet("stand");
        if (pose.visible && isAttendeeMoving(a, now)) walking = true;
        previous.set(a.userId, pose.state);
      }
      for (const id of previous.keys()) if (!ids.has(id)) previous.delete(id);
      if (walking) chapelAudio.quiet("foot");
      if (s.active && now >= s.active.startedAt && now < s.active.endsAt) {
        chapelAudio.gift(s.active.event.giftKey, s.active.event.eventId);
        if (lastGift !== s.active.event.eventId) {
          lastGift = s.active.event.eventId;
          queueWish(lastGift, s.active.event.giftKey, s.active.event.username, {
            ...production,
            voiceEnabled: production.voiceEnabled && !s.settings.muted,
          });
        }
      }
      if (!s.attendees.length && !s.active && lastGift) {
        lastGift = "";
        voiceQueue.stop();
        useVoiceState.setState({ banner: null });
      }
      primed = true;
      if (performance.now() - lastMeter > 250) {
        lastMeter = performance.now();
        const diagnostics = chapelAudio.diagnostics();
        if (useVoiceState.getState().skipped !== voiceQueue.skipped)
          useVoiceState.setState({ skipped: voiceQueue.skipped });
        useAudioSettings.setState(diagnostics);
        const liveFrame = document.querySelector<HTMLElement>(
          '[data-testid="live-frame"]',
        );
        if (liveFrame) {
          liveFrame.dataset.audio = JSON.stringify(diagnostics);
          liveFrame.dataset.voiceStatus = useVoiceState.getState().status;
        }
      }
    }, 100);
    return () => {
      clearInterval(interval);
      previous.clear();
      voiceQueue.stop();
      chapelAudio.stop();
    };
  }, []);
}
