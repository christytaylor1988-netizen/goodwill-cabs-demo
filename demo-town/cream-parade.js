// Simple cream seafront block on its original mapped footprint.
export function buildCreamParade(THREE,{poly,tile,polygonShape,objectBox,textSign,shared}){
 const mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:.9}));
 const cream=mat(0xe4ddc5),trim=mat(0xf2ebd7),glass=mat(0x344e56),iron=mat(0x343c39),roof=mat(0x858578);
 const shopColors=[0x345750,0x7b4940,0x677e87,0x89815a].map(mat);
 const names=['SHINGLE & STEAM','COPPER SCOOP','TIDEBIRD CAFE','THE SALT PANTRY'];
 const ps=poly.outer,height=15,geometry=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:height,bevelEnabled:false,steps:1});geometry.rotateX(Math.PI/2);
 const body=new THREE.Mesh(geometry,[roof,cream]);body.position.y=height;body.castShadow=true;body.receiveShadow=true;tile.group.add(body);
 const area=ps.reduce((s,a,i)=>{const b=ps[(i+1)%ps.length];return s+a.x*b.y-b.x*a.y},0);
 for(let i=0;i<ps.length;i++){
  const a=ps[i],b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<1)continue;
  const nx=(area>0?dz:-dz)/len,nz=(area>0?-dx:dx)/len,yaw=-Math.atan2(dz,dx),x=(a.x+b.x)/2,z=(a.y+b.y)/2;
  const box=(w,h,d,u,y,off,m)=>objectBox(tile.group,w,h,d,x+dx/len*u+nx*off,y,z+dz/len*u+nz*off,m,yaw);
  const window=(u,y,w,off)=>{box(w+.18,1.95,.12,u,y,off,trim);box(w,1.75,.08,u,y,off+.09,glass);box(.055,1.75,.05,u,y,off+.15,trim);box(w,.055,.05,u,y-.15,off+.15,trim);box(w+.28,.12,.24,u,y-1,off+.1,trim)};
  box(len,.22,.26,0,14.88,.09,trim);
  if(nz>.7&&len>12){
   const count=4,bay=len/count;
   // Shallow rectangular bay sections, with flat glazing on their faces.
   for(let j=0;j<count;j++){
    const u=-len/2+bay*(j+.5),bw=bay*.69;
    box(bw,6.3,.55,u,9.4,.24,cream);
    box(bw+.18,.15,.7,u,12.58,.3,trim);
    for(const y of [7.8,10.85])window(u,y,Math.min(1.45,bw-.35),.59);
    window(u,13.65,1.1,.09);window(u,4.8,1.35,.1);
    const sw=bay-.22,shop=shopColors[j];
    box(sw,2.65,.12,u,1.42,.12,shop);
    box(sw*.60,1.8,.08,u-sw*.13,1.32,.22,glass);
    box(sw*.22,2.15,.09,u+sw*.34,1.15,.23,glass);
    for(const q of [-.46,.19,.47])box(.085,2.25,.13,u+sw*q,1.25,.29,trim);
    box(sw,.52,.18,u,2.98,.2,shop);
    textSign(tile.group,names[j],sw-.12,.43,x+dx/len*u+nx*.31,2.98,z+dz/len*u+nz*.31,['#345750','#7b4940','#677e87','#89815a'][j],'#f5edda',yaw);
    if(j%2===0){box(sw,.12,.8,u,2.68,.48,trim);box(.65,.85,.08,u-sw*.25,.48,.37,shop)}
   }
   // Continuous first-floor balcony with a light, dark-metal railing.
   box(len,.22,.95,0,3.55,.43,trim);
   for(const y of [3.78,4.62])box(len,.065,.065,0,y,.89,iron);
   for(let u=-len/2+.1;u<len/2;u+=.30)box(.035,.85,.035,u,4.2,.89,iron);
   box(len,.16,.7,0,6.2,.3,roof);
  }else{
   const count=Math.max(1,Math.floor(len/3.6));
   for(let j=0;j<count;j++)for(const y of [4.8,7.8,10.85,13.65])window(-len/2+len/count*(j+.5),y,Math.min(1.2,len/count*.55),.09);
  }
 }
}
