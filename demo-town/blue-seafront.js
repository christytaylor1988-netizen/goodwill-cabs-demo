// Fixed styling for this one seafront frontage, using the mapped footprints.
export const blueSeafront={
 1025528473:{h:5.6,c:0x98b6ca,name:'BLUE FIN FISH BAR',roof:true},
 1025528481:{h:9.4,c:0xeeeade,name:'OLD QUAY FRYER',roof:true},
 1025509747:{h:7.2,c:0xe8e7dc,name:'SALT & BATTER',roof:true},
 1025509748:{h:14,c:0x9caeac,name:'BAYVIEW ROOMS',bay:true},
 1025509750:{h:10.2,c:0x9eafab,name:'THE TIDEMARK',pub:true},
 1025509751:{h:9,c:0xe8dfc5,name:'GOLDEN OAR'},
 1424615332:{h:8.4,c:0xd6cbb0,name:'SHORE PANTRY',roof:true},
 1025573807:{h:5.5,c:0xeae9df,name:'THE LITTLE SHACK',hut:true,roof:true},
 1025573810:{h:8.5,c:0xecebe1,name:'BLUE HORIZON CAFE',roof:true}
};
export function buildBlueSeafront(THREE,{poly,tile,seed,polygonShape,objectBox,textSign,shared}){
 const s=blueSeafront[seed],mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:.9}));
 const wall=mat(s.c),white=mat(0xf2efe3),navy=mat(0x3e5963),glass=mat(0x364d50),roof=mat(s.hut?0x76766b:0x956c4d);
 const ps=poly.outer,geo=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:s.h,bevelEnabled:false,steps:1});geo.rotateX(Math.PI/2);
 const body=new THREE.Mesh(geo,wall);body.position.y=s.h;body.castShadow=true;body.receiveShadow=true;tile.group.add(body);
 const area=ps.reduce((v,a,i)=>{const b=ps[(i+1)%ps.length];return v+a.x*b.y-b.x*a.y},0);
 const edges=ps.map((a,i)=>{const b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);return {a,b,dx,dz,len,nx:(area>0?dz:-dz)/len,nz:(area>0?-dx:dx)/len}});
 const best=edges.filter(e=>e.nz>.35).sort((a,b)=>b.len-a.len)[0];
 for(const e of edges){
  const {a,b,dx,dz,len,nx,nz}=e;if(len<1)continue;
  const x=(a.x+b.x)/2,z=(a.y+b.y)/2,yaw=-Math.atan2(dz,dx),street=nz>.35;
  const box=(w,h,d,u,y,off,m)=>objectBox(tile.group,w,h,d,x+dx/len*u+nx*off,y,z+dz/len*u+nz*off,m,yaw);
  box(len,.18,.28,0,s.h-.1,.1,white);
  if(s.pub)for(const y of [3.25,6.35,9.65]){box(len,.22,.3,0,y,.13,navy);box(len,.08,.34,0,y+.18,.15,white)}
  const count=Math.max(1,Math.round(len/(s.bay?4:3.1))),step=len/count;
  for(let j=0;j<count;j++)for(let y=4.65;y+1<s.h;y+=3.05){
   const u=-len/2+step*(j+.5),w=Math.min(step*.7,s.bay?2.6:1.7),bay=street&&(s.bay||(s.pub&&j===0)),off=bay?.52:.09;
   if(bay)box(w+.25,2.35,.6,u,y,.23,wall);
   box(w+.15,2,.12,u,y,off,white);box(w,1.8,.08,u,y,off+.09,glass);
   box(.06,1.8,.07,u,y,off+.15,white);box(w,.06,.07,u,y-.1,off+.15,white);
   box(w+.28,.13,bay?.8:.25,u,y-1.05,bay?.3:.12,white);
   if(s.pub){for(const d of [-w*.28,w*.28])box(.035,1.8,.05,u+d,y,off+.15,white);box(w,.04,.05,u,y+.45,off+.15,white)}
  }
  if(!street)continue;
  box(len,.5,.12,0,.26,.08,navy);
  for(let j=0;j<count;j++){
   const u=-len/2+step*(j+.5),w=step-.32;
   box(w,2.05,.14,u,1.53,.12,white);box(w-.18,1.85,.08,u,1.53,.23,glass);
   box(.06,1.85,.08,u,1.53,.3,white);box(w,.06,.08,u,1.8,.3,white);
  }
  box(len,.52,.22,0,2.95,.23,s.pub?wall:navy);
  if(e===best){
   textSign(tile.group,s.name,Math.min(len-.12,9),.44,x+nx*.37,2.95,z+nz*.37,s.pub?'#9eafab':'#3e5963','#f4edce',yaw);
   if(s.pub)textSign(tile.group,'ALES · FOOD · SEA AIR',Math.min(len-.12,8),.27,x+nx*.23,6.02,z+nz*.23,'#9eafab','#3e5963',yaw);
   box(.85,2.4,.12,len*.28,1.22,.32,navy);
   if(s.hut){
    const g=new THREE.BufferGeometry(),v=[];
    for(const [u,y] of [[-len/2,s.h],[len/2,s.h],[0,s.h+1.6]])v.push(x+dx/len*u+nx*.03,y,z+dz/len*u+nz*.03);
    g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();const m=shared(wall.clone());m.side=THREE.DoubleSide;tile.group.add(new THREE.Mesh(g,m));
    textSign(tile.group,'THE SHACK',len*.82,.6,x+nx*.15,4.4,z+nz*.15,'#eae9df','#293a40',yaw);
   }
  }
  if(s.hut)for(let y=.6;y<s.h;y+=.25)box(len,.018,.025,0,y,.04,white);
 }
 if(s.roof&&best){
  const {dx,dz,len}=best,ux=dx/len,uz=dz/len,vx=-uz,vz=ux;
  const us=ps.map(p=>p.x*ux+p.y*uz),vs=ps.map(p=>p.x*vx+p.y*vz),u0=Math.min(...us),u1=Math.max(...us),v0=Math.min(...vs),v1=Math.max(...vs),vm=(v0+v1)/2,verts=[];
  const p=(u,v,y)=>[u*ux+v*vx,y,u*uz+v*vz],rise=s.hut?1.6:1.3;
  const a=p(u0,v0,s.h),b=p(u1,v0,s.h),c=p(u1,v1,s.h),d=p(u0,v1,s.h),r=p(u0,vm,s.h+rise),t=p(u1,vm,s.h+rise);
  for(const q of [a,b,t,a,t,r,d,r,t,d,t,c,a,r,d,b,c,t])verts.push(...q);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();const m=shared(roof.clone());m.side=THREE.DoubleSide;const mesh=new THREE.Mesh(g,m);mesh.castShadow=true;tile.group.add(mesh);
 }
}
