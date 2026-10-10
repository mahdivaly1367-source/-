import { STUDIO_SCENE, type SceneDefinition, type SceneId } from "./studio";
import { EXTERIOR_SCENE, ARCHIVE_SCENE, PIER_SCENE, LIGHTHOUSE_SCENE, HOMESTEAD_SCENE } from "./narrative-scenes";

export const SCENES: Record<SceneId, SceneDefinition> = {
  scene_exterior: EXTERIOR_SCENE,
  scene_studio: STUDIO_SCENE,
  scene_archive: ARCHIVE_SCENE,
  scene_pier: PIER_SCENE,
  scene_lighthouse: LIGHTHOUSE_SCENE,
  scene_homestead: HOMESTEAD_SCENE,
};

export function getScene(sceneId: SceneId): SceneDefinition { return SCENES[sceneId]; }

export const REQUIRED_SCENE_IDS: readonly SceneId[] = [
  "scene_exterior", "scene_studio", "scene_archive", "scene_pier", "scene_lighthouse", "scene_homestead",
];

export const SCENE_TRANSITIONS: ReadonlyArray<readonly [SceneId, SceneId]> = [
  ["scene_exterior", "scene_studio"], ["scene_studio", "scene_exterior"],
  ["scene_exterior", "scene_pier"], ["scene_pier", "scene_exterior"],
  ["scene_studio", "scene_archive"], ["scene_archive", "scene_studio"],
  ["scene_pier", "scene_lighthouse"], ["scene_lighthouse", "scene_pier"],
  ["scene_pier", "scene_homestead"], ["scene_homestead", "scene_pier"],
] as const;
