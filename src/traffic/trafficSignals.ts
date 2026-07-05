export type TrafficSignal = { id:string; routeId:string; x:number; z:number; cycle:number; green:number };
export const trafficSignals: TrafficSignal[] = [{id:"main-gate-crosswalk", routeId:"city-eastbound", x:0, z:-520, cycle:24, green:15},{id:"main-gate-crosswalk-west", routeId:"city-westbound", x:0, z:-560, cycle:24, green:15}];
export const isGreen = (s:TrafficSignal,t:number)=> (t%s.cycle)<s.green;
