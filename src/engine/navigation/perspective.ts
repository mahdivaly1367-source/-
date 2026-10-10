export type Point = readonly [x: number, y: number];

export interface PerspectiveRange {
  minY: number;
  maxY: number;
  minScale: number;
  maxScale: number;
}

export const DEFAULT_PERSPECTIVE: PerspectiveRange = {
  minY: 35,
  maxY: 90,
  minScale: 0.75,
  maxScale: 1.05,
};

/** Maps the character's foot Y coordinate to a continuous depth scale. */
export function scaleFromDepth(
  y: number,
  range: PerspectiveRange = DEFAULT_PERSPECTIVE,
): number {
  if (!Number.isFinite(y)) return range.minScale;
  if (range.maxY <= range.minY) {
    throw new RangeError("maxY must be greater than minY");
  }

  const t = Math.max(0, Math.min(1, (y - range.minY) / (range.maxY - range.minY)));
  return range.minScale + t * (range.maxScale - range.minScale);
}

function squaredDistance(a: Point, b: Point): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function pointOnSegment(point: Point, a: Point, b: Point, epsilon = 1e-7): boolean {
  const cross =
    (point[1] - a[1]) * (b[0] - a[0]) -
    (point[0] - a[0]) * (b[1] - a[1]);

  if (Math.abs(cross) > epsilon) return false;

  const dot =
    (point[0] - a[0]) * (b[0] - a[0]) +
    (point[1] - a[1]) * (b[1] - a[1]);
  if (dot < -epsilon) return false;

  const lengthSquared = squaredDistance(a, b);
  return dot <= lengthSquared + epsilon;
}

/** Ray-casting point-in-polygon check; polygon edges count as walkable. */
export function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j];
    const b = polygon[i];

    if (pointOnSegment(point, a, b)) return true;

    const crosses =
      (b[1] > point[1]) !== (a[1] > point[1]) &&
      point[0] < ((a[0] - b[0]) * (point[1] - b[1])) / (a[1] - b[1]) + b[0];

    if (crosses) inside = !inside;
  }
  return inside;
}

function closestPointOnSegment(point: Point, a: Point, b: Point): Point {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) return a;

  const t = Math.max(
    0,
    Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared),
  );

  return [a[0] + t * dx, a[1] + t * dy];
}

/**
 * Keeps a target inside the walkable polygon. Outside clicks are projected to
 * the closest point on its boundary instead of making navigation fail.
 */
export function projectToWalkableArea(
  point: Point,
  polygon: readonly Point[],
): Point {
  if (polygon.length < 3) throw new RangeError("A walkable polygon needs at least 3 points");
  if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
    throw new TypeError("Target coordinates must be finite numbers");
  }

  const normalized: Point = [
    Math.max(0, Math.min(100, point[0])),
    Math.max(0, Math.min(100, point[1])),
  ];
  if (pointInPolygon(normalized, polygon)) return normalized;

  let bestPoint: Point = polygon[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const candidate = closestPointOnSegment(normalized, a, b);
    const distance = squaredDistance(normalized, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPoint = candidate;
    }
  }

  return bestPoint;
}

export function distanceBetween(a: Point, b: Point): number {
  return Math.sqrt(squaredDistance(a, b));
}
