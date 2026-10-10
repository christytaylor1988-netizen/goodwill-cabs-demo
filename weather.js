export const DAY_CYCLE_SECONDS = 7 * 60; // Preview: change to 20 * 60 or 30 * 60 later.
// First weather study: one rain draw call and an inexpensive world-space road finish.
// No reflection buffers, extra lights, audio, or changes to vehicle handling.
export function createWeather(THREE,{scene,taxi,roadMaterial,pavementMaterial,hemisphere,sun,signMaterial,waterMaterial}){
 const skyTop={value:new THREE.Color(0x579bd0)},skyHorizon={value:new THREE.Color(0xc4dce5)};
 const moonFade={value:0},moonDirection={value:new THREE.Vector3(.96,.26,-.12).normalize()};
 // Keep the horizon glow within roughly the lowest fifth of the driving-view sky.
 const sky=new THREE.Mesh(new THREE.SphereGeometry(1000,20,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,uniforms:{top:skyTop,horizon:skyHorizon,moonFade,moonDirection},vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 horizon;uniform float moonFade;uniform vec3 moonDirection;varying vec3 skyDirection;void main(){float h=max(0.0,normalize(skyDirection).y);vec3 dir=normalize(skyDirection);vec3 colour=mix(horizon,top,smoothstep(0.0,.065,h));float angle=acos(clamp(dot(dir,moonDirection),-1.0,1.0));float disc=1.0-smoothstep(.010,.012,angle);float halo=exp(-angle*angle/0.0009)*.055;float maria=.86+.09*sin(dir.x*1900.0)*sin(dir.y*1300.0)+.05*sin(dir.z*2200.0);colour+=moonFade*(disc*maria*vec3(1.0,.92,.76)+halo*vec3(.65,.75,1.0));gl_FragColor=vec4(colour,1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));
 sky.frustumCulled=false;sky.renderOrder=-40;scene.add(sky);
 const wet={value:1};
 roadMaterial.onBeforeCompile=shader=>{
  shader.uniforms.weatherWet=wet;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 weatherWorld;').replace('#include <begin_vertex>','#include <begin_vertex>\nweatherWorld=(modelMatrix*vec4(position,1.0)).xyz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform float weatherWet;
   varying vec3 weatherWorld;
   float weatherHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float weatherNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(weatherHash(i),weatherHash(i+vec2(1,0)),f.x),mix(weatherHash(i+vec2(0,1)),weatherHash(i+vec2(1,1)),f.x),f.y);}
  `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
   float wetPatch=smoothstep(.38,.72,weatherNoise(weatherWorld.xz*.62));
   roughnessFactor=mix(roughnessFactor,mix(.64,.54,wetPatch),weatherWet);
   diffuseColor.rgb*=1.0-weatherWet*wetPatch*.035;
  `);
 };
 roadMaterial.customProgramCacheKey=()=> 'marina-weather-time-v2';roadMaterial.needsUpdate=true;
 const count=1600,positions=new Float32Array(count*6),colours=new Float32Array(count*6),drops=new Float32Array(count*4);
 let seed=481;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<count;i++){
  drops[i*4]=(random()-.5)*70;drops[i*4+1]=random()*34;drops[i*4+2]=(random()-.5)*70;drops[i*4+3]=.65+random()*.7;
  const shade=.55+random()*.45;for(let j=0;j<2;j++){const k=i*6+j*3;colours[k]=.65*shade;colours[k+1]=.77*shade;colours[k+2]=.83*shade}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('color',new THREE.BufferAttribute(colours,3));
 const rain=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.68,depthWrite:false,fog:true}));rain.frustumCulled=false;scene.add(rain);
 const weatherProfiles={
  sunny:{sky:0x77bce9,sun:1,ambient:1,near:300,far:1600},
  overcast:{sky:0x87949e,sun:.18,ambient:.86,near:150,far:950},
  rain:{sky:0x647580,sun:.12,ambient:.70,near:85,far:560},
  fog:{sky:0xa1adae,sun:.10,ambient:.85,near:25,far:240}
 };
 const timeProfiles={
  morning:{sky:0xa6d1ec,sun:2.5,ambient:1.9,color:0xffe5bc,hemi:0xddeeff,ground:0x53634d,offset:[-160,110,70]},
  afternoon:{sky:0x77bce9,sun:3.2,ambient:2.05,color:0xfff3d8,hemi:0xddeeff,ground:0x53634d,offset:[-70,200,80]},
  evening:{sky:0x7394bd,sun:2.25,ambient:.95,color:0xffaf69,hemi:0xb1becf,ground:0x453d40,offset:[170,48,-80]},
  night:{sky:0x02050c,sun:.17,ambient:.42,color:0x9cb8e0,hemi:0x7792b9,ground:0x202a39,offset:[-90,140,-110]}
 };
 // Cyclic keyframes; smoothstep gives zero slope at each joined stage.
 timeProfiles.dusk={sky:0x4f6f9f,sun:.38,ambient:.72,color:0xffb7a2,hemi:0x91a4c5,ground:0x343447,offset:[185,8,-100]};
 timeProfiles.dawn={sky:0xa48da9,sun:.5,ambient:.85,color:0xffc3ab,hemi:0xbbbdde,ground:0x4b4954,offset:[-190,12,50]};
 timeProfiles.bluehour={sky:0x10254b,sun:.19,ambient:.52,color:0xaac6ed,hemi:0x6e8dbb,ground:0x202b3c,offset:[-90,140,-110]};
 timeProfiles.latenight={...timeProfiles.night};
 const stages=['morning','afternoon','evening','dusk','bluehour','night','latenight','dawn'];
 const horizon=[0xe2dfce,0xc4dce5,0xf0b18e,0xd1b6c7,0x354b73,0x080f1e,0x080f1e,0xd9adb4].map(c=>new THREE.Color(c));
 const sea=[0x537e86,0x386f75,0x6e7983,0x566c87,0x203e63,0x10283c,0x10283c,0x536878].map(c=>new THREE.Color(c));
 const darkness=[0,0,.25,.65,.95,1,1,.5],offset=new THREE.Vector3(),mixColor=new THREE.Color(),weatherColor=new THREE.Color();
 let mode='rain',timeOfDay='afternoon',time=0,phase=1/8,nightAmount=0,seek=null,seaClock=2;
 const seaMaterials=new Set([waterMaterial]);
 function followSun(){sun.position.copy(taxi.position).add(offset);sun.target.position.copy(taxi.position);sun.target.updateMatrixWorld();}
 function apply(){
  const f=phase*stages.length,i=Math.floor(f)%stages.length,j=(i+1)%stages.length,u=f-Math.floor(f),t=u*u*(3-2*u),a=timeProfiles[stages[i]],b=timeProfiles[stages[j]],w=weatherProfiles[mode];
  const lerp=(a,b)=>a+(b-a)*t;timeOfDay=stages[i];nightAmount=lerp(darkness[i],darkness[j]);
  const cloud=mode==='sunny'?0:mode==='overcast'?.65:mode==='rain'?.8:.88;
  weatherColor.setHex(w.sky).multiplyScalar(1-nightAmount*.99);
  skyTop.value.setHex(a.sky).lerp(mixColor.setHex(b.sky),t).lerp(weatherColor,cloud);
  skyHorizon.value.copy(horizon[i]).lerp(horizon[j],t).lerp(weatherColor,cloud);
  moonFade.value=THREE.MathUtils.smoothstep(nightAmount,.55,.97)*(mode==='sunny'?1:mode==='overcast'?.32:mode==='rain'?.14:.06);
  sky.visible=true;scene.background.copy(skyHorizon.value);scene.fog.color.copy(skyHorizon.value);
  scene.fog.near=w.near*(1-nightAmount*.2);scene.fog.far=w.far*(1-nightAmount*.28);
  hemisphere.intensity=lerp(a.ambient,b.ambient)*w.ambient;
  hemisphere.color.setHex(a.hemi).lerp(mixColor.setHex(b.hemi),t);hemisphere.groundColor.setHex(a.ground).lerp(mixColor.setHex(b.ground),t);
  sun.intensity=lerp(a.sun,b.sun)*w.sun;sun.color.setHex(a.color).lerp(mixColor.setHex(b.color),t);
  offset.set(...a.offset).lerp(new THREE.Vector3(...b.offset),t);followSun();
  for(const m of seaMaterials)if(m)m.color.copy(sea[i]).lerp(sea[j],t).lerp(weatherColor,.18*cloud);
  const rainy=mode==='rain';wet.value=rainy?1:mode==='fog'?.25:0;
  roadMaterial.color.setHex(rainy?0x30383b:mode==='fog'?0x454b4b:0x505351);roadMaterial.roughness=rainy?.62:.95;
  pavementMaterial.color.setHex(rainy?0x858f8d:mode==='fog'?0x969e99:0xa9a69d);
  signMaterial.emissiveIntensity=1+nightAmount*2;rain.visible=rainy;rain.material.opacity=.68-nightAmount*.32;
 }
 function setMode(next){if(!weatherProfiles[next])return;mode=next;apply()}
 // Manual time buttons smoothly travel forward to the selected stage over three seconds.
 function setTime(next){const index=stages.indexOf(next);if(index<0)return;const target=index/stages.length,delta=(target-phase+1)%1;seek={start:phase,delta,elapsed:0};}
 function update(dt){
  const step=Math.max(0,Math.min(dt,.1));
  if(seek){seek.elapsed+=step;const u=Math.min(1,seek.elapsed/3);phase=(seek.start+seek.delta*u*u*(3-2*u))%1;if(u===1)seek=null;}
  else phase=(phase+step/DAY_CYCLE_SECONDS)%1;
  seaClock+=step;if(seaClock>2){seaClock=0;seaMaterials.clear();seaMaterials.add(waterMaterial);scene.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(m.userData.timeCycleSea)seaMaterials.add(m);});}
  apply();sky.position.copy(taxi.position);
  if(mode!=='rain')return;time+=dt;
  rain.position.set(taxi.position.x,taxi.position.y,taxi.position.z);
  const wind=4.5+Math.sin(time*.33)*1.8;
  for(let i=0;i<count;i++){
   const k=i*4,q=i*6,rate=drops[k+3];drops[k]-=wind*dt;drops[k+1]-=26*rate*dt;
   if(drops[k+1]<-3){drops[k+1]=31;drops[k]=(random()-.5)*70;drops[k+2]=(random()-.5)*70}
   if(drops[k]<-35)drops[k]+=70;
   positions[q]=drops[k];positions[q+1]=drops[k+1];positions[q+2]=drops[k+2];positions[q+3]=drops[k]+wind*.055;positions[q+4]=drops[k+1]+1.45*rate;positions[q+5]=drops[k+2]+.08;
  }
  geometry.attributes.position.needsUpdate=true;
 }
 setMode('rain');update(0);
 return {setMode,setTime,followSun,update,rain,wet,get moonlight(){return moonFade.value},get darkness(){return nightAmount},get phase(){return phase},get mode(){return mode},get timeOfDay(){return timeOfDay}};
}
