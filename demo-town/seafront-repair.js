// Scenery-only corrections: saved OSM footprints and fixed, lightweight pier details.
export function createSeafrontRepair(THREE,api){
 const {shared,convertPosition,terrainHeight,featurePolygons,inPolygon,polygonShape,objectBox,cylinder,hipRoof,textSign,batchScenery,roadWidthForType}=api;
 // Small seaward footprints were incorrectly expanded into 2–3 storey houses.
 // Suppress those generic placeholders, not the landward terraces or bespoke landmarks.
 const promenadePlaceholders=[842674369,980637505,980637506,980637507,941902894,1145640898,1018521944,945427888,945427893,1145640877,1145640878,1145640880,289108015,83151715,945427890,945427892,945427894,945427895,1024918531,1024918532,1024918533,59942519];
 let pierPoly=null;const suppressed=new Set(promenadePlaceholders);
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.9}));
 const timber=mat(0x9b9079),cream=mat(0xc9c7b5),roof=mat(0x65716d),iron=mat(0x364744),glass=mat(0x56777c),blue=mat(0x42658a),mint=mat(0x81a89a);
 function prepare(data){pierPoly=featurePolygons(data.piers.find(p=>p.tags?.name==='Hastings Pier'))[0];for(const b of data.buildings){const ps=featurePolygons(b);if(ps.some(p=>{const x=p.outer.reduce((s,v)=>s+v.x,0)/p.outer.length,z=p.outer.reduce((s,v)=>s+v.y,0)/p.outer.length;return pierPoly&&inPolygon(x,z,pierPoly)}))suppressed.add(b.id);
  if(b.tags?.amenity==='shelter'&&ps.some(p=>p.outer.some(v=>{const lon=.57+v.x/(111320*Math.cos(50.87*Math.PI/180)),lat=50.87-v.y/111320;return lon>.548&&lon<.59&&lat<50.8548})))suppressed.add(b.id);
 }}
 function correct(poly,id){if(id!==676246795&&id!==1066488817)return poly;const cx=poly.outer.reduce((s,p)=>s+p.x,0)/poly.outer.length,cz=poly.outer.reduce((s,p)=>s+p.y,0)/poly.outer.length,scale=id===676246795?.82:.92,shift=id===676246795?-6:-2;return {outer:poly.outer.map(p=>new THREE.Vector2(cx+(p.x-cx)*scale,cz+(p.y-cz)*scale+shift)),holes:[]}}
 function buildPier(scene){
  if(!pierPoly)return;const xs=pierPoly.outer.map(p=>p.x),zs=pierPoly.outer.map(p=>p.y),x=(Math.min(...xs)+Math.max(...xs))/2,z0=Math.min(...zs),z1=Math.max(...zs),width=Math.max(...xs)-Math.min(...xs),y=terrainHeight(x,z0)+.08;
  const occupied=[];
  function fit(cx,cz,w,d){let best=null;for(let dz=-40;dz<=60;dz+=2)for(let dx=-65;dx<=65;dx+=2){const px=cx+dx,pz=cz+dz;if(![-.5,0,.5].every(u=>[-.5,0,.5].every(v=>inPolygon(px+u*(w+1),pz+v*(d+1),pierPoly))))continue;if(occupied.some(o=>Math.abs(o.x-px)<(o.w+w)/2+1&&Math.abs(o.z-pz)<(o.d+d)/2+1))continue;const score=dx*dx+dz*dz;if(!best||score<best.score)best={x:px,z:pz,w,d,score}}if(best)occupied.push(best);return best}
  const g=new THREE.Group();g.name='Hastings Pier · open deck and low pavilions';
  timber.side=THREE.DoubleSide;
  const geo=new THREE.ShapeGeometry(polygonShape(pierPoly));geo.rotateX(Math.PI/2);const deck=new THREE.Mesh(geo,timber);deck.position.y=y;deck.receiveShadow=true;g.add(deck);
  // Deck edge follows the mapped footprint, including the pier's angled sides.
  const ring=pierPoly.outer;for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1],len=a.distanceTo(b);if(len<.1)continue;if(b.x>a.x&&Math.abs(b.x-a.x)>Math.abs(b.y-a.y)&&(a.y+b.y)/2<z0+35)continue;const mx=(a.x+b.x)/2,mz=(a.y+b.y)/2,angle=Math.atan2(b.x-a.x,b.y-a.y);
   for(const h of [.3,1.1])objectBox(g,.065,.065,len,mx,y+h,mz,iron,angle);
   for(let d=0;d<len;d+=3){const px=a.x+(b.x-a.x)*d/len,pz=a.y+(b.y-a.y)*d/len;cylinder(g,.04,1.2,px,y+.6,pz,iron,5);if(d%12<3)cylinder(g,.18,y+1,px,(y-1)/2,pz,iron,6)}
  }
  // Long low entrance pavilion and two shallow domed ends, matching the reference's silhouette.
  const pavilionW=Math.min(34,width*.52),pavilion=fit(x,z0+26,pavilionW+2,14),px=pavilion.x,pz=pavilion.z;
  objectBox(g,pavilionW,3.4,11,px,y+1.7,pz,cream);hipRoof(g,pavilionW+1,12,px,y+3.4,pz,roof);
  for(const side of [-1,1]){const tx=px+side*(pavilionW/2-3);cylinder(g,3.2,1,tx,y+3.7,pz,cream,12);const dome=new THREE.Mesh(new THREE.SphereGeometry(3.25,12,5,0,Math.PI*2,0,Math.PI/2),roof);dome.scale.y=.55;dome.position.set(tx,y+4.2,pz);g.add(dome);cylinder(g,.045,1.2,tx,y+6,pz,iron,5)}
  for(let u=-pavilionW/2+2;u<pavilionW/2;u+=3.2)objectBox(g,2.4,2.1,.08,px+u,y+1.75,pz-5.55,glass);
  for(const [u,v,c] of [[-22,12,blue],[0,12,mint],[22,12,cream]]){const p=fit(x+u,z0+v,6,5);if(!p)continue;objectBox(g,5,2.4,4,p.x,y+1.2,p.z,c);hipRoof(g,5.3,4.3,p.x,y+2.4,p.z,roof);objectBox(g,3,.95,.08,p.x,y+1.45,p.z-2.05,glass)}
  // One low timber visitor pavilion; most of the deck remains open.
  const visitor=fit(x,z0+95,19,18);if(visitor){objectBox(g,18,3.5,17,visitor.x,y+1.75,visitor.z,timber);objectBox(g,18.6,.2,17.6,visitor.x,y+3.6,visitor.z,roof);}
  textSign(g,'HASTINGS PIER',19,1.1,x,y+3.2,z0+3,'#d5d2bd','#354542',Math.PI);
  batchScenery({group:g});scene.add(g);return g;
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
