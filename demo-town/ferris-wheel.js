// Fixed development placement beside OSM Marine Parade Station (node 967684967).
// Dimensions are a photo-based approximation; independently editable for filming.
export const wheelSite={lat:50.854976,lon:.588758,radius:9.5,hubHeight:12.1,cabins:20,turnSeconds:110,yaw:Math.PI/2-.10};
export function createFerrisWheel(THREE,{scene,taxi,shared,convertPosition,terrainHeight,batchScenery}){
 const root=new THREE.Group();root.name='Marine Parade Ferris wheel';
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.76})),pale=mat(0xf0efea),metal=mat(0x9babae),dark=mat(0x445258),base=mat(0x878c87);
 const rotor=new THREE.Group(),frame=new THREE.Group();
 const lights=new THREE.Group(),colours=[0xff5b3b,0xffcd55,0xda51e8,0x5389ff];
 const lit=colours.map(color=>shared(new THREE.MeshBasicMaterial({color,toneMapped:false})));
 function box(g,w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o}
 function rod(g,a,b,r,m){const v=new THREE.Vector3().subVectors(b,a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),5),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());g.add(o)}
 const vec=(x,y,z)=>new THREE.Vector3(x,y,z),r=wheelSite.radius,n=wheelSite.cabins;
 // Twin rims, cross-bracing and radial spokes; geometry merged once before animation.
 for(const z of [-.85,.85]){
  const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.085,5,80),pale);rim.position.z=z;rotor.add(rim);
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n,end=vec(Math.cos(a)*r,Math.sin(a)*r,z);rod(rotor,vec(0,0,z*.3),end,.05,pale);rod(rotor,vec(Math.cos(b)*r*.57,Math.sin(b)*r*.57,z),end,.024,metal);
   rod(lights,vec(Math.cos(a)*.65,Math.sin(a)*.65,z*1.04),vec(Math.cos(a)*r,Math.sin(a)*r,z*1.04),.06,lit[i%4]);
   for(let j=0;j<4;j++){const u=a+(b-a)*j/4,v=a+(b-a)*(j+1)/4;rod(lights,vec(Math.cos(u)*r,Math.sin(u)*r,z*1.04),vec(Math.cos(v)*r,Math.sin(v)*r,z*1.04),.075,lit[i%4])}
  }
 }
 for(let i=0;i<n;i++){const a=i*Math.PI*2/n;rod(rotor,vec(Math.cos(a)*r,Math.sin(a)*r,-.85),vec(Math.cos(a)*r,Math.sin(a)*r,.85),.05,metal)}
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,2.6,12),pale);hub.rotation.x=Math.PI/2;rotor.add(hub);
 const hubLamp=new THREE.Mesh(new THREE.SphereGeometry(.59,12,8),lit[1]);hubLamp.scale.z=2.4;lights.add(hubLamp);
 batchScenery({group:rotor});batchScenery({group:lights});for(const m of lights.children)m.castShadow=false;rotor.add(lights);rotor.position.y=wheelSite.hubHeight;root.add(rotor);
 for(const z of [-1.7,1.7])for(const x of [-4.6,4.6]){rod(frame,vec(x,.25,z*1.9),vec(0,wheelSite.hubHeight,z*.6),.18,pale);box(frame,2.1,.35,1.9,x,.18,z*1.9,base)}
 for(const z of [-3.2,3.2])rod(frame,vec(-4.6,1.5,z),vec(4.6,1.5,z),.08,metal);
 box(frame,9,.2,6,0,.26,0,base);batchScenery({group:frame});root.add(frame);
 // Shared cabin geometry is instanced. Its transform is translation only, so gravity
 // stays vertical regardless of wheel angle; no physics solver or counter-rotation drift.
 const prototype=new THREE.Group();box(prototype,1.28,.10,1.15,0,-1.72,0,pale);box(prototype,1.45,.10,1.30,0,-.20,0,pale);
 for(const z of [-.52,.52]){box(prototype,1.22,.62,.07,0,-1.36,z,pale);for(const x of [-.57,0,.57])rod(prototype,vec(x,-1.68,z),vec(x,-.20,z),.027,metal)}
 for(const x of [-.59,.59]){box(prototype,.07,.62,1.04,x,-1.36,0,pale);rod(prototype,vec(x,-1.68,0),vec(x,-.20,0),.027,metal)}
 box(prototype,1.03,.09,.32,0,-1.35,.22,dark);rod(prototype,vec(0,0,0),vec(0,-.20,0),.055,metal);batchScenery({group:prototype});
 const cabinBatches=prototype.children.map(o=>{const mesh=new THREE.InstancedMesh(shared(o.geometry),o.material,n);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;root.add(mesh);return mesh});
 const glowProto=new THREE.Group();for(const z of [-.56,.56]){rod(glowProto,vec(-.65,-1.65,z),vec(.65,-1.65,z),.03,lit[0]);for(const x of [-.65,.65])rod(glowProto,vec(x,-1.65,z),vec(x,-.2,z),.03,lit[0])}batchScenery({group:glowProto});
 const cabinLights=new THREE.InstancedMesh(shared(glowProto.children[0].geometry),lit[0],n);cabinLights.instanceMatrix.setUsage(THREE.DynamicDrawUsage);cabinLights.frustumCulled=false;for(let i=0;i<n;i++)cabinLights.setColorAt(i,new THREE.Color(colours[i%4]));root.add(cabinLights);
 // White base material allows independent instance colours rather than tinting them red.
 cabinLights.material=shared(new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}));
 const p=convertPosition(wheelSite.lat,wheelSite.lon);root.position.set(p.x,terrainHeight(p.x,p.z)+.2,p.z);root.rotation.y=wheelSite.yaw;
 // Footings reach into the existing terrain at every support; no terrain edits.
 for(const x of [-4.6,4.6])for(const z of [-3.23,3.23]){const wx=p.x+x*Math.cos(wheelSite.yaw)+z*Math.sin(wheelSite.yaw),wz=p.z-x*Math.sin(wheelSite.yaw)+z*Math.cos(wheelSite.yaw),lo=terrainHeight(wx,wz)-root.position.y-.25;box(root,2.1,Math.max(.2,.35-lo),1.9,x,(lo+.35)/2,z,base)}
 scene.add(root);let night=false;const dummy=new THREE.Object3D();
 function setTime(time){night=time==='night';lights.visible=cabinLights.visible=night}
 function update(t){root.visible=taxi.position.distanceToSquared(root.position)<1400*1400;if(!root.visible)return;const angle=t*Math.PI*2/wheelSite.turnSeconds;rotor.rotation.z=angle;for(let i=0;i<n;i++){const a=i*Math.PI*2/n+angle;dummy.position.set(Math.cos(a)*r,wheelSite.hubHeight+Math.sin(a)*r,0);dummy.updateMatrix();for(const b of cabinBatches)b.setMatrixAt(i,dummy.matrix);cabinLights.setMatrixAt(i,dummy.matrix)}for(const b of [...cabinBatches,cabinLights])b.instanceMatrix.needsUpdate=true}
 setTime('afternoon');update(0);return {update,setTime,root,rotor,cabinBatches,cabinLights,get night(){return night}};
}
