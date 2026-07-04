import { Color3, Scene, StandardMaterial } from "@babylonjs/core";
export type CampusMaterials = ReturnType<typeof createCampusMaterials>;
const mat = (scene: Scene, name: string, color: Color3, alpha = 1) => { const m = new StandardMaterial(name, scene); m.diffuseColor = color; m.alpha = alpha; return m; };
export const createCampusMaterials = (scene: Scene) => ({
 grass: mat(scene,"共享草地材质",new Color3(.24,.58,.26)), road: mat(scene,"共享沥青材质",new Color3(.15,.16,.18)), path: mat(scene,"共享人行道材质",new Color3(.72,.68,.58)),
 concrete: mat(scene,"共享混凝土材质",new Color3(.62,.63,.62)), steel: mat(scene,"共享轻钢材质",new Color3(.68,.72,.78)), glass: mat(scene,"共享玻璃材质",new Color3(.36,.64,.82),.68), brick: mat(scene,"共享砖材质",new Color3(.72,.38,.27)),
 roof: mat(scene,"共享屋面材质",new Color3(.08,.12,.18)), floor: mat(scene,"共享室内地坪材质",new Color3(.78,.75,.68)), innerWall: mat(scene,"共享内墙材质",new Color3(.9,.9,.84)),
 marker: mat(scene,"共享入口标记材质",new Color3(.05,.82,.55)), trunk: mat(scene,"共享树干材质",new Color3(.38,.22,.12)), crown: mat(scene,"共享树冠材质",new Color3(.08,.43,.16)),
 white: mat(scene,"共享白线材质",Color3.White()), furniture: mat(scene,"共享家具材质",new Color3(.42,.28,.16)), equipment: mat(scene,"共享设备材质",new Color3(.12,.2,.28)), water: mat(scene,"共享水体材质",new Color3(.14,.49,.78),.78), dark: mat(scene,"共享深色标牌材质",new Color3(.05,.07,.12))
});
