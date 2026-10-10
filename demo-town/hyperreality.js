import { createHyperGateway, crossesGateway } from "./hyper-gateway.js?v=frontage-2";
import { createVerticalStrikes } from "./hyper-strikes.js?v=vertical-strike-6";
import { createHyperCoins } from "./hyper-coins.js?v=1";
// Repeatable Funland entrance; each visit resets its lightweight arcade collectibles.
export function createHyperReality(THREE,api){
 const {scene,taxi,ground,roads,roadWidthForType,targetRing,targetBeacon,terrainHeight,getSpeed,findExit,canRestore,onRestore}=api;
 let returning=false,recoveryOnly=false,entryLock=0;const exits=[],previous=taxi.position.clone();
 let phase='pickup',elapsed=0,exit=null,exitClock=0,inventory=0,stun=0,immunity=0,hits=0;
 const backgroundColour=new THREE.Color(0x000000);let skyTime=0,entryTime=0;
 const duskMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,uniforms:{darkness:{value:0}},vertexShader:`varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 direction;uniform float darkness;void main(){float y=normalize(direction).y;float h=smoothstep(-.08,.65,y);vec3 dusk=mix(vec3(.28,.31,.35),vec3(.065,.10,.14),h);float ribbon=exp(-pow((y-.13)*18.,2.));dusk+=vec3(.022,.026,.03)*ribbon;dusk*=smoothstep(-.22,-.04,y);vec3 night=mix(vec3(.045,.06,.075),vec3(.008,.014,.022),h);gl_FragColor=vec4(mix(dusk,night,darkness),1.);}`});
 const duskSky=new THREE.Mesh(new THREE.SphereGeometry(1000,32,20),duskMaterial);duskSky.name='Hyper private dusk sky';duskSky.renderOrder=-1000;duskSky.frustumCulled=false;duskSky.visible=false;scene.add(duskSky);
 function updateSky(dt){skyTime+=dt;duskMaterial.uniforms.darkness.value=THREE.MathUtils.smoothstep(skyTime,15,135);}

 const neon=new THREE.MeshBasicMaterial({color:0x29ff50,toneMapped:false});
 const gridMaterial=new THREE.ShaderMaterial({uniforms:{strikeFlashes:{value:Array.from({length:16},()=>new THREE.Vector3())},eye:{value:new THREE.Vector2()},skyTint:{value:backgroundColour.clone()}},vertexShader:`varying vec3 world;void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,fragmentShader:`varying vec3 world;uniform vec2 eye;uniform vec3 skyTint;uniform vec3 strikeFlashes[16];void main(){vec2 p=world.xz/5.;vec2 a=abs(fract(p-.5)-.5)/max(fwidth(p),vec2(.0001));float d=min(a.x,a.y);float line=1.-smoothstep(.45,1.5,d);float halo=1.-smoothstep(.5,4.,d);float fade=1.-smoothstep(90.,350.,distance(world.xz,eye));vec3 ink=vec3(.045,.32,.10);float strikeLight=0.;for(int i=0;i<16;i++){if(strikeFlashes[i].z>.001)strikeLight+=strikeFlashes[i].z*exp(-distance(world.xz,strikeFlashes[i].xy)*.19);}gl_FragColor=vec4(vec3(.002,.004,.004)+skyTint*.055+mix(ink,skyTint,.16)*(line*.9+halo*.13)*fade+vec3(1.,.34,.08)*strikeLight*(.20+line*.85),1.);}`});
 const abstractGround=new THREE.Mesh(ground.geometry.clone(),gridMaterial),positions=abstractGround.geometry.attributes.position;
 for(let i=0;i<positions.count;i++)positions.setY(i,terrainHeight(positions.getX(i),positions.getZ(i))+.015);
 abstractGround.geometry.computeBoundingSphere();abstractGround.renderOrder=-30;abstractGround.visible=false;scene.add(abstractGround);
 // The original network remains as thin green edges, letting the grid show through.
 const edgePoints=[];for(const s of roads){const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,len=Math.hypot(dx,dz);if(len<.1)continue;const nx=-dz/len,nz=dx/len,w=roadWidthForType(s.type)/2,n=Math.ceil(len/8);for(const side of [-1,1])for(let i=0;i<n;i++)for(const t of [i/n,(i+1)/n]){const x=s.a.x+dx*t+nx*w*side,z=s.a.z+dz*t+nz*w*side;edgePoints.push(x,terrainHeight(x,z)+.20,z)}}
 const edgeGeo=new THREE.BufferGeometry();edgeGeo.setAttribute('position',new THREE.Float32BufferAttribute(edgePoints,3));const abstractRoads=new THREE.LineSegments(edgeGeo,new THREE.LineBasicMaterial({color:0x23ff67,transparent:true,opacity:.38,depthTest:true,depthWrite:false,toneMapped:false}));abstractRoads.renderOrder=-20;abstractRoads.visible=false;scene.add(abstractRoads);
 const orb=new THREE.Group();orb.name='Hyper horizon orb';orb.visible=false;scene.add(orb);let orbYaw=0;
 const disk=new THREE.Mesh(new THREE.CircleGeometry(420,96),new THREE.MeshBasicMaterial({color:0xe9320a,side:THREE.DoubleSide,toneMapped:false,depthWrite:false}));disk.renderOrder=-90;orb.add(disk);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(220,42,8,0)');gradient.addColorStop(.64,'rgba(220,42,8,0)');gradient.addColorStop(.67,'rgba(220,42,8,.3)');gradient.addColorStop(.82,'rgba(180,30,6,.10)');gradient.addColorStop(1,'rgba(100,10,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));halo.scale.set(1300,1300,1);orb.add(halo);
 const barrage=createVerticalStrikes(THREE,{taxi,terrainHeight,getVelocity:api.getVelocity,onHit:api.onStrikeHit});barrage.group.visible=false;scene.add(barrage.group);gridMaterial.uniforms.strikeFlashes.value=barrage.flashes;
 const coins=createHyperCoins(THREE,{taxi,terrainHeight,roads});scene.add(coins.mesh);
 function startChase(){coins.reset(taxi.position);barrage.reset(exits);orbYaw=taxi.rotation.y;entryTime=0;hud.hidden=false;hud.style.opacity='1';}
 function updateChase(dt){barrage.update(dt);entryTime+=dt;hud.style.opacity=String(THREE.MathUtils.clamp((3-entryTime)/.45,0,1));hud.hidden=entryTime>=3;}
 const portalRoot=new THREE.Group();portalRoot.name='Hyper escape gateways';portalRoot.visible=false;scene.add(portalRoot);
 const portalVisuals=Array.from({length:3},(_,i)=>{const tear=createHyperGateway(THREE,{exit:true,index:i});portalRoot.add(tear.group);return tear;});
 const light=new THREE.HemisphereLight(0xffffff,0x78958b,1.8);light.visible=false;scene.add(light);
 const sun=new THREE.DirectionalLight(0xffffff,.7);sun.position.set(-70,100,40);sun.castShadow=false;sun.visible=false;scene.add(sun);
 const entrance=createHyperGateway(THREE),pickup=entrance.group;scene.add(pickup);
 const hud=document.createElement('div');hud.id='hyperHUD';hud.hidden=true;hud.innerHTML='<strong>HyperREALITY</strong><span></span><button disabled>Activate · Q</button>';document.body.append(hud);
 const style=document.createElement('style');style.textContent='#hyperHUD{position:fixed;z-index:1100;top:102px;left:50%;transform:translateX(-50%);max-width:390px;padding:10px 15px;border:1px solid #63f1a8;border-radius:10px;background:#07130fed;color:#ccffe0;font:13px system-ui;text-align:center}#hyperHUD strong{display:block;letter-spacing:2px;color:#72ff9c}#hyperHUD span{display:block;margin:5px 0}#hyperHUD button{padding:6px 12px;font-size:12px}';style.textContent+='body:not(.hyper-active) #hyperHUD{display:none!important}body.hyper-active #hyperHUD strong,body.hyper-active #hyperHUD button,body.hyper-active #guidance,body.hyper-active #job{display:none!important}body.hyper-active #hyperHUD{top:14px!important;border:0;background:#100c20cc;color:#eee4ff;letter-spacing:1px}';document.head.append(style);
 const label=hud.querySelector('span'),button=hud.querySelector('button');button.hidden=!!api.enterOnContact;let lastText='';
 function message(text){if(text!==lastText){label.textContent=text;lastText=text}}
 function place(p,yaw=0){pickup.position.set(p.x,terrainHeight(p.x,p.z)+.05,p.z);pickup.rotation.y=yaw;previous.copy(taxi.position);message('FUNLAND · drive into the arcade.');}
 function activate(){if(phase!=='armed')return false;phase='active';inventory=0;button.disabled=true;api.onActivate?.();document.body.classList.add('hyper-active');skyTime=0;updateSky(0);chooseExits();startChase();previous.copy(taxi.position);message('ESCAPE THROUGH A PORTAL');return true}
 button.onclick=()=>{if(!api.isPaused())activate();button.blur()};
 function chooseExits(){
  // Only choose roads in the starting road's connected component.
  const adjacency=new Map();for(const s of roads)for(const [a,b] of [[s.na,s.nb],[s.nb,s.na]]){if(!a||!b)continue;if(!adjacency.has(a))adjacency.set(a,[]);adjacency.get(a).push(b);}
  const start=roads.reduce((best,s)=>Math.hypot((s.a.x+s.b.x)/2-taxi.position.x,(s.a.z+s.b.z)/2-taxi.position.z)<Math.hypot((best.a.x+best.b.x)/2-taxi.position.x,(best.a.z+best.b.z)/2-taxi.position.z)?s:best,roads[0]);
  const reachable=new Set([start.na]),queue=[start.na];for(let i=0;i<queue.length;i++)for(const n of adjacency.get(queue[i])||[])if(!reachable.has(n)){reachable.add(n);queue.push(n);}
  const candidates=roads.filter(s=>reachable.has(s.na)&&s.length>18).map(segment=>({segment,point:new THREE.Vector3((segment.a.x+segment.b.x)/2,0,(segment.a.z+segment.b.z)/2)})).filter(e=>{const d=Math.hypot(e.point.x-taxi.position.x,e.point.z-taxi.position.z);return d>500&&d<1450&&api.exitStillClear(e)});
  exits.length=0;for(let i=0;i<3;i++){
   const angle=taxi.rotation.y+i*Math.PI*2/3,tx=taxi.position.x-Math.sin(angle)*850,tz=taxi.position.z-Math.cos(angle)*850;
   const options=candidates.filter(e=>exits.every(p=>p.point.distanceTo(e.point)>550));options.sort((a,b)=>Math.hypot(a.point.x-tx,a.point.z-tz)-Math.hypot(b.point.x-tx,b.point.z-tz));
   if(!options.length)throw new Error('No separated safe Hyper Reality exit found');
   const e=options[0];exits.push(e);portalVisuals[i].group.position.set(e.point.x,terrainHeight(e.point.x,e.point.z)+.05,e.point.z);portalVisuals[i].group.rotation.y=Math.atan2(e.segment.b.x-e.segment.a.x,e.segment.b.z-e.segment.a.z);
  }exit=exits[0];
 }
 function restore(){barrage.clear();phase='pickup';entryLock=1.5;pickup.visible=true;returning=false;stun=immunity=0;document.body.classList.remove('hyper-active');hud.hidden=false;hud.style.opacity='1';exit=null;onRestore();previous.copy(taxi.position);message('FUNLAND · drive into the arcade.');}
 function returnToRoad(){if(!free()||returning)return false;returning=true;recoveryOnly=true;barrage.respite();api.prepareReturn();return true;}
 function update(dt){for(const p of portalVisuals)p.update(dt);entrance.update(dt);elapsed+=dt;entryLock=Math.max(0,entryLock-dt);
  if(phase==='pickup'&&entryLock===0&&crossesGateway(previous.clone().addScaledVector(new THREE.Vector3(-Math.sin(taxi.rotation.y),0,-Math.cos(taxi.rotation.y)),2.55),taxi.position.clone().addScaledVector(new THREE.Vector3(-Math.sin(taxi.rotation.y),0,-Math.cos(taxi.rotation.y)),2.55),pickup,entrance.halfWidth)){phase='armed';inventory=1;pickup.visible=false;button.disabled=false;if(api.enterOnContact)activate();else message('Collected · press Q when you want to use it.');}
  if(returning){if(api.finishReturn()){if(recoveryOnly){returning=false;recoveryOnly=false;barrage.respite();previous.copy(taxi.position);}else restore();}return;}
  if(free()){
   updateSky(dt);updateChase(dt);coins.update(dt);
   for(let i=0;i<exits.length;i++){const e=exits[i];
    if(crossesGateway(previous,taxi.position,portalVisuals[i].group,portalVisuals[i].halfWidth)){exit=e;returning=true;recoveryOnly=false;barrage.clear();api.preparePortalReturn(e);break;}
   }
   message('ESCAPE THROUGH A PORTAL');
  }
  previous.copy(taxi.position);
 }

 function render(renderer,camera){if(!free())return false;const visible=new Map(),background=scene.background,fog=scene.fog;
  duskSky.position.copy(camera.position);gridMaterial.uniforms.eye.value.set(taxi.position.x,taxi.position.z);orb.position.set(camera.position.x-Math.sin(orbYaw)*1100,camera.position.y-20,camera.position.z-Math.cos(orbYaw)*1100);orb.lookAt(camera.position.x,orb.position.y,camera.position.z);
  const keep=new Set([duskSky,taxi,abstractGround,abstractRoads,light,sun,orb,portalRoot,barrage.group,coins.mesh]);
  for(const o of scene.children){visible.set(o,o.visible);o.visible=keep.has(o)&&(o===targetRing||o===targetBeacon?o.visible:true)}scene.background=backgroundColour;scene.fog=null;
  try{renderer.render(scene,camera)}finally{for(const [o,v]of visible)o.visible=v;scene.background=background;scene.fog=fog}return true;
 }
 function free(){return phase==='active'}
 return {place,activate,update,render,free,pickup,returnToRoad,get returning(){return returning},get phase(){return phase},get stunned(){return free()&&stun>0},get barrageStats(){return barrage.stats},get exits(){return exits},get coinsCollected(){return coins.collected},get coinsRemaining(){return coins.remaining},get inventory(){return inventory},get exit(){return exit}};
}
