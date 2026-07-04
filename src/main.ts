import {
  ArcRotateCamera,
  Color3,
  Color4,
  DynamicTexture,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  UniversalCamera,
  Vector3
} from "@babylonjs/core";
import "./style.css";

type ViewMode = "first" | "third" | "overhead";
type BuildingType = "factory" | "warehouse" | "office" | "dormitory" | "amenity" | "logistics";
type BuildingSpec = {
  name: string;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  material: StandardMaterial;
  lobby: string;
  type: BuildingType;
  floors: number;
  hasElevator?: boolean;
  hasStairs?: boolean;
};

const canvas = document.querySelector<HTMLCanvasElement>("#renderCanvas");
if (!canvas) {
  throw new Error("Canvas #renderCanvas was not found.");
}

const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.clearColor = new Color4(0.62, 0.82, 1, 1);
scene.collisionsEnabled = true;
scene.gravity = new Vector3(0, -0.35, 0);

const modeLabel = document.querySelector<HTMLParagraphElement>("#modeLabel");
const buildingList = document.querySelector<HTMLDivElement>("#buildingList");
const locationLabel = document.querySelector<HTMLParagraphElement>("#locationLabel");
const speedLabel = document.querySelector<HTMLSpanElement>("#speedLabel");
const speedSlider = document.querySelector<HTMLInputElement>("#speedSlider");
const buildingPanel = document.querySelector<HTMLElement>("#buildingPanel");
const panelToggle = document.querySelector<HTMLButtonElement>("#panelToggle");
let viewMode: ViewMode = "first";
let currentLocation = "室外园区";
let walkSpeed = 0.22;

// 1 Babylon unit = 1 real-world meter. The map therefore uses real campus-like dimensions.
const campusWidth = 1200;
const campusHeight = 900;
const wallThickness = 0.35;
const doorWidth = 6.0;

const createMaterial = (name: string, color: Color3, textureUrl?: string) => {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  if (textureUrl) {
    const texture = new Texture(textureUrl, scene);
    texture.uScale = 8;
    texture.vScale = 8;
    material.diffuseTexture = texture;
  }
  return material;
};

const grass = createMaterial("grass", new Color3(0.24, 0.58, 0.26));
const road = createMaterial("road", new Color3(0.16, 0.18, 0.2));
const glass = createMaterial("glass", new Color3(0.36, 0.64, 0.82));
glass.alpha = 0.72;
const brick = createMaterial("brick", new Color3(0.72, 0.38, 0.27));
const concrete = createMaterial("concrete", new Color3(0.58, 0.6, 0.62));
const roof = createMaterial("roof", new Color3(0.08, 0.12, 0.2));
const path = createMaterial("path", new Color3(0.72, 0.66, 0.55));
const water = createMaterial("water", new Color3(0.14, 0.49, 0.78));
water.alpha = 0.78;
const floorMat = createMaterial("interior floor", new Color3(0.78, 0.75, 0.68));
const innerWall = createMaterial("interior wall", new Color3(0.9, 0.9, 0.84));
const furniture = createMaterial("furniture", new Color3(0.42, 0.28, 0.16));
const markerMat = createMaterial("entry marker", new Color3(0.05, 0.82, 0.55));
markerMat.emissiveColor = new Color3(0.02, 0.45, 0.26);
const steel = createMaterial("steel workshop", new Color3(0.68, 0.72, 0.78));
const dormMat = createMaterial("dormitory facade", new Color3(0.86, 0.74, 0.58));
const equipmentMat = createMaterial("production equipment", new Color3(0.12, 0.2, 0.28));
const elevatorMat = createMaterial("elevator doors", new Color3(0.72, 0.76, 0.78));
const stairMat = createMaterial("stair core", new Color3(0.48, 0.5, 0.52));

new HemisphericLight("skyLight", new Vector3(0.4, 1, 0.2), scene).intensity = 0.82;

const ground = MeshBuilder.CreateGround("central lawn", { width: campusWidth, height: campusHeight }, scene);
ground.material = grass;
ground.checkCollisions = true;

