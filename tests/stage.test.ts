import test from "node:test";
import {
  cameraTarget,
  overviewCamera,
  smoothCamera,
} from "../apps/client/src/scene/stageCamera.ts";
import assert from "node:assert/strict";
import { ChapelEngine } from "../packages/shared/src/engine.ts";
import { GIFTS, giftKeys, seatPosition } from "../packages/shared/src/index.ts";
import { projectStage } from "../apps/client/src/scene/stageLayout.ts";

test("stage projection preserves unique seats, depth ordering and visible sanctuary", () => {
  const locations = new Set<string>();
  for (let seat = 0; seat < 64; seat++) {
    const [x, , z] = seatPosition(seat);
    const p = projectStage(x, z);
    assert.ok(p.x > 0 && p.x < 1 && p.y > 0.58 && p.y < 0.9);
    assert.ok(Number.isFinite(p.height) && p.height > 0);
    locations.add(`${p.x}:${p.y}`);
    if (seat >= 8) {
      const prev = seatPosition(seat - 8);
      assert.ok(p.y > projectStage(prev[0], prev[2]).y);
    }
  }
  assert.equal(locations.size, 64);
  assert.ok(projectStage(0, -9).y < projectStage(0, -6.8).y);
});

test("every gift focuses its donor, preserves the foyer and releases after disconnect", () => {
  for (const giftKey of giftKeys) {
    const engine = new ChapelEngine();
    engine.gift({
      type: "gift",
      giftKey,
      eventId: giftKey,
      userId: "donor",
      username: "Guest",
      coinValue: GIFTS[giftKey].coins,
      repeatCount: 1,
      timestamp: 1000,
    });
    const active = engine.active!;
    let camera = overviewCamera(),
      peak = 1;
    for (
      let now = active.startedAt - 3000;
      now < active.endsAt + 5000;
      now += 16
    ) {
      const target = cameraTarget(
        active,
        now,
        true,
        giftKey === "candle_1" ? 0.225 : 0.5,
      );
      camera = smoothCamera(camera, target, 0.016);
      peak = Math.max(peak, camera.zoom);
      assert.ok(camera.zoom >= 1 && camera.zoom <= 1.28);
      assert.ok(
        Math.abs(camera.zoom + camera.y - 1) < 0.0001,
        "bottom of crowd stays in frame",
      );
      assert.ok(camera.x >= 1 - camera.zoom - 0.0001 && camera.x <= 0.0001);
      assert.deepEqual(cameraTarget(active, now, false), overviewCamera());
    }
    assert.ok(peak > 1.04, `${giftKey} must visibly focus`);
    assert.ok(Math.abs(camera.zoom - 1) < 0.0001);
    assert.equal(camera.focus, "");
    const middle = cameraTarget(active, active.startedAt + 1000, true);
    assert.equal(middle.focus, "donor");
    assert.deepEqual(
      cameraTarget(active, active.endsAt + 60000, true),
      overviewCamera(),
    );
  }
});

test("foyer-to-aisle projection has no position or scale discontinuity", () => {
  for (const z of [5.1, 7.8, 18, 20.4]) {
    const before = projectStage(-3, z - 0.0001),
      after = projectStage(-3, z + 0.0001);
    assert.ok(Math.abs(before.x - after.x) < 0.0001);
    assert.ok(Math.abs(before.y - after.y) < 0.0001);
    assert.ok(Math.abs(before.height - after.height) < 0.0001);
  }
});
