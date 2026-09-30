// A single, reversible West Hill trial. No changes to other green spaces.
export const trialGreenId=27102610;
export function createGreenTrial(THREE,api){
 const {shared,terrainHeight,inPolygon,findNearestRoadPoint,roadWidthForType,hitsBuilding,convertPosition,getPaths,getTerrain,polygonShape}=api;
 let seed=27102610;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#e9e9e3';ctx.fillRect(0,0,512,512);
 for(let i=0;i<28000;i++){const v=190+Math.floor(rand()*55);ctx.strokeStyle=`rgba(${v},${v},${v-8},.34)`;const x=rand()*512,y=rand()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rand()-.5)*2,y+1+rand()*3);ctx.stroke()}
 const map=shared(new THREE.CanvasTexture(c));map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 const grass=shared(new THREE.MeshStandardMaterial({color:0x799e69,map,bumpMap:map,bumpScale:.045,vertexColors:true,roughness:1,side:THREE.DoubleSide}));
 const trunkGeo=shared(new THREE.CylinderGeometry(.13,.23,1,6)),leafGeo=shared(new THREE.IcosahedronGeometry(1,1));
 const bark=shared(new THREE.MeshStandardMaterial({color:0x6a6554,roughness:1})),leaves=[0x526e43,0x657d4c,0x708451].map(color=>shared(new THREE.MeshStandardMaterial({color,roughness:1})));
 const stats={trees:0,types:{},patches:0};let patchMaterial=null,tuftGeometry=null,tuftMaterial=null;let trialPolygons=[];let trialPaths=[];const reliefCache=new Map();
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
 function segmentDistance(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)}
 function boundaryDistance(x,z){let d=Infinity;for(const p of trialPolygons)for(let i=0;i<p.outer.length;i++){const a=p.outer[i],b=p.outer[(i+1)%p.outer.length];d=Math.min(d,segmentDistance(x,z,{x:a.x,z:a.y},{x:b.x,z:b.y}))}return d}
 function relief(x,z){const key=x.toFixed(3)+','+z.toFixed(3);if(reliefCache.has(key))return reliefCache.get(key);
  const r=findNearestRoadPoint({x,z},true),roadFade=r?smooth((r.distance-roadWidthForType(r.segment.type)/2-2)/7):1;
  let pd=Infinity;for(const p of trialPaths)pd=Math.min(pd,segmentDistance(x,z,p.a,p.b));
  const mounds=.38*(.5+.5*Math.sin(x*.13+z*.047))+.3*(.5+.5*Math.cos(z*.16-x*.036));
  const h=mounds*roadFade*smooth(boundaryDistance(x,z)/7)*smooth((pd-2)/4);reliefCache.set(key,h);return h;
 }
 function visualHeight(x,z){return terrainHeight(x,z)+relief(x,z)}

 function surface(mesh,poly){
  trialPolygons=[poly];trialPaths=[];reliefCache.clear();
  for(const f of getPaths())for(let i=1;i<(f.geometry||[]).length;i++){const a=convertPosition(f.geometry[i-1].lat,f.geometry[i-1].lon),b=convertPosition(f.geometry[i].lat,f.geometry[i].lon);if(inPolygon((a.x+b.x)/2,(a.z+b.z)/2,poly)||inPolygon(a.x,a.z,poly)||inPolygon(b.x,b.z,poly))trialPaths.push({a,b})}
  // Clip the actual terrain triangles to the lawn polygon so no terrain can poke through.
  const shape=new THREE.ShapeGeometry(polygonShape(poly));shape.rotateX(Math.PI/2);const sp=shape.attributes.position,si=shape.index,clips=[];
  for(let i=0;i<(si?si.count:sp.count);i+=3){const t=[0,1,2].map(j=>{const k=si?si.getX(i+j):i+j;return [sp.getX(k),sp.getZ(k)]});clips.push(t)}shape.dispose();
  const terrain=getTerrain(),p=terrain.attributes.position,idx=terrain.index,out=[],uv=[],col=[],xs=poly.outer.map(p=>p.x),zs=poly.outer.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
  function clip(input,tri){let pts=input;const sign=Math.sign((tri[1][0]-tri[0][0])*(tri[2][1]-tri[0][1])-(tri[1][1]-tri[0][1])*(tri[2][0]-tri[0][0]));
   for(let e=0;e<3&&pts.length;e++){const a=tri[e],b=tri[(e+1)%3],side=q=>sign*((b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0])),next=[];for(let j=0;j<pts.length;j++){const c=pts[j],d=pts[(j+1)%pts.length],sc=side(c),sd=side(d);if(sc>=-1e-7)next.push(c);if((sc<0)!==(sd<0)){const t=sc/(sc-sd);next.push([c[0]+(d[0]-c[0])*t,c[1]+(d[1]-c[1])*t])}}pts=next}return pts}
  for(let i=0;i<(idx?idx.count:p.count);i+=3){const t=[0,1,2].map(j=>{const k=idx?idx.getX(i+j):i+j;return [p.getX(k),p.getZ(k)]});if(Math.max(...t.map(v=>v[0]))<minX||Math.min(...t.map(v=>v[0]))>maxX||Math.max(...t.map(v=>v[1]))<minZ||Math.min(...t.map(v=>v[1]))>maxZ)continue;
   for(const c of clips){const pts=clip(t,c);for(let j=1;j<pts.length-1;j++)emit(pts[0],pts[j],pts[j+1])}}
  function emit(a,b,c,depth=0){const ab=Math.hypot(a[0]-b[0],a[1]-b[1]),bc=Math.hypot(b[0]-c[0],b[1]-c[1]),ca=Math.hypot(c[0]-a[0],c[1]-a[1]);if(Math.max(ab,bc,ca)>2.8&&depth<12){if(ab>=bc&&ab>=ca){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];emit(a,m,c,depth+1);emit(m,b,c,depth+1)}else if(bc>=ca){const m=[(b[0]+c[0])/2,(b[1]+c[1])/2];emit(a,b,m,depth+1);emit(a,m,c,depth+1)}else{const m=[(c[0]+a[0])/2,(c[1]+a[1])/2];emit(a,b,m,depth+1);emit(m,b,c,depth+1)}return}
   for(const [x,z] of [a,b,c]){out.push(x,visualHeight(x,z)+.008,z);uv.push(x/5,z/5);const v=1+Math.sin(x*.063+z*.047)*.016+Math.sin(z*.14-x*.081)*.01;col.push(v,v,v)}
  }
  mesh.geometry.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(out,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));const normals=[];for(let i=0;i<out.length;i+=3){const x=out[i],z=out[i+2],n=new THREE.Vector3(visualHeight(x-.7,z)-visualHeight(x+.7,z),1.4,visualHeight(x,z-.7)-visualHeight(x,z+.7)).normalize();normals.push(n.x,n.y,n.z)}g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.computeBoundingSphere();mesh.geometry=g;return mesh;
 }
 function populate(group,polygons){
  seed=916723;stats.types={};trialPolygons=polygons;const contains=(x,z)=>polygons.some(p=>inPolygon(x,z,p)),ps=polygons.flatMap(p=>p.outer),x0=Math.min(...ps.map(p=>p.x)),x1=Math.max(...ps.map(p=>p.x)),z0=Math.min(...ps.map(p=>p.y)),z1=Math.max(...ps.map(p=>p.y));
  const paths=[];for(const f of getPaths())for(let i=1;i<(f.geometry||[]).length;i++){const a=convertPosition(f.geometry[i-1].lat,f.geometry[i-1].lon),b=convertPosition(f.geometry[i].lat,f.geometry[i].lon);if(contains((a.x+b.x)/2,(a.z+b.z)/2))paths.push({a,b})}
  function pathDistance(x,z){let d=Infinity;for(const {a,b} of paths){const dx=b.x-a.x,dz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);d=Math.min(d,Math.hypot(x-a.x-dx*t,z-a.z-dz*t))}return d}
  const trees=[],clusters=[[.25,.22],[.67,.20],[.28,.64],[.72,.67],[.40,.88]];
  for(let k=0;k<clusters.length;k++){const [u,v]=clusters[k],cx=x0+(x1-x0)*u,cz=z0+(z1-z0)*v;let count=0;
   for(let attempt=0;attempt<60&&count<(k===1?3:4);attempt++){const x=cx+(rand()-.5)*42,z=cz+(rand()-.5)*43,r=findNearestRoadPoint({x,z},true);if(!contains(x,z)||hitsBuilding(x,z,5)||pathDistance(x,z)<4||r&&r.distance<roadWidthForType(r.segment.type)/2+6||trees.some(t=>Math.hypot(t.x-x,t.z-z)<9))continue;trees.push({x,z,type:(trees.length+k)%4,scale:.8+rand()*.65,turn:rand()*6.28});count++}
  }
  const batches=[[],[],[],[]];const dummy=new THREE.Object3D();
  const branch=(a,b,r)=>{const d=b.clone().sub(a);dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(r,d.length(),r);dummy.updateMatrix();batches[0].push(dummy.matrix.clone())};
  for(const t of trees){const y=visualHeight(t.x,t.z),s=t.scale,h=(t.type===1?3.4:4.2)*s,lean=t.type===2?1.25*s:.18*s,base=new THREE.Vector3(t.x,y,t.z),top=new THREE.Vector3(t.x+lean,y+h,t.z+.25*s);branch(base,top,s);
   const count=t.type===1?3:t.type===0?5:4;
   for(let j=0;j<count;j++){const angle=t.turn+j*2.4,radius=(t.type===1?1.5:1.1)*s,crown=new THREE.Vector3(top.x+Math.cos(angle)*radius+(t.type===2?j*.43*s:0),top.y+(j%2)*.6*s,top.z+Math.sin(angle)*radius*.8);branch(top.clone().add(new THREE.Vector3(0,-1.2*s,0)),crown,.48*s);dummy.position.copy(crown);dummy.rotation.set(.12*Math.sin(angle),angle,t.type===2?-.22:0);const size=(t.type===1?.85:1.35)*s;dummy.scale.set(size*(t.type===2?1.5:1.1),size*(t.type===3?1.45:.85),size);dummy.updateMatrix();batches[1+(j+t.type)%3].push(dummy.matrix.clone())}
   stats.types[t.type]=(stats.types[t.type]||0)+1;
  }
  for(let i=0;i<batches.length;i++){if(!batches[i].length)continue;const mesh=new THREE.InstancedMesh(i===0?trunkGeo:leafGeo,i===0?bark:leaves[i-1],batches[i].length);batches[i].forEach((m,j)=>mesh.setMatrixAt(j,m));mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh)}stats.trees=trees.length;
  // Six small, feathered wear marks beside existing paths, not broad lawn blotches.
  if(!patchMaterial){const pc=document.createElement('canvas');pc.width=pc.height=64;const pg=pc.getContext('2d'),grad=pg.createRadialGradient(32,32,4,32,32,31);grad.addColorStop(0,'#9c987a50');grad.addColorStop(1,'#9c987a00');pg.fillStyle=grad;pg.fillRect(0,0,64,64);const tex=shared(new THREE.CanvasTexture(pc));tex.colorSpace=THREE.SRGBColorSpace;patchMaterial=shared(new THREE.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:1}));}const pm=patchMaterial;let added=0;
  for(let i=0;i<paths.length&&added<6;i+=Math.max(1,Math.floor(paths.length/8))){const {a,b}=paths[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<4)continue;const x=(a.x+b.x)/2+dz/len*1.2,z=(a.z+b.z)/2-dx/len*1.2;if(!contains(x,z))continue;const g=new THREE.PlaneGeometry(1.2,2.4,2,3);g.rotateX(-Math.PI/2);g.rotateY(Math.atan2(dx,dz));const p=g.attributes.position;for(let j=0;j<p.count;j++){const xx=p.getX(j)+x,zz=p.getZ(j)+z;p.setXYZ(j,xx,visualHeight(xx,zz)+.012,zz)}g.computeVertexNormals();const m=new THREE.Mesh(g,pm);m.receiveShadow=true;group.add(m);added++}stats.patches=added;
  // Sparse low edge vegetation: one instanced tuft batch, no animation or lawn-wide carpet.
  const verts=[];for(let j=0;j<5;j++){const a=j*2.4,dx=Math.cos(a),dz=Math.sin(a);verts.push(-dz*.025,0,dx*.025,dz*.025,0,-dx*.025,dx*.12,.26+(j%2)*.08,dz*.12)}
  const tg=tuftGeometry||shared(new THREE.BufferGeometry());if(!tuftGeometry){tg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));tg.computeVertexNormals();tuftGeometry=tg;}
  const tm=tuftMaterial||shared(new THREE.MeshStandardMaterial({color:0x79845c,roughness:1,side:THREE.DoubleSide}));tuftMaterial=tm;const tufts=[];seed=51919;
  for(let i=0;i<1400&&tufts.length<65;i++){const x=x0+rand()*(x1-x0),z=z0+rand()*(z1-z0),edge=boundaryDistance(x,z),pd=pathDistance(x,z),r=findNearestRoadPoint({x,z},true);if(!contains(x,z)||hitsBuilding(x,z,2)||r&&r.distance<roadWidthForType(r.segment.type)/2+2.2||!((pd>1.6&&pd<4.5)||(edge>1.5&&edge<6)))continue;if(tufts.some(t=>Math.hypot(t.x-x,t.z-z)<3))continue;tufts.push({x,z,s:.55+rand()*.55})}
  const clumps=new THREE.InstancedMesh(tg,tm,tufts.length);tufts.forEach((t,i)=>{dummy.position.set(t.x,visualHeight(t.x,t.z)+.014,t.z);dummy.rotation.set(0,i*2.4,0);dummy.scale.setScalar(t.s);dummy.updateMatrix();clumps.setMatrixAt(i,dummy.matrix)});clumps.instanceMatrix.needsUpdate=true;clumps.computeBoundingSphere();clumps.receiveShadow=true;group.add(clumps);stats.tufts=tufts.length;stats.maxRelief=0;for(const h of reliefCache.values())stats.maxRelief=Math.max(stats.maxRelief,h);reliefCache.clear();
 }
 return {grass,surface,populate,stats,contains:(x,z)=>trialPolygons.some(p=>inPolygon(x,z,p))};
}
