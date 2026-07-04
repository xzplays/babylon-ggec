export type BuildingType = "factory" | "warehouse" | "office" | "research" | "dormitory" | "amenity" | "logistics";
export type CampusZone = "一期厂房区" | "二期生产区" | "仓储物流区" | "总部办公区" | "研发测试区" | "生活配套区";
export type Entrance = { side: "north" | "south" | "east" | "west"; offset: number; width: number; height: number; label: string };
export type BuildingSpec = {
  id: string; name: string; zone: CampusZone; type: BuildingType;
  position: { x: number; z: number }; size: { width: number; depth: number; height: number };
  floors: number; floorHeight: number; entrances: Entrance[];
  hasElevator: boolean; hasStairs: boolean; description: string; features: string[];
};
export const buildingTypeName: Record<BuildingType, string> = {
  factory: "厂房", warehouse: "仓库", office: "办公楼", research: "研发楼", dormitory: "宿舍", amenity: "生活配套", logistics: "物流中心"
};
export const normalizedHeight = (b: BuildingSpec) => b.floors * b.floorHeight;
export const validateBuildingSpec = (b: BuildingSpec) => {
  const expected = normalizedHeight(b);
  if (Math.abs(b.size.height - expected) > 0.001) b.size.height = expected;
  return b;
};
