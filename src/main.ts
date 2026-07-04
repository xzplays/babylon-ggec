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
let viewMode: ViewMode = "first";

const campusWidth = 260;
const campusHeight = 180;

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

new HemisphericLight("skyLight", new Vector3(0.4, 1, 0.2), scene).intensity = 0.82;

const ground = MeshBuilder.CreateGround("central lawn", { width: campusWidth, height: campusHeight }, scene);
ground.material = grass;
ground.checkCollisions = true;

const makeBox = (name: string, position: Vector3, scaling: Vector3, material: StandardMaterial) => {
  const mesh = MeshBuilder.CreateBox(name, { size: 1 }, scene);
  mesh.position = position;
  mesh.scaling = scaling;
  mesh.material = material;
  mesh.checkCollisions = true;
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

makeBox("north ring road", new Vector3(0, 0.03, -62), new Vector3(112, 0.04, 5), road);
makeBox("south ring road", new Vector3(0, 0.03, 62), new Vector3(112, 0.04, 5), road);
makeBox("west ring road", new Vector3(-92, 0.03, 0), new Vector3(5, 0.04, 122), road);
makeBox("east ring road", new Vector3(92, 0.03, 0), new Vector3(5, 0.04, 122), road);
makeBox("east-west path", new Vector3(0, 0.05, 0), new Vector3(150, 0.03, 2.8), path);
makeBox("north-south path", new Vector3(0, 0.05, 0), new Vector3(2.8, 0.03, 116), path);
makeBox("library path", new Vector3(-48, 0.05, 32), new Vector3(44, 0.03, 2.4), path);
makeBox("lab path", new Vector3(52, 0.05, 34), new Vector3(48, 0.03, 2.4), path);

const buildings = [
  ["创新中心", -58, -34, 18, 12, 24, brick],
  ["图书馆", -56, 36, 20, 10, 24, glass],
  ["综合服务楼", 56, -36, 24, 13, 22, brick],
  ["实验楼", 58, 36, 22, 14, 22, glass],
  ["体育馆", 0, -52, 28, 8, 18, concrete],
  ["学生中心", 0, 52, 24, 9, 18, brick],
  ["行政楼", -96, 0, 18, 11, 26, concrete],
  ["报告厅", 96, 0, 18, 10, 26, glass]
] as const;

buildings.forEach(([name, x, z, sx, sy, sz, mat]) => {
  makeBox(name, new Vector3(x, sy / 2, z), new Vector3(sx, sy, sz), mat);
  makeBox(`${name} roof`, new Vector3(x, sy + 0.6, z), new Vector3(sx + 1.4, 0.6, sz + 1.4), roof);
  createBuildingLabel(name, new Vector3(x, sy + 4, z));
});

const plaza = MeshBuilder.CreateCylinder("central plaza", { diameter: 26, height: 0.12, tessellation: 64 }, scene);
plaza.position.y = 0.08;
plaza.material = path;
plaza.checkCollisions = true;

const lake = MeshBuilder.CreateCylinder("景观湖", { diameter: 1, height: 0.08, tessellation: 64 }, scene);
lake.position = new Vector3(0, 0.1, 76);
lake.scaling = new Vector3(30, 1, 10);
lake.material = water;
createBuildingLabel("景观湖", new Vector3(0, 7, 76));

for (let i = 0; i < 72; i += 1) {
  const angle = (i / 72) * Math.PI * 2;
  const radiusX = i % 2 === 0 ? 118 : 104;
  const radiusZ = i % 3 === 0 ? 78 : 68;
  const trunk = MeshBuilder.CreateCylinder(`tree trunk ${i}`, { diameter: 0.6, height: 2.8 }, scene);
  trunk.position = new Vector3(Math.cos(angle) * radiusX, 1.4, Math.sin(angle) * radiusZ);
  trunk.material = createMaterial(`trunk mat ${i}`, new Color3(0.38, 0.22, 0.12));
  trunk.checkCollisions = true;

  const crown = MeshBuilder.CreateSphere(`tree crown ${i}`, { diameter: 4.6, segments: 12 }, scene);
  crown.position = trunk.position.add(new Vector3(0, 3, 0));
  crown.material = createMaterial(`crown mat ${i}`, new Color3(0.08, 0.43, 0.16));
}

const player = MeshBuilder.CreateCapsule("visitor avatar", { height: 2.2, radius: 0.45 }, scene);
player.position = new Vector3(0, 1.1, -74);
player.material = createMaterial("visitor blue", new Color3(0.1, 0.34, 0.9));
player.checkCollisions = true;
player.ellipsoid = new Vector3(0.55, 1.1, 0.55);

const firstCamera = new UniversalCamera("first person camera", new Vector3(0, 2.0, -74), scene);
firstCamera.attachControl(canvas, true);
firstCamera.speed = 0.45;
firstCamera.angularSensibility = 3200;
firstCamera.applyGravity = true;
firstCamera.checkCollisions = true;
firstCamera.ellipsoid = new Vector3(0.55, 1, 0.55);
firstCamera.keysUp.push(87);
firstCamera.keysDown.push(83);
firstCamera.keysLeft.push(65);
firstCamera.keysRight.push(68);

const thirdCamera = new ArcRotateCamera("third person camera", Math.PI / 2, Math.PI / 3, 14, player.position, scene);
thirdCamera.attachControl(canvas, true);
thirdCamera.lowerRadiusLimit = 7;
thirdCamera.upperRadiusLimit = 24;
thirdCamera.wheelDeltaPercentage = 0.02;
thirdCamera.checkCollisions = true;

const overheadCamera = new ArcRotateCamera("overhead camera", Math.PI / 2, 0.08, 165, Vector3.Zero(), scene);
overheadCamera.attachControl(canvas, true);
overheadCamera.lowerRadiusLimit = 80;
overheadCamera.upperRadiusLimit = 230;
overheadCamera.wheelDeltaPercentage = 0.03;
overheadCamera.panningSensibility = 80;

scene.activeCamera = firstCamera;

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

const keys = new Set<string>();
window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "KeyV") {
    setViewMode(viewMode === "first" ? "third" : viewMode === "third" ? "overhead" : "first");
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
    direction.normalize().scaleInPlace(keys.has("ShiftLeft") || keys.has("ShiftRight") ? 0.55 : 0.3);
    player.moveWithCollisions(direction);
  }
  thirdCamera.target = player.position.add(new Vector3(0, 1.1, 0));
  overheadCamera.target = player.position;
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
