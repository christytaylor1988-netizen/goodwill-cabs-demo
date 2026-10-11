// Colour only: broad world-space bands reuse the existing ground meshes.
export function applyGroundPalette(grasses,woodland,path,beach){
 for(const mat of new Set(grasses)){
  mat.color.setHex(0x648578);
  const previous=mat.onBeforeCompile,cache=mat.customProgramCacheKey.bind(mat),key=cache();
  mat.onBeforeCompile=shader=>{
   previous.call(mat,shader);
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 paletteXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\npaletteXZ=(modelMatrix*vec4(position,1.0)).xz;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 paletteXZ;').replace('#include <color_fragment>',`#include <color_fragment>
    float sweep=paletteXZ.x*.008+paletteXZ.y*.085+sin(paletteXZ.x*.006)*.35;
    float band=smoothstep(-.25,.40,sin(sweep));
    float wash=.5+.5*sin(paletteXZ.x*.009-paletteXZ.y*.014);
    diffuseColor.rgb*=mix(vec3(.72,.84,.79),vec3(.98,1.12,1.13),band);
    diffuseColor.rgb*=.96+.08*wash;
   `);
  };
  mat.customProgramCacheKey=()=>key+'-painted-grass-3';mat.needsUpdate=true;
 }
 woodland.color.setHex(0x405d4b);
 path.color.setHex(0xb8b5b0);
 beach.color.setHex(0xfff3dd);
}
