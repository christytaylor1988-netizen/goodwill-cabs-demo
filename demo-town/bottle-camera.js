// A local camera lock; the cockpit's eye, dashboard and ordinary controls are unchanged.
export function createBottleCamera({camera,cockpit,getRoute,getPosition,isEnabled,button}){
 let locked=false,previous=false,changing=false,transition=null;
 const originalSet=cockpit.set.bind(cockpit),originalToggle=cockpit.toggle.bind(cockpit);
 function change(value){
  const position=camera.position.clone(),quaternion=camera.quaternion.clone();changing=true;
  originalSet(value);changing=false;transition={position,quaternion,time:0};
 }
 cockpit.set=value=>{if(!locked||value)originalSet(value);};
 cockpit.toggle=()=>{if(!locked)originalToggle();};
 button?.addEventListener('click',e=>{if(locked){e.preventDefault();e.stopImmediatePropagation();}},true);
 function update(){
  if(changing)return;
  const route=getRoute(),p=getPosition(),enabled=isEnabled();
  const enter=enabled&&route&&route.sample(p.x,p.z,.3)&&p.x>route.west+22&&p.x<route.east-22;
  const remain=enabled&&route&&route.sample(p.x,p.z,1)&&p.x>route.west+10&&p.x<route.east-10;
  if(!locked&&enter){previous=cockpit.active;locked=true;if(!previous)change(true);}
  else if(locked&&!remain){locked=false;if(cockpit.active!==previous)change(previous);}
 }
 function blend(dt){
  if(changing||!transition)return;
  transition.time+=Math.max(0,dt);const t=Math.min(1,transition.time/.38),ease=t*t*(3-2*t);
  camera.position.lerpVectors(transition.position,camera.position,ease);
  camera.quaternion.slerpQuaternions(transition.quaternion,camera.quaternion,ease);
  if(t>=1)transition=null;
 }
 return {update,blend,get locked(){return locked},get previous(){return previous}};
}
