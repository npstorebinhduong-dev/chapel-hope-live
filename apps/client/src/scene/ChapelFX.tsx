import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as T from "three";
import { useSession, renderClock } from "../store";
import { QUALITY, useQuality } from "../quality";
export function ChapelFX() {
  const glow = useRef<T.Mesh>(null!),
    petals = useRef<T.InstancedMesh>(null!);
  const mat = useRef<T.MeshBasicMaterial>(null!);
  const dummy = useMemo(() => new T.Object3D(), []);
  const quality = QUALITY[useQuality((s) => s.level)];
  useFrame((_s, delta) => {
    const active = useSession.getState().snapshot?.active,
      key = active?.event.giftKey;
    const ceremony = key === "ceremony_500",
      altar = key === "altar_100" || key === "prayer_5";
    mat.current.opacity = T.MathUtils.damp(
      mat.current.opacity,
      ceremony ? 0.22 : altar ? 0.12 : 0,
      2,
      delta,
    );
    const n = ceremony ? Math.min(24, quality.particles) : 0,
      t = renderClock() / 1000;
    for (let i = 0; i < n; i++) {
      dummy.position.set(
        Math.sin(i * 8.7) * 3,
        1 + ((i * 0.17 + t * 0.12) % 4),
        -10 + Math.cos(i * 5.3) * 2,
      );
      dummy.rotation.set(t * 0.18 + i, i, t * 0.12);
      dummy.scale.set(0.025, 0.006, 0.045);
      dummy.updateMatrix();
      petals.current.setMatrixAt(i, dummy.matrix);
    }
    petals.current.count = n;
    petals.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <mesh
        ref={glow}
        position={[0, 0.055, -9]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[2.6, 64]} />
        <meshBasicMaterial
          ref={mat}
          color="#d8b471"
          transparent
          opacity={0}
          blending={T.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh
        frustumCulled={false}
        ref={petals}
        args={[undefined, undefined, 24]}
      >
        <sphereGeometry args={[1, 5, 4]} />
        <meshStandardMaterial
          color="#e9d7b2"
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
