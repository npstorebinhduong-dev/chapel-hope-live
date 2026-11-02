import type { Vec3 } from "@chapel/shared";
import { woodMaterial, stoneMaterial } from "./materials";
export const stone = "#aa9477",
  lightStone = "#c8b79a",
  wood = "#3b231a",
  gold = "#ba9153";
export function Box({
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
      {[wood, "#563825", "#69492d", "#744c36"].includes(c) ? (
        <primitive object={woodMaterial} attach="material" />
      ) : [stone, lightStone].includes(c) ? (
        <primitive object={stoneMaterial} attach="material" />
      ) : (
        <meshStandardMaterial color={c} roughness={0.8} />
      )}
    </mesh>
  );
}
