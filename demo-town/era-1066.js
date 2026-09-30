import { createSoldierJourney } from "./1066-journey.js?v=exit-crossing-20260929";
import { create1066Nature } from "./1066-nature.js?v=2";
// Independent 1066 landscape, derived from the preserved Old Time prototype.
// No road meshes or gulls. Visibility is restored after every render.
export function create1066(THREE,api){
 const {scene,taxi,ground,coast,roads,terrainHeight,roadWidthForType,convertPosition,nearestDrivePoint}=api;
 let active=false,cooldown=0;const previous=taxi.position.clone();
 const world=new THREE.Group();world.name='1066 landscape';world.visible=false;scene.add(world);
 const portalRoot=new THREE.Group();portalRoot.name='1066 portals';scene.add(portalRoot);
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:1});
 const grass=mat(0x4b692f),shingle=mat(0x857558);
 // World-space mottling keeps the prototype texture small and stable while driving.
 function mottled(m,tracks=false){m.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 oldWorld;').replace('#include <begin_vertex>','#include <begin_vertex>\noldWorld=(modelMatrix*vec4(position,1.)).xyz;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 oldWorld;\nfloat hash1066(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float noise1066(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash1066(i),hash1066(i+vec2(1,0)),f.x),mix(hash1066(i+vec2(0,1)),hash1066(i+vec2(1,1)),f.x),f.y);}').replace('#include <color_fragment>',`#include <color_fragment>
 float broad=noise1066(oldWorld.xz*.035),variation=noise1066(oldWorld.xz*.16),fine=noise1066(oldWorld.xz*2.8);float soil=smoothstep(.54,.78,broad*.7+variation*.3);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.17,.115,.057),soil*.75);diffuseColor.rgb*=.72+.40*variation+.18*fine;`);};m.customProgramCacheKey=()=> '1066-grass-v2';}
 mottled(grass);mottled(shingle);
 const values=new Float32Array(coast.rows.length*4);coast.rows.forEach((r,i)=>values.set([r.edge,0,0,0],i*4));const lookup=new THREE.DataTexture(values,coast.rows.length,1,THREE.RGBAFormat,THREE.FloatType);lookup.needsUpdate=true;lookup.minFilter=lookup.magFilter=THREE.NearestFilter;
 const landMaterial=grass.clone();mottled(landMaterial);const noiseCompile=landMaterial.onBeforeCompile;
 landMaterial.onBeforeCompile=s=>{noiseCompile(s);s.uniforms.oldCoast={value:lookup};s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D oldCoast;').replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
 if(oldWorld.x>=${coast.minX.toFixed(4)}&&oldWorld.x<=${coast.maxX.toFixed(4)}){float f=(oldWorld.x-(${coast.minX.toFixed(4)}))/${(coast.maxX-coast.minX).toFixed(4)}*${coast.rows.length-1}.;float i=floor(f);float edge=mix(texture2D(oldCoast,vec2((i+.5)/${coast.rows.length}.,.5)).r,texture2D(oldCoast,vec2((min(i+1.,${coast.rows.length-1}.)+.5)/${coast.rows.length}.,.5)).r,fract(f));if(oldWorld.z>edge)discard;}`);};landMaterial.customProgramCacheKey=()=> '1066-land-clipped-v2';
 const land=new THREE.Mesh(ground.geometry.clone(),landMaterial);land.position.copy(ground.position);land.receiveShadow=true;world.add(land);
 function surface(x,z){const r=coast.promenadeAt(x);if(!r||z<r.edge)return terrainHeight(x,z);const shore=r.prom+10;if(z<shore)return THREE.MathUtils.lerp(terrainHeight(x,r.edge),.3,(z-r.edge)/(shore-r.edge));return THREE.MathUtils.lerp(.3,-.15,THREE.MathUtils.clamp((z-shore)/(r.sea-shore),0,1));}
 function strip(material,left,right){const v=[];for(let i=1;i<coast.rows.length;i++){const a=coast.rows[i-1],b=coast.rows[i];for(const p of [left(a),right(b),left(b),left(a),right(a),right(b)])v.push(...p);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);mesh.receiveShadow=true;world.add(mesh);}
 strip(grass,r=>[r.x,terrainHeight(r.x,r.edge)-.18,r.edge],r=>[r.x,.3,r.prom+10]);
 strip(shingle,r=>[r.x,.3,r.prom+10],r=>[r.x,-.15,r.sea]);
 const water=api.waterMaterial.clone();water.depthTest=true;water.depthWrite=true;
 strip(water,r=>[r.x,-.15,r.sea],r=>[r.x,-.15,8000]);
 // No road or track meshes: continuous grass and earth across the saved geography.
 const entry=api.portalEntry||nearestDrivePoint(convertPosition(50.8530,.5688)),leave=nearestDrivePoint(convertPosition(50.8555,.5810));
 let yaw=Math.atan2(-(entry.segment.b.x-entry.segment.a.x),-(entry.segment.b.z-entry.segment.a.z));if(-Math.sin(yaw)>0)yaw+=Math.PI;
 function gate(road,label,colour){const g=new THREE.Group(),ring=new THREE.Mesh(new THREE.TorusGeometry(3.3,.15,6,40),new THREE.MeshBasicMaterial({color:colour}));g.add(ring);g.position.set(road.point.x,terrainHeight(road.point.x,road.point.z)+3.4,road.point.z);g.rotation.y=yaw;
 if(label){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#192820';ctx.fillRect(0,0,512,128);ctx.fillStyle='#f7edc9';ctx.textAlign='center';ctx.font='bold 48px sans-serif';ctx.fillText(label,256,57,480);ctx.font='24px sans-serif';ctx.fillText('DRIVE THROUGH',256,99);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Sprite(new THREE.SpriteMaterial({map:tex}));sign.position.y=4.25;sign.scale.set(6,1.5,1);g.add(sign);}portalRoot.add(g);return g;}
 const entrance=gate(entry,null,0xdca76b),exit=gate(leave,'RETURN TO HASTINGS',0x9ccfa9);exit.visible=false;
 const nature=create1066Nature(THREE,{world,entry:entry.point,exit:leave.point,surface,coast});
 const journey=createSoldierJourney(THREE,{...api,world,surface,entry:entry.point,exit:leave.point});
 let bump=0,hitCooldown=0,hitCount=0,lastHit=null;
 function collide(x,z,yaw,state){const result=nature.resolve(x,z,yaw,state);if(result.hit&&result.impact>.3&&hitCooldown<=0){bump=Math.min(.055,.012+result.impact*.006);hitCooldown=.3;hitCount++;lastHit={kind:result.hit.kind,impact:result.impact};}return result;}
 const style=document.createElement('style');style.textContent='body.era-1066 #job,body.era-1066 #guidance,body.era-1066 #pickupHUD,body.era-1066 #hyperHUD,body.era-1066 #dialogue{display:none!important}#era1066Badge{position:fixed;top:14px;left:50%;transform:translateX(-50%);padding:9px 16px;background:#26352be8;color:#efe6bc;border:1px solid #ada779;border-radius:7px;font:13px system-ui;z-index:1110;pointer-events:none}body.hud-clean #era1066Badge{display:none}';document.head.append(style);
 const badge=document.createElement('div');badge.id='era1066Badge';badge.hidden=true;document.body.append(badge);
 function crossing(g){const a=previous,b=taxi.position,dx=b.x-a.x,dz=b.z-a.z;if(dx*dx+dz*dz>900)return false;const t=THREE.MathUtils.clamp(((g.position.x-a.x)*dx+(g.position.z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(a.x+t*dx-g.position.x,a.z+t*dz-g.position.z)<2.7;}
 function switchMode(next){if(!next){taxi.position.set(leave.point.x,terrainHeight(leave.point.x,leave.point.z)+.15,leave.point.z);taxi.rotation.y=Math.atan2(-(leave.segment.b.x-leave.segment.a.x),-(leave.segment.b.z-leave.segment.a.z));}active=next;cooldown=3;world.visible=active;entrance.visible=!active;exit.visible=active;badge.hidden=!active;document.body.classList.toggle('era-1066',active);journey.switchMode(active);api.onSwitch(active);}
 function update(dt){hitCooldown=Math.max(0,hitCooldown-dt);bump*=Math.exp(-dt*10);cooldown=Math.max(0,cooldown-dt);portalRoot.visible=!api.blocked();
 if(active){nature.update(taxi.position.x,taxi.position.z);if(journey.update(dt))switchMode(false);}
 else if(!api.blocked()&&cooldown===0&&crossing(entrance))switchMode(true);
 if(active)badge.textContent='1066 · English soldier journey';previous.copy(taxi.position);}
 function render(renderer,camera,after){if(!active)return false;const visibility=[];const keep=new Set([taxi,world,portalRoot]);for(const o of scene.children){visibility.push([o,o.visible]);const weather=o.material?.uniforms?.skyTint===undefined&&o.renderOrder===-40;const light=o.isLight&&!o.isPointLight;const allowed=keep.has(o)||weather||light||o===api.rain; o.visible=allowed&&o.visible;}
 const originalFog=scene.fog,lights=[];const fogColour=originalFog?.color?.clone()||new THREE.Color(0x9fae9b);const haze=new THREE.Fog(fogColour,Math.min(originalFog?.near??200,180),Math.min(originalFog?.far??1100,1100));scene.fog=haze;
 for(const o of scene.children)if(o.isDirectionalLight||o.isAmbientLight||o.isHemisphereLight){lights.push([o,o.intensity]);o.intensity*=o.isDirectionalLight?.76:1.06;}
 water.color.copy(api.waterMaterial.color);try{renderer.render(scene,camera);after?.();}finally{scene.fog=originalFog;for(const [o,i]of lights)o.intensity=i;for(const [o,v]of visibility)o.visible=v;}return true;}
 return {journey,update,render,surface,isSea:(x,z)=>{const r=coast.promenadeAt(x);return r?z>=r.sea:false},entry:entry.point,yaw,exit:leave.point,collide,nature,get bump(){return bump},get hitCount(){return hitCount},get lastHit(){return lastHit},get active(){return active}};
}
