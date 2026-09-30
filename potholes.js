// The earlier fictional test set is retained but disabled.
// Report coordinates enter only through the separate local development dataset.
export const fictionalPotholeSites = [
 ['Pelham Place',50.855182,.58562,.48,.62,.065,false],
 ['Pelham Place',50.855190,.58590,.68,.83,.12,false],
 ['Pelham Place',50.855195,.58618,.40,.54,.045,false],
 ['Marine Parade',50.855262,.58740,.57,.76,.085,false],
 ['Marine Parade',50.855278,.58816,.72,.90,.14,false],
 ['East Parade',50.85549,.58917,.6,.8,.10,false],
 ['Rock-a-Nore Road',50.85614,.5930,.5,.7,.07,false],
 ['Rock-a-Nore Road',50.85619,.5947,.7,.8,.12,false],
 ['High Street',50.85695,.59105,.45,.6,.06,false],
 ['Denmark Place',50.85479,.5824,.6,.8,.10,false],
 ['Denmark Place',50.85468,.58125,.5,.65,.08,false],
 ['Carlisle Parade',50.85456,.57995,.7,.9,.12,false],
 ['Carlisle Parade',50.85437,.57785,.5,.6,.07,false],
 ['White Rock',50.85394,.5745,.6,.8,.10,false],
 ['Cambridge Road',50.85555,.5753,.5,.7,.08,false],
 ['Queens Road',50.85683,.58173,.6,.8,.10,false],
 ['Marina',50.85087,.5555,.7,.9,.13,false],
 ['Marina',50.85068,.5488,.5,.7,.07,false]
];

