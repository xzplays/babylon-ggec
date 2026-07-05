import { Vector3 } from "@babylonjs/core";
export type RouteLoopMode = "loop" | "pingpong";
export type RoutePoint = { x: number; z: number; stop?: number };
export type TrafficRoute = { id: string; label: string; points: RoutePoint[]; loop: RouteLoopMode; laneWidth?: number; kind: "pedestrian" | "vehicle" };
export const v3 = (p: RoutePoint, y = 0) => new Vector3(p.x, y, p.z);
export const routePoint = (x: number, z: number, stop = 0): RoutePoint => ({ x, z, stop });
