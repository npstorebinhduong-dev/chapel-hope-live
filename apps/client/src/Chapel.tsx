import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  attendeePose,
  destination,
  seatPosition,
  type Attendee,
  type Vec3,
} from "@chapel/shared";
import { useSession, renderClock, sendMetrics } from "./store";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { Crowd } from "./Crowd";
import { QUALITY, useQuality } from "./quality";
import { GothicDetails } from "./GothicDetails";
import { en } from "./strings";
import { assets, type LicensedAsset } from "./assets";
const EMPTY_ATTENDEES: Attendee[] = [];
function LicensedModel({ asset }: { asset: LicensedAsset }) {
  const { scene } = useGLTF(asset.url);
  const clone = useMemo(() => cloneSkeleton(scene), [scene]);
  return <primitive object={clone} scale={asset.scale} />;
}

const stone = "#aa9477",
  lightStone = "#c8b79a",
  wood = "#3b231a",
  gold = "#ba9153";
function Box({
  p,
  s,
  c = stone,
  ...rest
}: {
  p: Vec3;
  s: Vec3;
  c?: string;
  rotation?: Vec3;
}) {
  return (
    <mesh position={p} scale={s} receiveShadow castShadow {...rest}>
      <boxGeometry />
      <meshStandardMaterial color={c} roughness={0.88} />
    </mesh>
  );
}
function Column({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.22, 0]} s={[0.8, 0.44, 0.8]} c={lightStone} />
      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.29, 0.4, 8, 10]} />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>
      {[-0.24, 0.24].map((d, i) => (
        <mesh key={i} position={[d, 4.1, -0.2]}>
          <cylinderGeometry args={[0.095, 0.095, 7.5, 6]} />
          <meshStandardMaterial color={lightStone} />
        </mesh>
      ))}
      <Box p={[0, 8.2, 0]} s={[0.85, 0.35, 0.85]} c={lightStone} />
    </group>
  );
}
function Rib({ z }: { z: number }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6.9, 7.5, z),
        new THREE.Vector3(-4.4, 9.2, z),
        new THREE.Vector3(0, 11, z),
        new THREE.Vector3(4.4, 9.2, z),
        new THREE.Vector3(6.9, 7.5, z),
      ]),
    [z],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 32, 0.12, 6, false]} />
      <meshStandardMaterial color={lightStone} />
    </mesh>
  );
}
function Window({ p, side = false }: { p: Vec3; side?: boolean }) {
  const colors = [
    "#b67b3e",
    "#365c78",
    "#9d4035",
    "#cf9d58",
    "#416d77",
    "#926a8e",
  ];
  return (
    <group
      position={p}
      rotation={[0, side ? (p[0] < 0 ? Math.PI / 2 : -Math.PI / 2) : 0, 0]}
    >
      <Box p={[0, 0, 0]} s={[2.25, 4.45, 0.15]} c={"#4a4137"} />
      {[-1, 0, 1].map((col) => (
        <group key={col}>
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <mesh key={row} position={[col * 0.62, (row - 2.5) * 0.61, 0.1]}>
              <planeGeometry args={[0.54, 0.54]} />
              <meshStandardMaterial
                color={colors[(row + col + 6) % 6]}
                emissive={colors[(row + col + 6) % 6]}
                emissiveIntensity={0.7}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
      {[-1.05, -0.33, 0.33, 1.05].map((x) => (
        <Box key={x} p={[x, 0, 0.15]} s={[0.07, 4.4, 0.12]} c={gold} />
      ))}
      {[-2.15, 0, 2.15].map((y) => (
        <Box key={y} p={[0, y, 0.15]} s={[2.3, 0.08, 0.12]} c={gold} />
      ))}
    </group>
  );
}
function RoseWindow() {
  return (
    <group position={[0, 6.9, -13.15]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.45, 2.45, 0.18, 48]} />
        <meshStandardMaterial color={lightStone} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial
          color="#102b37"
          emissive="#245061"
          emissiveIntensity={0.55}
        />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 1.35, 0.16]} scale={[0.43, 0.83, 1]}>
              <circleGeometry args={[1, 12]} />
              <meshStandardMaterial
                color={i % 2 ? "#cc9751" : "#6993a1"}
                emissive={i % 2 ? "#ba762d" : "#356785"}
                emissiveIntensity={0.7}
              />
            </mesh>
            <Box p={[0, 1.32, 0.21]} s={[0.035, 1.9, 0.06]} c={gold} />
          </group>
        );
      })}
      {[0.52, 2.24].map((r) => (
        <mesh key={r} position={[0, 0, 0.24]}>
          <torusGeometry args={[r, 0.075, 6, 64]} />
          <meshStandardMaterial color={gold} metalness={0.45} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.22]}>
        <circleGeometry args={[0.43, 16]} />
        <meshStandardMaterial
          color="#eedbb0"
          emissive="#edb75b"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
function Floor() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => {
    const dummy = new THREE.Object3D(),
      color = new THREE.Color();
    let i = 0;
    for (let x = -7; x < 7; x++)
      for (let z = -14; z < 18; z++) {
        dummy.position.set(x + 0.5, -0.055, z + 0.5);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
        color.set((x + z) % 2 === 0 ? "#9b8e79" : "#6c665b");
        ref.current.setColorAt(i++, color);
      }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <>
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[15.3, 0.2, 36]} />
        <meshStandardMaterial color="#6c6251" />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, 448]} receiveShadow>
        <boxGeometry args={[0.97, 0.08, 0.97]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <Box p={[0, 0.01, 1]} s={[2.05, 0.035, 26]} c="#6b2528" />
      {[-0.94, 0.94].map((x) => (
        <Box key={x} p={[x, 0.035, 1]} s={[0.035, 0.01, 26]} c="#b59459" />
      ))}
    </>
  );
}
function Pews() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, row) =>
        [-1, 1].map((side) => {
          const z = -6.8 + row * 1.7;
          return (
            <group key={`${row}-${side}`} position={[side * 3.3, 0, z]}>
              <Box p={[0, 0.65, 0]} s={[3.7, 0.17, 0.64]} c="#563825" />
              <Box p={[0, 1.0, 0.3]} s={[3.7, 0.58, 0.13]} c={wood} />
              <Box p={[0, 1.32, 0.3]} s={[3.8, 0.1, 0.2]} c="#69492d" />
              {[-1.85, 1.85].map((x) => (
                <group key={x}>
                  <Box p={[x, 0.78, 0.05]} s={[0.16, 1.5, 0.9]} c={wood} />
                  <mesh position={[x, 1.6, 0.3]}>
                    <sphereGeometry args={[0.13, 8, 8]} />
                    <meshStandardMaterial color={wood} />
                  </mesh>
                </group>
              ))}
              {[-1.3, 1.3].map((x) => (
                <Box key={x} p={[x, 0.28, 0]} s={[0.16, 0.56, 0.55]} c={wood} />
              ))}
              <Box p={[0, 0.2, -0.65]} s={[3.4, 0.11, 0.26]} c="#744c36" />
            </group>
          );
        }),
      )}
    </group>
  );
}
function Chandelier({ z }: { z: number }) {
  return (
    <group position={[0, 7.5, z]}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 5, 6]} />
        <meshStandardMaterial color={gold} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.045, 6, 32]} />
        <meshStandardMaterial color={gold} metalness={0.6} roughness={0.3} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <group key={i} position={[Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
              <meshStandardMaterial color="#f1dfba" />
            </mesh>
            <mesh position={[0, 0.46, 0]} scale={[1, 1.9, 1]}>
              <sphereGeometry args={[0.065, 6, 6]} />
              <meshBasicMaterial color="#ffe1a1" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
function Altar() {
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          p={[0, 0.12 + i * 0.15, -11.5 - i * 0.25]}
          s={[9 - i * 1.1, 0.24 + i * 0.15, 3 - i * 0.35]}
          c={lightStone}
        />
      ))}
      <Box p={[0, 1.2, -11.5]} s={[3.5, 1.5, 1.1]} c="#a7987d" />
      <Box p={[0, 2, -11.5]} s={[4.3, 0.22, 1.6]} c="#e1d4b6" />
      <Box p={[0, 1.75, -10.68]} s={[3.65, 0.7, 0.025]} c="#e8dcc3" />
      <Box p={[0, 1.6, -10.65]} s={[0.07, 0.35, 0.035]} c={gold} />
      <Box p={[0, 1.65, -10.64]} s={[0.25, 0.055, 0.035]} c={gold} />
      <Box p={[0, 3.9, -12.7]} s={[0.16, 2.6, 0.18]} c={gold} />
      <Box p={[0, 4.35, -12.7]} s={[1.25, 0.16, 0.18]} c={gold} />
      {[-1.7, 1.7].map((x) => (
        <group key={x} position={[x, 2.2, -11.5]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.1, 0.4, 8]} />
            <meshStandardMaterial color={gold} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.4, 8]} />
            <meshStandardMaterial color="#e9d9b8" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ffe2a2" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function Offerings() {
  const candles = useSession((s) => s.snapshot?.candles ?? 0),
    roses = useSession((s) => s.snapshot?.roses ?? 0);
  return (
    <>
      <Box p={[-4.2, 0.75, -9.2]} s={[2.5, 1.5, 1.1]} c={wood} />
      <Box p={[4.2, 0.6, -9.2]} s={[2.5, 1.2, 1.1]} c={lightStone} />
      {Array.from({ length: 64 }, (_, i) => {
        const lit = i < candles;
        return (
          <group
            key={i}
            position={[
              -5.2 + (i % 8) * 0.28,
              1.6,
              -9.6 + Math.floor(i / 8) * 0.12,
            ]}
          >
            <mesh>
              <cylinderGeometry
                args={[0.05, 0.052, 0.26 + (i % 3) * 0.04, 6]}
              />
              <meshStandardMaterial color={lit ? "#f4dfac" : "#aa9675"} />
            </mesh>
            {lit && (
              <mesh position={[0, 0.22, 0]} scale={[1, 1.7, 1]}>
                <sphereGeometry args={[0.045, 6, 6]} />
                <meshBasicMaterial color="#ffcb65" />
              </mesh>
            )}
          </group>
        );
      })}
      {Array.from({ length: roses }, (_, i) => (
        <group
          key={i}
          position={[
            3.3 + (i % 8) * 0.24,
            1.25 + Math.floor(i / 8) * 0.045,
            -9.55 + Math.floor(i / 8) * 0.15,
          ]}
          rotation={[0.25, 0, 0.5]}
        >
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.35, 4]} />
            <meshStandardMaterial color="#3c6648" />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <dodecahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial color="#fff4dd" />
          </mesh>
          <mesh position={[0.04, 0.2, 0]} scale={[1, 2, 0.3]}>
            <sphereGeometry args={[0.055, 5, 5]} />
            <meshStandardMaterial color="#56774b" />
          </mesh>
        </group>
      ))}
    </>
  );
}
function Architecture() {
  if (assets.environment) return <LicensedModel asset={assets.environment} />;
  return (
    <group>
      <Floor />
      <Pews />
      <Altar />
      <Offerings />
      <Box p={[0, 5, -13.5]} s={[15.3, 11, 0.5]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box p={[side * 7.4, 5, 0]} s={[0.5, 11, 28]} />
          {[-10, -5, 0, 5, 10].map((z) => (
            <Column key={z} x={side * 6.9} z={z} />
          ))}
          {[-9, -3, 3, 9].map((z) => (
            <Window key={z} p={[side * 7.08, 5.3, z]} side />
          ))}
          <Box p={[side * 7.0, 2.3, 0]} s={[0.3, 0.2, 28]} c={lightStone} />
          <Box p={[side * 7.0, 0.4, 0]} s={[0.4, 0.8, 28]} c="#8d7a62" />
        </group>
      ))}
      {[-10, -5, 0, 5, 10].map((z) => (
        <Rib key={z} z={z} />
      ))}
      <Box p={[0, 11.4, 0]} s={[15.3, 0.5, 36]} c="#574c3e" />
      <Box p={[0, 10.95, 0]} s={[0.15, 0.16, 28]} c={lightStone} />
      {[-3.8, 3.8].map((x) => (
        <group key={x}>
          <Box p={[x, 4.4, -13.12]} s={[0.34, 8.8, 0.23]} c={lightStone} />
          <Box p={[x, 3, -12.95]} s={[0.62, 0.13, 0.35]} c={gold} />
        </group>
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <Box
          key={i}
          p={[0, 0.45 + i * 0.88, -13.225]}
          s={[12.5, 0.018, 0.012]}
          c="#8e7d65"
        />
      ))}
      <RoseWindow />
      <Chandelier z={-5} />
      <Chandelier z={5} />
    </group>
  );
}
const npcs: Attendee[] = Array.from({ length: 16 }, (_, i) => ({
  userId: `npc-${i}`,
  username: "Background NPC",
  seat: i,
  overflow: null,
  joinedAt: 0,
  lastSeen: 0,
  walkAt: 0,
  variant: i % 12,
}));
function Congregation() {
  const attendees = useSession((s) => s.snapshot?.attendees ?? EMPTY_ATTENDEES),
    showNpc = useSession((s) => s.snapshot?.settings.npcs ?? true);
  const active = useSession((s) => s.snapshot?.active ?? null);
  const selected = attendees.find((a) => a.userId === active?.event.userId);
  const transient =
    active &&
    (!selected || active.presentation) &&
    (active.event.giftKey === "prayer_5" ||
      active.event.giftKey === "altar_100")
      ? ({
          userId: active.event.userId,
          username: active.event.username,
          seat: null,
          overflow: 0,
          joinedAt: active.startedAt,
          lastSeen: active.startedAt,
          walkAt: active.endsAt + 1,
          variant: 5,
        } satisfies Attendee)
      : null;
  const label = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (!label.current || !selected) return;
    const pose = attendeePose(selected, renderClock(), active);
    label.current.position.set(pose.position[0], 2.25, pose.position[2]);
    label.current.visible = pose.visible;
  });
  return (
    <>
      <Crowd
        attendees={[
          ...(showNpc
            ? npcs.map((a) => ({ ...a, renderRole: "npc" as const }))
            : []),
          ...attendees,
          ...(transient
            ? [
                {
                  ...transient,
                  userId: `presentation-${transient.userId}`,
                  renderRole: "presenter" as const,
                },
              ]
            : []),
        ]}
        active={active}
      />
      {selected && (
        <group ref={label}>
          <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
            <span className="avatar-label">{selected.username}</span>
          </Html>
        </group>
      )}
    </>
  );
}
function Atmosphere() {
  const particles = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const beam = useRef<THREE.SpotLight>(null!);
  const active = useSession((s) => s.snapshot?.active ?? null);
  const quality = QUALITY[useQuality((s) => s.level)];
  useFrame((_state, delta) => {
    const t = renderClock() / 1000;
    for (let i = 0; i < quality.particles; i++) {
      dummy.position.set(
        Math.sin(i * 127.1) * 5.4,
        1 + ((i * 0.371 + t * 0.045) % 7),
        Math.cos(i * 37.7) * 11,
      );
      dummy.scale.setScalar(0.012 + (i % 3) * 0.006);
      dummy.updateMatrix();
      particles.current.setMatrixAt(i, dummy.matrix);
    }
    particles.current.count = quality.particles;
    particles.current.instanceMatrix.needsUpdate = true;
    const targetIntensity =
      active?.event.giftKey === "ceremony_500"
        ? 100
        : active?.event.giftKey === "altar_100"
          ? 65
          : 24;
    beam.current.intensity = THREE.MathUtils.damp(
      beam.current.intensity,
      targetIntensity,
      2,
      delta,
    );
  });
  return (
    <>
      <ambientLight intensity={0.65} color="#d9d4c8" />
      <hemisphereLight args={["#c8dce6", "#65513a", 1.2]} />
      <directionalLight
        position={[3, 10, -5]}
        intensity={2.3}
        color="#ffdc9d"
        castShadow={quality.shadows}
        shadow-mapSize={[quality.shadowSize, quality.shadowSize]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.001}
      />
      <spotLight
        ref={beam}
        position={[0, 9, -8]}
        angle={0.65}
        penumbra={0.8}
        color="#ffd79c"
        distance={24}
      />
      <pointLight
        position={[-4, 3, -9]}
        intensity={12}
        color="#ffab50"
        distance={7}
      />
      <pointLight
        position={[4, 4, 1]}
        intensity={15}
        color="#a8bbdc"
        distance={14}
      />
      <pointLight
        position={[0, 6, 6]}
        intensity={24}
        color="#ffd69b"
        distance={16}
      />
      <instancedMesh ref={particles} args={[undefined, undefined, 64]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#e9cb8c" transparent opacity={0.35} />
      </instancedMesh>
      {active?.event.giftKey === "ceremony_500" && (
        <mesh position={[0, 0.1, -8]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 2.5, 64]} />
          <meshBasicMaterial
            color="#e3ba66"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  );
}
function Bell() {
  const ref = useRef<THREE.Group>(null!);
  const active = useSession((s) => s.snapshot?.active ?? null);
  useFrame(() => {
    ref.current.rotation.z =
      active?.event.giftKey === "bell_10" ||
      active?.event.giftKey === "ceremony_500"
        ? Math.sin(renderClock() * 0.009) * 0.25
        : 0;
  });
  return (
    <group position={[3.9, 4, -11]}>
      <Box p={[0, 0.85, 0]} s={[1.5, 0.13, 0.45]} c={wood} />
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.52, 0.65, 16, 1, true]} />
          <meshStandardMaterial
            color={gold}
            metalness={0.7}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.06, 6, 24]} />
          <meshStandardMaterial color={gold} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