export function createPotholes(THREE,{scene,taxi,body,wheels,chassis,terrainHeight,convertPosition,nearestReportRoad,roadWidthForType,roadSurface,sites=[]}){
 const clamp=THREE.MathUtils.clamp;
 // One deterministic texture atlas, one static mesh, no lights or per-frame texture work.
 let seed=913;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=512;
 const g=canvas.getContext('2d');
 for(let variant=0;variant<3;variant++){
  g.save();g.translate(variant*512,0);
  const ring=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2,r=.88+random()*.12;ring.push([256+Math.cos(a)*102.4*r,256+Math.sin(a)*102.4*r])}
  const shape=(scale=1,dy=0)=>{g.beginPath();ring.forEach(([x,y],i)=>{const px=256+(x-256)*scale,py=256+(y-256)*scale+dy;i?g.lineTo(px,py):g.moveTo(px,py)});g.closePath()};
  // Old rectangular repair, broken edges and feathered aggregate, leaving markings visible outside it.
  g.fillStyle=['#484c4b','#555752','#414747'][variant];
  g.beginPath();g.moveTo(100,109);g.lineTo(378,98);g.lineTo(400,393);g.lineTo(117,403);g.closePath();g.fill();
  for(let i=0;i<2000;i++){let x=95+random()*310,y=96+random()*310;g.fillStyle=random()>.5?'rgba(169,163,139,.15)':'rgba(15,23,24,.20)';g.fillRect(x,y,1+random()*3,1+random()*3)}
  g.strokeStyle='#222d2d';g.lineWidth=2;
  for(let i=0;i<11;i++){let a=random()*Math.PI*2,x=256+Math.cos(a)*98,y=256+Math.sin(a)*98;g.beginPath();g.moveTo(x,y);for(let k=0;k<4;k++){x+=Math.cos(a)*20+(random()-.5)*18;y+=Math.sin(a)*20+(random()-.5)*18;g.lineTo(x,y)}g.stroke()}
  shape(1.12);g.fillStyle='#79776a';g.fill();shape(1.035);g.fillStyle='#202a2b';g.fill();
  shape(.91,8+variant*3);g.fillStyle=['#404440','#303a39','#253334'][variant];g.fill();
  // Shaded inner wall and a ragged pale lower rim sell depth without cutting the road mesh.
  g.save();shape(.96);g.clip();const shade=g.createLinearGradient(0,152,0,349);shade.addColorStop(0,'rgba(0,0,0,.8)');shade.addColorStop(.48,'rgba(0,0,0,.18)');shade.addColorStop(1,'rgba(151,144,114,.22)');g.fillStyle=shade;g.fillRect(140,140,230,230);
  for(let i=0;i<110;i++){g.fillStyle='rgba(130,130,108,.25)';g.fillRect(160+random()*195,160+random()*195,2,2)}g.restore();
  g.restore();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.05,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const positions=[],uvs=[],indices=[],holes=[],pavementDefects=[];
 const rejected=[];
 sites.forEach((site,index)=>{
  if(!site.enabled)return;
  const {name,lat,lon,rx,rz,depth,ref}=site,source=convertPosition(lat,lon),near=nearestReportRoad(source,name);
  if(!near||near.distance>20){rejected.push({ref,reason:'No matching drivable road within 20 m'});return}
  let dx=near.segment.b.x-near.segment.a.x,dz=near.segment.b.z-near.segment.a.z;const len=Math.hypot(dx,dz);dx/=len;dz/=len;if(dx<0){dx=-dx;dz=-dz}
  // Preserve the report's side of the road; clamp only enough to keep the full patch on tarmac.
  const pavement=site.surface==='pavement',halfWidth=roadWidthForType(near.segment.type)/2;
  const limit=Math.max(0,halfWidth-rx*2.5-.15),sourceSide=(source.x-near.point.x)*dz-(source.z-near.point.z)*dx;
  const lateral=pavement?(Math.sign(sourceSide)||1)*(halfWidth+.7):clamp(sourceSide,-limit,limit);
  const h={name,ref,x:near.point.x+dz*lateral,z:near.point.z-dx*lateral,dx,dz,rx,rz,depth,index,surface:site.surface,segment:near.segment,sourceX:source.x,sourceZ:source.z};
  if(pavement){
   // Avoid crossing mouths where another road occupies this nominal pavement strip.
   const baseX=h.x,baseZ=h.z;let valid=false;
   for(const along of [0,1,-1,2,-2,3,-3,5,-5,8,-8]){
    h.x=baseX+dx*along;h.z=baseZ+dz*along;
    valid=[[-rx*2.5,-rz*2.5],[-rx*2.5,rz*2.5],[rx*2.5,-rz*2.5],[rx*2.5,rz*2.5],[0,0]].every(([a,b])=>{
     const road=roadSurface(h.x+dz*a+dx*b,h.z-dx*a+dz*b);return road&&road.edge>.02&&road.edge<1.4;
    });if(valid)break;
   }
   if(!valid){rejected.push({ref,reason:'No pavement footprint clear of road crossings'});return}
  }
  h.adjustment=Math.hypot(h.x-source.x,h.z-source.z);(pavement?pavementDefects:holes).push(h);
  const start=positions.length/3,n=8,variant=depth>.1?2:depth>.06?1:0;
  for(let v=0;v<=n;v++)for(let u=0;u<=n;u++){
   const a=(u/n-.5)*rx*5,b=(v/n-.5)*rz*5,x=h.x+dz*a+dx*b,z=h.z-dx*a+dz*b;
   positions.push(x,terrainHeight(x,z)+(pavement?.065:.19),z);uvs.push((variant+u/n)/3,1-v/n);
  }
  for(let v=0;v<n;v++)for(let u=0;u<n;u++){const a=start+v*(n+1)+u,b=a+n+1;indices.push(a,b,a+1,a+1,b,b+1)}
 });
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,material);mesh.name='Reported-location study: fictional damage appearance';mesh.receiveShadow=true;scene.add(mesh);
 const previous=wheels.map(()=>null),contacts=wheels.map(()=>new Set()),springs=wheels.map(()=>({y:0,v:0}));
 const bounce={y:0,v:0,pitch:0,pv:0,roll:0,rv:0};let hitCount=0;
 function reset(){previous.fill(null);contacts.forEach(c=>c.clear());for(const s of springs)s.y=s.v=0;for(const k of Object.keys(bounce))bounce[k]=0;body.position.y=0;body.rotation.set(0,0,0);wheels.forEach(w=>w.pivot.position.y=.32)}
 function update(dt,speed){
  const c=Math.cos(taxi.rotation.y),s=Math.sin(taxi.rotation.y);
  wheels.forEach((wheel,wi)=>{
   const side=wheel.pivot.position.x,axle=wheel.pivot.position.z;
   const p={x:taxi.position.x+c*side+s*axle,z:taxi.position.z-s*side+c*axle},old=previous[wi];previous[wi]=p;
   if(old&&Math.hypot(p.x-old.x,p.z-old.z)<6){
    for(const h of holes){
     const local=q=>({x:((q.x-h.x)*h.dz-(q.z-h.z)*h.dx)/h.rx,z:((q.x-h.x)*h.dx+(q.z-h.z)*h.dz)/h.rz});
     const a=local(old),b=local(p),dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz,t=l?clamp(-(a.x*dx+a.z*dz)/l,0,1):0;
     const inside=b.x*b.x+b.z*b.z<1,hit=(a.x+t*dx)**2+(a.z+t*dz)**2<1;
     if(hit&&!contacts[wi].has(h.index)&&Math.abs(speed)>.6){
      const kick=clamp(h.depth*(2.2+Math.abs(speed)*.24),.08,.85);hitCount++;
      springs[wi].v-=kick*1.8;bounce.v-=kick*1.9;bounce.pv+=(wheel.front?1:-1)*kick*.5;bounce.rv+=Math.sign(side)*kick*.5;
      if(h.depth>=.1&&wheel.front)chassis.yawRate+=Math.sign(side)*Math.sign(speed)*Math.min(.035,kick*.05);
     }
     if(inside)contacts[wi].add(h.index);else contacts[wi].delete(h.index);
    }
   }else contacts[wi].clear();
   const spring=springs[wi];spring.v+=(-130*spring.y-15*spring.v)*dt;spring.y=clamp(spring.y+spring.v*dt,-.10,.065);wheel.pivot.position.y=.32+spring.y;
  });
  bounce.v+=(-100*bounce.y-10*bounce.v)*dt;bounce.y=clamp(bounce.y+bounce.v*dt,-.12,.08);
  bounce.pv+=(-90*bounce.pitch-11*bounce.pv)*dt;bounce.pitch=clamp(bounce.pitch+bounce.pv*dt,-.035,.035);
  bounce.rv+=(-95*bounce.roll-11*bounce.rv)*dt;bounce.roll=clamp(bounce.roll+bounce.rv*dt,-.035,.035);
  body.position.y=bounce.y;body.rotation.x=bounce.pitch;body.rotation.z=bounce.roll;
 }
 return {mesh,holes,pavementDefects,rejected,bounce,update,reset,get hitCount(){return hitCount},get cameraOffset(){return bounce.y*1.8},texture};
}
