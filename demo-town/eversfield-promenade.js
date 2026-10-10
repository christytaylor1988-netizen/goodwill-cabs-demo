import {addEversfieldFurniture} from "./eversfield-furniture.js?v=local-4";
import {seafrontRailingMaterial} from "./seafront-railing.js";
// A local Eversfield study. Geometry shares the coast cross-section, not an overlay.
export function createEversfield(THREE,{shared,registerBarrier,convertPosition,terrainHeight,paving,bottleAlley}){
 const west=convertPosition(50.85,.5623).x,east=convertPosition(50.85,.5718).x;
 const blend=x=>THREE.MathUtils.smoothstep(x,west,west+18)*(1-THREE.MathUtils.smoothstep(x,east-18,east));
 function height(r,z,base){
  // The surrounding pavement stays at street level even alongside the ramps.
  // The corridor mask leaves descent solely to Bottle Alley's own floor.
  if(r.x>=bottleAlley.west&&r.x<=bottleAlley.east)return bottleAlley.level+3.35;
  return THREE.MathUtils.lerp(base,terrainHeight(r.x,z)+.025,blend(r.x));
 }
 const previous=paving.onBeforeCompile;
 paving.onBeforeCompile=s=>{previous?.(s);s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 eversfieldXZ;varying float eversfieldUp;').replace('#include <begin_vertex>','#include <begin_vertex>\neversfieldXZ=(modelMatrix*vec4(position,1.)).xz;eversfieldUp=abs((mat3(modelMatrix)*normal).y);');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 eversfieldXZ;varying float eversfieldUp;').replace('#include <color_fragment>',`#include <color_fragment>
 float localBlend=smoothstep(${west.toFixed(3)},${(west+18).toFixed(3)},eversfieldXZ.x)*(1.-smoothstep(${(east-18).toFixed(3)},${east.toFixed(3)},eversfieldXZ.x));
 vec2 tile=eversfieldXZ/1.45;float checker=mod(floor(tile.x)+floor(tile.y),2.);vec2 seam=abs(fract(tile)-.5);float joint=smoothstep(.477,.496,max(seam.x,seam.y));
 vec3 slab=mix(vec3(.50,.32,.29),vec3(.63,.62,.56),checker);slab=mix(slab,vec3(.40,.39,.35),joint*.55);slab=mix(vec3(.46,.43,.37),slab,smoothstep(.4,.9,eversfieldUp));diffuseColor.rgb=mix(diffuseColor.rgb,slab*(.94+.06*sin(tile.x*7.1+tile.y*13.4)),localBlend);`)};paving.customProgramCacheKey=()=> 'eversfield-chequered-v1';
 function decorate(rows,parent){
  const group=new THREE.Group();group.name='Eversfield planted promenade';parent.add(group);
  const batches=new Map(),boxGeo=new THREE.BoxGeometry(1,1,1),roundGeo=new THREE.IcosahedronGeometry(1,1),leafGeo=new THREE.ConeGeometry(.14,1,3),trunkGeo=new THREE.CylinderGeometry(.09,.13,1,6);
  const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:1}));
  const stone=mat(0x817964),soil=mat(0x4d4b36),cream=mat(0xe2dfca),glass=mat(0x91a4a0),wood=mat(0x51443b),roof=mat(0xb9b7a5),iron=seafrontRailingMaterial(THREE,shared),greens=[0x526740,0x718145,0x3f6147,0x8d954a].map(mat);
  const dummy=new THREE.Object3D();
  function add(geo,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){let byMat=batches.get(geo);if(!byMat)batches.set(geo,byMat=new Map());let list=byMat.get(material);if(!list)byMat.set(material,list=[]);dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();list.push(dummy.matrix.clone());}
  const box=(m,x,y,z,w,h,d)=>add(boxGeo,m,x,y,z,w,h,d);
  const rowAt=x=>rows.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);
  const ground=(r,z)=>height(r,z,Math.max(.8,terrainHeight(r.x,z)+.025-.45*THREE.MathUtils.smoothstep(z-r.edge,0,4)));
  const furniture=addEversfieldFurniture(THREE,{group,rows,west,east,ground,add,boxGeo,roundGeo,mat,cream,glass,wood,iron,stone,soil,greens,registerBarrier,convertPosition,bottleAlley});
  // Slim pale seaward rails leave the beach and horizon readable.
  for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];if(a.x<west+18||b.x>east-18)continue;if(bottleAlley?.opening(a.x,a.prom,1)||bottleAlley?.opening(b.x,b.prom,1))continue;registerBarrier({x:a.x,z:a.prom},{x:b.x,z:b.prom},.06);const ya=ground(a,a.prom),yb=ground(b,b.prom),dx=b.x-a.x,dz=b.prom-a.prom,len=Math.hypot(dx,dz),angle=Math.atan2(-dz,dx);for(const h of [.52,1.02])add(boxGeo,iron,(a.x+b.x)/2,(ya+yb)/2+h,(a.prom+b.prom)/2,len,.045,.045,0,angle,Math.atan2(yb-ya,len));if(i%2===0){box(iron,a.x,ya+.58,a.prom,.11,1.16,.11);add(roundGeo,iron,a.x,ya+1.22,a.prom,.085,.085,.085);box(iron,a.x,ya+.06,a.prom,.17,.1,.17)}}
  for(const [geo,materials] of batches)for(const [material,matrices] of materials){const mesh=new THREE.InstancedMesh(geo,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh)}
  group.userData=furniture;return group;
 }
 return {west,east,blend,height,decorate};
}
