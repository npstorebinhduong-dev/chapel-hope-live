import { test } from "node:test";
import assert from "node:assert/strict";
import {
  headGeometry,
  torsoGeometry,
} from "../apps/client/src/scene/AttendeeVisual.ts";
test("anatomical fallback lofts have outward normals and finite vertex data", () => {
  for (const geometry of [headGeometry, torsoGeometry]) {
    const positions = geometry.getAttribute("position"),
      normals = geometry.getAttribute("normal");
    assert.ok(positions.count > 0);
    assert.ok(geometry.index!.count > 0);
    for (let i = 0; i < positions.count; i++) {
      for (const v of [
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i),
        normals.getX(i),
        normals.getY(i),
        normals.getZ(i),
      ])
        assert.ok(Number.isFinite(v));
      const outward =
        positions.getX(i) * normals.getX(i) +
        positions.getZ(i) * normals.getZ(i);
      assert.ok(outward > 0, `inverted surface at vertex ${i}`);
    }
  }
});
