// One shared footprint: paved deck above, concrete ceiling below.
export function addBottleUpper(THREE,{parent,rows,alley,shared,terrainHeight,plantingOwner}){
 const west=alley.west+alley.ramp,east=alley.east-alley.ramp,group=new THREE.Group();group.name='Wide upper Bottle Alley promenade';parent.add(group);
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:1,side:THREE.DoubleSide}));
 const stone=mat(0xa69e8b),rail=mat(0xd6d4c2),soil=mat(0x5c5943),greens=[0x526445,0x758052,0x4d6b52].map(mat),boxGeo=new THREE.BoxGeometry(1,1,1),bushGeo=new THREE.IcosahedronGeometry(1,1),leafGeo=new THREE.ConeGeometry(.12,1,3),batches=new Map(),dummy=new THREE.Object3D();
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');for(let y=0;y<2;y++)for(let x=0;x<2;x++){ctx.fillStyle=(x+y)%2?'#a89083':'#c4bfae';ctx.fillRect(x*64,y*64,64,64);ctx.strokeStyle='#888579';ctx.strokeRect(x*64+1,y*64+1,62,62);}const tex=shared(new THREE.CanvasTexture(c));tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.colorSpace=THREE.SRGBColorSpace;const paving=shared(new THREE.MeshStandardMaterial({map:tex,roughness:1,side:THREE.DoubleSide}));
 function add(geo,m,x,y,z,w,h,d,rx=0,ry=0,rz=0){let b=batches.get(m);if(!b)batches.set(m,b={geo,list:[]});dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();b.list.push(dummy.matrix.clone());}
 const box=(m,x,y,z,w,h,d)=>add(boxGeo,m,x,y,z,w,h,d);
 const top=r=>alley.level+3.35,inner=r=>r.edge+4.3,outer=r=>inner(r)+alley.half*2;
 const verts=[],uv=[];function quad(ps){for(const i of [0,1,2,0,2,3]){verts.push(...ps[i]);uv.push(ps[i][0]/2.8,ps[i][2]/2.8);}}
 const roof=alley.points.filter(p=>p.x>=west&&p.x<=east);
 const sides=[],underside=[],bottom=alley.level+3.05;
 const face=(target,ps)=>{for(const i of [0,1,2,0,2,3])target.push(...ps[i]);};
 for(let i=1;i<roof.length;i++){
  const a=roof[i-1],b=roof[i],left=p=>p.z-alley.half,right=p=>p.z+alley.half,y=top();
  quad([[a.x,y,left(a)],[a.x,y,right(a)],[b.x,y,right(b)],[b.x,y,left(b)]]);
  face(underside,[[a.x,bottom,left(a)],[b.x,bottom,left(b)],[b.x,bottom,right(b)],[a.x,bottom,right(a)]]);
  for(const edge of [left,right])face(sides,[[a.x,y,edge(a)],[b.x,y,edge(b)],[b.x,bottom,edge(b)],[a.x,bottom,edge(a)]]);
 }
 for(const p of [roof[0],roof.at(-1)])face(sides,[[p.x,top(),p.z-alley.half],[p.x,top(),p.z+alley.half],[p.x,bottom,p.z+alley.half],[p.x,bottom,p.z-alley.half]]);
 const ceiling=shared(new THREE.MeshStandardMaterial({map:alley.ceilingTexture,color:0xffffff,roughness:1,side:THREE.DoubleSide,emissive:0xe4dcc4,emissiveMap:alley.ceilingTexture,emissiveIntensity:.11}));
 for(const [verts,material,name] of [[underside,ceiling,'Shared promenade slab underside'],[sides,stone,'Shared promenade slab edges']]){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  const uv=[];for(let i=0;i<verts.length;i+=3)uv.push(verts[i]/8,verts[i+2]/8);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,material);mesh.name=name;mesh.receiveShadow=true;group.add(mesh);
 }
 const rr=rows.filter(r=>r.x>=roof[0].x&&r.x<=roof.at(-1).x);
 for(let i=1;i<rr.length;i++){const a=rr[i-1],b=rr[i],ya=top(a),yb=top(b),len=b.x-a.x;
  const x=(a.x+b.x)/2,z=(outer(a)+outer(b))/2,y=(ya+yb)/2;
  for(const h of [.5,1.03])box(rail,x,y+h,z,len+.06,.05,.05);if(i%2===0)box(rail,a.x,ya+.55,outer(a),.08,1.1,.08);
  const stair=Math.abs(((x-west+22)%48)-24)<2.4;
  if(stair||(plantingOwner&&x>=plantingOwner.west&&x<=plantingOwner.east)){/* Level breaks in the planting row provide access without artificial steps. */}
  else{const low=top(a);box(stone,x,low+.18,a.edge+3.1,len+.02,.36,2.2);box(soil,x,low+.38,a.edge+3.1,len,.04,2.0);
   if(i%2===0){add(bushGeo,greens[0],x,low+.77,a.edge+3.2,1.2,.58,.72);}
   if(i%7===0)for(let k=0;k<9;k++){const ang=k*6.283/9;add(leafGeo,greens[1],x+Math.cos(ang)*.25,low+1.05,a.edge+3.1+Math.sin(ang)*.25,1,1.5,1,Math.sin(ang)*.85,0,Math.cos(ang)*.85);}
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();const deck=new THREE.Mesh(geometry,paving);deck.receiveShadow=true;group.add(deck);
 for(const [m,b] of batches){const mesh=new THREE.InstancedMesh(b.geo,m,b.list.length);b.list.forEach((t,i)=>mesh.setMatrixAt(i,t));mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 return {west:roof[0].x,east:roof.at(-1).x,top,inner,outer};
}
