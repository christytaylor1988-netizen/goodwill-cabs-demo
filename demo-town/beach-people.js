// Sparse beach-only groups. Shared low-poly parts, with distance-gated idle animation.
export function addBeachPeople(THREE,{parent,shared,convertPosition,promenadeAt,beachHeight,pierLimits}){
 const root=new THREE.Group();root.name='Scattered beachgoers';parent.add(root);
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:1}));
 const clothes=[0x45677e,0xac6663,0xc7b998,0x547e70,0x9c8646,0x56526d].map(mat),skin=[0xcba083,0x9b7258,0x74513c].map(mat),dark=mat(0x333943),metal=mat(0x8a9293),fur=mat(0x806951);
 const box=shared(new THREE.BoxGeometry(1,1,1)),ball=shared(new THREE.SphereGeometry(1,7,5));
 function part(g,geo,m,x,y,z,w,h,d){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);return o;}
 const cube=(g,m,x,y,z,w,h,d)=>part(g,box,m,x,y,z,w,h,d);
 const people=[];let seed=1983;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const longitudes=[.550,.553,.556,.560,.563,.567,.576,.579,.584,.587,.590,.592];
 for(let c=0;c<longitudes.length;c++)for(let j=0;j<4;j++){
  const x=convertPosition(50.85,longitudes[c]).x+(j-1.5)*5+rand()*3;
  if(pierLimits&&x>pierLimits.west-8&&x<pierLimits.east+8)continue;
  const r=promenadeAt(x);if(!r)continue;
  const fraction=j===3?.22+rand()*.2:.77+rand()*.14,z=r.prom+(r.sea-r.prom)*fraction;
  const g=new THREE.Group();root.add(g);g.rotation.y=rand()*Math.PI*2;
  const pose=j===0?'sit':j===1?'chair':j===2?'walk':'stand',coat=clothes[(c+j)%clothes.length],flesh=skin[(c+j)%3];
  const seated=pose==='sit'||pose==='chair',hip=pose==='sit'?.22:pose==='chair'?.52:.86;
  const body=new THREE.Group();body.position.y=hip;g.add(body);
  cube(body,coat,0,.29,0,.42,.55,.28);part(body,ball,flesh,0,.74,.025,.14,.18,.14);part(body,ball,dark,0,.85,0,.15,.09,.15);
  for(const side of [-1,1]){cube(body,coat,side*.27,.28,.09,.12,.46,.14).rotation.x=seated?-.6:.1;part(body,ball,flesh,side*.27,.05,seated?.24:.08,.065,.075,.06);}
  const legs=[];for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.12,hip,0);g.add(leg);legs.push(leg);
   if(seated){cube(leg,dark,0,-.06,.23,.16,.16,.49);cube(leg,dark,0,-hip/2,.46,.14,hip,.16);cube(leg,dark,0,-hip+.06,.54,.18,.12,.28);}
   else{cube(leg,dark,0,-.37,0,.15,.74,.17);cube(leg,dark,0,-.80,.08,.18,.12,.28);}}
  if(pose==='chair'){cube(g,coat,0,.48,.08,.62,.06,.62);cube(g,coat,0,.81,-.24,.62,.66,.05).rotation.x=-.12;for(const side of [-1,1]){cube(g,metal,side*.32,.29,.07,.035,.65,.035).rotation.x=.55;cube(g,metal,side*.32,.29,.07,.035,.65,.035).rotation.x=-.55;}}
  if(pose==='sit')cube(g,clothes[(c+2)%6],0,.015,.23,.85,.025,1.15);
  let dog=null;if(c===4&&pose==='walk'){dog=new THREE.Group();dog.position.set(.95,0,.3);g.add(dog);part(dog,ball,fur,0,.35,0,.16,.19,.32);part(dog,ball,fur,0,.55,.3,.13,.14,.16);cube(dog,dark,0,.55,.46,.12,.09,.13);for(const side of [-1,1]){cube(dog,dark,side*.12,.54,.28,.07,.19,.1);for(const zz of [-.19,.21])cube(dog,fur,side*.11,.17,zz,.065,.34,.07);}cube(dog,fur,0,.43,-.37,.055,.055,.3).rotation.x=-.5;const lead=cube(g,dark,.61,.56,.2,.8,.012,.012);lead.rotation.z=-.5;}
  people.push({g,body,legs,dog,x,z,fraction,pose,phase:rand()*6.28,yaw:g.rotation.y});
 }
 let time=0;
 function update(dt,viewer){time+=dt;for(const p of people){p.g.visible=!viewer||Math.hypot(p.x-viewer.x,p.z-viewer.z)<340;if(!p.g.visible)continue;
  const walking=p.pose==='walk',x=p.x+(walking?Math.sin(time*.06+p.phase)*2.8:0),r=promenadeAt(x);if(!r)continue;const z=r.prom+(r.sea-r.prom)*p.fraction;
  p.g.position.set(x,beachHeight(x,z)+.04,z);p.body.rotation.z=Math.sin(time*.65+p.phase)*.012;
  if(walking){p.g.rotation.y=Math.cos(time*.06+p.phase)>=0?Math.PI/2:-Math.PI/2;const stride=Math.sin(time*2.4+p.phase)*.12;p.legs[0].rotation.x=stride;p.legs[1].rotation.x=-stride;if(p.dog)p.dog.position.y=Math.sin(time*4+p.phase)*.012;}
 }}
 update(0);return {update,root,count:people.length};
}
