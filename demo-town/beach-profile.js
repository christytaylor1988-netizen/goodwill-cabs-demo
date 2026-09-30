// Beach-only visual height: relative to the adjacent coastal road, never DEM hills.
export function createBeachProfile({getRoads,convertPosition,terrainHeight,roadWidthForType}){
 let segments=null;
 const names=new Set(['Marina','Grand Parade','Eversfield Place','White Rock','Carlisle Parade','Denmark Place','Pelham Place','East Parade','Rock-a-Nore Road']);
 const cache=new Map();
 function sample(x,z){
  const key=x.toFixed(2)+','+z.toFixed(2);if(cache.has(key))return cache.get(key);
  if(!segments){segments=[];for(const road of getRoads()){if(!names.has(road.tags?.name))continue;const g=road.geometry||[];for(let i=1;i<g.length;i++)segments.push({a:convertPosition(g[i-1].lat,g[i-1].lon),b:convertPosition(g[i].lat,g[i].lon),width:roadWidthForType(road.tags.highway)})}}
  let best=null;
  for(const s of segments){const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,t=Math.max(0,Math.min(1,((x-s.a.x)*dx+(z-s.a.z)*dz)/(dx*dx+dz*dz||1))),px=s.a.x+dx*t,pz=s.a.z+dz*t,d=Math.hypot(x-px,z-pz);if(!best||d<best.d)best={d,x:px,z:pz,width:s.width}}
  const result=best?{height:Math.max(-.10,Math.min(6,terrainHeight(best.x,best.z)-.65)-Math.max(0,best.d-best.width/2-2)*.14),clear:best.d>best.width/2+1}: {height:.08,clear:true};
  cache.set(key,result);return result;
 }
 return {sample,clearCache(){cache.clear()}};
}
