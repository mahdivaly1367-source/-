import type { CSSProperties } from "react";
import type { FacingDirection, SceneDefinition } from "../../data/scenes/studio";
import type { Point } from "../../engine/navigation/perspective";
import { scaleFromDepth } from "../../engine/navigation/perspective";

interface CharacterSpriteProps {
  position: Point;
  facing: FacingDirection;
  moving: boolean;
  perspective: SceneDefinition["perspective"];
}

export function CharacterSprite({
  position,
  facing,
  moving,
  perspective,
}: CharacterSpriteProps) {
  const depthScale = scaleFromDepth(position[1], perspective);
  const isSideView = facing === "left" || facing === "right";
  const backgroundImage = isSideView
    ? "url('/assets/ava-side-sheet.svg')"
    : facing === "back"
      ? "url('/assets/ava-back.svg')"
      : "url('/assets/ava-front.svg')";

  const positionStyle: CSSProperties = {
    left: position[0] + "%",
    top: position[1] + "%",
  };

  const artStyle = {
    backgroundImage,
    backgroundPosition: moving && isSideView ? undefined : "0% 0%",
    "--sf-depth-scale": String(depthScale),
    "--sf-flip": facing === "left" ? "-1" : "1",
  } as CSSProperties;

  const shadowStyle: CSSProperties = {
    left: position[0] + "%",
    top: position[1] + "%",
    transform: "translate(-50%, -45%) scale(" + depthScale + ")",
  };

  return (
    <>
      <div className="sf-contact-shadow" style={shadowStyle} aria-hidden="true" />
      <div
        className="sf-character"
        style={positionStyle}
        data-direction={facing}
        data-moving={moving ? "true" : "false"}
        aria-label="آوا راد"
      >
        <div
          className={[
            "sf-ava-art",
            isSideView ? "sf-ava-art--side" : "sf-ava-art--full",
            moving && isSideView ? "sf-ava-art--walking" : "",
          ].filter(Boolean).join(" ")}
          style={artStyle}
          role="img"
          aria-label="آوا راد، مرمت‌گر نوارهای صوتی"
        />
      </div>
    </>
  );
}
