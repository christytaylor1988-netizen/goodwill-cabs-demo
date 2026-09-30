import {warriorData} from './warrior-data.js';
export function createWarriorGardens(THREE,{shared,registerBarrier,convertPosition,terrainHeight,inPolygon,polygonShape,batchScenery}){
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.88}));
 const iron=mat(0x263b38),stone=mat(0xa88d7a),baseStone=mat(0xaba79b),bronze=mat(0x455e53),soil=mat(0x554638),leaves=mat(0x49633c);
 const blooms=[0xd75377,0xeab544,0x8b68bf,0xe8ded0,0xc54948].map(mat);
 const flowerGeo=shared(new THREE.IcosahedronGeometry(1,0));
 const registered=new Set();
 const stats={railMetres:0,flowerbeds:0,flowers:0,statues:0};
 function populate(parent){
  const g=new THREE.Group();g.name='Warrior Square · statue, beds and garden railings';stats.railMetres=stats.flowerbeds=stats.flowers=stats.statues=0;
  function box(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
  function rod(a,b,r,m=iron){const v=new THREE.Vector3().subVectors(b,a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),5),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());g.add(o)}
  // Preserve the mapped entrance gaps. Low hoops follow the actual lawn perimeter.
  const line=[];
  for(const rail of warriorData.rails){const ps=rail.points.map(p=>convertPosition(p.lat,p.lon));for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<.03)continue;const key=a.x+','+a.z+','+b.x+','+b.z;if(!registered.has(key)){registerBarrier(a,b,.05);registered.add(key);}stats.railMetres+=len;const n=Math.ceil(len/.42),step=len/n,point=(d,h)=>{const x=a.x+dx*d/len,z=a.z+dz*d/len;return new THREE.Vector3(x,terrainHeight(x,z)+h,z)};
   for(const h of [.18,.66]){const aa=point(0,h),bb=point(len,h);line.push(...aa.toArray(),...bb.toArray())}
   for(let j=0;j<n;j++){const start=j*step;let prev=point(start,.04);for(let k=0;k<=8;k++){const t=k/8*Math.PI,p=point(start+step*(.5-.5*Math.cos(t)),.80+.16*Math.sin(t));line.push(...prev.toArray(),...p.toArray());prev=p}line.push(...prev.toArray(),...point(start+step,.04).toArray())}
   for(let d=0;d<len;d+=3){const p=point(d,.53);rod(point(d,.02),point(d,1.04),.043);const cap=new THREE.Mesh(new THREE.SphereGeometry(.075,6,4),iron);cap.position.copy(point(d,1.09));g.add(cap)}
  }}
  const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(line,3));g.add(new THREE.LineSegments(lineGeo,shared(new THREE.LineBasicMaterial({color:0x24332f}))));
  let seed=91012;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const flowerPoints=blooms.map(()=>[]),leafPoints=[];
  for(const [idx,bed] of warriorData.beds.entries()){
   const poly={outer:bed.points.map(p=>{const v=convertPosition(p.lat,p.lon);return new THREE.Vector2(v.x,v.z)}),holes:[]};const geo=new THREE.ShapeGeometry(polygonShape(poly));geo.rotateX(Math.PI/2);const v=geo.attributes.position;for(let i=0;i<v.count;i++)v.setY(i,terrainHeight(v.getX(i),v.getZ(i))+.07);geo.computeVertexNormals();const sm=soil.clone();sm.side=THREE.DoubleSide;g.add(new THREE.Mesh(geo,shared(sm)));stats.flowerbeds++;
   const xs=poly.outer.map(p=>p.x),zs=poly.outer.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
   for(let x=x0+.3;x<x1;x+=.55)for(let z=z0+.3;z<z1;z+=.55){const px=x+(rand()-.5)*.26,pz=z+(rand()-.5)*.26;if(!inPolygon(px,pz,poly))continue;const y=terrainHeight(px,pz);leafPoints.push([px,y+.17,pz,.31,.18]);flowerPoints[idx%blooms.length].push([px,y+.33+rand()*.09,pz,.17+rand()*.09,.14]);stats.flowers++}
  }
  function instances(points,m){const mesh=new THREE.InstancedMesh(flowerGeo,m,points.length),o=new THREE.Object3D();points.forEach(([x,y,z,r,h],i)=>{o.position.set(x,y,z);o.scale.set(r,h,r);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)});mesh.receiveShadow=true;g.add(mesh)}
  instances(leafPoints,leaves);flowerPoints.forEach((ps,i)=>instances(ps,blooms[i]));
  // Victoria: stepped pinkish stone pedestal and a bronze draped standing figure.
  // Overall height ~5m, estimated from the photo, at the cached OSM artwork location.
  const p=convertPosition(warriorData.statue.lat,warriorData.statue.lon),y=terrainHeight(p.x,p.z),x=p.x,z=p.z;
  box(2.75,.22,2.75,x,y+.11,z,baseStone);box(2.35,.58,2.35,x,y+.51,z,stone);box(1.85,1.62,1.85,x,y+1.61,z,stone);box(2.25,.24,2.25,x,y+2.54,z,stone);box(1.18,.16,1.04,x,y+2.74,z,bronze);
  function form(r1,r2,h,cx,cy,cz){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,9),bronze);o.position.set(cx,cy,cz);o.castShadow=true;g.add(o);return o}
  form(.28,.57,1.45,x,y+3.51,z);form(.31,.27,.58,x,y+4.23,z);const head=new THREE.Mesh(new THREE.SphereGeometry(.21,9,7),bronze);head.scale.set(.88,1.18,1);head.position.set(x,y+4.77,z+.06);g.add(head);form(.20,.20,.10,x,y+4.97,z+.03);
  const cloak=form(.31,.62,1.65,x,y+3.63,z-.19);cloak.scale.z=.70;
  rod(new THREE.Vector3(x-.28,y+4.4,z),new THREE.Vector3(x-.42,y+3.75,z+.16),.11,bronze);rod(new THREE.Vector3(x+.27,y+4.4,z),new THREE.Vector3(x+.22,y+4.02,z+.39),.11,bronze);
  for(let i=0;i<6;i++){const a=(i/5-.5)*2.3;rod(new THREE.Vector3(x+Math.sin(a)*.24,y+4.08,z+Math.cos(a)*.23),new THREE.Vector3(x+Math.sin(a)*.5,y+2.85,z+Math.cos(a)*.49),.023,bronze)}
  stats.statues=1;batchScenery({group:g});parent.add(g);
 }
 return {populate,stats};
}
