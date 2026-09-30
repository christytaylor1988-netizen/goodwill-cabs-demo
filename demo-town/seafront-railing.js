// Shared paint finish: predominantly white, with sparse chips and rust flecks.
export function seafrontRailingMaterial(THREE,shared){
 const material=shared(new THREE.MeshStandardMaterial({color:0xeeeae0,roughness:.92,metalness:.08}));
 material.onBeforeCompile=s=>{
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 railWorld;').replace('#include <begin_vertex>',`#include <begin_vertex>
 vec4 railPoint=vec4(position,1.);
 #ifdef USE_INSTANCING
 railPoint=instanceMatrix*railPoint;
 #endif
 railWorld=(modelMatrix*railPoint).xyz;`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 railWorld;').replace('#include <color_fragment>',`#include <color_fragment>
 vec3 cell=floor(railWorld*19.);float fleck=fract(sin(dot(cell,vec3(12.9898,78.233,37.719)))*43758.5453);
 float chip=smoothstep(.963,.987,fleck);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.38,.21,.11),chip*.68);diffuseColor.rgb*=.96+.04*sin(railWorld.y*6.+railWorld.x*.7);`);
 };material.customProgramCacheKey=()=> 'weathered-white-seafront-v1';return material;
}
