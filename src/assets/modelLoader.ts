import { AbstractMesh, AssetContainer, Scene, SceneLoader, TransformNode, Node } from "@babylonjs/core";
import { findModelAsset, ModelAssetRole } from "./assetManifest";
import { isPermittedCommercialAsset } from "./licenseRegistry";

const cache = new Map<string, Promise<AssetContainer>>();
const splitPath = (path: string) => ({ rootUrl: path.slice(0, path.lastIndexOf("/") + 1), fileName: path.slice(path.lastIndexOf("/") + 1) });

export async function tryAttachModel(scene: Scene, role: ModelAssetRole, parent: TransformNode, fallbackMeshes: AbstractMesh[]) {
  const asset = findModelAsset(role);
  if (!asset || !isPermittedCommercialAsset(asset.licenseRecordId)) return false;
  try {
    await import("@babylonjs/loaders/glTF/2.0/glTFLoader");
    const parts = splitPath(asset.path);
    const promise = cache.get(asset.path) ?? SceneLoader.LoadAssetContainerAsync(parts.rootUrl, parts.fileName, scene);
    cache.set(asset.path, promise);
    const container = await promise;
    const entries = container.instantiateModelsToScene(n => `${parent.name}-${n}`, false, { doNotInstantiate: false });
    entries.rootNodes.forEach((node: Node) => { node.parent = parent; const t = node as TransformNode; t.scaling?.scaleInPlace(asset.scale ?? 1); if (t.position) t.position.y += asset.yOffset ?? 0; if (t.rotation) t.rotation.y += asset.rotationY ?? 0; });
    fallbackMeshes.forEach(m => m.setEnabled(false));
    const walk = container.animationGroups.find(g => (asset.animationHints ?? []).some(h => g.name.toLowerCase().includes(h)));
    walk?.start(true);
    return true;
  } catch (error) {
    console.info(`Model ${asset.path} not loaded; using procedural fallback.`, error);
    return false;
  }
}
