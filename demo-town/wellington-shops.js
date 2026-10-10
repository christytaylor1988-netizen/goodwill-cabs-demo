// Wellington Place only. Accessories follow the existing mapped frontage edges.
const sites=new Map([
 [1020522386,{edge:0,name:'PEBBLE & POST',colour:'#14618a',kind:'gift',label:'GIFTS • POSTCARDS • SEASIDE SOUVENIRS'}],
 [1020522387,{edge:0,name:'SECOND STORY',colour:'#8e354d',kind:'clothes',label:'PRELOVED FINDS • BOOKS • CLOTHES'}],
 [1020522388,{edge:0,name:'COASTAL OUTFITTERS',colour:'#283f55',kind:'clothes',label:'EVERYDAY ADVENTURES',planter:true}],
 [1020522392,{edge:4,name:'HARBOUR MUTUAL',colour:'#23576e',kind:'bank',label:'YOUR LOCAL BRANCH',planter:true}],
 [1008900439,{edge:0,name:'PAPER & PEN',colour:'#765532',kind:'books',label:'BOOKS • CARDS • STATIONERY'}],
 [1008900441,{edge:3,name:'WELLINGTON PANTRY',colour:'#b36931',kind:'food',label:'COFFEE • SANDWICHES • CAKE'}],
 [1008900442,{edge:2,name:'THE FISH DISH',colour:'#227451',kind:'food',label:'FISH & CHIPS • EAT IN • TAKE AWAY',awning:true}],
 [1008900443,{edge:0,name:'TOWN FRY',colour:'#a63b32',kind:'food',label:'CHICKEN • BURGERS • FRIES',awning:true}],
 [1008900445,{edge:2,name:'SEA GLASS OPTICS',colour:'#345c70',kind:'optics',label:'EYE TESTS • FRAMES • SUNGLASSES',planter:true}]
]);
export const wellingtonShopIds=new Set(sites.keys());
export function createWellingtonShops(THREE,{shared,terrainHeight}){
 const mats=new Map(),fronts=new Map();
 const mat=c=>{if(!mats.has(c))mats.set(c,shared(new THREE.MeshStandardMaterial({color:c,roughness:.9})));return mats.get(c);};
 const cube=shared(new THREE.BoxGeometry(1,1,1)),sphere=shared(new THREE.SphereGeometry(1,8,6)),rod=shared(new THREE.CylinderGeometry(1,1,1,6));
 const palette=['#e9bc37','#e95d41','#368fbb','#ec82aa','#6bb16a','#e8dfc0'];
 function mesh(g,geo,m,x,y,z,sx,sy,sz){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);return o;}
 const box=(g,c,x,y,z,w,h,d)=>mesh(g,cube,typeof c==='string'?mat(c):c,x,y,z,w,h,d);
 function texture(draw,w=1024,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=shared(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return shared(new THREE.MeshStandardMaterial({map:t,roughness:.85,side:THREE.DoubleSide}));}
 function panel(g,m,x,y,z,w,h,angle=0){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.y=angle;g.add(o);return o;}
 function frontage(s){if(fronts.has(s.name))return fronts.get(s.name);const m=texture(c=>{
  c.fillStyle=s.colour;c.fillRect(0,0,1024,512);c.fillStyle='#f6ebcf';c.fillRect(0,8,1024,4);c.font='bold 53px Georgia';c.textAlign='center';c.fillText(s.name,512,65,975);c.font='17px sans-serif';c.fillText(s.label,512,96,960);
  c.fillStyle='#172c32';c.fillRect(18,115,988,357);c.fillStyle='#607b7d';c.fillRect(770,123,218,339);c.fillStyle='#182c30';c.fillRect(785,138,190,244);c.fillStyle='#ecddb7';c.fillRect(798,250,10,45);
  for(let r=0;r<3;r++)for(let j=0;j<10;j++){const x=35+j*70,y=156+r*99;c.fillStyle=palette[(r+j)%6];
   if(s.kind==='gift'){c.fillRect(x,y,44,66);c.fillStyle='#f3dfb7';c.fillRect(x+3,y+4,38,22);c.fillStyle='#43869d';c.fillRect(x+5,y+7,34,10);c.fillStyle='#da6753';c.fillRect(x+8,y+35,8,21);}
   else if(s.kind==='clothes'){c.beginPath();c.moveTo(x,y);c.lineTo(x+13,y-8);c.lineTo(x+27,y-8);c.lineTo(x+44,y+4);c.lineTo(x+37,y+22);c.lineTo(x+31,y+13);c.lineTo(x+31,y+63);c.lineTo(x+8,y+63);c.lineTo(x+8,y+15);c.lineTo(x,y+24);c.fill();}
   else if(s.kind==='books'){c.fillRect(x,y,14,60);c.fillRect(x+20,y+8,22,52);}
   else if(s.kind==='optics'){c.strokeStyle=palette[j%6];c.lineWidth=3;c.strokeRect(x,y+18,16,12);c.strokeRect(x+22,y+18,16,12);c.fillRect(x+16,y+22,6,2);}
  }
  if(s.kind==='food'||s.kind==='bank'){c.fillStyle='#efdfbe';c.fillRect(65,157,245,243);c.fillRect(410,157,240,243);c.textAlign='center';c.fillStyle=s.colour;c.font='bold 35px sans-serif';c.fillText(s.kind==='bank'?'WELCOME':'FRESH DAILY',188,210);c.font='23px sans-serif';['LOCAL & FRIENDLY',s.kind==='bank'?'SAVE FOR TOMORROW':'MEAL DEAL £6.95',s.kind==='bank'?'COME ON IN':'EAT IN / TAKE OUT'].forEach((t,i)=>c.fillText(t,188,265+i*43,220));c.fillText(s.kind==='bank'?'HERE TO HELP':'HOT & TASTY',530,250,220);}
  c.fillStyle=s.colour;for(const x of [12,370,750,992])c.fillRect(x,113,11,371);c.fillRect(0,450,1024,20);c.fillStyle='#f3edda';c.font='18px sans-serif';c.fillText('WELLINGTON PLACE',500,498);c.fillStyle='#d9eeee25';c.beginPath();c.moveTo(45,120);c.lineTo(104,120);c.lineTo(260,439);c.lineTo(194,439);c.fill();
 });fronts.set(s.name,m);return m;}
 const postcard=texture(c=>{c.fillStyle='#f1ddbb';c.fillRect(0,0,256,256);for(let y=5;y<248;y+=60)for(let x=5;x<248;x+=62){c.fillStyle='#edf3ef';c.fillRect(x,y,55,54);c.fillStyle='#65b7dc';c.fillRect(x+3,y+3,49,26);c.fillStyle='#3c7c9a';c.fillRect(x+3,y+24,49,11);c.fillStyle='#d4b879';c.fillRect(x+3,y+35,49,6);c.fillStyle='#b5523d';c.fillRect(x+12,y+18,10,13);c.fillStyle='#323634';c.font='7px sans-serif';c.fillText('HASTINGS',x+4,y+49);}},256,256);
 function limb(g,a,b,r,c){const v=new THREE.Vector3(...a),d=new THREE.Vector3(...b).sub(v),o=mesh(g,rod,mat(c),...v.addScaledVector(d,.5).toArray(),r,d.length(),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 function shopper(g,x,z,i,floor){const p=new THREE.Group();p.position.set(x,floor(x,z),z);p.rotation.y=[.3,2.6,-.9,1.3][i%4];p.scale.setScalar([1,.94,1.07,.87][i%4]);g.add(p);const coat=['#325369','#aa4d54','#c7bba0','#638064','#584b6b','#292c33'][i%6],skin=['#d3a182','#946c51','#bd8d6c'][i%3];
  box(p,coat,0,1.12,0,.43,.58,.28);mesh(p,sphere,mat(skin),0,1.59,0,.14,.18,.14);mesh(p,sphere,mat(i%3?'#493d33':'#aaa69c'),0,1.7,-.02,.147,.095,.14);
  for(const s of [-1,1]){limb(p,[s*.12,.88,0],[s*.14,.12,s*(i%2?.16:.035)],.075,'#454b52');box(p,'#303132',s*.14,.07,s*(i%2?.16:.035)+.08,.18,.12,.27);const hand=[s*.30,i%3===0&&s===1?1.25:.79,i%3===0&&s===1?.32:.06];limb(p,[s*.23,1.35,0],hand,.07,coat);mesh(p,sphere,mat(skin),...hand,.065,.075,.065);}
  if(i%2===0){box(p,palette[i%6],-.33,.59,.07,.30,.36,.13);limb(p,[-.42,.79,.07],[-.26,.79,.07],.013,'#baaa8e');}
 }
 function decorate(tile,poly,id){const s=sites.get(id);if(!s)return;const a=poly.outer[s.edge],b=poly.outer[(s.edge+1)%poly.outer.length],len=a.distanceTo(b),x=(a.x+b.x)/2,z=(a.y+b.y)/2;let nx=-(b.y-a.y)/len,nz=(b.x-a.x)/len;const centre=poly.outer.reduce((c,p)=>c.add(p),new THREE.Vector2()).multiplyScalar(1/poly.outer.length);if(nx*(centre.x-x)+nz*(centre.y-z)>0){nx=-nx;nz=-nz;}const yaw=Math.atan2(nx,nz),base=Math.max(...poly.outer.map(p=>terrainHeight(p.x,p.y))),g=new THREE.Group();g.position.set(x,base,z);g.rotation.y=yaw;const width=len-.18;
  const floor=(u,v)=>terrainHeight(x+Math.cos(yaw)*u+nx*v,z-Math.sin(yaw)*u+nz*v)-base+.06;
  panel(g,frontage(s),0,1.47,.24,width,2.86);box(g,s.colour,0,2.93,.22,width,.10,.35);
  // A projecting double-sided shop sign, mounted above head height.
  const sign=texture(c=>{c.fillStyle=s.colour;c.fillRect(0,0,256,256);c.strokeStyle='#f0e3c0';c.lineWidth=9;c.strokeRect(9,9,238,238);c.fillStyle='#f4ebd3';c.textAlign='center';c.font='bold 37px sans-serif';const words=s.name.split(' ');words.forEach((t,i)=>c.fillText(t,128,72+i*48,223));},256,256);
  box(g,'#262c2c',width*.36,3.25,.68,.065,.065,1.15);box(g,'#262c2c',width*.36,2.93,1.05,.09,.75,.88);panel(g,sign,width*.36+.055,2.93,1.05,.84,.70,Math.PI/2);panel(g,sign,width*.36-.055,2.93,1.05,.84,.70,-Math.PI/2);
  if(s.awning||s.kind==='gift'){const aw=width*.95;for(let j=0;j<12;j++){const u=-aw/2+aw*(j+.5)/12,col=s.kind==='gift'?s.colour:j%2?'#e4ddc2':s.colour;box(g,col,u,2.63,1.03,aw/12,.08,1.65).rotation.x=.13;box(g,col,u,2.49,1.84,aw/12,.23,.06);}for(const u of [-aw*.45,aw*.45])limb(g,[u,2.12,.3],[u,2.48,1.8],.025,'#424745');}
  if(s.kind==='gift'){
   for(const u of [-width*.34,-width*.09]){const y=floor(u,1);box(g,'#424c4b',u,y+.85,1.05,.055,1.7,.055);box(g,'#424c4b',u,y+.06,1.05,.65,.08,.65);for(const turn of [0,Math.PI/2])panel(g,postcard,u,y+1.15,1.1,.66,1.15,turn);}
   for(let j=0;j<6;j++){const u=width*.19+(j%3)*.28,v=.72+Math.floor(j/3)*.43,y=floor(u,v);mesh(g,new THREE.CylinderGeometry(.13,.095,.23,8,1,true),mat(palette[j]),u,y+.13,v,1,1,1);limb(g,[u+.10,y+.12,v+.1],[u+.13,y+.65,v+.1],.016,palette[(j+2)%6]);box(g,palette[(j+2)%6],u+.13,y+.65,v+.1,.11,.14,.045);}
   for(let j=0;j<4;j++){const u=-width*.36+j*.48,v=.65,y=2.05;for(let stripe=0;stripe<6;stripe++){const geo=new THREE.SphereGeometry(.22,4,6,stripe*Math.PI/3,Math.PI/3);const o=new THREE.Mesh(geo,mat(stripe%2?'#f3ecdd':palette[j%6]));o.position.set(u,y,v);g.add(o);}limb(g,[u,2.4,v],[u,y+.2,v],.009,'#bdb6a2');}
   box(g,'#5d6666',width*.30,floor(width*.30,1.35)+.46,1.35,.85,.08,.5);for(let j=0;j<8;j++)box(g,palette[j%6],width*.02+j*.1,floor(width*.3,1.35)+.58,1.35,.075,.19,.16);
  }
  if(s.planter){const u=-width*.29,v=1.12,y=floor(u,v),w=Math.min(2.8,width*.46);box(g,'#383e3a',u,y+.39,v,w,.78,1.28);box(g,'#94816a',u,y+.81,v,w+.06,.08,1.34);box(g,'#4c5132',u,y+.83,v,w-.16,.05,1.1);for(let j=0;j<7;j++)mesh(g,sphere,mat(j%2?'#537047':'#3f5f3d'),u-w*.36+(j%4)*w*.23,y+1.08+(j%3)*.14,v+(j%2?-.25:.22),.44,.46,.40);}
  // Small irregular groups face windows or each other, with shoppers passing at the edge.
  for(let j=0;j<3;j++){const u=(j-1)*Math.min(1.4,width*.25),v=2.45+(j%2)*.6;shopper(g,u,v,(id+j)%17,floor);}
  g.updateMatrixWorld(true);const meshes=[];g.traverse(o=>{if(o.isMesh)meshes.push(o);});for(const o of meshes){o.geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);tile.group.add(o);}
 }
 return {decorate};
}
