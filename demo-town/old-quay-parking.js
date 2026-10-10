// Local courtyard scenery only, using the existing parked-car and box helpers.
export function addOldQuayParking(THREE,{tile,entry,convertPosition,terrainHeight,objectBox,parkedCar,shared,SCENERY_CELL}){
 const origin=convertPosition(50.856217,.591055);
 if(Math.floor(origin.x/SCENERY_CELL)!==tile.x||Math.floor(origin.z/SCENERY_CELL)!==tile.z)return;
 const g=entry.group,mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.9})),paving=mat(0xb2afa0),white=mat(0xe7e5d5),steel=mat(0x92958b),dark=mat(0x343d39);
 // Pave the whole forecourt, following its inset edge beside the corner building.
 const boundary=[[50.856302,.59086],[50.856325,.591275],[50.85619,.591275],[50.856184,.591077],[50.856079,.591077],[50.856072,.59084]].map(([lat,lon])=>convertPosition(lat,lon));
 const shape=new THREE.Shape(boundary.map(p=>new THREE.Vector2(p.x,-p.z))),surface=new THREE.ShapeGeometry(shape);surface.rotateX(-Math.PI/2);
 const vertices=surface.attributes.position;for(let i=0;i<vertices.count;i++)vertices.setY(i,terrainHeight(vertices.getX(i),vertices.getZ(i))+.14);
 surface.computeVertexNormals();const paved=new THREE.Mesh(surface,paving);paved.receiveShadow=true;g.add(paved);
 for(let i=0;i<6;i++){
  const p=convertPosition(50.856277+i*.000003,.59098+i*.000042),yaw=.11;
  parkedCar(g,p.x,p.z,yaw,30+i*7);entry.parked.push({x:p.x,z:p.z,yaw});
  objectBox(g,.07,.025,5,p.x-1.25,terrainHeight(p.x,p.z)+.16,p.z,white,yaw);
 }
 const p=convertPosition(50.856124,.591044),base=terrainHeight(p.x,p.z),signYaw=-.65;
 const signNX=Math.sin(signYaw),signNZ=Math.cos(signYaw);
 for(const dx of [-1.7,1.7])objectBox(g,.13,4.9,.13,p.x+dx*Math.cos(signYaw),base+2.45,p.z-dx*Math.sin(signYaw),steel);
 const c=document.createElement('canvas');c.width=768;c.height=640;const ctx=c.getContext('2d');
 ctx.fillStyle='#176042';ctx.fillRect(0,0,768,640);ctx.strokeStyle='#e5e4ce';ctx.lineWidth=12;ctx.strokeRect(8,8,752,624);
 ctx.strokeStyle='#f4f1dd';ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(295,610);ctx.lineTo(295,280);ctx.lineTo(150,115);ctx.moveTo(295,280);ctx.lineTo(665,120);ctx.stroke();
 ctx.fillStyle='#f4f1dd';ctx.font='bold 34px sans-serif';ctx.fillText('Folkestone',35,230);ctx.fillText('A259',35,272);
 ctx.fillStyle='#eeeade';ctx.fillRect(415,255,310,120);ctx.fillStyle='#26382f';ctx.font='bold 31px sans-serif';ctx.fillText('TRAFFIC CALMING',427,303);ctx.fillText('300 yards',470,347);
 ctx.fillStyle='#246393';ctx.fillRect(445,396,105,99);ctx.fillStyle='white';ctx.font='bold 76px sans-serif';ctx.fillText('P',472,473);ctx.font='bold 26px sans-serif';ctx.fillText('Old Town',570,435);ctx.fillText('Parking',570,474);
 ctx.fillStyle='#835a3b';ctx.fillRect(420,516,308,90);ctx.fillStyle='#fff5df';ctx.font='bold 31px sans-serif';ctx.fillText('Seafront & Gallery',432,570);
 const texture=shared(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(4.5,3.75),shared(new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide})));sign.position.set(p.x+signNX*.09,base+3.45,p.z+signNZ*.09);sign.rotation.y=signYaw;g.add(sign);
 objectBox(g,4.6,3.85,.09,p.x,base+3.45,p.z,steel,signYaw);
 for(const lon of [.59088,.59120]){const b=convertPosition(50.856161,lon),y=terrainHeight(b.x,b.z);objectBox(g,.14,.95,.14,b.x,y+.48,b.z,dark);objectBox(g,.16,.16,.16,b.x,y+.82,b.z,white)}
 const bin=convertPosition(50.856151,.59114);objectBox(g,.62,.95,.58,bin.x,terrainHeight(bin.x,bin.z)+.48,bin.z,dark);
}
export function buildParkingTerrace(THREE,{poly,tile,polygonShape,objectBox,shared}){
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.95})),brick=mat(0x9c6851),roof=mat(0x8c7556),trim=mat(0xe3ddc7),glass=mat(0x425157),rail=mat(0x3c5045);
 const ps=poly.outer,h=8.6,g=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:h,bevelEnabled:false,steps:1});g.rotateX(Math.PI/2);const body=new THREE.Mesh(g,brick);body.position.y=h;body.castShadow=true;body.receiveShadow=true;tile.group.add(body);
 const area=ps.reduce((v,a,i)=>{const b=ps[(i+1)%ps.length];return v+a.x*b.y-b.x*a.y},0);
 for(let i=0;i<ps.length;i++){
  const a=ps[i],b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<2)continue;
  const nx=(area>0?dz:-dz)/len,nz=(area>0?-dx:dx)/len,yaw=-Math.atan2(dz,dx),x=(a.x+b.x)/2,z=(a.y+b.y)/2;
  const box=(w,h,d,u,y,v,m)=>objectBox(tile.group,w,h,d,x+dx/len*u+nx*v,y,z+dz/len*u+nz*v,m,yaw);
  const n=Math.max(1,Math.floor(len/3.1));
  for(let j=0;j<n;j++)for(const y of [1.65,4.5,7.2]){const u=-len/2+len*(j+.5)/n;box(1.42,1.45,.14,u,y,.1,trim);box(1.25,1.27,.06,u,y,.21,glass);box(.055,1.3,.07,u,y,.26,trim);box(1.25,.055,.07,u,y+.2,.26,trim)}
  if(nz>.5){box(len,.15,.9,0,3.1,.4,trim);for(const y of [3.35,4.15])box(len,.07,.07,0,y,.82,rail);for(let u=-len/2+.2;u<len/2;u+=1.5)box(.08,.9,.08,u,3.72,.82,rail)}
 }
 const minX=Math.min(...ps.map(p=>p.x)),maxX=Math.max(...ps.map(p=>p.x)),minZ=Math.min(...ps.map(p=>p.y)),maxZ=Math.max(...ps.map(p=>p.y)),midZ=(minZ+maxZ)/2,vs=[];
 const A=[minX,h,maxZ],B=[maxX,h,maxZ],C=[maxX,h,minZ],D=[minX,h,minZ],R=[minX+2,h+1.7,midZ],T=[maxX-2,h+1.7,midZ];
 for(const v of [A,B,T,A,T,R,D,R,T,D,T,C,A,R,D,B,C,T])vs.push(...v);const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));rg.computeVertexNormals();const rm=shared(roof.clone());rm.side=THREE.DoubleSide;const m=new THREE.Mesh(rg,rm);m.castShadow=true;tile.group.add(m);
 for(let x=minX+3;x<maxX-1;x+=9)objectBox(tile.group,.65,1.9,.7,x,h+1.15,midZ,brick);
}
