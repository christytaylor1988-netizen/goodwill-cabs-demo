// Sparse night-only window dressing. No interiors, point lights, timers or gameplay state.
export function createWindowLife(T,shared){
 const fade={value:0},tiles=new Set(),enabled=new WeakSet();
 const hash=n=>{const v=Math.sin(n*12.9898+78.233)*43758.5453;return v-Math.floor(v)};
 // Existing tiled façade windows: light only glass pixels, leaving sash frames intact.
 function facade(material){if(enabled.has(material)||!material.map)return material;enabled.add(material);const before=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=shader=>{before?.(shader);shader.uniforms.roomNight=fade;shader.uniforms.roomDistrict={value:material.map.image.width===192?1:0};
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 roomWorld;').replace('#include <begin_vertex>','#include <begin_vertex>\nroomWorld=(modelMatrix*vec4(position,1.)).xyz;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
    uniform float roomNight;uniform float roomDistrict;varying vec3 roomWorld;
    float roomBand(float p,float a,float b,float fw){return smoothstep(a-fw,a+fw,p)*(1.-smoothstep(b-fw,b+fw,p));}
    float roomHash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
   `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    #ifdef USE_MAP
    // Derivatives recover a stable texture-cell origin on each differently oriented façade.
    vec2 u=vMapUv,q=fract(u),ax=dFdx(u),ay=dFdy(u);float det=ax.x*ay.y-ax.y*ay.x;
    if(roomNight>0.001&&abs(det)>0.000000001){
     vec3 px=dFdx(roomWorld),py=dFdy(roomWorld);
     vec3 du=(px*ay.y-py*ax.y)/det,dv=(py*ax.x-px*ay.x)/det;
     vec3 origin=roomWorld-du*q.x-dv*q.y;
     float r=roomHash(floor(origin*.23+vec3(.173)));
     // Analytic glass coverage survives mip filtering; never classify a distant
     // window using its averaged wall/glass colour. Match the original sash pixels.
     vec2 fw=max(fwidth(q)*.55,vec2(.001));
     vec4 bounds=mix(vec4(38.,31.,90.,97.)/128.,vec4(66.,33.,128.,140.)/192.,roomDistrict);
     float glass=roomBand(q.x,bounds.x,bounds.z,fw.x)*roomBand(1.-q.y,bounds.y,bounds.w,fw.y);
     glass*=1.-roomBand(q.x,mix(62./128.,95./192.,roomDistrict),mix(66./128.,99./192.,roomDistrict),fw.x);
     glass*=1.-roomBand(1.-q.y,mix(62./128.,83./192.,roomDistrict),mix(66./128.,87./192.,roomDistrict),fw.y);
     if(roomDistrict>.5){glass*=1.-roomBand(1.-q.y,56./192.,58./192.,fw.y);glass*=1.-roomBand(1.-q.y,112./192.,114./192.,fw.y);}
     if(r<.19&&glass>.001){
      float style=roomHash(floor(origin*.23+vec3(.173))+17.);
      float curtain=1.;
      if(style<.55){curtain=mix(.22,.58,.5+.5*sin(q.x*95.));if(q.x>.43&&q.x<.60)curtain=1.;}
      if(style>.70&&q.y>.45&&q.y<.49)curtain=.06; // slightly lifted sash / dark opening
      if(style>.94){vec2 p=(q-vec2(.53,.42))*vec2(2.,1.);if(length(p)<.055||(abs(p.x)<.055&&p.y<-.045&&p.y>-.20))curtain=.08;}
      vec3 warm=mix(vec3(1.,.42,.11),vec3(1.,.72,.35),style);
      totalEmissiveRadiance+=warm*curtain*roomNight*.85*glass;
     }
    }
    #endif
   `);
  };material.customProgramCacheKey=()=>key()+'-window-life-distance-2';material.needsUpdate=true;return material;
 }
 // Eight tiny room portraits in one atlas; dark areas suggest depth behind the glass.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=64;const ctx=canvas.getContext('2d');
 for(let v=0;v<8;v++){const x=v*64,g=ctx.createLinearGradient(x,0,x+64,64);g.addColorStop(0,['#c88b47','#dbad70','#ba7039','#e3b478'][v%4]);g.addColorStop(1,'#503822');ctx.fillStyle=g;ctx.fillRect(x,0,64,64);
  if(v%3!==1){ctx.fillStyle=['#876449','#b88d60','#885d3e'][v%3];ctx.fillRect(x,0,18,64);ctx.fillRect(x+45,0,19,64);ctx.fillStyle='#3c30254f';for(let i=3;i<64;i+=5)if(i<18||i>45)ctx.fillRect(x+i,0,2,64);}
  if(v===2||v===5){ctx.fillStyle='#211f1b';ctx.fillRect(x+20,27,23,9);ctx.fillStyle='#bc9c76';ctx.fillRect(x+20,36,23,2);}
  if(v===7){ctx.fillStyle='#302b25';ctx.beginPath();ctx.arc(x+34,36,4,0,Math.PI*2);ctx.fill();ctx.fillRect(x+29,40,10,15);}
  ctx.fillStyle='#4c4436';ctx.fillRect(x+30,0,3,64);ctx.fillRect(x,31,64,3);
 }
 const tex=shared(new T.CanvasTexture(canvas));tex.colorSpace=T.SRGBColorSpace;tex.magFilter=T.LinearFilter;
 const roomMaterial=shared(new T.MeshBasicMaterial({map:tex,side:T.DoubleSide,color:0xffdeab,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:true}));
 function capture(tile,children){const records=tile.roomWindows??=[];
  for(const o of children){if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.material.map||o.material.emissiveIntensity>1)continue;
   const col=o.material.color;if(!col||col.b<col.r*1.15||col.g<col.r*1.03)continue;
   const g=o.geometry;g.computeBoundingBox();const b=g.boundingBox,size=b.getSize(new T.Vector3()),centre=b.getCenter(new T.Vector3());
   if(size.x<.45||size.x>3.2||size.y<.65||size.y>2.8||size.z>.076||o.position.y<1)continue;
   o.updateMatrix();const p=centre.clone().applyMatrix4(o.matrix),seed=p.x*4.37+p.z*7.91+p.y*31.11;if(hash(seed)>.18)continue;
   const variant=Math.floor(hash(seed+97)*8);
   for(const side of [-1,1]){const vertices=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]].map(([x,y])=>new T.Vector3(centre.x+x*size.x*.97,centre.y+y*size.y*.97,centre.z+side*(size.z/2+.009)).applyMatrix4(o.matrix));records.push({vertices,variant});}
  }
 }
 // Flush each building batch so windows arrive with the façades, not at tile completion.
 // One mesh per tile is retained; staging arrays are freed when construction finishes.
 function finish(tile,complete=false){
  if(tile.roomWindows?.length){
   const buffers=tile.roomBuffers??={points:[],uv:[]},records=tile.roomWindows;
   for(const r of records){const coords=[[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]];r.vertices.forEach((p,i)=>{buffers.points.push(p.x,p.y,p.z);buffers.uv.push((r.variant+.025+coords[i][0]*.95)/8,.025+coords[i][1]*.95)});}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(buffers.points,3));g.setAttribute('uv',new T.Float32BufferAttribute(buffers.uv,2));g.computeBoundingSphere();
   if(tile.roomWindowMesh){tile.roomWindowMesh.geometry.dispose();tile.roomWindowMesh.geometry=g;}
   else{const mesh=new T.Mesh(g,roomMaterial);mesh.name='Occasional warm room windows';mesh.userData.keepWindowBatch=true;mesh.visible=fade.value>.001;tile.group.add(mesh);tile.roomWindowMesh=mesh;tiles.add(tile);}
   tile.roomWindowCount=(tile.roomWindowCount||0)+records.length/2;records.length=0;
  }
  if(complete){delete tile.roomBuffers;delete tile.roomWindows;}
 }
 function setTime(darkness){fade.value=T.MathUtils.smoothstep(darkness,.12,.65);roomMaterial.opacity=fade.value*.83;for(const tile of tiles){if(!tile.group.parent){tiles.delete(tile);continue;}tile.roomWindowMesh.visible=fade.value>.001;}}
 return {facade,capture,finish,setTime,get stats(){return {fade:fade.value,tiles:tiles.size,panes:[...tiles].reduce((n,t)=>n+t.roomWindowCount,0),lights:0}}};
}
