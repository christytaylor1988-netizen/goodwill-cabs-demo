// Three quiet, static pavement figures beside the red supermarket frontage.
export function addRoundaboutLocals(THREE,{scene,shared,convertPosition,terrainHeight,batchScenery}){
 const group=new THREE.Group();group.name='Supermarket pavement locals and dog';
 const mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:1}));
 const olive=mat(0x626357),navy=mat(0x414b55),brown=mat(0x76675a),denim=mat(0x56616b),dark=mat(0x343331),skin=mat(0xc1977a),skin2=mat(0x986f55),grey=mat(0x92908a),can=mat(0x938c5f),silver=mat(0xb5b8b5),fur=mat(0x81644d);
 const cube=shared(new THREE.BoxGeometry(1,1,1)),ball=shared(new THREE.SphereGeometry(1,8,6)),rod=shared(new THREE.CylinderGeometry(1,1,1,6));
 function part(g,geo,m,p,s){const mesh=new THREE.Mesh(geo,m);mesh.position.set(...p);mesh.scale.set(...s);g.add(mesh);return mesh;}
 function box(g,m,p,s){return part(g,cube,m,p,s);}
 function limb(g,a,b,r,m){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va),mesh=part(g,rod,m,va.add(vb).multiplyScalar(.5).toArray(),[r,delta.length(),r]);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return mesh;}
 function person(lat,lon,pose,coat,skinMat,turn){
  const p=convertPosition(lat,lon),g=new THREE.Group();g.position.set(p.x,terrainHeight(p.x,p.z)+.08,p.z);g.rotation.y=turn;group.add(g);
  const seated=pose==='sit',hip=seated?.25:.88,shoulder=hip+.52;
  box(g,coat,[0,hip+.27,0],[.44,.57,.29]).rotation.x=pose==='lean'?-.1:.04;
  // Muted layers, uneven hem and small worn patches rather than exaggerated features.
  box(g,grey,[0,hip+.04,.02],[.39,.12,.3]);box(g,brown,[-.13,hip+.15,.157],[.10,.08,.012]);
  part(g,ball,skinMat,[0,shoulder+.22,.025],[.145,.18,.145]);part(g,ball,pose==='lean'?grey:dark,[0,shoulder+.34,.005],[.15,.085,.15]);
  part(g,ball,brown,[0,shoulder+.13,.086],[.12,.055,.09]);
  for(const side of [-1,1]){
   const knee=[side*.13,seated?.16:.46,seated?.38:side*.06],ankle=[side*.16,.10,seated?.72:.04];
   limb(g,[side*.12,hip,0],knee,.087,denim);limb(g,knee,ankle,.072,denim);box(g,dark,[ankle[0],.065,ankle[2]+.07],[.18,.13,.30]);
  }
  const right=pose==='stand'?[.23,hip+.3,.32]:[.25,hip+.02,.30];
  limb(g,[.25,shoulder,0],[.32,hip+.22,.10],.073,coat);limb(g,[.32,hip+.22,.10],right,.065,coat);
  const left=seated?[-.26,.40,.34]:[-.29,hip-.04,.08];limb(g,[-.25,shoulder,0],left,.073,coat);
  for(const hand of [right,left])part(g,ball,skinMat,hand,[.065,.08,.065]);
  if(pose==='stand'){part(g,rod,can,[right[0],right[1]+.08,right[2]+.04],[.047,.15,.047]);part(g,rod,silver,[right[0],right[1]+.16,right[2]+.04],[.044,.009,.044]);}
  return g;
 }
 // Close to the facade: well inside the pavement, clear of the roundabout lane.
 person(50.8552145,.583035,'stand',olive,skin,.3);
 person(50.8552170,.583059,'sit',brown,skin2,-.18);
 person(50.8552185,.583087,'lean',navy,skin,-.18);
 const p=convertPosition(50.855207,.583046),dog=new THREE.Group();dog.position.set(p.x,terrainHeight(p.x,p.z)+.08,p.z);dog.rotation.y=.65;group.add(dog);
 part(dog,ball,fur,[0,.43,0],[.20,.22,.40]);part(dog,ball,fur,[0,.66,.30],[.16,.18,.18]);part(dog,ball,brown,[0,.60,.45],[.105,.085,.15]);
 for(const side of [-1,1]){part(dog,ball,dark,[side*.14,.70,.28],[.065,.14,.075]);for(const z of [-.24,.23])limb(dog,[side*.13,.42,z],[side*.14,.055,z],.045,fur);}
 limb(dog,[0,.48,-.30],[0,.65,-.61],.04,fur);box(dog,olive,[0,.53,.26],[.31,.065,.08]);
 // Slack lead to the standing figure's lowered hand.
 const owner=convertPosition(50.8552145,.583035),base=terrainHeight(owner.x,owner.z)+.08;
 limb(group,[owner.x-.25,base+.82,owner.z+.05],[(owner.x+p.x)/2,base+.43,(owner.z+p.z)/2],.009,dark);
 limb(group,[(owner.x+p.x)/2,base+.43,(owner.z+p.z)/2],[p.x,base+.55,p.z+.25],.009,dark);
 // Bake all poses into material batches: no per-frame NPC work.
 group.updateMatrixWorld(true);const meshes=[];group.traverse(o=>{if(o.isMesh)meshes.push(o);});
 for(const mesh of meshes){mesh.geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);mesh.position.set(0,0,0);mesh.quaternion.identity();mesh.scale.set(1,1,1);group.add(mesh);}
 for(const child of [...group.children])if(!child.isMesh)group.remove(child);
 batchScenery({group});scene.add(group);

 return group;
}