const makeBox = (name: string, position: Vector3, scaling: Vector3, material: StandardMaterial, collides = true) => {
  const mesh = MeshBuilder.CreateBox(name, { size: 1 }, scene);
  mesh.position = position;
  mesh.scaling = scaling;
  mesh.material = material;
  mesh.checkCollisions = collides;
  return mesh;
};

const createBuildingLabel = (text: string, position: Vector3) => {
  const texture = new DynamicTexture(`${text} label texture`, { width: 512, height: 160 }, scene, false);
  texture.hasAlpha = true;
  const context = texture.getContext();
  context.clearRect(0, 0, 512, 160);
  texture.drawText(text, null, 96, "bold 58px Microsoft YaHei, Arial", "#ffffff", "rgba(15, 23, 42, 0.76)", true, true);

  const material = new StandardMaterial(`${text} label material`, scene);
  material.diffuseTexture = texture;
  material.opacityTexture = texture;
  material.emissiveColor = Color3.White();
  material.disableLighting = true;

  const label = MeshBuilder.CreatePlane(`${text} label`, { width: 9.6, height: 3 }, scene);
  label.position = position;
  label.material = material;
  label.billboardMode = 7;
  label.isPickable = false;
  return label;
};

makeBox("north ring road", new Vector3(0, 0.03, -390), new Vector3(1080, 0.04, 12), road);
makeBox("south ring road", new Vector3(0, 0.03, 390), new Vector3(1080, 0.04, 12), road);
makeBox("west ring road", new Vector3(-540, 0.03, 0), new Vector3(12, 0.04, 780), road);
makeBox("east ring road", new Vector3(540, 0.03, 0), new Vector3(12, 0.04, 780), road);
makeBox("central spine road", new Vector3(0, 0.04, 0), new Vector3(1040, 0.04, 10), road);
makeBox("north-south trunk road", new Vector3(0, 0.04, 0), new Vector3(10, 0.04, 760), road);
makeBox("phase one workshop road", new Vector3(-250, 0.05, -130), new Vector3(260, 0.03, 4.4), path);
makeBox("phase one service road", new Vector3(-250, 0.05, 140), new Vector3(260, 0.03, 4.4), path);
makeBox("phase two production road", new Vector3(230, 0.05, -120), new Vector3(300, 0.03, 4.4), path);
makeBox("logistics connector", new Vector3(265, 0.05, 170), new Vector3(280, 0.03, 4.4), path);
makeBox("living area path", new Vector3(-90, 0.05, 255), new Vector3(260, 0.03, 4), path);

const addFurniture = (name: string, x: number, z: number, width: number, depth: number, type: BuildingType) => {
  makeBox(`${name} reception`, new Vector3(x, 0.55, z - depth * 0.22), new Vector3(width * 0.28, 1.1, 1.2), furniture);

  if (type === "factory") {
    for (let i = -2; i <= 2; i += 1) {
      makeBox(`${name} assembly line ${i + 3}`, new Vector3(x + i * (width / 6), 0.7, z + depth * 0.08), new Vector3(width * 0.08, 1.4, depth * 0.52), equipmentMat);
    }
    makeBox(`${name} crane beam`, new Vector3(x, 5.2, z), new Vector3(width * 0.78, 0.5, 0.8), equipmentMat);
    return;
  }

  if (type === "warehouse" || type === "logistics") {
    for (let i = -2; i <= 2; i += 1) {
      makeBox(`${name} storage rack ${i + 3}`, new Vector3(x + i * (width / 6), 1.4, z + depth * 0.05), new Vector3(width * 0.06, 2.8, depth * 0.56), equipmentMat);
    }
    makeBox(`${name} loading platform`, new Vector3(x, 0.6, z + depth / 2 + 6), new Vector3(width * 0.78, 1.2, 5), concrete);
    return;
  }

  if (type === "dormitory") {
    for (let i = -2; i <= 2; i += 1) {
      makeBox(`${name} room divider ${i + 3}`, new Vector3(x + i * (width / 6), 1.7, z + depth * 0.08), new Vector3(wallThickness, 3.4, depth * 0.58), innerWall);
    }
    makeBox(`${name} common lounge`, new Vector3(x, 0.45, z - depth * 0.18), new Vector3(width * 0.36, 0.9, 2), furniture);
    return;
  }

  makeBox(`${name} table left`, new Vector3(x - width * 0.22, 0.38, z + depth * 0.1), new Vector3(3.2, 0.75, 1.5), furniture);
  makeBox(`${name} table right`, new Vector3(x + width * 0.22, 0.38, z + depth * 0.1), new Vector3(3.2, 0.75, 1.5), furniture);
  makeBox(`${name} back room divider`, new Vector3(x, 1.6, z + depth * 0.22), new Vector3(width * 0.55, 3.2, wallThickness), innerWall);
};

