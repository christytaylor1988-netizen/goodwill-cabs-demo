// Eversfield-only façade replacement. Original footprint/collision registration is retained.
const wells=[],keys=new Set();let uniforms=null,materials=null;
export function configureEversfieldWells(T,surfaces){
 uniforms={count:{value:0},rects:{value:Array.from({length:96},()=>new T.Vector4())},frames:{value:Array.from({length:96},()=>new T.Vector2())}};
 for(const material of new Set(surfaces)){
  const before=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=shader=>{before?.(shader);Object.assign(shader.uniforms,{efWellCount:uniforms.count,efWellRects:uniforms.rects,efWellFrames:uniforms.frames});
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 efGroundXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nefGroundXZ=(modelMatrix*vec4(position,1.)).xz;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 efGroundXZ;uniform int efWellCount;uniform vec4 efWellRects[96];uniform vec2 efWellFrames[96];').replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
   if(efGroundXZ.x>-420.&&efGroundXZ.x<70.&&efGroundXZ.y>1750.&&efGroundXZ.y<2050.){
    for(int wi=0;wi<96;wi++){if(wi>=efWellCount)break;vec4 r=efWellRects[wi];vec2 q=efGroundXZ-r.xy;vec2 f=efWellFrames[wi];vec2 local=vec2(q.x*f.x-q.y*f.y,q.x*f.y+q.y*f.x);if(abs(local.x)<r.z&&abs(local.y)<r.w)discard;}
   }`);
  };material.customProgramCacheKey=()=>key()+'-eversfield-wells-1';material.needsUpdate=true;
 }
}
export function buildEversfieldTerrace(T,{poly,tags,seed,tile,shared,findNearestRoadPoint,polygonShape,terrainHeight}){
 const ps=poly.outer,cx=ps.reduce((s,p)=>s+p.x,0)/ps.length,cz=ps.reduce((s,p)=>s+p.y,0)/ps.length;
 if(cx< -400||cx>60||cz<1800||cz>2020||['garage','shed','garages'].includes(tags.building))return false;
 let face=null;
 for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],len=a.distanceTo(b);if(len<4||Math.abs(b.y-a.y)>len*.65)continue;const x=(a.x+b.x)/2,z=(a.y+b.y)/2,r=findNearestRoadPoint({x,z},true);if(r?.segment.roadName!=='Eversfield Place'||r.distance>22||r.point.z<z)continue;if(!face||z>face.z)face={x,z,len,angle:Math.atan2(-(b.y-a.y)*Math.sign(b.x-a.x),Math.abs(b.x-a.x)),road:r};}
 if(!face)return false;
 if(!materials){const m=c=>shared(new T.MeshStandardMaterial({color:c,roughness:.92}));materials={walls:[0xe0ddce,0xd8d2be,0xe5e4da,0xb8c4c5].map(m),trim:m(0xf2ecda),glass:m(0x496372),dark:m(0x292e31),stone:m(0xb4aea0),door:m(0x63534a),well:m(0x52524c)}}
 const M=materials,wall=M.walls[Math.abs(seed)%4],height=16.8+(Math.abs(seed)%3)*.65,base=Math.max(...ps.map(p=>terrainHeight(p.x,p.y))),{x,z,len,angle}=face,c=Math.cos(angle),s=Math.sin(angle);
 const pt=(u,v)=>({x:x+c*u+s*v,z:z-s*u+c*v});
 function box(mat,u,y,v,w,h,d){const p=pt(u,v),mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(p.x,y,p.z);mesh.rotation.y=angle;mesh.castShadow=true;mesh.receiveShadow=true;tile.group.add(mesh)}
 const geometry=new T.ExtrudeGeometry(polygonShape(poly),{depth:height,bevelEnabled:false});geometry.rotateX(Math.PI/2);const body=new T.Mesh(geometry,wall);body.position.y=height;tile.group.add(body);
 const homes=Math.max(1,Math.round(len/7.7)),span=len/homes;
 for(let n=0;n<homes;n++){
  const u=-len/2+span*(n+.5),door=u+span*.32,bay=u-span*.13,bw=span*.54;
  box(wall,bay,height*.49,.35,bw,height*.98,.7);
  for(let floor=0;floor<5;floor++){
   const yy=2.65+floor*3.08;
   for(const du of [-bw*.29,bw*.29]){box(M.trim,bay+du,yy,.76,bw*.45,2.23,.18);box(M.glass,bay+du,yy,.866,bw*.36,2.04,.035);box(M.trim,bay+du,yy,.90,.05,2.08,.025);box(M.trim,bay+du,yy-.08,.90,bw*.38,.055,.026)}
   if(floor>0){box(M.trim,door,yy,.07,span*.22,2.20,.16);box(M.glass,door,yy,.165,span*.16,1.99,.035);box(M.trim,door,yy,.195,.04,2,.025)}
   box(M.trim,u,yy+1.32,.32,span-.05,.19,1.04);
  }
  // Mansard-like dark attic and pale dormer frames.
  box(M.dark,u,height+.85,-.8,span-.05,1.7,2.6);box(M.trim,bay,height+.65,.55,1.23,1.45,.3);box(M.glass,bay,height+.65,.73,.86,1.18,.05);box(M.trim,u,height+.02,.2,span,.25,1.3);
  box(M.door,door,2.62,.15,1.13,2.12,.12);box(M.trim,door,3.82,.2,1.4,.18,.30);box(M.glass,door,3.62,.23,1.06,.3,.03);
  const stepDepth=.30,steps=8,front=2.85;
  for(let j=0;j<steps;j++)box(M.stone,door,(j+1)*.105,front-j*stepDepth,1.4,(j+1)*.21,stepDepth+.015);
  box(M.stone,door,.84,.48,1.4,1.68,.66);
  for(const side of [-1,1]){for(let j=0;j<steps;j+=2)box(M.dark,door+side*.70,(j+1)*.21+.45,front-j*stepDepth,.035,.9,.035);
   const p=pt(door+side*.7,1.80),rail=new T.Mesh(new T.BoxGeometry(.045,.045,2.73),M.dark);rail.rotation.set(Math.atan(.7),angle,0);rail.position.set(p.x,1.86,p.z);tile.group.add(rail);}
  const depth=Math.min(2.15,Math.max(1.3,face.road.distance-9)),wellU=bay,wellV=.8+depth/2,wellW=bw+.2;
  const wp=pt(wellU,wellV),key=seed+':'+n;
  if(!keys.has(key)&&uniforms&&wells.length<96){keys.add(key);const i=wells.length;wells.push(key);uniforms.rects.value[i].set(wp.x,wp.z,wellW/2,depth/2);uniforms.frames.value[i].set(c,s);uniforms.count.value=wells.length;}
  // Actual recessed floor, retaining walls and basement sash below the pavement.
  box(M.well,wellU,-.98,wellV,wellW,.10,depth);box(M.stone,wellU,-.47,.8+depth,wellW,.98,.12);
  for(const side of [-1,1])box(M.stone,wellU+side*wellW/2,-.46,wellV,.10,1.0,depth);
  box(M.trim,bay,-.35,.77,bw*.85,1.08,.12);box(M.glass,bay,-.35,.85,bw*.75,.91,.045);box(M.trim,bay,-.35,.89,.05,.95,.025);
  for(let j=0;j<=Math.ceil(wellW/.22);j++){const uu=wellU-wellW/2+j*wellW/Math.ceil(wellW/.22);box(M.dark,uu,.52,.8+depth,.032,1.10,.032)}
  for(const yy of [.18,.99]){box(M.dark,wellU,yy,.8+depth,wellW,.042,.042);for(const side of [-1,1])box(M.dark,wellU+side*wellW/2,yy,wellV,.042,.042,depth)}
  for(const side of [-1,1])for(let j=0;j<8;j++)box(M.dark,wellU+side*wellW/2,.52,.8+j*depth/7,.032,1.10,.032);
  // First-floor balcony rail repeats the terrace rhythm.
  box(M.stone,bay,4.24,.92,bw+.25,.16,1.2);for(let j=0;j<12;j++)box(M.dark,bay-bw/2+j*bw/11,4.79,1.46,.03,.98,.03);box(M.dark,bay,5.27,1.46,bw,.045,.045);
 }
 (tile.group.userData.eversfieldTerraces??=[]).push({seed,height:height+1.7,homes,x,z,lightwells:homes});return true;
}
