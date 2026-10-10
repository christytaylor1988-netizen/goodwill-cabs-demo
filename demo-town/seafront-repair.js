// Scenery-only corrections: saved OSM footprints and fixed, lightweight pier details.
export function createSeafrontRepair(THREE,api){
 const {shared,convertPosition,terrainHeight,featurePolygons,inPolygon,polygonShape,objectBox,cylinder,hipRoof,textSign,batchScenery,roadWidthForType}=api;
 // Small seaward footprints were incorrectly expanded into 2–3 storey houses.
 // Suppress those generic placeholders, not the landward terraces or bespoke landmarks.
 const promenadePlaceholders=[842674369,980637505,980637506,980637507,941902894,1145640898,1018521944,945427888,945427893,1145640877,1145640878,1145640880,289108015,83151715,945427890,945427892,945427894,945427895,1024918531,1024918532,1024918533,59942519];
 // Remaining generic house models on the promenade and West Marina Gardens.
 const strayCoastalHouses=[314990610,423799478,1145640899,601152318,738479681,1116976493,1482225656,1482225657,1482225658];
 let pierPoly=null;const suppressed=new Set([...promenadePlaceholders,...strayCoastalHouses]);
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.9}));
 const timber=mat(0x9b9079),cream=mat(0xc9c7b5),roof=mat(0x65716d),iron=mat(0x364744),glass=mat(0x56777c),blue=mat(0x42658a),mint=mat(0x81a89a);
 function prepare(data){pierPoly=featurePolygons(data.piers.find(p=>p.tags?.name==='Hastings Pier'))[0];for(const b of data.buildings){const ps=featurePolygons(b);if(ps.some(p=>{const x=p.outer.reduce((s,v)=>s+v.x,0)/p.outer.length,z=p.outer.reduce((s,v)=>s+v.y,0)/p.outer.length;return pierPoly&&inPolygon(x,z,pierPoly)}))suppressed.add(b.id);
  if(b.tags?.amenity==='shelter'&&ps.some(p=>p.outer.some(v=>{const lon=.57+v.x/(111320*Math.cos(50.87*Math.PI/180)),lat=50.87-v.y/111320;return lon>.548&&lon<.59&&lat<50.8548})))suppressed.add(b.id);
 }}
 function correct(poly,id){if(id!==676246795&&id!==1066488817)return poly;const cx=poly.outer.reduce((s,p)=>s+p.x,0)/poly.outer.length,cz=poly.outer.reduce((s,p)=>s+p.y,0)/poly.outer.length,scale=id===676246795?.82:.92,shift=id===676246795?-6:-2;return {outer:poly.outer.map(p=>new THREE.Vector2(cx+(p.x-cx)*scale,cz+(p.y-cz)*scale+shift)),holes:[]}}
 function buildPier(scene){
  if(!pierPoly)return;
  // Local u points towards Old Town (east); v follows the actual pier out to sea.
  const origin=convertPosition(50.85324,.57210),tip=convertPosition(50.85093,.57304);
  const axis=new THREE.Vector2(tip.x-origin.x,tip.z-origin.z).normalize(),right=new THREE.Vector2(axis.y,-axis.x);
  const angle=Math.atan2(axis.x,axis.y),y=terrainHeight(origin.x,origin.z)+.08;
  const local=p=>{const dx=p.x-origin.x,dz=p.y-origin.z;return {u:dx*right.x+dz*right.y,v:dx*axis.x+dz*axis.y}};
  const ring=pierPoly.outer.map(local),length=Math.max(...ring.map(p=>p.v));
  const g=new THREE.Group();g.name='Hastings Pier · domes, striped huts and iron trestles';
  const rust=mat(0x704932),rustDark=mat(0x483b32),steel=mat(0x798784),white=mat(0xe4e2d1),cladding=mat(0xa4a092),shadow=mat(0x394e51);
  const hutColours=[0xe7cc68,0xc77089,0x1685b8,0x9984b3,0x9aad6a,0xe5ad35,0x2b9a9b].map(mat);
  const world=(u,h,v)=>new THREE.Vector3(origin.x+right.x*u+axis.x*v,y+h,origin.z+right.y*u+axis.y*v);
  function box(u,h,v,w,t,d,m,a=0){const p=world(u,h,v);objectBox(g,w,t,d,p.x,p.y,p.z,m,angle+a)}
  function rod(u,h,v,r,t,m){const p=world(u,h,v);cylinder(g,r,t,p.x,p.y,p.z,m,8)}
  function beam(a,b,thick,m){const p=world(...a),q=world(...b),delta=q.clone().sub(p),mesh=new THREE.Mesh(new THREE.BoxGeometry(thick,delta.length(),thick),m);mesh.position.copy(p.add(q).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());g.add(mesh)}
  function canopy(u,h,v,w,d,rise,m){const geo=new THREE.ConeGeometry(1,1,4);geo.rotateY(Math.PI/4);geo.scale(w/Math.SQRT2,rise,d/Math.SQRT2);geo.rotateY(angle);const mesh=new THREE.Mesh(geo,m);mesh.position.copy(world(u,h+rise/2,v));g.add(mesh)}
  function span(v){const hits=[];for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1];if((a.v<=v&&b.v>v)||(b.v<=v&&a.v>v))hits.push(a.u+(b.u-a.u)*(v-a.v)/(b.v-a.v));}return hits.length>=2?[Math.min(...hits),Math.max(...hits)]:null}
  timber.side=THREE.DoubleSide;const geo=new THREE.ShapeGeometry(polygonShape(pierPoly));geo.rotateX(Math.PI/2);const deck=new THREE.Mesh(geo,timber);deck.position.y=y;deck.receiveShadow=true;g.add(deck);
  // Thin deck boards; the structural depth belongs beneath the deck, not above it.
  for(let v=2;v<length;v+=1.8){const s=span(v);if(s)box((s[0]+s[1])/2,.014,v,s[1]-s[0],.018,.025,rustDark)}
  for(let i=0;i<ring.length-1;i++){
   const a=ring[i],b=ring[i+1],len=Math.hypot(b.u-a.u,b.v-a.v);if(len<.2||Math.max(a.v,b.v)<3)continue;
   beam([a.u,-.35,a.v],[b.u,-.35,b.v],.48,steel);
   for(const h of [.15,1.13])beam([a.u,h,a.v],[b.u,h,b.v],.065,steel);
   for(let d=0;d<len;d+=.7){const t=d/len;rod(a.u+(b.u-a.u)*t,.6,a.v+(b.v-a.v)*t,.024,1.15,steel)}
  }
  // Repeated rusted piles, collars, cross girders and diagonal bracing along both sides.
  for(let v=8;v<length-4;v+=9){const s=span(v),n=span(v+9);if(!s)continue;const low=-Math.max(5,y+1.2);
   beam([s[0]+.6,-.7,v],[s[1]-.6,-.7,v],.32,rust);
   for(const u of [s[0]+.7,(s[0]+s[1])/2,s[1]-.7]){rod(u,low/2-.4,v,.21,-low-.8,rustDark);for(const h of [-1.1,-3.1])rod(u,h,v,.33,.22,rust);}
   if(n)for(const side of [0,1]){const u=s[side]+(side?-.7:.7),q=n[side]+(side?-.7:.7);beam([u,-.8,v],[q,-.8,v+9],.24,rust);beam([u,-3.5,v],[q,-3.5,v+9],.17,rust);beam([u,-.9,v],[q,-3.5,v+9],.12,rustDark);beam([u,-3.5,v],[q,-.9,v+9],.12,rustDark);beam([u,-3.5,v],[q,low+1,v+9],.10,rust);beam([u,low+1,v],[q,-3.5,v+9],.10,rust);
    // Small triangular deck brackets read clearly from the beach.
    beam([u,-.35,v],[q,-1.45,v+4.5],.16,steel);beam([q,-1.45,v+4.5],[q,-.35,v+9],.16,steel);
   }
  }
  // Low cream entrance pavilion, with domes in depth as in the road-facing reference.
  box(3,1.5,15,20,3,11,cream);canopy(3,3,15,21,12,.65,roof);
  for(const [u,v,r,h] of [[5,13,3.6,4.0],[-3,21,2.45,3.9]]){
   rod(u,h-.35,v,r,.95,cream);rod(u,h+.12,v,r+ .18,.18,roof);
   const p=world(u,h+.18,v),dome=new THREE.Mesh(new THREE.SphereGeometry(r+.12,16,6,0,Math.PI*2,0,Math.PI/2),roof);dome.scale.y=.58;dome.position.copy(p);g.add(dome);
   for(let k=0;k<12;k++){const a=k*Math.PI/6;let prev=null;for(let j=0;j<=5;j++){const t=j*Math.PI/10,rr=(r+.15)*Math.sin(t),pt=[u+Math.cos(a)*rr,h+.18+(r+.15)*.58*Math.cos(t),v+Math.sin(a)*rr];if(prev)beam(prev,pt,.035,steel);prev=pt;}}
   rod(u,h+r*.58+1,v,.035,1.6,iron);
  }
  for(let u=-5;u<=11;u+=3.2){box(u,1.6,9.46,1.7,1.8,.08,shadow);box(u,1.6,9.40,.05,1.8,.06,white);}
  // Entrance fencing and open gateway: all geometry stays on the pier apron.
  const front=span(3);if(front)for(let u=front[0]+1;u<front[1]-1;u+=.32){if(u>-15&&u<-8)continue;rod(u,1,3,.035,2,iron)}
  if(front)for(const [a,b] of [[front[0]+1,-15],[-8,front[1]-1]])if(b>a)beam([a,1.65,3],[b,1.65,3],.07,iron);
  for(const u of [-16,-7,17]){rod(u,2,4,.09,4,iron);box(u,4.1,4,.45,.55,.45,cream);canopy(u,4.4,4,.65,.65,.22,iron)}
  // Compact striped gabled huts, outward-facing on each side of the pier.
  function hut(u,v,c,side){
   const w=4.5,d=4.5,h=2.7;box(u,h/2,v,w,h,d,c);
   for(let j=0;j<5;j++){const hh=.24+j*.51;box(u,hh,v,w+.025,.19,d+.025,white)}
   // Ridge runs across the pier, giving the east/west elevations their gable silhouettes.
   const verts=[];const A=[u-w/2,h,v-d/2],B=[u+w/2,h,v-d/2],C=[u+w/2,h,v+d/2],D=[u-w/2,h,v+d/2],E=[u-w/2,h+1.05,v],F=[u+w/2,h+1.05,v];
   for(const t of [[A,B,F],[A,F,E],[D,E,F],[D,F,C],[A,E,D],[B,C,F]])for(const q of t)verts.push(...world(...q).toArray());const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));rg.computeVertexNormals();g.add(new THREE.Mesh(rg,roof));
   for(const e of [[u+side*(w/2+.04),h,v-d/2],[u+side*(w/2+.04),h,v+d/2]])beam(e,[u+side*(w/2+.04),h+1.05,v],.12,white);
   box(u+side*(w/2+.04),1.1,v,.05,1.9,1.2,c);
  }
  for(const side of [-1,1])for(let i=0;i<7;i++){const v=36+i*5.35,s=span(v);if(s)hut(s[side===1?1:0]-side*4,v,hutColours[(i+(side===1?1:0))%hutColours.length],side)}
  // Weathered timber visitor centre, roof terrace and broad stepped seating.
  const v=104,s=span(v),centre=s?(s[0]+s[1])/2:0;
  box(centre,2.7,v,23,5.4,24,cladding);box(centre,5.5,v,23.6,.22,24.6,timber);
  for(const side of [-1,1])for(let k=0;k<24;k++){const zz=v-11.5+k;box(centre+side*11.53,2.7,zz,.12,5.2,.18,k%2?cream:timber);}
  for(const side of [-1,1])for(let k=0;k<12;k++)for(let j=0;j<5;j++){const zz=v-12+k*2,h=.3+j;beam([centre+side*11.61,h,zz],[centre+side*11.61,h+.5,zz+1],.07,timber);beam([centre+side*11.61,h+.5,zz+1],[centre+side*11.61,h,zz+2],.07,timber);}
  for(const side of [-1,1])for(const zz of [v-8,v,v+8])box(centre+side*11.64,2.5,zz,.08,3,1.25,shadow);
  for(let j=0;j<16;j++){const h=5.5*(j+1)/16;box(centre,h/2,v-24+j*.72,20,h,.73,roof);box(centre+9.4,h+.02,v-24+j*.72,.6,.03,.12,hutColours[5]);}
  for(const side of [-1,1]){beam([centre+side*11.5,6.55,v-12],[centre+side*11.5,6.55,v+12],.055,steel);for(let zz=v-12;zz<=v+12;zz+=3)rod(centre+side*11.5,6,zz,.035,1.1,steel);}
  box(centre,6.3,v+5,10,1.5,6,shadow);box(centre,7.13,v+5,12,.22,7,cladding);
  for(let i=0;i<4;i++){const u=centre-4.5+i*3;rod(u,10,v+5,.035,6,steel);box(u+.65,12.4,v+5,1.3,.8,.025,blue);box(u+.65,12.4,v+4.98,1.3,.12,.026,white);box(u+.65,12.4,v+4.96,.12,.8,.026,hutColours[1]);}
  // Merge static geometry by material: detailed silhouette without per-part draw calls.
  batchScenery({group:g});g.userData.pierViews={origin:{x:origin.x,z:origin.z},axis:{x:axis.x,z:axis.y},deckY:y,length};scene.add(g);return g;
 }
 function maskGround(data,ocean,materials){
  // A world-space land-use mask removes base terrain from beach/sea instead of
  // allowing coarse elevation triangles to poke through them. Roads are untouched.
  const lo=convertPosition(50.859,.53),hi=convertPosition(50.845,.61),minX=lo.x,minZ=lo.z,w=hi.x-lo.x,h=hi.z-lo.z;
  const c=document.createElement('canvas');c.width=2048;c.height=768;const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,c.width,c.height);
  const xy=(x,z)=>[(x-minX)/w*c.width,(z-minZ)/h*c.height];
  function polygon(poly,colour){ctx.beginPath();for(const ring of [poly.outer,...poly.holes]){ring.forEach((p,i)=>{const q=xy(p.x,p.y);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.closePath()}ctx.fillStyle=colour;ctx.fill('evenodd')}
  const roads=new Set(['Marina','Grand Parade','Eversfield Place','White Rock','Carlisle Parade','Denmark Place','Pelham Place','East Parade']);
  for(const r of data.roads){if(!roads.has(r.tags?.name))continue;const ps=r.geometry.map(p=>convertPosition(p.lat,p.lon));for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(!len)continue;let nx=-dz/len,nz=dx/len;if(nz<0){nx=-nx;nz=-nz}const inner=roadWidthForType(r.tags.highway)/2,outer=inner+27;polygon({outer:[new THREE.Vector2(a.x-nx*inner,a.z-nz*inner),new THREE.Vector2(b.x-nx*inner,b.z-nz*inner),new THREE.Vector2(b.x-nx*(inner+4),b.z-nz*(inner+4)),new THREE.Vector2(a.x-nx*(inner+4),a.z-nz*(inner+4))],holes:[]},'#00ff00');polygon({outer:[new THREE.Vector2(a.x+nx*inner,a.z+nz*inner),new THREE.Vector2(b.x+nx*inner,b.z+nz*inner),new THREE.Vector2(b.x+nx*outer,b.z+nz*outer),new THREE.Vector2(a.x+nx*outer,a.z+nz*outer)],holes:[]},'#00ff00')}}
  for(const p of ocean)polygon(p,'#0000ff');for(const f of data.land)if(f.tags?.natural==='beach')for(const p of featurePolygons(f))polygon(p,'#ff0000');
  const tex=shared(new THREE.CanvasTexture(c));tex.flipY=false;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=false;
  for(const material of materials){const previous=material.onBeforeCompile;material.onBeforeCompile=s=>{previous?.(s);s.uniforms.coastalMask={value:tex};s.uniforms.coastalBounds={value:new THREE.Vector4(minX,minZ,w,h)};s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 shoreXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nshoreXZ=(modelMatrix*vec4(position,1.0)).xz;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 shoreXZ;uniform sampler2D coastalMask;uniform vec4 coastalBounds;').replace('#include <color_fragment>',`#include <color_fragment>
 vec2 shoreUV=(shoreXZ-coastalBounds.xy)/coastalBounds.zw;
 if(all(greaterThanEqual(shoreUV,vec2(0)))&&all(lessThanEqual(shoreUV,vec2(1)))){vec3 landUse=texture2D(coastalMask,shoreUV).rgb;if(landUse.r>.2||landUse.b>.2)discard;if(landUse.g>.2)diffuseColor.rgb=vec3(.29,.30,.285);}`)};material.customProgramCacheKey=()=> 'seafront-land-mask-v1';material.needsUpdate=true}
 }
 return {prepare,correct,buildPier,maskGround,suppressed,get pierPoly(){return pierPoly}};
}
