// Large Pelham seafront car park. Existing mapped roads remain the access network.
export function addPelhamCarPark(THREE,{tile,entry,mapData,convertPosition,terrainHeight,roadWidthForType,parkedCar,hitsBuilding,shared,SCENERY_CELL}){
 const outline=[[50.85470,.58302],[50.85476,.58302],[50.85479,.58365],[50.85491,.58394],[50.855016,.58412],[50.855026,.58545],[50.85494,.58556],[50.85466,.58557],[50.85465,.58478],[50.85469,.58462],[50.85464,.58306]].map(([lat,lon])=>convertPosition(lat,lon));
 const minX=Math.min(...outline.map(p=>p.x)),maxX=Math.max(...outline.map(p=>p.x)),minZ=Math.min(...outline.map(p=>p.z)),maxZ=Math.max(...outline.map(p=>p.z));
 const tx=tile.x*SCENERY_CELL,tz=tile.z*SCENERY_CELL;
 if(tx>maxX||tx+SCENERY_CELL<minX||tz>maxZ||tz+SCENERY_CELL<minZ)return;
 const inside=(x,z)=>{let ok=false;for(let i=0,j=outline.length-1;i<outline.length;j=i++){const a=outline[i],b=outline[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)ok=!ok}return ok};
 const distance=(x,z,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-dx*t,z-a.z-dz*t)};
 const lanes=[],main=[],paths=[];
 for(const f of [...mapData.roads,...mapData.paths]){
  const nodes=f.geometry||[],type=f.tags?.highway;if(!type)continue;
  for(let i=1;i<nodes.length;i++){
   const a=convertPosition(nodes[i-1].lat,nodes[i-1].lon),b=convertPosition(nodes[i].lat,nodes[i].lon);
   if(Math.max(a.x,b.x)<minX-10||Math.min(a.x,b.x)>maxX+10||Math.max(a.z,b.z)<minZ-10||Math.min(a.z,b.z)>maxZ+10)continue;
   const segment={a,b,w:type==='service'?3:roadWidthForType(type)/2};
   if(['footway','path','pedestrian','cycleway','steps'].includes(type))paths.push(segment);else (type==='service'?lanes:main).push(segment);
  }
 }
 const safe=(x,z)=>inside(x,z)&&!main.some(s=>distance(x,z,s.a,s.b)<s.w+.6)&&!paths.some(s=>distance(x,z,s.a,s.b)<1.3)&&!hitsBuilding(x,z,.3);
 const owned=(x,z)=>Math.floor(x/SCENERY_CELL)===tile.x&&Math.floor(z/SCENERY_CELL)===tile.z;
 const ground=terrainHeight,paved=[],aisles=[],marks=[];
 const tri=(out,ps,offset)=>{for(const i of [0,2,1,0,3,2]){const p=ps[i];out.push(p.x,ground(p.x,p.z)+offset,p.z)}};
 // One inexpensive terrain-following surface, with the existing access lanes picked out.
 const step=2;
 for(let x=Math.max(Math.floor(minX),tx);x<Math.min(maxX,tx+SCENERY_CELL);x+=step)for(let z=Math.max(Math.floor(minZ),tz);z<Math.min(maxZ,tz+SCENERY_CELL);z+=step){
  const ps=[{x,z},{x:x+step,z},{x:x+step,z:z+step},{x,z:z+step}];if(!ps.every(p=>safe(p.x,p.z)))continue;
  const lane=lanes.some(s=>distance(x+1,z+1,s.a,s.b)<s.w);tri(lane?aisles:paved,ps,.105);
 }
 const line=(a,b,width=.085)=>{const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),nx=-dz/len*width/2,nz=dx/len*width/2;const ps=[{x:a.x+nx,z:a.z+nz},{x:b.x+nx,z:b.z+nz},{x:b.x-nx,z:b.z-nz},{x:a.x-nx,z:a.z-nz}];tri(marks,ps,.13)};
 let spaces=0,cars=0;
 // Long parallel rows, divided at the mapped north/south circulation lanes.
 for(const [lat,west,east] of [[50.85472,.58312,.58390],[50.854773,.58412,.58543],[50.854817,.58412,.58543],[50.854939,.58416,.58543]]){
  const a=convertPosition(lat,west),b=convertPosition(lat+.000023,east),dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,nx=-uz,nz=ux;
  for(let u=1.4;u<len-1.4;u+=2.6){
   const x=a.x+ux*u,z=a.z+uz*u,ps=[[-1.25,-2.35],[1.25,-2.35],[1.25,2.35],[-1.25,2.35]].map(([du,dv])=>({x:x+ux*du+nx*dv,z:z+uz*du+nz*dv}));
   if(!owned(x,z)||!ps.every(p=>safe(p.x,p.z)&&!lanes.some(s=>distance(p.x,p.z,s.a,s.b)<s.w+.25)))continue;
   line(ps[0],ps[3]);line(ps[1],ps[2]);line(ps[0],ps[1]);spaces++;
   const index=Math.round(u/2.6)+Math.round((lat-50.8547)*1e6);
   if(index%5!==0&&!hitsBuilding(x,z,2.5)){
    const yaw=Math.atan2(nx,nz);parkedCar(entry.group,x,z,yaw,index);entry.parked.push({x,z,yaw});cars++;
   }
  }
 }
 for(const [verts,color] of [[paved,0x777973],[aisles,0x515650],[marks,0xe8e4cf]]){
  if(!verts.length)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeVertexNormals();
  const material=shared(new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide})),mesh=new THREE.Mesh(geo,material);mesh.receiveShadow=true;mesh.name='Pelham car park';entry.group.add(mesh);
 }
 // Grey guardrails and signposts are instanced together to keep this busy scene cheap.
 const metal=shared(new THREE.MeshStandardMaterial({color:0x8d9694,roughness:.8})),parts=[];
 const addBox=(x,y,z,w,h,d,yaw=0)=>{const o=new THREE.Object3D();o.position.set(x,y,z);o.rotation.y=yaw;o.scale.set(w,h,d);o.updateMatrix();parts.push(o.matrix.clone())};
 const furnitureClear=(x,z)=>!hitsBuilding(x,z,.5)&&!main.some(s=>distance(x,z,s.a,s.b)<s.w+.6)&&!lanes.some(s=>distance(x,z,s.a,s.b)<s.w+.5)&&!paths.some(s=>distance(x,z,s.a,s.b)<1.1)&&!entry.parked.some(p=>Math.hypot(p.x-x,p.z-z)<2.7);
 function railing(a,b){
  const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),steps=Math.ceil(len/1.8),yaw=-Math.atan2(dz,dx);
  for(let i=0;i<steps;i++){
   const p={x:a.x+dx*i/steps,z:a.z+dz*i/steps},q={x:a.x+dx*(i+1)/steps,z:a.z+dz*(i+1)/steps},x=(p.x+q.x)/2,z=(p.z+q.z)/2;
   if(!owned(x,z)||![p,q,{x,z}].every(v=>furnitureClear(v.x,v.z)))continue;
   const y=ground(x,z),w=len/steps;
   for(const h of [.22,1.05])addBox(x,y+h,z,w,.05,.05,yaw);
   addBox(p.x,ground(p.x,p.z)+.57,p.z,.065,1.14,.065);
   for(let j=1;j<=5;j++){const f=j/6,bx=p.x+(q.x-p.x)*f,bz=p.z+(q.z-p.z)*f;addBox(bx,ground(bx,bz)+.63,bz,.025,.82,.025)}
  }
 }
 // Continuous perimeter runs break automatically at road and footpath crossings.
 for(let i=0;i<outline.length;i++)railing(outline[i],outline[(i+1)%outline.length]);
 // Follow both sides of the mapped curved western exit, leaving the mouth open.
 const curve=[[50.8548033,.5839816],[50.8548519,.5839563],[50.8548867,.583923],[50.8549175,.5838555],[50.854921,.5838412],[50.8549322,.5836817]].map(([lat,lon])=>convertPosition(lat,lon));
 for(let i=1;i<curve.length;i++){
  const a=curve[i-1],b=curve[i],len=Math.hypot(b.x-a.x,b.z-a.z),nx=-(b.z-a.z)/len,nz=(b.x-a.x)/len;
  for(const side of [-1,1])railing({x:a.x+nx*4.1*side,z:a.z+nz*4.1*side},{x:b.x+nx*4.1*side,z:b.z+nz*4.1*side});
 }
 const signMaterials=new Map();
 function signMaterial(kind){
  if(signMaterials.has(kind))return signMaterials.get(kind);
  const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');
  if(kind==='no-entry'){
   ctx.fillStyle='#e9e9dd';ctx.beginPath();ctx.arc(128,128,124,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b83c38';ctx.beginPath();ctx.arc(128,128,113,0,Math.PI*2);ctx.fill();ctx.fillStyle='white';ctx.fillRect(43,105,170,46);
  }else{
   ctx.fillStyle=kind==='pay'?'#eee9d9':'#315f81';ctx.fillRect(0,0,256,256);ctx.strokeStyle='white';ctx.lineWidth=8;ctx.strokeRect(5,5,246,246);ctx.fillStyle=kind==='pay'?'#263d4a':'white';ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.font='bold 110px sans-serif';ctx.fillText(kind==='exit'?'→':'P',128,78);ctx.font='bold 29px sans-serif';ctx.fillText(kind==='pay'?'PAY & DISPLAY':kind==='exit'?'EXIT ONLY':'CAR PARK',128,166);ctx.font='23px sans-serif';ctx.fillText(kind==='pay'?'Buy ticket here':kind==='exit'?'Follow arrows':'Pelham Seafront',128,210);
  }
  const tex=shared(new THREE.CanvasTexture(c));tex.colorSpace=THREE.SRGBColorSpace;
  const m=shared(new THREE.MeshStandardMaterial({map:tex,roughness:.9,side:THREE.DoubleSide,alphaTest:.5}));signMaterials.set(kind,m);return m;
 }
 const signSites=[
  [50.854957,.58390,'no-entry',Math.PI],[50.854885,.58378,'no-entry',Math.PI],
  [50.85492,.58414,'exit',-Math.PI/2],[50.85468,.58378,'exit',0],
  [50.854987,.58542,'parking',Math.PI],[50.85491,.585575,'parking',Math.PI],
  [50.85475,.58465,'pay',Math.PI/2],[50.854735,.58542,'pay',0],
  [50.85495,.58465,'parking',Math.PI],[50.85469,.58537,'exit',0],
  [50.854765,.58363,'parking',Math.PI]
 ];
 for(const [lat,lon,kind,yaw] of signSites){
  const p=convertPosition(lat,lon);if(!owned(p.x,p.z)||!furnitureClear(p.x,p.z))continue;
  const y=ground(p.x,p.z),size=kind==='no-entry'?.7:.85;
  addBox(p.x,y+1.4,p.z,.07,2.8,.07);
  const mesh=new THREE.Mesh(kind==='no-entry'?new THREE.CircleGeometry(size/2,16):new THREE.PlaneGeometry(size,1.05),signMaterial(kind));mesh.position.set(p.x,y+2.45,p.z);mesh.rotation.y=yaw;entry.group.add(mesh);
  if(kind==='pay'){addBox(p.x,y+.7,p.z+.24,.42,1.4,.3);for(const d of [-.8,.8])addBox(p.x+d,y+.48,p.z,.1,.96,.1)}
 }
 if(parts.length){const mesh=new THREE.InstancedMesh(shared(new THREE.BoxGeometry(1,1,1)),metal,parts.length);parts.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.receiveShadow=true;entry.group.add(mesh)}
 entry.group.userData.pelhamCarPark={spaces,cars};
}
