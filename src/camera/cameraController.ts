import { ArcRotateCamera, Scene, UniversalCamera, Vector3 } from "@babylonjs/core";
import { EYE_HEIGHT, PLAYER_HEIGHT, PLAYER_RADIUS } from "../player/playerConstants";
import { createThirdPersonOcclusion } from "./thirdPersonOcclusion";
export type ViewMode="first"|"third"|"overhead";
export const modeText=(m:ViewMode)=>m==="first"?"第一视角导览模式":m==="third"?"第三视角":"俯瞰视角";
export const createCameraController=(scene:Scene,canvas:HTMLCanvasElement,player:any)=>{
 const first=new UniversalCamera("第一视角相机",new Vector3(0,EYE_HEIGHT,-430),scene);first.attachControl(canvas,true);first.speed=0;first.angularSensibility=5200;first.applyGravity=false;first.checkCollisions=true;first.ellipsoid=new Vector3(PLAYER_RADIUS*.9,EYE_HEIGHT,PLAYER_RADIUS*.9);first.keysUp=[];first.keysDown=[];first.keysLeft=[];first.keysRight=[];first.maxZ=5000;first.minZ=.05;
 const third=new ArcRotateCamera("第三视角相机",Math.PI/2,Math.PI/3,12,player.position.add(new Vector3(0,1.2,0)),scene);third.attachControl(canvas,true);third.lowerRadiusLimit=3;third.upperRadiusLimit=24;third.wheelDeltaPercentage=.015;third.checkCollisions=true;third.collisionRadius=new Vector3(.4,.4,.4);third.angularSensibilityX=1400;third.angularSensibilityY=1400;third.maxZ=5000;
 const overhead=new ArcRotateCamera("俯瞰相机",Math.PI/2,.08,1050,Vector3.Zero(),scene);overhead.attachControl(canvas,true);overhead.lowerRadiusLimit=250;overhead.upperRadiusLimit=1700;overhead.wheelDeltaPercentage=.025;overhead.panningSensibility=80;overhead.maxZ=7000;
 let viewMode:ViewMode="first";scene.activeCamera=first; const occlusion=createThirdPersonOcclusion(scene, third);
 const target=()=>player.position.add(new Vector3(0,PLAYER_HEIGHT*.7,0));
 const syncTargets=()=>{third.target=target();overhead.target=player.position;};
 const setViewMode=(m:ViewMode)=>{if(viewMode==="first")player.position.copyFrom(first.position).addInPlaceFromFloats(0,-EYE_HEIGHT+PLAYER_HEIGHT/2,0); if(m==="first")first.position.copyFrom(player.position).addInPlaceFromFloats(0,EYE_HEIGHT-PLAYER_HEIGHT/2,0); viewMode=m; if(m==="third"){third.radius=Math.min(third.radius,12);occlusion.setDesiredRadius(third.radius);} scene.activeCamera=m==="first"?first:m==="third"?third:overhead; syncTargets();};
 const syncTo=(p:Vector3,yaw=0,indoor=false)=>{player.position.copyFrom(p);first.position.copyFrom(p).addInPlaceFromFloats(0,EYE_HEIGHT-PLAYER_HEIGHT/2,0);first.rotation=new Vector3(0,yaw,0);if(indoor){third.radius=4;occlusion.setDesiredRadius(4);}syncTargets();};
 const update=(dt:number)=>{syncTargets(); if(viewMode==="third") occlusion.update(true, dt);};
 return {first,third,overhead,get viewMode(){return viewMode},setViewMode,syncTo,syncTargets,update,rememberThirdPersonRadius:occlusion.rememberDesired};
};
