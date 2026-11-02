import { useEffect, useRef, useState } from "react";
import { GIFTS, giftKeys, type GiftKey } from "@chapel/shared";
import {
  defaultProduction,
  defaultSource,
  type Locale,
  type ProductionSettings,
} from "../../../packages/shared/src/production";
import {
  adminVi as v,
  adminError,
  eventVi,
  voiceStatusVi,
} from "./adminLocales/vi";
import { useSession, post } from "./store";
import { useQuality, type Quality } from "./quality";
import { chapelAudio } from "./audio/runtime";
import { useAudioSettings } from "./audio/settings";
import {
  browserVoice,
  recordedVoice,
  queueWish,
  useVoiceState,
  voiceQueue,
} from "./voice/runtime";
import { giftLabels } from "./locales";
import { GiftIcon } from "./GiftIcon";
export function AdminPanel() {
  const state = useSession((s) => s.snapshot),
    connected = useSession((s) => s.connected),
    reports = useSession((s) => s.liveReports);
  const source = state?.source ?? defaultSource(),
    community = state?.community;
  const [settings, setSettings] = useState(
      state?.production ?? defaultProduction(),
    ),
    current = useRef(settings),
    pending = useRef(0),
    writes = useRef(Promise.resolve());
  useEffect(() => {
    if (state?.production && !pending.current) {
      current.current = state.production;
      setSettings(state.production);
    }
  }, [state?.production]);
  const [tab, setTab] = useState(0),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [name, setName] = useState(v.guest),
    [userId, setUserId] = useState(`demo-${crypto.randomUUID().slice(0, 8)}`),
    [combo, setCombo] = useState(1);
  const [endpoint, setEndpoint] = useState(source.endpoint),
    [mapping, setMapping] = useState<Record<string, GiftKey>>(source.mapping),
    [checks, setChecks] = useState<Record<string, string>>({});
  const quality = useQuality((s) => s.level),
    setQuality = useQuality((s) => s.set),
    audio = useAudioSettings(),
    voice = useVoiceState();
  const [audioUnlocked, setAudioUnlocked] = useState(false),
    [clipVersion, setClipVersion] = useState(0);
  useEffect(() => {
    setMapping(source.mapping);
    setEndpoint(source.endpoint);
  }, [JSON.stringify(source.mapping), source.endpoint]);
  useEffect(() => {
    if (settings.provider === "recorded")
      void recordedVoice.load().then(() => setClipVersion((n) => n + 1));
  }, [settings.provider]);
  async function run(path: string, data: unknown) {
    setError("");
    setBusy(true);
    try {
      const r = await post(path, data);
      if (r.status === "capacity") throw new Error("capacity");
      setMessage(r.joined !== undefined ? `${v.ack} · ${r.joined}` : v.ack);
      return true;
    } catch (e) {
      setError(adminError(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  function patch(p: Partial<ProductionSettings>) {
    const next = { ...current.current, ...p };
    current.current = next;
    setSettings(next);
    pending.current++;
    writes.current = writes.current.then(async () => {
      await run("production", next);
      pending.current--;
    });
  }
  async function unlock() {
    try {
      setAudioUnlocked(await chapelAudio.unlock());
      return true;
    } catch (e) {
      setError(adminError(e));
      return false;
    }
  }
  const identity = { userId, username: name },
    isMock = source.mode === "mock",
    canTest = connected && isMock && !busy && !!name.trim() && !!userId.trim();
  const testGift = (key: GiftKey) =>
    void run("mock/gift", { ...identity, giftKey: key, repeatCount: combo });
  const social = (type: "like" | "share" | "follow", count = 1) =>
    void run("mock/engagement", { ...identity, type, count });
  const voices = browserVoice.list(settings.locale);
  const available =
    settings.provider === "browser"
      ? voices.length > 0
      : clipVersion >= 0 &&
        giftKeys.every((key) =>
          [0, 1, 2].every((i) =>
            recordedVoice.available({
              locale: settings.locale,
              clipKey: `${key}-${i}`,
            } as never),
          ),
        );
  const report = reports?.find((r) => r.canvas && Date.now() - r.at < 10000);
  async function sample(locale: Locale) {
    if (
      state?.settings.muted ||
      !settings.voiceEnabled ||
      settings.mix.voice === 0 ||
      settings.mix.master === 0
    ) {
      setError(v.muted + " · " + v.voiceEnabled + " · " + v.mix.voice);
      return;
    }
    if (report?.audio) {
      await run("audio/command", { action: "sample", locale });
      return;
    }
    if (await unlock())
      queueWish(crypto.randomUUID(), "altar_100", "", { ...settings, locale });
  }
  async function preflight() {
    let server = false;
    try {
      const r = await fetch("/api/health");
      server = r.ok && (await r.json()).ok;
    } catch {}
    const pairs: Record<string, boolean | undefined> = {
      server,
      canvas: report?.canvas,
      ratio: report ? Math.abs(report.ratio - 9 / 16) < 0.01 : undefined,
      audio: report?.audio,
      voice: report?.voice,
      mapping: giftKeys.every((k) => Object.values(source.mapping).includes(k)),
      socket: source.connection === "connected",
      like: source.likeReceived,
      share: source.shareReceived,
      capture: undefined,
      windows: undefined,
      live: undefined,
    };
    setChecks(
      Object.fromEntries(
        Object.entries(pairs).map(([k, b]) => [
          v.preflightItems[k as keyof typeof v.preflightItems],
          b === undefined ? v.pendingVerify : b ? v.pass : v.fail,
        ]),
      ),
    );
  }
  function toggle(
    label: string,
    checked: boolean,
    onChange: (b: boolean) => void,
  ) {
    return (
      <label className="admin-toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
    );
  }
  const meter = chapelAudio.diagnostics();
  const levels = report?.audioLevels ?? {
    master: audio.level,
    ...meter.busLevels,
  };
  const speaking = report?.audio
    ? report.voiceStatus === "speaking"
    : voice.speaking;
  const metricEntries: [string, unknown][] = [
    [v.viewers, state?.totalAttendees ?? state?.attendees.length ?? 0],
    [v.waiting, state?.waitingCount ?? 0],
    [v.inside, state?.insideCount ?? 0],
    [v.seated, state?.seatedCount ?? 0],
    [v.entering, state?.enteringCount ?? 0],
    [v.hearts, community?.hearts ?? 0],
    [v.shares, community?.shares ?? 0],
    [v.follows, community?.follows ?? 0],
    [v.amen, community?.amen ?? 0],
    [v.accepted, state?.accepted ?? 0],
    [v.completed, state?.completed ?? 0],
    [v.queue, state?.giftPending ?? 0],
    [
      v.duplicates,
      (state?.ignoredDuplicates ?? 0) + (community?.duplicates ?? 0),
    ],
    [v.hidden, state?.hiddenWaiting ?? 0],
    [v.compactWaiting, state?.compactWaiting ?? 0],
    [v.capacityRefusals, state?.capacityRefusals ?? 0],
    [v.fps, report?.fps ?? v.unknownMetric],
    [v.retention, v.unknownMetric],
  ];
  return (
    <main className="admin-shell" lang="vi" data-testid="admin-vi">
      <header className="admin-header">
        <div>
          <small>{v.edition}</small>
          <h1>{v.title}</h1>
          <p title={v.verificationHelp}>{v.verification}</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer">
          {v.openLive} ↗
        </a>
      </header>
      <div className="admin-status">
        <span className={`status-dot ${connected ? "" : "disconnected"}`} />
        {connected ? v.ready : v.connecting} · {isMock ? v.mock : v.live}
        <button
          className="danger"
          onClick={() => {
            voiceQueue.stop();
            chapelAudio.stop();
            setAudioUnlocked(false);
            void run("audio/command", { action: "stopAll" });
            void run("mock/control", { action: "muted", enabled: true });
          }}
        >
          {v.stopAll}
        </button>
      </div>
      <nav className="admin-nav" role="tablist" aria-label={v.title}>
        {v.tabs.map((label, i) => (
          <button
            key={label}
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
          >
            {label}
          </button>
        ))}
      </nav>
      <section
        className="admin-content"
        role="tabpanel"
        aria-label={v.tabs[tab]}
      >
        <h2>{v.tabs[tab]}</h2>
        {tab === 0 && (
          <>
            <dl className="admin-metrics">
              {metricEntries.map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd
                    data-testid={key === v.viewers ? "viewer-count" : undefined}
                  >
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              {v.npc}: {state?.settings.npcs ? 16 : 0}
            </p>
            <h3>{v.rates}</h3>
            <p>
              {v.hearts}: {community?.currentMinute.hearts ?? 0} · {v.shares}:{" "}
              {community?.currentMinute.shares ?? 0} · {v.accepted}:{" "}
              {community?.currentMinute.gifts ?? 0} · {v.amen}:{" "}
              {community?.currentMinute.amen ?? 0}
            </p>
            <p>
              {v.delay}:{" "}
              {state?.active
                ? Math.max(
                    0,
                    Math.round(
                      (state.active.startedAt -
                        (state.active.dispatchedAt ?? state.now)) /
                        1000,
                    ),
                  )
                : 0}{" "}
              {v.seconds}
            </p>
            <p>{v.demoHelp}</p>
          </>
        )}
        {tab === 1 && (
          <>
            <label>
              {v.source}
              <select
                aria-label={v.source}
                value={source.mode}
                onChange={async (e) => {
                  const mode = e.target.value;
                  if (mode !== source.mode && !confirm(v.sourceReset)) return;
                  await run("source", { mode, endpoint, mapping, reset: true });
                }}
              >
                <option value="mock">{v.mock}</option>
                <option value="tikfinity">{v.live}</option>
              </select>
            </label>
            <label>
              {v.endpoint}
              <input
                aria-label={v.endpoint}
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </label>
            <div className="button-row">
              <button
                onClick={() =>
                  void run("source", { mode: source.mode, endpoint, mapping })
                }
              >
                {v.save}
              </button>
              <button
                disabled={isMock}
                onClick={() => void run("source/connect", {})}
              >
                {v.connect}
              </button>
              <button onClick={() => void run("source/disconnect", {})}>
                {v.disconnect}
              </button>
              <button
                disabled={isMock}
                onClick={async () => {
                  await run("source/disconnect", {});
                  await run("source/connect", {});
                }}
              >
                {v.retry}
              </button>
            </div>
            <p>{v.connection[source.connection]}</p>
            <p>{v.sourceNote}</p>
            <p>{source.error ? adminError(source.error) : ""}</p>
            <dl className="admin-metrics">
              {[
                [v.received, source.received],
                [v.ignored, source.ignored],
                [v.duplicates, source.duplicates],
                [v.unverifiedLikes, source.unverifiedLikes],
                [v.unverifiedShares, source.unverifiedShares],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt>{a}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>
            <p>
              {source.likeReceived ? v.likesReceived : v.waitingData} ·{" "}
              {source.shareReceived ? v.sharesReceived : v.waitingData}
            </p>
            <h3>{v.events}</h3>
            <ul className="admin-log">
              {source.log
                .slice(-20)
                .reverse()
                .map((e, i) => (
                  <li key={i}>
                    {new Date(e.at).toLocaleTimeString("vi-VN")} ·{" "}
                    {eventVi(e.event)}
                  </li>
                ))}
            </ul>
          </>
        )}
        {tab === 2 && (
          <>
            <p>{v.giftIntro}</p>
            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    {[
                      v.action,
                      v.coins,
                      v.giftId,
                      v.giftName,
                      v.status,
                      v.test,
                    ].map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {giftKeys.map((key) => {
                    const id =
                        Object.keys(mapping).find(
                          (id) => mapping[id] === key,
                        ) ?? "",
                      observed = source.observed.find((g) => g.giftId === id);
                    return (
                      <tr key={key}>
                        <td>
                          <GiftIcon giftKey={key} />
                          {giftLabels.vi[key]}
                          <small>{key}</small>
                        </td>
                        <td>{GIFTS[key].coins}</td>
                        <td>
                          <input
                            aria-label={`${v.giftId} ${key}`}
                            inputMode="numeric"
                            value={id}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (mapping[value] && mapping[value] !== key) {
                                setError(v.duplicateMapping);
                                return;
                              }
                              const m = { ...mapping };
                              for (const k in m) if (m[k] === key) delete m[k];
                              if (value) m[value] = key;
                              setMapping(m);
                            }}
                          />
                        </td>
                        <td>
                          {observed?.name ?? v.unknownMetric}
                          {observed ? ` · ${observed.coins ?? "?"}` : ""}
                        </td>
                        <td>
                          {id ? (observed ? v.observed : v.mapped) : v.unmapped}
                        </td>
                        <td>
                          <button
                            data-testid={key}
                            disabled={!canTest}
                            onClick={() => testGift(key)}
                          >
                            {v.test}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              onClick={() =>
                void run("source", { mode: source.mode, endpoint, mapping })
              }
            >
              {v.saveMapping}
            </button>
            <label>
              {v.combo}
              <input
                type="number"
                min="1"
                max="20"
                value={combo}
                onChange={(e) =>
                  setCombo(Math.max(1, Math.min(20, Number(e.target.value))))
                }
              />
            </label>
            <p>
              {v.username}: {name} · {v.userId}: {userId}
            </p>
            <p>
              {v.unknownGifts}:{" "}
              {source.unknown
                .map((g) => `${g.giftId} · ${g.name}`)
                .join(" / ") || v.empty}
            </p>
            {toggle(
              v.camera,
              state?.settings.camera ?? true,
              (b) => void run("mock/control", { action: "camera", enabled: b }),
            )}
            <label>
              {v.quality}
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as Quality)}
              >
                {(["low", "balanced", "high"] as const).map((k) => (
                  <option key={k} value={k}>
                    {v[k]}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {tab === 3 && (
          <>
            <div className="admin-fields">
              <label>
                {v.locale}
                <select
                  aria-label={v.locale}
                  value={settings.locale}
                  onChange={(e) => patch({ locale: e.target.value as Locale })}
                >
                  {(["en", "vi", "it"] as const).map((l) => (
                    <option key={l} value={l}>
                      {v.languages[l]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {v.provider}
                <select
                  value={settings.provider}
                  onChange={(e) =>
                    patch({
                      provider: e.target.value as "browser" | "recorded",
                    })
                  }
                >
                  <option value="browser">{v.browser}</option>
                  <option value="recorded">{v.recorded}</option>
                </select>
              </label>
              <label>
                {v.voice}
                <select
                  aria-label={v.voice}
                  value={settings.voiceURI[settings.locale]}
                  onChange={(e) =>
                    patch({
                      voiceURI: {
                        ...settings.voiceURI,
                        [settings.locale]: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">{v.automatic}</option>
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} · {voice.lang}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p data-testid="voice-availability">
              {available ? v.voiceReady : v.missingVoice}
            </p>
            <p>{v.voiceNote}</p>
            <p>
              {voiceStatusVi[voice.status] ?? v.pendingVerify} · {v.openLive}:{" "}
              {voiceStatusVi[report?.voiceStatus ?? ""] ?? v.pendingVerify}
            </p>
            <label>
              {v.rate}
              <input
                type="range"
                aria-label={v.rate}
                min="0.85"
                max="1.1"
                step="0.01"
                value={settings.rate}
                onChange={(e) => patch({ rate: Number(e.target.value) })}
              />
              {settings.rate.toFixed(2)}
            </label>
            <div className="admin-toggles">
              {(
                [
                  "voiceEnabled",
                  "thanksEnabled",
                  "bannerEnabled",
                  "readNames",
                  "musicEnabled",
                ] as const
              ).map((k) => (
                <div key={k}>
                  {toggle(v[k], settings[k], (b) => patch({ [k]: b }))}
                </div>
              ))}
              {toggle(
                v.muted,
                state?.settings.muted ?? true,
                (b) =>
                  void run("mock/control", { action: "muted", enabled: b }),
              )}
            </div>
            <div className="button-row">
              <button onClick={() => void unlock()}>
                {audioUnlocked ? v.audioUnlocked : v.unlock}
              </button>
              {(["en", "vi", "it"] as const).map((l) => (
                <button key={l} onClick={() => void sample(l)}>
                  {v.sample} · {v.languages[l]}
                </button>
              ))}
              <button
                onClick={() =>
                  void run("audio/command", { action: "stopVoice" })
                }
              >
                {v.stopVoice}
              </button>
              <button
                disabled={
                  state?.audioCommand?.action !== "stopVoice" ||
                  state?.settings.muted
                }
                onClick={() =>
                  void run("audio/command", { action: "resumeVoice" })
                }
              >
                {v.resumeVoice}
              </button>
            </div>
            <p>{v.audioNote}</p>
            <label>
              {v.track}
              <select
                aria-label={v.track}
                value={settings.musicTrack}
                onChange={(e) =>
                  patch({
                    musicTrack: e.target
                      .value as ProductionSettings["musicTrack"],
                  })
                }
              >
                {Object.entries(v.tracks).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <p>{v.musicNote}</p>
            <div className="audio-mixer">
              {(["master", "music", "ambient", "sfx", "voice"] as const).map(
                (k) => (
                  <label key={k}>
                    {v.mix[k]}
                    <input
                      aria-label={v.mix[k]}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={settings.mix[k]}
                      onChange={(e) =>
                        patch({
                          mix: {
                            ...current.current.mix,
                            [k]: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <span>{Math.round(settings.mix[k] * 100)}%</span>
                    <meter
                      aria-label={`${v.meter} ${v.mix[k]}`}
                      min="0"
                      max="0.2"
                      value={
                        k === "voice"
                          ? speaking
                            ? 0.1
                            : 0
                          : Number(levels[k] ?? 0)
                      }
                    />
                  </label>
                ),
              )}
            </div>
            <p>
              {v.voiceMeter} · {speaking ? v.speaking : v.silent}
            </p>
            <p>
              {v.dropped}: {voice.skipped}
            </p>
            <button
              onClick={async () => {
                if (state?.settings.muted) {
                  setError(v.muted);
                  return;
                }
                if (report?.audio)
                  await run("audio/command", { action: "testAll" });
                else if (await unlock()) chapelAudio.testAll();
              }}
            >
              {v.audioTest}
            </button>
            <p>{v.audioTestNote}</p>
            <output
              data-testid="audio-status"
              data-audio={JSON.stringify(meter)}
            >
              {v.meter}: {(levels.master ?? 0).toFixed(5)}
            </output>
          </>
        )}
        {tab === 4 && (
          <>
            <div className="admin-fields">
              <label>
                {v.heartGoal}
                <select
                  value={settings.engagement.heartGoal}
                  onChange={(e) =>
                    patch({
                      engagement: {
                        ...settings.engagement,
                        heartGoal: Number(e.target.value) as
                          250 | 500 | 1000 | 2000,
                      },
                    })
                  }
                >
                  {[250, 500, 1000, 2000].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                {v.shareGoal}
                <select
                  value={settings.engagement.shareGoal}
                  onChange={(e) =>
                    patch({
                      engagement: {
                        ...settings.engagement,
                        shareGoal: Number(e.target.value) as 5 | 10 | 20,
                      },
                    })
                  }
                >
                  {[5, 10, 20].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-toggles">
              {(
                [
                  "heartsEnabled",
                  "sharesEnabled",
                  "idleEnabled",
                  "communityEnabled",
                  "promptsEnabled",
                  "quiet",
                ] as const
              ).map((k) => (
                <div key={k}>
                  {toggle(v[k], settings.engagement[k], (b) =>
                    patch({ engagement: { ...settings.engagement, [k]: b } }),
                  )}
                </div>
              ))}
            </div>
            {(["cooldown", "inactivity"] as const).map((k) => (
              <label key={k}>
                {v[k]}
                <input
                  type="number"
                  min={k === "cooldown" ? 90 : 45}
                  max={k === "cooldown" ? 600 : 120}
                  value={settings.engagement[k]}
                  onChange={(e) =>
                    patch({
                      engagement: {
                        ...settings.engagement,
                        [k]: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
            <label>
              {v.promptVariant}
              <select
                value={settings.engagement.promptVariant}
                onChange={(e) =>
                  patch({
                    engagement: {
                      ...settings.engagement,
                      promptVariant: e.target.value as "A" | "B",
                    },
                  })
                }
              >
                <option>A</option>
                <option>B</option>
              </select>
            </label>
            <p>{v.inviteNote}</p>
            <button onClick={() => void run("engagement/invite", {})}>
              {v.invite}
            </button>
            <p>
              {v.invitations}: {community?.invitations ?? 0}
            </p>
            <h3>{v.guideTitle}</h3>
            {toggle(v.guideEnabled, settings.guide.enabled, (b) =>
              patch({ guide: { ...settings.guide, enabled: b } }),
            )}
            {(["opacity", "scale", "cycle"] as const).map((k) => (
              <label key={k}>
                {v[k]}
                <input
                  type="range"
                  aria-label={v[k]}
                  min={k === "cycle" ? 8 : k === "scale" ? 0.85 : 0.6}
                  max={k === "cycle" ? 12 : k === "scale" ? 1.1 : 1}
                  step={k === "cycle" ? 1 : 0.05}
                  value={settings.guide[k]}
                  onChange={(e) =>
                    patch({
                      guide: { ...settings.guide, [k]: Number(e.target.value) },
                    })
                  }
                />
                {settings.guide[k]}
              </label>
            ))}
            <label>
              {v.position}
              <select
                value={settings.guide.position}
                onChange={(e) =>
                  patch({
                    guide: {
                      ...settings.guide,
                      position: e.target.value as "upper" | "compact",
                    },
                  })
                }
              >
                <option value="upper">{v.upper}</option>
                <option value="compact">{v.compact}</option>
              </select>
            </label>
            <label>
              {v.preview}
              <select
                aria-label={v.preview}
                value={settings.guide.preview}
                onChange={(e) =>
                  patch({
                    guide: {
                      ...settings.guide,
                      preview: e.target
                        .value as ProductionSettings["guide"]["preview"],
                    },
                  })
                }
              >
                {Object.entries(v.guideGroups).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <h3>{v.experiment}</h3>
            <ul>
              {community?.experiments.map((e) => (
                <li key={e.at}>
                  {e.variant} · {new Date(e.at).toLocaleTimeString("vi-VN")} ·{" "}
                  {e.after
                    ? `${v.after}: ♥ ${e.after.hearts} / ${v.shares} ${e.after.shares} / AMEN ${e.after.amen}`
                    : v.pending}
                </li>
              ))}
            </ul>
          </>
        )}
        {tab === 5 && (
          <>
            <p>{v.demoHelp}</p>
            <div className="admin-fields">
              <label>
                {v.username}
                <input
                  aria-label={v.username}
                  value={name}
                  maxLength={32}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                {v.userId}
                <input
                  aria-label={v.userId}
                  value={userId}
                  maxLength={80}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </label>
            </div>
            <div className="button-row">
              {[
                [v.sendAmen, "AMEN"],
                [v.male, "1"],
                [v.female, "2"],
              ].map(([label, text]) => (
                <button
                  key={text}
                  disabled={!canTest}
                  onClick={() =>
                    void run("mock/comment", { ...identity, text })
                  }
                >
                  {label}
                </button>
              ))}
              {[20, 50, 100].map((count) => (
                <button
                  key={count}
                  disabled={!canTest}
                  onClick={() => void run("mock/spam-amen", { count })}
                >
                  {v.addPeople} {count}
                </button>
              ))}
            </div>
            <div className="button-row">
              <button disabled={!canTest} onClick={() => social("like", 1)}>
                {v.like1}
              </button>
              <button disabled={!canTest} onClick={() => social("like", 100)}>
                {v.like100}
              </button>
              <button disabled={!canTest} onClick={() => social("like", 1000)}>
                {v.like1000}
              </button>
              <button disabled={!canTest} onClick={() => social("share")}>
                {v.share1}
              </button>
              <button disabled={!canTest} onClick={() => social("follow")}>
                {v.follow1}
              </button>
              {[60, 120].map((seconds) => (
                <button
                  key={seconds}
                  disabled={!canTest}
                  onClick={() => void run("mock/inactivity", { seconds })}
                >
                  {seconds === 60 ? v.idle60 : v.idle120}
                </button>
              ))}
            </div>
            <div className="button-row">
              {[
                ["mock/acceptance", v.acceptance],
                ["mock/full-seat", v.fullSeats],
              ].map(([path, label]) => (
                <button
                  key={path}
                  disabled={!canTest}
                  onClick={() => {
                    if (confirm(v.confirmFixture)) void run(path, {});
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <h3>{v.selectViewer}</h3>
            <div className="attendee-list">
              {state?.attendees.slice(0, 200).map((a) => (
                <button
                  key={a.userId}
                  onClick={() => {
                    setUserId(a.userId);
                    setName(a.username);
                  }}
                >
                  {a.username}
                  <small>
                    {v.gender[a.gender ?? "male"]} ·{" "}
                    {v.admission[a.admission ?? "waiting"]} ·{" "}
                    {a.seat === null ? v.noSeat : `${v.seat} ${a.seat}`}
                  </small>
                </button>
              ))}
            </div>
            <label>
              {v.quality}
              <select
                aria-label={v.quality}
                value={quality}
                onChange={(e) => setQuality(e.target.value as Quality)}
              >
                {(["low", "balanced", "high"] as const).map((k) => (
                  <option key={k} value={k}>
                    {v[k]}
                  </option>
                ))}
              </select>
            </label>
            {toggle(
              v.npcs,
              state?.settings.npcs ?? true,
              (b) => void run("mock/control", { action: "npcs", enabled: b }),
            )}
            {(["renderLimit", "memoryLimit"] as const).map((k) => (
              <label key={k}>
                {v[k]}
                <input
                  type="number"
                  min={k === "renderLimit" ? 100 : 1000}
                  max={k === "renderLimit" ? 2000 : 20000}
                  step="100"
                  value={settings.engagement[k]}
                  onChange={(e) =>
                    patch({
                      engagement: {
                        ...settings.engagement,
                        [k]: Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
            <p>{v.resourceNote}</p>
            <button
              onClick={() => {
                if (confirm(v.confirmDefaults)) patch(defaultProduction());
              }}
            >
              {v.defaults}
            </button>
            <button
              className="danger"
              onClick={() => {
                if (confirm(v.confirmReset))
                  void run("mock/control", { action: "reset" });
              }}
            >
              {v.reset}
            </button>
          </>
        )}
      </section>
      <section className="admin-preflight">
        <button onClick={() => void preflight()}>{v.preflight}</button>
        <dl data-testid="preflight">
          {Object.entries(checks).map(([k, val]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{val}</dd>
            </div>
          ))}
        </dl>
        <p>{v.captureNote}</p>
      </section>
      <p
        className={`admin-feedback ${error ? "error" : ""}`}
        role={error ? "alert" : "status"}
      >
        {error || (busy ? v.pending : message)}
      </p>
      <footer>{v.footer}</footer>
    </main>
  );
}
