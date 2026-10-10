// Two small promenade-only groups, sharing simple geometry and materials.
export function addCarlisleTourists(THREE,{parent,shared,convertPosition,promenadeAt,pavingHeight}){
 const group=new THREE.Group();group.name='Carlisle promenade student and tourist groups';parent.add(group);
 const mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:1}));
 const coats=[0x197f9a,0xe8dfc8,0xad354a,0x233953,0xdba532,0x3b8058,0x8c68ac].map(mat),pants=[0x26334a,0x868b91,0xd9cdb6].map(mat),skins=[0xe8b798,0xb77c56,0x704932].map(mat),hair=[0x28221f,0x795234,0xc9a268].map(mat),shoe=mat(0xe5e4dc);
 const cube=shared(new THREE.BoxGeometry(1,1,1)),sphere=shared(new THREE.SphereGeometry(1,7,5)),people=[];
 const centre=convertPosition(50.8545,.58172).x;
 function part(g,geo,m,x,y,z,w,h,d){const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;g.add(mesh);return mesh;}
 for(let i=0;i<13;i++){
  const g=new THREE.Group(),j=i<7?i:i-7,cluster=i<7?0:1,scale=[.93,1.06,.98,1.12,.9,1.02,1][i%7],coat=coats[i%7],trouser=pants[i%3];g.scale.setScalar(scale);group.add(g);
  part(g,cube,coat,0,1.12,0,.4,.58,.26);
  const head=new THREE.Group();head.position.y=1.58;head.rotation.y=[0,.45,-.65,.15][i%4];g.add(head);
  part(head,sphere,skins[i%3],0,0,0,.145,.18,.145);part(head,sphere,hair[i%3],0,.105,-.025,.151,.10,.15);
  if(i%3===0)part(head,cube,coats[(i+2)%7],0,.12,.12,.27,.045,.19);
  if(i%2===0)part(g,cube,coats[(i+3)%7],0,1.15,-.2,.31,.38,.16);
  const legs=[],arms=[];
  for(const side of [-1,1]){
   const leg=new THREE.Group();leg.position.set(side*.11,.85,0);g.add(leg);part(leg,cube,trouser,0,-.36,0,.145,.72,.16);part(leg,cube,shoe,0,-.78,.07,.17,.12,.29);legs.push(leg);
   const arm=new THREE.Group();arm.position.set(side*.26,1.38,0);g.add(arm);part(arm,cube,coat,0,-.21,0,.125,.42,.14);part(arm,sphere,skins[i%3],0,-.46,0,.07,.085,.07);arms.push(arm);
  }
  people.push({g,legs,arms,x:centre+(cluster?15:-15)+(j%4)*1.25,lane:.34+Math.floor(j/4)*.24,cluster,phase:i*1.3,chat:i%4===1});
 }
 let time=0;
 function update(dt){
  time+=dt;
  for(const p of people){
   // A slow shared stroll stays within a short stretch of this promenade.
   const phase=time*.065+p.cluster*.7,travel=Math.sin(phase)*4,direction=Math.cos(phase)>=0?1:-1,x=p.x+travel,r=promenadeAt(x);
   if(!r)continue;
   const z=r.edge+(r.prom-r.edge)*p.lane;
   p.g.position.set(x,pavingHeight(x,z)+.025,z);p.g.rotation.y=r.yaw+direction*Math.PI/2;
   const stride=Math.sin(time*3.7+p.phase)*.25;
   p.legs[0].rotation.x=stride;p.legs[1].rotation.x=-stride;
   p.arms[0].rotation.x=-stride*.7;p.arms[1].rotation.x=p.chat?-.75+Math.sin(time*1.4+p.phase)*.12:stride*.7;
  }
 }
 update(0);

 return {group,update};
}
