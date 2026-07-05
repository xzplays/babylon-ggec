import { ArcRotateCamera, Ray, Scene, Vector3 } from "@babylonjs/core";

export function createThirdPersonOcclusion(scene: Scene, third: ArcRotateCamera) {
  let desiredRadius = third.radius;
  const margin = 0.55;
  const rememberDesired = () => { desiredRadius = Math.max(third.lowerRadiusLimit ?? 3, Math.min(third.upperRadiusLimit ?? 24, third.radius)); };
  const update = (enabled: boolean, dt: number) => {
    if (!enabled) return;
    const target = third.target.clone();
    const toCamera = third.position.subtract(target);
    const distance = toCamera.length();
    if (distance < 0.01) return;
    const ray = new Ray(target, toCamera.normalize(), distance);
    const hit = scene.pickWithRay(ray, (mesh) => mesh.isEnabled() && mesh.isPickable && mesh.metadata?.blocksThirdPersonCamera === true);
    const minRadius = third.lowerRadiusLimit ?? 3;
    const goal = hit?.hit && hit.distance !== undefined ? Math.max(minRadius, hit.distance - margin) : desiredRadius;
    third.radius += (goal - third.radius) * Math.min(1, dt * (goal < third.radius ? 12 : 4));
  };
  return { update, rememberDesired, setDesiredRadius: (radius: number) => { desiredRadius = radius; } };
}