const usableFloorHeight = (spec: BuildingSpec) => Math.max(spec.height / spec.floors, spec.type === "factory" || spec.type === "warehouse" || spec.type === "logistics" ? 7 : 4.5);

const createVerticalAccess = (spec: BuildingSpec, floorHeight: number) => {
  const { name, x, z, width, depth, floors, hasElevator, hasStairs } = spec;
  const coreX = x - width / 2 + 7;
  const coreZ = z - depth / 2 + 8;

  if (hasStairs) {
    makeBox(`${name} stairwell landing wall`, new Vector3(coreX - 2.4, (floors * floorHeight) / 2, coreZ), new Vector3(0.28, floors * floorHeight, 5), stairMat);
    makeBox(`${name} stairwell guard rail`, new Vector3(coreX + 2.4, (floors * floorHeight) / 2, coreZ), new Vector3(0.28, floors * floorHeight, 5), stairMat, false);
    for (let floor = 0; floor < floors; floor += 1) {
      for (let step = 0; step < 6; step += 1) {
        makeBox(
          `${name} stair ${floor + 1}-${step + 1}`,
          new Vector3(coreX + (step - 2.5) * 0.75, floor * floorHeight + 0.22 + step * (floorHeight / 7), coreZ + 1.9),
          new Vector3(0.75, 0.18, 1.1),
          concrete
        );
      }
    }
  }

  if (hasElevator) {
    const elevatorX = x + width / 2 - 7;
    const elevatorZ = z - depth / 2 + 8;
    makeBox(`${name} elevator shaft`, new Vector3(elevatorX, (floors * floorHeight) / 2, elevatorZ), new Vector3(4, floors * floorHeight, 4), innerWall);
    for (let floor = 0; floor < floors; floor += 1) {
      makeBox(`${name} elevator door ${floor + 1}`, new Vector3(elevatorX, floor * floorHeight + 1.4, elevatorZ + 2.05), new Vector3(2.1, 2.8, 0.12), elevatorMat, false);
    }
  }
};

const createEnterableBuilding = (spec: BuildingSpec) => {
  const { name, x, z, width, depth, material, lobby, floors, type } = spec;
  const floorHeight = usableFloorHeight(spec);
  const scaledHeight = floorHeight * floors;
  makeBox(`${name} floor`, new Vector3(x, 0.08, z), new Vector3(width, 0.16, depth), floorMat, false);
  for (let floor = 1; floor < floors; floor += 1) {
    makeBox(`${name} level ${floor + 1} slab`, new Vector3(x, floor * floorHeight, z), new Vector3(width - 1.2, 0.16, depth - 1.2), floorMat);
  }
  makeBox(`${name} roof`, new Vector3(x, scaledHeight + 0.3, z), new Vector3(width + 1.4, 0.6, depth + 1.4), roof);
  makeBox(`${name} north wall`, new Vector3(x, scaledHeight / 2, z - depth / 2), new Vector3(width, scaledHeight, wallThickness), material);
  makeBox(`${name} west wall`, new Vector3(x - width / 2, scaledHeight / 2, z), new Vector3(wallThickness, scaledHeight, depth), material);
  makeBox(`${name} east wall`, new Vector3(x + width / 2, scaledHeight / 2, z), new Vector3(wallThickness, scaledHeight, depth), material);
  makeBox(`${name} south wall left`, new Vector3(x - (width + doorWidth) / 4, scaledHeight / 2, z + depth / 2), new Vector3((width - doorWidth) / 2, scaledHeight, wallThickness), material);
  makeBox(`${name} south wall right`, new Vector3(x + (width + doorWidth) / 4, scaledHeight / 2, z + depth / 2), new Vector3((width - doorWidth) / 2, scaledHeight, wallThickness), material);
  makeBox(`${name} lintel`, new Vector3(x, scaledHeight - 0.7, z + depth / 2), new Vector3(doorWidth, 1.4, wallThickness), material);
  makeBox(`${name} entry marker`, new Vector3(x, 0.06, z + depth / 2 + 3), new Vector3(doorWidth, 0.08, 2.6), markerMat, false);
  addFurniture(name, x, z, width, depth, type);
  createVerticalAccess(spec, floorHeight);
  createBuildingLabel(name, new Vector3(x, scaledHeight + 4, z));
  createBuildingLabel(`${lobby} · ${floors}层`, new Vector3(x, 3.4, z + depth * 0.18));
};

