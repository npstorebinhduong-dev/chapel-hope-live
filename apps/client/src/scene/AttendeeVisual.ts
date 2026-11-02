import * as T from "three";
/** Original lofted anatomical fallback surfaces; not a scanned or photoreal human asset. */
function loft(rings: [number, number, number][], segments: number) {
  const positions: number[] = [],
    indices: number[] = [];
  rings.forEach(([y, width, depth]) => {
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      positions.push(Math.sin(a) * width, y, Math.cos(a) * depth);
    }
  });
  for (let r = 0; r < rings.length - 1; r++)
    for (let i = 0; i < segments; i++) {
      const a = r * (segments + 1) + i;
      indices.push(
        a,
        a + 1,
        a + segments + 1,
        a + 1,
        a + segments + 2,
        a + segments + 1,
      );
    }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
export const torsoGeometry = loft(
  [
    [-1, 0.72, 0.7],
    [-0.8, 0.9, 0.85],
    [-0.1, 0.78, 0.82],
    [0.4, 0.97, 0.9],
    [0.65, 1, 0.75],
    [0.8, 0.73, 0.64],
    [1, 0.33, 0.45],
  ],
  16,
);
export const headGeometry = loft(
  [
    [-1, 0.16, 0.3],
    [-0.84, 0.56, 0.68],
    [-0.5, 0.79, 0.82],
    [-0.1, 0.93, 0.96],
    [0.35, 0.96, 1],
    [0.72, 0.75, 0.84],
    [1, 0.12, 0.2],
  ],
  20,
);
