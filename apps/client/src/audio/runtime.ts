import type { GiftKey } from "@chapel/shared";
import type { AudioMix } from "./settings";
/** Original synthesis only. Four persistent sources, at most 24 short voices.
 * Music oscillators change pitch continuously; ambient buffer loops with matched ends.
 * No fetched recordings, melodies, choir tracks, or long-lived per-event timers. */
class ChapelAudio {
  context: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private ambient!: GainNode;
  private sfx!: GainNode;
  private analyser!: AnalyserNode;
  private pads: OscillatorNode[] = [];
  private noise: AudioBufferSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private voices = new Set<OscillatorNode | AudioBufferSourceNode>();
  private lastChord = -1;
  private lastQuiet = -1;
  private lastFoot = -1;
  private lastGift = "";
  private muted = true;
  private settings: AudioMix = {
    master: 1,
    music: 0.22,
    ambient: 0.14,
    sfx: 0.45,
    voice: 0.85,
  };
  private ducked = false;
  private lastBeat = -1;
  triggers = 0;
  duck(active: boolean) {
    this.ducked = active;
    this.sync(this.settings, this.muted);
  }
  async unlock() {
    if (!this.context || this.context.state === "closed") this.initialize();
    await this.context!.resume();
    return this.context!.state === "running";
  }
  private initialize() {
    const c = (this.context = new AudioContext());
    this.master = c.createGain();
    this.master.gain.value = 0;
    const limiter = c.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.knee.value = 18;
    limiter.ratio.value = 5;
    limiter.attack.value = 0.01;
    limiter.release.value = 0.25;
    this.analyser = c.createAnalyser();
    this.analyser.fftSize = 512;
    this.master.connect(limiter);
    limiter.connect(this.analyser);
    this.analyser.connect(c.destination);
    this.music = c.createGain();
    this.ambient = c.createGain();
    this.sfx = c.createGain();
    this.music.connect(this.master);
    this.ambient.connect(this.master);
    this.sfx.connect(this.master);
    // Original quiet room impulse; dry signal remains intelligible at low volume.
    const impulse = c.createBuffer(
      2,
      Math.floor(c.sampleRate * 1.8),
      c.sampleRate,
    );
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < data.length; i++)
        data[i] =
          (Math.random() * 2 - 1) * Math.exp((-i / c.sampleRate) * 4) * 0.18;
    }
    const reverb = c.createConvolver(),
      wet = c.createGain();
    reverb.buffer = impulse;
    wet.gain.value = 0.12;
    this.sfx.connect(reverb);
    reverb.connect(wet);
    wet.connect(this.master);
    this.noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = (brown + (Math.random() * 2 - 1) * 0.03) / 1.03;
      const edge = Math.min(1, i / 1200, (data.length - 1 - i) / 1200);
      data[i] = brown * edge;
    }
    const low = c.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 360;
    low.connect(this.ambient);
    this.noise = c.createBufferSource();
    this.noise.buffer = this.noiseBuffer;
    this.noise.loop = true;
    this.noise.connect(low);
    this.noise.start();
    for (let i = 0; i < 3; i++) {
      const o = c.createOscillator(),
        g = c.createGain();
      const real = new Float32Array([0, 0, 0, 0, 0]),
        imag = new Float32Array([0, 1, 0.22, 0.08, 0.04]);
      o.setPeriodicWave(c.createPeriodicWave(real, imag));
      o.frequency.value = [130.81, 164.81, 196][i];
      g.gain.value = 0.07;
      o.connect(g);
      g.connect(this.music);
      o.start();
      this.pads.push(o);
    }
    this.sync(this.settings, this.muted);
  }
  sync(mix: AudioMix, muted: boolean) {
    this.settings = mix;
    this.muted = muted;
    const c = this.context;
    if (!c) return;
    this.master.gain.setTargetAtTime(
      muted ? 0 : 0.55 * mix.master,
      c.currentTime,
      0.08,
    );
    this.music.gain.setTargetAtTime(
      mix.music * (this.ducked ? 0.316 : 1),
      c.currentTime,
      0.3,
    );
    this.ambient.gain.setTargetAtTime(
      mix.ambient * 0.15 * (this.ducked ? 0.5 : 1),
      c.currentTime,
      0.3,
    );
    this.sfx.gain.setTargetAtTime(mix.sfx, c.currentTime, 0.08);
  }
  tick() {
    const c = this.context;
    if (!c || c.state !== "running") return;
    const chord = Math.floor(c.currentTime / 12) % 4;
    const beat = Math.floor(c.currentTime / 1.5);
    if (beat !== this.lastBeat) {
      this.lastBeat = beat;
      const notes = [
        [261.63, 329.63, 392, 523.25],
        [220, 293.66, 349.23, 440],
        [261.63, 349.23, 440, 523.25],
        [196, 293.66, 392, 493.88],
      ];
      this.tone(
        notes[chord][[0, 2, 1, 3, 2, 1, 0, 2][beat % 8]],
        1.9,
        0.055,
        false,
        "music",
      );
    }
    if (chord !== this.lastChord) {
      this.lastChord = chord;
      const chords = [
        [130.81, 164.81, 196],
        [110, 146.83, 174.61],
        [130.81, 174.61, 220],
        [98, 146.83, 196],
      ];
      this.pads.forEach((o, i) =>
        o.frequency.setTargetAtTime(chords[chord][i], c.currentTime, 2),
      );
    }
  }
  private tone(
    frequency: number,
    duration: number,
    volume: number,
    noise = false,
    bus: "music" | "sfx" = "sfx",
    delay = 0,
  ) {
    const c = this.context;
    if (
      !c ||
      c.state !== "running" ||
      this.muted ||
      this.settings[bus] === 0 ||
      this.voices.size >= 24
    )
      return;
    const source = noise ? c.createBufferSource() : c.createOscillator(),
      g = c.createGain();
    if (source instanceof OscillatorNode) {
      source.type = "sine";
      source.frequency.value = frequency;
    } else source.buffer = this.noiseBuffer;
    const t = c.currentTime + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.00001, t + duration);
    source.connect(g);
    g.connect(bus === "music" ? this.music : this.sfx);
    this.voices.add(source);
    source.start(t);
    source.stop(t + duration + 0.03);
    source.onended = () => {
      source.disconnect();
      g.disconnect();
      this.voices.delete(source);
    };
  }
  quiet(kind: "arrival" | "seat" | "stand" | "foot" | "kneel") {
    const t = this.context?.currentTime ?? -1;
    if (t < 0 || this.muted || this.settings.sfx === 0) return;
    if (kind === "foot") {
      if (t - this.lastFoot < 0.55) return;
      this.lastFoot = t;
      this.tone(
        0,
        0.11 + (this.triggers % 3) * 0.015,
        0.09 + (this.triggers % 2) * 0.03,
        true,
      );
    } else {
      if (t - this.lastQuiet < 0.7) return;
      this.lastQuiet = t;
      this.tone(kind === "arrival" ? 392 : 196, 0.35, 0.025);
      this.tone(0, 0.16, 0.05, true);
    }
    this.triggers++;
  }
  gift(key: GiftKey, eventId: string) {
    if (this.lastGift === eventId) return;
    this.lastGift = eventId;
    if (!this.context || this.muted || this.settings.sfx === 0) return;
    this.triggers++;
    if (key === "bell_10" || key === "ceremony_500")
      for (const [ratio, volume] of [
        [1, 0.2],
        [2.76, 0.08],
        [5.4, 0.03],
      ])
        this.tone(392 * ratio, 2.4, volume);
    if (key === "ceremony_500") {
      // Original vowel-like additive choir, not a recorded human choir.
      for (const f of [130.81, 164.81, 196]) {
        this.tone(f, 5, 0.07, false, "sfx", 1.2);
        this.tone(f * 2, 4.8, 0.025, false, "sfx", 1.2);
        this.tone(f * 3, 4.4, 0.008, false, "sfx", 1.2);
      }
    }
    if (key === "candle_1") {
      this.tone(0, 0.3, 0.08, true);
      this.tone(523.25, 0.8, 0.035);
    }
    if (key === "rose_5") {
      this.tone(0, 0.3, 0.05, true);
      this.tone(329.63, 0.9, 0.035);
    }
    if (key === "prayer_5") this.tone(196, 1.3, 0.04);
    if (key === "altar_100" || key === "ceremony_500")
      for (const f of [130.81, 196, 261.63])
        this.tone(f, key === "altar_100" ? 3 : 4, 0.06);
  }
  diagnostics() {
    const values = new Float32Array(512);
    this.analyser?.getFloatTimeDomainData(values);
    const level = Math.sqrt(
      values.reduce((n, v) => n + v * v, 0) / values.length,
    );
    return {
      ducked: this.ducked,
      musicGain: this.music?.gain.value ?? 0,
      ambientGain: this.ambient?.gain.value ?? 0,
      sfxGain: this.sfx?.gain.value ?? 0,
      masterGain: this.master?.gain.value ?? 0,
      persistentSources: this.pads.length + (this.noise ? 1 : 0),
      peak: Math.max(...values.map(Math.abs)),
      contextTime: this.context?.currentTime ?? 0,
      chord: this.lastChord,
      running: this.context?.state === "running",
      voices: this.voices.size,
      level,
      triggers: this.triggers,
    };
  }
  stop() {
    for (const voice of this.voices) {
      try {
        voice.stop();
      } catch {}
    }
    this.voices.clear();
    for (const pad of this.pads) {
      try {
        pad.stop();
      } catch {}
    }
    this.pads = [];
    this.noise?.stop();
    this.noise = null;
    if (this.context) void this.context.close();
    this.context = null;
    this.lastGift = "";
    this.lastChord = -1;
    this.lastBeat = -1;
    this.ducked = false;
    this.lastFoot = this.lastQuiet = -1;
  }
}
export const chapelAudio = new ChapelAudio();
