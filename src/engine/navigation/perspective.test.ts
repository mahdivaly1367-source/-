import test from "node:test";
import assert from "node:assert/strict";
import {
  pointInPolygon,
  projectToWalkableArea,
  scaleFromDepth,
} from "./perspective";

const square = [[10, 10], [90, 10], [90, 90], [10, 90]] as const;

test("depth scale matches the specified far and near limits", () => {
  assert.equal(scaleFromDepth(35), 0.75);
  assert.equal(scaleFromDepth(90), 1.05);
  assert.ok(Math.abs(scaleFromDepth(62.5) - 0.9) < 1e-10);
});

test("depth scale clamps values outside the scene depth", () => {
  assert.equal(scaleFromDepth(-20), 0.75);
  assert.equal(scaleFromDepth(120), 1.05);
});

test("point-in-polygon accepts points inside and on edges", () => {
  assert.equal(pointInPolygon([50, 50], square), true);
  assert.equal(pointInPolygon([10, 50], square), true);
  assert.equal(pointInPolygon([5, 50], square), false);
});

test("outside clicks project to the nearest walkable boundary", () => {
  assert.deepEqual(projectToWalkableArea([50, 2], square), [50, 10]);
  assert.deepEqual(projectToWalkableArea([120, 55], square), [90, 55]);
});

test("inside clicks keep their original normalized position", () => {
  assert.deepEqual(projectToWalkableArea([45, 65], square), [45, 65]);
});

test("malformed perspective and polygon definitions fail clearly", () => {
  assert.throws(() => scaleFromDepth(40, {
    minY: 90, maxY: 90, minScale: 0.75, maxScale: 1.05,
  }), RangeError);
  assert.throws(() => projectToWalkableArea([1, 1], [[0, 0], [1, 1]]), RangeError);
});
