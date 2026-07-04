import { Color3, DynamicTexture, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
export const createLabel = (scene: Scene, text: string, position: Vector3, width = 12, height = 3): Mesh => {
 const tex = new DynamicTexture(`${text}-texture`, { width: 768, height: 192 }, scene, false); tex.hasAlpha = true;
 tex.drawText(text, null, 118, "bold 58px Microsoft YaHei, Arial", "#fff", "rgba(15,23,42,.78)", true, true);
 const m = new StandardMaterial(`${text}-label-mat`, scene); m.diffuseTexture = tex; m.opacityTexture = tex; m.emissiveColor = Color3.White(); m.disableLighting = true;
 const p = MeshBuilder.CreatePlane(`${text}-label`, { width, height }, scene); p.position = position; p.material = m; p.billboardMode = Mesh.BILLBOARDMODE_ALL; p.isPickable = false; return p;
};
