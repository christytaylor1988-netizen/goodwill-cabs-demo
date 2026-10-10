// Two full golf grounds bounded by the saved roadside, central and diagonal paths.
export const golfGrounds=[
 [[50.855035,.58565],[50.855065,.58597],[50.855095,.58620],[50.855105,.58673],[50.855078,.58677],[50.85487,.58677],[50.854825,.58656],[50.854795,.58634],[50.854875,.58590],[50.85494,.58566]],
 [[50.855105,.58685],[50.855115,.58769],[50.855068,.58773],[50.85491,.58777],[50.85485,.5879],[50.85464,.58772],[50.85461,.58765],[50.854755,.58685]]
];
export function buildAdventureGolf(THREE,{scene,shared,convertPosition,terrainHeight,objectBox,textSign,batchScenery}){
 const group=new THREE.Group();group.name='Full seafront crazy and adventure golf';scene.add(group);
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.95}));
 const lawn=mat(0x73835c),sand=mat(0xc8baa0),turf=mat(0x49866b),stone=mat(0xaea183),iron=mat(0x3f5146),wood=mat(0x82755c),white=mat(0xe9e2c9),red=mat(0xa55143),black=mat(0x343d36),blue=mat(0x5399ad);
 const greens=[0x405b36,0x5d733d,0x7c8849,0x53663b,0x6d6550].map(mat),shrubMatrices=greens.map(()=>[]),rockMatrices=[];
 const polygons=golfGrounds.map(r=>r.map(([lat,lon])=>convertPosition(lat,lon)));
 const contains=(p,ring)=>{let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)yes=!yes}return yes};
 const hut=convertPosition(50.854875,.58673),clearHut=(x,z)=>Math.abs(x-hut.x)>5.5||Math.abs(z-hut.z)>6;
 const y=(x,z)=>terrainHeight(x,z);
 const box=(w,h,d,x,yy,z,m,yaw=0)=>objectBox(group,w,h,d,x,yy,z,m,yaw);
 function surface(points,m,offset){const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p.x,-p.z))),geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const v=geo.attributes.position;for(let i=0;i<v.count;i++)v.setY(i,y(v.getX(i),v.getZ(i))+offset);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);mesh.receiveShadow=true;group.add(mesh)}
 function edge(a,b,m,h=.22,w=.22){const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),n=Math.ceil(len/2);for(let j=0;j<n;j++){const x=a.x+dx*(j+.5)/n,z=a.z+dz*(j+.5)/n;box(len/n+.03,h,w,x,y(x,z)+h/2+.14,z,m,-Math.atan2(dz,dx))}}
 function plant(x,z,i,scale=1){const o=new THREE.Object3D();o.position.set(x,y(x,z)+.65*scale,z);o.scale.set(1.1*scale,.8*scale,.95*scale);o.rotation.y=i*1.7;o.updateMatrix();shrubMatrices[i%greens.length].push(o.matrix.clone())}
 function rock(x,z,i){const o=new THREE.Object3D();o.position.set(x,y(x,z)+.35,z);o.scale.set(.65+(i%3)*.15,.45,.55);o.rotation.y=i;o.updateMatrix();rockMatrices.push(o.matrix.clone())}
 let holes=0,shrubs=0;
 for(let zone=0;zone<polygons.length;zone++){
  const ring=polygons[zone],cx=ring.reduce((s,p)=>s+p.x,0)/ring.length,cz=ring.reduce((s,p)=>s+p.z,0)/ring.length;
  surface(ring,lawn,.11);
  for(let i=0;i<ring.length;i++){
   const a=ring[i],b=ring[(i+1)%ring.length],len=Math.hypot(b.x-a.x,b.z-a.z);
   // Leave a four-metre gateway on the central walkway side.
   for(let t=0;t<len;t+=2){const f=(t+1)/len,x=a.x+(b.x-a.x)*f,z=a.z+(b.z-a.z)*f;if(!clearHut(x,z))continue;if((zone===0&&i===3||zone===1&&i===7)&&Math.abs(f-.5)<.12)continue;
    const q={x:a.x+(b.x-a.x)*Math.min(1,(t+2)/len),z:a.z+(b.z-a.z)*Math.min(1,(t+2)/len)};edge({x:a.x+(b.x-a.x)*t/len,z:a.z+(b.z-a.z)*t/len},q,stone,.4,.35);
    const dx=cx-x,dz=cz-z,d=Math.hypot(dx,dz);plant(x+dx/d*.9,z+dz/d*.9,shrubs++,i<3?.88:1.15);
    if(t%6<2){box(.065,1.05,.065,x,y(x,z)+.65,z,iron);const angle=-Math.atan2(b.z-a.z,b.x-a.x);box(Math.min(2,len-t),.045,.045,x,y(x,z)+1.05,z,iron,angle)}
   }
  }
  const minX=Math.min(...ring.map(p=>p.x)),maxX=Math.max(...ring.map(p=>p.x)),minZ=Math.min(...ring.map(p=>p.z)),maxZ=Math.max(...ring.map(p=>p.z));
  for(let x=minX+7;x<maxX-5;x+=12)for(let z=minZ+6;z<maxZ-5;z+=10){
   const i=holes,ang=(i%3-1)*.23,at=(u,v)=>({x:x+Math.cos(ang)*u-Math.sin(ang)*v,z:z+Math.sin(ang)*u+Math.cos(ang)*v});
   const local=[[-3.7,-2.1],[1.8,-2.1],[4,0],[2.1,2.2],[-3.7,2.2]],points=local.map(([u,v])=>at(u,v)),surround=local.map(([u,v])=>at(u*1.24,v*1.4));
   if(!surround.every(p=>contains(p,ring)&&clearHut(p.x,p.z)))continue;
   surface(surround,sand,.145);surface(points,turf,.18);points.forEach((p,j)=>edge(p,points[(j+1)%points.length],stone,.16,.16));
   const cup=at(2.4,0),base=y(cup.x,cup.z);box(.055,.9,.055,cup.x,base+.65,cup.z,white);box(.36,.22,.025,cup.x+.17,base+1.01,cup.z,i%2?red:blue);
   if(i%4===0){box(1,.65,1,x,y(x,z)+.5,z,stone);box(.6,.3,1.1,x,y(x,z)+.24,z,black)}
   else if(i%4===1){for(let k=0;k<3;k++)rock(x-.6+k*.65,z+.5,i+k)}
   else if(i%4===2){box(.18,.35,2.4,x,y(x,z)+.34,z,wood,.35)}
   else {box(.8,.7,.8,x,y(x,z)+.5,z,white);box(.85,.18,.85,x,y(x,z)+.8,z,red)}
   for(const [u,v] of [[-4,-3.5],[3,3.5]]){const p=at(u,v);if(contains(p,ring)&&clearHut(p.x,p.z))plant(p.x,p.z,shrubs++,1.15)}
   holes++;
  }
  // Pale meandering walking route through each ground, kept inside its boundary.
  for(let x=minX+4;x<maxX-4;x+=2){const z=cz+Math.sin((x-minX)/15)*2.5,ps=[{x,z:z-.7},{x:x+2,z:z-.7},{x:x+2,z:z+.7},{x,z:z+.7}];if(ps.every(p=>contains(p,ring)&&clearHut(p.x,p.z)))surface(ps,sand,.155)}
  for(let j=0;j<5;j++){
   const x=minX+8+(maxX-minX-16)*j/4,z=minZ+3.5;if(!contains({x,z},ring)||!clearHut(x,z))continue;
   const base=y(x,z);box(.11,5,.11,x,base+2.5,z,iron);box(1.25,.1,.1,x,base+5,z,iron);for(const dx of [-.45,.45]){box(.4,.25,.32,x+dx,base+5,z,iron);box(.31,.17,.04,x+dx,base+4.99,z-.18,white)}
   box(1.7,.12,.5,x+2,base+.5,z+1,wood);box(1.7,.4,.1,x+2,base+.8,z+1.2,wood);for(const dx of [1.4,2.6])box(.09,.5,.4,x+dx,base+.25,z+1,iron);
  }
 }
 batchScenery({group});
 const shrubGeo=shared(new THREE.IcosahedronGeometry(1,1));for(let i=0;i<greens.length;i++){const a=shrubMatrices[i];if(!a.length)continue;const mesh=new THREE.InstancedMesh(shrubGeo,greens[i],a.length);a.forEach((m,j)=>mesh.setMatrixAt(j,m));mesh.castShadow=mesh.receiveShadow=true;group.add(mesh)}
 if(rockMatrices.length){const mesh=new THREE.InstancedMesh(shared(new THREE.IcosahedronGeometry(1,0)),stone,rockMatrices.length);rockMatrices.forEach((m,i)=>mesh.setMatrixAt(i,m));group.add(mesh)}
 group.userData.golf={grounds:polygons.length,holes,shrubs};return group;
}
export function buildGolfHut(THREE,{poly,tile,polygonShape,objectBox,textSign,shared}){
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.9})),blue=mat(0x5d9fb8),cream=mat(0xe6e4d3),glass=mat(0x354f56),roof=mat(0x616763),ps=poly.outer;
 const minX=Math.min(...ps.map(p=>p.x)),maxX=Math.max(...ps.map(p=>p.x)),minZ=Math.min(...ps.map(p=>p.y)),maxZ=Math.max(...ps.map(p=>p.y)),cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,w=maxX-minX,d=maxZ-minZ;
 const box=(ww,h,dd,x,y,z,m)=>objectBox(tile.group,ww,h,dd,x,y,z,m);
 box(w,2.8,d,cx,1.4,cz,cream);box(w+.35,.5,d+.35,cx,2.65,cz,blue);
 for(const z of [minZ-.08,maxZ+.08]){
  for(const u of [-.32,0,.32]){box(w*.25,1.7,.12,cx+w*u,1.35,z,blue);box(w*.21,1.42,.14,cx+w*u,1.35,z,glass);box(.055,1.42,.16,cx+w*u,1.35,z,cream)}
  textSign(tile.group,'SEABREEZE ADVENTURE GOLF',w-.3,.4,cx,2.65,z+(z<cz?-.14:.14),'#5d9fb8','#f8f1db',z<cz?Math.PI:0);
 }
 box(1.05,2.2,.17,cx,1.1,minZ-.17,blue);
 for(const x of [minX+.15,maxX-.15])for(const z of [minZ-.25,maxZ+.25])box(.14,2.8,.14,x,1.4,z,blue);
 const v=[],A=[minX-.45,2.9,minZ-.45],B=[maxX+.45,2.9,minZ-.45],C=[maxX+.45,2.9,maxZ+.45],D=[minX-.45,2.9,maxZ+.45],R=[cx,5,minZ+1],T=[cx,5,maxZ-1];for(const p of [A,B,R,B,C,T,B,T,R,C,D,T,D,A,R,D,R,T])v.push(...p);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();roof.side=THREE.DoubleSide;const m=new THREE.Mesh(g,roof);m.castShadow=true;tile.group.add(m);
}
