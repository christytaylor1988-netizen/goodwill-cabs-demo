// Isolated prototype: one pickup per test session, no random spawning or saved inventory.
export function createHyperReality(THREE,api){
 const {scene,taxi,ground,roads,roadWidthForType,targetRing,targetBeacon,terrainHeight,getSpeed,findExit,canRestore,onRestore}=api;
 let returning=false;
 let phase='pickup',elapsed=0,exit=null,exitClock=0,inventory=0,stun=0,immunity=0,hits=0;
 const backgroundColour=new THREE.Color(0x030510);
 // A six-minute dark colour loop, including a smooth seam back to deep blue.
 const skyPalette=[0x030817,0x10071b,0x1b070c].map(c=>new THREE.Color(c));
 const white=new THREE.Color(0xffffff);let skyTime=0;
 function updateSky(dt){
  skyTime+=dt;const phase=skyTime/120,index=Math.floor(phase)%skyPalette.length,t=phase%1,ease=t*t*(3-2*t);
  backgroundColour.copy(skyPalette[index]).lerp(skyPalette[(index+1)%skyPalette.length],ease);
  // Retain neutral fill so the taxi's own paint and trim remain recognisable.
  light.color.copy(white).lerp(backgroundColour,.23);
  sun.color.copy(white).lerp(backgroundColour,.38);
  gridMaterial.uniforms.skyTint.value.copy(backgroundColour);
 }

 const neon=new THREE.MeshBasicMaterial({color:0x29ff50,toneMapped:false});
 const gridMaterial=new THREE.ShaderMaterial({uniforms:{eye:{value:new THREE.Vector2()},skyTint:{value:backgroundColour.clone()}},vertexShader:`varying vec3 world;void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`,fragmentShader:`varying vec3 world;uniform vec2 eye;uniform vec3 skyTint;void main(){vec2 p=world.xz/5.;vec2 a=abs(fract(p-.5)-.5)/max(fwidth(p),vec2(.0001));float d=min(a.x,a.y);float line=1.-smoothstep(.45,1.5,d);float halo=1.-smoothstep(.5,4.,d);float fade=1.-smoothstep(90.,350.,distance(world.xz,eye));vec3 ink=mix(vec3(.60,.85,.70),vec3(.91,.76,.40),.18+.12*sin(world.x*.015));gl_FragColor=vec4(vec3(.002,.004,.004)+skyTint*.055+mix(ink,skyTint,.16)*(line*.9+halo*.13)*fade,1.);}`});
 const abstractGround=new THREE.Mesh(ground.geometry.clone(),gridMaterial),positions=abstractGround.geometry.attributes.position;
 for(let i=0;i<positions.count;i++)positions.setY(i,terrainHeight(positions.getX(i),positions.getZ(i))+.015);
 abstractGround.geometry.computeBoundingSphere();abstractGround.renderOrder=-30;abstractGround.visible=false;scene.add(abstractGround);
 // The original network remains as thin green edges, letting the grid show through.
 const edgePoints=[];for(const s of roads){const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,len=Math.hypot(dx,dz);if(len<.1)continue;const nx=-dz/len,nz=dx/len,w=roadWidthForType(s.type)/2,n=Math.ceil(len/8);for(const side of [-1,1])for(let i=0;i<n;i++)for(const t of [i/n,(i+1)/n]){const x=s.a.x+dx*t+nx*w*side,z=s.a.z+dz*t+nz*w*side;edgePoints.push(x,terrainHeight(x,z)+.20,z)}}
 const edgeGeo=new THREE.BufferGeometry();edgeGeo.setAttribute('position',new THREE.Float32BufferAttribute(edgePoints,3));const abstractRoads=new THREE.LineSegments(edgeGeo,new THREE.LineBasicMaterial({color:0x23ff67,transparent:true,opacity:.65,depthTest:false,depthWrite:false,toneMapped:false}));abstractRoads.renderOrder=-20;abstractRoads.visible=false;scene.add(abstractRoads);
 let seed=441;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const starsGeo=new THREE.BufferGeometry(),starPoints=[],starColours=[],starPalette=[0xffeed1,0xffffff,0x8ecced,0xe6b87d];for(let i=0;i<1800;i++){const y=rand()*.97,a=rand()*Math.PI*2,r=Math.sqrt(1-y*y)*950;starPoints.push(Math.cos(a)*r,y*950,Math.sin(a)*r);const c=new THREE.Color(starPalette[i%4]);starColours.push(c.r,c.g,c.b)}starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPoints,3));starsGeo.setAttribute('color',new THREE.Float32BufferAttribute(starColours,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({size:1.6,sizeAttenuation:false,vertexColors:true,depthWrite:false,toneMapped:false}));stars.renderOrder=-50;stars.visible=false;scene.add(stars);
 // Two fixed pursuers: capped speed and turning let a fast, well-steered taxi escape.
 const hunters=new THREE.Group();hunters.visible=false;scene.add(hunters);
 const hunterBody=new THREE.OctahedronGeometry(1.5,0),hunterEdges=new THREE.EdgesGeometry(hunterBody);
 const dark=new THREE.MeshStandardMaterial({color:0x090a13,roughness:.8});
 const pursuers=[0xff477e,0x68eaff].map((colour,i)=>{
  const group=new THREE.Group(),shell=new THREE.Mesh(hunterBody,dark);shell.scale.set(1,.5,1.7);group.add(shell);
  const edges=new THREE.LineSegments(hunterEdges,new THREE.LineBasicMaterial({color:colour,toneMapped:false}));edges.scale.copy(shell.scale);group.add(edges);
  const eyeMat=new THREE.MeshBasicMaterial({color:colour,toneMapped:false});for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.BoxGeometry(.28,.16,.12),eyeMat);eye.position.set(side*.4,.1,-1.9);group.add(eye)}
  hunters.add(group);return {group,yaw:0,speed:0,cooldown:0,maxSpeed:13+i};
 });
 function startChase(){stun=immunity=hits=0;pursuers.forEach((p,i)=>{p.yaw=taxi.rotation.y;p.speed=0;p.cooldown=2+i;const side=i?1:-1;p.group.position.set(taxi.position.x+Math.sin(p.yaw)*(25+i*10)+Math.cos(p.yaw)*side*13,0,taxi.position.z+Math.cos(p.yaw)*(25+i*10)-Math.sin(p.yaw)*side*13)})}
 function updateChase(dt){
  stun=Math.max(0,stun-dt);immunity=Math.max(0,immunity-dt);
  const sheltered=exit&&Math.hypot(taxi.position.x-exit.point.x,taxi.position.z-exit.point.z)<14;
  for(const [i,p]of pursuers.entries()){
   p.cooldown=Math.max(0,p.cooldown-dt);
   const pos=p.group.position,dx=taxi.position.x-pos.x,dz=taxi.position.z-pos.z,dist=Math.hypot(dx,dz);
   const retreat=p.cooldown>0||sheltered,desired=Math.atan2(retreat?dx:-dx,retreat?dz:-dz),delta=Math.atan2(Math.sin(desired-p.yaw),Math.cos(desired-p.yaw));
   p.yaw+=THREE.MathUtils.clamp(delta,-.72*dt,.72*dt);
   const wanted=retreat?5:p.maxSpeed*(Math.abs(delta)>1.2?.65:1);p.speed+=THREE.MathUtils.clamp(wanted-p.speed,-8*dt,4*dt);
   pos.x-=Math.sin(p.yaw)*p.speed*dt;pos.z-=Math.cos(p.yaw)*p.speed*dt;
   pos.y=terrainHeight(pos.x,pos.z)+1.1+Math.sin(elapsed*3+i)*.12;p.group.rotation.y=p.yaw;
   if(!retreat&&!immunity&&dist<2.7){stun=.8;immunity=4;hits++;p.cooldown=4;api.onHit?.(pos);}
  }
 }
 const portal=new THREE.Group();for(const [radius,tube,opacity] of [[3.5,.12,1],[3.65,.3,.16],[3.25,.045,.8]]){const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,6,64),new THREE.MeshBasicMaterial({color:0x65ffe0,transparent:opacity<1,opacity,depthWrite:false,toneMapped:false}));portal.add(m)}
 const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;const ctx=signCanvas.getContext('2d');ctx.fillStyle='#06100fcc';ctx.fillRect(0,0,512,128);ctx.fillStyle='#b9ffe3';ctx.textAlign='center';ctx.font='bold 66px sans-serif';ctx.fillText('EXIT',256,66);ctx.font='22px sans-serif';ctx.fillText('RETURN TO HASTINGS',256,106);const tex=new THREE.CanvasTexture(signCanvas);tex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,toneMapped:false}));sign.position.y=4.8;sign.scale.set(8,2,1);portal.add(sign);portal.visible=false;scene.add(portal);
 const light=new THREE.HemisphereLight(0xffffff,0x78958b,1.8);light.visible=false;scene.add(light);
 const sun=new THREE.DirectionalLight(0xffffff,.7);sun.position.set(-70,100,40);sun.castShadow=false;sun.visible=false;scene.add(sun);
 const pickup=new THREE.Group(),body=new THREE.Mesh(new THREE.OctahedronGeometry(.8),new THREE.MeshBasicMaterial({color:0xacffcc,wireframe:true,toneMapped:false}));pickup.add(body);
 const core=new THREE.Mesh(new THREE.OctahedronGeometry(.28),neon);pickup.add(core);scene.add(pickup);
 const returnRing=new THREE.Mesh(new THREE.RingGeometry(3.2,3.5,32),new THREE.MeshBasicMaterial({color:0x52ffff,side:THREE.DoubleSide,depthTest:false,toneMapped:false}));returnRing.rotation.x=-Math.PI/2;returnRing.visible=false;returnRing.renderOrder=4;scene.add(returnRing);
 const guideGeo=new THREE.BufferGeometry();guideGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(3*25),3));const guide=new THREE.Line(guideGeo,new THREE.LineBasicMaterial({color:0x52ffff,depthTest:false,toneMapped:false}));guide.visible=false;guide.frustumCulled=false;guide.renderOrder=4;scene.add(guide);
 const hud=document.createElement('div');hud.id='hyperHUD';hud.innerHTML='<strong>HyperREALITY</strong><span></span><button disabled>Activate · Q</button>';document.body.append(hud);
 const style=document.createElement('style');style.textContent='#hyperHUD{position:fixed;z-index:1100;top:102px;left:50%;transform:translateX(-50%);max-width:390px;padding:10px 15px;border:1px solid #63f1a8;border-radius:10px;background:#07130fed;color:#ccffe0;font:13px system-ui;text-align:center}#hyperHUD strong{display:block;letter-spacing:2px;color:#72ff9c}#hyperHUD span{display:block;margin:5px 0}#hyperHUD button{padding:6px 12px;font-size:12px}';document.head.append(style);
 const label=hud.querySelector('span'),button=hud.querySelector('button');let lastText='';
 function message(text){if(text!==lastText){label.textContent=text;lastText=text}}
 function place(p){pickup.position.set(p.x,terrainHeight(p.x,p.z)+1.2,p.z);message('Drive through the green crystal to collect it.');}
 function activate(){if(phase!=='armed')return false;phase='active';inventory=0;button.disabled=true;api.onActivate?.();document.body.classList.add('hyper-active');skyTime=0;updateSky(0);chooseExit();startChase();return true}
 button.onclick=()=>{if(!api.isPaused())activate();button.blur()};
 function chooseExit(){exit=findExit();if(exit){returnRing.position.set(exit.point.x,terrainHeight(exit.point.x,exit.point.z)+.25,exit.point.z);portal.position.set(exit.point.x,terrainHeight(exit.point.x,exit.point.z)+3.6,exit.point.z)}}
 function restore(){phase='spent';returning=false;stun=immunity=0;document.body.classList.remove('hyper-active');exit=null;onRestore();message('Town restored safely · pickup used.');}
 function returnToRoad(){if(!free()||returning)return false;returning=true;api.prepareReturn();message('Returning to a clear nearby road…');return true;}
 function update(dt){elapsed+=dt;body.rotation.y=elapsed*.7;body.rotation.z=elapsed*.3;
  if(phase==='pickup'&&Math.hypot(taxi.position.x-pickup.position.x,taxi.position.z-pickup.position.z)<2.3){phase='armed';inventory=1;pickup.visible=false;button.disabled=false;message('Collected · press Q when you want to use it.');}
  if(returning){if(api.finishReturn())restore();return;}
  if(free()){
   updateSky(dt);updateChase(dt);
   exitClock-=dt;if(exitClock<=0){exitClock=1;if(!exit||!api.exitStillClear(exit))chooseExit();}
   const dist=exit?Math.hypot(exit.point.x-taxi.position.x,exit.point.z-taxi.position.z):Infinity;
   if(dist<5&&!stun&&canRestore()){restore();return;}
   if(exit){const a=guideGeo.attributes.position;for(let i=0;i<25;i++){const t=i/24,x=taxi.position.x+(exit.point.x-taxi.position.x)*t,z=taxi.position.z+(exit.point.z-taxi.position.z)*t;a.setXYZ(i,x,terrainHeight(x,z)+.3,z)}a.needsUpdate=true;
    message((stun>0?'HIT · recovering…':immunity>0?'DRIVE · brief protection':'VOID · outrun the pursuers')+' · optional EXIT '+Math.round(dist)+'m · align and brake, or press R for a nearby road.');}
   else message('RETURN · finding a clear road for the exit portal.');
  }

 }
 function render(renderer,camera){if(!free())return false;const visible=new Map(),background=scene.background,fog=scene.fog;
  gridMaterial.uniforms.eye.value.set(taxi.position.x,taxi.position.z);stars.position.copy(camera.position);if(exit)portal.lookAt(camera.position.x,portal.position.y,camera.position.z);
  const keep=new Set([taxi,targetRing,targetBeacon,abstractGround,abstractRoads,light,sun,stars,hunters]);if(exit){keep.add(portal);keep.add(returnRing);if(Math.hypot(taxi.position.x-exit.point.x,taxi.position.z-exit.point.z)<35)keep.add(guide)}
  for(const o of scene.children){visible.set(o,o.visible);o.visible=keep.has(o)&&(o===targetRing||o===targetBeacon?o.visible:true)}scene.background=backgroundColour;scene.fog=null;
  try{renderer.render(scene,camera)}finally{for(const [o,v]of visible)o.visible=v;scene.background=background;scene.fog=fog}return true;
 }
 function free(){return phase==='active'}
 return {place,activate,update,render,free,pickup,returnToRoad,get returning(){return returning},get phase(){return phase},get stunned(){return free()&&stun>0},get chaseStats(){return {hits,stun,immunity,distances:pursuers.map(p=>p.group.position.distanceTo(taxi.position))}},get inventory(){return inventory},get exit(){return exit}};
}
