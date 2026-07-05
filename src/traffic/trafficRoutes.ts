import { routePoint, TrafficRoute } from "./pathTypes";
export const pedestrianRoutes: TrafficRoute[] = [
 { id:"main-visitor", label:"主入口至访客中心", kind:"pedestrian", loop:"pingpong", points:[routePoint(0,-440),routePoint(0,-392),routePoint(0,-330),routePoint(0,-262),routePoint(45,-255)]},
 { id:"parking-office", label:"停车场至办公楼", kind:"pedestrian", loop:"pingpong", points:[routePoint(-250,335),routePoint(-190,245),routePoint(-80,120),routePoint(0,-80),routePoint(0,-255)]},
 { id:"canteen-dorm", label:"食堂宿舍通勤", kind:"pedestrian", loop:"loop", points:[routePoint(90,255),routePoint(35,245),routePoint(-35,245),routePoint(-135,245),routePoint(-135,310),routePoint(-35,310)]},
 { id:"rd-plaza", label:"研发楼至中央广场", kind:"pedestrian", loop:"pingpong", points:[routePoint(75,28),routePoint(40,18),routePoint(0,0),routePoint(-40,18),routePoint(-52,62)]},
 { id:"city-sidewalk", label:"园区外城市人行道", kind:"pedestrian", loop:"pingpong", points:[routePoint(-560,-520),routePoint(-360,-520),routePoint(-160,-520),routePoint(40,-520),routePoint(260,-520),routePoint(560,-520)]},
 { id:"crosswalk", label:"主入口斑马线", kind:"pedestrian", loop:"pingpong", points:[routePoint(-35,-520),routePoint(-20,-495),routePoint(0,-470),routePoint(20,-495),routePoint(35,-520)]}
];
export const vehicleRoutes: TrafficRoute[] = [
 { id:"city-eastbound", label:"外部道路东向车流", kind:"vehicle", loop:"loop", points:[routePoint(-650,-505),routePoint(650,-505),routePoint(650,-535),routePoint(-650,-535)]},
 { id:"city-westbound", label:"外部道路西向车流", kind:"vehicle", loop:"loop", points:[routePoint(650,-545),routePoint(-650,-545),routePoint(-650,-575),routePoint(650,-575)]},
 { id:"gate-in", label:"主入口进园", kind:"vehicle", loop:"loop", points:[routePoint(-160,-535),routePoint(-35,-535),routePoint(-18,-445),routePoint(-18,-390),routePoint(-130,-390),routePoint(-300,-390),routePoint(-360,318),routePoint(-270,318),routePoint(-18,-390)]},
 { id:"campus-ring", label:"园区主干道环线", kind:"vehicle", loop:"loop", points:[routePoint(-520,-390),routePoint(520,-390),routePoint(540,0),routePoint(520,390),routePoint(-520,390),routePoint(-540,0)]},
 { id:"parking-loop", label:"停车场出入口", kind:"vehicle", loop:"loop", points:[routePoint(-310,390),routePoint(-310,335),routePoint(-170,335),routePoint(-170,390)]},
 { id:"logistics-truck", label:"物流货车路线", kind:"vehicle", loop:"loop", points:[routePoint(520,-390),routePoint(520,140),routePoint(410,140),routePoint(410,185),routePoint(280,185),routePoint(330,140)]},
 { id:"warehouse-forklift", label:"仓储叉车短驳", kind:"vehicle", loop:"pingpong", points:[routePoint(200,110),routePoint(255,110),routePoint(330,130),routePoint(380,160)]}
];
