// Isolated special fare: normal dispatch remains paused until the return to Hastings.
export function createSoldierJourney(T,api){
 const {world,taxi,surface,entry,exit,map,L,worldToLatLon}=api;
 const pickup={x:entry.x-45,z:entry.z-45};const previous=taxi.position.clone();let state='waiting',stopped=0,active=false,oldZoom=16,hadGoal=false,lastMap=0;
 const soldier=new T.Group();soldier.name='English soldier with dragon shield';soldier.position.set(pickup.x,surface(pickup.x,pickup.z)-.18,pickup.z);soldier.rotation.y=Math.atan2(entry.x-pickup.x,entry.z-pickup.z);world.add(soldier);
 const material=c=>new T.MeshStandardMaterial({color:c,roughness:.85});const mail=material(0x737978),skin=material(0xb98b62),leather=material(0x4b3523),cloth=material(0x793c29),steel=material(0xa8aeaa);
 function mesh(g,m,x,y,z){const o=new T.Mesh(g,m);o.position.set(x,y,z);soldier.add(o);return o;}
 mesh(new T.CylinderGeometry(.23,.3,.8,8),mail,0,1.12,0);mesh(new T.CylinderGeometry(.29,.32,.35,8),cloth,0,.66,0);
 for(const x of [-.15,.15]){mesh(new T.CylinderGeometry(.085,.09,.58,6),leather,x,.33,0);mesh(new T.BoxGeometry(.18,.13,.31),leather,x,.07,.06);}
 mesh(new T.SphereGeometry(.19,10,8),skin,0,1.69,0);mesh(new T.ConeGeometry(.22,.35,10),steel,0,1.91,0);mesh(new T.BoxGeometry(.045,.3,.045),steel,0,1.76,.185);
 for(const x of [-.34,.34]){const arm=mesh(new T.CylinderGeometry(.09,.08,.6,7),mail,x,1.17,.08);arm.rotation.z=x<0?-.18:.25;mesh(new T.SphereGeometry(.09,7,6),skin,x, .88,.09);}
 mesh(new T.BoxGeometry(.055,.68,.025),steel,-.36,.58,.16);mesh(new T.BoxGeometry(.25,.035,.05),leather,-.36,.95,.16);
 // Original low-resolution heraldic drawing inspired by the user's dragon reference.
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=384;const c=canvas.getContext('2d');c.fillStyle='#eee5c7';c.fillRect(0,0,256,384);c.strokeStyle='#776848';c.lineWidth=14;c.strokeRect(6,6,244,372);
 c.fillStyle='#be6c28';for(const sign of [-1,1]){c.beginPath();c.moveTo(128,200);c.lineTo(128+sign*95,70);c.lineTo(128+sign*70,185);c.lineTo(128,240);c.fill();}
 c.strokeStyle='#494278';c.lineWidth=30;c.lineCap='round';c.beginPath();c.moveTo(84,322);c.bezierCurveTo(190,262,53,250,139,183);c.bezierCurveTo(180,148,101,129,128,72);c.stroke();c.fillStyle='#494278';c.beginPath();c.moveTo(115,75);c.lineTo(142,38);c.lineTo(184,51);c.lineTo(177,75);c.lineTo(143,89);c.fill();c.fillStyle='#efe5b7';c.fillRect(156,53,7,6);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const shieldShape=new T.Shape();shieldShape.moveTo(-.32,.55);shieldShape.quadraticCurveTo(0,.68,.32,.55);shieldShape.lineTo(.28,.05);shieldShape.lineTo(0,-.65);shieldShape.lineTo(-.28,.05);shieldShape.closePath();const geo=new T.ShapeGeometry(shieldShape);const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+.32)/.64,(pos.getY(i)+.65)/1.33);
 mesh(geo,new T.MeshStandardMaterial({map:texture,side:T.DoubleSide,roughness:.8}),.4,1.02,.27);mesh(new T.SphereGeometry(.075,8,6),steel,.4,1.08,.3);
 const ring=new T.Mesh(new T.RingGeometry(3.5,3.7,32),new T.MeshBasicMaterial({color:0xf0c96b,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(pickup.x,surface(pickup.x,pickup.z)+.03,pickup.z);world.add(ring);
 const hud=document.createElement('div');hud.id='soldierJourney';hud.hidden=true;hud.style='position:fixed;left:16px;top:75px;max-width:290px;background:#203126ed;color:#f3e6c1;border:1px solid #bfa466;border-radius:8px;padding:12px;font:14px system-ui;z-index:1111;pointer-events:none';document.body.append(hud);
 const latlng=p=>{const ll=worldToLatLon(p.x,p.z);return [ll.lat,ll.lon]};
 const portalMarker=L.circleMarker(latlng(exit),{radius:8,color:'#f8e9b5',weight:2,fillColor:'#407b55',fillOpacity:1}).bindTooltip('1066 EXIT',{permanent:true,direction:'top'});
 const pickupMarker=L.circleMarker(latlng(pickup),{radius:7,color:'#fff5d2',fillColor:'#c38e37',fillOpacity:1}).bindTooltip('English soldier');
 const bearing=L.polyline([],{color:'#b87635',weight:2,dashArray:'5 7'});
 function switchMode(on){previous.copy(taxi.position);active=on;hud.hidden=!on;if(on){state='waiting';stopped=0;soldier.visible=ring.visible=true;oldZoom=map.getZoom();hadGoal=map.hasLayer(api.normalGoal);if(hadGoal)map.removeLayer(api.normalGoal);portalMarker.addTo(map);pickupMarker.addTo(map);bearing.addTo(map);lastMap=0;updateMap();}else{for(const m of [portalMarker,pickupMarker,bearing])map.removeLayer(m);if(hadGoal)api.normalGoal.addTo(map);map.setZoom(oldZoom,{animate:false});}}
 function updateMap(){if(!active)return;const now=performance.now();if(now-lastMap<350)return;lastMap=now;const here=latlng(taxi.position),goal=latlng(state==='waiting'?pickup:exit);bearing.setLatLngs([here,goal]);map.fitBounds(L.latLngBounds([here,goal,latlng(exit)]),{padding:[28,28],maxZoom:16,animate:false});}
 function update(dt){
 if(!active||state==='complete')return false;
 const goal=state==='waiting'?pickup:exit,distance=Math.hypot(taxi.position.x-goal.x,taxi.position.z-goal.z);
 const dx=taxi.position.x-previous.x,dz=taxi.position.z-previous.z,travelSq=dx*dx+dz*dz;
 const t=Math.max(0,Math.min(1,((exit.x-previous.x)*dx+(exit.z-previous.z)*dz)/(travelSq||1)));
 const crossed=travelSq<=900&&Math.hypot(previous.x+dx*t-exit.x,previous.z+dz*t-exit.z)<3.5;
 previous.copy(taxi.position);
 stopped=distance<(state==='waiting'?7:5)&&Math.abs(api.getSpeed())<.45?stopped+dt:0;
 hud.innerHTML=`<b>${state==='waiting'?'Pick up the English soldier':'English soldier aboard'}</b><br>${state==='waiting'?'Gold marker · soldier in the clearing':'Green portal · return to Hastings'} · ${Math.round(distance)} m<br>${state==='waiting'?'Stop nearby for 2 seconds':'Drive through the green exit ring'}${state==='waiting'&&stopped>0?' · '+Math.min(100,Math.round(stopped/2*100))+'%':''}<br><small>£100 completion bonus · free field driving</small>`;
 if(state==='waiting'&&stopped>=2){stopped=0;state='aboard';soldier.visible=ring.visible=false;map.removeLayer(pickupMarker);lastMap=0;return false;}
 if(state==='aboard'&&(crossed||stopped>=2)){state='complete';stopped=0;api.award();return true;}
 return false;
 }

 return {pickup,update,updateMap,switchMode,get state(){return state}};
}
