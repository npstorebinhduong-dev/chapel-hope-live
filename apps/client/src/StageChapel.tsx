import { useEffect, useRef, useState } from "react";
import {
  attendeePose,
  isAttendeeMoving,
  type Attendee,
  type ActiveGift,
  type Vec3,
} from "@chapel/shared";
import { renderClock, sendMetrics, useSession } from "./store";
import { useQuality } from "./quality";
import {
  PEW_RAILS,
  projectStage,
  stageEffect,
  SPRITE_COLUMNS,
  SPRITE_WIDTHS,
  SPRITE_ROWS,
  SPRITE_HEIGHTS,
} from "./scene/stageLayout";
import { en } from "./strings";
import {
  cameraTarget,
  overviewCamera,
  smoothCamera,
} from "./scene/stageCamera";
import { drawAtmosphere } from "./scene/stageAtmosphere";

type Actor = Attendee & { role: "npc" | "viewer" | "presenter" };
type Motion = {
  pose: number;
  previous: number;
  blend: number;
  x: number;
  y: number;
  height: number;
  variant: number;
  oldVariant: number;
  appearance: number;
  opacity: number;
  step: number;
  worldX: number;
  worldZ: number;
  lean: number;
  turn: number;
  phase: number;
};
const npcs: Actor[] = Array.from({ length: 16 }, (_, i) => ({
  userId: `npc-${i}`,
  username: "",
  seat: i,
  overflow: null,
  joinedAt: 0,
  lastSeen: 0,
  walkAt: 0,
  variant: i % 12,
  role: "npc",
}));
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(url));
    img.src = url;
  });

/** Fixed-camera 2.5D renderer. The gameplay engine remains the only state owner.
 * All runtime sprites, shadows, offerings and light effects are drawn locally.
 * No network asset CDN, WebGL context or per-person DOM subtree is required. */
