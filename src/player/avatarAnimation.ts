import { Mesh, TransformNode } from "@babylonjs/core";

export type AvatarMotionState = { moving: boolean; speed: number; grounded: boolean; jumping: boolean };
export type AvatarParts = { body: Mesh; leftArm: Mesh; rightArm: Mesh; leftLeg: Mesh; rightLeg: Mesh };

export function createAvatarAnimator(root: TransformNode, parts: AvatarParts) {
  let walkPhase = 0;
  const smooth = (current: number, target: number, dt: number) => current + (target - current) * Math.min(1, dt * 10);
  return (dt: number, state: AvatarMotionState) => {
    const rate = Math.max(2.5, state.speed * 2.2);
    if (state.moving) walkPhase += dt * rate;
    const swing = state.moving ? Math.sin(walkPhase) * 0.45 : 0;
    const jumpLift = state.jumping || !state.grounded ? 0.08 : 0;
    parts.leftArm.rotation.x = smooth(parts.leftArm.rotation.x, swing, dt);
    parts.rightArm.rotation.x = smooth(parts.rightArm.rotation.x, -swing, dt);
    parts.leftLeg.rotation.x = smooth(parts.leftLeg.rotation.x, -swing + jumpLift, dt);
    parts.rightLeg.rotation.x = smooth(parts.rightLeg.rotation.x, swing + jumpLift, dt);
    parts.body.position.y = smooth(parts.body.position.y, 0.88 + jumpLift, dt);
    root.position.y = smooth(root.position.y, root.position.y, dt);
  };
}
