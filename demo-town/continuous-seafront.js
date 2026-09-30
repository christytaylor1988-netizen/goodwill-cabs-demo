import {addLondonRoadClock} from "./london-road-clock.js?v=clock-sightline-final-20260928";
import {seafrontRailingMaterial} from "./seafront-railing.js";
import {createEversfield} from "./eversfield-promenade.js?v=collision-20260929";
// One joined visual cross-section along the filming coast. Never alters terrainHeight or road meshes.
export function buildContinuousSeafront(THREE,api){
 const {scene,shared,registerBarrier,data,convertPosition,terrainHeight,roadWidthForType,beachMaterial,waterMaterial,pavementMaterial,roadMaterial,legacyMaterials}=api;
 const names=new Set(['Marina','Grand Parade','Eversfield Place','Verulam Place','White Rock','Carlisle Parade','Denmark Place','Pelham Place','Marine Parade','East Parade','Rock-a-Nore Road']);
 const segments=[];for(const r of data.roads){if(!names.has(r.tags?.name))continue;const ps=r.geometry.map(p=>convertPosition(p.lat,p.lon));for(let i=1;i<ps.length;i++){let a=ps[i-1],b=ps[i];if(a.x>b.x)[a,b]=[b,a];if(b.x-a.x>.2)segments.push({a,b,width:roadWidthForType(r.tags.highway),name:r.tags.name})}}
 const minX=Math.min(...segments.map(s=>s.a.x)),maxX=Math.max(...segments.map(s=>s.b.x));
 function roadAt(x){let best=null;for(const s of segments){if(x<s.a.x||x>s.b.x)continue;const t=(x-s.a.x)/(s.b.x-s.a.x),z=s.a.z+(s.b.z-s.a.z)*t;if(!best||z>best.z)best={z,width:s.width,name:s.name,slope:(s.b.z-s.a.z)/(s.b.x-s.a.x)}}if(best)return best;
  let left=null,right=null;for(const s of segments){if(s.b.x<=x&&(!left||s.b.x>left.b.x))left=s;if(s.a.x>=x&&(!right||s.a.x<right.a.x))right=s}if(!left||!right)return null;const t=(x-left.b.x)/(right.a.x-left.b.x);return {z:left.b.z+(right.a.z-left.b.z)*t,width:Math.max(left.width,right.width),name:left.name,slope:(right.a.z-left.b.z)/(right.a.x-left.b.x)};
 }
 const count=Math.ceil((maxX-minX)/3),rows=[];
 for(let i=0;i<=count;i++){const x=minX+(maxX-minX)*i/count,r=roadAt(x),edge=r.z+(r.width/2+1.4)*Math.sqrt(1+r.slope*r.slope),east=THREE.MathUtils.smoothstep(x,convertPosition(50.85,.590).x,convertPosition(50.85,.593).x);
  const town=THREE.MathUtils.smoothstep(x,convertPosition(50.85,.581).x,convertPosition(50.85,.584).x);
  const promenade=11+town*65,beach=85+east*20,y=terrainHeight(x,edge)+.025;rows.push({x,road:r.z,edge,prom:edge+promenade,sea:edge+promenade+beach,y});}
 // Avoid sudden width/height steps where separately mapped road ways meet.
 for(let pass=0;pass<3;pass++){const copy=rows.map(r=>({...r}));for(let i=1;i<rows.length-1;i++){for(const k of ['prom','sea'])rows[i][k]=(copy[i-1][k]+2*copy[i][k]+copy[i+1][k])/4;}}
 const clone=m=>{const c=shared(m.clone());c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;c.depthTest=true;c.depthWrite=true;c.side=THREE.DoubleSide;return c};
 const shingle=clone(beachMaterial),water=clone(waterMaterial),paving=clone(pavementMaterial);paving.color.setHex(0xc59b92);
 const wall=shared(new THREE.MeshStandardMaterial({color:0x8b8c80,roughness:1,side:THREE.DoubleSide}));
 const group=new THREE.Group();group.name='Continuous filming seafront';scene.add(group);
 function strip(material,cross,uvScale){const verts=[],uv=[];for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];for(let j=1;j<cross.length;j++){const aa=cross[j-1](a),ab=cross[j](a),ba=cross[j-1](b),bb=cross[j](b);for(const p of [aa,bb,ba,aa,ab,bb]){verts.push(...p);uv.push(p[0]/uvScale,p[2]/uvScale)}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);mesh.receiveShadow=true;group.add(mesh);return mesh;}
 // Shared exact vertices: kerb edge → promenade → short retaining face → sloped shingle → sea.
 const eversfield=createEversfield(THREE,{shared,registerBarrier,convertPosition,terrainHeight,paving});
 const promenadeTop=r=>eversfield.height(r,r.prom,Math.max(.8,terrainHeight(r.x,r.prom)-.425));
 const pavingCross=[0,1,2.2,2.21,3,4,5,6,7,8,9,10,11,12,13,14].map(i=>r=>{const d=i<=2.21?i:2.21+(r.prom-r.edge-2.21)*(i-2.21)/(14-2.21),z=r.edge+d;return [r.x,eversfield.height(r,z,Math.max(.8,terrainHeight(r.x,z)+.025-.45*THREE.MathUtils.smoothstep(d,0,4))),z]});
 strip(paving,pavingCross,4);
 strip(wall,[r=>[r.x,promenadeTop(r),r.prom],r=>[r.x,promenadeTop(r)-.65,r.prom]],4);
 strip(shingle,[r=>[r.x,promenadeTop(r)-.65,r.prom],r=>[r.x,(promenadeTop(r)-.65)*.55-.0675,(r.prom+r.sea)/2],r=>[r.x,-.15,r.sea]],9);
 strip(water,[r=>[r.x,-.15,r.sea],r=>[r.x,-.15,8000]],20);
 eversfield.decorate(rows,group);
 // Pier approach: match its mapped landward edge and its existing level deck.
 let pierLimits=null;
 const pier=data.piers.find(p=>p.tags?.name==='Hastings Pier');
 if(pier){
  const ring=pier.geometry.map(p=>convertPosition(p.lat,p.lon)),xs=ring.map(p=>p.x),zs=ring.map(p=>p.z),z0=Math.min(...zs);
  const deckY=terrainHeight((Math.min(...xs)+Math.max(...xs))/2,z0)+.08;
  const front=[];for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i];if(b.x>a.x&&Math.abs(b.x-a.x)>Math.abs(b.z-a.z)&&(a.z+b.z)/2<z0+35)front.push({a,b})}
  const at=x=>{const f=THREE.MathUtils.clamp((x-minX)/(maxX-minX)*count,0,count),i=Math.min(count-1,Math.floor(f)),t=f-i,a=rows[i],b=rows[i+1];return {x,edge:THREE.MathUtils.lerp(a.edge,b.edge,t),prom:THREE.MathUtils.lerp(a.prom,b.prom,t)}};
  const pos=[],uv=[];const vertex=p=>{pos.push(...p);uv.push(p[0]/4,p[2]/4)};
  for(const {a,b} of front){const steps=Math.ceil((b.x-a.x)/2);for(let i=0;i<steps;i++){
   const section=t=>{const x=THREE.MathUtils.lerp(a.x,b.x,t),z=THREE.MathUtils.lerp(a.z,b.z,t),r=at(x),start=Math.min(r.prom-.3,z-1);return [[x,Math.max(.8,terrainHeight(x,start)-.425)+.025,start],[x,deckY,z+.15]]};
   const u=section(i/steps),v=section((i+1)/steps);[u[0],v[1],v[0],u[0],u[1],v[1]].forEach(vertex);
  }}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();const approach=new THREE.Mesh(geo,paving);approach.name='Pier entrance paved connection';approach.receiveShadow=true;group.add(approach);
  // The existing road boundary stops the taxi here: give it an explicit visible kerb.
  const west=Math.min(...front.map(s=>s.a.x))-45,east=Math.max(...front.map(s=>s.b.x))+45,kerb=[];pierLimits={west,east};
  for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];if(a.x<west||b.x>east)continue;const section=r=>{const y=terrainHeight(r.x,r.edge)+.025;return [[r.x,y,r.edge-.22],[r.x,y+.22,r.edge-.22],[r.x,y+.22,r.edge],[r.x,y,r.edge]]};const u=section(a),v=section(b);for(let k=1;k<u.length;k++)[u[k-1],v[k],v[k-1],u[k-1],u[k],v[k]].forEach(p=>kerb.push(...p))}
  const kg=new THREE.BufferGeometry();kg.setAttribute('position',new THREE.Float32BufferAttribute(kerb,3));kg.computeVertexNormals();const km=new THREE.Mesh(kg,shared(new THREE.MeshStandardMaterial({color:0xd3cdb9,roughness:1,side:THREE.DoubleSide})));km.name='Visible pier roadside kerb';group.add(km);
 }
 // Continuous boundary lookup trims only legacy visual surfaces seaward of the kerb.
 // Float values preserve metre accuracy; manual interpolation works without float linear filtering.
 const values=new Float32Array(rows.length*4);rows.forEach((r,i)=>values.set([r.edge,r.road,r.prom,r.sea],i*4));
 const lookup=shared(new THREE.DataTexture(values,rows.length,1,THREE.RGBAFormat,THREE.FloatType));lookup.needsUpdate=true;lookup.magFilter=lookup.minFilter=THREE.NearestFilter;
 for(const material of new Set([...legacyMaterials,...(pierLimits?[roadMaterial]:[])].filter(Boolean))){const previous=material.onBeforeCompile,oldKey=material.customProgramCacheKey.bind(material);material.onBeforeCompile=s=>{previous?.(s);s.uniforms.filmCoast={value:lookup};s.uniforms.filmBounds={value:new THREE.Vector3(minX,maxX,rows.length)};s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 filmXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nfilmXZ=(modelMatrix*vec4(position,1.)).xz;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 filmXZ;uniform sampler2D filmCoast;uniform vec3 filmBounds;').replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
 if(${material===roadMaterial?`filmXZ.x>=${pierLimits.west.toFixed(5)}&&filmXZ.x<=${pierLimits.east.toFixed(5)}&&`:''}filmXZ.x>=filmBounds.x&&filmXZ.x<=filmBounds.y){float u=(filmXZ.x-filmBounds.x)/(filmBounds.y-filmBounds.x)*(filmBounds.z-1.);float a=floor(u);float e=mix(texture2D(filmCoast,vec2((a+.5)/filmBounds.z,.5)).r,texture2D(filmCoast,vec2((min(a+1.,filmBounds.z-1.)+.5)/filmBounds.z,.5)).r,fract(u));if(filmXZ.y>e+.015)discard;}`)};material.customProgramCacheKey=()=>oldKey()+'-continuous-coast-v1';material.needsUpdate=true;}
 // Sample the same continuous paving used by the visible surface, not the old terrain.
 function promenadeAt(x){if(x<minX||x>maxX)return null;const f=(x-minX)/(maxX-minX)*count,i=Math.min(count-1,Math.floor(f)),t=f-i,a=rows[i],b=rows[i+1],r={x};for(const k of ['edge','prom','sea','y'])r[k]=THREE.MathUtils.lerp(a[k],b[k],t);r.yaw=-Math.atan2(b.prom-a.prom,b.x-a.x);return r;}
 function pavingHeight(x,z){const r=promenadeAt(x);return r?eversfield.height(r,z,Math.max(.8,terrainHeight(x,z)+.025-.45*THREE.MathUtils.smoothstep(z-r.edge,0,4))):terrainHeight(x,z);}
 const railMaterial=seafrontRailingMaterial(THREE,shared),railMatrices=[],dummy=new THREE.Object3D();
 const railBox=(x,y,z,w,h,d,yaw=0,roll=0)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,yaw,roll);dummy.updateMatrix();railMatrices.push(dummy.matrix.clone());};
 for(let i=1;i<rows.length;i++){const a=rows[i-1],b=rows[i];if((a.x>eversfield.west+18&&b.x<eversfield.east-18)||(pierLimits&&b.x>pierLimits.west&&a.x<pierLimits.east))continue;
 registerBarrier({x:a.x,z:a.prom},{x:b.x,z:b.prom},.06);
 const ya=pavingHeight(a.x,a.prom),yb=pavingHeight(b.x,b.prom),dx=b.x-a.x,dz=b.prom-a.prom,len=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
 for(const h of [.52,1.02])railBox((a.x+b.x)/2,(ya+yb)/2+h,(a.prom+b.prom)/2,len,.045,.045,yaw,Math.atan2(yb-ya,len));
 if(i%2===0)railBox(a.x,ya+.56,a.prom,.075,1.12,.075);
 }
 const rails=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),railMaterial,railMatrices.length);railMatrices.forEach((m,i)=>rails.setMatrixAt(i,m));rails.computeBoundingSphere();rails.name='Two thin white promenade perimeter rails';group.add(rails);
 const londonClock=addLondonRoadClock(THREE,{parent:group,shared,convertPosition,promenadeAt,pavingHeight});
 return {group,rows,minX,maxX,pierLimits,promenadeAt,pavingHeight,londonClock};
}
