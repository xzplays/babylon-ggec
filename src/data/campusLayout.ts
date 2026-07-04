import { BuildingSpec, validateBuildingSpec } from "../buildings/buildingTypes";
export const CAMPUS_SCALE = 1;
export const campusBounds = { width: 1200, depth: 900 };
export const zones = ["一期厂房区", "二期生产区", "仓储物流区", "总部办公区", "研发测试区", "生活配套区"] as const;
const southDoor = (width = 4, height = 3.2, label = "主入口") => [{ side: "south" as const, offset: 0, width, height, label }];
const dockDoors = (n: number) => Array.from({ length: n }, (_, i) => ({ side: "south" as const, offset: (i - (n - 1) / 2) * 14, width: 5.2, height: 4.8, label: `装卸门${i + 1}` }));
export const buildings: BuildingSpec[] = [
...[[-430,-235],[-330,-235],[-230,-235],[-430,-125],[-330,-125],[-230,-125],[-430,35],[-330,35],[-230,35],[-430,145],[-330,145],[-230,145]].map(([x,z],i)=>validateBuildingSpec({id:`a${i+1}`,name:`一期轻钢厂房A${i+1}`,zone:"一期厂房区",type:i%3===2?"warehouse":"factory",position:{x,z},size:{width:82,depth:58,height:16},floors:2,floorHeight:8,entrances:i%3===2?dockDoors(3):southDoor(5.2,4.6,"卷帘门"),hasElevator:false,hasStairs:true,description:i%3===2?"一期物料周转与线边仓。":"一期大跨度轻钢生产厂房。",features:i%3===2?["高位货架","装卸月台","叉车通道"]:["大跨度结构","卷帘门","屋顶采光带","生产线"]})),
validateBuildingSpec({id:"p2-core",name:"二期核心生产厂房",zone:"二期生产区",type:"factory",position:{x:190,z:-195},size:{width:150,depth:100,height:36},floors:4,floorHeight:9,entrances:southDoor(6,5,"核心生产入口"),hasElevator:true,hasStairs:true,description:"二期核心设备与总装厂房。",features:["重型设备","行车梁","屋顶排风","参观通道"]}),
validateBuildingSpec({id:"p2-auto",name:"二期自动化厂房",zone:"二期生产区",type:"factory",position:{x:370,z:-195},size:{width:118,depth:92,height:27},floors:3,floorHeight:9,entrances:southDoor(6,5,"自动化入口"),hasElevator:true,hasStairs:true,description:"自动化产线与机器人测试区。",features:["机器人产线","设备间","采光窗"]}),
validateBuildingSpec({id:"wh-finished",name:"成品仓储中心",zone:"仓储物流区",type:"warehouse",position:{x:270,z:55},size:{width:140,depth:90,height:24},floors:3,floorHeight:8,entrances:dockDoors(5),hasElevator:true,hasStairs:true,description:"成品高位货架仓储。",features:["高位货架","货车月台","雨棚"]}),
validateBuildingSpec({id:"logistics",name:"物流装卸中心",zone:"仓储物流区",type:"logistics",position:{x:385,z:185},size:{width:118,depth:76,height:16},floors:2,floorHeight:8,entrances:dockDoors(4),hasElevator:false,hasStairs:true,description:"货运调度、装卸与发运。",features:["物流通道","货车位","调度室"]}),
validateBuildingSpec({id:"hq",name:"总部行政办公楼",zone:"总部办公区",type:"office",position:{x:0,z:-295},size:{width:92,depth:62,height:32},floors:8,floorHeight:4,entrances:southDoor(3.2,3.2,"办公大堂"),hasElevator:true,hasStairs:true,description:"总部接待、会议与行政办公。",features:["玻璃幕墙","入口雨棚","前台","会议室"]}),
validateBuildingSpec({id:"rd",name:"研发测试中心",zone:"研发测试区",type:"research",position:{x:75,z:65},size:{width:96,depth:70,height:28},floors:7,floorHeight:4,entrances:southDoor(3.2,3.2,"研发大厅"),hasElevator:true,hasStairs:true,description:"声学实验、可靠性测试与样机研发。",features:["实验室","测试间","设备间","分隔房间"]}),
...[[-135,285],[-35,285]].map(([x,z],i)=>validateBuildingSpec({id:`dorm-${i+1}`,name:`员工宿舍楼${i+1}`,zone:"生活配套区",type:"dormitory",position:{x,z},size:{width:78,depth:50,height:28.8},floors:8,floorHeight:3.6,entrances:southDoor(2.4,2.8,"宿舍门厅"),hasElevator:true,hasStairs:true,description:"员工宿舍与公共活动空间。",features:["重复窗户","阳台走廊","房间隔断"]})),
validateBuildingSpec({id:"canteen",name:"食堂及生活配套楼",zone:"生活配套区",type:"amenity",position:{x:90,z:285},size:{width:92,depth:58,height:14.4},floors:4,floorHeight:3.6,entrances:southDoor(3.6,3,"食堂入口"),hasElevator:true,hasStairs:true,description:"食堂、便利服务与活动空间。",features:["餐厅大厅","餐桌","厨房服务区"]})
];
export const roads = [
 {name:"北环路",x:0,z:-390,width:1080,depth:12},{name:"南环路",x:0,z:390,width:1080,depth:12},{name:"西环路",x:-540,z:0,width:12,depth:780},{name:"东环路",x:540,z:0,width:12,depth:780},{name:"中央主干道",x:0,z:0,width:1040,depth:14},{name:"南北主干道",x:0,z:0,width:14,depth:760},{name:"一期支路",x:-330,z:-70,width:330,depth:8},{name:"物流支路",x:330,z:140,width:300,depth:8},{name:"生活区步道",x:-20,z:245,width:300,depth:6}
];