function Director() {
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
        pos = [-1, 5.4, 1];
        aim = [-4.2, 1.8, -9.2];
      }
      if (key === "rose_5") {
        pos = [1, 5.4, 1];
        aim = [4.2, 1.6, -9.2];
      }
      if (key === "altar_100") {
        pos = [0, 5.2, 4];
        aim = [0, 2.3, -11];
      }
      if (key === "ceremony_500") {
        pos = [0, 6.6, 11];
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
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="webgl-fallback">
        {en.fallback}
        <button onClick={() => location.reload()}>{en.retry}</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function Chapel() {
  const quality = QUALITY[useQuality((s) => s.level)];
  const [contextLost, setContextLost] = useState(false);
  return (
    <SceneBoundary>
      {contextLost ? (
        <div className="webgl-fallback">
          {en.fallback}
          <button onClick={() => location.reload()}>{en.retry}</button>
        </div>
      ) : (
        <Canvas
          shadows={quality.shadows}
          dpr={quality.dpr}
          camera={{ position: [0, 7.5, 18], fov: 52, near: 0.1, far: 85 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor("#26241f");
            gl.domElement.setAttribute("aria-label", en.scene);
            gl.domElement.addEventListener(
              "webglcontextlost",
              (event) => {
                event.preventDefault();
                setContextLost(true);
              },
              { once: true },
            );
          }}
        >
          <fog attach="fog" args={["#302c25", 26, 60]} />
          <Suspense fallback={null}>
            <Architecture />
            <GothicDetails />
            <Congregation />
            <Atmosphere />
            <Bell />
          </Suspense>
          <Director />
        </Canvas>
      )}
    </SceneBoundary>
  );
}
