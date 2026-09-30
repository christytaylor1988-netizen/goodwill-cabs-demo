// East Hill Cliff Railway — OSM way 187263096, fetched 2026-09-28.
// Lower station footprint 289108011 is replaced by this landmark.
export function createEastHillLift(THREE,api){
 const {scene,shared,convertPosition,terrainHeight,objectBox,cylinder,batchScenery,textSign}=api;
 const lower=convertPosition(50.8563763,.5947674),upper=convertPosition(50.8568166,.5953367),dx=upper.x-lower.x,dz=upper.z-lower.z,length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length,nx=uz,nz=-ux,yaw=Math.atan2(dx,dz),base=terrainHeight(lower.x,lower.z),rise=45;
 const group=new THREE.Group();group.name='East Hill Lift · mapped alignment';scene.add(group);
 const staticGroup=new THREE.Group();group.add(staticGroup);
 const material=(c)=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.95}));
 const stone=material(0x9b927f),trim=material(0xc4b9a0),ballast=material(0x716b5d),steel=material(0xa4a9a5),timber=material(0x514c43),red=material(0xa82725),cream=material(0xe1d9be),glass=material(0x38565e),dark=material(0x25312d),green=material(0x75845b);
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#635f55';ctx.fillRect(0,0,256,256);for(let j=0;j<8;j++)for(let i=-1;i<6;i++){const k=(i+7)*37+j*19,v=130+(k*17%37);ctx.fillStyle=`rgb(${v},${v-9},${v-23})`;ctx.fillRect(i*56+(j%2)*28+2,j*32+2,53,29)}const tex=shared(new THREE.CanvasTexture(c));tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.colorSpace=THREE.SRGBColorSpace;stone.map=tex;
 const p=(s,l=0,h=0)=>new THREE.Vector3(lower.x+ux*s+nx*l,base+h,lower.z+uz*s+nz*l);
 const trackY=s=>rise*s/length;
 const box=(parent,m,s,l,y,w,h,d)=>{const q=p(s,l,y);return objectBox(parent,w,h,d,q.x,q.y,q.z,m,yaw)};
 function beam(parent,m,a,b,w,d=w){const mid=a.clone().add(b).multiplyScalar(.5),mesh=new THREE.Mesh(new THREE.BoxGeometry(w,a.distanceTo(b),d),m);mesh.position.copy(mid);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());parent.add(mesh);return mesh}
 // Broad, irregular cliff. Keep vertex colours outside batchScenery (which merges only position/normal/UV).
 const obstacles=(api.buildingRings||[]).filter(r=>r.some(v=>Math.hypot(v.x-upper.x,v.y-upper.z)<145));
 function clearance(x,z){let nearest=1000;for(const ring of obstacles){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++) {const a=ring[j],b=ring[i];if((a.y>z)!==(b.y>z)&&x<(b.x-a.x)*(z-a.y)/(b.y-a.y)+a.x)inside=!inside;const dx=b.x-a.x,dz=b.y-a.y,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.y)*dz)/(dx*dx+dz*dz||1),0,1);nearest=Math.min(nearest,Math.hypot(x-a.x-dx*t,z-a.y-dz*t));}if(inside)return 0;}return nearest;}
 const roadEdges=[];for(const road of api.roads||[]){const nodes=(road.geometry||[]).map(n=>convertPosition(n.lat,n.lon));for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i];if(Math.min(Math.hypot(a.x-upper.x,a.z-upper.z),Math.hypot(b.x-upper.x,b.z-upper.z))<180)roadEdges.push({a,b,margin:api.roadWidthForType(road.tags?.highway)/2+3});}}
 function roadClearance(x,z){let result=1000;for(const {a,b,margin} of roadEdges){const dx=b.x-a.x,dz=b.z-a.z,t=THREE.MathUtils.clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);result=Math.min(result,Math.hypot(x-a.x-dx*t,z-a.z-dz*t)-margin);}return result;}
 function bank(s,l){
  const q=p(s,l),ground=terrainHeight(q.x,q.z),width=(l<0?57:67)+5*Math.sin(s*.071)+3*Math.sin(s*.19),shoulder=THREE.MathUtils.smoothstep(Math.abs(l),4,14),side=1-THREE.MathUtils.smoothstep(Math.abs(l),12,width),end=1-THREE.MathUtils.smoothstep(s,length+12,length+66),start=THREE.MathUtils.smoothstep(s,-5,14);
  const crest=base+trackY(THREE.MathUtils.clamp(s,0,length))-.34,rough=shoulder*(2.6*Math.sin(s*.15+l*.12)+1.5*Math.sin(l*.38-s*.21)),target=crest+shoulder*(3+rough),protect=THREE.MathUtils.smoothstep(clearance(q.x,q.z),2,12)*THREE.MathUtils.smoothstep(roadClearance(q.x,q.z),0,10);
  const influence=side*end*(Math.abs(l)<4&&s>=0?1:start*protect),height=ground+.045+Math.max(0,target-ground)*influence;
  return [q.x,height,q.z];
 }
 const verts=[],colours=[];
 for(let s=-6;s<length+66;s+=2)for(let l=-78;l<78;l+=2){
  const a=bank(s,l),b=bank(s+2,l),c=bank(s,l+2),d=bank(s+2,l+2);
  for(const tri of [[a,b,c],[b,d,c]]){const normal=new THREE.Vector3().subVectors(new THREE.Vector3(...tri[1]),new THREE.Vector3(...tri[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...tri[2]),new THREE.Vector3(...tri[0]))).normalize();
   for(const v of tri){verts.push(...v);const patch=Math.sin(v[0]*.14+v[2]*.06)+.6*Math.sin(v[2]*.29-v[0]*.09),grass=normal.y>.68||patch>1.04,band=.035*Math.sin(v[1]*2.3)+.024*Math.sin(v[0]*.63+v[2]*.41);const col=grass?[.25,.32,.12]:[.48,.42,.30];colours.push(...col.map(c=>c+band));}
  }
 }
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geom.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geom.computeVertexNormals();
 const rock=shared(new THREE.MeshStandardMaterial({vertexColors:true,roughness:1})),bankMesh=new THREE.Mesh(geom,rock);bankMesh.name='East Hill supported sandstone cliff';bankMesh.receiveShadow=true;group.add(bankMesh);
 // Deterministic scrub clusters, with clear track and building margins.
 const bushGeo=new THREE.IcosahedronGeometry(1,0),scrubMaterials=[green,material(0x596b38),material(0x879060)];
 for(let i=0;i<155;i++){const s=9+((i*47.37)%105),l=-59+((i*31.73)%118);if(Math.abs(l)<7)continue;const v=bank(s,l);if(clearance(v[0],v[2])<7||v[1]-terrainHeight(v[0],v[2])<.8)continue;const bush=new THREE.Mesh(bushGeo,scrubMaterials[i%3]);bush.position.set(v[0],v[1]+.35,v[2]);bush.scale.set(1.1+(i%5)*.25,.55+(i%3)*.2,1.2+(i%4)*.3);staticGroup.add(bush);}
 for(const lane of [-1.7,1.7]){
  beam(staticGroup,ballast,p(0,lane,.0),p(length,lane,rise),2.75,.4);
  for(let s=0;s<=length;s+=1.4)beam(staticGroup,timber,p(s,lane-1.13,trackY(s)+.13),p(s,lane+1.13,trackY(s)+.13),.13,.22);
  for(const off of [-.76,.76])beam(staticGroup,steel,p(0,lane+off,.28),p(length,lane+off,rise+.28),.075,.075);
  beam(staticGroup,dark,p(0,lane,.21),p(length,lane,rise+.21),.025);
 }
 for(const l of [-3.5,3.5])beam(staticGroup,trim,p(0,l,.0),p(length,l,rise),.28,.65);
 function station(s,y,upperStation){
  const h=upperStation?6.4:4.6,d=upperStation?6:7;
  const footing=upperStation?3:5;box(staticGroup,stone,s,0,y-footing/2,11,footing,d);
  for(const l of [-4.1,4.1]){box(staticGroup,stone,s,l,y+h/2,2.7,h,d);box(staticGroup,trim,s,l,y+h+.08,2.95,.23,d+.2);for(const off of [-.85,.85])box(staticGroup,stone,s-d/2+.15,l+off,y+h+.5,.55,.8,.55);for(const side of [-1,1])box(staticGroup,glass,s+side*(d/2+.025),l,y+h*.63,.7,1.35,.05)}
  box(staticGroup,stone,s+1.3,0,y+h-.65,5.5,1.3,d-2.6);
  // Eight shallow arch stones frame the central double-track opening.
  for(let i=0;i<9;i++){const a=i*Math.PI/8,q=p(s-d/2,2.8*Math.cos(a),y+3+1.45*Math.sin(a));const mesh=new THREE.Mesh(new THREE.BoxGeometry(.66,.4,.42),trim);mesh.position.copy(q);mesh.rotation.set(0,yaw,0);staticGroup.add(mesh)}
  if(upperStation)box(staticGroup,dark,s+2.4,0,y+2,5.4,4,.1);
 }
 station(length+1,rise,true);station(-5,-.2,false);
 for(let i=0;i<6;i++)box(staticGroup,trim,-8.8-i*.85,0,-.4-i*.38,4.8,.4,.9);
 const label=p(-8.6,0,4.35);textSign(staticGroup,'EAST HILL LIFT',5.2,.58,label.x,label.y,label.z,'#e2d8bf','#34483d',yaw+Math.PI);
 batchScenery({group:staticGroup});
 const cars=[];for(const lane of [-1.7,1.7]){
  const car=new THREE.Group();car.rotation.y=yaw;group.add(car);
  objectBox(car,2.32,1.05,4.3,0,2.05,0,red);objectBox(car,2.32,1.5,4.3,0,3.25,0,cream);
  for(const l of [-1,1])for(const z of [-1.35,0,1.35])objectBox(car,.04,1.12,1.06,l*1.175,3.3,z,glass);
  for(const z of [-2.17,2.17]){objectBox(car,1.85,1.12,.04,0,3.3,z,glass);objectBox(car,.08,1.3,.06,0,3.3,z,cream)}
  objectBox(car,2.55,.24,4.65,0,4.13,0,cream);
  for(const z of [-1.55,1.55]){objectBox(car,1.8,.3,.4,0,trackY(z)+.5,z,dark);for(const x of [-.76,.76]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.16,8),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,trackY(z)+.47,z);car.add(wheel)}}
  car.rotation.y=0;batchScenery({group:car});car.rotation.y=yaw;cars.push({group:car,lane});
 }
 function update(time){const cycle=(time%100)/100,t=.5-.5*Math.cos(cycle*Math.PI*2);cars.forEach((c,i)=>{const s=4+(length-8)*(i?1-t:t);c.group.position.copy(p(s,c.lane,trackY(s)))})}update(16);
 return {group,cars,lower,upper,length,rise,update,contains(x,z,padding=0){const rx=x-lower.x,rz=z-lower.z,s=rx*ux+rz*uz,l=rx*nx+rz*nz;return s>-12&&s<length+28&&Math.abs(l)<8+padding}};
}
