import {createPedestrian} from './pedestrian-pool.js?v=local-2';
// Image-map anchors, west → east: curved bus shelter, W kiosk/café, white shelter.
// Static scenery only: figures never enter the vehicle collision registry.
export function addEversfieldFurniture(T,{group,rows,west,east,ground,add,boxGeo,roundGeo,mat,cream,glass,wood,iron,stone,soil,greens,registerBarrier,convertPosition,bottleAlley}){
 const blue=mat(0x315565),slate=mat(0x575c59),ochre=mat(0x9d906b),skin=[0xb59478,0x76513e,0xd4b69c].map(mat),coats=[0x596773,0x8d6357,0x62694a,0x393c40].map(mat),trousers=mat(0x343b40),dogMat=mat(0x71533c);
 const cylinder=new T.CylinderGeometry(1,1,1,16),sphere=new T.IcosahedronGeometry(1,1);
 const at=x=>{let i=1;while(i<rows.length-1&&rows[i].x<x)i++;const a=rows[i-1],b=rows[i],t=(x-a.x)/(b.x-a.x);return {x,edge:T.MathUtils.lerp(a.edge,b.edge,t),prom:T.MathUtils.lerp(a.prom,b.prom,t)}};
 // A single straight centreline per gently changing road section, never alternating beds.
 const line=rows.filter(r=>r.x>=west+20&&r.x<=east-20);const a=line[0],b=line.at(-1),slope=(b.edge-a.edge)/(b.x-a.x);
 const angle=Math.atan2(-slope,1),cs=Math.cos(angle),sn=Math.sin(angle);
 const centre=x=>{const r=at(x);return {x,z:r.edge+3.5,y:ground(r,r.edge+3.5)}};
 // Use a fitted straight line along the straight Eversfield frontage, keeping near the kerb.
 const w=convertPosition(50.85,.56435).x,e=convertPosition(50.85,.57070).x,wa=at(w),ea=at(e),m=(ea.edge-wa.edge)/(e-w),yaw=-Math.atan(m),c=Math.cos(yaw),s=Math.sin(yaw);
 function frame(x,offset=0){const r=at(x),z=(x>=w&&x<=e?wa.edge+(x-w)*m:r.edge)+3.5+offset;return {x,z,y:ground(r,z),angle:x>=w&&x<=e?yaw:angle};}
 function point(f,u,v){return {x:f.x+Math.cos(f.angle)*u+Math.sin(f.angle)*v,z:f.z-Math.sin(f.angle)*u+Math.cos(f.angle)*v};}
 function block(f,material,u,y,v,w,h,d,tilt=0){const p=point(f,u,v);add(boxGeo,material,p.x,f.y+y,p.z,w,h,d,0,f.angle,tilt)}
 function round(f,geo,material,u,y,v,w,h,d){const p=point(f,u,v);add(geo,material,p.x,f.y+y,p.z,w,h,d,0,f.angle)}
 function rod(f,material,pa,pb,r=.025){const a=point(f,pa[0],pa[2]),b=point(f,pb[0],pb[2]);const av=new T.Vector3(a.x,f.y+pa[1],a.z),bv=new T.Vector3(b.x,f.y+pb[1],b.z),delta=bv.clone().sub(av),mid=av.add(bv).multiplyScalar(.5),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.clone().normalize()),rot=new T.Euler().setFromQuaternion(q);add(cylinder,material,mid.x,mid.y,mid.z,r,delta.length(),r,rot.x,rot.y,rot.z)}
 function bench(f,u=0,v=.65,width=2.4){block(f,wood,u,.55,v,width,.12,.6);for(let j=0;j<3;j++)block(f,wood,u,.84+j*.16,v+.3,width,.12,.07);for(const k of [-1,1]){block(f,iron,u+k*(width/2-.2),.27,v,.06,.54,.5);block(f,iron,u+k*(width/2-.2),.75,v+.33,.05,1.1,.05)}}
 let people=0;
 function person(f,u,v,seated=false,index=0,heading=0){const q=point(f,u,v),{g}=createPedestrian(T,index+people++,{seated});g.position.set(q.x,f.y,q.z);g.rotation.y=f.angle+heading+Math.PI;g.updateMatrixWorld(true);
  g.traverse(o=>{if(!o.isMesh)return;const pos=new T.Vector3(),quat=new T.Quaternion(),scale=new T.Vector3();o.matrixWorld.decompose(pos,quat,scale);const rot=new T.Euler().setFromQuaternion(quat);add(o.geometry,o.material,pos.x,pos.y,pos.z,scale.x,scale.y,scale.z,rot.x,rot.y,rot.z);});
 }

 const specs=[{kind:'bus shelter',lon:.56635,width:8.5},{kind:'small kiosk',lon:.56785,width:3.1},{kind:'café kiosk',lon:.56785,width:6.2,side:6.8,offset:.65},{kind:'white shelter',lon:.5700,width:11}];
 const sites=specs.map(s=>({...s,...frame(convertPosition(50.85,s.lon).x+(s.side||0),s.offset||0)}));
 let beds=0;
 for(let x=west+28;x<east-22;x+=16){if(sites.some(s=>Math.abs(x-s.x)<s.width/2+7))continue;const f=frame(x);if(bottleAlley.opening(f.x,f.z,-1.2)&&!bottleAlley.covered(f.x,f.z+2))continue;beds++;block(f,stone,0,.24,0,10,.48,2.2);block(f,soil,0,.49,0,9.6,.04,1.85);for(let j=0;j<5;j++)round(f,roundGeo,greens[j%4],-4+j*2,.87,0,.79,.48+(j%2)*.12,.7);const p=point(f,-5,0),q=point(f,5,0);registerBarrier(p,q,1.05);
  if(beds%4===1){bench(f,0,3);person(f,.4,3,true,beds)}
  if(beds%3===0)person(f,5,4.2,false,beds,Math.PI/2);
 }
 for(const f of sites){
  if(f.kind==='small kiosk'){
   block(f,cream,0,1.28,0,2.6,2.56,2.2);block(f,slate,0,.1,0,2.85,.2,2.4);block(f,cream,0,2.71,0,3.25,.22,2.85);
   for(const side of [-1,1]){block(f,blue,side*.7,1.72,-1.12,1.19,1.49,.08);block(f,glass,side*.7,1.72,-1.18,1.01,1.30,.03);block(f,cream,side*.7,1.72,-1.20,.045,1.30,.025);block(f,cream,side*.7,1.64,-1.20,1.01,.04,.025)}
   block(f,blue,-1.32,1.72,0,.06,1.5,1.7);block(f,glass,-1.36,1.72,0,.03,1.29,1.49);rod(f,iron,[0,2.8,0],[0,3.6,0],.028);rod(f,iron,[-.4,3.35,0],[.4,3.35,0]);round(f,sphere,ochre,.34,3.35,0,.13,.10,.04);
  } else if(f.kind==='café kiosk'){
   round(f,cylinder,cream,0,1.5,0,2.7,3,2);round(f,cylinder,slate,0,3.13,0,3.05,.25,2.35);block(f,blue,0,1.7,-1.92,3.5,1.45,.10);block(f,glass,0,1.72,-1.99,3.2,1.17,.04);block(f,cream,0,1.1,-2.15,3.65,.16,.55);block(f,cream,0,2.57,-1.99,3.7,.22,.28);for(const u of [-1.05,0,1.05])block(f,ochre,u,1.34,-2.11,.18,.24,.13);
   person(f,3.7,-1.1,false,7);bench(f,4,1.1,2);person(f,4,1.1,true,8);
  } else if(f.kind==='white shelter'){
   block(f,stone,0,.1,0,10.8,.2,3.1);block(f,cream,0,2.8,0,11.4,.18,3.5);block(f,cream,0,2.94,0,11.7,.09,3.7);
   for(let j=0;j<5;j++){const u=-4.8+j*2.4;for(const v of [-1.2,1.3])block(f,cream,u,1.48,v,.14,2.8,.14);if(j<4){block(f,ochre,u+1.2,.75,1.35,2.25,1.25,.10);block(f,glass,u+1.2,2.05,1.35,2.25,1.05,.06);for(const t of [.4,1.2,2])block(f,cream,u+t,2.05,1.29,.055,1.14,.07);block(f,cream,u+1.2,2.05,1.28,2.3,.06,.07);bench(f,u+1.2,.65,2.05)}}person(f,-3.4,.65,true,2);person(f,2.5,.65,true,3);
  } else {
   block(f,cream,0,.1,0,8.5,.2,3.45);
   // Curved concrete shell: rear wall bends continuously over the seats toward the road.
   const profile=[[1.4,.15],[1.4,1.6],[1.25,2.2],[.85,2.65],[.3,2.95],[-.4,3.12],[-1.4,3.13],[-1.9,3.08]];
   const outline=new T.Shape();outline.moveTo(-profile[0][0],profile[0][1]);for(const [z,y] of profile.slice(1))outline.lineTo(-z,y);for(const [z,y] of [...profile].reverse())outline.lineTo(-z-.2,y+.2);outline.closePath();
   const shell=new T.ExtrudeGeometry(outline,{depth:8.2,bevelEnabled:false,curveSegments:1});shell.translate(0,0,-4.1);shell.rotateY(Math.PI/2);add(shell,cream,f.x,f.y,f.z,1,1,1,0,f.angle);
   for(let j=0;j<9;j++)for(let k=0;k<5;k++)block(f,(j+k)%2?blue:ochre,-3.6+j*.9,.6+k*.33,1.245,.87,.30,.035);
   for(const u of [-4,0,4])block(f,cream,u,.73,.0,.18,1.25,2.6);bench(f,-2,.65,3.5);bench(f,2,.65,3.5);person(f,-2.6,.65,true,0);person(f,1.6,.65,true,1);person(f,4.8,-1,false,4);
  }
 }
 // Dog walker on the clear promenade behind the planting line.
 const dogFrame=frame(convertPosition(50.85,.56735).x);person(dogFrame,0,4.4,false,9,Math.PI/2);const df={...dogFrame,angle:dogFrame.angle+Math.PI/2};const dp=point(dogFrame,1.4,4.3);df.x=dp.x;df.z=dp.z;block(df,dogMat,0,.45,0,.33,.38,.7);round(df,sphere,dogMat,0,.65,-.39,.19,.18,.22);for(const u of [-.12,.12])for(const v of [-.24,.24])rod(df,dogMat,[u,.4,v],[u,.08,v],.05);rod(df,dogMat,[0,.55,.3],[0,.8,.62],.045);rod(dogFrame,iron,[.2,1,4.2],[1.4,.62,4.3],.012);
 return {beds,people,dogWalkers:1,sites:sites.map(({kind,x,z,y,angle,width})=>({kind,x,z,y,angle,width})),planterLine:'single aligned roadside strip'};
}
