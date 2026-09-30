// Matching Carlisle Parade shelters, positioned on saved OSM footprints.
// Local X follows its long north/south axis; only its immediate apron is replaced.
export function addCarlisleShelter(THREE,{scene,shared,convertPosition,terrainHeight,batchScenery},site={lat:50.85460675,lon:.579400525,yaw:1.723,footprint:941910059}){
 const g=new THREE.Group();g.name='Carlisle Parade concrete shelter';
 const p=convertPosition(site.lat,site.lon),yaw=site.yaw;
 const world=(x,z)=>({x:p.x+Math.cos(yaw)*x+Math.sin(yaw)*z,z:p.z-Math.sin(yaw)*x+Math.cos(yaw)*z});
 const base=Math.max(...[[-3.55,-2.2],[3.55,-2.2],[3.55,2.2],[-3.55,2.2]].map(([x,z])=>{const q=world(x,z);return terrainHeight(q.x,q.z)}))+.035;
 const floor=(x,z)=>{const q=world(x,z);return terrainHeight(q.x,q.z)+.035-base};
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.95}));
 const concrete=mat(0xcac9b8),red=mat(0xa51d29),wood=mat(0x242b28),paving=mat(0xa5a395),weathered=mat(0x8d8d7d);
 function box(w,h,d,x,y,z,m){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);g.add(mesh);return mesh;}
 // Flat inset apron, joined to the surrounding slope by a narrow tapered edge.
 const pos=[];const inner=[[-3.55,-2.2],[3.55,-2.2],[3.55,2.2],[-3.55,2.2]],outer=[[-3.9,-2.55],[3.9,-2.55],[3.9,2.55],[-3.9,2.55]];
 const point=(a,edge)=>[a[0],edge?floor(a[0],a[1]):0,a[1]];
 for(const i of [0,1,2,0,2,3])pos.push(...point(inner[i],false));
 for(let i=0;i<4;i++){const j=(i+1)%4;for(const v of [point(inner[i],false),point(outer[i],true),point(outer[j],true),point(inner[i],false),point(outer[j],true),point(inner[j],false)])pos.push(...v);}
 const apron=new THREE.BufferGeometry();apron.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));apron.computeVertexNormals();paving.side=THREE.DoubleSide;g.add(new THREE.Mesh(apron,paving));
 box(7.1,.48,4.15,0,3,0,concrete);
 box(5.65,2.62,.22,0,1.31,0,concrete);
 for(const side of [-1,1]){
  box(5.18,1.33,.025,0,1.19,side*.126,red);
  box(5.2,.12,.028,0,1.93,side*.13,wood);
  // Curved concrete end cheeks, open above bench height, supporting the canopy.
  for(const x of [-2.7,2.7]){
   const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(.58,0);s.lineTo(.58,.38);s.quadraticCurveTo(.43,.48,.43,1.05);s.lineTo(.43,1.87);s.quadraticCurveTo(.43,2.6,1.62,2.76);s.lineTo(0,2.76);s.closePath();
   const geom=new THREE.ExtrudeGeometry(s,{depth:.19,bevelEnabled:false,curveSegments:8});
   // shape horizontal coordinate is depth; extrusion becomes local X.
   geom.rotateY(side*Math.PI/2);const mesh=new THREE.Mesh(geom,concrete);mesh.position.x=x-side*.095;g.add(mesh);
  }
  for(let i=0;i<6;i++)box(5.12,.062,.08,0,.62+i*.085,side*(.37-i*.014),wood);
  for(let i=0;i<5;i++)box(5.18,.07,.095,0,.57,side*(.38+i*.095),wood);
  for(const x of [-2,-.67,.67,2])box(.09,.53,.48,x,.265,side*.57,wood);
  // Small subdued staining beneath the roof rather than extra texture downloads.
  for(let i=0;i<9;i++)box(.12+(i%3)*.06,.025+(i%4)*.012,.012,-2.65+i*.65,2.79,side*1.953,weathered);
 }
 // Return benches and matching red panels on both short ends.
 for(const end of [-1,1]){
  box(.16,2.62,1.08,end*2.71,1.31,0,concrete);
  box(.025,1.33,1.04,end*2.805,1.19,0,red);
  box(.028,.12,1.06,end*2.808,1.93,0,wood);
  for(let i=0;i<6;i++)box(.08,.062,2.65,end*(2.9-i*.014),.62+i*.085,0,wood);
  for(let i=0;i<5;i++)box(.095,.07,2.68,end*(2.91+i*.095),.57,0,wood);
  for(const z of [-.92,.92])box(.44,.53,.075,end*3.09,.265,z,wood);
 }
 // Three static adult figures, sitting on the level bench or standing on the apron.
 // Parts are baked with the shelter into material batches, with no animation cost.
 const skin=mat(0xb48b70),jacket=mat(0x25312e),navy=mat(0x303a43),denim=mat(0x46586a),cap=mat(0x687261),canRed=mat(0xb63c32),metal=mat(0xbec5c1);
 function person(x,z,seated,turn,coat,trousers,drinking){
  const pg=new THREE.Group();pg.position.set(x,0,z);pg.rotation.y=turn;
  function part(geom,m,px,py,pz){const mesh=new THREE.Mesh(geom,m);mesh.position.set(px,py,pz);pg.add(mesh);return mesh;}
  function block(w,h,d,px,py,pz,m){return part(new THREE.BoxGeometry(w,h,d),m,px,py,pz);}
  function limb(a,b,r,m){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),mesh=part(new THREE.CylinderGeometry(r,r*.92,va.distanceTo(vb),7),m,...va.clone().add(vb).multiplyScalar(.5).toArray());mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vb.sub(va).normalize());}
  const hip=seated?.68:.92,shoulder=hip+.47;
  block(.4,.5,.25,0,hip+.24,0,coat);
  part(new THREE.SphereGeometry(.145,8,6),skin,0,shoulder+.22,.015).scale.set(.88,1.16,.9);
  part(new THREE.CylinderGeometry(.14,.15,.07,8),cap,0,shoulder+.35,0);
  block(.23,.035,.17,0,shoulder+.32,.1,cap);
  for(const side of [-1,1]){const xx=side*.12,knee=seated?[xx,.49,.4]:[xx,.47,.035],ankle=[xx,.12,seated?.48:.03];limb([xx,hip,0],knee,.085,trousers);limb(knee,ankle,.068,trousers);block(.16,.12,.29,xx,.065,ankle[2]+.06,wood);}
  const hand=drinking?[.13,shoulder+.12,.2]:[.23,hip+.08,.38];
  limb([.23,shoulder-.02,0],[.3,hip+.21,.18],.075,coat);limb([.3,hip+.21,.18],hand,.062,coat);
  limb([-.23,shoulder-.02,0],[-.3,hip+.19,.2],.075,coat);limb([-.3,hip+.19,.2],[-.21,hip+.03,.37],.06,coat);
  for(const h of [hand,[-.21,hip+.03,.37]])part(new THREE.SphereGeometry(.061,6,5),skin,...h);
  part(new THREE.CylinderGeometry(.047,.047,.15,8),canRed,hand[0],hand[1]+.055,hand[2]+.048);
  part(new THREE.CylinderGeometry(.045,.045,.008,8),metal,hand[0],hand[1]+.133,hand[2]+.048);
  pg.updateMatrixWorld(true);for(const mesh of [...pg.children]){mesh.geometry.applyMatrix4(mesh.matrixWorld);mesh.position.set(0,0,0);mesh.quaternion.identity();mesh.scale.set(1,1,1);g.add(mesh);}
 }
 person(-.3,.54,true,0,jacket,denim,false);
 person(1.1,.54,true,-.12,navy,wood,true);
 person(-1.55,1.43,false,Math.PI*.78,jacket,navy,false);
 g.position.set(p.x,base,p.z);g.rotation.y=yaw;g.updateMatrixWorld(true);batchScenery({group:g});g.position.set(0,0,0);g.rotation.set(0,0,0);scene.add(g);
 g.userData={lat:site.lat,lon:site.lon,x:p.x,z:p.z,base,footprint:site.footprint};return g;
}
