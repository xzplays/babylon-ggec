import { Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { CampusMaterials } from "../materials/materials";
import { createLabel } from "../utils/label";
import { FLOOR_THICKNESS, MIN_INTERIOR_CLEAR_HEIGHT } from "../player/playerConstants";
import { BuildingSpec } from "./buildingTypes";
import { createBoxMesh } from "../utils/meshFactory";
const box=(scene:Scene,n:string,p:Vector3,s:Vector3,m:any,c=true,walkable=false,blocksCamera=c)=>createBoxMesh(scene,{name:n,position:p,scaling:s,material:m,collides:c,walkable,blocksCamera});
const facade=(t:BuildingSpec,m:CampusMaterials)=> t.type==="office"||t.type==="research"?m.glass:t.type==="dormitory"?m.brick:t.type==="amenity"?m.brick:t.type==="factory"||t.type==="warehouse"||t.type==="logistics"?m.steel:m.concrete;
export const createBuilding=(scene:Scene,spec:BuildingSpec,m:CampusMaterials)=>{
 const {x,z}=spec.position,{width:w,depth:d,height:h}=spec.size,fh=spec.floorHeight,mat=facade(spec,m),door=spec.entrances[0];
 const meshes:Mesh[]=[]; const add=(n:string,p:Vector3,s:Vector3,ma:any,c=true,walkable=false,blocksCamera=c)=>meshes.push(box(scene,`${spec.id}-${n}`,p,s,ma,c,walkable,blocksCamera));
 add("ground-floor",new Vector3(x,.08,z),new Vector3(w,FLOOR_THICKNESS,d),m.floor,false,true,false);
 for(let f=1;f<spec.floors;f++) add(`level-${f+1}-slab`,new Vector3(x,f*fh,z),new Vector3(w-1.2,FLOOR_THICKNESS,d-1.2),m.floor,false,true,false);
 add("roof",new Vector3(x,h+.25,z),new Vector3(w+1.4,.5,d+1.4),m.roof,false);
 add("north-wall",new Vector3(x,h/2,z-d/2),new Vector3(w,h,.35),mat,true); add("west-wall",new Vector3(x-w/2,h/2,z),new Vector3(.35,h,d),mat,true); add("east-wall",new Vector3(x+w/2,h/2,z),new Vector3(.35,h,d),mat,true);
 const dw=door.width; add("south-wall-left",new Vector3(x-(w+dw)/4,h/2,z+d/2),new Vector3((w-dw)/2,h,.35),mat,true); add("south-wall-right",new Vector3(x+(w+dw)/4,h/2,z+d/2),new Vector3((w-dw)/2,h,.35),mat,true); add("entrance-lintel",new Vector3(x,door.height+(h-door.height)/2,z+d/2),new Vector3(dw,h-door.height,.35),mat,true);
 add("entry-marker",new Vector3(x,.05,z+d/2+3),new Vector3(dw,.08,2.6),m.marker,false); add("canopy",new Vector3(x,door.height+.35,z+d/2+2),new Vector3(dw+3,.28,4.6),m.roof,false);
 for(let f=0;f<spec.floors;f++){const y=f*fh+Math.min(2.5,fh*.55); for(let i=-Math.floor(w/16);i<=Math.floor(w/16);i++){ if(Math.abs(i*8)<dw/2&&f===0)continue; add(`front-window-${f}-${i}`,new Vector3(x+i*8,y,z+d/2+.2),new Vector3(3.2,1.6,.08),m.glass,false);} for(let j=-Math.floor(d/18);j<=Math.floor(d/18);j++){add(`side-window-e-${f}-${j}`,new Vector3(x+w/2+.2,y,z+j*9),new Vector3(.08,1.5,3),m.glass,false); add(`side-window-w-${f}-${j}`,new Vector3(x-w/2-.2,y,z+j*9),new Vector3(.08,1.5,3),m.glass,false);}}
 if(spec.hasStairs){
  const sx=x-w/2+12, sz=z-d/2+14, stairWidth=2.2, tread=.30, riser=.16, landing=2.0, railH=1.0;
  add("stairwell-west-wall",new Vector3(sx-5,h/2,sz),new Vector3(.3,h,16),m.innerWall,true,false,true);
  add("stairwell-north-wall",new Vector3(sx,h/2,sz-8),new Vector3(10,h,.3),m.innerWall,true,false,true);
  for(let f=0;f<spec.floors-1;f++){
    const base=f*fh, half=fh/2, run=half/riser*tread, angle=Math.atan2(half,run);
    const ramp1=box(scene,`${spec.id}-stair-ramp-collider-${f+1}-a`,new Vector3(sx-run/2,base+half/2,sz-2.2),new Vector3(run,.18,stairWidth),m.concrete,true,true,false); ramp1.rotation.z=-angle; ramp1.isVisible=false; meshes.push(ramp1);
    const ramp2=box(scene,`${spec.id}-stair-ramp-collider-${f+1}-b`,new Vector3(sx-run/2,base+half+half/2,sz+2.2),new Vector3(run,.18,stairWidth),m.concrete,true,true,false); ramp2.rotation.z=angle; ramp2.isVisible=false; meshes.push(ramp2);
    add(`stair-landing-${f+1}-mid`,new Vector3(sx-run,base+half,sz),new Vector3(landing,.18,6.2),m.concrete,true,true,false);
    add(`stair-landing-${f+1}-top`,new Vector3(sx,base+fh,sz+2.2),new Vector3(landing,.18,3.0),m.concrete,true,true,false);
    for(let i=0;i<Math.min(26,Math.floor(half/riser));i++){add(`stair-step-${f+1}-a-${i}`,new Vector3(sx-i*tread,base+i*riser,sz-2.2),new Vector3(tread,.12,stairWidth),m.concrete,false,false,false); add(`stair-step-${f+1}-b-${i}`,new Vector3(sx-run+i*tread,base+half+i*riser,sz+2.2),new Vector3(tread,.12,stairWidth),m.concrete,false,false,false);}
    add(`stair-handrail-${f+1}-a`,new Vector3(sx-run/2,base+half/2+railH,sz-3.55),new Vector3(run,.12,.12),m.dark,true,false,true);
    add(`stair-handrail-${f+1}-b`,new Vector3(sx-run/2,base+half+half/2+railH,sz+3.55),new Vector3(run,.12,.12),m.dark,true,false,true);
  }
 }
 if(spec.hasElevator){const ex=x+w/2-10,ez=z-d/2+12; add("elevator-back-wall",new Vector3(ex,h/2,ez-2),new Vector3(4,h,.25),m.innerWall,true,false,true); add("elevator-left-wall",new Vector3(ex-2,h/2,ez),new Vector3(.25,h,4),m.innerWall,true,false,true); add("elevator-right-wall",new Vector3(ex+2,h/2,ez),new Vector3(.25,h,4),m.innerWall,true,false,true); for(let f=0;f<spec.floors;f++){add(`elevator-lobby-platform-${f+1}`,new Vector3(ex,f*fh+.04,ez+3.2),new Vector3(6,.08,3.2),m.floor,false,true,false); add(`elevator-door-${f+1}`,new Vector3(ex,f*fh+1.2,ez+2.05),new Vector3(1.5,2.4,.1),m.glass,false,false,false); add(`elevator-button-panel-${f+1}`,new Vector3(ex+1.25,f*fh+1.25,ez+2.12),new Vector3(.28,.8,.06),m.dark,false,false,false);}}
 if(spec.type==="factory"){for(let i=-2;i<=2;i++) add(`production-line-${i}`,new Vector3(x+i*w/7,1.1,z),new Vector3(w*.07,2.2,d*.55),m.equipment,true); add("crane-beam",new Vector3(x,h-2,z),new Vector3(w*.75,.6,.8),m.equipment,false); for(let i=-2;i<=2;i++) add(`skylight-${i}`,new Vector3(x+i*w/6,h+.55,z),new Vector3(5,.12,d*.7),m.glass,false);}
 if(spec.type==="warehouse"||spec.type==="logistics"){add("loading-platform",new Vector3(x,.65,z+d/2+6),new Vector3(w*.85,1.3,6),m.concrete,true,true,false); for(let i=-3;i<=3;i++) add(`rack-${i}`,new Vector3(x+i*w/9,2.5,z),new Vector3(3,5,d*.6),m.equipment,true);}
 if(spec.type==="office"||spec.type==="research"){add("lobby-desk",new Vector3(x,.55,z+d*.22),new Vector3(9,1.1,1.4),m.furniture,true); for(let i=-2;i<=2;i++) add(`room-partition-${i}`,new Vector3(x+i*w/6,1.8,z),new Vector3(.25,MIN_INTERIOR_CLEAR_HEIGHT,d*.55),m.innerWall,true);}
 if(spec.type==="dormitory"){for(let i=-3;i<=3;i++) add(`balcony-${i}`,new Vector3(x+i*w/8,2.2,z+d/2+1.2),new Vector3(5,.18,1.8),m.concrete,false);}
 if(spec.type==="amenity"){for(let i=-3;i<=3;i++) add(`dining-table-${i}`,new Vector3(x+i*8,.45,z),new Vector3(3,.8,1.5),m.furniture,true); add("kitchen-zone",new Vector3(x,1.5,z-d*.25),new Vector3(w*.65,3,.35),m.innerWall,true);}
 createLabel(scene,spec.name,new Vector3(x,h+4,z)); createLabel(scene,`${spec.zone} · ${spec.floors}层 · ${w}×${d}×${h}m`,new Vector3(x,3.5,z+d*.2),16,3);
 return meshes;
};
