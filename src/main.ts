import { ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, UniversalCamera, Vector3 } from "@babylonjs/core";
import "./style.css";

type ViewMode = "first" | "third";

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
const roof = createMaterial("roof", new Color3(0.08, 0.12, 0.2));
const path = createMaterial("path", new Color3(0.72, 0.66, 0.55));
const water = createMaterial("water", new Color3(0.14, 0.49, 0.78));
water.alpha = 0.78;

new HemisphericLight("skyLight", new Vector3(0.4, 1, 0.2), scene).intensity = 0.82;

const ground = MeshBuilder.CreateGround("central lawn", { width: 120, height: 90 }, scene);
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

makeBox("north main road", new Vector3(0, 0.03, -22), new Vector3(54, 0.04, 4), road);
makeBox("south main road", new Vector3(0, 0.03, 22), new Vector3(54, 0.04, 4), road);
makeBox("east-west path", new Vector3(0, 0.05, 0), new Vector3(74, 0.03, 2), path);
makeBox("north-south path", new Vector3(0, 0.05, 0), new Vector3(2, 0.03, 54), path);

const buildings = [
  ["创新中心", -30, -14, 12, 8, 18, brick],
  ["图书馆", -30, 16, 10, 7, 14, glass],
  ["综合服务楼", 28, -14, 14, 9, 16, brick],
  ["实验楼", 30, 16, 11, 10, 12, glass]
] as const;

buildings.forEach(([name, x, z, sx, sy, sz, mat]) => {
  makeBox(name, new Vector3(x, sy / 2, z), new Vector3(sx, sy, sz), mat);
  makeBox(`${name} roof`, new Vector3(x, sy + 0.6, z), new Vector3(sx + 1, 0.6, sz + 1), roof);
});

const plaza = MeshBuilder.CreateCylinder("central plaza", { diameter: 16, height: 0.12, tessellation: 48 }, scene);
plaza.position.y = 0.08;
plaza.material = path;
plaza.checkCollisions = true;

const lake = MeshBuilder.CreateCylinder("景观湖", { diameter: 1, height: 0.08, tessellation: 64 }, scene);
lake.position = new Vector3(0, 0.1, 33);
lake.scaling = new Vector3(18, 1, 10);
lake.material = water;

for (let i = 0; i < 36; i += 1) {
  const angle = (i / 36) * Math.PI * 2;
  const radius = i % 2 === 0 ? 42 : 35;
  const trunk = MeshBuilder.CreateCylinder(`tree trunk ${i}`, { diameter: 0.6, height: 2.8 }, scene);
  trunk.position = new Vector3(Math.cos(angle) * radius, 1.4, Math.sin(angle) * 30);
  trunk.material = createMaterial(`trunk mat ${i}`, new Color3(0.38, 0.22, 0.12));
  trunk.checkCollisions = true;

  const crown = MeshBuilder.CreateSphere(`tree crown ${i}`, { diameter: 4.6, segments: 12 }, scene);
  crown.position = trunk.position.add(new Vector3(0, 3, 0));
  crown.material = createMaterial(`crown mat ${i}`, new Color3(0.08, 0.43, 0.16));
}

const player = MeshBuilder.CreateCapsule("visitor avatar", { height: 2.2, radius: 0.45 }, scene);
player.position = new Vector3(0, 1.1, -34);
player.material = createMaterial("visitor blue", new Color3(0.1, 0.34, 0.9));
player.checkCollisions = true;
player.ellipsoid = new Vector3(0.55, 1.1, 0.55);

const firstCamera = new UniversalCamera("first person camera", new Vector3(0, 2.0, -34), scene);
firstCamera.attachControl(canvas, true);
firstCamera.speed = 0.22;
firstCamera.angularSensibility = 3200;
firstCamera.applyGravity = true;
firstCamera.checkCollisions = true;
firstCamera.ellipsoid = new Vector3(0.55, 1, 0.55);
firstCamera.keysUp.push(87);
firstCamera.keysDown.push(83);
firstCamera.keysLeft.push(65);
firstCamera.keysRight.push(68);

const thirdCamera = new ArcRotateCamera("third person camera", Math.PI / 2, Math.PI / 3, 9, player.position, scene);
thirdCamera.attachControl(canvas, true);
thirdCamera.lowerRadiusLimit = 5;
thirdCamera.upperRadiusLimit = 16;
thirdCamera.wheelDeltaPercentage = 0.02;
thirdCamera.checkCollisions = true;

scene.activeCamera = firstCamera;

const keys = new Set<string>();
window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "KeyV") {
    viewMode = viewMode === "first" ? "third" : "first";
    scene.activeCamera = viewMode === "first" ? firstCamera : thirdCamera;
    modeLabel!.textContent = `当前：${viewMode === "first" ? "第一视角" : "第三视角"}`;
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
  const forward = new Vector3(Math.sin(thirdCamera.alpha), 0, Math.cos(thirdCamera.alpha));
  const right = new Vector3(forward.z, 0, -forward.x);
  const direction = Vector3.Zero();
  if (keys.has("KeyW") || keys.has("ArrowUp")) direction.addInPlace(forward);
  if (keys.has("KeyS") || keys.has("ArrowDown")) direction.subtractInPlace(forward);
  if (keys.has("KeyD") || keys.has("ArrowRight")) direction.addInPlace(right);
  if (keys.has("KeyA") || keys.has("ArrowLeft")) direction.subtractInPlace(right);
  if (direction.lengthSquared() > 0) {
    direction.normalize().scaleInPlace(keys.has("ShiftLeft") || keys.has("ShiftRight") ? 0.35 : 0.18);
    player.moveWithCollisions(direction);
  }
  thirdCamera.target = player.position.add(new Vector3(0, 1.1, 0));
});

engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
