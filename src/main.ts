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
type BuildingSpec = {
  name: string;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  material: StandardMaterial;
  lobby: string;
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
let viewMode: ViewMode = "first";
let currentLocation = "室外园区";

// 1 Babylon unit = 1 real-world meter. The map therefore uses real campus-like dimensions.
const campusWidth = 420;
const campusHeight = 300;
const wallThickness = 0.35;
const doorWidth = 4.2;

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

makeBox("north ring road", new Vector3(0, 0.03, -105), new Vector3(190, 0.04, 7), road);
makeBox("south ring road", new Vector3(0, 0.03, 105), new Vector3(190, 0.04, 7), road);
makeBox("west ring road", new Vector3(-150, 0.03, 0), new Vector3(7, 0.04, 205), road);
makeBox("east ring road", new Vector3(150, 0.03, 0), new Vector3(7, 0.04, 205), road);
makeBox("east-west path", new Vector3(0, 0.05, 0), new Vector3(230, 0.03, 3.2), path);
makeBox("north-south path", new Vector3(0, 0.05, 0), new Vector3(3.2, 0.03, 180), path);
makeBox("library path", new Vector3(-82, 0.05, 55), new Vector3(78, 0.03, 2.8), path);
makeBox("lab path", new Vector3(86, 0.05, 55), new Vector3(82, 0.03, 2.8), path);

const addFurniture = (name: string, x: number, z: number, width: number, depth: number) => {
  makeBox(`${name} reception`, new Vector3(x, 0.55, z - depth * 0.22), new Vector3(width * 0.28, 1.1, 1.2), furniture);
  makeBox(`${name} table left`, new Vector3(x - width * 0.22, 0.38, z + depth * 0.1), new Vector3(3.2, 0.75, 1.5), furniture);
  makeBox(`${name} table right`, new Vector3(x + width * 0.22, 0.38, z + depth * 0.1), new Vector3(3.2, 0.75, 1.5), furniture);
  makeBox(`${name} back room divider`, new Vector3(x, 1.6, z + depth * 0.22), new Vector3(width * 0.55, 3.2, wallThickness), innerWall);
};

const createEnterableBuilding = (spec: BuildingSpec) => {
  const { name, x, z, width, height, depth, material, lobby } = spec;
  makeBox(`${name} floor`, new Vector3(x, 0.08, z), new Vector3(width, 0.16, depth), floorMat, false);
  makeBox(`${name} roof`, new Vector3(x, height + 0.3, z), new Vector3(width + 1.4, 0.6, depth + 1.4), roof);
  makeBox(`${name} north wall`, new Vector3(x, height / 2, z - depth / 2), new Vector3(width, height, wallThickness), material);
  makeBox(`${name} west wall`, new Vector3(x - width / 2, height / 2, z), new Vector3(wallThickness, height, depth), material);
  makeBox(`${name} east wall`, new Vector3(x + width / 2, height / 2, z), new Vector3(wallThickness, height, depth), material);
  makeBox(`${name} south wall left`, new Vector3(x - (width + doorWidth) / 4, height / 2, z + depth / 2), new Vector3((width - doorWidth) / 2, height, wallThickness), material);
  makeBox(`${name} south wall right`, new Vector3(x + (width + doorWidth) / 4, height / 2, z + depth / 2), new Vector3((width - doorWidth) / 2, height, wallThickness), material);
  makeBox(`${name} lintel`, new Vector3(x, height - 0.7, z + depth / 2), new Vector3(doorWidth, 1.4, wallThickness), material);
  makeBox(`${name} entry marker`, new Vector3(x, 0.06, z + depth / 2 + 3), new Vector3(doorWidth, 0.08, 2.6), markerMat, false);
  addFurniture(name, x, z, width, depth);
  createBuildingLabel(name, new Vector3(x, height + 4, z));
  createBuildingLabel(lobby, new Vector3(x, 3.4, z + depth * 0.18));
};

const buildings: BuildingSpec[] = [
  { name: "创新中心", x: -92, z: -58, width: 38, height: 18, depth: 46, material: brick, lobby: "开放办公大厅" },
  { name: "图书馆", x: -90, z: 62, width: 42, height: 15, depth: 50, material: glass, lobby: "阅览大厅" },
  { name: "综合服务楼", x: 90, z: -60, width: 48, height: 20, depth: 42, material: brick, lobby: "服务大厅" },
  { name: "实验楼", x: 94, z: 62, width: 44, height: 21, depth: 44, material: glass, lobby: "实验中庭" },
  { name: "体育馆", x: 0, z: -88, width: 60, height: 16, depth: 34, material: concrete, lobby: "室内球场" },
  { name: "学生中心", x: 0, z: 88, width: 48, height: 14, depth: 36, material: brick, lobby: "学生活动大厅" },
  { name: "行政楼", x: -152, z: 0, width: 34, height: 18, depth: 48, material: concrete, lobby: "办事大厅" },
  { name: "报告厅", x: 152, z: 0, width: 34, height: 16, depth: 48, material: glass, lobby: "观众厅" }
];

buildings.forEach(createEnterableBuilding);

const plaza = MeshBuilder.CreateCylinder("central plaza", { diameter: 40, height: 0.12, tessellation: 64 }, scene);
plaza.position.y = 0.08;
plaza.material = path;
plaza.checkCollisions = true;

const lake = MeshBuilder.CreateCylinder("景观湖", { diameter: 1, height: 0.08, tessellation: 64 }, scene);
lake.position = new Vector3(0, 0.1, 126);
lake.scaling = new Vector3(48, 1, 16);
lake.material = water;
createBuildingLabel("景观湖", new Vector3(0, 7, 126));

for (let i = 0; i < 96; i += 1) {
  const angle = (i / 96) * Math.PI * 2;
  const radiusX = i % 2 === 0 ? 190 : 168;
  const radiusZ = i % 3 === 0 ? 128 : 112;
  const trunk = MeshBuilder.CreateCylinder(`tree trunk ${i}`, { diameter: 0.6, height: 2.8 }, scene);
  trunk.position = new Vector3(Math.cos(angle) * radiusX, 1.4, Math.sin(angle) * radiusZ);
  trunk.material = createMaterial(`trunk mat ${i}`, new Color3(0.38, 0.22, 0.12));
  trunk.checkCollisions = true;

  const crown = MeshBuilder.CreateSphere(`tree crown ${i}`, { diameter: 4.6, segments: 12 }, scene);
  crown.position = trunk.position.add(new Vector3(0, 3, 0));
  crown.material = createMaterial(`crown mat ${i}`, new Color3(0.08, 0.43, 0.16));
}

const player = MeshBuilder.CreateCapsule("visitor avatar", { height: 2.2, radius: 0.45 }, scene);
player.position = new Vector3(0, 1.1, -124);
player.material = createMaterial("visitor blue", new Color3(0.1, 0.34, 0.9));
player.checkCollisions = true;
player.ellipsoid = new Vector3(0.55, 1.1, 0.55);

const firstCamera = new UniversalCamera("first person camera", new Vector3(0, 2.0, -124), scene);
firstCamera.attachControl(canvas, true);
firstCamera.speed = 0.65;
firstCamera.angularSensibility = 3200;
firstCamera.applyGravity = true;
firstCamera.checkCollisions = true;
firstCamera.ellipsoid = new Vector3(0.55, 1, 0.55);
firstCamera.keysUp.push(87);
firstCamera.keysDown.push(83);
firstCamera.keysLeft.push(65);
firstCamera.keysRight.push(68);

const thirdCamera = new ArcRotateCamera("third person camera", Math.PI / 2, Math.PI / 3, 18, player.position, scene);
thirdCamera.attachControl(canvas, true);
thirdCamera.lowerRadiusLimit = 7;
thirdCamera.upperRadiusLimit = 32;
thirdCamera.wheelDeltaPercentage = 0.02;
thirdCamera.checkCollisions = true;

const overheadCamera = new ArcRotateCamera("overhead camera", Math.PI / 2, 0.08, 260, Vector3.Zero(), scene);
overheadCamera.attachControl(canvas, true);
overheadCamera.lowerRadiusLimit = 120;
overheadCamera.upperRadiusLimit = 360;
overheadCamera.wheelDeltaPercentage = 0.03;
overheadCamera.panningSensibility = 80;

scene.activeCamera = firstCamera;

const syncCamerasTo = (position: Vector3, yaw = 0) => {
  player.position.copyFrom(position);
  firstCamera.position.copyFrom(position).addInPlaceFromFloats(0, 0.9, 0);
  firstCamera.rotation = new Vector3(0, yaw, 0);
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
const setViewMode = (mode: ViewMode) => {
  if (viewMode === "first") {
    player.position.copyFrom(firstCamera.position).addInPlaceFromFloats(0, -1, 0);
  } else if (mode === "first") {
    firstCamera.position.copyFrom(player.position).addInPlaceFromFloats(0, 1, 0);
  }

  viewMode = mode;
  scene.activeCamera = mode === "first" ? firstCamera : mode === "third" ? thirdCamera : overheadCamera;
  modeLabel!.textContent = `当前：${modeText(mode)}`;
};

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
});
window.addEventListener("keyup", (event) => keys.delete(event.code));

scene.onBeforeRenderObservable.add(() => {
  if (viewMode === "first") {
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
    direction.normalize().scaleInPlace(keys.has("ShiftLeft") || keys.has("ShiftRight") ? 0.85 : 0.45);
    player.moveWithCollisions(direction);
  }
  thirdCamera.target = player.position.add(new Vector3(0, 1.1, 0));
  overheadCamera.target = player.position;
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
