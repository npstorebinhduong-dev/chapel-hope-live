import test from "node:test";
import assert from "node:assert/strict";
import { ChapelEngine } from "../packages/shared/src/engine.ts";
import { GIFTS, giftKeys, seatPosition } from "../packages/shared/src/index.ts";
import {
  projectStage,
  stageEffect,
} from "../apps/client/src/scene/stageLayout.ts";

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

test("all gift camera effects are bounded and reset even after delayed snapshots or disconnects", () => {
  const engine = new ChapelEngine();
  for (const giftKey of giftKeys) {
    engine.control("reset");
    engine.gift(
      {
        type: "gift",
        giftKey,
        eventId: giftKey,
        userId: "viewer",
        username: "Guest",
        coinValue: GIFTS[giftKey].coins,
        repeatCount: 1,
        timestamp: 1000,
      },
      1000,
    );
    const active = engine.active!;
    for (let time = active.startedAt; time <= active.endsAt; time += 100) {
      const effect = stageEffect(active, time, true);
      assert.ok(effect.zoom >= 1 && effect.zoom <= 1.018);
      assert.ok(effect.strength >= 0 && effect.strength <= 1);
      assert.equal(stageEffect(active, time, false).zoom, 1);
    }
    assert.deepEqual(stageEffect(active, active.endsAt + 60000, true), {
      key: null,
      strength: 0,
      zoom: 1,
    });
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
