import type { GiftKey } from "@chapel/shared";
export function GiftIcon({ giftKey }: { giftKey: GiftKey }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...common}>
      {giftKey === "candle_1" ? (
        <>
          <path d="M11 27V14h10v13M8 28h16M13 11c-4-4 3-5 3-9 5 4 5 8 0 9M16 16v4" />
        </>
      ) : giftKey === "prayer_5" ? (
        <>
          <path d="m5 26 5-8 3-12c.5-2 3-2 3 0v13l-4 9M27 26l-5-8-3-12c-.5-2-3-2-3 0v13l4 9M6 23l5 3M26 23l-5 3" />
        </>
      ) : giftKey === "rose_5" ? (
        <>
          <path d="M16 29V15m0 7c8-7 10 0 0 3m0-6c-9-6-9 1 0 3" />
          <path d="M16 5c8-6 13 4 6 7 1 8-12 9-12 1C1 8 9 0 16 5Z" />
          <path d="M12 9c6-5 11 3 5 5-5 2-8-4-3-5" />
        </>
      ) : giftKey === "bell_10" ? (
        <>
          <path d="M6 24c5-4 2-10 5-14 2-3 8-3 10 0 3 4 0 10 5 14H6Zm8 4h4M14 5h4M16 3v3M4 9 2 7m26 2 2-2" />
        </>
      ) : giftKey === "altar_100" ? (
        <>
          <path d="M4 20h24v3H4zm3 3v6m18-6v6M16 17V3m-5 5h10M8 17v-4m16 4v-4" />
        </>
      ) : (
        <>
          <path d="m16 2 3 10 10 4-10 3-3 11-4-11-10-3 10-4 4-10ZM25 3v6m-3-3h6M4 24v5m-2-2h5" />
        </>
      )}
    </svg>
  );
}
