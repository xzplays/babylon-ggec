import { Color3, Color4, HemisphericLight, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { buildings, campusBounds, roads } from "../data/campusLayout";
import { createBuilding } from "../buildings/createBuilding";
import { createCampusMaterials } from "../materials/materials";
import { createLabel } from "../utils/label";
const box=(scene:Scene,n:string,p:Vector3,s:Vector3,m:any,c=true)=>{const b=MeshBuilder.CreateBox(n,{size:1},scene);b.position=p;b.scaling=s;b.material=m;b.checkCollisions=c;return b;};
export const createCampusScene=(scene:Scene)=>{scene.clearColor=new Color4(.62,.82,1,1);scene.collisionsEnabled=true;scene.gravity=new Vector3(0,-.35,0);new HemisphericLight("现实尺度天空光",new Vector3(.4,1,.2),scene).intensity=.82;const m=createCampusMaterials(scene);
 const ground=MeshBuilder.CreateGround("1200m x 900m 园区地面",{width:campusBounds.width,height:campusBounds.depth},scene);ground.material=m.grass;ground.checkCollisions=true;
 roads.forEach(r=>box(scene,r.name,new Vector3(r.x,.035,r.z),new Vector3(r.width,.07,r.depth),m.road,true));
 box(scene,"北侧围墙",new Vector3(0,1.4,-450),new Vector3(1200,2.8,.4),m.concrete,true); box(scene,"南侧围墙",new Vector3(0,1.4,450),new Vector3(1200,2.8,.4),m.concrete,true); box(scene,"西侧围墙",new Vector3(-600,1.4,0),new Vector3(.4,2.8,900),m.concrete,true); box(scene,"东侧围墙",new Vector3(600,1.4,0),new Vector3(.4,2.8,900),m.concrete,true);
 box(scene,"主入口大门左柱",new Vector3(-20,4.5,-450),new Vector3(2,9,2),m.concrete,true); box(scene,"主入口大门右柱",new Vector3(20,4.5,-450),new Vector3(2,9,2),m.concrete,true); box(scene,"主入口门楣",new Vector3(0,9,-450),new Vector3(46,2,2),m.dark,false); box(scene,"门卫室",new Vector3(42,1.8,-430),new Vector3(14,3.6,10),m.concrete,true); createLabel(scene,"广汽相关产业园 · 主入口",new Vector3(0,13,-452),28,4);
 buildings.forEach(b=>createBuilding(scene,b,m));
 const plaza=MeshBuilder.CreateCylinder("中央景观广场 直径70m",{diameter:70,height:.12,tessellation:64},scene);plaza.position.y=.08;plaza.material=m.path;plaza.checkCollisions=true; const lake=MeshBuilder.CreateCylinder("景观湖 120m x 42m",{diameter:1,height:.08,tessellation:64},scene);lake.position=new Vector3(155,.1,325);lake.scaling=new Vector3(60,1,21);lake.material=m.water;createLabel(scene,"中央广场 / 景观湖",new Vector3(110,8,315),18,3);
 for(let i=0;i<70;i++){const x=-510+i*15; box(scene,`停车位线-${i}`,new Vector3(x,.08,335),new Vector3(.12,.04,5),m.white,false);} box(scene,"办公区停车场",new Vector3(-250,.04,335),new Vector3(260,.05,70),m.path,true);
 for(let i=0;i<96;i++){const a=i/96*Math.PI*2,rx=i%2?510:455,rz=i%3?380:325; const x=Math.cos(a)*rx,z=Math.sin(a)*rz; const trunk=MeshBuilder.CreateCylinder(`树干实例源-${i}`,{diameter:.55,height:2.8},scene);trunk.position=new Vector3(x,1.4,z);trunk.material=m.trunk;trunk.checkCollisions=true; const crown=MeshBuilder.CreateSphere(`树冠实例源-${i}`,{diameter:4.6,segments:10},scene);crown.position=new Vector3(x,4.1,z);crown.material=m.crown;}
 for(let x=-520;x<=520;x+=80){box(scene,`主干道路灯-${x}`,new Vector3(x,4,10),new Vector3(.35,8,.35),m.concrete,false);box(scene,`路灯灯头-${x}`,new Vector3(x,8.2,10),new Vector3(3,.25,.5),m.white,false);} 
 box(scene,"100m比例尺",new Vector3(-520,.12,425),new Vector3(100,.12,2),m.white,false);createLabel(scene,"100m 比例尺（1 Babylon单位 = 1米）",new Vector3(-470,7,425),28,4);
 return {materials:m,buildings};};
