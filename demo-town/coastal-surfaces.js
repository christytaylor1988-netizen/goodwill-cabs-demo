// Shared procedural textures; no stones, reflection passes or shoreline edits.
export function finishCoastalSurfaces(THREE,{shared,beachMaterial,waterMaterial}){
 let seed=6197;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');g.fillStyle='#716b61';g.fillRect(0,0,1024,1024);
 const colours=['#9b9588','#b4aa96','#777971','#8c8072','#c2b9a5','#646b69','#a5937e'];
 for(let i=0;i<18000;i++){const x=rand()*1024,y=rand()*1024,rx=2+rand()*4,ry=1.7+rand()*3,a=rand()*Math.PI;for(const ox of [-1024,0,1024])for(const oy of [-1024,0,1024]){if(x+ox<-8||x+ox>1032||y+oy<-8||y+oy>1032)continue;g.fillStyle='#555750';g.beginPath();g.ellipse(x+ox+.7,y+oy+1,rx+.5,ry+.5,a,0,Math.PI*2);g.fill();g.fillStyle=colours[i%colours.length];g.beginPath();g.ellipse(x+ox,y+oy,rx,ry,a,0,Math.PI*2);g.fill()}}
 const texture=shared(new THREE.CanvasTexture(c));texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
 beachMaterial.map=texture;beachMaterial.color.setHex(0xaaa393);beachMaterial.roughness=1;beachMaterial.depthTest=false;
 const clock={value:0};
 function worldShader(mat,code){mat.onBeforeCompile=s=>{s.uniforms.coastalTime=clock;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 coastWorld;').replace('#include <begin_vertex>','#include <begin_vertex>\ncoastWorld=(modelMatrix*vec4(position,1.0)).xyz;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 coastWorld;\nuniform float coastalTime;').replace('#include <color_fragment>','#include <color_fragment>\n'+code)};mat.customProgramCacheKey=()=>code;mat.needsUpdate=true}
 worldShader(beachMaterial,`float tone=sin(coastWorld.x*.113+sin(coastWorld.z*.071))*sin(coastWorld.z*.169+coastWorld.x*.035);diffuseColor.rgb*=.96+tone*.07;`);
 waterMaterial.color.setHex(0x386f75);waterMaterial.roughness=.42;waterMaterial.metalness=.08;
 worldShader(waterMaterial,`float wave=sin(coastWorld.x*.72+coastWorld.z*2.8+coastalTime*.75+sin(coastWorld.x*.19))*sin(coastWorld.x*.31-coastWorld.z*1.7+coastalTime*.43);
 float broad=sin(coastWorld.x*.023+coastWorld.z*.039)*sin(coastWorld.z*.018);
 wave*=1.0-smoothstep(.25,1.5,length(fwidth(coastWorld.xz))*2.8);
 diffuseColor.rgb*=.93+broad*.075+wave*.09;
 diffuseColor.rgb+=vec3(.022,.035,.031)*pow(max(0.0,wave),8.0);`);
 return {update(dt){clock.value+=Math.min(dt,.05)}};
}
