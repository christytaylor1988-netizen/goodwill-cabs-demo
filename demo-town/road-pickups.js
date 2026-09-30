// Small fixed road pickups. No persistence, audio or vehicle handling penalties.
export function createRoadPickups(THREE,api){
 const {scene,taxi,segments,terrainHeight,blocked,tip,toast}=api;
 const group=new THREE.Group();group.name='Road pickups';scene.add(group);
 let fuel=100,condition=100,turbo=0,remaining=0,time=0,lastDamage=-10,lastHUD='';
 const types=['petrol','coin','spanner','petrol','turbo','petrol','spanner','coin'];
 const colours={petrol:0x72d28e,turbo:0xff9a35,spanner:0x71cfff,coin:0xffd65a};
 const mats=Object.fromEntries(Object.entries(colours).map(([k,c])=>[k,new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.3,roughness:.5})]));
 const dark=new THREE.MeshStandardMaterial({color:0x25343c,roughness:.75});
 const items=[];
 function box(g,w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o}
 function model(kind){const g=new THREE.Group(),m=mats[kind];
  if(kind==='petrol'){box(g,.8,1,.4,0,0,0,m);box(g,.5,.12,.32,0,.67,0,m);for(const x of [-.23,.23])box(g,.1,.25,.32,x,.54,0,m);box(g,.25,.15,.3,.29,.57,0,dark);const x=box(g,.05,.7,.03,0,0,.22,dark);x.rotation.z=.6;const y=box(g,.05,.7,.03,0,0,.22,dark);y.rotation.z=-.6;}
  if(kind==='coin'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.14,20),m);c.rotation.x=Math.PI/2;g.add(c);box(g,.09,.6,.04,0,0,.09,dark);for(const y of [-.23,0,.23])box(g,.27,.07,.04,.06,y,.09,dark);}
  if(kind==='spanner'){box(g,.17,1,.16,0,-.08,0,m);for(const side of [-1,1]){const jaw=box(g,.17,.45,.16,side*.2,.54,0,m);jaw.rotation.z=side*-.35;}const ring=new THREE.Mesh(new THREE.TorusGeometry(.18,.07,5,12),m);ring.position.y=-.65;g.add(ring);g.rotation.z=-.4;}
  if(kind==='turbo'){const sh=new THREE.Shape();sh.moveTo(.12,.8);sh.lineTo(-.46,-.05);sh.lineTo(-.05,-.05);sh.lineTo(-.15,-.75);sh.lineTo(.5,.25);sh.lineTo(.05,.25);sh.closePath();g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.18,bevelEnabled:false}),m));}
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.85,.025,4,24),m);halo.rotation.x=Math.PI/2;halo.position.y=-.8;g.add(halo);return g;
 }
 // Only long segments in the connected driving network; midpoint gives junction clearance.
 const coast=s=>/Marina|Grand Parade|Eversfield|White Rock|Denmark Place|Pelham Place|East Parade|Rock.a.Nore/i.test(s.roadName||'');
 const hash=s=>Math.sin(s.a.x*.17+s.a.z*.31)*10000;
 const candidates=segments.filter(s=>s.length>70&&s.a.z>500&&s.b.z>500&&s.roadName).sort((a,b)=>Number(coast(b))-Number(coast(a))||(coast(a)?a.a.x-b.a.x:hash(a)-hash(b)));
 for(const s of candidates){if(items.length>=24)break;const x=(s.a.x+s.b.x)/2,z=(s.a.z+s.b.z)/2,yaw=Math.atan2(-(s.b.x-s.a.x),-(s.b.z-s.a.z));if(blocked(x,z,yaw)||items.some(p=>Math.hypot(p.x-x,p.z-z)<150))continue;const kind=types[items.length%types.length],mesh=model(kind);mesh.position.set(x,terrainHeight(x,z)+1.5,z);group.add(mesh);items.push({kind,x,z,yaw,mesh,collected:false,road:s.roadName||'Road'});}
 const hud=document.createElement('div');hud.id='pickupHUD';hud.style.cssText='font-size:11px;line-height:1.6;margin-top:7px;color:#d9e8e7';document.getElementById('boostTrack').replaceWith(hud);
 function refresh(){const str=`Fuel ${Math.ceil(fuel)}%  ·  Condition ${Math.ceil(condition)}%<br><span style="color:#ffcf62">${remaining>0?'SUPER TURBO · '+remaining.toFixed(1)+'s':turbo?'Super Turbo ready · T':'Super Turbo: empty'}</span> · Space: unlimited`;
  if(str!==lastHUD){hud.innerHTML=str;lastHUD=str;}}
 function activate(){if(!turbo||remaining>0||!api.canUse())return false;turbo--;remaining=5;toast('SUPER TURBO · 5 seconds');return true;}
 function damage(amount){if(time-lastDamage<1.2)return;condition=Math.max(25,condition-amount);lastDamage=time;refresh();}
 function update(dt,speed){time+=dt;remaining=Math.max(0,remaining-dt);if(Math.abs(speed)>.5)fuel=Math.max(15,fuel-dt*.035);for(const p of items){if(p.collected)continue;p.mesh.position.y=terrainHeight(p.x,p.z)+1.5+Math.sin(time*2+p.x)*.17;p.mesh.rotation.y=time*.7;
  if(!api.canCollect())continue;const prev=api.previous(),dx=taxi.position.x-prev.x,dz=taxi.position.z-prev.z,t=Math.max(0,Math.min(1,((p.x-prev.x)*dx+(p.z-prev.z)*dz)/(dx*dx+dz*dz||1)));if(Math.hypot(p.x-prev.x-dx*t,p.z-prev.z-dz*t)>1.7)continue;
  if(p.kind==='turbo'&&turbo)continue;p.collected=true;p.mesh.visible=false;
  if(p.kind==='petrol'){fuel=100;toast('Petrol collected · tank full');}else if(p.kind==='spanner'){condition=100;toast('Spanner collected · condition restored');}else if(p.kind==='turbo'){turbo=1;toast('Super Turbo collected · press T');}else{tip(200);toast('Tip coin · £2 added to your fare (or next fare)');}
 }refresh();}
 refresh();return {items,update,activate,damage,get active(){return remaining>0},get state(){return {fuel,condition,turbo,remaining}},group};
}