const buildings: BuildingSpec[] = [
  { name: "一期轻钢厂房A1", x: -345, z: -220, width: 72, height: 14, depth: 52, material: steel, lobby: "总装线入口", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A2", x: -255, z: -220, width: 72, height: 14, depth: 52, material: steel, lobby: "扬声器装配", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A3", x: -165, z: -220, width: 72, height: 14, depth: 52, material: steel, lobby: "电子组装", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A4", x: -345, z: -120, width: 72, height: 14, depth: 52, material: steel, lobby: "包装线入口", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A5", x: -255, z: -120, width: 72, height: 14, depth: 52, material: steel, lobby: "注塑配套", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A6", x: -165, z: -120, width: 72, height: 14, depth: 52, material: steel, lobby: "物料暂存", type: "warehouse", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A7", x: -345, z: 40, width: 72, height: 14, depth: 52, material: steel, lobby: "零件加工", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A8", x: -255, z: 40, width: 72, height: 14, depth: 52, material: steel, lobby: "声学测试", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A9", x: -165, z: 40, width: 72, height: 14, depth: 52, material: steel, lobby: "仓储周转", type: "warehouse", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A10", x: -345, z: 140, width: 72, height: 14, depth: 52, material: steel, lobby: "来料检验", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A11", x: -255, z: 140, width: 72, height: 14, depth: 52, material: steel, lobby: "返修中心", type: "factory", floors: 2, hasStairs: true },
  { name: "一期轻钢厂房A12", x: -165, z: 140, width: 72, height: 14, depth: 52, material: steel, lobby: "备件仓", type: "warehouse", floors: 2, hasStairs: true },
  { name: "二期核心生产厂房", x: 210, z: -185, width: 126, height: 28, depth: 90, material: concrete, lobby: "核心设备中庭", type: "factory", floors: 5, hasElevator: true, hasStairs: true },
  { name: "二期自动化厂房", x: 360, z: -185, width: 92, height: 24, depth: 86, material: concrete, lobby: "自动化产线", type: "factory", floors: 4, hasElevator: true, hasStairs: true },
  { name: "成品仓储中心", x: 260, z: 60, width: 118, height: 18, depth: 82, material: steel, lobby: "高位货架区", type: "warehouse", floors: 3, hasElevator: true, hasStairs: true },
  { name: "物流装卸中心", x: 360, z: 175, width: 96, height: 16, depth: 70, material: steel, lobby: "月台调度", type: "logistics", floors: 2, hasStairs: true },
  { name: "总部行政办公楼", x: 20, z: -250, width: 86, height: 32, depth: 58, material: glass, lobby: "总部接待大厅", type: "office", floors: 7, hasElevator: true, hasStairs: true },
  { name: "研发测试中心", x: 95, z: 70, width: 82, height: 26, depth: 64, material: glass, lobby: "声学实验室", type: "office", floors: 6, hasElevator: true, hasStairs: true },
  { name: "员工宿舍楼1", x: -115, z: 270, width: 74, height: 30, depth: 48, material: dormMat, lobby: "宿舍门厅", type: "dormitory", floors: 8, hasElevator: true, hasStairs: true },
  { name: "员工宿舍楼2", x: -20, z: 270, width: 74, height: 30, depth: 48, material: dormMat, lobby: "生活区门厅", type: "dormitory", floors: 8, hasElevator: true, hasStairs: true },
  { name: "食堂及生活配套楼", x: 95, z: 270, width: 88, height: 18, depth: 56, material: brick, lobby: "员工食堂", type: "amenity", floors: 4, hasElevator: true, hasStairs: true }
];

