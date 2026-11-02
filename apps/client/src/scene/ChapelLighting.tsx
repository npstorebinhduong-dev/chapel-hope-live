import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { attendeePose, type Vec3 } from "@chapel/shared";
import { useSession, renderClock, sendMetrics } from "../store";
import { QUALITY, useQuality } from "../quality";
export function ChapelLighting() {
  const particles = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const beam = useRef<THREE.SpotLight>(null!);
  const blue = useRef<THREE.PointLight>(null!),
    amber = useRef<THREE.PointLight>(null!);
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
    blue.current.intensity = THREE.MathUtils.damp(
      blue.current.intensity,
      active?.event.giftKey === "ceremony_500" ? 24 : 0,
      1.6,
      delta,
    );
    amber.current.intensity = THREE.MathUtils.damp(
      amber.current.intensity,
      active?.event.giftKey === "ceremony_500" ? 30 : 0,
      1.6,
      delta,
    );
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
      <pointLight
        ref={blue}
        position={[-5, 6, -8]}
        color="#97b9de"
        intensity={0}
        distance={15}
      />
      <pointLight
        ref={amber}
        position={[5, 6, -8]}
        color="#e8bd78"
        intensity={0}
        distance={15}
      />
      <directionalLight
        position={[-2, 7, 14]}
        intensity={0.8}
        color="#d7ddec"
      />
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
      <instancedMesh
        frustumCulled={false}
        ref={particles}
        args={[undefined, undefined, 64]}
      >
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#e9cb8c" transparent opacity={0.35} />
      </instancedMesh>
    </>
  );
}
