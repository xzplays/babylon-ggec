import { Vector3 } from "@babylonjs/core";
export type MovingObstacle = { id: string; position: Vector3; radius: number; routeId?: string; speed?: number };
export const aheadFactor = (origin: Vector3, forward: Vector3, target: Vector3, maxDistance: number, width: number) => {
 const to = target.subtract(origin); const along = Vector3.Dot(to, forward); if (along < 0 || along > maxDistance) return 0; const side = to.subtract(forward.scale(along)).length(); return side <= width ? 1 - along / maxDistance : 0;
};
