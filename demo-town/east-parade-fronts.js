// Only the seafront row east of the cream parade; original footprints retained.
export const eastParadeFronts={
 1024935839:{height:15.6,color:0xeee9da,name:'THE GULL & ANCHOR',pub:true},
 1024935841:{height:9.3,color:0xf3eee3,name:'CRIMP & CRUST',takeaway:true},
 1024935842:{height:13.2,color:0xe8dfc6,name:'LANTERN HOUSE'},
 1024935843:{height:10.5,color:0xf0efe7,name:'PEBBLE & CUP'},
 1024949164:{height:12.6,color:0xe2e2d9,name:'THE FISCHOTEQUE',fishShop:true}
};
export function buildEastParade(THREE,{poly,tile,seed,polygonShape,objectBox,textSign,shared}){
 const s=eastParadeFronts[seed],mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:.88}));
 const wall=mat(s.color),trim=mat(0xf7f1e5),glass=mat(0x354c52),iron=mat(0x252b29),roof=mat(0x646762),front=mat(s.takeaway?0xb58c80:s.pub?0x303f35:0x435356),gold=mat(0xb7a36a);
 let fishFascia=null;
 if(s.fishShop){
  const c=document.createElement('canvas');c.width=1024;c.height=192;const ctx=c.getContext('2d');
  ctx.fillStyle='#f3eddd';ctx.fillRect(0,0,1024,192);ctx.fillStyle='#244b62';
  ctx.beginPath();ctx.ellipse(92,85,49,26,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(54,85);ctx.lineTo(15,51);ctx.lineTo(15,119);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f3eddd';ctx.beginPath();ctx.arc(118,78,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#244b62';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 66px Georgia';ctx.fillText(s.name,577,73,850);ctx.font='bold 34px sans-serif';ctx.fillText('FISH & CHIPS',577,142,760);
  const t=shared(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;fishFascia=shared(new THREE.MeshStandardMaterial({map:t,roughness:.85}));
 }
 const ps=poly.outer,geo=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:s.height,bevelEnabled:false,steps:1});geo.rotateX(Math.PI/2);
 const body=new THREE.Mesh(geo,[roof,wall]);body.position.y=s.height;body.castShadow=true;body.receiveShadow=true;tile.group.add(body);
 const area=ps.reduce((v,a,i)=>{const b=ps[(i+1)%ps.length];return v+a.x*b.y-b.x*a.y},0);
 const edges=ps.map((a,i)=>{const b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);return {a,b,dx,dz,len,nx:(area>0?dz:-dz)/len,nz:(area>0?-dx:dx)/len}});
 const signEdge=edges.filter(e=>e.nz>.45).sort((a,b)=>b.len-a.len)[0];
 for(const e of edges){
  const {a,b,dx,dz,len,nx,nz}=e;if(len<1.2)continue;
  const x=(a.x+b.x)/2,z=(a.y+b.y)/2,yaw=-Math.atan2(dz,dx),street=nz>.45;
  const box=(w,h,d,u,y,off,m)=>objectBox(tile.group,w,h,d,x+dx/len*u+nx*off,y,z+dz/len*u+nz*off,m,yaw);
  const count=Math.max(1,Math.round(len/3.4)),step=len/count;
  box(len,.24,.3,0,s.height-.1,.1,trim);
  for(let j=0;j<count;j++){
   const u=-len/2+step*(j+.5),bw=Math.min(1.85,step*.69);
   for(let y=4.65;y+1.1<s.height;y+=3.05){
    const bay=street&&y<s.height-3,off=bay?.57:.1;
    if(bay)box(bw+.22,2.35,.6,u,y,.25,wall);
    box(bw+.12,2.06,.12,u,y,off,trim);box(bw-.07,1.84,.08,u,y,off+.09,glass);
    box(.055,1.84,.06,u,y,off+.15,trim);box(bw,.06,.06,u,y-.13,off+.15,trim);
    box(bw+.3,.13,bay?.83:.3,u,y-1.08,bay?.3:.13,trim);
    if(bay){for(const side of [-1,1])box(.035,1.75,.40,u+side*(bw/2+.12),y,.27,glass)}
   }
  }
  if(!street)continue;
  const sw=len-.16;
  box(sw,3.15,.16,0,1.58,.12,front);
  for(let j=0;j<count;j++){
   const u=-len/2+step*(j+.5),w=step-.35;
   box(w,1.85,.08,u,1.58,.24,glass);
   box(w,.06,.1,u,1.35,.30,gold);box(.065,1.85,.1,u,1.58,.30,gold);
   box(w,.6,.12,u,.42,.24,front);box(.16,2.65,.27,u-step/2+.09,1.36,.24,trim);
  }
  box(sw,.56,.22,0,3.05,.25,s.fishShop?trim:front);box(sw,.09,.28,0,3.36,.28,s.fishShop?trim:gold);
  if(s.fishShop&&len>2.5){const fascia=new THREE.Mesh(new THREE.PlaneGeometry(sw-.05,.65),fishFascia);fascia.position.set(x+nx*.39,3.06,z+nz*.39);fascia.rotation.y=Math.atan2(nx,nz);tile.group.add(fascia);}
  if(e===signEdge){
   const bg=s.takeaway?'#b58c80':s.pub?'#303f35':'#435356';
   if(!s.fishShop)textSign(tile.group,s.name,Math.min(sw-.1,9),.45,x+nx*.38,3.06,z+nz*.38,bg,'#f2e5bb',yaw);
   box(.85,2.35,.12,sw*.33,1.2,.33,front);box(.64,1.5,.06,sw*.33,1.65,.42,glass);
   if(s.takeaway){box(sw,.15,.95,0,2.68,.50,trim);textSign(tile.group,'HOT PASTIES',Math.min(sw-.1,3),.28,x+nx*.45,2.48,z+nz*.45,bg,'#fff2d8',yaw)}
  }
  for(const floor of (s.pub?[3.7,6.75]:[3.7])){
   box(len,.15,.95,0,floor,.43,trim);
   for(const y of [floor+.16,floor+1])box(len,.055,.055,0,y,.9,iron);
   for(let u=-len/2+.1;u<len/2;u+=.3)box(.035,.86,.035,u,floor+.57,.9,iron);
  }
 }
}
