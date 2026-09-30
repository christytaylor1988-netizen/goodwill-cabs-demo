// Actual saved garden outlines preserve the intervening roads, ramps and pavements.
export const carlisleGardenIds=new Set([941910050,941910051,941910052,817654413]);
export function addCarlisleGardens(THREE,{scene,shared,registerBarrier,convertPosition,terrainHeight,mapData}){
 const group=new THREE.Group();group.name='Carlisle Parade and Robertson Terrace planted beds';
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:1}));
 const white=mat(0xd8d5bd),cap=mat(0xe3dfcc),soil=mat(0x555340),bark=mat(0x655748),greens=[0x3d5840,0x5a7048,0x758253,0x485e46,0x8a8950].map(mat);
 const cube=new THREE.BoxGeometry(1,1,1),bush=new THREE.IcosahedronGeometry(1,1),stem=new THREE.CylinderGeometry(.09,.14,1,6),leaf=new THREE.ConeGeometry(.16,1,3);
 const batches=new Map(),dummy=new THREE.Object3D();let shrubCount=0,palmCount=0;
 function add(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){let mats=batches.get(geo);if(!mats)batches.set(geo,mats=new Map());let list=mats.get(m);if(!list)mats.set(m,list=[]);dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();list.push(dummy.matrix.clone());}
 const h=(x,z)=>terrainHeight(x,z)+.055;
 const noise=(x,z)=>{const n=Math.sin(x*12.9898+z*78.233)*43758.5453;return n-Math.floor(n)};
 function inside(x,z,r){let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)yes=!yes;}return yes;}
 function edgeDistance(x,z,r){let best=1e9;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],dx=b.x-a.x,dz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1);best=Math.min(best,Math.hypot(x-a.x-t*dx,z-a.z-t*dz));}return best;}
 for(const f of mapData.land.filter(f=>carlisleGardenIds.has(f.id))){
  const ring=f.geometry.slice(0,-1).map(p=>convertPosition(p.lat,p.lon));
  const shape=new THREE.Shape(ring.map(p=>new THREE.Vector2(p.x,-p.z))),geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const a=geo.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,h(a.getX(i),a.getZ(i)));geo.computeVertexNormals();const bed=new THREE.Mesh(geo,soil);bed.receiveShadow=true;group.add(bed);
  // White panels and slightly higher square posts, following the existing slope.
  for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];registerBarrier(a,b,.22);const len=Math.hypot(b.x-a.x,b.z-a.z),yaw=Math.atan2(b.x-a.x,b.z-a.z),steps=Math.ceil(len/1.2);
   for(let j=0;j<steps;j++){const t=(j+.5)/steps,x=THREE.MathUtils.lerp(a.x,b.x,t),z=THREE.MathUtils.lerp(a.z,b.z,t),y=h(x,z);add(cube,white,x,y+.34,z,.22,.76,len/steps+.02,0,yaw);add(cube,cap,x,y+.73,z,.3,.08,len/steps+.03,0,yaw);}
   const posts=Math.ceil(len/4);for(let j=0;j<posts;j++){const t=j/posts,x=THREE.MathUtils.lerp(a.x,b.x,t),z=THREE.MathUtils.lerp(a.z,b.z,t);add(cube,white,x,h(x,z)+.43,z,.44,.9,.44);add(cube,cap,x,h(x,z)+.9,z,.49,.07,.49);}
  }
  const minX=Math.min(...ring.map(p=>p.x)),maxX=Math.max(...ring.map(p=>p.x)),minZ=Math.min(...ring.map(p=>p.z)),maxZ=Math.max(...ring.map(p=>p.z));
  for(let x=minX+.8;x<maxX;x+=1.65)for(let z=minZ+.8;z<maxZ;z+=1.6){const px=x+(noise(x,z)-.5)*.4,pz=z+(noise(z,x)-.5)*.4;if(!inside(px,pz,ring)||edgeDistance(px,pz,ring)<.75)continue;const n=noise(px,pz),height=.45+n*.8,m=greens[Math.floor(n*greens.length)];add(bush,m,px,h(px,pz)+height*.55,pz,.7+n*.2,height*.7,.68,0,n*6);shrubCount++;
   if(n>.82){for(let k=0;k<7;k++){const angle=k*Math.PI*2/7;add(leaf,greens[k%5],px+Math.cos(angle)*.22,h(px,pz)+.65,pz+Math.sin(angle)*.22,1,1.15,1,Math.sin(angle)*.9,angle,Math.cos(angle)*.9);}}
  }
  // Two modest cordyline-style palms per Carlisle bed, one on Robertson Terrace.
  const targets=f.id===817654413?[.53]:[.27,.74];
  for(const t of targets){const x=THREE.MathUtils.lerp(minX,maxX,t);let zBest=null,clear=0;for(let z=minZ;z<maxZ;z+=.25){const d=edgeDistance(x,z,ring);if(inside(x,z,ring)&&d>clear){zBest=z;clear=d;}}if(zBest===null||clear<1)continue;const z=zBest,y=h(x,z),height=1.5+noise(x,z)*.7;add(stem,bark,x,y+height/2,z,1,height,1);for(let k=0;k<14;k++){const angle=k*Math.PI*2/14;add(leaf,greens[k%5],x+Math.cos(angle)*.55,y+height+.25,z+Math.sin(angle)*.55,1.3,1.65,1.3,Math.sin(angle)*1.12,angle,Math.cos(angle)*1.12);}palmCount++;}
 }
 for(const [geo,mats] of batches)for(const [material,matrices] of mats){const mesh=new THREE.InstancedMesh(geo,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}
 group.userData={beds:carlisleGardenIds.size,shrubs:shrubCount,palms:palmCount};scene.add(group);return group;
}
