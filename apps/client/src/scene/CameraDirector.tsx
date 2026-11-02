import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { attendeePose, type Vec3 } from "@chapel/shared";
import { useSession, renderClock, sendMetrics } from "../store";
import { QUALITY, useQuality } from "../quality";
export function CameraDirector() {
  const { camera, gl } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, 3, -5), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const point = useMemo(() => new THREE.Vector3(), []);
  const frames = useRef(0),
    elapsed = useRef(0);
  useFrame((_state, delta) => {
    const state = useSession.getState().snapshot,
      active = state?.active;
    let pos: Vec3 = [0, 7.5, 18],
      aim: Vec3 = [0, 3, -5];
    if (
      active &&
      state?.settings.camera &&
      state.now + performance.now() - useSession.getState().receivedAt <
        active.endsAt - 400
    ) {
      const key = active.event.giftKey;
      if (key === "candle_1") {
        pos = [-1, 3.6, -3.5];
        aim = [-4.2, 1.8, -9.2];
      }
      if (key === "rose_5") {
        pos = [1, 3.6, -3.5];
        aim = [4.2, 1.6, -9.2];
      }
      if (key === "altar_100") {
        pos = [0, 4.6, 2.5];
        aim = [0, 2.1, -9.8];
      }
      if (key === "ceremony_500") {
        pos = [0, 6.8, 13];
        aim = [0, 3, -9];
      }
      if (key === "bell_10") {
        pos = [0, 6.5, 6];
        aim = [3.3, 3.6, -10];
      }
      if (key === "prayer_5") {
        const a = state.attendees.find((a) => a.userId === active.event.userId);
        if (a) {
          const p = attendeePose(a, renderClock(), active).position;
          pos = [p[0] * 0.3, 4.7, p[2] + 8];
          aim = [p[0], 1, p[2]];
        }
      }
    }
    const alpha = 1 - Math.exp(-delta * 2.2);
    camera.position.lerp(target.set(...pos), alpha);
    look.lerp(point.set(...aim), alpha);
    camera.lookAt(look);
    frames.current++;
    elapsed.current += delta;
    if (elapsed.current >= 1) {
      const fps = frames.current / elapsed.current;
      sendMetrics(fps);
      if (fps < 27) gl.setPixelRatio(Math.max(0.65, gl.getPixelRatio() - 0.15));
      frames.current = 0;
      elapsed.current = 0;
    }
  });
  return null;
}
