// The three mapped premises between adventure golf and the wheel.
export const leisureKioskIds=new Set([945427895,945427888,945427892]);
let night=false;
const lamps=new Set(),materials=new Map();
export function setLeisureKioskTime(time){night=typeof time==='number'?time:time==='night'?1:0;for(const m of lamps)m.emissiveIntensity=night*1.8;}
export function buildLeisureKiosk(THREE,{poly,tile,seed,polygonShape,objectBox,terrainHeight,shared}){
 const group=tile.group,ps=poly.outer,minX=Math.min(...ps.map(p=>p.x)),maxX=Math.max(...ps.map(p=>p.x)),minZ=Math.min(...ps.map(p=>p.y)),maxZ=Math.max(...ps.map(p=>p.y)),cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,w=maxX-minX,d=maxZ-minZ,base=Math.max(...ps.map(p=>terrainHeight(p.x,p.y)));
 function mat(c,lit=false){const key=c+':'+lit;if(!materials.has(key)){const m=shared(new THREE.MeshStandardMaterial({color:c,roughness:.8,emissive:lit?c:0,emissiveIntensity:lit&&night?1.8:0}));materials.set(key,m);if(lit)lamps.add(m)}return materials.get(key)}
 const cream=mat(0xe8e0c9),brick=mat(0xb19b76),roof=mat(0x77776a),navy=mat(0x2f4d60),glass=mat(0x354b50),wood=mat(0x88735c),iron=mat(0x344644),pink=mat(0xee71b3,true),cyan=mat(0x65d6e2,true),yellow=mat(0xf0d178,true),white=mat(0xf2ecdc),skin=mat(0xc79c7c);
 const box=(ww,h,dd,x,y,z,m,yaw=0)=>objectBox(group,ww,h,dd,x,y,z,m,yaw);
 function sign(label,x,y,z,width,bg,ink,yaw=0){
  const key='sign:'+label;if(!materials.has(key)){const c=document.createElement('canvas');c.width=1024;c.height=160;const k=c.getContext('2d');k.fillStyle=bg;k.fillRect(0,0,1024,160);k.fillStyle=ink;k.textAlign='center';k.textBaseline='middle';k.font='bold 72px Georgia';k.fillText(label,512,80,990);const t=shared(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;const m=shared(new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:night?1.8:0,roughness:.85}));materials.set(key,m);lamps.add(m)}
  const p=new THREE.Mesh(new THREE.PlaneGeometry(width,.52),materials.get(key));p.position.set(x,y,z);p.rotation.y=yaw;group.add(p);
 }
 function hip(x,z,ww,dd,h,rise){const a=[x-ww/2,h,z-dd/2],b=[x+ww/2,h,z-dd/2],c=[x+ww/2,h,z+dd/2],e=[x-ww/2,h,z+dd/2],r=[x-ww*.25,h+rise,z],t=[x+ww*.25,h+rise,z],v=[];for(const p of [a,r,t,a,t,b,e,c,t,e,t,r,a,e,r,b,t,c])v.push(...p);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();const mesh=new THREE.Mesh(g,roof);mesh.material.side=THREE.DoubleSide;mesh.castShadow=true;group.add(mesh)}
 function patio(x,z,index){const y=terrainHeight(x,z)-base;box(1.1,.1,.7,x,y+.77,z,wood);box(.1,.72,.1,x,y+.36,z,iron);
  for(const side of [-1,1]){const xx=x+side*.82;box(.45,.09,.45,xx,y+.42,z,iron);box(.07,.7,.46,xx+side*.19,y+.69,z,iron);for(const q of [-.16,.16])box(.04,.4,.4,xx+q,y+.2,z,iron);
   if((index+side)%3===0)continue;const shirt=mat([0x628eac,0xa97469,0x8d9869][index%3]);box(.34,.45,.29,xx,y+.73,z,shirt);box(.45,.15,.27,xx-side*.1,y+.48,z,navy);for(const dz of [-.1,.1])box(.12,.4,.13,xx-side*.26,y+.24,z+dz,navy);const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.15,1),skin);head.position.set(xx,y+1.1,z);group.add(head);box(.09,.16,.09,x+side*.25,y+.9,z,white);
  }
 }
 if(seed===945427895){
  // Three small hipped-roof kiosks on the long cafe footprint, with little roof turrets.
  for(let i=0;i<3;i++){
   const z=minZ+5+i*(d-10)/2,ww=Math.min(w-1,8),dd=Math.min(7,d/3-.4);
   box(ww,2.65,dd,cx,1.33,z,i===1?cream:brick);hip(cx,z,ww+.6,dd+.6,2.7,1.3);
   box(ww-.5,1.7,.1,cx,1.4,z-dd/2-.06,glass);for(const dx of [-ww*.3,0,ww*.3])box(.09,2.3,.16,cx+dx,1.2,z-dd/2-.13,cream);
   box(.12,1.6,dd-.5,cx+ww/2+.03,1.4,z,glass);box(.15,.1,dd-.3,cx+ww/2+.1,1.4,z,cream);
   box(1.05,.65,1.05,cx,4,z,cream);const cone=new THREE.Mesh(new THREE.ConeGeometry(.95,1,8),roof);cone.position.set(cx,4.8,z);group.add(cone);
   sign(['TURRET COFFEE','SCOOP & SWIRL','THE LITTLE GALLEY'][i],cx,2.85,z-dd/2-.35,ww-.3,'#e8e0c9','#3b6b7d',Math.PI);
   box(ww,.055,.055,cx,2.56,z-dd/2-.18,[cyan,pink,yellow][i]);
   // Seating stays beside the kiosks, inside their existing site envelope.
   patio(maxX-1.1,z-1.3,i);patio(maxX-1.1,z+1.5,i+3);
   box(.6,.65,1.2,maxX-.6,.33,z+3,navy);box(.7,.45,1.25,maxX-.6,.8,z+3,mat(0x647d46));
  }
 }else if(seed===945427888){
  const g=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:3,bevelEnabled:false,steps:1});g.rotateX(Math.PI/2);const body=new THREE.Mesh(g,navy);body.position.y=3;body.castShadow=true;body.receiveShadow=true;group.add(body);
  hip(cx,cz,w+.35,d+.35,3.05,1.4);
  // Low navy club, projecting entrance and small roof lanterns.
  box(Math.min(w,8),3.7,2,cx,1.85,minZ+1,navy);hip(cx,minZ+1,Math.min(w,8)+.3,2.5,3.75,1.1);
  box(1.35,2.4,.16,cx,1.2,minZ-.12,iron);box(.42,.55,.05,cx,1.7,minZ-.22,glass);
  sign('SEABREEZE ANGLING CLUB',cx,2.73,minZ-.25,Math.min(w-.4,11),'#2f4d60','#e8e0c9',Math.PI);
  for(const side of [-1,1]){box(2,1.1,.12,cx+side*w*.3,1.65,minZ-.07,cream);box(1.8,.9,.14,cx+side*w*.3,1.65,minZ-.15,glass);box(1,.15,.5,cx+side*w*.34,.9,minZ-.42,wood);box(1.1,.45,.55,cx+side*w*.34,1.15,minZ-.42,mat(0x617548))}
  box(w-.3,.05,.06,cx,2.95,minZ-.2,cyan);
 }else{
  // Open donut/sweet counter: bright raised awning, visible stock and no closed shutters.
  const ww=Math.max(w,5),dd=Math.max(d,3.5);
  box(ww,.7,dd,cx,.35,cz,pink);box(ww,2.5,.18,cx,1.4,maxZ,navy);
  for(const x of [cx-ww/2,cx+ww/2])box(.13,2.8,dd,x,1.4,cz,mat(0xd45a69));
  box(ww+.5,.16,dd+.6,cx,2.85,cz,cyan);box(ww,.15,.8,cx,.95,minZ-.3,yellow);
  for(let i=0;i<12;i++){const x=cx-ww/2+.2+i*(ww-.4)/11;box((ww-.3)/12,.07,1,x,2.9,minZ-.25,[pink,cyan,yellow][i%3]);box(.07,.08,.07,x,2.7,minZ-.7,[pink,cyan,yellow][i%3])}
  sign('SUGAR TIDE · DONUTS & SWEETS',cx,3.23,minZ-.2,ww+.5,'#ed88b9','#58365f',Math.PI);
  for(let row=0;row<3;row++){
   box(ww-.35,.09,.45,cx,1.15+row*.42,cz,cream);
   for(let j=0;j<10;j++){const x=cx-ww/2+.35+j*(ww-.7)/9;const donut=new THREE.Mesh(new THREE.TorusGeometry(.13,.055,5,10),[pink,yellow,cyan][(j+row)%3]);donut.position.set(x,1.36+row*.42,cz-.18);group.add(donut)}
  }
  for(let j=0;j<7;j++)box(.21,.3+(j%3)*.07,.2,cx-ww/2+.4+j*(ww-.8)/6,1.15,minZ-.25,[pink,cyan,yellow][j%3]);
  const vendor=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,1),skin);vendor.position.set(cx+.6,1.85,cz+.6);group.add(vendor);box(.45,.65,.3,cx+.6,1.34,cz+.6,cream);
 }
}
