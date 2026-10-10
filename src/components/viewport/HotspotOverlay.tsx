import type { CSSProperties, FocusEvent, MouseEvent } from "react";
import type { SceneHotspot } from "../../data/scenes/studio";

interface HotspotOverlayProps {
  hotspots: readonly SceneHotspot[];
  hoveredId: string | null;
  debugMode: boolean;
  onActivate: (hotspot: SceneHotspot) => void;
  onHover: (id: string | null) => void;
}

function polygonStyle(points: readonly (readonly [number, number])[]): CSSProperties {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(0.01, maxX - minX);
  const height = Math.max(0.01, maxY - minY);
  const clipPath =
    "polygon(" +
    points.map((point) => {
      const x = ((point[0] - minX) / width) * 100;
      const y = ((point[1] - minY) / height) * 100;
      return x + "% " + y + "%";
    }).join(", ") +
    ")";

  return {
    left: minX + "%",
    top: minY + "%",
    width: width + "%",
    height: height + "%",
    clipPath,
  };
}

function stopPropagation(event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

export function HotspotOverlay({
  hotspots,
  hoveredId,
  debugMode,
  onActivate,
  onHover,
}: HotspotOverlayProps) {
  return (
    <div className="sf-hotspot-layer">
      {hotspots.map((hotspot) => {
        const isHovered = hoveredId === hotspot.id;
        return (
          <div
            key={hotspot.id}
            className="sf-hotspot-wrap"
            style={{
              left: Math.min(...hotspot.polygon.map((p) => p[0])) + "%",
              top: Math.min(...hotspot.polygon.map((p) => p[1])) + "%",
              width: (Math.max(...hotspot.polygon.map((p) => p[0])) - Math.min(...hotspot.polygon.map((p) => p[0]))) + "%",
              height: (Math.max(...hotspot.polygon.map((p) => p[1])) - Math.min(...hotspot.polygon.map((p) => p[1]))) + "%",
            }}
          >
            <button
              type="button"
              className={[
                "sf-hotspot-shape",
                isHovered ? "sf-hotspot-shape--hovered" : "",
                hotspot.kind === "transition" ? "sf-hotspot-shape--transition" : "",
                debugMode ? "sf-hotspot-shape--debug" : "",
              ].filter(Boolean).join(" ")}
              style={{
                ...polygonStyle(hotspot.polygon),
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
              }}
              aria-label={hotspot.label}
              title={hotspot.label}
              onMouseEnter={() => onHover(hotspot.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={(event) => {
                stopPropagation(event);
                onHover(hotspot.id);
              }}
              onBlur={(event) => {
                stopPropagation(event);
                onHover(null);
              }}
              onClick={(event) => {
                event.stopPropagation();
                onActivate(hotspot);
              }}
            />
            <span className="sf-hotspot-label" aria-hidden="true" data-visible={isHovered ? "true" : "false"}>
              <span className="sf-hotspot-label__dot" />
              {hotspot.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