buildings.forEach(createEnterableBuilding);

const plaza = MeshBuilder.CreateCylinder("central plaza", { diameter: 40, height: 0.12, tessellation: 64 }, scene);
plaza.position.y = 0.08;
plaza.material = path;
plaza.checkCollisions = true;

const lake = MeshBuilder.CreateCylinder("景观湖", { diameter: 1, height: 0.08, tessellation: 64 }, scene);
lake.position = new Vector3(125, 0.1, 310);
lake.scaling = new Vector3(85, 1, 24);
lake.material = water;
createBuildingLabel("景观湖", new Vector3(125, 7, 310));

for (let i = 0; i < 180; i += 1) {
  const angle = (i / 180) * Math.PI * 2;
  const radiusX = i % 2 === 0 ? 470 : 410;
  const radiusZ = i % 3 === 0 ? 380 : 330;
  const trunk = MeshBuilder.CreateCylinder(`tree trunk ${i}`, { diameter: 0.6, height: 2.8 }, scene);
  trunk.position = new Vector3(Math.cos(angle) * radiusX, 1.4, Math.sin(angle) * radiusZ);
  trunk.material = createMaterial(`trunk mat ${i}`, new Color3(0.38, 0.22, 0.12));
  trunk.checkCollisions = true;

  const crown = MeshBuilder.CreateSphere(`tree crown ${i}`, { diameter: 4.6, segments: 12 }, scene);
  crown.position = trunk.position.add(new Vector3(0, 3, 0));
  crown.material = createMaterial(`crown mat ${i}`, new Color3(0.08, 0.43, 0.16));
}

const player = MeshBuilder.CreateCapsule("visitor avatar", { height: 2.2, radius: 0.45 }, scene);
player.position = new Vector3(0, 1.1, -355);
player.material = createMaterial("visitor blue", new Color3(0.1, 0.34, 0.9));
player.checkCollisions = true;
player.ellipsoid = new Vector3(0.55, 1.1, 0.55);

const firstCamera = new UniversalCamera("first person camera", new Vector3(0, 2.0, -355), scene);
firstCamera.attachControl(canvas, true);
firstCamera.speed = 0;
firstCamera.angularSensibility = 3200;
firstCamera.applyGravity = true;
firstCamera.checkCollisions = true;
firstCamera.ellipsoid = new Vector3(0.55, 1, 0.55);
firstCamera.keysUp = [];
firstCamera.keysDown = [];
firstCamera.keysLeft = [];
firstCamera.keysRight = [];

const thirdCamera = new ArcRotateCamera("third person camera", Math.PI / 2, Math.PI / 3, 18, player.position, scene);
thirdCamera.attachControl(canvas, true);
thirdCamera.lowerRadiusLimit = 7;
thirdCamera.upperRadiusLimit = 32;
thirdCamera.wheelDeltaPercentage = 0.02;
thirdCamera.checkCollisions = true;
thirdCamera.collisionRadius = new Vector3(0.9, 0.9, 0.9);
thirdCamera.lowerBetaLimit = 0.72;
thirdCamera.upperBetaLimit = 1.28;

const overheadCamera = new ArcRotateCamera("overhead camera", Math.PI / 2, 0.08, 900, Vector3.Zero(), scene);
overheadCamera.attachControl(canvas, true);
overheadCamera.lowerRadiusLimit = 220;
overheadCamera.upperRadiusLimit = 1350;
overheadCamera.wheelDeltaPercentage = 0.03;
overheadCamera.panningSensibility = 80;

