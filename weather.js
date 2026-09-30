// First weather study: one rain draw call and an inexpensive world-space road finish.
// No reflection buffers, extra lights, audio, or changes to vehicle handling.
export function createWeather(THREE,{scene,taxi,roadMaterial,pavementMaterial,hemisphere,sun,signMaterial}){
 const skyTop={value:new THREE.Color(0x579bd0)},skyHorizon={value:new THREE.Color(0xc4dce5)};
 const sky=new THREE.Mesh(new THREE.SphereGeometry(1000,20,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,uniforms:{top:skyTop,horizon:skyHorizon},vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 horizon;varying vec3 skyDirection;void main(){float h=max(0.0,normalize(skyDirection).y);gl_FragColor=vec4(mix(horizon,top,smoothstep(0.0,.32,h)),1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));
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
  evening:{sky:0xd6a080,sun:2.25,ambient:.95,color:0xffaf69,hemi:0xb1becf,ground:0x453d40,offset:[170,48,-80]},
  night:{sky:0x080f20,sun:.23,ambient:.65,color:0x9cb8e0,hemi:0x7792b9,ground:0x202a39,offset:[-90,140,-110]}
 };
 let mode='rain',timeOfDay='afternoon',time=0;
 function followSun(){
  const offset=timeProfiles[timeOfDay].offset;
  sun.position.set(taxi.position.x+offset[0],taxi.position.y+offset[1],taxi.position.z+offset[2]);
  sun.target.position.copy(taxi.position);sun.target.updateMatrixWorld();
 }
 function apply(){
  const w=weatherProfiles[mode],t=timeProfiles[timeOfDay],night=timeOfDay==='night',evening=timeOfDay==='evening';
  const rainy=mode==='rain';wet.value=rainy?1:mode==='fog'?.25:0;
  scene.background.setHex(w.sky);
  if(night)scene.background.setHex(mode==='fog'?0x17202c:mode==='sunny'?t.sky:0x101923);
  else if(evening)scene.background.lerp(new THREE.Color(t.sky),mode==='sunny'?.85:.3);
  else if(timeOfDay==='morning')scene.background.lerp(new THREE.Color(t.sky),mode==='sunny'?.35:.08);
  sky.visible=mode==='sunny'&&!night&&!evening;
  scene.fog.color.copy(scene.background);scene.fog.near=w.near;scene.fog.far=w.far;
  if(sky.visible)scene.fog.color.copy(skyHorizon.value);
  hemisphere.intensity=t.ambient*w.ambient;hemisphere.color.setHex(t.hemi);hemisphere.groundColor.setHex(t.ground);
  sun.intensity=t.sun*w.sun;sun.color.setHex(t.color);followSun();
  roadMaterial.color.setHex(rainy?0x30383b:mode==='fog'?0x454b4b:0x505351);roadMaterial.roughness=rainy?.62:.95;
  pavementMaterial.color.setHex(rainy?0x858f8d:mode==='fog'?0x969e99:0xa9a69d);
  signMaterial.emissiveIntensity=night?3:evening?1.8:1;
  rain.visible=rainy;rain.material.opacity=night?.36:.68;
 }
 function setMode(next){if(!weatherProfiles[next])return;mode=next;apply()}
 function setTime(next){if(!timeProfiles[next])return;timeOfDay=next;apply()}
 function update(dt){
  sky.position.copy(taxi.position);
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
 return {setMode,setTime,followSun,update,rain,wet,get mode(){return mode},get timeOfDay(){return timeOfDay}};
}
