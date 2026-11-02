import { useMemo } from "react";
import * as T from "three";
import { stoneMaterial } from "./materials";
export function Vault() {
  const geometry = useMemo(() => {
    const positions: number[] = [],
      indices: number[] = [];
    for (let z = 0; z <= 8; z++)
      for (let x = 0; x <= 40; x++) {
        const u = (x / 40) * 2 - 1;
        positions.push(
          u * 7.15,
          7.5 + 3.7 * Math.sqrt(1 - Math.abs(u)),
          z * 4 - 14,
        );
      }
    for (let z = 0; z < 8; z++)
      for (let x = 0; x < 40; x++) {
        const i = z * 41 + x;
        indices.push(i, i + 1, i + 41, i + 1, i + 42, i + 41);
      }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#93806a"
        roughness={0.94}
        side={T.DoubleSide}
      />
    </mesh>
  );
}
