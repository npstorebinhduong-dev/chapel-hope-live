import { lazy, Suspense, useEffect, useState } from "react";
const Chapel = lazy(() =>
  import("./StageChapel").then((module) => ({ default: module.StageChapel })),
);
import { connectSession, useSession } from "./store";
import { unlockAudio } from "./audio";
import { useSceneAudio } from "./audio/useSceneAudio";
import { ui, giftLabels } from "./locales";
import { defaultProduction } from "../../../packages/shared/src/production";
import { useVoiceState } from "./voice/runtime";
import { AdminPanel } from "./AdminPanel";
import { LiveGuidePanel, guideText } from "./LiveGuidePanel";

function LiveView() {
  const state = useSession((s) => s.snapshot),
    connected = useSession((s) => s.connected);
  const [audio, setAudio] = useState(false);
  const production = state?.production ?? defaultProduction();
  const en = ui[production.locale];
  const voice = useVoiceState();
  const active =
    state?.active &&
    state.now >= state.active.startedAt &&
    state.now < state.active.endsAt
      ? state.active
      : null;
  const ceremony = active?.event.giftKey === "ceremony_500";
  const cinematic =
    ceremony ||
    active?.event.giftKey === "altar_100" ||
    (production.bannerEnabled && (voice.banner?.priority ?? 0) >= 2);
  return (
    <main className="live-shell">
      <div
        className={`live-frame ${ceremony ? "ceremony" : ""} ${cinematic ? "cinematic" : ""}`}
        data-testid="live-frame"
        lang={production.locale}
        onPointerDown={() => {
          void unlockAudio()
            .then(setAudio)
            .catch(() => {});
        }}
      >
        <div className="scene">
          <Suspense fallback={null}>
            <Chapel />
          </Suspense>
        </div>
        <div className="vignette" />
        <header className="live-header">
          <div className="eyebrow">
            <span className="ornament">✦</span>
            {en.edition}
            <span className="ornament">✦</span>
          </div>
          <h1>{en.title}</h1>
          <div className="title-rule">
            <span />✧<span />
          </div>
        </header>
        <LiveGuidePanel
          state={state}
          production={production}
          focus={!!state?.active}
        />
        <div className="presence">
          <span className={`status-dot ${connected ? "" : "disconnected"}`} />
          <span data-testid="live-waiting">
            {state?.waitingCount ?? 0} {en.waiting}
          </span>
          <span data-testid="live-inside">
            {state?.insideCount ?? 0} {en.inside}
          </span>
          {(state?.enteringCount ?? 0) > 0 && (
            <span>
              {state?.enteringCount} {en.entering}
            </span>
          )}
          <span className="presence-divider" /> {state?.settings.npcs ? 16 : 0}{" "}
          {en.background}
        </div>
        {!connected && (
          <div role="status" className="connection-note">
            {state ? en.offline : en.connecting}
          </div>
        )}
        {production.bannerEnabled && voice.banner && (
          <div
            className="wish-banner"
            role="status"
            data-testid="wish-banner"
            lang={voice.banner.locale}
            data-locale={voice.banner.locale}
            data-fading={voice.fading}
            data-speaking={voice.speaking}
            data-priority={voice.banner.priority}
            key={voice.banner.id}
          >
            <strong>{voice.banner.name}</strong>
            <p>{voice.banner.text}</p>
          </div>
        )}
        <div className="live-bottom">
          <div className="activity" role="status" data-testid="activity">
            <span className="quiet">
              {active
                ? giftLabels[production.locale][active.event.giftKey]
                : en.quiet}
            </span>
          </div>
          <div className="supporters">
            <span className="supporters-title">{en.supporters}</span>
            {state?.supporters.length ? (
              <div className="supporter-list">
                {state.supporters.map((s, i) => (
                  <span key={s.userId}>
                    <b>{["Ⅰ", "Ⅱ", "Ⅲ"][i]}</b>
                    {s.username}
                    <em>{s.coins} ◈</em>
                  </span>
                ))}
              </div>
            ) : (
              <span className="supporters-empty">{en.emptySupporters}</span>
            )}
          </div>
        </div>
        {!!state?.hiddenWaiting && (
          <span className="hidden-waiting">
            +{state.hiddenWaiting} {guideText[production.locale].more}
          </span>
        )}
        <footer className="live-footer">
          <span>✧ {en.disclosure}</span>
          <span>
            {state?.source?.mode === "tikfinity"
              ? `TIKFINITY · ${connected ? "●" : "○"}`
              : en.mock}
          </span>
        </footer>
        <span className="audio-hint">
          {!audio && !state?.settings.muted ? en.soundPrompt : ""}
        </span>
      </div>
    </main>
  );
}
export function ControlView() {
  return <AdminPanel />;
}
export function App() {
  useEffect(connectSession, []);
  useSceneAudio();
  return location.pathname === "/control" ? <ControlView /> : <LiveView />;
}
