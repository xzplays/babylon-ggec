import { LinesMesh, MeshBuilder, Scene } from "@babylonjs/core";
import { TrafficRoute, v3 } from "./pathTypes";
export const createRouteDebugLines=(scene:Scene,routes:TrafficRoute[],prefix:string)=>routes.map(r=>{const pts=r.points.map(p=>v3(p,.16)); const m=MeshBuilder.CreateLines(`${prefix}-${r.id}`,{points:pts.concat(r.loop==="loop"?[pts[0]]:[])},scene) as LinesMesh; m.color.set(r.kind==="vehicle"?1:.2,r.kind==="vehicle"?.65:1,.1); m.isVisible=false; return m;});
