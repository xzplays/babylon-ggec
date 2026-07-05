import { Mesh, Ray, Scene, Vector3 } from "@babylonjs/core";
import { GROUND_SNAP_DISTANCE, PLAYER_HEIGHT } from "./playerConstants";

export function pickGround(scene: Scene, player: Mesh) {
  const origin = player.position.add(new Vector3(0, PLAYER_HEIGHT / 2, 0));
  const ray = new Ray(origin, Vector3.Down(), PLAYER_HEIGHT + 1.2);
  const hit = scene.pickWithRay(ray, (mesh) => mesh.isEnabled() && mesh.metadata?.walkable === true);
  if (!hit?.hit || !hit.pickedPoint) return undefined;
  return { y: hit.pickedPoint.y + PLAYER_HEIGHT / 2, distance: player.position.y - (hit.pickedPoint.y + PLAYER_HEIGHT / 2) };
}

export function isNearGround(scene: Scene, player: Mesh) {
  const ground = pickGround(scene, player);
  return !!ground && Math.abs(ground.distance) <= GROUND_SNAP_DISTANCE;
}
