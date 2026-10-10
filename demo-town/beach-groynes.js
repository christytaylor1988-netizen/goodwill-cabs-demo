// Scenery only. All timber shares one box geometry and one instanced draw call.
export function addBeachGroynes(THREE,{parent,data,convertPosition,rows,pavingHeight,beachProfile,bottleAlley,shared}){
 const cinque=data.roads.filter(r=>r.tags?.name==='Cinque Ports Way').flatMap(r=>r.geometry);
 const pier=data.piers.find(p=>p.tags?.name==='Hastings Pier');
 if(!cinque.length||!pier||rows.length<2)return null;
 const junction=cinque.reduce((a,b)=>a.lat<b.lat?a:b);
 const west=convertPosition(junction.lat,junction.lon).x;
 const east=Math.min(...pier.geometry.map(p=>convertPosition(p.lat,p.lon).x))-12;
 // West of the continuous beach, follow the existing mapped beach polygons.
 const beaches=data.land.filter(f=>f.tags?.natural==='beach'&&f.geometry).map(f=>f.geometry.map(p=>convertPosition(p.lat,p.lon)));
 function legacySection(x){
  for(const ring of beaches){
   const crossings=[];
   for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[j],b=ring[i];if((a.x<=x&&b.x>x)||(b.x<=x&&a.x>x))crossings.push(a.z+(b.z-a.z)*(x-a.x)/(b.x-a.x));
   }
   crossings.sort((a,b)=>a-b);
   for(let i=0;i+1<crossings.length;i+=2)if(crossings[i+1]-crossings[i]>20)return {prom:crossings[i],sea:crossings[i+1]};
  }
  return null;
 }
 const rowStep=rows[1].x-rows[0].x;
 function section(x){
  if(x<rows[0].x)return legacySection(x);if(x>rows.at(-1).x)return null;
  const i=Math.min(rows.length-2,Math.max(0,Math.floor((x-rows[0].x)/rowStep))),a=rows[i],b=rows[i+1],t=(x-a.x)/(b.x-a.x);
  return {a,b,prom:a.prom+(b.prom-a.prom)*t,sea:a.sea+(b.sea-a.sea)*t};
 }
 const profiles=rows.map(r=>{
  const base=pavingHeight(r.x,r.prom)-.65,y=bottleAlley?.beachTop(r.x,base)??base;
  return [[r.x,y,r.prom],[r.x,y*.55-.0675,(r.prom+r.sea)/2],[r.x,-.15,r.sea]];
 });
 // Match the actual two-triangle beach strips, including the mid-beach slope.
 function ground(x,z){
  const s=section(x);if(!s||z<s.prom||z>s.sea)return null;
  if(x<rows[0].x){const p=beachProfile.sample(x,z);return p.clear?p.height:null;}
  const i=Math.min(rows.length-2,Math.max(0,Math.floor((x-rows[0].x)/rowStep))),a=profiles[i],b=profiles[i+1];
  for(let k=0;k<2;k++)for(const [p,q,r] of [[a[k],b[k+1],b[k]],[a[k],a[k+1],b[k+1]]]){
   const det=(q[2]-r[2])*(p[0]-r[0])+(r[0]-q[0])*(p[2]-r[2]);
   const u=((q[2]-r[2])*(x-r[0])+(r[0]-q[0])*(z-r[2]))/det;
   const v=((r[2]-p[2])*(x-r[0])+(p[0]-r[0])*(z-r[2]))/det,w=1-u-v;
   if(Math.min(u,v,w)>=-1e-6)return u*p[1]+v*q[1]+w*r[1];
  }
  return null;
 }
 let seed=41026;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const matrices=[],colours=[],lines=[],dummy=new THREE.Object3D();
 function timber(x,y,z,w,h,d,yaw=0,roll=0){
  dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,yaw,roll);dummy.updateMatrix();matrices.push(dummy.matrix.clone());
  const shade=.78+random()*.40;colours.push(new THREE.Color(0x514b3d).multiplyScalar(shade));
 }
 for(let x=west+38;x<east-40;x+=88+random()*18){
  const s=section(x);if(!s)continue;
  const left=section(x-6),right=section(x+6);if(!left||!right)continue;const slope=(right.prom-left.prom)/12;
  // Local shoreline normal, with a small variation rather than rigid repetition.
  const dx=-slope+(random()-.5)*.06,dz=1,len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  const points=[];
  for(let distance=0;distance<125;distance+=2.6){
   const px=x+ux*distance,pz=s.prom+3.5+uz*distance,r=section(px);
   if(!r||px<west+.5||px>east-.5||pz>r.sea-1.5)break;
   if(bottleAlley?.opening(px,pz,1.5))continue;
   const y=ground(px,pz);if(y===null)break;
   const fraction=(pz-r.prom)/(r.sea-r.prom),top=.88-fraction*.27+(random()-.5)*.15;
   // Posts extend well below the shingle; slight lean and varied tops suggest wear.
   timber(px,y+(top-.50)/2,pz,.25,top+.50,.27,(random()-.5)*.035,(random()-.5)*.025);
   points.push({x:px,z:pz,y});
  }
  for(let j=1;j<points.length;j++){
   const a=points[j-1],b=points[j],dx=b.x-a.x,dz=b.z-a.z,dy=b.y-a.y,l=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx),roll=Math.atan2(dy,l);
   const worn=random()>.87;
   for(let level=0;level<(worn?3:4);level++){
    const h=.19,cy=(a.y+b.y)/2-.16+level*.185;
    timber((a.x+b.x)/2,cy,(a.z+b.z)/2,Math.hypot(l,dy)+.06,h,.15,yaw,roll);
   }
  }
  if(points.length>1)lines.push(points);
 }
 const material=shared(new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}));
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,matrices.length);
 matrices.forEach((m,i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,colours[i]);});
 mesh.name='Weathered timber groynes — Cinque Ports Way to Hastings Pier only';
 mesh.receiveShadow=true;mesh.computeBoundingSphere();parent.add(mesh);
 return {mesh,west,east,lines,ground};
}