scene.activeCamera = firstCamera;

const syncCamerasTo = (position: Vector3, yaw = 0) => {
  player.position.copyFrom(position);
  firstCamera.position.copyFrom(position).addInPlaceFromFloats(0, 0.9, 0);
  firstCamera.rotation = new Vector3(0, yaw, 0);
  tuneThirdCameraForLocation();
  thirdCamera.target = player.position.add(new Vector3(0, 1.1, 0));
  overheadCamera.target = player.position;
};

const goToBuilding = (building: BuildingSpec, inside: boolean) => {
  const zOffset = inside ? building.depth / 2 - 6 : building.depth / 2 + 10;
  syncCamerasTo(new Vector3(building.x, 1.1, building.z + zOffset), inside ? Math.PI : 0);
  currentLocation = inside ? `${building.name} · ${building.lobby}` : `${building.name}门前`;
  if (locationLabel) locationLabel.textContent = `位置：${currentLocation}`;
  setViewMode("first");
};

const modeText = (mode: ViewMode) => (mode === "first" ? "第一视角" : mode === "third" ? "第三视角" : "俯瞰视角");

const buildingAt = (position: Vector3) =>
  buildings.find(
    (building) =>
      Math.abs(position.x - building.x) <= building.width / 2 - wallThickness &&
      Math.abs(position.z - building.z) <= building.depth / 2 - wallThickness &&
      position.y >= 0 &&
      position.y <= usableFloorHeight(building) * building.floors + 0.8
  );

const tuneThirdCameraForLocation = () => {
  const building = buildingAt(player.position);
  if (!building) {
    thirdCamera.lowerRadiusLimit = 7;
    thirdCamera.upperRadiusLimit = 32;
    thirdCamera.upperBetaLimit = 1.28;
    return;
  }

  const floorHeight = usableFloorHeight(building);
  const currentFloorBase = Math.max(0, Math.floor((player.position.y - 0.2) / floorHeight) * floorHeight);
  const headClearance = Math.max(2.2, currentFloorBase + floorHeight - (player.position.y + 1.1));
  thirdCamera.lowerRadiusLimit = 3.2;
  thirdCamera.upperRadiusLimit = Math.min(9, Math.max(4.4, headClearance * 2.2));
  thirdCamera.upperBetaLimit = Math.min(1.2, Math.max(0.82, Math.acos(Math.min(0.82, headClearance / thirdCamera.radius))));
  if (thirdCamera.radius > thirdCamera.upperRadiusLimit) thirdCamera.radius = thirdCamera.upperRadiusLimit;
  if (thirdCamera.beta > thirdCamera.upperBetaLimit) thirdCamera.beta = thirdCamera.upperBetaLimit;
};

const setViewMode = (mode: ViewMode) => {
  if (viewMode === "first") {
    player.position.copyFrom(firstCamera.position).addInPlaceFromFloats(0, -1, 0);
  } else if (mode === "first") {
    firstCamera.position.copyFrom(player.position).addInPlaceFromFloats(0, 1, 0);
  }

  viewMode = mode;
  if (mode === "third") tuneThirdCameraForLocation();
  scene.activeCamera = mode === "first" ? firstCamera : mode === "third" ? thirdCamera : overheadCamera;
  modeLabel!.textContent = `当前：${modeText(mode)}`;
};

panelToggle?.addEventListener("click", () => {
  const collapsed = buildingPanel?.classList.toggle("collapsed") ?? false;
  panelToggle.textContent = collapsed ? "展开" : "收起";
  panelToggle.setAttribute("aria-expanded", String(!collapsed));
});

speedSlider?.addEventListener("input", () => {
  walkSpeed = Number(speedSlider.value);
  if (speedLabel) speedLabel.textContent = `${walkSpeed.toFixed(2)} m/帧`;
});

buildingList?.replaceChildren(
  ...buildings.flatMap((building) => {
    const frontButton = document.createElement("button");
    frontButton.type = "button";
    frontButton.textContent = `${building.name}门前`;
    frontButton.addEventListener("click", () => goToBuilding(building, false));
    const insideButton = document.createElement("button");
    insideButton.type = "button";
    insideButton.textContent = `进入${building.name}`;
    insideButton.addEventListener("click", () => goToBuilding(building, true));
    return [frontButton, insideButton];
  })
);

