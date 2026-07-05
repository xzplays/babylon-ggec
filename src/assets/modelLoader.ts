import { AbstractMesh, AssetContainer, Node, Scene, SceneLoader, TransformNode } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { findModelAsset, ModelAssetRole } from "./assetManifest";
import { isPermittedCommercialAsset } from "./licenseRegistry";

const cache = new Map<string, Promise<AssetContainer>>();
const splitPath = (path: string) => ({ rootUrl: path.slice(0, path.lastIndexOf("/") + 1), fileName: path.slice(path.lastIndexOf("/") + 1) });

export async function tryAttachModel(scene: Scene, role: ModelAssetRole, parent: TransformNode, fallbackMeshes: AbstractMesh[]) {
  const asset = findModelAsset(role);
  if (!asset || !isPermittedCommercialAsset(asset.licenseRecordId)) return false;
  try {
    const parts = splitPath(asset.path);
    const promise = cache.get(asset.path) ?? SceneLoader.LoadAssetContainerAsync(parts.rootUrl, parts.fileName, scene);
    cache.set(asset.path, promise);
    const container = await promise;
    const entries = container.instantiateModelsToScene(n => `${parent.name}-${n}`, false, { doNotInstantiate: false });
    entries.rootNodes.forEach((node: Node) => {
      node.parent = parent;
      if (node instanceof TransformNode) {
        node.scaling.scaleInPlace(asset.scale ?? 1);
        node.position.y += asset.yOffset ?? 0;
        node.rotation.y += asset.rotationY ?? 0;
      }
    });
    fallbackMeshes.forEach(m => m.setEnabled(false));
    const walk = container.animationGroups.find(g => (asset.animationHints ?? []).some(h => g.name.toLowerCase().includes(h)));
    walk?.start(true);
    return true;
  } catch (error) {
    console.info(`Model ${asset.path} not loaded; using procedural fallback.`, error);
    return false;
  }
}
