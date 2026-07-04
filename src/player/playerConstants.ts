export const DEFAULT_WALK_SPEED = 1.25;
export const MIN_WALK_SPEED = 1;
export const MAX_WALK_SPEED = 20;
export const SHIFT_SPEED_MULTIPLIER = 1.0;
export const EYE_HEIGHT = 1.62;
export const PLAYER_HEIGHT = 1.72;
export const PLAYER_RADIUS = 0.32;
export const PLAYER_COLLISION_HEIGHT = 1.72;
export const FLOOR_THICKNESS = 0.16;
export const MIN_INTERIOR_CLEAR_HEIGHT = 3.2;
export const OFFICE_FLOOR_HEIGHT = 4.5;
export const DORM_FLOOR_HEIGHT = 4.2;
export const AMENITY_FLOOR_HEIGHT = 4.2;
export const FACTORY_FLOOR_HEIGHT = 9.0;
export const WAREHOUSE_FLOOR_HEIGHT = 9.0;

export const playerCenterYForFloor = (floorIndex: number, floorHeight: number) => floorIndex * floorHeight + PLAYER_HEIGHT / 2;
export const eyeYForFloor = (floorIndex: number, floorHeight: number) => floorIndex * floorHeight + EYE_HEIGHT;
