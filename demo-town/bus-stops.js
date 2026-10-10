// Shared, deterministic bus-stop furniture. Independent pole plus optional shelter.
export function createBusStops(THREE,{shared,objectBox,terrainHeight,findNearestRoadPoint,roadWidthForType,hitsBuilding,isWater,barrierHit,getCoast}){
 const material=color=>shared(new THREE.MeshStandardMaterial({color,roughness:.94}));
 const frame=material(0x252a29),roof=material(0x393e3b),edge=material(0x75796d),rust=material(0x87735c),seat=material(0x554c40),pole=material(0xaaa99e),cream=material(0xe0ddc8);
 function texture(draw,w=256,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=shared(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
 const glass=[0,1,2,3].map(seed=>{
  let state=seed+913;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const map=texture((g,w,h)=>{
   g.fillStyle='rgba(151,165,153,.23)';g.fillRect(0,0,w,h);
   const grime=g.createLinearGradient(0,0,0,h);grime.addColorStop(0,'rgba(110,109,83,.48)');grime.addColorStop(.2,'rgba(147,145,119,.04)');grime.addColorStop(.68,'rgba(143,139,112,.12)');grime.addColorStop(1,'rgba(100,98,77,.72)');g.fillStyle=grime;g.fillRect(0,0,w,h);
   for(let i=0;i<170;i++){g.fillStyle=`rgba(180,178,155,${.03+rand()*.12})`;g.fillRect(rand()*w,rand()*h,1+rand()*9,8+rand()*130);}
   for(let i=0;i<90;i++){g.strokeStyle='rgba(223,222,201,.22)';const x=rand()*w,y=rand()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+rand()*24-12,y+rand()*40);g.stroke();}
   // Old taped notices, torn paper remnants and small stickers.
   for(let i=0;i<2+seed%2;i++){const x=22+rand()*160,y=155+rand()*195,ww=24+rand()*29,hh=35+rand()*32;g.fillStyle=['#c2bc9e','#819294','#b1a38b'][i%3];g.fillRect(x,y,ww,hh);g.fillStyle='#61685f';for(let j=0;j<5;j++)g.fillRect(x+4,y+9+j*6,ww-8-rand()*9,1);g.fillStyle='rgba(213,204,170,.6)';g.fillRect(x-3,y-4,13,8);}
   if(seed!==0){g.save();g.translate(25,80+seed*30);g.rotate(-.13);g.font='italic 29px sans-serif';g.lineWidth=1.5;g.strokeStyle=seed===2?'#813f41':'#454945';g.strokeText(['','TIDE','SK8','ECHO'][seed],0,0);g.beginPath();g.moveTo(-5,10);g.bezierCurveTo(40,-4,72,28,132,4);g.stroke();g.restore();}
   for(let i=0;i<20;i++){g.fillStyle='rgba(68,71,57,.4)';g.fillRect(rand()*w,h-12-rand()*25,4+rand()*12,8+rand()*20);}
  });
  return shared(new THREE.MeshStandardMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide,roughness:.94}));
 });
 const signMap=texture((g,w,h)=>{g.fillStyle='#dcdac4';g.fillRect(0,0,w,h);g.fillStyle='#963f3c';g.fillRect(0,0,w,58);g.fillStyle='#f0ead7';g.font='bold 30px sans-serif';g.textAlign='center';g.fillText('BUS STOP',w/2,39);g.fillStyle='#263f46';g.fillRect(76,85,104,105);g.fillStyle='#dcdac4';g.fillRect(85,97,86,47);g.fillRect(88,161,18,12);g.fillRect(150,161,18,12);g.fillStyle='#263f46';g.fillRect(84,185,17,15);g.fillRect(155,185,17,15);g.font='20px sans-serif';g.fillText('Local services',w/2,247);g.font='16px sans-serif';g.fillText('Please signal driver',w/2,279);g.fillStyle='#65736c';for(let y=325;y<455;y+=25)g.fillRect(27,y,202,2);});
 const signMat=shared(new THREE.MeshStandardMaterial({map:signMap,roughness:.95,side:THREE.DoubleSide}));
 const timetableMap=texture((g,w,h)=>{g.fillStyle='#cec9ad';g.fillRect(0,0,w,h);g.fillStyle='#45534d';g.fillRect(12,15,w-24,42);g.fillStyle='#e5dfc9';g.font='20px sans-serif';g.fillText('BUS TIMES',28,44);g.fillStyle='#777c70';for(let y=85;y<h-20;y+=17){g.fillRect(18,y,45,2);g.fillRect(80,y,w-99,2);}});
 const timetable=shared(new THREE.MeshStandardMaterial({map:timetableMap,roughness:1}));
 function surface(x,z){const c=getCoast(),r=c?.promenadeAt(x);return r&&z>r.edge&&z<r.prom?c.pavingHeight(x,z):terrainHeight(x,z);}
 function clear(x,z,pad=.3){if(hitsBuilding(x,z,pad)||isWater(x,z)||barrierHit(x,z,pad))return false;const n=findNearestRoadPoint({x,z},true);if(n&&n.distance<roadWidthForType(n.segment.type)/2+pad)return false;const c=getCoast(),r=c?.promenadeAt(x);return !(r&&z>=r.prom-.4);}
 return {add(group,p,near){
  const s=near.segment,dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,len=Math.hypot(dx,dz)||1,tx=dx/len,tz=dz/len;
  const side=((p.x-near.point.x)*tz-(p.z-near.point.z)*tx)>=0?1:-1,nx=tz*side,nz=-tx*side,half=roadWidthForType(s.type)/2;
  const yaw=Math.atan2(-nx,-nz),c=Math.cos(yaw),sn=Math.sin(yaw),at=(x,z,u,v)=>({x:x+c*u+sn*v,z:z-sn*u+c*v});
  let x=p.x,z=p.z;if(near.distance<half+.75){x=near.point.x+nx*(half+.85);z=near.point.z+nz*(half+.85);}
  // Keep the mapped roadside, even when the node was recorded on the carriageway.
  for(const shift of [0,1,-1,2,-2]){const q={x:x+tx*shift,z:z+tz*shift};if(clear(q.x,q.z,.12)){x=q.x;z=q.z;break;}}
  const y=surface(x,z)+.04,box=(w,h,d,u,yy,v,m,xx=x,zz=z)=>{const q=at(xx,zz,u,v);return objectBox(group,w,h,d,q.x,yy,q.z,m,yaw);};
  box(.065,3.25,.065,0,y+1.625,0,pole);box(.18,.08,.18,0,y+.04,0,frame);
  box(.52,.83,.09,0,y+2.86,0,cream);
  const panel=(w,h,u,yy,v,m,angle=yaw,xx=x,zz=z)=>{const q=at(xx,zz,u,v),mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);mesh.position.set(q.x,yy,q.z);mesh.rotation.y=angle;group.add(mesh);};
  panel(.49,.8,0,y+2.86,.052,signMat);panel(.22,.43,0,y+1.48,.046,timetable);
  box(.10,.16,.08,0,y+.63,0,frame);
  // Shelter offset leaves a visible gap from the separate pole and an open boarding strip.
  let site=null;
  for(const width of [3.4,2.8]){for(const sideOffset of [1,-1]){
   const q=at(x,z,sideOffset*(width/2+.85),-1.85),depth=1.45,heights=[];let ok=true;
   for(const u of [-width/2,0,width/2])for(const v of [-depth/2,0,depth/2,.725+1.0]){const f=at(q.x,q.z,u,v);if(!clear(f.x,f.z,.35))ok=false;heights.push(surface(f.x,f.z));}
   if(ok&&Math.max(...heights)-Math.min(...heights)<.32){site={...q,width,depth,base:Math.max(...heights)+.035};break;}
  }if(site)break;}
  if(!site)return;
  const {width:w,depth:d,base:b}=site,put=(ww,h,dd,u,yy,v,m)=>box(ww,h,dd,u,b+yy,v,m,site.x,site.z);
  // Flat fascia, shallow pitched roof, gutter and drainpipe.
  put(w+.25,.12,d+.28,0,2.42,0,roof);put(w+.27,.14,.10,0,2.4,d/2+.12,frame);put(w+.20,.035,d+.20,0,2.49,0,edge);
  for(const u of [-w/2,w/2])for(const v of [-d/2,d/2]){put(.075,2.4,.075,u,1.2,v,frame);put(.15,.055,.15,u,.035,v,edge);put(.084,.16,.084,u,.16,v,rust);}
  for(const u of [-w/6,w/6])put(.065,2.32,.07,u,1.2,-d/2,frame);
  for(const h of [.22,1.0,2.30]){put(w,.055,.07,0,h,-d/2,frame);for(const u of [-w/2,w/2])put(.07,.055,d,u,h,0,frame);}
  for(let i=0;i<3;i++)panel(w/3-.08,2.04,-w/3+i*w/3,b+1.26,-d/2+.006,glass[(p.id+i)%4],yaw,site.x,site.z);
  for(const side of [-1,1]){const q=at(site.x,site.z,side*w/2,0),mesh=new THREE.Mesh(new THREE.PlaneGeometry(d-.09,2.04),glass[(p.id+(side>0?2:0))%4]);mesh.position.set(q.x,b+1.26,q.z);mesh.rotation.y=yaw+Math.PI/2;group.add(mesh);}
  for(const v of [-.38,-.22,-.06])put(w-.65,.065,.13,0,.49,v,seat);
  put(w-.65,.20,.065,0,.77,-.48,seat);for(const u of [-w*.3,w*.3])put(.055,.48,.38,u,.25,-.22,frame);
  put(.07,2.36,.07,w/2+.05,1.18,-d/2,frame);
  for(let i=0;i<6;i++){const u=-w/2+(i+.5)*w/6;put(.11,.018,.08,u,1.01,-d/2+.01,i%2?edge:rust);}
  // Collision only at structural edges; the front stays open.
  for(const ends of [[-w/2,-d/2,w/2,-d/2],[-w/2,-d/2,-w/2,d/2],[w/2,-d/2,w/2,d/2]]){const a=at(site.x,site.z,ends[0],ends[1]),b=at(site.x,site.z,ends[2],ends[3]);(group.userData.barriers??=[]).push({a,b,r:.07});}
 }};
}
