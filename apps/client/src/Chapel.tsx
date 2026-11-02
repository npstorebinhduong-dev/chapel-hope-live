import { AttendeeLOD } from "./scene/AttendeeLOD";
import { Box, wood, gold } from "./scene/ScenePrimitives";
import { CathedralArchitecture } from "./scene/CathedralArchitecture";
import { CandleStation } from "./scene/CandleStation";
import { FlowerOffering } from "./scene/FlowerOffering";
import { ChapelFX } from "./scene/ChapelFX";
import { ChapelLighting } from "./scene/ChapelLighting";
import { CameraDirector } from "./scene/CameraDirector";
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
    (!selected || active.presentation || active.event.giftKey === "rose_5") &&
    (active.event.giftKey === "prayer_5" ||
      active.event.giftKey === "altar_100" ||
      active.event.giftKey === "rose_5")
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
      <AttendeeLOD
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
      {selected &&
        active?.event.giftKey !== "altar_100" &&
        active?.event.giftKey !== "ceremony_500" && (
          <group ref={label}>
            <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
              <span className="avatar-label">{selected.username}</span>
            </Html>
          </group>
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
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.outputColorSpace = THREE.SRGBColorSpace;
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
            {assets.environment ? (
              <LicensedModel asset={assets.environment} />
            ) : (
              <CathedralArchitecture />
            )}
            <CandleStation />
            <FlowerOffering />
            <ChapelFX />
            <GothicDetails />
            <Congregation />
            <ChapelLighting />
            <Bell />
          </Suspense>
          <CameraDirector />
        </Canvas>
      )}
    </SceneBoundary>
  );
}