export function StageChapel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false,
      raf = 0;
    const element = canvas.current!;
    const display = element.getContext("2d");
    if (!display) {
      setError(true);
      return;
    }
    let ctx: CanvasRenderingContext2D = display;
    const crowdLayer = document.createElement("canvas");
    const crowdContext = crowdLayer.getContext("2d")!;
    const foyerLayer = document.createElement("canvas");
    const foyerContext = foyerLayer.getContext("2d")!;
    let foyerStamp = -1000,
      foyerCount = 0,
      foyerKey = "";
    let crowdStamp = -1000,
      crowdKey = "",
      cachedCount = 0;
    const motions = new Map<string, Motion>();
    let previousTime = performance.now(),
      lastDraw = 0,
      meter = previousTime,
      frames = 0,
      totalFrames = 0;
    let camera = overviewCamera();
    const epoch = performance.now();
    let priestPose = 0,
      oldPriestPose = 0,
      priestBlend = 1;
    let people: HTMLImageElement, walk: HTMLImageElement;

    const cache = new Map<string, HTMLCanvasElement>();
    const glows = new Map<string, HTMLCanvasElement>();
    let detailLevel = "";
    const actorImage = (
      column: number,
      pose: number,
      resolution: number,
      variant: number,
      frame = -1,
    ) => {
      const tint = column === 4 ? 0 : Math.floor(variant / 4) % 3;
      const key = `${column}:${pose}:${resolution}:${tint}:${frame}`;
      let tile = cache.get(key);
      if (tile) return tile;
      const source = frame < 0 ? people : walk;
      const sx =
        frame < 0
          ? SPRITE_COLUMNS[column]!
          : [80, 300, 520, 735, 940, 1155, 1365, 1575][frame]!;
      const sy = frame < 0 ? SPRITE_ROWS[pose]! : [0, 245, 470, 682][column]!;
      const sw = frame < 0 ? SPRITE_WIDTHS[column]! : 130;
      const sh =
        frame < 0 ? SPRITE_HEIGHTS[pose]! : [245, 225, 212, 205][column]!;
      tile = document.createElement("canvas");
      tile.height = resolution;
      tile.width = Math.ceil((resolution * sw) / sh);
      const c = tile.getContext("2d")!;
      c.drawImage(source, sx, sy, sw, sh, 0, 0, tile.width, tile.height);
      if (tint) {
        c.globalCompositeOperation = "source-atop";
        c.globalAlpha = 0.22;
        c.fillStyle = tint === 1 ? "#51645e" : "#79634f";
        c.fillRect(0, tile.height * 0.25, tile.width, tile.height * 0.65);
      }
      cache.set(key, tile);
      return tile;
    };
    let width = 0,
      height = 0;
    const resize = () => {
      const level = useQuality.getState().level;
      const rect = element.getBoundingClientRect();
      const ratio =
        level === "low"
          ? 0.85
          : level === "high"
            ? Math.min(devicePixelRatio, 2)
            : Math.min(devicePixelRatio, 1.25);
      const density =
        (useSession.getState().snapshot?.attendees.length ?? 0) > 64;
      const budget =
        level === "low"
          ? 480
          : level === "balanced"
            ? density
              ? 640
              : 800
            : 1080;
      const actualRatio = Math.min(ratio, budget / Math.max(1, rect.width));
      const w = Math.max(1, Math.round(rect.width * actualRatio)),
        h = Math.max(1, Math.round(rect.height * actualRatio));
      if (w !== width || h !== height) {
        element.width = width = w;
        element.height = height = h;
        crowdLayer.width = w;
        crowdLayer.height = h;
        foyerLayer.width = w;
        foyerLayer.height = h;
        foyerStamp = -1000;
        crowdStamp = -1000;
      }
      if (detailLevel !== level) {
        detailLevel = level;
        cache.clear();
      }
    };
    const glow = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number,
    ) => {
      let tile = glows.get(color);
      if (!tile) {
        tile = document.createElement("canvas");
        tile.width = tile.height = 64;
        const c = tile.getContext("2d")!,
          g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(255,190,100,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, 64, 64);
        glows.set(color, tile);
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        tile,
        x * width - radius * height,
        (y - radius) * height,
        radius * height * 2,
        radius * height * 2,
      );
      ctx.restore();
    };
    const actorLayer = document.createElement("canvas");
    actorLayer.width = 128;
    actorLayer.height = 256;
    const actorContext = actorLayer.getContext("2d")!;
    const ease = (n: number) => n * n * (3 - 2 * n);
    const drawActor = (
      m: Motion,
      phase: number,
      walking: boolean,
      bow: number,
      simple = false,
    ) => {
      const blend = ease(m.blend),
        appearance = ease(m.appearance);
      const scale = (pose: number) =>
        pose === 3 ? 1 : SPRITE_HEIGHTS[pose]! / 357;
      const h =
        m.height * ((1 - blend) * scale(m.previous) + blend * scale(m.pose));
      const dh = h * height,
        dw = m.height * height * 0.46;
      const resolution =
        detailLevel === "low"
          ? 72
          : detailLevel === "high"
            ? 192
            : dh < 65
              ? 80
              : 128;
      const idle = !walking && m.blend === 1 && m.appearance === 1;
      let source: HTMLCanvasElement;
      if (idle || simple) {
        source = actorImage(m.variant % 4, m.pose, resolution, m.variant);
      } else {
        actorContext.clearRect(0, 0, 128, 256);
        actorContext.globalCompositeOperation = "lighter";
        for (const [variant, weight] of [
          [m.oldVariant, 1 - appearance],
          [m.variant, appearance],
        ]) {
          if (!weight) continue;
          for (const [pose, poseWeight] of [
            [m.previous, 1 - blend],
            [m.pose, blend],
          ]) {
            if (!poseWeight) continue;
            const frameFloat = ((phase / (Math.PI * 2)) % 1) * 8;
            const frame = Math.floor(frameFloat),
              part = frameFloat - frame;
            const steps =
              walking && pose === 3
                ? [
                    [frame, 1 - part],
                    [(frame + 1) % 8, part],
                  ]
                : [[-1, 1]];
            for (const [step, stepWeight] of steps) {
              actorContext.globalAlpha = weight * poseWeight * stepWeight;
              actorContext.drawImage(
                actorImage(variant % 4, pose, resolution, variant, step),
                0,
                0,
                128,
                256,
              );
            }
          }
        }
        source = actorLayer;
      }
      ctx.save();
      ctx.globalAlpha = m.opacity;
      ctx.translate(m.x * width, (m.y + bow) * height);
      // Feet stay planted. Lean and perspective narrowing follow travel tangent;
      // atlas remains a rear-view 2.5D asset, not full directional mocap.
      const breathe = walking ? 0 : Math.sin(phase) * 0.0025;
      ctx.transform(
        1 - Math.abs(m.turn) * 0.12,
        0,
        m.lean * 0.035 + (walking ? 0 : Math.sin(phase * 0.7) * 0.009),
        1 + breathe,
        0,
        0,
      );
      const settle =
        (m.pose === 1 || m.pose === 2) && m.blend < 1
          ? Math.sin(blend * Math.PI) * dh * 0.025
          : 0;
      const sway = walking ? Math.sin(phase * 2) * dh * 0.004 : 0;
      ctx.drawImage(source, -dw / 2, -dh + sway + settle, dw, dh);
      ctx.restore();
    };
    const draw = (time: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(draw);
      const level = useQuality.getState().level;
      if (level === "low" && time - lastDraw < 31) return;
      const cameraDt = Math.max(0, (time - previousTime) / 1000);
      const dt = Math.min(0.08, cameraDt);
      previousTime = time;
      lastDraw = time;
      resize();
      frames++;
      if (time - meter > 1000) {
        sendMetrics(Math.round((frames * 1000) / (time - meter)), "Canvas2D");
        frames = 0;
        meter = time;
      }
      const session = useSession.getState();
      const state = session.snapshot;
      const now = renderClock();
      // Gift focus has a wall-clock deadline even if a socket stops delivering
      // snapshots. Occupancy paths can freeze; the camera must always release.
      const effectNow = state
        ? state.now + Math.max(0, time - session.receivedAt)
        : now;
      const fx = stageEffect(state?.active, effectNow);
      const active = fx.key ? state?.active : null;
      const selectedGift = fx.key;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      // The composited DOM layer caches the static architecture. A common CSS
      // transform keeps the background and all animated objects registered.
      const elapsed = active ? Math.max(0, now - active.startedAt) : 0;
      const donor = state?.attendees.find(
        (a) => a.userId === state.active?.event.userId,
      );
      const donorPose = donor
        ? attendeePose(donor, now, state?.active ?? null)
        : null;
      const donorPoint = donorPose
        ? projectStage(donorPose.position[0], donorPose.position[2])
        : null;
      camera = smoothCamera(
        camera,
        cameraTarget(
          state?.active,
          effectNow,
          state?.settings.camera ?? true,
          donorPoint?.x,
        ),
        cameraDt,
      );
      world.current!.style.transformOrigin = "0 0";
      world.current!.style.transform = `translate(${camera.x * 100}%, ${camera.y * 100}%) scale(${camera.zoom})`;
      const reaction = !state?.active
        ? (state?.community?.reaction ?? null)
        : null;
      const communityPrayer = reaction?.kind === "community";
      const birds = drawAtmosphere(
        ctx,
        width,
        height,
        (time - epoch) / 1000,
        level === "low",
        state?.production?.engagement.idleEnabled ?? true,
        reaction,
        now,
      );
      if (reaction?.kind === "heart" || communityPrayer) {
        const progress = Math.max(
          0,
          Math.min(
            1,
            (now - reaction.startedAt) / (reaction.endsAt - reaction.startedAt),
          ),
        );
        const strength = Math.sin(progress * Math.PI);
        glow(0.5, 0.38, 0.24, "rgba(255,225,160,.38)", strength);
        glow(0.175, 0.69, 0.09, "rgba(255,176,71,.32)", strength);
      }
      if (donorPoint && selectedGift) {
        glow(
          donorPoint.x,
          donorPoint.y - donorPoint.height * 0.4,
          selectedGift === "altar_100" || selectedGift === "ceremony_500"
            ? 0.075
            : 0.045,
          "rgba(255,220,154,.38)",
          fx.strength * 0.8,
        );
      }
      if (selectedGift === "bell_10")
        glow(
          0.5,
          0.6,
          0.25,
          "rgba(255,225,170,.2)",
          fx.strength * Math.exp(-elapsed / 1800),
        );
      if (selectedGift === "prayer_5")
        glow(0.5, 0.554, 0.065, "rgba(255,220,162,.3)", fx.strength);
      if (selectedGift === "ceremony_500") {
        glow(0.5, 0.35, 0.46, "rgba(248,216,160,.15)", fx.strength);
        glow(0.13, 0.52, 0.13, "rgba(255,185,93,.3)", fx.strength * 0.6);
        glow(0.86, 0.52, 0.13, "rgba(255,185,93,.3)", fx.strength * 0.6);
      }
      if (selectedGift === "altar_100" || selectedGift === "ceremony_500") {
        glow(0.5, 0.53, 0.23, "rgba(255,221,150,.45)", fx.strength * 0.65);
        // Restrained shafts preserve the altar silhouette and collective scene.
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const beams = level === "low" ? 3 : 6;
        for (let i = 0; i < beams; i++) {
          const bx = 0.35 + i * 0.06;
          const gradient = ctx.createLinearGradient(
            bx * width,
            height * 0.29,
            (bx + 0.1) * width,
            height * 0.83,
          );
          gradient.addColorStop(
            0,
            `rgba(${["255,211,145", "160,194,241", "237,160,139"][i % 3]},${fx.strength * (selectedGift === "ceremony_500" ? 0.12 : 0.075)})`,
          );
          gradient.addColorStop(1, "rgba(255,220,160,0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(bx * width, height * 0.29);
          ctx.lineTo((bx + 0.025) * width, height * 0.29);
          ctx.lineTo((bx + 0.3) * width, height * 0.87);
          ctx.lineTo((bx + 0.1) * width, height * 0.87);
          ctx.fill();
        }
        ctx.restore();
      }
      // Independent fictional officiant, never added to attendees or supporters.
      const nextPriest =
        selectedGift === "ceremony_500" || communityPrayer
          ? 2
          : selectedGift === "altar_100"
            ? 3
            : Math.floor(now / 11000) % 3 === 1
              ? 1
              : 0;
      if (priestPose !== nextPriest) {
        oldPriestPose = priestPose;
        priestPose = nextPriest;
        priestBlend = 0;
      }
      priestBlend = Math.min(1, priestBlend + dt / 0.7);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, height * 0.516);
      ctx.clip();
      // Composite priest pose weights once to avoid opacity dip during crossfade.
      actorContext.clearRect(0, 0, 128, 256);
      actorContext.globalCompositeOperation = "lighter";
      for (const [pose, weight] of [
        [oldPriestPose, 1 - priestBlend],
        [priestPose, priestBlend],
      ]) {
        actorContext.globalAlpha = weight;
        actorContext.drawImage(actorImage(4, pose, 192, 0), 0, 0, 128, 256);
      }
      ctx.drawImage(
        actorLayer,
        0.52 * width - (0.095 * height * 0.46) / 2,
        (0.568 - 0.095) * height + Math.sin(time * 0.001) * 0.2,
        0.095 * height * 0.46,
        0.095 * height,
      );
      ctx.restore();

      const actors: Actor[] = [
        ...(state?.settings.npcs ? npcs : []),
        ...(state?.attendees ?? []).map((a) => ({
          ...a,
          role: "viewer" as const,
        })),
      ];
      const used = new Set<string>();
      const projected = actors
        .map((a) => {
          const event: ActiveGift | null = active ?? null;
          const pose =
            a.role === "npc"
              ? {
                  position: [
                    (a.seat! % 8 < 4 ? -1 : 1) * (2 + (a.seat! % 4) * 0.86),
                    0.68,
                    -6.8 + Math.floor(a.seat! / 8) * 1.7,
                  ] as Vec3,
                  state:
                    selectedGift === "ceremony_500" ||
                    communityPrayer ||
                    (selectedGift === "bell_10" &&
                      a.seat! < 8 &&
                      elapsed > (a.seat! % 4) * 120)
                      ? "kneeling"
                      : "seated",
                  visible: true,
                }
              : attendeePose(a, now, event);
          const p = projectStage(pose.position[0], pose.position[2]);
          p.height *= 0.97 + (a.variant % 5) * 0.015;
          const walking = isAttendeeMoving(a, now);
          const target = walking
            ? 3
            : pose.state === "kneeling"
              ? 2
              : pose.state === "seated"
                ? 1
                : 0;
          const id = `${a.role}:${a.userId}`;
          used.add(id);
          let motion = motions.get(id);
          if (!motion) {
            motion = {
              pose: target,
              previous: target,
              blend: 1,
              x: p.x,
              y: p.y,
              height: p.height,
              variant: a.variant,
              oldVariant: a.variant,
              appearance: 1,
              opacity: a.role === "npc" ? 1 : 0,
              step: a.variant * 1.31,
              worldX: pose.position[0],
              worldZ: pose.position[2],
              lean: 0,
              turn: 0,
              phase:
                ([...a.userId].reduce(
                  (n, c) => (n * 31 + c.charCodeAt(0)) >>> 0,
                  7,
                ) %
                  628) /
                100,
            };
            motions.set(id, motion);
          }
          if (motion.pose !== target) {
            motion.previous = motion.pose;
            motion.pose = target;
            motion.blend = 0;
          }
          if (motion.variant !== a.variant && motion.appearance >= 1) {
            motion.oldVariant = motion.variant;
            motion.variant = a.variant;
            motion.appearance = 0;
          }
          motion.appearance = Math.min(1, motion.appearance + dt / 0.65);
          const fade =
            a.leaveAt !== undefined && !a.journey
              ? Math.max(0, 1 - (now - a.leaveAt) / 1200)
              : 1;
          motion.opacity += (fade - motion.opacity) * (1 - Math.exp(-dt * 9));
          const distance = Math.hypot(
            pose.position[0] - motion.worldX,
            pose.position[2] - motion.worldZ,
          );
          const dx = pose.position[0] - motion.worldX;
          const dz = pose.position[2] - motion.worldZ;
          const direction = walking && distance > 0.0001 ? dx / distance : 0;
          motion.turn += (direction - motion.turn) * (1 - Math.exp(-dt * 6));
          motion.lean +=
            (direction * Math.min(1, distance / Math.max(0.001, dt) / 2.4) -
              motion.lean) *
            (1 - Math.exp(-dt * 7));
          // Use rendered displacement, not raw snapshot jumps, to drive stride.
          const projectedTravel = Math.hypot(
            p.x - motion.x,
            (p.y - motion.y) * 1.7778,
          );
          if (walking)
            motion.step += Math.min(
              0.55,
              (projectedTravel / Math.max(0.035, p.height)) *
                8 *
                (1 - Math.exp(-dt * 12)),
            );
          motion.worldX = pose.position[0];
          motion.worldZ = pose.position[2];
          motion.blend = Math.min(
            1,
            motion.blend +
              dt /
                (target === 1 ||
                target === 2 ||
                motion.previous === 1 ||
                motion.previous === 2
                  ? 0.85
                  : 0.5),
          );
          const blend = 1 - Math.exp(-dt * 12);
          motion.x += (p.x - motion.x) * blend;
          motion.y += (p.y - motion.y) * blend;
          motion.height += (p.height - motion.height) * blend;
          return { a, pose, motion, walking };
        })
        .sort((a, b) => a.motion.y - b.motion.y);
      for (const id of motions.keys()) if (!used.has(id)) motions.delete(id);
      const inside = projected.filter((p) => p.a.waitingSlot == null);
      const waiting = projected.filter((p) => p.a.waitingSlot != null);
      const key =
        inside
          .map(
            ({ a, motion, pose }) =>
              `${a.role}:${a.userId}:${motion.pose}:${pose.visible}:${motion.variant}`,
          )
          .join("|") + level;
      const animateCrowd =
        inside.some(
          (p) =>
            p.walking ||
            p.motion.blend < 1 ||
            p.motion.appearance < 1 ||
            p.motion.opacity < 0.99 ||
            (p.a.queueMotion?.endAt ?? 0) > now,
        ) ||
        selectedGift === "altar_100" ||
        selectedGift === "bell_10";
      // Distance/animation LOD: idle congregation is repainted at 8 Hz into a
      // shared transparent layer. Paths and pose transitions still run each frame.
      if (animateCrowd || key !== crowdKey || time - crowdStamp > 125) {
        ctx = crowdContext;
        ctx.clearRect(0, 0, width, height);
        let drawn = 0;
        for (const { a, pose, motion: m, walking } of inside) {
          if (!pose.visible || m.y - m.height > 1 || m.x < -0.08 || m.x > 1.08)
            continue;
          drawn++;
          ctx.save();
          // Pew fronts are foreground occluders. The actor's feet remain at the
          // engine's seat; only the painted front rail covers the lower body.
          if (
            a.seat !== null &&
            Math.abs(pose.position[0]) > 1.4 &&
            Math.abs(pose.position[0]) < 5.2 &&
            Math.abs(pose.position[2] - (-6.8 + Math.floor(a.seat / 8) * 1.7)) <
              0.7 &&
            a.role !== "presenter"
          ) {
            const row = Math.floor(a.seat / 8);
            ctx.beginPath();
            ctx.rect(0, 0, width, PEW_RAILS[row]! * height);
            ctx.clip();
          }
          const phase = walking ? m.step : time * 0.0015 + m.phase;
          const bow =
            selectedGift === "bell_10"
              ? Math.sin((fx.strength * Math.PI) / 2) * 0.002
              : 0;
          if (walking || a.seat === null) {
            ctx.save();
            ctx.globalAlpha = 0.17;
            ctx.fillStyle = "#17130e";
            ctx.beginPath();
            ctx.ellipse(
              m.x * width,
              m.y * height,
              m.height * height * 0.15,
              m.height * height * 0.025,
              0,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.restore();
          }
          const simple =
            a.waitingSlot != null &&
            projected.length > 250 &&
            m.blend === 1 &&
            m.appearance === 1 &&
            !walking;
          drawActor(m, phase, walking, bow, simple);
          // A carried offering belongs to the donor, never a cloned presenter.
          const offering = a.journey?.giftKey;
          if (
            a.role === "viewer" &&
            a.journey &&
            now < a.journey.actionUntil &&
            (offering === "rose_5" || offering === "candle_1")
          ) {
            const reach = ease(clamp((now - a.journey.actionAt) / 700, 0, 1));
            const handX = m.x + 0.008,
              handY = m.y - m.height * 0.48;
            const x =
              (handX * (1 - reach) +
                (offering === "rose_5" ? 0.79 : 0.19) * reach) *
              width;
            const y = (handY * (1 - reach) + 0.546 * reach) * height;
            ctx.save();
            ctx.globalAlpha =
              m.opacity * (now < a.journey.actionAt ? 1 : 1 - reach * 0.7);
            if (offering === "rose_5") {
              ctx.strokeStyle = "#56714a";
              ctx.lineWidth = Math.max(1, width * 0.0016);
              ctx.beginPath();
              ctx.moveTo(x, y + height * 0.012);
              ctx.lineTo(x + Math.sin(time * 0.002) * width * 0.002, y);
              ctx.stroke();
              for (let petal = 0; petal < 6; petal++) {
                ctx.fillStyle = petal % 2 ? "#fff8ea" : "#e6dac5";
                ctx.beginPath();
                ctx.ellipse(
                  x + Math.cos(petal) * width * 0.003,
                  y + Math.sin(petal) * height * 0.0015,
                  width * 0.004,
                  height * 0.002,
                  petal,
                  0,
                  Math.PI * 2,
                );
                ctx.fill();
              }
            } else {
              ctx.fillStyle = "#f1dfb5";
              ctx.fillRect(x, y, width * 0.005, height * 0.01);
              glow(x / width, y / height, 0.014, "rgba(255,174,58,.55)", 0.7);
              ctx.fillStyle = "#fff5c8";
              ctx.beginPath();
              ctx.ellipse(
                x + width * 0.0025,
                y,
                width * 0.002,
                height * 0.0035,
                0,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            }
            ctx.restore();
          }
          ctx.restore();
        }
        cachedCount = drawn;
        crowdStamp = time;
        crowdKey = key;
      }
      // The waiting crowd is a separate depth/animation LOD layer. A moving
      // donor must not force hundreds of distant impostors to redraw at 60 Hz.
      const nextFoyerKey =
        waiting.map((p) => `${p.a.userId}:${p.a.variant}`).join("|") + level;
      const dense = waiting.length > 250;
      const foyerMoving =
        !dense &&
        waiting.some(
          (p) => p.walking || p.motion.blend < 1 || p.motion.appearance < 1,
        );
      if (
        nextFoyerKey !== foyerKey ||
        foyerMoving ||
        time - foyerStamp >= (dense ? 200 : 125)
      ) {
        ctx = foyerContext;
        ctx.clearRect(0, 0, width, height);
        for (const { a, motion: m, walking } of waiting) {
          const simple =
            dense && (a.waitingSlot ?? 0) >= 24 && m.appearance === 1;
          drawActor(
            m,
            walking ? m.step : time * 0.0015 + m.phase,
            walking,
            0,
            simple,
          );
        }
        foyerCount = waiting.length;
        foyerKey = nextFoyerKey;
        foyerStamp = time;
      }
      ctx = display;
      ctx.drawImage(crowdLayer, 0, 0);
      ctx.drawImage(foyerLayer, 0, 0);
      const boxes: { x: number; y: number; w: number; h: number }[] = [];
      const labels = projected
        .filter(
          (p) =>
            p.pose.visible &&
            p.a.role === "viewer" &&
            (p.a.waitingSlot != null ||
              p.a.userId === state?.active?.event.userId),
        )
        .sort((a, b) => {
          const priority = (p: typeof a) =>
            p.a.userId === state?.active?.event.userId
              ? 0
              : p.a.admission === "invited"
                ? 1
                : now - p.a.joinedAt < 4000
                  ? 2
                  : 3;
          return (
            priority(a) - priority(b) ||
            (a.a.waitingSlot ?? 0) - (b.a.waitingSlot ?? 0)
          );
        });
      ctx.save();
      ctx.font = `${Math.max(9, width * 0.018)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const { a, motion: m } of labels) {
        if (boxes.length >= 7) break;
        const text =
          a.username.length > 14 ? a.username.slice(0, 13) + "…" : a.username;
        const w = Math.min(width * 0.17, ctx.measureText(text).width + 10),
          h = width * 0.03;
        const x = clamp(
          m.x * width,
          (-camera.x / camera.zoom) * width + w / 2 + 2,
          ((1 - camera.x) / camera.zoom) * width - w / 2 - 2,
        );
        const y =
          (a.waitingSlot == null ? m.y + 0.012 : m.y - m.height - 0.009) *
          height;
        if (
          boxes.some(
            (b) =>
              Math.abs(b.x - x) < (b.w + w) / 2 + 4 &&
              Math.abs(b.y - y) < (b.h + h) / 2 + 3,
          )
        )
          continue;
        boxes.push({ x, y, w, h });
        ctx.globalAlpha = m.opacity * 0.8;
        ctx.fillStyle = "#231b12";
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.globalAlpha = m.opacity;
        ctx.fillStyle = a.admission === "invited" ? "#ffe1a0" : "#f5e7ca";
        ctx.fillText(text, x, y, w - 8);
      }
      ctx.restore();

      // Votive offering slots are physically attached to the left candle rack.
      const candles = Math.min(82, 18 + (state?.candles ?? 0));
      for (let i = 0; i < candles; i++) {
        const row = Math.floor(i / 16),
          col = i % 16;
        const x = 0.105 + col * 0.011,
          y = 0.552 - row * 0.006;
        const flicker = 0.8 + Math.sin(time * 0.005 + i * 2.4) * 0.15;
        ctx.fillStyle = "#f3dfb4";
        ctx.fillRect(
          x * width,
          y * height,
          Math.max(1, width * 0.0035),
          height * 0.008,
        );
        if (level !== "low" || i % 3 === 0)
          glow(
            x + 0.0017,
            y - 0.0015,
            0.007,
            "rgba(255,168,62,.55)",
            flicker * 0.5,
          );
        ctx.fillStyle = "#ffc05b";
        ctx.beginPath();
        ctx.ellipse(
          (x + 0.0017) * width,
          (y - 0.0014) * height,
          Math.max(0.8, width * 0.0022),
          height * 0.0038 * flicker,
          0.1 * Math.sin(time * 0.002 + i),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = "#fff5cc";
        ctx.beginPath();
        ctx.ellipse(
          (x + 0.0017) * width,
          (y - 0.001) * height,
          Math.max(0.5, width * 0.0015),
          height * 0.0025 * flicker,
          0.1 * Math.sin(time * 0.002 + i),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      if (selectedGift === "candle_1")
        glow(0.19, 0.547, 0.06, "rgba(255,187,82,.5)", fx.strength);
      if (level !== "low") {
        ctx.save();
        ctx.strokeStyle = "#e0d6c4";
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 4; i++) {
          const x = (0.13 + i * 0.04) * width,
            y = (0.53 - ((time * 0.000015 + i * 0.012) % 0.035)) * height;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(x - 3, y - 5, x + 3, y - 10, x, y - 15);
          ctx.stroke();
        }
        ctx.restore();
      }
      // Rose stems, leaves and layered white petals accumulate at the right.
      for (let i = 0; i < Math.min(48, state?.roses ?? 0); i++) {
        const x = (0.745 + (i % 8) * 0.013) * width,
          y = (0.542 - Math.floor(i / 8) * 0.005) * height;
        ctx.strokeStyle = "#46503a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 2, height * 0.559);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = "#687450";
        ctx.beginPath();
        ctx.ellipse(x + 2, y + 5, 3, 1, -0.7, 0, Math.PI * 2);
        ctx.fill();
        for (let p = 0; p < 7; p++) {
          const angle = p * 2.4 + Math.sin(time * 0.0015 + i) * 0.08;
          ctx.fillStyle = p % 2 ? "#fff7e8" : "#dfd4bd";
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(angle) * 2,
            y + Math.sin(angle) * 1.7,
            2.3,
            1.5,
            angle,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
      if (selectedGift === "rose_5") {
        glow(0.79, 0.55, 0.055, "rgba(255,239,192,.35)", fx.strength);
        ctx.save();
        ctx.globalAlpha = fx.strength * 0.65;
        ctx.fillStyle = "#fff1dc";
        for (let i = 0; i < 6; i++) {
          const t = (elapsed / 2600 + i / 6) % 1;
          ctx.beginPath();
          ctx.ellipse(
            (0.77 + Math.sin(t * 4 + i) * 0.025) * width,
            (0.535 + t * 0.035) * height,
            width * 0.0025,
            height * 0.0015,
            t * 3,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
      }
      if (selectedGift === "bell_10") {
        // Small restrained concentric glints near the sanctuary bell, no screen flash.
        ctx.save();
        ctx.strokeStyle = "#f9d799";
        ctx.lineWidth = width * 0.001;
        for (let i = 0; i < 3; i++) {
          const t = ((now - active!.startedAt) / 1800 + i / 3) % 1;
          ctx.globalAlpha = (1 - t) * fx.strength * 0.4;
          ctx.beginPath();
          ctx.arc(
            0.73 * width,
            0.438 * height,
            (0.008 + t * 0.04) * height,
            -0.9,
            0.9,
          );
          ctx.stroke();
        }
        ctx.restore();
      }
      const particles = level === "low" ? 8 : level === "high" ? 42 : 22;
      ctx.save();
      for (let i = 0; i < particles; i++) {
        const x = 0.15 + ((i * 0.618 + time * 0.000006) % 0.7),
          y = 0.34 + ((i * 0.117 + time * 0.000009) % 0.47);
        ctx.globalAlpha =
          (selectedGift === "ceremony_500" ? 0.26 + fx.strength * 0.25 : 0.12) *
          (0.5 + 0.5 * Math.sin(i + time * 0.001));
        ctx.fillStyle = "#ffeac1";
        ctx.beginPath();
        ctx.arc(
          x * width,
          y * height,
          selectedGift === "ceremony_500" ? 1.25 : 0.6,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();
      // Machine-readable diagnostics are on canvas only, never painted on stream.
      element.dataset.fxPhase = !active
        ? "idle"
        : elapsed < 1000
          ? "arrival"
          : elapsed < 3000
            ? "highlight"
            : now > active.endsAt - 1200
              ? "release"
              : "wish";
      element.dataset.frames = String(++totalFrames);
      element.dataset.ready = "true";
      element.dataset.actors = String(cachedCount + foyerCount);
      element.dataset.walking = String(
        projected.filter((p) => p.walking && p.pose.visible).length,
      );
      element.dataset.priest = String(priestPose);
      element.dataset.gift = selectedGift ?? "";
      element.dataset.zoom = camera.zoom.toFixed(4);
      element.dataset.cameraFocus = camera.focus;
      element.dataset.cameraX = camera.x.toFixed(5);
      element.dataset.cameraY = camera.y.toFixed(5);
      element.dataset.birds = String(birds);
      element.dataset.community = reaction?.kind ?? "";
      element.dataset.heartMilestones = String(
        state?.community?.heartMilestones ?? 0,
      );
      element.dataset.atmosphere = ((time - epoch) / 1000).toFixed(2);
      element.dataset.candles = String(state?.candles ?? 0);
      element.dataset.roses = String(state?.roses ?? 0);
      element.dataset.quality = level;
      element.dataset.waiting = String(state?.waitingCount ?? 0);
      element.dataset.inside = String(state?.insideCount ?? 0);
      element.dataset.seated = String(state?.seatedCount ?? 0);
      element.dataset.variants = JSON.stringify(
        state?.avatarVariantByUser ?? {},
      );
      element.dataset.visibleWaiting = String(
        projected.filter((p) => p.a.waitingSlot != null && p.pose.visible)
          .length,
      );
    };
    Promise.all([
      loadImage("/art/chapel-stage.png"),
      loadImage("/art/people-atlas.png"),
      loadImage("/art/walk-atlas.png"),
    ])
      .then(([s, p, w]) => {
        if (disposed) return;
        people = p;
        walk = w;
        resize();
        raf = requestAnimationFrame(draw);
      })
      .catch(() => {
        if (!disposed) setError(true);
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      motions.clear();
      cache.clear();
      glows.clear();
    };
  }, []);
  return error ? (
    <div className="stage-error" role="alert">
      {en.stageError}
    </div>
  ) : (
    <div ref={world} className="stage-world">
      <img className="stage-architecture" src="/art/chapel-stage.png" alt="" />
      <canvas
        ref={canvas}
        className="stage-canvas"
        aria-label={en.scene}
        data-testid="stage-canvas"
      />
    </div>
  );
}
