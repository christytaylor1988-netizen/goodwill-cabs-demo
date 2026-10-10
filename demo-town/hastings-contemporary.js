// The mapped gallery footprint, with low black tiled volumes and public frontage.
export function buildContemporary(T,{poly,tile,polygonShape,objectBox,textSign,shared}){
 const g=tile.group,ps=poly.outer;
 const mat=c=>shared(new T.MeshStandardMaterial({color:c,roughness:.84}));
 const black=mat(0x292f31),joint=mat(0x414748),roof=mat(0x353c3e),glass=mat(0x64818b),frame=mat(0x171f22),paper=mat(0xddd8c9);
 const box=(w,h,d,x,y,z,m,a=0)=>objectBox(g,w,h,d,x,y,z,m,a);
 const geo=new T.ExtrudeGeometry(polygonShape(poly),{depth:4.5,bevelEnabled:false});geo.rotateX(Math.PI/2);const body=new T.Mesh(geo,black);body.position.y=4.5;body.castShadow=body.receiveShadow=true;g.add(body);
 const minX=Math.min(...ps.map(p=>p.x)),maxX=Math.max(...ps.map(p=>p.x)),minZ=Math.min(...ps.map(p=>p.y)),maxZ=Math.max(...ps.map(p=>p.y));
 // Raised rear gallery volume and modest north-light roof monitors.
 const w=maxX-minX,d=maxZ-minZ,cx=(minX+maxX)/2;
 box(w*.78,1.6,d*.32,cx,5.2,maxZ-d*.23,black);box(w*.8,.16,d*.34,cx,6.06,maxZ-d*.23,roof);
 for(let i=0;i<3;i++){const x=minX+w*(.2+i*.25);box(w*.17,.55,d*.2,x,4.8,minZ+d*.28,roof);box(w*.16,.36,.08,x,4.85,minZ+d*.18,glass);}
 // Horizontal tile courses on each wall follow the existing footprint exactly.
 let area=0;for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length];area+=a.x*b.y-b.x*a.y}
 for(let i=0;i<ps.length;i++){
  const a=ps[i],b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<.1)continue;
  const nx=(area>0?dz:-dz)/len,nz=(area>0?-dx:dx)/len,yaw=Math.atan2(nx,nz),x=(a.x+b.x)/2,z=(a.y+b.y)/2;
  for(let h=.25;h<4.5;h+=.32)box(len,.025,.025,x+nx*.035,h,z+nz*.035,joint,yaw);
  box(len,.13,.14,x,4.5,z,roof,yaw);
  // North roadside and west promenade faces carry the gallery's public details.
  if(len<12||!(nz<-.7||nx<-.7))continue;
  const at=(u,v=0)=>({x:x+dx/len*u+nx*v,z:z+dz/len*u+nz*v});
  const e=at(-len*.25,.14),ew=Math.min(6,len*.3);
  box(ew,3.35,.16,e.x,1.75,e.z,glass,yaw);
  for(let j=0;j<=4;j++){const q=at(-len*.25-ew/2+j*ew/4,.25);box(.075,3.45,.09,q.x,1.77,q.z,frame,yaw)}
  box(ew+.6,.22,1.1,e.x+nx*.35,3.56,e.z+nz*.35,frame,yaw);
  const label=at(len*.15,.11);textSign(g,'Hastings Contemporary',Math.min(13,len*.6),.95,label.x,3.64,label.z,'#292f31','#f4f0e8',yaw);
  for(let j=0;j<3;j++){const q=at(len*.03+j*1.9,.12);box(1.42,1.9,.12,q.x,1.68,q.z,frame,yaw);box(1.25,1.7,.14,q.x+nx*.025,1.68,q.z+nz*.025,paper,yaw);
   const c=document.createElement('canvas');c.width=128;c.height=180;const k=c.getContext('2d');k.fillStyle=['#d6b1a1','#d4d8c9','#769695'][j];k.fillRect(0,0,128,180);k.fillStyle=['#355867','#4e555b','#d7ab70'][j];k.beginPath();k.arc(60,68,37,0,Math.PI*2);k.fill();k.fillStyle='#eee7d3';k.fillRect(25,83,72,14);k.fillStyle='#263237';k.font='bold 12px sans-serif';k.fillText(['COAST / COLOUR','NEW PERSPECTIVES','FORM & TIDE'][j],7,143);k.font='10px sans-serif';k.fillText('EXHIBITIONS',7,162);
   const tex=shared(new T.CanvasTexture(c));tex.colorSpace=T.SRGBColorSpace;const m=shared(new T.MeshStandardMaterial({map:tex,roughness:.9}));const o=new T.Mesh(new T.PlaneGeometry(1.2,1.64),m);o.position.set(q.x+nx*.11,1.68,q.z+nz*.11);o.rotation.y=yaw;g.add(o);
  }
 }
}
