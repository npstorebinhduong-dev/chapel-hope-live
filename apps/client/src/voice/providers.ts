import type { Locale } from "../../../../packages/shared/src/production";
export interface VoiceRequest {
  text: string;
  locale: Locale;
  voiceURI: string;
  rate: number;
  volume: number;
  clipKey: string;
}
export type VoiceResult = "ended" | "missing" | "blocked" | "error" | "timeout";
export interface VoiceProvider {
  available(request: VoiceRequest): boolean;
  play(request: VoiceRequest, onStart: () => void): Promise<VoiceResult>;
  cancel(): void;
}
export function matchingVoices(
  voices: readonly SpeechSynthesisVoice[],
  locale: Locale,
) {
  return voices.filter(
    (v) => v.lang.toLowerCase().replace("_", "-").split("-")[0] === locale,
  );
}
export class BrowserSpeechProvider implements VoiceProvider {
  private finish: ((r: VoiceResult) => void) | undefined;
  list(locale: Locale) {
    return typeof speechSynthesis === "undefined"
      ? []
      : matchingVoices(speechSynthesis.getVoices(), locale);
  }
  available(r: VoiceRequest) {
    return this.list(r.locale).length > 0;
  }
  play(r: VoiceRequest, onStart: () => void): Promise<VoiceResult> {
    this.cancel();
    const voices = this.list(r.locale);
    if (!voices.length) return Promise.resolve("missing");
    const voice =
      voices.find((v) => v.voiceURI === r.voiceURI) ??
      voices.find((v) => v.default) ??
      voices[0];
    return new Promise((resolve) => {
      let settled = false;
      const done = (result: VoiceResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.finish = undefined;
        resolve(result);
      };
      this.finish = done;
      const u = new SpeechSynthesisUtterance(r.text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = r.rate;
      u.volume = r.volume;
      u.onstart = onStart;
      u.onend = () => done("ended");
      u.onerror = (e) => done(e.error === "not-allowed" ? "blocked" : "error");
      const timer = setTimeout(() => {
        done("timeout");
        speechSynthesis.cancel();
      }, 10000);
      speechSynthesis.speak(u);
    });
  }
  cancel() {
    this.finish?.("error");
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }
}
export class RecordedClipProvider implements VoiceProvider {
  private clips: Record<string, string> = {};
  private audio: HTMLAudioElement | null = null;
  private finish: ((r: VoiceResult) => void) | undefined;
  async load() {
    try {
      const r = await fetch("/voice/manifest.json");
      if (!r.ok) throw Error();
      const m = await r.json();
      this.clips = Object.fromEntries(
        Object.entries(m).filter(
          ([k, v]) =>
            /^(en|vi|it)\/(candle_1|prayer_5|rose_5|bell_10|altar_100|ceremony_500)-[01]$/.test(
              k,
            ) &&
            typeof v === "string" &&
            /^\/voice\/[a-zA-Z0-9_/-]+\.(wav|mp3|ogg)$/.test(v),
        ) as [string, string][],
      );
    } catch {
      this.clips = {};
    }
  }
  available(r: VoiceRequest) {
    return !!this.clips[`${r.locale}/${r.clipKey}`];
  }
  play(r: VoiceRequest, onStart: () => void): Promise<VoiceResult> {
    this.cancel();
    if (!this.available(r)) return Promise.resolve("missing");
    return new Promise((resolve) => {
      let settled = false;
      const done = (v: VoiceResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.finish = undefined;
        this.audio?.pause();
        this.audio = null;
        resolve(v);
      };
      this.finish = done;
      const a = (this.audio = new Audio(
        this.clips[`${r.locale}/${r.clipKey}`],
      ));
      a.volume = r.volume;
      a.playbackRate = r.rate;
      a.onplaying = onStart;
      a.onended = () => done("ended");
      a.onerror = () => done("error");
      const timer = setTimeout(() => done("timeout"), 10000);
      void a.play().catch(() => done("blocked"));
    });
  }
  cancel() {
    this.audio?.pause();
    this.finish?.("error");
    this.audio = null;
  }
}
