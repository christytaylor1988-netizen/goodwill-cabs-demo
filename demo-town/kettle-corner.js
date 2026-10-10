// Two local treatments beside Lantern Kettle; no footprint changes.
export function buildKettleCorner(THREE,{poly,tile,polygonShape,objectBox,textSign,shared}){
 const mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:.9})),cream=mat(0xe5ddbf),white=mat(0xeeeadd),blue=mat(0x939faf),glass=mat(0x40575c),shop=mat(0x2d494a);
 const geo=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:9.1,bevelEnabled:false,steps:1});geo.rotateX(Math.PI/2);const body=new THREE.Mesh(geo,cream);body.position.y=9.1;body.castShadow=true;body.receiveShadow=true;tile.group.add(body);
 const ps=poly.outer,area=ps.reduce((s,a,i)=>{const b=ps[(i+1)%ps.length];return s+a.x*b.y-b.x*a.y},0);
 for(let i=0;i<ps.length;i++){
  const a=ps[i],b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<.4)continue;
  const nx=(area>0?dz:-dz)/len,nz=(area>0?-dx:dx)/len,yaw=-Math.atan2(dz,dx),x=(a.x+b.x)/2,z=(a.y+b.y)/2;
  const box=(w,h,d,u,y,off,m)=>objectBox(tile.group,w,h,d,x+dx/len*u+nx*off,y,z+dz/len*u+nz*off,m,yaw);
  // Broad horizontal windows follow each face of the existing chamfered corner.
  for(const y of [4.6,7.45]){
   box(len-.18,1.65,.12,0,y,.09,white);box(len-.36,1.43,.075,0,y,.18,glass);
   const panes=Math.max(1,Math.round(len/1.1));for(let j=1;j<panes;j++)box(.055,1.46,.055,-len/2+len*j/panes,y,.235,white);
   box(len-.23,.055,.065,0,y+.4,.24,white);box(len,.11,.24,0,y-.88,.14,white);
  }
  box(.14,9.1,.18,-len/2+.07,4.55,.15,white);box(len,.18,.26,0,9.05,.12,white);
  if(nx<-.3||nz>.4){
   box(len-.1,2.65,.14,0,1.36,.11,shop);box(len-.36,2.14,.08,0,1.4,.22,glass);
   for(let u=-len/2+.12;u<len/2;u+=1.25)box(.07,2.6,.10,u,1.36,.29,white);
   box(len,.53,.2,0,2.98,.17,shop);box(len,.43,.08,0,3.65,.08,blue);
   if(len>4){textSign(tile.group,'CORNER CATCH · FISH & CHIPS',len-.25,.42,x+nx*.3,2.98,z+nz*.3,'#2d494a','#efe8ce',Math.atan2(nx,nz));box(.9,2.3,.12,len*.28,1.17,.33,shop);box(.68,1.62,.08,len*.28,1.5,.42,glass)}
  }
 }
}
export function roughKettleSide(THREE,{poly,tile,objectBox,shared}){
 const mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:1})),brick=mat(0x846b5c),plaster=mat(0xb6b0a0),raw=mat(0x99978e),dark=mat(0x3e403c),ps=poly.outer;
 const area=ps.reduce((s,a,i)=>{const b=ps[(i+1)%ps.length];return s+a.x*b.y-b.x*a.y},0);
 for(let i=0;i<ps.length;i++){
  const a=ps[i],b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<2)continue;
  const nx=(area>0?dz:-dz)/len,nz=(area>0?-dx:dx)/len;if(nx>-.55)continue;
  const yaw=-Math.atan2(dz,dx),x=(a.x+b.x)/2,z=(a.y+b.y)/2;
  const box=(w,h,d,u,y,off,m)=>objectBox(tile.group,w,h,d,x+dx/len*u+nx*off,y,z+dz/len*u+nz*off,m,yaw);
  // Opaque stripped wall masks the former glazing and bay details on this side only.
  box(len+.1,9.05,.16,0,4.5,.80,brick);
  const n=Math.ceil(len/1.6),w=len/n;
  for(let j=0;j<n;j++){
   const u=-len/2+w*(j+.5),top=[8.8,8.25,8.6,7.9][j%4];
   box(w*.83,top-2.4,.075,u,(top+2.4)/2,.92,j%3===0?raw:plaster);
   box(w*.7,.18,.12,u,top+.06,.96,raw);
   for(let k=0;k<3;k++)box(w*.42,.24,.06,u+(k%2?.15:-.1),3.1+k*1.6+(j%2)*.35,.98,brick);
  }
  for(const u of [-len*.27,len*.22]){box(.95,1.55,.045,u,5.45,1.01,dark);box(1.12,.17,.17,u,4.62,1.03,raw)}
  for(const y of [3,6])box(len,.16,.18,0,y,1.04,raw);
 }
}
