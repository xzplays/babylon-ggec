import { Camera, Mesh, Scene, Vector3 } from "@babylonjs/core";
import { BuildingSpec } from "../buildings/buildingTypes";
import { createCameraController } from "../camera/cameraController";
import { createBlockAvatar } from "./createBlockAvatar";
import { pickGround } from "./playerPhysics";
import { DEFAULT_WALK_SPEED, EYE_HEIGHT, GRAVITY, JUMP_VELOCITY, MAX_FALL_SPEED, MAX_WALK_SPEED, MIN_WALK_SPEED, PLAYER_HEIGHT, SHIFT_SPEED_MULTIPLIER, playerCenterYForFloor } from "./playerConstants";

type ElevatorState =
  | { kind: "idle" }
  | { kind: "doorOpening" | "doorClosing" | "moving" | "doorOpeningAtTarget"; elapsed: number; building: BuildingSpec; fromFloor: number; toFloor: number; start: Vector3; end: Vector3 };

export const createPlayerController = (scene: Scene, cameras: ReturnType<typeof createCameraController>, player: Mesh, buildings: BuildingSpec[], onLocation: (s: string) => void) => {
  let walk = DEFAULT_WALK_SPEED, lastYaw = 0, currentFloor = 0, verticalVelocity = 0, isGrounded = false, jumpRequested = false;
  let currentBuilding: BuildingSpec | undefined;
  let elevator: ElevatorState = { kind: "idle" };
  const keys = new Set<string>();
  const avatar = createBlockAvatar(scene); avatar.root.parent = player; avatar.setVisible(false);
  const entrancePoint = (b: BuildingSpec, inside: boolean, floor = 0) => new Vector3(b.position.x, playerCenterYForFloor(floor, b.floorHeight), b.position.z + b.size.depth / 2 + (inside ? -8 : 12));
  const elevatorPoint = (b: BuildingSpec, floor: number) => new Vector3(b.position.x + b.size.width / 2 - 10, playerCenterYForFloor(floor, b.floorHeight), b.position.z - b.size.depth / 2 + 15.2);
  const place = (position: Vector3, yaw: number, inside = false) => { player.position.copyFrom(position); verticalVelocity = 0; cameras.syncTo(position, yaw, inside); };
  const goTo = (building: BuildingSpec, inside: boolean) => { if (elevator.kind !== "idle") return; currentBuilding = inside ? building : undefined; currentFloor = 0; place(entrancePoint(building, inside), inside ? Math.PI : 0, inside); onLocation(inside ? `${building.name} · 1层 · ${building.zone} · ${building.description}` : `${building.name}门前 · 面向入口`); cameras.setViewMode("first"); };
  const resetToEntrance = () => { elevator = { kind: "idle" }; currentBuilding = undefined; currentFloor = 0; place(new Vector3(0, PLAYER_HEIGHT / 2, -430), 0, false); onLocation("主入口 · 室外园区"); cameras.setViewMode("first"); };
  function getActiveCamera(): Camera { return cameras.viewMode === "first" ? cameras.first : cameras.viewMode === "third" ? cameras.third : cameras.overhead; }
  function getPlanarForwardFromCamera(camera: Camera): Vector3 { const f = camera.getForwardRay().direction.clone(); f.y = 0; return f.lengthSquared() < .0001 ? Vector3.Forward() : f.normalize(); }
  function getPlanarMoveBasisForActiveCamera() { const forward = getPlanarForwardFromCamera(getActiveCamera()); const right = Vector3.Cross(Vector3.Up(), forward).normalize(); return { forward, right }; }
  function buildMoveDirection(forward: Vector3, right: Vector3): Vector3 { const d = Vector3.Zero(); if (keys.has("KeyW") || keys.has("ArrowUp")) d.addInPlace(forward); if (keys.has("KeyS") || keys.has("ArrowDown")) d.subtractInPlace(forward); if (keys.has("KeyD") || keys.has("ArrowRight")) d.addInPlace(right); if (keys.has("KeyA") || keys.has("ArrowLeft")) d.subtractInPlace(right); return d; }
  const yawForAvatarFrontDirection = (direction: Vector3) => Math.atan2(direction.x, direction.z) + Math.PI;
  const updateFirstPersonCameraFromPlayer = () => { cameras.first.position.copyFrom(player.position).addInPlaceFromFloats(0, EYE_HEIGHT - PLAYER_HEIGHT / 2, 0); };
  const isNearElevator = (b: BuildingSpec) => Math.abs(player.position.x - elevatorPoint(b, currentBuilding === b ? currentFloor : 0).x) < 7 && Math.abs(player.position.z - elevatorPoint(b, 0).z) < 7;
  const startElevator = () => {
    if (elevator.kind !== "idle") return;
    const building = currentBuilding ?? buildings.find((b) => b.hasElevator && isNearElevator(b));
    if (!building?.hasElevator) return;
    currentBuilding = building; const fromFloor = currentFloor; const toFloor = (currentFloor + 1) % building.floors;
    const start = elevatorPoint(building, fromFloor), end = elevatorPoint(building, toFloor);
    elevator = { kind: "doorOpening", elapsed: 0, building, fromFloor, toFloor, start, end }; place(start, Math.PI, true); onLocation(`${building.name} · 电梯开门中 · ${fromFloor + 1}层`);
  };
  const updateElevator = (dt: number) => {
    if (elevator.kind === "idle") return false;
    elevator.elapsed += dt;
    const next = (kind: ElevatorState["kind"]) => { if (elevator.kind !== "idle") elevator = { ...elevator, kind: kind as any, elapsed: 0 }; };
    if (elevator.kind === "doorOpening" && elevator.elapsed > .45) next("doorClosing");
    else if (elevator.kind === "doorClosing" && elevator.elapsed > .45) next("moving");
    else if (elevator.kind === "moving") { const t = Math.min(1, elevator.elapsed / 1.6); const p = Vector3.Lerp(elevator.start, elevator.end, t); player.position.copyFrom(p); if (t >= 1) next("doorOpeningAtTarget"); }
    else if (elevator.kind === "doorOpeningAtTarget" && elevator.elapsed > .55) { currentFloor = elevator.toFloor; onLocation(`${elevator.building.name} · ${currentFloor + 1}层电梯厅 · ${elevator.building.zone}`); elevator = { kind: "idle" }; }
    verticalVelocity = 0; updateFirstPersonCameraFromPlayer(); return true;
  };
  window.addEventListener("keydown", (event) => { keys.add(event.code); if (["Space", "F1", "F2", "F4"].includes(event.code)) event.preventDefault(); if (event.code === "Space") jumpRequested = true; if (event.code === "F1") cameras.setViewMode("first"); if (event.code === "F2") cameras.setViewMode("third"); if (event.code === "F4") cameras.setViewMode("overhead"); if (event.code === "KeyE") { const b = buildings.find((item) => Vector3.Distance(player.position, entrancePoint(item, false)) < 11); if (b) goTo(b, true); } if (event.code === "KeyF") startElevator(); if (event.code === "KeyR") resetToEntrance(); });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(.05, scene.getEngine().getDeltaTime() / 1000); const speed = walk * (keys.has("ShiftLeft") || keys.has("ShiftRight") ? SHIFT_SPEED_MULTIPLIER : 1);
    let moved = false; if (!updateElevator(dt)) { const { forward, right } = getPlanarMoveBasisForActiveCamera(); const moveDirection = buildMoveDirection(forward, right); if (moveDirection.lengthSquared() > 0) { moveDirection.normalize(); player.moveWithCollisions(moveDirection.scale(speed * dt)); lastYaw = yawForAvatarFrontDirection(moveDirection); moved = true; }
      const ground = pickGround(scene, player); isGrounded = !!ground && Math.abs(ground.distance) <= .16 && verticalVelocity <= 0; if (jumpRequested && isGrounded) { verticalVelocity = JUMP_VELOCITY; isGrounded = false; } jumpRequested = false;
      verticalVelocity = Math.max(MAX_FALL_SPEED, verticalVelocity + GRAVITY * dt); player.moveWithCollisions(new Vector3(0, verticalVelocity * dt, 0)); const after = pickGround(scene, player); if (after && player.position.y <= after.y + .12 && verticalVelocity <= 0) { player.position.y = after.y; verticalVelocity = 0; isGrounded = true; }
      updateFirstPersonCameraFromPlayer(); }
    avatar.setYaw(lastYaw); avatar.setVisible(cameras.viewMode !== "first"); avatar.update(dt, { moving: moved, speed, grounded: isGrounded, jumping: verticalVelocity > .2 }); cameras.update(dt);
  });
  return { player, goTo, resetToEntrance, getPlanarMoveBasisForActiveCamera, setWalkSpeed: (value: number) => { walk = Math.min(MAX_WALK_SPEED, Math.max(MIN_WALK_SPEED, value)); }, getWalkSpeed: () => walk };
};
