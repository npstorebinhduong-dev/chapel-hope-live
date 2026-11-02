import { useEffect, useState, type CSSProperties } from "react";
import { GIFTS, giftKeys, type Snapshot } from "@chapel/shared";
import type {
  ProductionSettings,
  Locale,
} from "../../../packages/shared/src/production";
import { GiftIcon } from "./GiftIcon";
import { giftLabels } from "./locales";
export const guideText = {
  en: {
    join: "Type AMEN to join the waiting crowd",
    gender: "1 = Male · 2 = Female",
    free: "A moment of peace, open to everyone",
    heart: "Heart of Hope",
    tap: "Tap hearts to light our chapel",
    share: "Share this LIVE",
    dove: "A white dove carries your kindness",
    actions: "Six moments of hope",
    coins: "coins",
    note: "Game actions · TikTok gifts require configured IDs",
    shares: "shares",
    demo: "DEMO",
    pending: "Waiting for verified events",
    more: "more waiting",
  },
  vi: {
    join: "Bình luận AMEN để vào hàng chờ",
    gender: "1 = Nam · 2 = Nữ",
    free: "Khoảnh khắc bình an dành cho mọi người",
    heart: "Trái tim hy vọng",
    tap: "Thả tim để thắp sáng thánh đường",
    share: "Chia sẻ buổi LIVE này",
    dove: "Bồ câu trắng mang theo lòng tốt của bạn",
    actions: "Sáu khoảnh khắc hy vọng",
    coins: "xu",
    note: "Hoạt động trong game · quà TikTok cần ánh xạ ID",
    shares: "chia sẻ",
    demo: "GIẢ LẬP",
    pending: "Đang chờ sự kiện được xác nhận",
    more: "người chờ khác",
  },
  it: {
    join: "Scrivi AMEN per unirti alla fila d’attesa",
    gender: "1 = Uomo · 2 = Donna",
    free: "Un momento di pace aperto a tutti",
    heart: "Cuore di speranza",
    tap: "Tocca i cuori per illuminare la cappella",
    share: "Condividi questa LIVE",
    dove: "Una colomba bianca porta la tua gentilezza",
    actions: "Sei momenti di speranza",
    coins: "monete",
    note: "Azioni del gioco · i regali TikTok richiedono ID configurati",
    shares: "condivisioni",
    demo: "DEMO",
    pending: "In attesa di eventi verificati",
    more: "altre persone in attesa",
  },
};
export function HeartsProgress({
  state,
  locale,
}: {
  state: Snapshot | null;
  locale: Locale;
}) {
  const t = guideText[locale],
    c = state?.community;
  const celebrating = c?.reaction?.kind === "heart";
  const value = celebrating ? c.goal : (c?.progress ?? 0),
    goal = c?.goal ?? 1000;
  return (
    <div
      className="hearts-progress"
      data-testid="hearts-progress"
      data-hearts={c?.hearts ?? 0}
      data-milestones={c?.heartMilestones ?? 0}
    >
      <div>
        <span>♡ {t.heart}</span>
        <strong>
          {value.toLocaleString(locale)} / {goal.toLocaleString(locale)}
        </strong>
      </div>
      <div
        role="progressbar"
        aria-label={t.heart}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={goal}
        className="heart-track"
      >
        <i style={{ width: `${Math.min(100, (value / goal) * 100)}%` }} />
      </div>
      <small>
        {c?.hearts ?? 0} ♥ · {c?.shares ?? 0} {t.shares} ·{" "}
        {state?.source?.mode !== "tikfinity"
          ? t.demo
          : !state.source.likeReceived && !state.source.shareReceived
            ? t.pending
            : "TikFinity"}
      </small>
    </div>
  );
}
export function LiveGuidePanel({
  state,
  production,
  focus,
}: {
  state: Snapshot | null;
  production: ProductionSettings;
  focus: boolean;
}) {
  const [turn, setTurn] = useState(0),
    g = production.guide,
    t = guideText[production.locale];
  useEffect(() => {
    const timer = setInterval(
      () => setTurn((n) => (n + 1) % 3),
      g.cycle * 1000,
    );
    return () => clearInterval(timer);
  }, [g.cycle]);
  const group =
    g.preview === "auto" ? ["join", "social", "gifts"][turn] : g.preview;
  if (!g.enabled) return null;
  return (
    <aside
      className={`live-guide ${focus ? "guide-focus" : ""} guide-${g.position}`}
      style={
        {
          "--guide-opacity": g.opacity,
          "--guide-scale": g.scale,
        } as CSSProperties
      }
      data-testid="live-guide"
      data-group={group}
    >
      <p className="guide-join">
        <b>✦</b> {t.join}
      </p>
      <p className="guide-gender">{t.gender}</p>
      <div className="guide-page" key={group}>
        {group === "join" && <p className="guide-peace">{t.free}</p>}
        {group === "social" && (
          <div className="guide-social">
            <span>♡ {t.tap}</span>
            <span>
              ♧ {t.share}
              <small>{t.dove}</small>
            </span>
          </div>
        )}
        {group === "gifts" && (
          <>
            <div className="guide-gifts">
              {giftKeys.map((key) => (
                <div key={key} data-gift={key}>
                  <GiftIcon giftKey={key} />
                  <span>
                    <b>
                      {GIFTS[key].coins} {t.coins}
                    </b>
                    <small>{giftLabels[production.locale][key]}</small>
                  </span>
                </div>
              ))}
            </div>
            <small className="guide-note">{t.note}</small>
          </>
        )}
      </div>
      <HeartsProgress state={state} locale={production.locale} />
    </aside>
  );
}
