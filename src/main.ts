import { Engine, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import "./style.css";
import { createCampusScene } from "./scene/createCampusScene";
import { createCameraController } from "./camera/cameraController";
import { createPlayerController } from "./player/playerController";
import { createHud } from "./ui/hud";
import { PLAYER_HEIGHT, PLAYER_RADIUS } from "./player/playerConstants";
const canvas=document.querySelector<HTMLCanvasElement>("#renderCanvas"); if(!canvas) throw new Error("Canvas #renderCanvas was not found.");
const engine=new Engine(canvas,true); const scene=new Scene(engine); const campus=createCampusScene(scene);
const player=MeshBuilder.CreateCapsule("访客简化碰撞体",{height:PLAYER_HEIGHT,radius:PLAYER_RADIUS},scene); player.position=new Vector3(0,PLAYER_HEIGHT/2,-430); player.isVisible=false; player.checkCollisions=true; player.ellipsoid=new Vector3(PLAYER_RADIUS,PLAYER_HEIGHT/2,PLAYER_RADIUS);
const cameras=createCameraController(scene,canvas,player); let hud: ReturnType<typeof createHud>;
const playerController=createPlayerController(scene,cameras,player,campus.buildings,(s)=>hud.setLocation(s)); cameras.syncTo(player.position,0);
hud=createHud(campus.buildings,()=>({mode:cameras.viewMode,location:"室外园区",x:player.position.x,z:player.position.z,speed:playerController.getWalkSpeed()}),(b,i)=>playerController.goTo(b,i),playerController.setWalkSpeed,playerController.resetToEntrance,{
 getStats:()=>({...campus.pedestrians.getStats(), vehicles:campus.vehicles.getStats()}),
 setRoutesVisible:(v:boolean)=>{campus.pedestrians.setDebugVisible(v);campus.vehicles.setDebugVisible(v);},
 setPedestriansPaused:campus.pedestrians.setPaused,
 setVehiclesPaused:campus.vehicles.setPaused,
 setCityDetailsVisible:(v:boolean)=>scene.meshes.filter(m=>m.name.startsWith("城市")||m.name.startsWith("外部")||m.name.includes("公交")||m.name.includes("红绿灯")||m.name.includes("远景")).forEach(m=>m.setEnabled(v))
});
engine.runRenderLoop(()=>scene.render()); window.addEventListener("resize",()=>engine.resize());
