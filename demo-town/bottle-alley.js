// Local driving surface only; vehicle integration and road graph are unchanged.
export function createBottleAlley(THREE,{parent,rows,convertPosition,terrainHeight,shared}){
 const west=convertPosition(50.85,.5623).x-24,east=convertPosition(50.85,.5718).x+24,half=5.6,ramp=120,apron=24;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10)};
 function coast(x){const f=(x-rows[0].x)/(rows.at(-1).x-rows[0].x)*(rows.length-1),i=Math.max(0,Math.min(rows.length-2,Math.floor(f))),t=f-i,a=rows[i],b=rows[i+1];return {edge:a.edge+(b.edge-a.edge)*t,baseY:a.y+(b.y-a.y)*t,road:a.road+(b.road-a.road)*t,prom:a.prom+(b.prom-a.prom)*t,upper:(a.y+1.05-.025*(a.prom-a.edge-2.21))*(1-t)+(b.y+1.05-.025*(b.prom-b.edge-2.21))*t};}
 const count=Math.ceil((east-west)/1.5),points=[];
 // One horizontal level for the entire covered section, independent of DEM hills.
 const streetRef=convertPosition(50.8518623,.5623927);
 const streetLevel=terrainHeight(streetRef.x,streetRef.z)+.025;
 const level=streetLevel-3.35;
 // Only the dedicated access routes descend from the shared street datum.
 const pathHeight=()=>streetLevel;
 const entryWest=coast(west+apron),entryEast=coast(east-apron);
 const westY=pathHeight(west+apron,entryWest.edge+4.3+half,entryWest),eastY=pathHeight(east-apron,entryEast.edge+4.3+half,entryEast);
 for(let i=0;i<=count;i++){
  const x=west+(east-west)*i/count,c=coast(x),distance=Math.min(x-west,east-x),descent=x<(west+east)/2?64:ramp-apron,t=Math.max(0,Math.min(1,(distance-apron)/descent)),blend=t*t*(3-2*t),z=c.edge+4.3+half;
  // The taxi turns onto the red path first; descent starts beyond the open apron.
  const start=x<(west+east)/2?westY:eastY,y=distance<=apron?pathHeight(x,z,c):start+(level-start)*blend;
  const opening=x<(west+east)/2?0:1-smooth(Math.max(0,distance-apron)/9),left=(z-half)*(1-opening)+(c.edge-1.4)*opening;
  points.push({x,z,y,left,roadEdge:c.edge-1.4,roadY:terrainHeight(x,c.edge-1.4)});
 }
 function sample(x,z,margin=0){
  if(x<west||x>east)return null;
  const f=(x-west)/(east-west)*count,i=Math.min(count-1,Math.floor(f)),t=f-i,a=points[i],b=points[i+1],centre=a.z+(b.z-a.z)*t,left=a.left+(b.left-a.left)*t,right=centre+half,distance=Math.abs(z-centre);
  if(z<left-margin||z>right+margin)return null;
  const cy=a.y+(b.y-a.y)*t,ry=a.roadY+(b.roadY-a.roadY)*t,roadEdge=a.roadEdge+(b.roadEdge-a.roadEdge)*t;
  const flare=Math.max(0,Math.min(1,(centre-half-left)/Math.max(.01,centre-half-roadEdge)));
  const y=z<centre?cy+(ry-cy)*flare*Math.min(1,(centre-z)/(centre-left)):cy;
  return {x,z:centre,y,distance,edge:Math.max(left-z,z-right),left,right,segment:{a:{x:a.x,y:a.y,z:a.z},b:{x:b.x,y:b.y,z:b.z},type:'residential',roadName:'Bottle Alley'}};
 }
 function opening(x,z,margin=0){return !!sample(x,z,margin);}
 // One surface, with matching render triangles and height interpolation.
 const vertices=[],colours=[],floorUV=[];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];
  const cross=p=>[[p.x,sample(p.x,p.left)?.y??p.y,p.left],[p.x,p.y,p.z],[p.x,p.y,p.z+half]];
  const aa=cross(a),bb=cross(b);
  // Warrior Square stair treads are visual only; sample() remains a smooth ramp.
  // No apron flare towards Grand Parade: access stays wholly on the promenade.
  if(a.x>=west+apron&&b.x<=west+apron+64){
   const treadY=(a.y+b.y)/2;
   for(const row of [aa,bb])for(const v of row)v[1]=treadY;
   const next=points[Math.min(i+1,points.length-1)],nextY=b.x<west+apron+62.5?(b.y+next.y)/2:b.y;
   for(const v of [[b.x,treadY,b.left],[b.x,nextY,b.z+half],[b.x,nextY,b.left],[b.x,treadY,b.left],[b.x,treadY,b.z+half],[b.x,nextY,b.z+half]]){
    vertices.push(...v);floorUV.push((v[0]-west)/2,(v[2]-b.z+half)/1.9);const c=new THREE.Color(0x827d75);colours.push(c.r,c.g,c.b);
   }
  }
  for(let k=0;k<2;k++)for(const p of [aa[k],bb[k+1],bb[k],aa[k],aa[k+1],bb[k+1]]){vertices.push(...p);const at=sample(p[0],p[2],.01);floorUV.push((p[0]-west)/2,(p[2]-(at?.z??p[2])+half)/1.9);const t=smooth((Math.min(p[0]-west,east-p[0])-apron)/12),c=new THREE.Color(0xb77f73).lerp(new THREE.Color(0x928982),t);colours.push(c.r,c.g,c.b);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(floorUV,2));geometry.computeVertexNormals();
 // Small repeating slab atlas: broad tonal variation, narrow joints and mild wear.
 const slabs=document.createElement('canvas');slabs.width=slabs.height=512;
 const sc=slabs.getContext('2d');let slabSeed=803;
 const sr=()=>{slabSeed=(Math.imul(slabSeed,1664525)+1013904223)>>>0;return slabSeed/4294967296;};
 sc.fillStyle='#8d8b85';sc.fillRect(0,0,512,512);
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){
  const v=207+Math.floor(sr()*23);sc.fillStyle=`rgb(${v},${v-2},${v-7})`;sc.fillRect(x*128+1,y*128+1,126,126);
  for(let j=0;j<50;j++){sc.fillStyle=sr()>.5?'#fff6e808':'#504c4607';sc.beginPath();sc.ellipse(x*128+5+sr()*118,y*128+5+sr()*118,2+sr()*7,1+sr()*3,0,0,Math.PI*2);sc.fill();}
 }
 const slabTexture=shared(new THREE.CanvasTexture(slabs));slabTexture.colorSpace=THREE.SRGBColorSpace;slabTexture.wrapS=slabTexture.wrapT=THREE.RepeatWrapping;slabTexture.repeat.set(.25,.25);slabTexture.anisotropy=4;
 const nightGlow={value:0};let stripMaterial;
 // Local surface wash avoids hundreds of dynamic lights and shadow maps.
 function wash(material,wall=false){material.onBeforeCompile=shader=>{
  shader.uniforms.alleyNight=nightGlow;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 alleyLocal;').replace('#include <begin_vertex>',`#include <begin_vertex>
   vec4 alleyP=vec4(transformed,1.);
   #ifdef USE_INSTANCING
   alleyP=instanceMatrix*alleyP;
   #endif
   alleyLocal=(modelMatrix*alleyP).xyz;
   ${wall?'':'alleyLocal.z=uv.y;'}
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 alleyLocal;uniform float alleyNight;').replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float inside=step(${(west+ramp).toFixed(5)},alleyLocal.x)*step(alleyLocal.x,${(east-ramp).toFixed(5)});
   float wash=${wall?`(.14+.60*exp(-abs(alleyLocal.y-${(level+2.85).toFixed(5)})*.72))`:'(.12+.42*exp(-max(0.,alleyLocal.z)*.48))'};
   totalEmissiveRadiance+=diffuseColor.rgb*vec3(.78,.84,1.)*wash*alleyNight*inside;
  `);
 };material.customProgramCacheKey=()=>wall?'bottle-wall-wash':'bottle-floor-wash';}
 const floor=new THREE.Mesh(geometry,shared(new THREE.MeshStandardMaterial({map:slabTexture,vertexColors:true,roughness:.96,side:THREE.DoubleSide})));floor.name='Bottle Alley promenade ramps and level lower floor';floor.receiveShadow=true;wash(floor.material);parent.add(floor);
 const upstandVertices=[];
 const matrices=[[],[],[],[],[],[]],dummy=new THREE.Object3D();
 function box(kind,x,y,z,w,h,d,yaw=0,roll=0){dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(kind===5?Math.PI/4:0,yaw,roll);dummy.updateMatrix();matrices[kind].push(dummy.matrix.clone());}
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];if(a.x<west+apron+9||b.x>east-apron-9)continue;
  const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx),roll=Math.atan2(b.y-a.y,l);
  const covered=a.x>=west+ramp&&b.x<=east-ramp;
  if(covered){
   box(5,(a.x+b.x)/2,level+2.91,(a.z+b.z)/2-half+.18,l-.035,.085,.24,yaw);
   // Continuous structural deck, with a full inland wall and open sea side.
   // The upper promenade builds the sole roof slab from these same points.
   box(4,(a.x+b.x)/2,(a.y+b.y)/2+1.55,(a.z+b.z)/2-half,l+.04,3.10,.28,yaw,roll);
   if(i%4===0)box(3,a.x,a.y+1.53,a.z+half-.04,.36,3.06,.40);
  }
  for(const side of [-1,1]){
   if(covered){
    if(side===1){
     // Low angled concrete infill between columns, below the driver's eye line.
     const cross=p=>[[p.x,p.y,p.z+half-.65],[p.x,p.y+.94,p.z+half-.08],[p.x,p.y+.94,p.z+half+.20],[p.x,p.y-.08,p.z+half+.20]];
     const aa=cross(a),bb=cross(b);for(let k=0;k<3;k++)for(const p of [aa[k],bb[k+1],bb[k],aa[k],aa[k+1],bb[k+1]])upstandVertices.push(...p);
    }
    continue;
   }
   if(side===-1){
    // A continuous retaining face joins the ramp floor to the upper promenade.
    const face=p=>{const c=coast(p.x),z=p.z-half-.13,top=Math.max(p.y+.3,pathHeight(p.x,z,c));return [[p.x,p.y-.2,z],[p.x,top,z]];};
    const aa=face(a),bb=face(b);for(const v of [aa[0],bb[1],bb[0],aa[0],aa[1],bb[1]])upstandVertices.push(...v);
   }
   const z=(a.z+b.z)/2+side*half,y=(a.y+b.y)/2;
   box(0,(a.x+b.x)/2,y+.14,z,l+.025,.28,.23,yaw,roll);
   for(const h of [.63,1.09])box(1,(a.x+b.x)/2,y+h,z,l+.025,.055,.055,yaw,roll);
   if(i%3===0)box(1,a.x,a.y+.64,a.z+side*half,.10,1.28,.10);
  }
 }
 const upstandGeo=new THREE.BufferGeometry();upstandGeo.setAttribute('position',new THREE.Float32BufferAttribute(upstandVertices,3));upstandGeo.computeVertexNormals();
 const upstand=new THREE.Mesh(upstandGeo,shared(new THREE.MeshStandardMaterial({color:0x6f766d,roughness:.96,side:THREE.DoubleSide})));upstand.name='Bottle Alley sloping concrete sea-side upstand';upstand.receiveShadow=true;parent.add(upstand);
 // One reusable texture: irregular embedded fragments in pale rendered panels.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;
 const ctx=canvas.getContext('2d');let seed=1946;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 ctx.fillStyle='#d7d3c4';ctx.fillRect(0,0,512,1024);
 for(let i=0;i<6500;i++){const shade=random()>.5?'#ffffff20':'#514e4018';ctx.fillStyle=shade;ctx.fillRect(random()*512,random()*1024,1+random()*2,1+random()*2);}
 const glass=['#334b40','#4e6651','#283f3d','#564335','#754f38','#536d72','#666050','#405860','#796852'];
 for(let row=0;row<27;row++)for(let col=0;col<13;col++){
  const x=22+col*36+(random()-.5)*12,y=23+row*37+(random()-.5)*13,r=11+random()*9,n=4+Math.floor(random()*3),phase=random()*6.28;
  ctx.beginPath();for(let j=0;j<n;j++){const angle=phase+j/n*Math.PI*2,scale=.6+random()*.5,px=x+Math.cos(angle)*r*scale,py=y+Math.sin(angle)*r*scale*1.3;j?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();
  ctx.fillStyle=glass[Math.floor(random()*glass.length)];ctx.fill();ctx.strokeStyle='#282d2655';ctx.lineWidth=1.2;ctx.stroke();
  // Small dull glint rather than sparkling or luminous glass.
  ctx.beginPath();ctx.moveTo(x-r*.4,y-r*.25);ctx.lineTo(x+r*.15,y-r*.5);ctx.strokeStyle='#dfecda55';ctx.lineWidth=1.4;ctx.stroke();
 }
 ctx.fillStyle='#e3dfd0';ctx.fillRect(0,0,11,1024);ctx.fillRect(501,0,11,1024);ctx.fillRect(0,0,512,10);ctx.fillRect(0,1014,512,10);
 const mosaic=shared(new THREE.CanvasTexture(canvas));mosaic.colorSpace=THREE.SRGBColorSpace;mosaic.anisotropy=4;
 // Reusable aged cream concrete, mapped in world metres to avoid stretched panels.
 const plaster=document.createElement('canvas');plaster.width=plaster.height=512;
 const pc=plaster.getContext('2d');pc.fillStyle='#e4dcc4';pc.fillRect(0,0,512,512);
 let plasterSeed=7281;const pr=()=>{plasterSeed=(Math.imul(plasterSeed,1664525)+1013904223)>>>0;return plasterSeed/4294967296;};
 for(let i=0;i<100;i++){
  const x=pr()*512,y=pr()*512,r=10+pr()*65,g=pc.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,i%3?'#827e6c30':'#faf1d936');g.addColorStop(1,'#827e6c00');pc.fillStyle=g;pc.fillRect(x-r,y-r,r*2,r*2);
 }
 for(let i=0;i<7500;i++){pc.fillStyle=i%2?'#514d4010':'#fff9e714';pc.fillRect(pr()*512,pr()*512,1,1);}
 pc.strokeStyle='#706b5b66';pc.lineWidth=.7;
 for(let i=0;i<13;i++){
  let x=35+pr()*442,y=35+pr()*442,angle=pr()*6.28;pc.beginPath();pc.moveTo(x,y);
  for(let j=0;j<5+pr()*7;j++){angle+=(pr()-.5)*1.2;x+=Math.cos(angle)*(4+pr()*10);y+=Math.sin(angle)*(4+pr()*10);pc.lineTo(x,y);if(j===3){pc.moveTo(x+Math.cos(angle+1)*12,y+Math.sin(angle+1)*12);pc.lineTo(x,y);}}
  pc.stroke();
 }
 const ceilingTexture=shared(new THREE.CanvasTexture(plaster));ceilingTexture.colorSpace=THREE.SRGBColorSpace;ceilingTexture.wrapS=ceilingTexture.wrapT=THREE.RepeatWrapping;ceilingTexture.anisotropy=4;
 for(let k=0;k<matrices.length;k++){
  const m=shared(new THREE.MeshStandardMaterial({color:[0x9d9a8e,0xe5e4d6,0xffffff,0xffffff,0xffffff,0xadb9c7][k],roughness:k===4?.82:.9,...(k===4?{map:mosaic}:{} )}));
  if(k===2){
   m.map=ceilingTexture;m.emissive.setHex(0xe4dcc4);m.emissiveMap=ceilingTexture;m.emissiveIntensity=.11;m.roughness=1;
   m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
    vec4 ceilingP=modelMatrix*instanceMatrix*vec4(position,1.);
    vMapUv=ceilingP.xz/8.;vEmissiveMapUv=vMapUv;
   `);};m.customProgramCacheKey=()=> 'bottle-aged-cream-ceiling';
  }
  if(k===4)wash(m,true);if(k===5){stripMaterial=m;m.emissive.setHex(0xb9cfff);m.emissiveIntensity=0;}
  const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,matrices[k].length);
  matrices[k].forEach((v,i)=>{mesh.setMatrixAt(i,v);if(k===3)mesh.setColorAt(i,new THREE.Color().setHSL(.025+.72*i/Math.max(1,matrices[k].length-1),.88,.43));});
  mesh.name=['Bottle Alley low boundary walls','Bottle Alley white railings','Bottle Alley continuous concrete ceiling','Bottle Alley graduated coloured columns','Bottle Alley embedded bottle-glass inland wall','Bottle Alley angled corner light strip'][k];
  mesh.receiveShadow=true;mesh.computeBoundingSphere();parent.add(mesh);
 }
 // Cut only the corridor out of the pre-existing promenade/beach faces.
 const values=new Float32Array(points.length*4);points.forEach((p,i)=>values.set([p.z,p.y,p.left,p.z+half],i*4));
 const texture=shared(new THREE.DataTexture(values,points.length,1,THREE.RGBAFormat,THREE.FloatType));texture.needsUpdate=true;texture.minFilter=texture.magFilter=THREE.NearestFilter;
 function mask(material){const previous=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=s=>{previous?.(s);s.uniforms.bottleRoute={value:texture};s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 bottleXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nbottleXZ=(modelMatrix*vec4(position,1.)).xz;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 bottleXZ;uniform sampler2D bottleRoute;').replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
 if(bottleXZ.x>=${west.toFixed(6)}&&bottleXZ.x<=${east.toFixed(6)}){float f=(bottleXZ.x-(${west.toFixed(6)}))/${(east-west).toFixed(6)}*${count.toFixed(1)};float i=floor(f);vec4 route=mix(texture2D(bottleRoute,vec2((i+.5)/${points.length.toFixed(1)},.5)),texture2D(bottleRoute,vec2((min(i+1.,${count.toFixed(1)})+.5)/${points.length.toFixed(1)},.5)),fract(f));if(bottleXZ.y>route.b-.015&&bottleXZ.y<route.a+.12)discard;}`);};material.customProgramCacheKey=()=>key()+'-bottle-alley';material.needsUpdate=true;
 }
 function covered(x,z){return x>west+ramp&&x<east-ramp&&!!sample(x,z,.3);}
 function beachTop(x,fallback){if(x<west||x>east)return fallback;const c=coast(x),p=sample(x,c.edge+4.3+half);return p?fallback+(p.y-.12-fallback)*smooth(Math.min(x-west,east-x)/apron):fallback;}
 function setTime(time){nightGlow.value=typeof time==='number'?time:time==='night'?1:0;if(stripMaterial)stripMaterial.emissiveIntensity=nightGlow.value*.9;}
 return {west,east,half,ramp,apron,level,points,ceilingTexture,sample,opening,mask,covered,beachTop,setTime};
}
