import { torsoGeometry, headGeometry } from "./scene/AttendeeVisual";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as T from "three";
import {
  attendeePose,
  destination,
  type Attendee,
  type ActiveGift,
} from "@chapel/shared";
import { renderClock } from "./store";
import { QUALITY, useQuality } from "./quality";
const colors = [
  "#586475",
  "#79554a",
  "#526754",
  "#75627b",
  "#ae9676",
  "#405c74",
  "#7a705b",
  "#684c43",
  "#444b60",
  "#717a67",
  "#956e52",
  "#5d4b63",
];
/** A bounded palette of shared geometry: four shared draw calls for the entire procedural congregation. */
export function Crowd({
  attendees,
  active,
}: {
  attendees: (Attendee & { renderRole?: "npc" | "presenter" })[];
  active: ActiveGift | null;
}) {
  const round = useRef<T.InstancedMesh>(null!),
    blocks = useRef<T.InstancedMesh>(null!);
  const torsos = useRef<T.InstancedMesh>(null!),
    heads = useRef<T.InstancedMesh>(null!);
  const level = useQuality((s) => s.level);
  const scratch = useMemo(
    () => ({
      object: new T.Object3D(),
      root: new T.Matrix4(),
      local: new T.Matrix4(),
      color: new T.Color(),
      q: new T.Quaternion(),
      axis: new T.Vector3(0, 1, 0),
      frustum: new T.Frustum(),
      projection: new T.Matrix4(),
      sphere: new T.Sphere(new T.Vector3(), 2),
      states: new Map<
        string,
        {
          sit: number;
          kneel: number;
          yaw: number;
          x: number;
          z: number;
          shown: number;
        }
      >(),
    }),
    [],
  );
  useFrame(({ camera }, delta) => {
    let ri = 0,
      bi = 0,
      ti = 0,
      hi = 0;
    const now = renderClock(),
      dt = Math.min(delta, 0.08),
      blend = 1 - Math.exp(-dt * 9);
    scratch.frustum.setFromProjectionMatrix(
      scratch.projection.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse,
      ),
    );
    const detailedIds = new Set(
      attendees
        .map((a) => ({
          id: a.userId,
          d: camera.position.distanceTo(new T.Vector3(...destination(a))),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, QUALITY[level].details)
        .map((a) => a.id),
    );
    const ids = new Set(
      attendees.map((a) => `${a.renderRole ?? "viewer"}:${a.userId}`),
    );
    for (const id of scratch.states.keys())
      if (!ids.has(id)) scratch.states.delete(id);
    const put = (
      kind: "round" | "box" | "torso" | "head",
      x: number,
      y: number,
      z: number,
      sx: number,
      sy: number,
      sz: number,
      color: string,
      rx = 0,
    ) => {
      const o = scratch.object;
      o.position.set(x, y, z);
      o.rotation.set(rx, 0, 0);
      o.scale.set(sx, sy, sz);
      o.updateMatrix();
      scratch.local.multiplyMatrices(scratch.root, o.matrix);
      const mesh =
          kind === "torso"
            ? torsos.current
            : kind === "head"
              ? heads.current
              : kind === "round"
                ? round.current
                : blocks.current,
        index =
          kind === "torso"
            ? ti++
            : kind === "head"
              ? hi++
              : kind === "round"
                ? ri++
                : bi++;
      mesh.setMatrixAt(index, scratch.local);
      mesh.setColorAt(index, scratch.color.set(color));
    };
    attendees.forEach((a, index) => {
      const npc = a.renderRole === "npc",
        presenter = a.renderRole === "presenter";
      const renderId = `${a.renderRole ?? "viewer"}:${a.userId}`;
      const event = active?.presentation && !presenter ? null : active;
      const actor =
        presenter && active ? { ...a, userId: active.event.userId } : a;
      const pose =
        presenter && active?.event.giftKey === "rose_5"
          ? { position: [3.5, 0, -8.25], state: "gift_reacting", visible: true }
          : npc
            ? {
                position: destination(a),
                state:
                  active?.event.giftKey === "ceremony_500"
                    ? "kneeling"
                    : "seated",
                visible: true,
              }
            : attendeePose(actor, now, event);
      let s = scratch.states.get(renderId);
      if (!s) {
        s = {
          sit: pose.state === "seated" ? 1 : 0,
          kneel: 0,
          yaw: 0,
          x: pose.position[0],
          z: pose.position[2],
          shown: 0,
        };
        scratch.states.set(renderId, s);
      }
      const walking =
        pose.state === "walking_to_seat" ||
        pose.state === "leaving" ||
        (pose.state === "gift_reacting" &&
          active?.event.giftKey === "altar_100");
      const dx = pose.position[0] - s.x,
        dz = pose.position[2] - s.z;
      const yaw =
        walking && Math.hypot(dx, dz) > 0.002 ? Math.atan2(-dx, -dz) : 0;
      s.yaw += Math.atan2(Math.sin(yaw - s.yaw), Math.cos(yaw - s.yaw)) * blend;
      s.x = pose.position[0];
      s.z = pose.position[2];
      s.sit += ((pose.state === "seated" ? 1 : 0) - s.sit) * blend;
      s.kneel += ((pose.state === "kneeling" ? 1 : 0) - s.kneel) * blend;
      s.shown += ((pose.visible ? 1 : 0) - s.shown) * blend;
      if (!pose.visible && s.shown < 0.01) return;
      scratch.q.setFromAxisAngle(scratch.axis, s.yaw);
      scratch.root.compose(
        // Move onto the kneeler before lowering the hips, clear of the seat slab.
        new T.Vector3(
          s.x,
          0,
          s.z -
            (a.seat !== null && active?.event.giftKey !== "altar_100"
              ? 0.65 * s.kneel
              : 0),
        ),
        scratch.q,
        new T.Vector3(1, s.shown, 1),
      );
      scratch.sphere.center.set(s.x, 1, s.z);
      if (!scratch.frustum.intersectsSphere(scratch.sphere)) return;
      const detailed =
        detailedIds.has(a.userId) || active?.event.userId === a.userId;
      const phase = now * 0.007 + a.variant * 1.37,
        gait = walking ? Math.sin(phase) * 0.48 : 0;
      const hip = 0.91 - s.sit * 0.19 - s.kneel * 0.48,
        breath = Math.sin(now * 0.0015 + a.variant) * 0.006;
      const coat = colors[a.variant % 12],
        skin = ["#ddb496", "#b58265", "#855b45", "#cc997a"][a.variant % 4];
      put(
        "torso",
        0,
        hip + 0.27 + breath,
        0,
        0.23,
        0.34,
        0.145,
        coat,
        -s.kneel * 0.16,
      );
      put(
        "head",
        0,
        hip + 0.69 + breath,
        -s.kneel * 0.09,
        0.125,
        0.16,
        0.125,
        skin,
      );
      put(
        "round",
        0,
        hip + 0.78 + breath,
        0.014 - s.kneel * 0.09,
        0.13,
        0.085 + (a.variant % 3) * 0.018,
        0.13,
        a.variant % 3 ? "#3c3029" : "#8a8175",
      );
      for (const side of [-1, 1]) {
        const thigh = (s.sit * Math.PI) / 2 + s.kneel * 0.8 + gait * side;
        const knee =
          (-s.sit * Math.PI) / 2 -
          s.kneel * 1.8 -
          Math.max(0, gait * side) * 0.6;
        const hx = side * 0.105,
          ky = hip - Math.cos(thigh) * 0.41,
          kz = -Math.sin(thigh) * 0.41;
        put(
          "round",
          hx,
          hip - Math.cos(thigh) * 0.205,
          -Math.sin(thigh) * 0.205,
          0.085,
          0.235,
          0.085,
          "#343840",
          thigh,
        );
        put(
          "round",
          hx,
          ky - Math.cos(thigh + knee) * 0.2,
          kz - Math.sin(thigh + knee) * 0.2,
          0.068,
          0.23,
          0.068,
          "#343840",
          thigh + knee,
        );
        put(
          "box",
          hx,
          Math.max(0.065, ky - Math.cos(thigh + knee) * 0.4),
          kz - Math.sin(thigh + knee) * 0.4 - 0.06,
          0.14,
          0.12,
          0.25,
          "#292522",
        );
        const arm = s.kneel * -0.95 - gait * side * 0.65;
        put(
          "round",
          side * 0.24,
          hip + 0.23,
          -0.04,
          0.065,
          0.26,
          0.065,
          coat,
          arm,
        );
        if (detailed)
          put(
            "round",
            side * 0.22,
            hip + 0.02,
            -0.04 + Math.sin(arm) * 0.23,
            0.052,
            0.07,
            0.045,
            skin,
          );
      }
      if (detailed) {
        for (const side of [-1, 1]) {
          put(
            "round",
            side * 0.047,
            hip + 0.71,
            -0.113,
            0.012,
            0.008,
            0.008,
            "#40362c",
          );
          put("round", side * 0.118, hip + 0.68, 0, 0.025, 0.045, 0.025, skin);
        }
        if (a.variant % 3 === 1) {
          put("round", 0, hip + 0.66, 0.082, 0.135, 0.2, 0.075, "#564034");
        }
        if (a.variant % 3 === 2) {
          put("round", 0, hip + 0.76, 0.12, 0.07, 0.1, 0.09, "#312b27");
        }
        put("box", 0, hip + 0.44, -0.14, 0.035, 0.23, 0.012, "#c4b49a");
        put("round", 0, hip + 0.67, -0.125, 0.025, 0.035, 0.035, skin);
      }
    });
    for (const [mesh, count] of [
      [round.current, ri],
      [blocks.current, bi],
      [torsos.current, ti],
      [heads.current, hi],
    ] as const) {
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  });
  return (
    <>
      <instancedMesh
        ref={torsos}
        args={[torsoGeometry, undefined, 120]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.94} />
      </instancedMesh>
      <instancedMesh
        ref={heads}
        args={[headGeometry, undefined, 120]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.82} />
      </instancedMesh>
      <instancedMesh
        ref={round}
        args={[undefined, undefined, 2400]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial roughness={0.93} />
      </instancedMesh>
      <instancedMesh
        ref={blocks}
        args={[undefined, undefined, 600]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
    </>
  );
}
