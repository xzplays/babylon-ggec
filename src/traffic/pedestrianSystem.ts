import { Mesh, MeshBuilder, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { createCampusMaterials } from "../materials/materials";
import { tryAttachModel } from "../assets/modelLoader";
import { MovingObstacle } from "./collisionAvoidance";
import { pedestrianRoutes } from "./trafficRoutes";
import { v3 } from "./pathTypes";

export type PedestrianSystem = { people: MovingObstacle[]; setPaused(v:boolean):void; setDebugVisible(v:boolean):void; getStats():{count:number; paused:boolean}; dispose():void };

type Person = MovingObstacle & { root: TransformNode; limbs: Mesh[]; routeIndex: number; target: number; dir: 1|-1; baseSpeed: number; phase: number };

export function createPedestrianSystem(scene: Scene, materials: ReturnType<typeof createCampusMaterials>, count = 40): PedestrianSystem {
 let paused=false; const people: Person[]=[]; const debug: Mesh[]=[];
 pedestrianRoutes.forEach(r=>{const pts=r.points.map(p=>v3(p,.09)); const lines=MeshBuilder.CreateLines(`行人路线-${r.id}`,{points:pts.concat(r.loop==="loop"?[pts[0]]:[])},scene); lines.color.set(.2,1,.7); lines.isVisible=false; debug.push(lines as Mesh);});
 const makeFallback=(root:TransformNode,i:number)=>{const body=MeshBuilder.CreateBox(`${root.name}-body`,{width:.48,height:.85,depth:.3},scene); body.position.y=1.1; body.material=materials.furniture; body.parent=root; const head=MeshBuilder.CreateSphere(`${root.name}-head`,{diameter:.34,segments:8},scene); head.position.y=1.72; head.material=materials.brick; head.parent=root; const limbs:Mesh[]=[]; for(const [n,x,y] of [["legL",-.14,.45],["legR",.14,.45],["armL",-.34,1.12],["armR",.34,1.12]] as const){const l=MeshBuilder.CreateBox(`${root.name}-${n}`,{width:.12,height:.72,depth:.12},scene); l.position.set(x,y,0); l.material=i%2?materials.dark:materials.equipment; l.parent=root; limbs.push(l);} return [body,head,...limbs];};
 for(let i=0;i<count;i++){const route=pedestrianRoutes[i%pedestrianRoutes.length]; const root=new TransformNode(`动态行人-${i}`,scene); root.position=v3(route.points[i%route.points.length]); const fallback=makeFallback(root,i); void tryAttachModel(scene,"person",root,fallback); people.push({id:root.name,position:root.position,radius:.55,root,limbs:fallback.slice(2) as Mesh[],routeId:route.id,routeIndex:i%pedestrianRoutes.length,target:(i+1)%route.points.length,dir:1,baseSpeed:.8+(i%9)*.09,phase:i*.7}); }
 const step=()=>{const dt=Math.min(scene.getEngine().getDeltaTime()/1000,.05); if(paused)return; for(const p of people){const route=pedestrianRoutes[p.routeIndex]; const target=v3(route.points[p.target]); const delta=target.subtract(p.root.position); const dist=delta.length(); if(dist<.7){ if(route.loop==="pingpong" && (p.target===route.points.length-1 || p.target===0)) p.dir=(p.dir*-1) as 1|-1; p.target=(p.target+p.dir+route.points.length)%route.points.length; continue;} const dir=delta.normalize(); p.root.position.addInPlace(dir.scale(p.baseSpeed*dt)); p.root.rotation.y=Math.atan2(dir.x,dir.z); p.position=p.root.position; p.phase+=dt*p.baseSpeed*5; p.limbs.forEach((l,idx)=>l.rotation.x=Math.sin(p.phase+(idx%2?Math.PI:0))*(idx<2?.55:.35)); }};
 scene.onBeforeRenderObservable.add(step);
 return { people, setPaused:v=>paused=v, setDebugVisible:v=>debug.forEach(d=>d.isVisible=v), getStats:()=>({count:people.length,paused}), dispose:()=>scene.onBeforeRenderObservable.removeCallback(step) };
}
