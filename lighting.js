// A fixed pool: two soft headlight spots + up to five nearby warm streetlights.
// No extra shadow maps, volumetric cones, reflection passes or per-lamp light allocation.
export function createDrivingLights(THREE,{scene,taxi,taxiVisual,headlampMaterial,terrainHeight,getStreetTiles,getTime}){
 let override=null,lastTime=getTime(),clock=1;
 const headlights=[-1,1].map(side=>{
  const light=new THREE.SpotLight(0xffefd2,0,40,.28,.85,1.3);light.castShadow=false;
  const target=new THREE.Object3D();scene.add(light,target);light.target=target;
  return {light,target,side,local:new THREE.Vector3(side*.53,.69,-2.25)};
 });
 const streetlights=Array.from({length:5},()=>{const light=new THREE.PointLight(0xffbf73,0,19,1.7);light.castShadow=false;scene.add(light);return {light,site:null,nextSite:null}});
 const source=new THREE.Vector3();
 function enabled(){return override===null?getTime()==='night':override}
 function label(){return 'Lights: '+(enabled()?'on':'off')+(override===null?' · auto':' · H')}
 function toggle(){override=!enabled();sync();return label()}
 function sync(){
  const now=getTime();if(now!==lastTime){override=null;lastTime=now;clock=1}
  const on=enabled();headlampMaterial.emissive.setHex(on?0xffe9ba:0x000000);headlampMaterial.emissiveIntensity=on?2.5:0;
  for(const h of headlights){
   const night=now==='night';h.light.intensity=on?(night?300:90):0;
   h.light.distance=night?72:40;h.light.decay=night?1.15:1.3;h.light.angle=night?.32:.28;
  }
 }
 function chooseStreetlights(){
  const candidates=[],night=getTime()==='night';
  for(const entry of getStreetTiles().values())for(const site of entry.group.userData.lampSites||[]){
   if(site.nightOnly&&!night)continue;
   const dx=site.x-taxi.position.x,dz=site.z-taxi.position.z,distance=Math.hypot(dx,dz);
   if(distance<(night?125:95)){const ahead=dx*-Math.sin(taxi.rotation.y)+dz*-Math.cos(taxi.rotation.y);candidates.push({site,score:distance+(ahead<-10?30:0)-(site.junction?10:0)})}
  }
  candidates.sort((a,b)=>a.score-b.score);
  const selected=[];for(const c of candidates){if(selected.every(s=>Math.hypot(s.x-c.site.x,s.z-c.site.z)>12))selected.push(c.site);if(selected.length===(night?5:3))break}
  // Keep lights bound to their selected fittings; spare slots never illuminate unloaded scenery.
  for(const slot of streetlights)slot.nextSite=selected.includes(slot.site)?slot.site:null;
  for(const site of selected)if(!streetlights.some(slot=>slot.nextSite===site)){const slot=streetlights.find(slot=>!slot.nextSite);if(slot)slot.nextSite=site}
 }
 function update(dt){
  sync();taxiVisual.updateWorldMatrix(true,false);
  const fx=-Math.sin(taxi.rotation.y),fz=-Math.cos(taxi.rotation.y),rx=Math.cos(taxi.rotation.y),rz=-Math.sin(taxi.rotation.y);
  for(const h of headlights){
   source.copy(h.local);taxiVisual.localToWorld(source);h.light.position.copy(source);
   const reach=getTime()==='night'?34:18;
   const x=taxi.position.x+fx*reach+rx*h.side*1.6,z=taxi.position.z+fz*reach+rz*h.side*1.6;
   h.target.position.set(x,terrainHeight(x,z)+.12,z);h.target.updateMatrixWorld();
  }
  clock+=dt;if(clock>.5){clock=0;chooseStreetlights()}
  const strength=getTime()==='night'?65:getTime()==='evening'?12:0;
  for(const entry of getStreetTiles().values())if(entry.nightGroup)entry.nightGroup.visible=getTime()==='night';
  for(const slot of streetlights){
   slot.light.distance=getTime()==='night'?27:19;slot.light.decay=getTime()==='night'?1.5:1.7;
   const changing=slot.site!==slot.nextSite,target=changing||!slot.site?0:strength;
   slot.light.intensity+=(target-slot.light.intensity)*(1-Math.exp(-dt*8));
   if(changing&&slot.light.intensity<.2){slot.site=slot.nextSite;slot.light.intensity=0}
   if(slot.site)slot.light.position.set(slot.site.x,slot.site.y,slot.site.z);
  }
 }
 sync();
 return {headlights,streetlights,update,toggle,label,get enabled(){return enabled()},get override(){return override}};
}
