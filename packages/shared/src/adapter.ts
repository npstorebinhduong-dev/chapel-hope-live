import { GIFTS, LIMITS, type GiftEvent, type GiftKey } from "./index.ts";

/** Integration boundary only: no TikTok client, credentials or verified platform mappings. */
export interface PlatformGift {
  platformGiftId: string;
  transactionId: string;
  sessionUserId: string;
  displayName: string;
  cumulativeRepeatCount: number;
  final: boolean;
  timestamp: number;
}
export class GiftAdapter {
  private completed = new Map<string, number>();
  constructor(
    private readonly verifiedMapping: Readonly<Record<string, GiftKey>>,
  ) {}
  normalize(input: PlatformGift): GiftEvent | null {
    for (const [id, time] of this.completed)
      if (input.timestamp - time > LIMITS.ttl) this.completed.delete(id);
    const key = this.verifiedMapping[input.platformGiftId];
    if (!key || !input.final || this.completed.has(input.transactionId))
      return null;
    if (
      !input.transactionId ||
      input.transactionId.length > 80 ||
      !input.sessionUserId ||
      input.sessionUserId.length > 80 ||
      !Number.isSafeInteger(input.cumulativeRepeatCount) ||
      input.cumulativeRepeatCount < 1 ||
      input.cumulativeRepeatCount > 20 ||
      !Number.isFinite(input.timestamp)
    )
      throw new Error("Invalid platform event");
    this.completed.set(input.transactionId, input.timestamp);
    while (this.completed.size > LIMITS.dedup)
      this.completed.delete(this.completed.keys().next().value!);
    return {
      type: "gift",
      eventId: input.transactionId,
      userId: input.sessionUserId,
      username: input.displayName.trim().slice(0, 32) || "Guest",
      giftKey: key,
      coinValue: GIFTS[key].coins,
      repeatCount: input.cumulativeRepeatCount,
      timestamp: input.timestamp,
    };
  }
}
