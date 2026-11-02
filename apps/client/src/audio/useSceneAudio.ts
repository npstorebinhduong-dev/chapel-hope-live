import { useEffect } from "react";
import { attendeePose } from "@chapel/shared";
import { renderClock, useSession } from "../store";
import { useAudioSettings } from "./settings";
import { chapelAudio } from "./runtime";
export function useSceneAudio() {
  useEffect(() => {
    const previous = new Map<string, string>();
    let primed = false,
      lastMeter = 0;
    const interval = setInterval(() => {
      const s = useSession.getState().snapshot;
      if (!s) return;
      chapelAudio.sync(useAudioSettings.getState().mix, s.settings.muted);
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
        if (before && before !== "seated" && pose.state === "seated")
          chapelAudio.quiet("seat");
        if (
          before === "seated" &&
          ["walking_in_aisle", "returning"].includes(pose.state)
        )
          chapelAudio.quiet("stand");
        if (
          pose.visible &&
          [
            "walking_in_aisle",
            "walking_from_queue",
            "returning",
            "leaving",
          ].includes(pose.state) &&
          a.journey
        )
          walking = true;
        previous.set(a.userId, pose.state);
      }
      for (const id of previous.keys()) if (!ids.has(id)) previous.delete(id);
      if (walking) chapelAudio.quiet("foot");
      if (s.active && now >= s.active.startedAt && now < s.active.endsAt)
        chapelAudio.gift(s.active.event.giftKey, s.active.event.eventId);
      primed = true;
      if (performance.now() - lastMeter > 250) {
        lastMeter = performance.now();
        useAudioSettings.setState(chapelAudio.diagnostics());
      }
    }, 100);
    return () => {
      clearInterval(interval);
      previous.clear();
      chapelAudio.stop();
    };
  }, []);
}
