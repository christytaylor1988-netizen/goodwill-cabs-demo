import {scaffoldSites,roadworkSites} from './work-sites.js';
export function createWorks(THREE,api){
 const {shared,terrainHeight,findNearestRoadPoint,roadWidthForType,inPolygon,convertPosition,clearPavement,batchScenery}=api;
 const used=new Set(),skipped=new Map(),byBuilding=new Map(scaffoldSites.map(s=>[s.buildingId,s]));
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.9})),metal=mat(0x7f8580),wood=mat(0x9b8768),orange=mat(0xd88435),cream=mat(0xe5dfc3),dark=mat(0x3a4140),earth=mat(0x615749);
 function box(g,w,h,d,x,y,z,m,angle=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.y=angle;o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 function rod(g,a,b,r=.035){const d=new THREE.Vector3().subVectors(b,a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),5),metal);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o)}
 const signCache=new Map();
 function signMat(label,bg){if(signCache.has(label))return signCache.get(label);const c=document.createElement('canvas');c.width=256;c.height=160;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,256,160);x.strokeStyle='#272b29';x.lineWidth=6;x.strokeRect(5,5,246,150);x.fillStyle='#252b2c';x.font='bold 28px sans-serif';x.textAlign='center';label.split('|').forEach((s,i)=>x.fillText(s,128,52+i*43,235));const t=shared(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;const m=shared(new THREE.MeshStandardMaterial({map:t,roughness:1,side:THREE.DoubleSide}));signCache.set(label,m);return m}
 function board(g,x,z,angle,label){const y=terrainHeight(x,z),p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.85),signMat(label,'#dcb850'));p.position.set(x,y+.9,z);p.rotation.y=angle;g.add(p);box(g,.08,1.4,.08,x-.45*Math.cos(angle),y+.7,z+.45*Math.sin(angle),metal);box(g,.08,1.4,.08,x+.45*Math.cos(angle),y+.7,z-.45*Math.sin(angle),metal)}
 function queue(tile,poly,id){if(byBuilding.has(id))(tile.workFronts??=[]).push({poly,id})}
 function finish(tile){
  const g=new THREE.Group();g.name='Fixed non-blocking maintenance scenery';
  for(const {poly,id} of tile.workFronts||[]){const s=byBuilding.get(id),a=poly.outer[s.edgeIndex],b=poly.outer[(s.edgeIndex+1)%poly.outer.length];if(!a||!b)continue;const len=a.distanceTo(b),x=(a.x+b.x)/2,z=(a.y+b.y)/2,r=findNearestRoadPoint({x,z},true);if(!r)continue;let nx=-(b.y-a.y)/len,nz=(b.x-a.x)/len;if(nx*(r.point.x-x)+nz*(r.point.z-z)<0){nx=-nx;nz=-nz}const width=Math.min(s.width,len-.6),angle=Math.atan2(nx,nz),base=terrainHeight(x,z),h=s.height;
   const p=(u,v,y)=>new THREE.Vector3(x+nz*u+nx*v,base+y,z-nx*u+nz*v);
   if(![-width/2,0,width/2].every(u=>{const q=p(u,.85,0),r=findNearestRoadPoint(q,true);return r&&r.distance>roadWidthForType(r.segment.type)/2+.45})){skipped.set(s.id,'Narrow pavement');continue}
   for(const u of [-width/2,0,width/2])for(const v of [.25,.8])rod(g,p(u,v,0),p(u,v,h));
   for(let y=2.5;y<h;y+=2.5){for(const v of [.25,.8])rod(g,p(-width/2,v,y),p(width/2,v,y));const q=p(0,.5,y-.08);box(g,width,.1,.7,q.x,q.y,q.z,wood,angle);rod(g,p(-width/2,.8,y-2.4),p(0,.8,y));rod(g,p(0,.8,y),p(width/2,.8,y-2.4))}
   for(const u of [-width/2,width/2]){const q=p(u,.8,.7);box(g,.12,1.2,.12,q.x,q.y,q.z,orange)}used.add(s.id);
  }
  for(const s of roadworkSites){
   const r=findNearestRoadPoint(convertPosition(s.lat,s.lon),true);if(!r)continue;const dx=r.segment.b.x-r.segment.a.x,dz=r.segment.b.z-r.segment.a.z,len=Math.hypot(dx,dz);let nx=-dz/len,nz=dx/len;if(nz<0){nx=-nx;nz=-nz}
   const off=roadWidthForType(r.segment.type)/2+3.3,x=r.point.x+nx*off,z=r.point.z+nz*off;
   if(Math.floor(x/450)!==tile.x||Math.floor(z/450)!==tile.z)continue;
   const p=(u,v)=>({x:x+nz*u+nx*v,z:z-nx*u+nz*v}),angle=Math.atan2(nx,nz);
   const safe=[];for(const u of [-4,-3,0,3,4])for(const v of [-1.1,0,1.1]){const q=p(u,v);safe.push(clearPavement(q.x,q.z))}
   if(safe.some(v=>!v)){skipped.set(s.id,'Promenade clearance');continue}
   const y=terrainHeight(x,z);box(g,5,.045,1.25,x,y+.03,z,earth,angle);
   for(const side of [-1,1]){const q=p(0,side*.85);box(g,5,.45,.07,q.x,terrainHeight(q.x,q.z)+.65,q.z,orange,angle);for(const u of [-2,0,2]){const q=p(u,side*.85);box(g,.12,.9,.12,q.x,terrainHeight(q.x,q.z)+.45,q.z,cream)}}
   for(const u of [-3,3]){const q=p(u,-.8),y=terrainHeight(q.x,q.z);box(g,.4,.06,.4,q.x,y+.03,q.z,dark);const cone=new THREE.Mesh(new THREE.ConeGeometry(.16,.55,6),orange);cone.position.set(q.x,y+.32,q.z);g.add(cone)}
   const q=p(3.6,0);board(g,q.x,q.z,angle+Math.PI,'PAVING WORKS|ACCESS OPEN');const q2=p(-3.6,0);board(g,q2.x,q2.z,angle+Math.PI,'DIVERSION|NOT IN USE');
   for(let i=0;i<3;i++){const q=p(1.3,.15);box(g,.65,.13,.5,q.x,y+.12+i*.13,q.z,cream,angle)}used.add(s.id);
  }
  tile.workFronts=[];if(g.children.length){batchScenery({group:g});tile.group.add(g)}
 }
 return {queue,finish,used,skipped};
}
