import { QUALITY, useQuality, type Quality } from "./quality";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { GIFTS, giftKeys, type GiftKey } from "@chapel/shared";
const Chapel = lazy(() =>
  import("./StageChapel").then((module) => ({ default: module.StageChapel })),
);
import { connectSession, post, useSession } from "./store";
import { unlockAudio, playBell } from "./audio";
import { en } from "./strings";

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
function LiveView() {
  const state = useSession((s) => s.snapshot),
    connected = useSession((s) => s.connected);
  const [audio, setAudio] = useState(false);
  const active = state?.active;
  const ceremony = active?.event.giftKey === "ceremony_500";
  return (
    <main className="live-shell">
      <div
        className={`live-frame ${ceremony ? "ceremony" : ""}`}
        data-testid="live-frame"
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
          <p className="join-call">{en.join}</p>
          <p className="join-note">{en.joinNote}</p>
        </header>
        <div className="presence">
          <span className={`status-dot ${connected ? "" : "disconnected"}`} />
          {state?.attendees.length ?? 0} {en.present}
          <span className="presence-divider" /> {state?.settings.npcs ? 16 : 0}{" "}
          {en.background}
        </div>
        {!connected && (
          <div role="status" className="connection-note">
            {state ? en.offline : en.connecting}
          </div>
        )}
        {active?.event.giftKey === "altar_100" && (
          <div className="special-prayer" role="status">
            {en.specialPrayer}
          </div>
        )}
        {ceremony && (
          <div className="ceremony-banner" role="status">
            <span>✦</span>
            <h2>{en.ceremony}</h2>
            <p>
              {active.event.username} · {en.ceremonyNote}
            </p>
          </div>
        )}
        <div className="live-bottom">
          <div className="activity" role="status" data-testid="activity">
            {state?.toast ? (
              <>
                <span className="activity-star">✧</span>
                {state.toast.text}
              </>
            ) : (
              <span className="quiet">{en.quiet}</span>
            )}
          </div>
          <div className="gift-guide" aria-label={en.labelGift}>
            {giftKeys.map((key) => (
              <div className="gift-item" key={key}>
                <GiftIcon giftKey={key} />
                <div>
                  <span className="gift-price">
                    {GIFTS[key].coins}
                    <span className="coin"> ◈</span>
                  </span>
                  <span className="gift-label">{GIFTS[key].short}</span>
                </div>
              </div>
            ))}
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
          <footer className="live-footer">
            <span>✧ {en.disclosure}</span>
            <span>{en.mock}</span>
          </footer>
        </div>
        <span className="audio-hint">
          {!audio && !state?.settings.muted ? en.soundPrompt : ""}
        </span>
      </div>
    </main>
  );
}
function ControlView() {
  const quality = useQuality((s) => s.level),
    setQuality = useQuality((s) => s.set);
  const state = useSession((s) => s.snapshot),
    connected = useSession((s) => s.connected),
    fps = useSession((s) => s.fps);
  const [name, setName] = useState("Guest"),
    [userId, setUserId] = useState(
      `session-${crypto.randomUUID().slice(0, 8)}`,
    );
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [audio, setAudio] = useState(false);
  const latest = useRef(0);
  async function run(endpoint: string, data: unknown) {
    const request = ++latest.current;
    setBusy(true);
    setError("");
    try {
      const result = await post(endpoint, data);
      setMessage(
        result.status === "capacity"
          ? en.capacity
          : result.joined !== undefined
            ? `${result.joined} ${en.visitorsJoined}`
            : en.ack,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : en.error);
    } finally {
      if (request === latest.current) setBusy(false);
    }
  }
  const identity = { userId, username: name, eventId: crypto.randomUUID() };
  return (
    <main className="control-shell">
      <header className="control-header">
        <div>
          <div className="eyebrow">{en.controlEyebrow}</div>
          <h1>{en.control}</h1>
          <p>{en.controlNote}</p>
        </div>
        <a className="live-link" href="/" target="_blank" rel="noreferrer">
          {en.live} ↗
        </a>
      </header>
      <div className="connection-bar">
        <span className={`status-dot ${connected ? "" : "disconnected"}`} />
        <span data-testid="connection">
          {connected ? en.online : en.connecting}
        </span>
        <span>{en.simulation}</span>
      </div>
      <div className="control-grid">
        <div className="control-main">
          <section className="panel">
            <div className="section-number">{en.participationSection}</div>
            <h2>{en.join}</h2>
            <p>{en.free}</p>
            <div className="input-grid">
              <label>
                {en.username}
                <input
                  aria-label={en.username}
                  maxLength={32}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                {en.userId}
                <input
                  aria-label={en.userId}
                  maxLength={80}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </label>
            </div>
            <div className="button-row">
              <button
                className="primary"
                disabled={busy || !connected || !name.trim() || !userId.trim()}
                onClick={() =>
                  void run("mock/comment", { ...identity, text: "AMEN" })
                }
              >
                {en.amen} <span>↗</span>
              </button>
              <button
                disabled={busy || !connected}
                onClick={() => void run("mock/spam-amen", { count: 20 })}
              >
                + {en.burst20}
              </button>
              <button
                disabled={busy || !connected}
                onClick={() => void run("mock/spam-amen", { count: 50 })}
              >
                + {en.burst50}
              </button>
              <button
                disabled={busy || !connected}
                onClick={() => void run("mock/spam-amen", { count: 100 })}
              >
                + {en.burst100}
              </button>
            </div>
          </section>
          <section className="panel">
            <div className="section-number">{en.giftsSection}</div>
            <h2>{en.gifts}</h2>
            <p>{en.giftNote}</p>
            <div className="gift-buttons">
              {giftKeys.map((key) => (
                <button
                  data-testid={key}
                  className="gift-button"
                  key={key}
                  disabled={
                    busy || !connected || !name.trim() || !userId.trim()
                  }
                  onClick={() =>
                    void run("mock/gift", {
                      ...identity,
                      giftKey: key,
                      repeatCount: 1,
                    })
                  }
                >
                  <GiftIcon giftKey={key} />
                  <span>
                    {GIFTS[key].label}
                    <small>{key}</small>
                  </span>
                  <b>{GIFTS[key].coins} ◈</b>
                </button>
              ))}
            </div>
          </section>
          <section className="panel">
            <div className="section-number">{en.presentationSection}</div>
            <h2>{en.settings}</h2>
            <label className="toggle">
              {en.quality}
              <select
                aria-label={en.quality}
                value={quality}
                onChange={(e) => setQuality(e.target.value as Quality)}
              >
                {Object.keys(QUALITY).map((key) => (
                  <option key={key} value={key}>
                    {en[key as Quality]}
                  </option>
                ))}
              </select>
            </label>
            <p>{en.capacities}</p>
            <div className="toggles">
              {(["npcs", "muted", "camera"] as const).map((key) => (
                <label key={key} className="toggle">
                  <span>{en[key]}</span>
                  <input
                    type="checkbox"
                    checked={state?.settings[key] ?? true}
                    disabled={busy || !connected}
                    onChange={(e) =>
                      void run("mock/control", {
                        action: key,
                        enabled: e.target.checked,
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <button
              onClick={() =>
                void unlockAudio()
                  .then(setAudio)
                  .catch(() => setError(en.error))
              }
            >
              {audio ? en.audioReady : en.unlock}
            </button>
            <p className="small-note">{en.audioNote}</p>
          </section>
        </div>
        <aside>
          <section className="panel monitor">
            <div className="section-number">{en.telemetry}</div>
            <h2>{en.metrics}</h2>
            <div className="metric-primary">
              <b data-testid="viewer-count">{state?.attendees.length ?? 0}</b>
              <span>{en.viewers}</span>
            </div>
            <dl>
              {[
                [en.queue, state?.queueLength ?? 0],
                [en.accepted, state?.accepted ?? 0],
                [en.completed, state?.completed ?? 0],
                [en.rejected, state?.rejected ?? 0],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="fps-readout">
              <span>{en.fps}</span>
              <strong data-testid="fps">
                {fps.length ? fps.join(" / ") : "—"}
              </strong>
            </div>
            <p className="small-note">
              {fps.length ? en.fpsGoal : en.noRenderer}
            </p>
            {state?.active && (
              <div className="now-playing">
                <span>{en.playing}</span>
                <b>{GIFTS[state.active.event.giftKey].label}</b>
                <small>{state.active.event.username}</small>
              </div>
            )}
          </section>
          <section className="panel reset-panel">
            <h2>{en.reset}</h2>
            <p>{en.resetNote}</p>
            <button
              className="danger"
              disabled={busy || !connected}
              onClick={() => {
                if (confirm(en.confirmReset))
                  void run("mock/control", { action: "reset" });
              }}
            >
              {en.reset} ↺
            </button>
          </section>
        </aside>
      </div>
      <div className={`feedback ${error ? "error" : ""}`} role="status">
        {error || (busy ? en.pending : message)}
      </div>
      <footer className="control-footer">{en.footer}</footer>
    </main>
  );
}
export function App() {
  useEffect(connectSession, []);
  const active = useSession((s) => s.snapshot?.active);
  useEffect(() => {
    if (
      active &&
      (active.event.giftKey === "bell_10" ||
        active.event.giftKey === "ceremony_500")
    )
      playBell(active.event.eventId);
  }, [active?.event.eventId]);
  return location.pathname === "/control" ? <ControlView /> : <LiveView />;
}
