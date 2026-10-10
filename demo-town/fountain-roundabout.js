// Local Fountain Roundabout / Cavendish House visual treatment only.
export function modernRoundaboutBuilding(THREE,{poly,height,tile,polygonShape,objectBox,shared,sports=false,textSign}){
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.82}));
 const pale=mat(0xe0e1da),frame=mat(0x9daeb0),glass=mat(0x5793ad),red=mat(0xa6282b),dark=mat(0x324d57);
 const geo=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:height,bevelEnabled:false,steps:1});geo.rotateX(Math.PI/2);
 const body=new THREE.Mesh(geo,pale);body.position.y=height;body.castShadow=true;body.receiveShadow=true;tile.group.add(body);
 const ps=poly.outer,area=ps.reduce((s,a,i)=>{const b=ps[(i+1)%ps.length];return s+a.x*b.y-b.x*a.y},0);
 const maxZ=Math.max(...ps.map(p=>p.y)),minZ=Math.min(...ps.map(p=>p.y));
 for(let i=0;i<ps.length;i++){
  const a=ps[i],b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<2)continue;
  const nx=(area>0?dz:-dz)/len,nz=(area>0?-dx:dx)/len,yaw=-Math.atan2(dz,dx),cx=(a.x+b.x)/2,cz=(a.y+b.y)/2;
  const box=(w,h,d,u,y,offset,m)=>objectBox(tile.group,w,h,d,cx+dx/len*u+nx*offset,y,cz+dz/len*u+nz*offset,m,yaw);
  const bays=Math.max(1,Math.floor(len/4.6)),bw=len/bays;
  for(let floor=1;floor<(sports?5:8);floor++)for(let j=0;j<bays;j++){
   const u=-len/2+bw*(j+.5),y=3.35+floor*2.75;
   if(y+1>height)continue;
   box(sports?bw*.55:bw-.35,1.45,.10,u,y,.06,glass);
   for(const f of [-.25,0,.25])box(.045,1.45,.12,u+bw*f*(sports?.55:1),y,.13,frame);
  }
  for(let j=0;j<=bays;j++)box(.23,height,.16,-len/2+j*bw,height/2,.16,frame);
  if(nz>.5&&cz>minZ+(maxZ-minZ)*.55){
   const width=len*(sports?.9:.67),u=sports?0:-len*.12;
   box(width,2.65,.16,u,1.5,.15,dark);
   box(width,.72,.28,u,3.15,.24,red);
   box(width,.30,.22,u,.25,.20,red);
   if(sports)textSign(tile.group,'SPORTS SELECT',Math.min(width,12),.64,cx+dx/len*u+nx*.41,3.15,cz+dz/len*u+nz*.41,'#ecebe2','#244f7e',yaw);
   for(let j=0;j<=Math.ceil(width/2.5);j++)box(.09,2.65,.22,u-width/2+j*width/Math.ceil(width/2.5),1.5,.25,frame);
  }
 }
}
export function plantedFountain(THREE,{group,convertPosition,terrainHeight,shared}){
 const p=convertPosition(50.8550193,.583330645),y=terrainHeight(p.x,p.z);
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.9}));
 const stone=mat(0xc6c3b4),soil=mat(0x655e46),water=mat(0x589ca8),greens=[0x536c3b,0x71864c,0x3e613b].map(mat);
 const put=(geo,m,x,h,z)=>{const mesh=new THREE.Mesh(geo,m);mesh.position.set(p.x+x,y+h,p.z+z);mesh.receiveShadow=true;group.add(mesh);return mesh;};
 put(new THREE.CylinderGeometry(6.8,6.8,.16,32),stone,0,.03,0);
 put(new THREE.CylinderGeometry(6.45,6.45,.10,32),soil,0,.14,0);
 put(new THREE.CylinderGeometry(3.15,3.3,.35,32),stone,0,.30,0);
 put(new THREE.CylinderGeometry(2.9,2.9,.045,32),water,0,.49,0);
 put(new THREE.CylinderGeometry(.22,.38,1.25,10),stone,0,1.05,0);
 put(new THREE.CylinderGeometry(1.1,.75,.17,20),stone,0,1.64,0);
 put(new THREE.CylinderGeometry(1.0,1.0,.025,20),water,0,1.74,0);
 put(new THREE.CylinderGeometry(.045,.09,.70,6),water,0,2.07,0);
 const shrub=shared(new THREE.IcosahedronGeometry(1,1));
 for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=4.85+.35*Math.sin(i*2.7),h=.55+.16*Math.sin(i*3);const bush=put(shrub,greens[i%3],Math.cos(a)*r,.3+h*.65,Math.sin(a)*r);bush.scale.set(.85,h,.72);}
}
