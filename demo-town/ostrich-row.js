// Three bespoke frontages only: fish bar, low pub courtyard and The Ostrich.
export const ostrichRow={1025573810:{h:10.1,kind:'fish',name:'BRINY BAY FISH & CHIPS'},1025573799:{h:6.7,kind:'pub',name:'THE MARINER\u2019S REST'},1025573800:{h:8.5,kind:'ostrich',name:'THE OSTRICH'}};
export function buildOstrichRow(THREE,{poly,tile,seed,polygonShape,objectBox,textSign,terrainHeight,shared}){
 const s=ostrichRow[seed],fish=s.kind==='fish',pub=s.kind==='pub',ostrich=s.kind==='ostrich';
 const mat=color=>shared(new THREE.MeshStandardMaterial({color,roughness:.88}));
 const cream=mat(0xece8d9),white=mat(0xf3f0e6),green=mat(0x7a866b),blue=mat(0x87b6cc),darkBlue=mat(0x345e86),glass=mat(0x34484d),slate=mat(0x676b66),brick=mat(0x94735a),wood=mat(0x82725b),iron=mat(0x343b38),chalk=mat(0x303b35);
 const wall=ostrich?white:cream,paint=fish?darkBlue:pub?green:blue,ps=poly.outer;
 const area=ps.reduce((v,a,i)=>{const b=ps[(i+1)%ps.length];return v+a.x*b.y-b.x*a.y},0);
 const edges=ps.map((a,i)=>{const b=ps[(i+1)%ps.length],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);return {a,b,dx,dz,len,nx:(area>0?dz:-dz)/len,nz:(area>0?-dx:dx)/len}});
 const face=edges.filter(e=>e.nz>.5).sort((a,b)=>b.len-a.len)[0];if(!face)return;
 const ux=face.dx/face.len,uz=face.dz/face.len,nx=face.nx,nz=face.nz,yaw=-Math.atan2(uz,ux),signYaw=Math.atan2(nx,nz);
 const coords=ps.map(p=>({u:p.x*ux+p.y*uz,v:p.x*nx+p.y*nz}));
 const u0=Math.min(...coords.map(p=>p.u)),u1=Math.max(...coords.map(p=>p.u)),v0=Math.min(...coords.map(p=>p.v)),v1=Math.max(...coords.map(p=>p.v)),split=u0+(u1-u0)*.34;
 const box=(w,h,d,u,y,v,m)=>objectBox(tile.group,w,h,d,u*ux+v*nx,y,u*uz+v*nz,m,yaw);
 const sign=(label,w,h,u,y,v,bg,ink='#f4ebd4')=>textSign(tile.group,label,w,h,u*ux+v*nx,y,u*uz+v*nz,bg,ink,signYaw);
 function body(points,h){const sh=new THREE.Shape(points.map(p=>new THREE.Vector2(p.u*ux+p.v*nx,p.u*uz+p.v*nz))),g=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,steps:1});g.rotateX(Math.PI/2);const m=new THREE.Mesh(g,wall);m.position.y=h;m.castShadow=true;m.receiveShadow=true;tile.group.add(m)}
 function clip(keep){const out=[];for(let i=0;i<coords.length;i++){const a=coords[i],b=coords[(i+1)%coords.length],ai=keep(a.u),bi=keep(b.u);if(ai)out.push(a);if(ai!==bi){const t=(split-a.u)/(b.u-a.u);out.push({u:split,v:a.v+(b.v-a.v)*t})}}return out}
 if(fish){body(clip(u=>u<=split),3.7);body(clip(u=>u>=split),s.h)}else body(coords,s.h);
 function hip(a,b,h,rise){const depth=v1-v0,inset=Math.min(depth*.4,(b-a)*.25),r0=a+inset,r1=b-inset,vm=(v0+v1)/2,vs=[];const p=(u,v,y)=>[u*ux+v*nx,y,u*uz+v*nz];const A=p(a-.15,v0-.15,h),B=p(b+.15,v0-.15,h),C=p(b+.15,v1+.2,h),D=p(a-.15,v1+.2,h),R=p(r0,vm,h+rise),T=p(r1,vm,h+rise);for(const q of [A,B,T,A,T,R,D,R,T,D,T,C,A,R,D,B,C,T])vs.push(...q);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));g.computeVertexNormals();const m=shared(slate.clone());m.side=THREE.DoubleSide;const roof=new THREE.Mesh(g,m);roof.castShadow=true;tile.group.add(roof)}
 hip(fish?split:u0,u1,s.h,pub?1.65:ostrich?1.4:.8);
 const start=fish?split:u0,end=u1,width=end-start,mid=(start+end)/2;
 box(width+.25,.2,.4,mid,s.h,v1,white);
 for(const u of [start+.55,end-.55]){box(.55,1.65,.62,u,s.h+.5,v0+.8,brick);box(.7,.13,.74,u,s.h+1.27,v0+.8,cream);for(const d of [-.15,.15])box(.14,.4,.14,u+d,s.h+1.5,v0+.8,brick)}
 const window=(u,y,w,h,off=0)=>{box(w+.2,h+.2,.12,u,y,v1+.09+off,white);box(w,h,.07,u,y,v1+.18+off,glass);box(.055,h,.06,u,y,v1+.24+off,white);for(const dy of [-h*.22,h*.22])box(w,.05,.06,u,y+dy,v1+.24+off,white);box(w+.3,.11,.3,u,y-h/2-.14,v1+.12+off,white)};
 const count=pub?3:2;
 for(let j=0;j<count;j++){const u=start+width*(j+.5)/count;for(let y=pub?4.85:5;y+1<s.h;y+=3){if(ostrich){box(2,2.3,.42,u,y,v1+.2,blue);window(u,y,1.5,1.8,.43)}else window(u,y,fish?1.45:1.5,1.85)}}
 box(width,3.15,.13,mid,1.58,v1+.08,pub?green:ostrich?blue:cream);
 const door=mid,shopW=(width-2)/2;
 for(const side of [-1,1]){const u=mid+side*(width/4+.35);box(shopW,2.18,.15,u,1.54,v1+.19,white);box(shopW-.2,1.97,.08,u,1.54,v1+.29,glass);for(const q of [-.25,.25])box(.055,1.97,.05,u+shopW*q,1.54,v1+.35,white);box(shopW,.055,.06,u,2.03,v1+.35,white);box(shopW,.45,.15,u,.4,v1+.23,paint)}
 box(1.12,2.65,.2,door,1.34,v1+.2,white);box(.86,2.42,.08,door,1.29,v1+.33,glass);box(.07,.15,.08,door+.3,1.25,v1+.4,wood);
 const bg=fish?'#345e86':pub?'#687b59':'#87b6cc';
 box(width,.48,.25,mid,3.2,v1+.18,paint);sign(s.name,width-.25,.39,mid,3.22,v1+.33,bg,ostrich?'#233e4c':'#f4ebd4');
 if(fish){sign('FRESH FISH · CHIPS · TAKEAWAY',width-.25,.43,mid,6.55,v1+.22,bg);box(width+.2,.12,.9,mid,2.94,v1+.45,white);for(let u=start;u<end;u+=.32)box(.12,.025,.86,u,3.01,v1+.45,brick);const lowW=split-u0;box(lowW,.2,.65,(u0+split)/2,3.7,v1+.2,white);for(let j=0;j<3;j++)window(u0+lowW*(j+.5)/3,1.55,lowW/3-.2,2);sign('BRINY BAY CAFE',lowW-.2,.36,(u0+split)/2,3.23,v1+.25,'#7a866b')}
 if(ostrich){sign('THE OSTRICH',width-.35,.67,mid,6.6,v1+.25,'#f3f0e6','#304c5b');for(let y=3.55;y<s.h;y+=.23)box(width,.014,.025,mid,y,v1+.025,cream)}
 if(pub){
  for(const u of [start+.5,end-.5]){box(.85,1.65,.08,u,1.55,v1+.35,chalk);sign('ALES & FOOD',.76,.19,u,2.14,v1+.41,'#303b35');for(let y=.96;y<1.95;y+=.19)box(.6,.025,.025,u,y,v1+.42,cream)}
  const base=Math.max(...ps.map(p=>terrainHeight(p.x,p.y))),skin=[mat(0xd2a582),mat(0x956d51)],shirts=[mat(0x475c75),mat(0x927057),mat(0x667252)],trousers=mat(0x3e4549);
  const ground=(u,v)=>terrainHeight(u*ux+v*nx,u*uz+v*nz)-base;
  // Compact tables and seated patrons remain on the pub forecourt.
  for(let i=0;i<3;i++){
   const u=start+width*(i+.5)/3,v=v1+1.45,y=ground(u,v);
   box(1.1,.09,.7,u,y+.78,v,wood);box(.12,.72,.12,u,y+.38,v,iron);
   for(const side of [-1,1]){
    const cu=u+side*.78;box(.46,.09,.46,cu,y+.44,v,green);box(.08,.8,.45,cu+side*.21,y+.65,v,green);
    for(const du of [-.16,.16])for(const dv of [-.16,.16])box(.045,.4,.045,cu+du,y+.2,v+dv,green);
    if(i===1&&side===1)continue;
    box(.33,.48,.28,cu,y+.76,v,shirts[(i+(side>0?1:0))%3]);box(.47,.16,.25,cu-side*.11,y+.5,v,trousers);box(.13,.41,.14,cu-side*.32,y+.25,v-.1,trousers);box(.13,.41,.14,cu-side*.32,y+.25,v+.1,trousers);
    const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,1),skin[i%2]);head.position.set(cu*ux+v*nx,y+1.15,cu*uz+v*nz);tile.group.add(head);
    box(.42,.10,.11,cu-side*.22,y+.86,v+.15,shirts[i%3]);box(.12,.1,.12,cu-side*.43,y+.84,v+.15,skin[i%2]);box(.09,.17,.09,u+side*.28,y+.91,v+.13,cream);
   }
  }
  for(const u of [start+.2,end-.2]){const y=ground(u,v1+.7);box(.48,.46,.48,u,y+.23,v1+.7,wood);box(.55,.4,.55,u,y+.62,v1+.7,green)}
  const u=end-.65,v=v1+2.05,y=ground(u,v);box(.65,.9,.08,u,y+.5,v,chalk);sign('TODAY\u2019S ALES',.58,.17,u,y+.72,v+.06,'#303b35');
 }
}
