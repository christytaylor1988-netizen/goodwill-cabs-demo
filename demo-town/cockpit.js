// A single DOM cockpit reuses the existing Leaflet map: no extra WebGL renderer or map tiles.
export function createCockpit(THREE,api){
 const {camera,taxi,taxiVisual,miniMap,terrainHeight}=api;
 const root=document.createElement('div');root.id='cockpit';root.hidden=true;
 root.innerHTML=`<div class="cab-roof"></div><div class="cab-mirror" aria-label="Rear-view mirror"><div class="cab-mirror-glass"></div></div><div class="cab-pillar left"></div><div class="cab-pillar right"></div><div class="cab-wiper"></div><div class="cab-dash"><div class="cab-vent left"></div><div class="cab-vent right"></div><div class="cab-instruments"><span>MARINA · 07</span><strong id="cabSpeed">0 <small>MPH</small></strong><span id="cabGear">PARKED</span></div><div class="cab-wheel"><svg viewBox="0 0 300 300" aria-label="Steering wheel"><circle cx="150" cy="150" r="129" fill="none" stroke="#080e12" stroke-width="30"/><circle cx="150" cy="150" r="130" fill="none" stroke="#3c474b" stroke-width="3"/><path d="M24 127 L110 139 L131 170 L133 276 L166 276 L170 172 L194 141 L277 125 L274 151 L184 180 L174 210 L122 210 L113 181 L28 153Z" fill="#222d32" stroke="#586165" stroke-width="3"/><ellipse cx="150" cy="153" rx="52" ry="39" fill="#152026" stroke="#39474b" stroke-width="3"/><text x="150" y="157" text-anchor="middle" fill="#aab6b8" font-size="12" font-family="sans-serif" letter-spacing="2">MARINA</text></svg></div></div><div id="cabPhone"><div class="phone-speaker"></div><div class="phone-title">MARINA NAV <span>LIVE · N ↑</span></div><div id="phoneMapSlot"></div><div class="phone-off">Map hidden · press M</div><div class="phone-guidance"><span id="phoneArrow">↑</span><div><strong id="phoneDestination">Available for jobs</strong><small id="phoneDistance">Hastings · live position</small></div></div><div class="phone-home"></div></div>`;
 document.body.append(root);
 const frame=document.getElementById('miniMapFrame'),home=frame.parentNode,next=frame.nextSibling,slot=root.querySelector('#phoneMapSlot'),wheel=root.querySelector('.cab-wheel'),speed=root.querySelector('#cabSpeed'),gear=root.querySelector('#cabGear'),destination=root.querySelector('#phoneDestination'),distance=root.querySelector('#phoneDistance'),arrow=root.querySelector('#phoneArrow');
 const button=document.createElement('button');button.id='cameraToggle';button.textContent='In-car view · C';document.getElementById('controls').append(button);
 let active=false,elapsed=0,pitch=0;
 const eye=new THREE.Vector3(),ahead=new THREE.Vector3();
 // Small cached rear image: 8 refreshes/sec, 150 m range, shared renderer and existing shadows.
 const mirrorCamera=new THREE.PerspectiveCamera(36,3.1,.2,150),mirrorTarget=new THREE.WebGLRenderTarget(256,84,{depthBuffer:true,stencilBuffer:false});
 const mirrorScene=new THREE.Scene(),mirrorScreenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),mirrorQuadGeometry=new THREE.PlaneGeometry(2,2);
 const uv=mirrorQuadGeometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));
 const mirrorQuad=new THREE.Mesh(mirrorQuadGeometry,new THREE.MeshBasicMaterial({map:mirrorTarget.texture,toneMapped:false,depthTest:false,depthWrite:false}));mirrorScene.add(mirrorQuad);
 const mirrorGlass=root.querySelector('.cab-mirror-glass'),savedViewport=new THREE.Vector4(),savedScissor=new THREE.Vector4(),rearTarget=new THREE.Vector3();let lastMirror=-Infinity,mirrorFrames=0;
 function renderMirror(time){
  if(!active)return;
  const renderer=api.renderer,rect=mirrorGlass.getBoundingClientRect(),oldTarget=renderer.getRenderTarget(),oldClear=renderer.autoClear,oldShadow=renderer.shadowMap.autoUpdate,oldScissor=renderer.getScissorTest();renderer.getViewport(savedViewport);renderer.getScissor(savedScissor);
  try{
   if(time-lastMirror>=125){
    const fx=-Math.sin(taxi.rotation.y),fz=-Math.cos(taxi.rotation.y);
    mirrorCamera.position.set(taxi.position.x-fx*1.85,taxi.position.y+1.35,taxi.position.z-fz*1.85);
    rearTarget.set(mirrorCamera.position.x-fx*35,mirrorCamera.position.y-Math.tan(pitch)*35,mirrorCamera.position.z-fz*35);mirrorCamera.lookAt(rearTarget);
    renderer.shadowMap.autoUpdate=false;renderer.setScissorTest(false);renderer.setRenderTarget(mirrorTarget);renderer.autoClear=true;renderer.render(api.scene,mirrorCamera);lastMirror=time;mirrorFrames++;
   }
   renderer.setRenderTarget(oldTarget);renderer.autoClear=false;
   const x=rect.left,y=innerHeight-rect.bottom;renderer.setViewport(x,y,rect.width,rect.height);renderer.setScissor(x,y,rect.width,rect.height);renderer.setScissorTest(true);renderer.render(mirrorScene,mirrorScreenCamera);
  }finally{renderer.setRenderTarget(oldTarget);renderer.setViewport(savedViewport);renderer.setScissor(savedScissor);renderer.setScissorTest(oldScissor);renderer.autoClear=oldClear;renderer.shadowMap.autoUpdate=oldShadow;}
 }

 function resize(){if(active||frame.parentNode===home){miniMap.invalidateSize({pan:false});api.updateMap();}}
 const observer=new ResizeObserver(resize);observer.observe(slot);observer.observe(frame);
 function set(value){active=!!value;lastMirror=-Infinity;root.hidden=!active;document.body.classList.toggle('in-car',active);taxiVisual.visible=!active;button.textContent=active?'Outside view · C':'In-car view · C';if(active)slot.append(frame);else home.insertBefore(frame,next);api.refreshCamera();requestAnimationFrame(resize);}
 button.onclick=()=>{set(!active);button.blur()};
 function updateCamera(instant,dt){
  if(!active)return false;
  // Driver eye is inside the cabin. No trailing lag on bends; only gentle pitch smoothing.
  const fx=-Math.sin(taxi.rotation.y),fz=-Math.cos(taxi.rotation.y),grade=Math.atan2(terrainHeight(taxi.position.x+fx*3,taxi.position.z+fz*3)-terrainHeight(taxi.position.x-fx*3,taxi.position.z-fz*3),6);
  pitch=instant?grade:THREE.MathUtils.lerp(pitch,grade,1-Math.exp(-5*dt));
  eye.set(.38,1.32,-.28).applyQuaternion(taxi.quaternion).add(taxi.position);camera.position.copy(eye);
  ahead.set(eye.x+fx*40,eye.y+Math.tan(pitch)*40,eye.z+fz*40);camera.lookAt(ahead);return true;
 }
 function update(dt){if(!active)return;const s=api.state();wheel.style.transform=`translateX(-50%) rotate(${-s.steer*100}deg)`;elapsed+=dt;if(elapsed<.12)return;elapsed=0;speed.innerHTML=Math.round(Math.abs(s.speed)*2.236936)+' <small>MPH</small>';gear.textContent=s.gear;destination.textContent=s.destination;distance.textContent=s.distance==='—'?'Hastings · live position':s.distance+' · direct bearing';arrow.style.transform=s.arrow;arrow.style.opacity=s.hasTarget?'1':'.25';root.classList.toggle('cab-night',s.night);root.classList.toggle('cab-rain',s.rain);}
 return {set,toggle:()=>set(!active),updateCamera,update,renderMirror,get mirrorFrames(){return mirrorFrames},get active(){return active}};
}
