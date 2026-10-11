// Curated reusable silhouettes; each figure is three merged, vertex-coloured meshes.
const pools=new WeakMap();
export const pedestrianStyles=['casual curls','older flat cap','smart bob','workwear beanie','gym ponytail','heavy jumper','long coat','scruffy hood','silver bun','casual hoodie','older cardigan','smart suit','heavy long hair','short cropped hair','seaside coat','occasional bald'];
export function createPedestrian(T,seed=0,{seated=false}={}){
 let pool=pools.get(T);if(!pool){pool={templates:new Map(),material:new T.MeshStandardMaterial({vertexColors:true,roughness:1}),box:new T.BoxGeometry(1,1,1),ball:new T.SphereGeometry(1,7,5),cone:new T.ConeGeometry(1,1,7)};pools.set(T,pool);}
 if(!pool.taper){pool.taper=new T.CylinderGeometry(.41,.54,1,8);pool.taper.rotateY(Math.PI/8);pool.limb=new T.CylinderGeometry(.5,.34,1,6);}

 const style=((seed%16)+16)%16,key=style+':'+seated;
 if(!pool.templates.has(key)){
  const profiles=[
   [1,.48,.31,0x526f8b,'curly',0x34251d],[.91,.46,.31,0x9b927e,'cap',0xaaaaa1],[1.02,.44,.28,0x533849,'bob',0x20191b],[1.04,.56,.34,0xdbb832,'beanie',0x322c29],
   [.98,.43,.27,0x537568,'pony',0x5f3427],[1,.72,.49,0x914d56,'short',0x342623],[1.09,.49,.32,0x344353,'long',0x78462b],[.95,.5,.32,0x786349,'hood',0x453f37],
   [.89,.49,.33,0x735f82,'bun',0xc0bdb6],[1.04,.50,.32,0x49637a,'hood',0x493a30],[.92,.61,.40,0x747b60,'short',0xc0b9ae],[1.02,.51,.31,0x303848,'short',0x443321],
   [.96,.75,.48,0x4c777b,'long',0x20191a],[1.06,.46,.3,0xb18553,'short',0x17171b],[.94,.54,.36,0x6d7785,'cap',0xd0c8b8],[1,.52,.34,0x665047,'bald',0x604133]
  ];
  const [height,width,depth,coat,hairKind,hair]=profiles[style],skin=[0xd8ad8e,0x80523b,0xb87954,0x573e31,0xe0b89e,0xa57555][(style*5+2)%6],pants=style===9?0x235b65:style===4?0x383f51:0x303943;
  const g=new T.Group();g.name='Pedestrian · '+pedestrianStyles[style];g.userData.pedestrianStyle=pedestrianStyles[style];g.scale.setScalar(height);
  function batch(){const pos=[],norm=[],col=[];return {part(geo,color,x,y,z,w,h,d,rx=0,rz=0){const matrix=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,0,rz)),new T.Vector3(w,h,d)),normal=new T.Matrix3().getNormalMatrix(matrix),colour=new T.Color(color),a=geo.attributes.position,n=geo.attributes.normal,idx=geo.index;for(let i=0;i<(idx?idx.count:a.count);i++){const k=idx?idx.getX(i):i,v=new T.Vector3().fromBufferAttribute(a,k).applyMatrix4(matrix),nv=new T.Vector3().fromBufferAttribute(n,k).applyMatrix3(normal).normalize();pos.push(v.x,v.y,v.z);norm.push(nv.x,nv.y,nv.z);col.push(colour.r,colour.g,colour.b);}},finish(){const geo=new T.BufferGeometry();for(const [name,data]of [['position',pos],['normal',norm],['color',col]])geo.setAttribute(name,new T.Float32BufferAttribute(data,3));geo.computeBoundingSphere();return new T.Mesh(geo,pool.material);}};}
  const b=batch(),hip=seated?.5:.8,lean=[1,7,8,14].includes(style)?.10:0,headY=hip+.75;
  const box=(color,x,y,z,w,h,d,rx=0,rz=0)=>b.part(pool.box,color,x,y,z,w,h,d,rx,rz);
  const ball=(color,x,y,z,w,h,d)=>b.part(pool.ball,color,x,y,z,w,h,d);
  b.part(pool.taper,coat,0,hip+.29,lean,width,.61,depth*.88,lean);
  if([1,6,8,14].includes(style))b.part(pool.taper,coat,0,hip-.04,.01,width+.04,.58,depth*.92);
  if(style===12||style===2)b.part(pool.taper,style===2?0x879794:coat,0,hip-.10,0,width*1.08,.56,depth*1.05);
  for(const side of [-1,1]){
   const x=side*(width*.39+.035),reach=seated?.19:side===1?.14:-.035;
   b.part(pool.limb,coat,x,hip+.38,lean,.115,.31,.13,seated?-.5:-side*.19,side*.10);
   b.part(pool.limb,coat,x,hip+.13,lean+reach,.10,.30,.115,seated?-.8:-.30,side*.04);
   ball(skin,x,hip-.025,lean+reach+.045,.054,.071,.048);
  }
  ball(skin,0,headY,lean+.025,.145,.205,.13);
  // Muted scarves and bags strengthen the outline without drawn outlines or extra meshes.
  if([1,6,8,14].includes(style)){box(style===6?0x8b9999:0xa59b86,0,hip+.59,lean+depth*.45,.24,.09,.12);box(style===6?0x8b9999:0xa59b86,.065,hip+.43,lean+depth*.47,.09,.29,.055);}
  if(!seated&&[0,2,6,8,10,12,14].includes(style)){
   const x=width/2+.06,bag=style===2?0xbaa98d:style===12?0x937879:0x59696b;
   b.part(pool.taper,bag,x,hip-.24,.15,.29,.34,.13,0,.06);
   box(bag,x-.10,hip-.025,.15,.025,.16,.035);box(bag,x+.10,hip-.025,.15,.025,.16,.035);box(bag,x,hip+.045,.15,.21,.025,.035);
  }

  if(hairKind!=='bald'){
   ball(hair,0,headY+.10,lean-.02,.171,.135,.163);
   if(['long','bob','hood'].includes(hairKind)){box(hair,0,headY-(hairKind==='long'?.12:.02),lean-.11,.34,hairKind==='long'?.55:.32,.14);for(const side of [-1,1])box(hair,side*.15,headY-.08,lean-.015,.07,hairKind==='long'?.48:.22,.2);}
   if(hairKind==='pony'||hairKind==='bun')ball(hair,0,headY+(hairKind==='bun'?.20:.04),lean-.20,.105,hairKind==='pony'?.24:.10,.11);
   if(hairKind==='curly')for(let j=0;j<7;j++){const a=j*Math.PI*2/7;ball(hair,Math.cos(a)*.13,headY+.12+(j%2)*.025,lean+Math.sin(a)*.13,.095,.095,.095);}
   if(['cap','beanie','hat','hood'].includes(hairKind)){const cap=hairKind==='hat'?0xd5b63a:hairKind==='hood'?coat:0x424a50;ball(cap,0,headY+.15,lean,.20,.13,.19);if(hairKind==='cap'||hairKind==='hat')box(cap,0,headY+.12,lean+.12,.35,.05,.26);if(hairKind==='hat')box(cap,0,headY+.32,lean,.22,.32,.23);}
  }
  if(style===3){for(const y of [hip+.13,hip+.38])box(0xc7cebe,0,y,depth/2+lean+.01,width,.055,.015);for(const x of [-.14,.14])box(0xc7cebe,x,hip+.3,depth/2+lean+.025,.04,.55,.02);}
  if(style===2||style===11){box(0xd9d3bd,0,hip+.49,depth/2+.015,.17,.22,.025);box(0x8b4142,0,hip+.36,depth/2+.034,.045,.32,.025);}
  if(style===4)for(const side of [-1,1])box(0xd6d8cc,side*(width/2+.065),hip+.29,.14,.035,.46,.025);
  if(style===7){box(0x384b51,0,hip+.49,depth/2+.03,.15,.16,.04);box(0x99917a,-.14,hip+.16,depth/2+.02,.13,.15,.025);}
  if(style===9)box(0x394c60,0,hip+.11,depth/2+.02,width*.65,.17,.03);
  if(style===10){box(0xc0b9a3,0,hip+.38,depth/2+.02,.17,.32,.025);for(let j=0;j<3;j++)ball(0x3c4039,.08,hip+.13+j*.11,depth/2+.04,.022,.022,.022);}
  const body=b.finish();g.add(body);
  for(const side of [-1,1]){const l=batch(),x=side*(width>.6?.17:.105);if(seated){l.part(pool.box,pants,0,-.025,.22,.17,.17,.48);l.part(pool.box,pants,0,-.24,.43,.14,.47,.16);l.part(pool.box,0x24282b,0,-.45,.5,.18,.11,.28);}else{l.part(pool.limb,pants,0,-.35,0,.15,.7,.155);l.part(pool.box,0x24282b,0,-.74,.07,.17,.10,.27);}const leg=l.finish();leg.position.set(x,hip,0);leg.name='leg';g.add(leg);}
  pool.templates.set(key,g);
 }
 const g=pool.templates.get(key).clone(true);return {g,body:g.children[0],legs:g.children.filter(o=>o.name==='leg')};
}
