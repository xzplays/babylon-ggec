export type ModelAssetRole = "person" | "car" | "bus" | "truck" | "forklift" | "van" | "streetLight" | "tree" | "cityModule";
export type ModelAsset = { id: string; role: ModelAssetRole; path: string; licenseRecordId: string; scale?: number; yOffset?: number; rotationY?: number; animationHints?: string[] };
export const modelAssets: ModelAsset[] = [
  { id: "person-default", role: "person", path: "/assets/models/people/person.glb", licenseRecordId: "quaternius-lowpoly-animated-people", scale: 1, animationHints: ["walk", "idle"] },
  { id: "car-default", role: "car", path: "/assets/models/vehicles/car.glb", licenseRecordId: "kenney-car-kit", scale: 1 },
  { id: "bus-default", role: "bus", path: "/assets/models/vehicles/bus.glb", licenseRecordId: "kenney-car-kit", scale: 1 },
  { id: "truck-default", role: "truck", path: "/assets/models/vehicles/truck.glb", licenseRecordId: "kenney-car-kit", scale: 1 },
  { id: "forklift-default", role: "forklift", path: "/assets/models/vehicles/forklift.glb", licenseRecordId: "kenney-car-kit", scale: 1 },
  { id: "van-default", role: "van", path: "/assets/models/vehicles/van.glb", licenseRecordId: "kenney-car-kit", scale: 1 }
];
export const findModelAsset = (role: ModelAssetRole) => modelAssets.find(a => a.role === role);
