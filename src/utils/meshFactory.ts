import { Material, Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export type BoxMeshOptions = {
  name: string;
  position: Vector3;
  scaling: Vector3;
  material: Material;
  collides?: boolean;
  walkable?: boolean;
  blocksCamera?: boolean;
  visible?: boolean;
};

export function applyMeshMetadata(mesh: Mesh, options: { collides?: boolean; walkable?: boolean; blocksCamera?: boolean }) {
  const collides = options.collides ?? false;
  mesh.checkCollisions = collides;
  mesh.metadata = {
    ...(mesh.metadata ?? {}),
    walkable: options.walkable === true,
    blocksPlayer: collides,
    blocksThirdPersonCamera: options.blocksCamera === true,
  };
}

export function createBoxMesh(scene: Scene, options: BoxMeshOptions) {
  const mesh = MeshBuilder.CreateBox(options.name, { size: 1 }, scene);
  mesh.position = options.position;
  mesh.scaling = options.scaling;
  mesh.material = options.material;
  mesh.isVisible = options.visible ?? true;
  applyMeshMetadata(mesh, options);
  return mesh;
}
