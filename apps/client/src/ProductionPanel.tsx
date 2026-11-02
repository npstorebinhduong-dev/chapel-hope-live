import { useEffect, useState } from "react";
import { giftKeys, GIFTS, type GiftKey } from "@chapel/shared";
import {
  defaultProduction,
  defaultSource,
  type Locale,
  type ProductionSettings,
} from "../../../packages/shared/src/production";
import { post, useSession } from "./store";
import {
  browserVoice,
  recordedVoice,
  queueWish,
  useVoiceState,
} from "./voice/runtime";
import { unlockAudio } from "./audio";
import { languageTags, giftLabels } from "./locales";
export function ProductionPanel() {
  const snapshot = useSession((s) => s.snapshot),
    reports = useSession((s) => s.liveReports);
  const settings = snapshot?.production ?? defaultProduction(),
    source = snapshot?.source ?? defaultSource();
  const voice = useVoiceState();
  const [tab, setTab] = useState("LIVE Connection"),
    [error, setError] = useState(""),
    [endpoint, setEndpoint] = useState(source.endpoint),
    [mapping, setMapping] = useState<Record<string, GiftKey>>(source.mapping),
    [checks, setChecks] = useState<Record<string, string>>({});
  const [clipReady, setClipReady] = useState(false);
  useEffect(() => {
    setMapping(source.mapping);
    setEndpoint(source.endpoint);
  }, [JSON.stringify(source.mapping), source.endpoint]);
  useEffect(() => {
    if (settings.provider === "recorded")
      void recordedVoice.load().then(() => setClipReady(true));
  }, [settings.provider]);
  async function run(path: string, data: unknown) {
    try {
      setError("");
      await post(path, data);
    } catch (e) {
      setError(String(e));
    }
  }
  function patch(p: Partial<ProductionSettings>) {
    void run("production", { ...settings, ...p });
  }
  async function sourceMode(mode: "mock" | "tikfinity") {
    if (
      mode !== source.mode &&
      snapshot?.attendees.length &&
      !confirm("Changing source resets this session. Continue?")
    )
      return;
    await run("source", { mode, endpoint, mapping, reset: true });
  }
  async function sample(locale: Locale, key: GiftKey = "altar_100") {
    if (
      !settings.voiceEnabled ||
      snapshot?.settings.muted ||
      settings.mix.master === 0 ||
      settings.mix.voice === 0
    ) {
      setError(
        "Enable Read gift wishes, unmute sound and raise Master / Voice before testing speech.",
      );
      return;
    }
    try {
      await unlockAudio();
      queueWish(crypto.randomUUID(), key, "Preview", {
        ...settings,
        locale,
        voiceEnabled: true,
      });
    } catch {
      setError("Voice BLOCKED: click Enable audio in this playback tab.");
    }
  }
  async function preflight() {
    const result: Record<string, string> = {};
    try {
      const r = await fetch("/api/health");
      const h = await r.json();
      result["Game server"] = r.ok && h.ok ? "PASS" : "FAIL";
      const live = await fetch("/");
      result["LIVE route"] = live.ok ? "PASS" : "FAIL";
    } catch {
      result["Game server"] = "NOT YET VERIFIED (HTML preview has no server)";
    }
    const report = reports?.find((r) => r.canvas && Date.now() - r.at < 10000);
    result["Canvas render"] = report?.canvas
      ? "PASS"
      : "NOT YET VERIFIED — open LIVE tab";
    result["9:16"] =
      report?.ratio && Math.abs(report.ratio - 9 / 16) < 0.01
        ? "PASS"
        : "NOT YET VERIFIED";
    result["WebAudio in LIVE tab"] = report?.audio
      ? "PASS"
      : "FAIL — click LIVE window to enable sound";
    result["Selected voice in LIVE tab"] =
      report?.voice &&
      !["blocked", "error", "timeout"].includes(report.voiceStatus)
        ? "PASS"
        : "FAIL — missing voice or disabled";
    result["Six gift mappings"] = giftKeys.every((k) =>
      Object.values(source.mapping).includes(k),
    )
      ? "PASS"
      : "FAIL — map all six IDs";
    result["TikFinity socket"] =
      source.connection === "connected"
        ? "PASS"
        : "NOT YET VERIFIED — start Desktop / Connect";
    result["FPS"] = report
      ? `${report.fps >= 30 ? "PASS" : "FAIL"} — ${report.fps} FPS`
      : "NOT YET VERIFIED";
    result["Capture image + music + speech + SFX"] =
      "NOT YET VERIFIED — record 20–30 seconds in LIVE Studio";
    result["Windows launcher"] = "NOT YET VERIFIED — validate on Windows";
    result["Real LIVE chat + gift"] =
      "NOT YET VERIFIED — operator test required";
    setChecks(result);
  }
  const selectedVoices = browserVoice.list(settings.locale);
  const available =
    settings.provider === "browser"
      ? selectedVoices.length > 0
      : clipReady &&
        giftKeys.every((key) =>
          [0, 1].every((i) =>
            recordedVoice.available({
              locale: settings.locale,
              clipKey: `${key}-${i}`,
            } as never),
          ),
        );
  return (
    <section className="panel production-panel">
      <h2>Production LIVE · v1.6</h2>
      <p>READY FOR WINDOWS VALIDATION · Real LIVE verification pending</p>
      <div role="tablist" aria-label="Production controls">
        {["LIVE Connection", "Audio & Language", "Gift Test & Mapping"].map(
          (t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ),
        )}
      </div>
      {tab === "LIVE Connection" && (
        <div role="tabpanel">
          <label>
            Event source
            <select
              aria-label="Event source"
              value={source.mode}
              onChange={(e) =>
                void sourceMode(e.target.value as "mock" | "tikfinity")
              }
            >
              <option value="mock">Mock · offline simulation</option>
              <option value="tikfinity">TikFinity LIVE</option>
            </select>
          </label>
          <label>
            TikFinity endpoint
            <input
              aria-label="TikFinity endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
          </label>
          <button
            onClick={() =>
              void run("source", { mode: source.mode, endpoint, mapping })
            }
          >
            Save local endpoint
          </button>
          <button
            disabled={source.mode !== "tikfinity"}
            onClick={() => void run("source/connect", {})}
          >
            Connect / Retry
          </button>
          <button onClick={() => void run("source/disconnect", {})}>
            Disconnect
          </button>
          <p data-testid="source-status">
            {source.mode} · {source.connection.toUpperCase()}
            {source.connection === "connected"
              ? " · CONNECTED TO TIKFINITY SOCKET"
              : ""}
          </p>
          <p>
            {source.received
              ? "Socket events received (origin must be verified by operator)"
              : "No TikFinity events received"}
          </p>
          <p>{source.error}</p>
          <p>
            Events {source.received} · ignored {source.ignored} · duplicates{" "}
            {source.duplicates} · disconnects {source.disconnects} · rejected{" "}
            {source.rejected}
          </p>
          <output>{source.lastEvent || "Waiting for event"}</output>
          <details>
            <summary>Session event log</summary>
            <ol>
              {source.log.slice(-12).map((entry, i) => (
                <li key={i}>
                  {new Date(entry.at).toLocaleTimeString()} · {entry.event}
                </li>
              ))}
            </ol>
          </details>
          <p>
            Only one source is active. Mock gift buttons are rejected while
            TikFinity is selected. No automatic GO LIVE.
          </p>
        </div>
      )}
      {tab === "Audio & Language" && (
        <div role="tabpanel">
          <label>
            LIVE language
            <select
              aria-label="LIVE language"
              value={settings.locale}
              onChange={(e) => patch({ locale: e.target.value as Locale })}
            >
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
              <option value="it">Italiano</option>
            </select>
          </label>
          <label>
            Voice provider
            <select
              value={settings.provider}
              onChange={(e) =>
                patch({ provider: e.target.value as "browser" | "recorded" })
              }
            >
              <option value="browser">Browser / installed system voices</option>
              <option value="recorded">Licensed local clips</option>
            </select>
          </label>
          <label>
            Voice
            <select
              aria-label="Voice"
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
              <option value="">
                Automatic · {languageTags[settings.locale]}
              </option>
              {selectedVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} · {v.lang}
                </option>
              ))}
            </select>
          </label>
          <p data-testid="voice-availability">
            {available ? "Voice READY" : "Missing voice for this language"} ·{" "}
            {voice.status}
          </p>
          <p>
            LIVE playback:{" "}
            {reports?.find((r) => r.canvas && Date.now() - r.at < 10000)
              ?.voiceStatus ?? "Open LIVE tab to inspect"}
          </p>
          <p>
            Only matching-language voices are used. Quality depends on installed
            Windows voices. Local clips: public/voice/manifest.json.
          </p>
          <label>
            Speech rate
            <input
              aria-label="Speech rate"
              type="range"
              min="0.85"
              max="1.1"
              step="0.01"
              value={settings.rate}
              onChange={(e) => patch({ rate: Number(e.target.value) })}
            />
            {settings.rate.toFixed(2)}
          </label>
          {(["voiceEnabled", "bannerEnabled", "readNames"] as const).map(
            (k) => (
              <label className="toggle" key={k}>
                {
                  {
                    voiceEnabled: "Read gift wishes",
                    bannerEnabled: "Show subtitles",
                    readNames: "Read safe names (optional)",
                  }[k]
                }
                <input
                  type="checkbox"
                  checked={settings[k]}
                  onChange={(e) => patch({ [k]: e.target.checked })}
                />
              </label>
            ),
          )}
          <div className="button-row">
            {(["en", "vi", "it"] as Locale[]).map((l) => (
              <button key={l} onClick={() => void sample(l)}>
                Test voice {l.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => void sample(settings.locale, "ceremony_500")}
            >
              Test voice 500
            </button>
          </div>
          <p>
            Speaking: {String(voice.speaking)} · skipped speech (gifts
            retained): {voice.skipped}
          </p>
          <p>
            Enable sound in the captured LIVE tab. Do not enable sound in two
            captured windows. Voice test here is a local monitor.
          </p>
        </div>
      )}
      {tab === "Gift Test & Mapping" && (
        <div role="tabpanel">
          <p>
            Use actual IDs observed from Desktop. The two 5-coin actions require
            different IDs. No default IDs are assumed.
          </p>
          <table>
            <thead>
              <tr>
                <th>Game action</th>
                <th>Platform gift ID</th>
              </tr>
            </thead>
            <tbody>
              {giftKeys.map((key) => (
                <tr key={key}>
                  <td>
                    {giftLabels.en[key]} · {GIFTS[key].coins}
                  </td>
                  <td>
                    <input
                      aria-label={`Gift ID ${key}`}
                      inputMode="numeric"
                      value={
                        Object.keys(mapping).find(
                          (id) => mapping[id] === key,
                        ) ?? ""
                      }
                      onChange={(e) => {
                        if (
                          mapping[e.target.value] &&
                          mapping[e.target.value] !== key
                        ) {
                          setError(
                            "Gift ID already assigned. The two 5-coin gifts need different IDs.",
                          );
                          return;
                        }
                        const next = { ...mapping };
                        for (const id of Object.keys(next))
                          if (next[id] === key) delete next[id];
                        if (e.target.value) next[e.target.value] = key;
                        setMapping(next);
                      }}
                    />
                    <small>
                      {(() => {
                        const id = Object.keys(mapping).find(
                          (id) => mapping[id] === key,
                        );
                        const gift = source.observed.find(
                          (g) => g.giftId === id,
                        );
                        return gift
                          ? `${gift.name} · ${gift.coins ?? "?"} observed coins`
                          : "Not yet observed from Desktop";
                      })()}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() =>
              void run("source", { mode: source.mode, endpoint, mapping })
            }
          >
            Save gift mapping
          </button>
          <p>Observed unknown gifts (no viewer IDs stored):</p>
          <ul>
            {source.unknown.map((g) => (
              <li key={g.giftId}>
                {g.giftId} · {g.name} · {g.coins ?? "?"} coins
              </li>
            ))}
          </ul>
          <p>
            Use the six action buttons below in Mock mode; LIVE events use this
            mapping only.
          </p>
          <button
            disabled={source.mode !== "mock"}
            onClick={() => {
              if (
                confirm(
                  "Reset this Mock session and start the 50 + 5 acceptance scenario?",
                )
              )
                void run("mock/acceptance", {});
            }}
          >
            Test 50 AMEN + 5 gifts
          </button>
        </div>
      )}
      <button onClick={() => void preflight()}>RUN LIVE PREFLIGHT CHECK</button>
      <dl data-testid="preflight">
        {Object.entries(checks).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
