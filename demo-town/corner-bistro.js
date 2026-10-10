// Three-storey corner block on its existing mapped footprint.
export function buildCornerBistro(THREE,{poly,tile,polygonShape,objectBox,textSign,terrainHeight,shared}){
 const material=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.88}));
 const pale=material(0xe3e2d9),brick=material(0x514e49),glass=material(0x688b96),frame=material(0xc7cbc7),sign=material(0x293c3e);
 const ps=poly.outer,minX=Math.min(...ps.map(p=>p.x)),maxZ=Math.max(...ps.map(p=>p.y)),base=Math.max(...ps.map(p=>terrainHeight(p.x,p.y))),height=9.3;
 const geometry=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:height,bevelEnabled:false,steps:1});geometry.rotateX(Math.PI/2);
 const body=new THREE.Mesh(geometry,pale);body.position.y=height;body.castShadow=true;body.receiveShadow=true;tile.group.add(body);
 const area=ps.reduce((s,a,i)=>{const b=ps[(i+1)%ps.length];return s+a.x*b.y-b.x*a.y},0);
 for(let i=0;i<ps.length;i++){
  const a=ps[i],b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);if(len<.3)continue;
  const nx=(area>0?dz:-dz)/len,nz=(area>0?-dx:dx)/len,yaw=-Math.atan2(dz,dx),x=(a.x+b.x)/2,z=(a.y+b.y)/2;
  const box=(w,h,d,u,y,off,m)=>objectBox(tile.group,w,h,d,x+dx/len*u+nx*off,y,z+dz/len*u+nz*off,m,yaw);
  box(len,2.85,.08,0,4.65,.035,brick);
  const count=Math.max(1,Math.floor(len/3.7)),bay=len/count;
  for(let j=0;j<count;j++)for(const y of [4.65,7.7]){const u=-len/2+bay*(j+.5);box(bay*.65,1.55,.13,u,y,.1,glass);box(.055,1.55,.16,u,y,.18,frame);}
  box(len,.20,.25,0,9.2,.14,pale);box(len,.17,.20,0,6.15,.13,pale);
  // Ground-floor glazing continues around both public-facing sides.
  if(nx<-.45||nz>.55){
   const ground=terrainHeight(x,z)-base,shopH=3.15-ground;
   box(len-.18,shopH,.13,0,ground+shopH/2,.11,glass);
   for(let j=0;j<=count;j++)box(.10,shopH,.19,-len/2+j*bay,ground+shopH/2,.22,frame);
   box(len,.55,.25,0,3.12,.25,sign);
   if(len>8&&x<minX+25)textSign(tile.group,'TIDELINE BISTRO',Math.min(9,len-.6),.48,x+nx*.40,3.12,z+nz*.40,'#293c3e','#eee9d7',yaw);
  }
 }
 // One low-poly curved canopy ribbon wraps the south-west corner.
 const vertices=[],cx=minX+7,cz=maxZ-7;
 for(let i=0;i<16;i++){
  const point=(t,r)=>{const a=Math.PI/2+t*Math.PI/2;return [cx+Math.cos(a)*r,6.35+.35*Math.sin(t*Math.PI),cz+Math.sin(a)*r];};
  const a=point(i/16,7.25),b=point((i+1)/16,7.25),c=point(i/16,8.25),d=point((i+1)/16,8.25);
  for(const v of [a,b,d,a,d,c])vertices.push(...v);
  const mid=(i+.5)/16,angle=Math.PI/2+mid*Math.PI/2,p=point(mid,8.25);
  objectBox(tile.group,.84,.25,.12,p[0],p[1]-.10,p[2],pale,-angle-Math.PI/2);
 }
 const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));roofGeo.computeVertexNormals();const roofMat=shared(pale.clone());roofMat.side=THREE.DoubleSide;const canopy=new THREE.Mesh(roofGeo,roofMat);canopy.castShadow=true;tile.group.add(canopy);
 for(const [x,z] of [[cx,cz+8.1],[cx-8.1,cz]]){const low=terrainHeight(x,z)-base;objectBox(tile.group,.18,6.25-low,.18,x,(6.25+low)/2,z,frame);}
}
