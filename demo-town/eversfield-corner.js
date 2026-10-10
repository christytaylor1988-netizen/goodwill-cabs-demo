// Local architectural study of the Warrior Square / Eversfield corner.
// Scenery meshes only; the saved roads and building collision footprints are retained.
const shopIds=[1408633072,1381073639,1408633071];let mats;
export function buildEversfieldCorner(T,{poly,seed,tile,shared,polygonShape,terrainHeight,convertPosition,findNearestRoadPoint,roadWidthForType}){
 if(!shopIds.includes(seed))return false;
 if(!mats){const mat=c=>shared(new T.MeshStandardMaterial({color:c,roughness:.92}));mats={cream:mat(0xe8dfc7),white:mat(0xf5efdd),brown:mat(0x695748),glass:mat(0x3c515a),iron:mat(0x252b2e),roof:mat(0x545853),brick:mat(0x9a8066),blue:mat(0x436d81),canvas:mat(0x383c3e),stripe:mat(0xeeeadd)};}
 const M=mats,corner=seed===shopIds[0],ps=poly.outer;
 let front;for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],len=a.distanceTo(b);if(len<3||Math.abs(b.x-a.x)<len*.8)continue;const z=(a.y+b.y)/2;if(!front||z>front.z)front={x:(a.x+b.x)/2,z,len,angle:-Math.atan2((b.y-a.y)*Math.sign(b.x-a.x),Math.abs(b.x-a.x))};}
 if(!front)return false;
 const {x,z,len:w,angle}=front,c=Math.cos(angle),s=Math.sin(angle),h=corner?17.4:16.8,base=Math.max(...ps.map(p=>terrainHeight(p.x,p.y)));
 const pt=(u,v)=>({x:x+c*u+s*v,z:z-s*u+c*v});
 function mesh(g,m,u,y,v,yaw=angle){const p=pt(u,v),o=new T.Mesh(g,m);o.position.set(p.x,y,p.z);o.rotation.y=yaw;o.castShadow=true;o.receiveShadow=true;tile.group.add(o);return o;}
 const box=(m,u,y,v,a,b,d,yaw=angle)=>mesh(new T.BoxGeometry(a,b,d),m,u,y,v,yaw);
 for(const [bottom,top,material] of [[0,3.65,M.brown],[3.65,h,M.cream]]){const body=new T.Mesh(new T.ExtrudeGeometry(polygonShape(poly),{depth:top-bottom,bevelEnabled:false}),material);body.geometry.rotateX(Math.PI/2);body.position.y=top;tile.group.add(body);}
 // Surfaces carry their own tangent/normal, so details turn naturally around the corner.
 const faces=[{u:0,v:.55,width:w,turn:0}];
 if(corner){for(let j=0;j<4;j++){const t=(j+.5)*Math.PI/8;faces.push({u:-w/2-1.1*Math.cos(t),v:1.1*Math.sin(t),width:.47,turn:t-Math.PI/2,curve:true});}
  for(let j=0;j<5;j++)faces.push({u:-w/2-.55,v:-2-j*3.4,width:3.4,turn:-Math.PI/2});
 }
 function panel(f,mat,a,b,d,du,y,out=0){const ca=Math.cos(f.turn),sa=Math.sin(f.turn);return box(mat,f.u+ca*du+sa*out,y,f.v-sa*du+ca*out,a,b,d,angle+f.turn);}
 function sash(f,u,y,width,height=2.0,out=.23){panel(f,M.white,width+.20,height+.22,.16,u,y,out);panel(f,M.glass,width,height,.035,u,y,out+.1);panel(f,M.white,.04,height,.035,u,y,out+.13);panel(f,M.white,width,.045,.035,u,y-.08,out+.13);}
 for(const f of faces){
  panel(f,M.cream,f.width,h,.38,0,h/2);
  panel(f,M.brown,f.width,3.65,.54,0,1.82,.14);
  for(const yy of [3.75,6.8,10.15,13.65,h])panel(f,M.white,f.width+.035,.19,.66,0,yy,.13);
  if(f.curve)continue;
  const columns=Math.max(1,Math.round(f.width/2.4));
  for(let k=0;k<columns;k++){const u=(k+.5)*f.width/columns-f.width/2,bw=Math.min(1.43,f.width/columns-.4);
   // Tall projecting bays, broad sash windows and black balcony rails.
   panel(f,M.cream,bw+.5,12.65,.45,u,10.1,.36);
   for(let floor=0;floor<4;floor++){const yy=5.15+floor*3.2;sash(f,u,yy,bw,2.13,.65);panel(f,M.white,bw+.64,.15,.95,u,yy+1.2,.39);}
   panel(f,M.brown,.19,3.4,.55,u-bw/2-.14,1.73,.42);panel(f,M.glass,bw,2.47,.08,u,1.48,.47);
   const awning=panel(f,M.canvas,bw+.22,.10,.78,u,2.8,.82);awning.quaternion.setFromAxisAngle(new T.Vector3(0,1,0),angle+f.turn).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),.2));
   panel(f,M.white,bw+.65,.14,1.08,u,3.98,.6);
   for(let j=0;j<8;j++)panel(f,M.iron,.03,.85,.03,u-bw/2+j*bw/7,4.46,1.10);panel(f,M.iron,bw+.1,.045,.045,u,4.9,1.1);
  }
  panel(f,corner?M.brown:M.blue,f.width,.47,.64,0,3.47,.46);
 }
 // Low polygon domed corner cap, chimneys, pots and broken slate roofline.
 if(corner){mesh(new T.CylinderGeometry(1.1,1.55,.75,8),M.roof,-w/2,h+.55,0);mesh(new T.ConeGeometry(1.15,.8,8),M.roof,-w/2,h+1.3,0);}
 for(const u of [-w*.3,w*.32]){box(M.roof,u,h+.5,-3,w*.43,1.0,3.7);box(M.cream,u,h+1.05,-5,1.5,1.6,.8);for(let j=0;j<3;j++)mesh(new T.CylinderGeometry(.13,.18,.53,6),M.brick,u-.48+j*.48,h+2.04,-5);}
 // Small legible fascia signs wrap the restaurant rather than covering upper windows.
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle=corner?'#695748':'#436d81';ctx.fillRect(0,0,512,64);ctx.fillStyle='#eee6cf';ctx.textAlign='center';ctx.font='26px Georgia';ctx.fillText(corner?'CAFÉ · RESTAURANT':seed===shopIds[1]?'SEAFRONT STORES':'COFFEE & DELI',256,43);
 const tex=shared(new T.CanvasTexture(canvas));tex.colorSpace=T.SRGBColorSpace;const sign=shared(new T.MeshStandardMaterial({map:tex,roughness:1}));
 panel(faces[0],sign,w-.2,.4,.015,0,3.48,.795);if(corner)for(const f of faces.filter(f=>f.turn===-Math.PI/2))panel(f,sign,f.width-.1,.4,.015,0,3.48,.795);
 if(corner){
  // Zebra across Eversfield Place, just east of the Warrior Square corner: paint only, no road graph changes.
  const position=convertPosition(50.852258,.56457),road=findNearestRoadPoint(position),seg=road.segment,dx=seg.b.x-seg.a.x,dz=seg.b.z-seg.a.z,l=Math.hypot(dx,dz),tx=dx/l,tz=dz/l,nx=-tz,nz=tx,width=roadWidthForType(seg.type);
  for(let i=0;i<9;i++){const along=(i-4)*.72,xx=road.point.x+nx*along,zz=road.point.z+nz*along;const g=new T.BoxGeometry(.40,.018,3.1),o=new T.Mesh(g,M.stripe);o.rotation.y=Math.atan2(nx,nz)+Math.PI/2;o.position.set(xx,terrainHeight(xx,zz)-base+.185,zz);o.receiveShadow=true;tile.group.add(o);}
  tile.group.userData.eversfieldCorner={x,z,height:h+2.3,crossing:{x:road.point.x,z:road.point.z,road:seg.roadName}};
 }
 return true;
}
