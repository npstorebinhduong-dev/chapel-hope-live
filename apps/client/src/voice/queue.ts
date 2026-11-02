import type { VoiceProvider, VoiceRequest, VoiceResult } from "./providers";
export interface VoiceJob extends VoiceRequest {
  id: string;
  priority: number;
  created: number;
  expires: number;
  enabled: boolean;
  name: string;
  provider: VoiceProvider;
}
/** One active utterance; bounded pending work, deadline and 3:1 priority fairness. */
export class VoiceQueue {
  pending: VoiceJob[] = [];
  active: VoiceJob | null = null;
  skipped = 0;
  private deferredBanner: VoiceJob | null = null;
  private priorityRun = 0;
  private generation = 0;
  private deadline: ReturnType<typeof setTimeout> | undefined;
  constructor(
    private banner: (job: VoiceJob) => void,
    private duck: (active: boolean) => void,
    private result: (status: VoiceResult) => void,
  ) {}
  enqueue(job: VoiceJob) {
    if (this.active?.id === job.id || this.pending.some((j) => j.id === job.id))
      return;
    if (!this.active) {
      this.pending.push(job);
      this.pump();
      return;
    }
    if (
      this.pending.length >= 4 ||
      (job.priority === 0 && this.pending.some((j) => j.priority === 0))
    ) {
      this.skipped++;
      this.deferredBanner = job;
      return;
    }
    this.pending.push(job);
  }
  private pump() {
    if (this.active) return;
    const now = Date.now();
    this.pending = this.pending.filter((j) => {
      if (j.expires < now) {
        this.skipped++;
        this.deferredBanner = j;
        return false;
      }
      return true;
    });
    if (!this.pending.length) {
      if (this.deferredBanner) {
        this.banner(this.deferredBanner);
        this.deferredBanner = null;
      }
      return;
    }
    let index = 0;
    if (this.priorityRun < 3) {
      for (let i = 1; i < this.pending.length; i++)
        if (this.pending[i].priority > this.pending[index].priority) index = i;
      this.priorityRun++;
    } else this.priorityRun = 0;
    const job = (this.active = this.pending.splice(index, 1)[0]),
      generation = this.generation;
    this.banner(job);
    if (!job.enabled || !job.provider.available(job)) {
      this.result(job.enabled ? "missing" : "blocked");
      this.active = null;
      this.pump();
      return;
    }
    let finished = false;
    const done = (status: VoiceResult) => {
      if (finished || generation !== this.generation) return;
      finished = true;
      clearTimeout(deadline);
      this.duck(false);
      this.result(status);
      this.active = null;
      this.pump();
    };
    const deadline = (this.deadline = setTimeout(
      () => {
        if (generation === this.generation) {
          job.provider.cancel();
          done("timeout");
        }
      },
      Math.min(10000, Math.max(500, job.expires - now)),
    ));
    void job.provider
      .play(job, () => {
        if (!finished && generation === this.generation) this.duck(true);
      })
      .then(done, () => done("error"));
  }
  stop() {
    clearTimeout(this.deadline);
    this.generation++;
    this.active?.provider.cancel();
    this.active = null;
    this.pending = [];
    this.deferredBanner = null;
    this.duck(false);
  }
}
