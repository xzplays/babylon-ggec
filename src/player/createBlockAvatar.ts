import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { createAvatarAnimator, AvatarMotionState } from "./avatarAnimation";
import { PLAYER_HEIGHT } from "./playerConstants";

export type BlockAvatar = {
  root: TransformNode;
  setVisible: (visible: boolean) => void;
  setYaw: (yaw: number) => void;
  update: (dt: number, state: AvatarMotionState) => void;
};

const mat = (scene: Scene, name: string, color: Color3) => {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = color;
  return m;
};

export const createBlockAvatar = (scene: Scene): BlockAvatar => {
  const root = new TransformNode("方块访客根节点", scene);
  const skin = mat(scene, "方块访客皮肤", new Color3(0.95, 0.72, 0.52));
  const shirt = mat(scene, "方块访客蓝色上衣", new Color3(0.08, 0.32, 0.85));
  const pants = mat(scene, "方块访客深色裤子", new Color3(0.08, 0.12, 0.2));
  const face = mat(scene, "方块访客正面朝向标记", new Color3(1, 0.86, 0.12));
  const back = mat(scene, "方块访客深色背包背面标记", new Color3(0.04, 0.05, 0.08));
  const make = (name: string, position: Vector3, scaling: Vector3, material: StandardMaterial) => {
    const mesh = MeshBuilder.CreateBox(`方块访客-${name}`, { size: 1 }, scene);
    mesh.position = position; mesh.scaling = scaling; mesh.material = material; mesh.parent = root; mesh.checkCollisions = false;
    mesh.metadata = { ...(mesh.metadata ?? {}), blocksThirdPersonCamera: false, blocksPlayer: false };
    return mesh;
  };
  const body = make("body", new Vector3(0, 0.88, 0), new Vector3(0.42, 0.7, 0.24), shirt);
  make("head", new Vector3(0, 1.39, 0), new Vector3(0.32, 0.32, 0.32), skin);
  const leftArm = make("leftArm", new Vector3(-0.34, 0.9, 0), new Vector3(0.16, 0.62, 0.18), shirt);
  const rightArm = make("rightArm", new Vector3(0.34, 0.9, 0), new Vector3(0.16, 0.62, 0.18), shirt);
  const leftLeg = make("leftLeg", new Vector3(-0.11, 0.3, 0), new Vector3(0.18, 0.6, 0.18), pants);
  const rightLeg = make("rightLeg", new Vector3(0.11, 0.3, 0), new Vector3(0.18, 0.6, 0.18), pants);
  make("frontFaceMarker", new Vector3(0, 1.39, -0.19), new Vector3(0.12, 0.08, 0.08), face);
  make("frontChestMarker", new Vector3(0, 1.02, -0.135), new Vector3(0.2, 0.18, 0.03), face);
  make("backPack", new Vector3(0, 1.0, 0.16), new Vector3(0.26, 0.36, 0.06), back);
  const animate = createAvatarAnimator(root, { body: body as Mesh, leftArm, rightArm, leftLeg, rightLeg });
  root.position.y = -PLAYER_HEIGHT / 2;
  return { root, setVisible: (v) => root.setEnabled(v), setYaw: (yaw) => { root.rotation.y = yaw; }, update: animate };
};
