import { useSession } from "./store";
let context: AudioContext | null = null;
let lastEvent = "";
export async function unlockAudio() {
  context ??= new AudioContext();
  await context.resume();
  return context.state === "running";
}
export function playBell(eventId: string) {
  if (lastEvent === eventId) return;
  lastEvent = eventId;
  if (
    !context ||
    context.state !== "running" ||
    useSession.getState().snapshot?.settings.muted
  )
    return;
  const now = context.currentTime;
  for (const [ratio, volume] of [
    [1, 0.13],
    [2.76, 0.055],
    [5.4, 0.022],
  ]) {
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 392 * ratio;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 2.5);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}
