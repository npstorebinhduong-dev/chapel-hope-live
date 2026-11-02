export type MusicTrack = "playlist" | "peace" | "hope" | "evening";
const tracks = {
  peace: {
    chords: [
      [48, 52, 55],
      [45, 48, 52],
      [53, 57, 60],
      [55, 59, 62],
      [48, 55, 60],
      [50, 53, 57],
      [55, 59, 62],
      [48, 52, 55],
    ],
    melody: [
      60, 64, 67, 64, 69, 67, 64, 60, 65, 69, 72, 69, 67, 62, 59, 62, 64, 67,
      72, 67, 65, 62, 57, 62, 67, 71, 74, 71, 72, 67, 64, 60,
    ],
  },
  hope: {
    chords: [
      [50, 53, 57],
      [46, 50, 53],
      [53, 57, 60],
      [48, 52, 55],
      [55, 58, 62],
      [46, 53, 58],
      [45, 49, 52],
      [50, 53, 57],
    ],
    melody: [
      62, 65, 69, 65, 65, 62, 58, 62, 65, 69, 72, 69, 67, 64, 60, 64, 67, 70,
      74, 70, 65, 62, 58, 62, 64, 61, 57, 61, 62, 69, 65, 62,
    ],
  },
  evening: {
    chords: [
      [43, 47, 50],
      [40, 43, 47],
      [48, 52, 55],
      [50, 54, 57],
      [47, 50, 55],
      [48, 52, 55],
      [50, 54, 57],
      [43, 47, 50],
    ],
    melody: [
      59, 62, 67, 62, 64, 59, 55, 59, 60, 64, 67, 64, 62, 66, 69, 66, 67, 62,
      59, 62, 64, 60, 55, 60, 62, 66, 69, 66, 67, 62, 59, 55,
    ],
  },
} as const;
export const midiHz = (n: number) => 440 * 2 ** ((n - 69) / 12);
/** Three original 48-second scores. Requests commit at the next 6-second bar. */
export class MusicDirector {
  requested: MusicTrack = "playlist";
  selected: MusicTrack = "playlist";
  private bar = -1;
  sample(seconds: number) {
    const bar = Math.floor(seconds / 6),
      beat = Math.floor(seconds / 1.5);
    if (bar !== this.bar) {
      this.bar = bar;
      this.selected = this.requested;
    }
    const track =
      this.selected === "playlist"
        ? (["peace", "hope", "evening"] as const)[Math.floor(seconds / 48) % 3]
        : this.selected;
    return {
      track,
      bar,
      beat,
      chord: bar % 8,
      frequencies: tracks[track].chords[bar % 8].map(midiHz),
      melody: midiHz(tracks[track].melody[beat % 32]),
      accent: beat % 4 === 0 ? 1 : beat % 4 === 2 ? 0.8 : 0.6,
    };
  }
}
