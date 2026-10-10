// Small hard-landscaped corner only; no road or collision changes.
export function addCarlisleCorner(THREE,{scene,shared,convertPosition,terrainHeight}){
 const group=new THREE.Group();group.name='Carlisle paved corner and pedestrian railing';scene.add(group);
 const coords=[[50.854766,.58152],[50.85479,.582035],[50.85484,.582065],[50.854971,.582035],[50.854992,.58183],[50.854855,.58182],[50.85482,.58153]];
 const ring=coords.map(([lat,lon])=>convertPosition(lat,lon));
 const shape=new THREE.Shape(ring.map(p=>new THREE.Vector2(p.x,-p.z))),geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);
 const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,terrainHeight(pos.getX(i),pos.getZ(i))+.04);geo.computeVertexNormals();
 const paving=shared(new THREE.MeshStandardMaterial({color:0xa8a79b,roughness:1,side:THREE.DoubleSide}));const surface=new THREE.Mesh(geo,paving);surface.receiveShadow=true;group.add(surface);
 const points=[[50.854775,.58155],[50.854807,.58191],[50.854815,.581975],[50.854828,.581998],[50.854848,.582005],[50.854945,.581988]].map(([lat,lon])=>convertPosition(lat,lon));
 const matrices=[],dummy=new THREE.Object3D();
 const box=(x,y,z,w,h,d,angle=0,roll=0)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,angle,roll);dummy.updateMatrix();matrices.push(dummy.matrix.clone());};
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.z-a.z),yaw=-Math.atan2(b.z-a.z,b.x-a.x),steps=Math.ceil(length/2.2);
  for(let j=0;j<steps;j++){
   const t=j/steps,u=(j+1)/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,xx=a.x+(b.x-a.x)*u,zz=a.z+(b.z-a.z)*u,y=terrainHeight(x,z)+.05,yy=terrainHeight(xx,zz)+.05;
   box(x,y+.55,z,.075,1.1,.075);
   for(const h of [.16,1.02])box((x+xx)/2,(y+yy)/2+h,(z+zz)/2,length/steps+.03,.045,.045,yaw,Math.atan2(yy-y,length/steps));
   const bars=Math.ceil(length/steps/.24);for(let k=1;k<bars;k++){const f=k/bars;box(x+(xx-x)*f,y+(yy-y)*f+.58,z+(zz-z)*f,.027,.82,.027);}
  }
 }
 const rail=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),shared(new THREE.MeshStandardMaterial({color:0x899b9c,metalness:.3,roughness:.7})),matrices.length);matrices.forEach((m,i)=>rail.setMatrixAt(i,m));rail.computeBoundingSphere();group.add(rail);
}
