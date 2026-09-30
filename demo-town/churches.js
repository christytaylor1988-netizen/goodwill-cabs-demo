import {churchStyles} from './church-styles.js';
export function createChurches(THREE,api){
 const {shared,inPolygon,polygonShape,findNearestRoadPoint}=api,used=new Map(),mats=new Map();
 function mat(c){if(!mats.has(c))mats.set(c,shared(new THREE.MeshStandardMaterial({color:c,roughness:.95})));return mats.get(c)}
 const roof=mat(0x505b5d),glass=mat(0x293d4a),trim=mat(0xc2baa3),door=mat(0x403c36);
 function box(g,w,h,d,x,y,z,m,angle=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.y=angle;o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function arch(g,x,y,z,w,h,angle,m){const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(w/2,h*.64);sh.quadraticCurveTo(w*.32,h*.88,0,h);sh.quadraticCurveTo(-w*.32,h*.88,-w/2,h*.64);sh.closePath();const o=new THREE.Mesh(new THREE.ShapeGeometry(sh,5),m);o.position.set(x,y,z);o.rotation.y=angle;g.add(o)}
 function decorate(poly,tags,id,tile){
  if(!['church','chapel','cathedral'].includes(tags.building)||id===984233110||/hall/i.test(tags.name||''))return false;
  const cfg=churchStyles[id]||{kind:tags.building==='chapel'?'chapel':'gothic',height:8+(id%3),stone:[0xa39580,0x9b998d,0xa4816a][id%3]},stone=mat(cfg.stone),g=tile.group,h=cfg.height;
  const wall=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:h,bevelEnabled:false});wall.rotateX(Math.PI/2);const mesh=new THREE.Mesh(wall,[roof,stone]);mesh.position.y=h;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
  // Fit a longitudinal nave and steep gable to the mapped footprint's oriented bounds.
  let bounds=null;
  for(let i=0;i<poly.outer.length;i++){const a=poly.outer[i],b=poly.outer[(i+1)%poly.outer.length],angle=Math.atan2(b.y-a.y,b.x-a.x),c=Math.cos(angle),s=Math.sin(angle),us=poly.outer.map(p=>p.x*c+p.y*s),vs=poly.outer.map(p=>-p.x*s+p.y*c),u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs),area=(u1-u0)*(v1-v0);if(!bounds||area<bounds.area)bounds={angle,u0,u1,v0,v1,area}}
  let {angle,u0,u1,v0,v1}=bounds;if(u1-u0<v1-v0){angle+=Math.PI/2;const old=[u0,u1,v0,v1];[u0,u1,v0,v1]=[old[2],old[3],-old[1],-old[0]]}
  const c=Math.cos(angle),s=Math.sin(angle),uc=(u0+u1)/2,vc=(v0+v1)/2,L=(u1-u0)*.91,W=(v1-v0)*(cfg.kind==='chapel'?.87:.65),rise=cfg.kind==='modern'?1.8:Math.min(7,W*.52);
  const point=(u,v,y)=>[(uc+u)*c-(vc+v)*s,y,(uc+u)*s+(vc+v)*c];
  const verts=[],tri=(a,b,c)=>verts.push(...a,...b,...c);
  const a=point(-L/2,-W/2,h),b=point(L/2,-W/2,h),d=point(-L/2,W/2,h),e=point(L/2,W/2,h),r=point(-L/2,0,h+rise),q=point(L/2,0,h+rise);
  tri(a,r,q);tri(a,q,b);tri(d,e,q);tri(d,q,r);tri(a,d,r);tri(b,q,e);const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));rg.computeVertexNormals();const rm=new THREE.Mesh(rg,roof);rm.material=roof;rm.castShadow=true;g.add(rm);
  for(let i=0;i<poly.outer.length;i++){
   const a=poly.outer[i],b=poly.outer[(i+1)%poly.outer.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<4)continue;let nx=-dz/len,nz=dx/len;const mid={x:(a.x+b.x)/2,z:(a.y+b.y)/2};if(inPolygon(mid.x+nx*.3,mid.z+nz*.3,poly)){nx=-nx;nz=-nz}const rot=Math.atan2(nx,nz),count=Math.min(5,Math.floor(len/4));
   for(let j=0;j<count;j++){const t=(j+.5)/count,x=a.x+dx*t,z=a.y+dz*t,w=Math.min(1.7,len/count*.42),wh=h*.49;
    arch(g,x+nx*.07,h*.3,z+nz*.07,w+.35,wh+.28,rot,trim);arch(g,x+nx*.09,h*.3+.13,z+nz*.09,w,wh,rot,glass);box(g,.07,wh*.75,.03,x+nx*.12,h*.3+.13+wh*.375,z+nz*.12,trim,rot);
    // Buttresses remain mostly inside the original collision footprint.
    if(cfg.kind!=='chapel')box(g,.48,h*.8,.48,x-nz*(w*.8)-nx*.18,h*.4,z+nx*(w*.8)-nz*.18,stone,rot);
   }
  }
  let entrance=null;
  for(let i=0;i<poly.outer.length;i++){const a=poly.outer[i],b=poly.outer[(i+1)%poly.outer.length],len=a.distanceTo(b);if(len<4)continue;const x=(a.x+b.x)/2,z=(a.y+b.y)/2,r=findNearestRoadPoint({x,z},true);if(!r||entrance&&r.distance>=entrance.distance)continue;let nx=-(b.y-a.y)/len,nz=(b.x-a.x)/len;if(inPolygon(x+nx*.3,z+nz*.3,poly)){nx=-nx;nz=-nz}entrance={x,z,nx,nz,distance:r.distance}}
  if(entrance){const {x,z,nx,nz}=entrance,rot=Math.atan2(nx,nz);arch(g,x+nx*.15,.03,z+nz*.15,2.9,4.2,rot,trim);arch(g,x+nx*.17,.05,z+nz*.17,2.35,3.8,rot,door);box(g,.06,2.8,.04,x+nx*.2,1.45,z+nz*.2,trim,rot)}
  if(cfg.tower){
   // Choose a mapped interior square near an end, avoiding additions in roads.
   let tower=null;const size=Math.min(6.5,W*.75);
   for(const u of [-L*.36,L*.36,0])for(const v of [0,-W*.13,W*.13]){const p=point(u,v,0),half=size/2;if([[-1,-1],[-1,1],[1,-1],[1,1]].every(([a,b])=>inPolygon(p[0]+a*half,p[2]+b*half,poly))&&!tower)tower={x:p[0],z:p[2]}}
   if(tower){const {x,z}=tower,th=cfg.tower;box(g,size,th,size,x,th/2,z,stone);box(g,size+.15,.45,size+.15,x,th-.7,z,trim);
    for(let side=0;side<4;side++){const rot=side*Math.PI/2,nx=Math.sin(rot),nz=Math.cos(rot);arch(g,x+nx*(size/2+.04),th-6,z+nz*(size/2+.04),size*.38,4,rot,glass)}
    if(cfg.kind==='spire'){const cone=new THREE.Mesh(new THREE.ConeGeometry(size*.67,cfg.spire,8),roof);cone.position.set(x,th+cfg.spire/2,z);cone.castShadow=true;g.add(cone)}
    else if(cfg.kind==='battlement')for(const xx of [-1,0,1])for(const zz of [-1,0,1])if(xx||zz)box(g,size*.23,1.1,size*.23,x+xx*size*.38,th+.5,z+zz*size*.38,stone);
   }
  }
  used.set(id,{name:tags.name||'Mapped chapel',kind:cfg.kind});return true;
 }
 return {decorate,used};
}