const keys = new Set<string>();
window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "KeyV") {
    setViewMode(viewMode === "first" ? "third" : viewMode === "third" ? "overhead" : "first");
  }
  if (event.code === "KeyE") {
    const nearest = buildings.find((building) => {
      const door = new Vector3(building.x, 1.1, building.z + building.depth / 2 + 3);
      return Vector3.Distance(player.position, door) < 7;
    });
    if (nearest) goToBuilding(nearest, true);
  }
  if (event.code === "KeyF") {
    const elevator = buildings.find((building) => building.hasElevator && Vector3.Distance(player.position, new Vector3(building.x + building.width / 2 - 7, player.position.y, building.z - building.depth / 2 + 10)) < 8);
    if (elevator) {
      const floorHeight = usableFloorHeight(elevator);
      const currentFloor = Math.max(0, Math.round((player.position.y - 1.1) / floorHeight));
      const nextFloor = (currentFloor + 1) % elevator.floors;
      syncCamerasTo(new Vector3(elevator.x + elevator.width / 2 - 7, nextFloor * floorHeight + 1.1, elevator.z - elevator.depth / 2 + 12), Math.PI);
      currentLocation = `${elevator.name} · ${nextFloor + 1}层电梯厅`;
      if (locationLabel) locationLabel.textContent = `位置：${currentLocation}`;
    }
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.code));

scene.onBeforeRenderObservable.add(() => {
  if (viewMode === "first") {
    const forward = firstCamera.getForwardRay().direction.scale(-1);
    forward.y = 0;
    forward.normalize();
    const right = Vector3.Cross(forward, Vector3.Up()).normalize();
    const direction = Vector3.Zero();
    if (keys.has("KeyW") || keys.has("ArrowUp")) direction.addInPlace(forward);
    if (keys.has("KeyS") || keys.has("ArrowDown")) direction.subtractInPlace(forward);
    if (keys.has("KeyD") || keys.has("ArrowRight")) direction.addInPlace(right);
    if (keys.has("KeyA") || keys.has("ArrowLeft")) direction.subtractInPlace(right);
    if (direction.lengthSquared() > 0) {
      direction.normalize().scaleInPlace(keys.has("ShiftLeft") || keys.has("ShiftRight") ? walkSpeed * 1.8 : walkSpeed);
      firstCamera.cameraDirection.addInPlace(direction);
    }
    player.position.copyFrom(firstCamera.position).addInPlaceFromFloats(0, -1, 0);
    player.isVisible = false;
    return;
  }

  player.isVisible = true;
  const activeArcCamera = viewMode === "third" ? thirdCamera : overheadCamera;
  const forward = activeArcCamera.getForwardRay().direction;
  forward.y = 0;
  if (forward.lengthSquared() < 0.0001) {
    forward.copyFromFloats(Math.sin(activeArcCamera.alpha), 0, Math.cos(activeArcCamera.alpha));
  }
  forward.normalize();
  const right = Vector3.Cross(Vector3.Up(), forward).normalize();
  const direction = Vector3.Zero();
  if (keys.has("KeyW") || keys.has("ArrowUp")) direction.addInPlace(forward);
  if (keys.has("KeyS") || keys.has("ArrowDown")) direction.subtractInPlace(forward);
  if (keys.has("KeyD") || keys.has("ArrowRight")) direction.addInPlace(right);
  if (keys.has("KeyA") || keys.has("ArrowLeft")) direction.subtractInPlace(right);
  if (direction.lengthSquared() > 0) {
    direction.normalize().scaleInPlace(keys.has("ShiftLeft") || keys.has("ShiftRight") ? walkSpeed * 1.8 : walkSpeed);
    player.moveWithCollisions(direction);
  }
  tuneThirdCameraForLocation();
  thirdCamera.target = player.position.add(new Vector3(0, 1.1, 0));
  overheadCamera.target = player.position;
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
