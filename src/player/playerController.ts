import { Camera, Mesh, Scene, Vector3 } from "@babylonjs/core";
import { BuildingSpec } from "../buildings/buildingTypes";
import { createCameraController } from "../camera/cameraController";
import { createBlockAvatar } from "./createBlockAvatar";
import {
  DEFAULT_WALK_SPEED,
  EYE_HEIGHT,
  MAX_WALK_SPEED,
  MIN_WALK_SPEED,
  PLAYER_HEIGHT,
  SHIFT_SPEED_MULTIPLIER,
  playerCenterYForFloor,
} from "./playerConstants";

export const createPlayerController = (
  scene: Scene,
  cameras: ReturnType<typeof createCameraController>,
  player: Mesh,
  buildings: BuildingSpec[],
  onLocation: (s: string) => void,
) => {
  let walk = DEFAULT_WALK_SPEED;
  let lastYaw = 0;
  let currentBuilding: BuildingSpec | undefined;
  let currentFloor = 0;
  const keys = new Set<string>();
  const avatar = createBlockAvatar(scene);
  avatar.root.parent = player;
  avatar.setVisible(false);

  const entrancePoint = (building: BuildingSpec, inside: boolean, floor = 0) =>
    new Vector3(
      building.position.x,
      playerCenterYForFloor(floor, building.floorHeight),
      building.position.z + building.size.depth / 2 + (inside ? -8 : 12),
    );

  const elevatorPoint = (building: BuildingSpec, floor: number) =>
    new Vector3(
      building.position.x + building.size.width / 2 - 8,
      playerCenterYForFloor(floor, building.floorHeight),
      building.position.z - building.size.depth / 2 + 14,
    );

  const place = (position: Vector3, yaw: number, inside = false) => {
    player.position.copyFrom(position);
    cameras.syncTo(position, yaw, inside);
  };

  const goTo = (building: BuildingSpec, inside: boolean) => {
    currentBuilding = inside ? building : undefined;
    currentFloor = 0;
    const position = entrancePoint(building, inside);
    place(position, inside ? Math.PI : 0, inside);
    onLocation(
      inside
        ? `${building.name} · 1层 · ${building.zone} · ${building.description}`
        : `${building.name}门前 · 面向入口`,
    );
    cameras.setViewMode("first");
  };

  const resetToEntrance = () => {
    currentBuilding = undefined;
    currentFloor = 0;
    place(new Vector3(0, PLAYER_HEIGHT / 2, -430), 0, false);
    onLocation("主入口 · 室外园区");
    cameras.setViewMode("first");
  };

  function getActiveCamera(): Camera {
    if (cameras.viewMode === "first") return cameras.first;
    if (cameras.viewMode === "third") return cameras.third;
    return cameras.overhead;
  }

  function getPlanarForwardFromCamera(camera: Camera): Vector3 {
    const forward = camera.getForwardRay().direction.clone();
    forward.y = 0;

    if (forward.lengthSquared() < 0.0001) {
      return Vector3.Forward();
    }

    return forward.normalize();
  }

  function getPlanarMoveBasisForActiveCamera() {
    const forward = getPlanarForwardFromCamera(getActiveCamera());
    const right = Vector3.Cross(Vector3.Up(), forward).normalize();
    return { forward, right };
  }

  function buildMoveDirection(forward: Vector3, right: Vector3): Vector3 {
    const moveDirection = Vector3.Zero();

    if (keys.has("KeyW") || keys.has("ArrowUp")) moveDirection.addInPlace(forward);
    if (keys.has("KeyS") || keys.has("ArrowDown")) moveDirection.subtractInPlace(forward);
    if (keys.has("KeyD") || keys.has("ArrowRight")) moveDirection.addInPlace(right);
    if (keys.has("KeyA") || keys.has("ArrowLeft")) moveDirection.subtractInPlace(right);

    return moveDirection;
  }

  function yawForAvatarFrontDirection(direction: Vector3): number {
    // The block avatar's visible front is modeled on local -Z, so rotate local -Z onto the movement vector.
    return Math.atan2(direction.x, direction.z) + Math.PI;
  }

  function updateAvatarVisibility() {
    avatar.setVisible(cameras.viewMode !== "first");
  }

  function updateFirstPersonCameraFromPlayer() {
    if (cameras.viewMode !== "first") return;
    cameras.first.position.copyFrom(player.position).addInPlaceFromFloats(0, EYE_HEIGHT - PLAYER_HEIGHT / 2, 0);
  }

  window.addEventListener("keydown", (event) => {
    keys.add(event.code);

    if (event.code === "KeyV") {
      cameras.setViewMode(cameras.viewMode === "first" ? "third" : cameras.viewMode === "third" ? "overhead" : "first");
    }

    if (event.code === "KeyE") {
      const building = buildings.find((item) => Vector3.Distance(player.position, entrancePoint(item, false)) < 11);
      if (building) goTo(building, true);
    }

    if (event.code === "KeyF") {
      const building = currentBuilding ?? buildings.find((item) =>
        item.hasElevator &&
        Math.abs(player.position.x - (item.position.x + item.size.width / 2 - 8)) < 8 &&
        Math.abs(player.position.z - (item.position.z - item.size.depth / 2 + 14)) < 8,
      );

      if (building?.hasElevator) {
        currentBuilding = building;
        currentFloor = (currentFloor + 1) % building.floors;
        const position = elevatorPoint(building, currentFloor);
        place(position, Math.PI, true);
        onLocation(`${building.name} · ${currentFloor + 1}层电梯厅 · ${building.zone}`);
      }
    }

    if (event.code === "KeyR") resetToEntrance();
  });

  window.addEventListener("keyup", (event) => keys.delete(event.code));

  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    const speed = walk * (keys.has("ShiftLeft") || keys.has("ShiftRight") ? SHIFT_SPEED_MULTIPLIER : 1);
    const { forward, right } = getPlanarMoveBasisForActiveCamera();
    const moveDirection = buildMoveDirection(forward, right);

    if (moveDirection.lengthSquared() > 0) {
      moveDirection.normalize();
      player.moveWithCollisions(moveDirection.scale(speed * dt));
      lastYaw = yawForAvatarFrontDirection(moveDirection);
    }

    updateFirstPersonCameraFromPlayer();
    avatar.setYaw(lastYaw);
    updateAvatarVisibility();
    cameras.syncTargets();
  });

  return {
    player,
    goTo,
    resetToEntrance,
    getPlanarMoveBasisForActiveCamera,
    setWalkSpeed: (value: number) => {
      walk = Math.min(MAX_WALK_SPEED, Math.max(MIN_WALK_SPEED, value));
    },
    getWalkSpeed: () => walk,
  };
};
