import { Color3, Color4, HemisphericLight, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { buildings, campusBounds, roads } from "../data/campusLayout";
import { createBuilding } from "../buildings/createBuilding";
import { createCampusMaterials } from "../materials/materials";
import { createLabel } from "../utils/label";

const box=(scene:Scene,n:string,p:Vector3,s:Vector3,m:any,c=true)=>{const b=MeshBuilder.CreateBox(n,{size:1},scene);b.position=p;b.scaling=s;b.material=m;b.checkCollisions=c;return b;};
const cyl=(scene:Scene,n:string,p:Vector3,diameter:number,height:number,m:any,c=true)=>{const b=MeshBuilder.CreateCylinder(n,{diameter,height,tessellation:16},scene);b.position=p;b.material=m;b.checkCollisions=c;return b;};

const createVehicle=(scene:Scene,name:string,p:Vector3,m:any,kind:"car"|"truck"|"forklift"="car",rot=0)=>{
 const root=box(scene,`${name}-body`,p.add(new Vector3(0,kind==="truck"?1.15:.65,0)),kind==="truck"?new Vector3(7,2.3,16):kind==="forklift"?new Vector3(2.1,1.4,3.2):new Vector3(4.4,1.3,8),kind==="truck"?m.steel:kind==="forklift"?m.equipment:m.dark,true);root.rotation.y=rot;
 const cab=box(scene,`${name}-cab`,p.add(new Vector3(0,kind==="truck"?2.7:1.55,kind==="truck"?-4.4:-.7)),kind==="truck"?new Vector3(6.4,2.4,4.2):kind==="forklift"?new Vector3(1.8,1.6,1.6):new Vector3(3.4,1.1,3.2),m.glass,true);cab.rotation.y=rot;
 const zs=kind==="truck"?[-6,6]:[-2.8,2.8]; for(const x of [-2.1,2.1]) for(const z of zs){const w=cyl(scene,`${name}-wheel-${x}-${z}`,p.add(new Vector3(x,.45,z)),.85,.45,m.road,false);w.rotation.z=Math.PI/2;w.rotation.y=rot;}
 return root;
};

const createPedestrian=(scene:Scene,name:string,p:Vector3,m:any,rot=0)=>{cyl(scene,`${name}-legs`,p.add(new Vector3(0,.45,0)),.38,.9,m.dark,false);const body=box(scene,`${name}-body`,p.add(new Vector3(0,1.18,0)),new Vector3(.55,.9,.32),m.furniture,false);body.rotation.y=rot;const head=MeshBuilder.CreateSphere(`${name}-head`,{diameter:.38,segments:8},scene);head.position=p.add(new Vector3(0,1.85,0));head.material=m.brick;return body;};
const createBench=(scene:Scene,name:string,p:Vector3,m:any,rot=0)=>{const seat=box(scene,`${name}-seat`,p.add(new Vector3(0,.55,0)),new Vector3(4,.18,1),m.furniture,true);seat.rotation.y=rot;const back=box(scene,`${name}-back`,p.add(new Vector3(0,1,.45)),new Vector3(4,.9,.18),m.furniture,true);back.rotation.y=rot;};
const createTrashBin=(scene:Scene,name:string,p:Vector3,m:any)=>cyl(scene,name,p.add(new Vector3(0,.55,0)),.75,1.1,m.dark,true);
const createSign=(scene:Scene,name:string,text:string,p:Vector3,m:any)=>{cyl(scene,`${name}-post`,p.add(new Vector3(0,1.35,0)),.16,2.7,m.concrete,false);box(scene,`${name}-board`,p.add(new Vector3(0,2.8,0)),new Vector3(5,.12,2.2),m.dark,false);createLabel(scene,text,p.add(new Vector3(0,3.15,-.12)),14,2.2);};
const createOfficeCluster=(scene:Scene,name:string,p:Vector3,m:any)=>{for(let i=0;i<4;i++){box(scene,`${name}-desk-${i}`,p.add(new Vector3((i-1.5)*4,.55,0)),new Vector3(2.4,.18,1.4),m.furniture,true);box(scene,`${name}-monitor-${i}`,p.add(new Vector3((i-1.5)*4,1.05,-.35)),new Vector3(.9,.55,.08),m.dark,false);box(scene,`${name}-chair-${i}`,p.add(new Vector3((i-1.5)*4,.45,1.2)),new Vector3(.7,.9,.7),m.dark,true);}};

export const createCampusScene=(scene:Scene)=>{scene.clearColor=new Color4(.62,.82,1,1);scene.collisionsEnabled=true;scene.gravity=new Vector3(0,-.35,0);new HemisphericLight("现实尺度天空光",new Vector3(.4,1,.2),scene).intensity=.82;const m=createCampusMaterials(scene);
 const ground=MeshBuilder.CreateGround("1200m x 900m 园区地面",{width:campusBounds.width,height:campusBounds.depth},scene);ground.material=m.grass;ground.checkCollisions=true;
 roads.forEach(r=>box(scene,r.name,new Vector3(r.x,.035,r.z),new Vector3(r.width,.07,r.depth),m.road,true));
 box(scene,"北侧围墙",new Vector3(0,1.4,-450),new Vector3(1200,2.8,.4),m.concrete,true); box(scene,"南侧围墙",new Vector3(0,1.4,450),new Vector3(1200,2.8,.4),m.concrete,true); box(scene,"西侧围墙",new Vector3(-600,1.4,0),new Vector3(.4,2.8,900),m.concrete,true); box(scene,"东侧围墙",new Vector3(600,1.4,0),new Vector3(.4,2.8,900),m.concrete,true);
 box(scene,"主入口大门左柱",new Vector3(-20,4.5,-450),new Vector3(2,9,2),m.concrete,true); box(scene,"主入口大门右柱",new Vector3(20,4.5,-450),new Vector3(2,9,2),m.concrete,true); box(scene,"主入口门楣",new Vector3(0,9,-450),new Vector3(46,2,2),m.dark,false); box(scene,"门卫室",new Vector3(42,1.8,-430),new Vector3(14,3.6,10),m.concrete,true); createLabel(scene,"广汽相关产业园 · 主入口",new Vector3(0,13,-452),28,4);
 buildings.forEach(b=>createBuilding(scene,b,m));
 const plaza=MeshBuilder.CreateCylinder("中央景观广场 直径70m",{diameter:70,height:.12,tessellation:64},scene);plaza.position.y=.08;plaza.material=m.path;plaza.checkCollisions=true; const lake=MeshBuilder.CreateCylinder("景观湖 120m x 42m",{diameter:1,height:.08,tessellation:64},scene);lake.position=new Vector3(155,.1,325);lake.scaling=new Vector3(60,1,21);lake.material=m.water;createLabel(scene,"中央广场 / 景观湖",new Vector3(110,8,315),18,3);
 box(scene,"办公区停车场",new Vector3(-250,.04,335),new Vector3(260,.05,70),m.path,true); for(let i=0;i<70;i++){const x=-510+i*15; box(scene,`停车位线-${i}`,new Vector3(x,.08,335),new Vector3(.12,.04,5),m.white,false);} for(let i=0;i<24;i++)createVehicle(scene,`停车场车辆-${i}`,new Vector3(-365+(i%12)*19,0,318+Math.floor(i/12)*28),m,"car",Math.PI/2);
 [[-105,-382,0],[80,-382,0],[255,3,Math.PI/2],[362,136,Math.PI/2],[-515,28,Math.PI/2],[420,-382,0]].forEach(([x,z,r],i)=>createVehicle(scene,`园区道路车辆-${i}`,new Vector3(x as number,0,z as number),m,i%3===1?"truck":"car",r as number));
 for(let i=0;i<34;i++){const x=-210+(i%9)*52,z=-18+Math.floor(i/9)*92;createPedestrian(scene,`园区行人-${i}`,new Vector3(x,0,z),m,(i%6)*.6);}
 for(let x=-520;x<=520;x+=80){box(scene,`主干道路灯-${x}`,new Vector3(x,4,10),new Vector3(.35,8,.35),m.concrete,false);box(scene,`路灯灯头-${x}`,new Vector3(x,8.2,10),new Vector3(3,.25,.5),m.white,false);}
 [-420,-260,-100,100,260,420].forEach((x,i)=>{createSign(scene,`园区导览牌-${i}`,i%2?"仓储物流 / 生产区":"访客中心 / 办公区",new Vector3(x,0,-22),m);createTrashBin(scene,`分类垃圾桶-${i}`,new Vector3(x+14,0,-18),m);});
 [[-38,0],[38,0],[-18,28],[18,28]].forEach(([x,z],i)=>createBench(scene,`中央广场长椅-${i}`,new Vector3(x,0,z),m,i<2?0:Math.PI/2));
 createOfficeCluster(scene,"总部开放办公区",new Vector3(0,0,-287),m); createOfficeCluster(scene,"研发样机办公区",new Vector3(75,0,72),m);
 for(let i=0;i<12;i++)createVehicle(scene,`仓储叉车-${i}`,new Vector3(225+(i%4)*28,0,97+Math.floor(i/4)*22),m,"forklift",Math.PI/2);
 for(let i=0;i<36;i++)box(scene,`室外托盘货物-${i}`,new Vector3(190+(i%9)*18,.65,124+Math.floor(i/9)*14),new Vector3(5,1.3,4),i%2?m.furniture:m.equipment,true);
 for(let i=0;i<96;i++){const a=i/96*Math.PI*2,rx=i%2?510:455,rz=i%3?380:325; const x=Math.cos(a)*rx,z=Math.sin(a)*rz; const trunk=MeshBuilder.CreateCylinder(`树干实例源-${i}`,{diameter:.55,height:2.8},scene);trunk.position=new Vector3(x,1.4,z);trunk.material=m.trunk;trunk.checkCollisions=true; const crown=MeshBuilder.CreateSphere(`树冠实例源-${i}`,{diameter:4.6,segments:10},scene);crown.position=new Vector3(x,4.1,z);crown.material=m.crown;}
 box(scene,"100m比例尺",new Vector3(-520,.12,425),new Vector3(100,.12,2),m.white,false);createLabel(scene,"100m 比例尺（1 Babylon单位 = 1米）",new Vector3(-470,7,425),28,4);
 return {materials:m,buildings};};
