// Static station landmark based on the supplied frontage photographs.
// No updates, animation, lights or external assets: geometry is batched by material.
export function addHastingsStation(THREE,{scene,shared,convertPosition,terrainHeight,batchScenery,registerBuilding,landmarkPolys,findNearestRoadPoint,roadWidthForType}){
 const g=new THREE.Group();g.name='Hastings Station · static buses and waiting passengers';
 const a=convertPosition(50.8579621,.5772778),b=convertPosition(50.858139,.5771437),dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,nx=-uz,nz=ux;
 const origin={x:(a.x+b.x)/2-nx*6,z:(a.z+b.z)/2-nz*6};
 const world=(x,z)=>({x:origin.x+ux*x+nx*z,z:origin.z+uz*x+nz*z});
 const base=terrainHeight(origin.x,origin.z)+.06,floor=(x,z)=>{const p=world(x,z);return terrainHeight(p.x,p.z)+.055-base;};
 const mat=(c,r=.85)=>shared(new THREE.MeshStandardMaterial({color:c,roughness:r}));
 const white=mat(0xe6e8dc),brick=mat(0xb7aa8c),paving=mat(0xa6a799),blue=mat(0x194e76),glass=mat(0x135c90,.28),glassLight=mat(0x26729c,.3),dark=mat(0x172d3b),rubber=mat(0x20272a),silver=mat(0xa7b4b8),orange=mat(0xe99328),navy=mat(0x213c67);
 function box(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;}
 function rod(a,b,r,m){const v=new THREE.Vector3().subVectors(b,a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());g.add(o);}
 const v=(x,y,z)=>new THREE.Vector3(x,y,z);
 function sign(text,w,h,x,y,z,bg='#e5e9e4',fg='#173a53'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,512,128);q.fillStyle=fg;q.textAlign='center';q.textBaseline='middle';q.font='bold 68px sans-serif';q.fillText(text,256,67,480);const t=shared(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;const m=shared(new THREE.MeshStandardMaterial({map:t,roughness:.8}));box(w,h,.035,x,y,z,m);
 }
 function footprint(x,z,w,d){const p=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([xx,zz])=>{const q=world(x+xx,z+zz);return new THREE.Vector2(q.x,q.z);});landmarkPolys.push(p);registerBuilding(p);}
 // A thin ground-following paved apron, rather than a raised platform.
 for(let x=-18;x<29;x+=2)for(let z=0;z<6;z+=2){const vertices=[];for(const [xx,zz] of [[x,z],[x+2,z],[x+2,z+2],[x,z],[x+2,z+2],[x,z+2]])vertices.push(xx,floor(xx,zz),zz);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,paving);m.material.side=THREE.DoubleSide;g.add(m);}
 box(24,11.8,14,0,5.7,-7.1,brick);footprint(0,-7.1,24,14);
 box(24,11.4,.1,0,5.9,.02,glass);
 box(.1,10.8,8,-12.06,6,-4,glass);
 for(const z of [-8,-6,-4,-2,0])box(.15,10.8,.08,-12.13,6,z,dark);
 for(const y of [3.3,6.4,9.2,11.4])box(.15,.1,8,-12.13,y,-4,dark);
 // Deep blue panels, fine dark mullions and pale reflected bands.
 for(let x=-12;x<=12;x+=3)box(.10,11.4,.16,x,5.9,.12,dark);
 for(const y of [3.3,6.4,9.2,11.6])box(24,.1,.17,0,y,.14,dark);
 for(const x of [-10.5,-4.5,1.5,7.5])box(2.88,2.65,.025,x,7.8,.11,glassLight);
 box(23,.11,.2,0,8.85,.2,silver);
 box(29,.65,21,0,12.65,-5.5,white);box(29,.13,.17,0,12.94,5.06,silver);
 for(const x of [-8.5,8.5]){rod(v(x,.05,1.05),v(x,9,1.05),.15,white);for(const xx of [-3.6,0,3.6])rod(v(x,8.5,1.05),v(x+xx,12.3,2.6),.075,white);rod(v(x,8.5,1.05),v(x,12.3,-3.7),.075,white);}
 sign('Hastings',4.5,1.05,0,8.5,.26);
 // Lower brick wing with its band of glass blocks and a flat white roof.
 box(16,6.4,12,20,3.1,-6,brick);footprint(20,-6,16,12);
 box(16.8,.45,13,20,6.55,-5.7,white);box(15,1.15,.1,20,5.2,.08,glassLight);
 for(let x=12.5;x<=27.5;x+=.55)box(.04,1.2,.13,x,5.2,.15,silver);
 for(const y of [4.7,4.95,5.2,5.45,5.7])box(15,.035,.13,20,y,.15,silver);
 box(15,3,.11,20,1.5,.1,dark);sign('COFFEE',3.6,.6,21,2.7,.2,'#472932','#f1e7d3');
 // Entrance doors and low glass canopy on fine blue posts.
 for(const x of [-6,-3,0,3,6]){box(2.8,2.8,.08,x,1.45,.25,dark);box(.06,2.8,.12,x,1.45,.31,silver);box(.06,.6,.16,x+.18,1.3,.35,white);}
 for(let x=-15;x<=27;x+=6){box(.1,3.65,.1,x,1.8,3.1,blue);rod(v(x,3.4,.3),v(x,3.8,3.4),.06,silver);}
 box(45,.1,3.4,6,3.8,1.8,glassLight);box(45,.13,.12,6,3.86,3.52,white);
 for(let x=-16;x<=28;x+=2)box(.04,.065,3.4,x,3.88,1.8,silver);
 // Two buses parked parallel to the frontage, outside the carriageway and fare stop.
 const busSites=[];
 function bus(cx,cz,label){
  const first=g.children.length,y=floor(cx,cz);busSites.push(world(cx,cz));
  const B=(w,h,d,x,yy,z,m)=>box(w,h,d,cx+x,y+yy,cz+z,m);
  B(10.6,2.65,2.45,0,1.8,0,white);B(10.65,.72,2.48,0,.95,0,navy);B(10.3,.15,2.38,0,3.2,0,white);
  for(const side of [-1,1]){
   B(9.6,1.35,.06,0,2.24,side*1.25,dark);
   for(let x=-4.4;x<=4.4;x+=1.25)B(.075,1.4,.1,x,2.24,side*1.29,white);
   B(3.2,.26,.07,3.4,1.46,side*1.29,orange);
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([cx-5.32,y+1.38,cz+side*1.29,cx-5.32,y+2.0,cz+side*1.29,cx-1.7,y+1.38,cz+side*1.29],3));geo.computeVertexNormals();const o=new THREE.Mesh(geo,orange);orange.side=THREE.DoubleSide;g.add(o);
   for(const x of [-3.5,3.45]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.22,12),rubber);wheel.rotation.x=Math.PI/2;wheel.position.set(cx+x,y+.55,cz+side*1.22);g.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.24,10),silver);hub.rotation.x=Math.PI/2;hub.position.copy(wheel.position);g.add(hub);}
  }
  B(.06,1.25,2.2,5.34,2.25,0,dark);B(.12,.18,.38,5.39,1.05,.8,white);B(.12,.18,.38,5.39,1.05,-.8,white);
  sign(label,3,.4,cx+2.9,y+2.92,cz+1.31,'#152329','#eee4b6');
  // Align the rigid parked bus with the local pavement slope, keeping tyres grounded.
  const sx=(floor(cx+3.5,cz)-floor(cx-3.5,cz))/7,sz=(floor(cx,cz+1)-floor(cx,cz-1))/2;
  const tilt=new THREE.Matrix4().makeTranslation(cx,y,cz).multiply(new THREE.Matrix4().makeRotationZ(Math.atan(sx))).multiply(new THREE.Matrix4().makeRotationX(-Math.atan(sz))).multiply(new THREE.Matrix4().makeTranslation(-cx,-y,-cz));
  for(const mesh of g.children.slice(first)){mesh.updateMatrix();new THREE.Matrix4().multiplyMatrices(tilt,mesh.matrix).decompose(mesh.position,mesh.quaternion,mesh.scale);}
  footprint(cx,cz,10.7,2.5);
 }
 // The station is set back six metres from its mapped facade edge to retain access.
 for(const [x,label] of [[-13,'HASTINGS'],[20,'TOWN CENTRE']]){
  let z=4;for(const candidate of [4,3.3,2.7]){const clear=[-5.4,0,5.4].every(offset=>{const q=world(x+offset,candidate),r=findNearestRoadPoint(q,true);return !r||r.distance>roadWidthForType(r.segment.type)/2+1.55;});if(clear){z=candidate;break;}}
  bus(x,z,label);
 }
 const skins=[mat(0xc99774),mat(0x8c6048),mat(0xe0b494)],clothes=[mat(0x6e3346),mat(0x3b5369),mat(0xaca189),mat(0x39433e)],trousers=mat(0x354354),hair=mat(0x3b3028);
 function person(x,z,i){const y=floor(x,z),h=i===5?.87:1,cloth=clothes[i%4],skin=skins[i%3],P=(a,b,c)=>v(x+a*h,y+b*h,z+c*h);rod(P(-.12,.12,.05),P(-.11,.78,0),.08,trousers);rod(P(.14,.12,-.03),P(.1,.78,0),.08,trousers);box(.43*h,.65*h,.28*h,x,y+1.03*h,z,cloth);rod(P(-.25,1.3,0),P(-.32,.79,.14),.07,cloth);rod(P(.25,1.3,0),P(.3,.92,.22),.07,cloth);const head=new THREE.Mesh(new THREE.SphereGeometry(.17*h,10,7),skin);head.position.copy(P(0,1.56,0));g.add(head);const cap=new THREE.Mesh(new THREE.SphereGeometry(.173*h,10,6,0,Math.PI*2,0,Math.PI*.43),hair);cap.position.copy(head.position);g.add(cap);box(.18*h,.1*h,.31*h,x-.12*h,y+.08*h,z+.07, rubber);box(.18*h,.1*h,.31*h,x+.14*h,y+.08*h,z+.01,rubber);if(i%2===0)box(.26,.35,.15,x-.34,y+.65,z+.13,navy);}
 [[-5,1.4],[-3.8,1.8],[-1.2,1.3],[.1,1.7],[3,1.6],[4.1,1.7],[8,1.2],[25,1.6]].forEach(([x,z],i)=>person(x,z,i));
 g.position.set(origin.x,base,origin.z);g.rotation.y=Math.atan2(nx,nz);scene.add(g);batchScenery({group:g});g.position.set(0,0,0);g.rotation.set(0,0,0);
 g.userData={station:true,buses:2,waitingPeople:8,anchor:origin,front:world(0,0),busSites,preview:world(-8,42)};
 return g;
}
