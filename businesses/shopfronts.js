import {snapshot} from './osm-snapshot.js';
import {placements} from './placements.js';
import {businessOverrides} from './overrides.js';
import {shopfrontStyle as style} from './style.js';
export function createBusinessFrontages(THREE,api){
 const {shared,convertPosition,findNearestRoadPoint,roadWidthForType,inPolygon,terrainHeight}=api;
 const byBuilding=new Map(),materials=new Map(),seen=new Set(),used=new Set(),skipped=new Map();
 for(const source of snapshot.elements){
  const id=source.type+'/'+source.id,override=businessOverrides[id]||{},placement=placements[id];
  if(!placement||override.hidden)continue;
  const tags=source.tags,name=(override.name??tags.name??'').trim(),key=name.toLocaleLowerCase();
  if(!name||seen.has(key)||['vacant','no','closed'].includes(tags.shop)||Object.keys(tags).some(k=>k.startsWith('disused:')||k.startsWith('abandoned:')))continue;
  seen.add(key);const entry={...source,...placement,...override,id,name};
  if(!byBuilding.has(entry.buildingId))byBuilding.set(entry.buildingId,[]);byBuilding.get(entry.buildingId).push(entry);
 }
 function material(e){
  if(materials.has(e.id))return materials.get(e.id);
  const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle=e.colour||style.colours[e.tags.amenity]||style.colours.shop;ctx.fillRect(0,0,768,128);
  ctx.strokeStyle=style.border;ctx.lineWidth=3;ctx.strokeRect(7,7,754,114);
  ctx.fillStyle=style.ink;ctx.font=style.font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.name,384,65,728);
  const texture=shared(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;
  const m=shared(new THREE.MeshStandardMaterial({map:texture,roughness:.92}));materials.set(e.id,m);return m;
 }
 function attach(group,poly,buildingId,marine=false){
  const entries=byBuilding.get(buildingId);if(!entries)return;
  const layer=new THREE.Group();layer.name='Independent business signs';const occupied=[];
  for(const e of entries){
   const p=convertPosition(e.lat,e.lon);let best=null;
   if(marine){
    const xs=poly.outer.map(v=>v.x),zs=poly.outer.map(v=>v.y),x=p.x,z=Math.max(...zs);
    if(x<Math.min(...xs)+3||x>Math.max(...xs)-12)continue;
    best={x,z,nx:0,nz:1,length:6,score:0};
   }else for(let i=0;i<poly.outer.length;i++){
    if(e.edgeIndex!==undefined&&e.edgeIndex!==i)continue;
    const a=poly.outer[i],b=poly.outer[(i+1)%poly.outer.length],dx=b.x-a.x,dz=b.y-a.y,length=Math.hypot(dx,dz);if(length<2)continue;
    const width=Math.min(e.width??style.width,length-.6),margin=(width/2+.25)/length;
    const t=THREE.MathUtils.clamp(e.along??((p.x-a.x)*dx+(p.z-a.y)*dz)/(length*length),margin,1-margin);
    const x=a.x+dx*t,z=a.y+dz*t,road=findNearestRoadPoint({x,z},true);if(!road||road.distance>28)continue;
    let nx=-dz/length,nz=dx/length;if(nx*(road.point.x-x)+nz*(road.point.z-z)<0){nx=-nx;nz=-nz}
    if(inPolygon(x+nx*.5,z+nz*.5,poly))continue;
    const score=road.distance+Math.hypot(p.x-x,p.z-z)*.35;
    if(!best||score<best.score)best={x,z,nx,nz,length,score,edgeIndex:i};
   }
   if(!best){skipped.set(e.id,'No clear street-facing wall');continue}
   const width=Math.min(e.width??style.width,best.length-.6),{nx,nz}=best;
   const offset=e.wallOffset??style.wallOffset;
   const x=best.x+nx*offset,z=best.z+nz*offset;
   const clear=[-.5,0,.5].every(t=>{const r=findNearestRoadPoint({x:x+nz*width*t,z:z-nx*width*t},true);return r&&r.distance>roadWidthForType(r.segment.type)/2+.5});
   if(!clear||occupied.some(o=>Math.hypot(o.x-x,o.z-z)<(o.width+width)/2+.25)){skipped.set(e.id,'Road clearance or overlapping sign');continue}
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(width,style.height),material(e));
   const base=marine?terrainHeight((Math.min(...poly.outer.map(v=>v.x))+Math.max(...poly.outer.map(v=>v.x)))/2,Math.max(...poly.outer.map(v=>v.y))):Math.max(...poly.outer.map(v=>terrainHeight(v.x,v.y)));
   sign.position.set(x,base+(e.mountingHeight??style.mountingHeight),z);sign.rotation.y=Math.atan2(nx,nz);
   sign.name=e.name;sign.userData={businessId:e.id,buildingId,width,edgeIndex:best.edgeIndex};layer.add(sign);occupied.push({x,z,width});used.add(e.id);
  }
  if(layer.children.length)group.add(layer);
 }
 function queue(tile,poly,id){if(byBuilding.has(id))(tile.businessFrontages??=[]).push({poly,id})}
 function finish(tile){for(const {poly,id} of tile.businessFrontages||[])attach(tile.group,poly,id);tile.businessFrontages=[]}
 return {queue,finish,attach,used,skipped,materials,byBuilding};
}
