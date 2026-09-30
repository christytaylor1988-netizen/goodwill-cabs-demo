// Static, instanced 1066 nature. Only trunks and boulders participate in collision.
export function create1066Nature(T,api){
 const {world,entry,exit,surface,coast}=api;
 let seed=106629;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:1});
 const greens=[0x304a27,0x466032,0x61713a,0x384e2e].map(mat),bark=mat(0x564536),rockMat=mat(0x787466),grassMat=mat(0x687a40),fernMat=mat(0x777043);
 grassMat.side=fernMat.side=T.DoubleSide;
 const canopies=[new T.IcosahedronGeometry(1,0),new T.IcosahedronGeometry(1,1)],trunk=new T.CylinderGeometry(.65,1,1,6),stone=new T.IcosahedronGeometry(1,0),branch=new T.CylinderGeometry(.65,1,1,5);
 function blades(fern){const v=[];for(let i=0;i<(fern?6:4);i++){const a=i*2.399,x=Math.cos(a),z=Math.sin(a),h=fern?.48:.6;v.push(-z*.045,0,x*.045,z*.045,0,-x*.045,x*.24,h,z*.24);if(fern)for(let j=1;j<4;j++){const f=j/4;v.push(x*f*.3-z*.18*(1-f),h*f,z*f*.3+x*.18*(1-f),x*f*.3+z*.18*(1-f),h*f,z*f*.3-x*.18*(1-f),x*(f+.2)*.3,h*(f+.2),z*(f+.2)*.3);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();return g;}
 const grassGeo=blades(false),fernGeo=blades(true),batches=new Map(),dummy=new T.Object3D(),detailMeshes=[];
 function add(geo,material,x,y,z,sx,sy,sz,rx=0,rz=0,detail=false){const cell=detail?`${Math.floor(x/100)},${Math.floor(z/100)}`:'trees',key=`${geo.id}/${material.id}/${cell}`;let b=batches.get(key);if(!b){b={geo,material,matrices:[],detail,x,z};batches.set(key,b);}dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,random()*6.283,rz);dummy.updateMatrix();b.matrices.push(dummy.matrix.clone());}
 const obstacles=[],grid=new Map(),CELL=12;
 function neighbours(x,z,r=5){const result=[];for(let a=Math.floor((x-r)/CELL);a<=Math.floor((x+r)/CELL);a++)for(let b=Math.floor((z-r)/CELL);b<=Math.floor((z+r)/CELL);b++)for(const o of grid.get(`${a},${b}`)||[])result.push(o);return result;}
 function obstacle(x,z,r,kind){if(neighbours(x,z,r+5).some(o=>Math.hypot(x-o.x,z-o.z)<r+o.r+3.6))return false;const o={x,z,r,kind};obstacles.push(o);const key=`${Math.floor(x/CELL)},${Math.floor(z/CELL)}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(o);return true;}
 const clearings=[{x:entry.x-45,z:entry.z-45,r:26},{x:entry.x+120,z:entry.z-170,r:65},{x:entry.x-230,z:entry.z-240,r:80}];
 function land(x,z){const r=coast.promenadeAt(x);return !r||z<r.edge-5;}
 function open(x,z){return Math.hypot(x-entry.x,z-entry.z)<13||Math.hypot(x-exit.x,z-exit.z)<13||clearings.some(c=>Math.hypot(x-c.x,z-c.z)<c.r);}
 const groves=[];for(let i=0;i<32;i++)groves.push({x:entry.x+(random()-.5)*1600,z:entry.z-80-random()*850,rx:25+random()*65,rz:18+random()*65});
 let trees=0;
 for(let i=0;i<1500;i++){const g=groves[i%groves.length],a=random()*6.283,r=Math.sqrt(random()),x=g.x+Math.cos(a)*r*g.rx,z=g.z+Math.sin(a)*r*g.rz;
  if(!land(x,z)||open(x,z)||random()<.18)continue;
  const h=4+random()*7,rad=.16+random()*.27;if(!obstacle(x,z,rad,'tree'))continue;trees++;const y=surface(x,z)-.18,shape=Math.floor(random()*3),width=h*(shape===0?.22:shape===1?.36:.28);
  add(trunk,bark,x,y+h*.35,z,rad,h*.7,rad);
  const lobes=shape===0?3:4;for(let j=0;j<lobes;j++){const a=j*2.4+random(),spread=j===0?0:width*.65;add(canopies[(i+j)%2],greens[(i+j)%4],x+Math.cos(a)*spread,y+h*(.63+random()*.24),z+Math.sin(a)*spread,width*(.72+random()*.4),h*(shape===0?.32:.2)*( .8+random()*.5),width*(.65+random()*.5),(random()-.5)*.4,(random()-.5)*.45);}
 }
 // Scattered scrub and occasional boulders, separated enough to turn and reverse.
 for(let i=0;i<1000;i++){const x=entry.x+(random()-.5)*1200,z=entry.z-80+(random()-.5)*900;if(!land(x,z)||open(x,z))continue;const y=surface(x,z)-.18,s=.5+random()*1.4;add(canopies[0],greens[i%4],x,y+s*.35,z,s,s*.5,s*(.6+random()*.4));}
 for(let i=0;i<85;i++){const close=i<20,x=entry.x+(random()-.5)*(close?170:1200),z=entry.z-25-random()*(close?100:650),r=.65+random()*.65;if(!land(x,z)||open(x,z)||!obstacle(x,z,r,'rock'))continue;add(stone,rockMat,x,surface(x,z)-.18+r*.48,z,r,r*.85,r,(random()-.5)*.35,(random()-.5)*.35);}
 // Small non-colliding details are grouped into spatial tiles and culled nearby.
 for(let i=0;i<5200;i++){const x=entry.x+(random()-.5)*900,z=entry.z+30-random()*680;if(!land(x,z))continue;const y=surface(x,z)-.18,s=.45+random()*.85;
  if(i%17===0)add(stone,rockMat,x,y+.08,z,s*.25,s*.16,s*.32,0,0,true);
  else if(i%47===0)add(branch,bark,x,y+.09,z,.07,.9+random()*1.3,.055,1.43,.1,true);
  else if(i%5===0)add(fernGeo,fernMat,x,y,z,s,s,s,0,0,true);
  else add(grassGeo,grassMat,x,y,z,s,s*(.65+random()*.5),s,0,0,true);
 }
 for(const b of batches.values()){const m=new T.InstancedMesh(b.geo,b.material,b.matrices.length);b.matrices.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=!b.detail;m.receiveShadow=true;m.computeBoundingSphere();world.add(m);if(b.detail)detailMeshes.push({m,x:b.x,z:b.z});}
 function update(x,z){for(const d of detailMeshes)d.m.visible=Math.hypot(x-d.x,z-d.z)<260;}
 // Three overlapping circles approximate the taxi capsule. Sub-stepped integration
 // prevents tunnelling. Project out, preserve tangential movement, damp the impact.
 function resolve(x,z,yaw,state){let hit=null,impact=0;const fx=-Math.sin(yaw),fz=-Math.cos(yaw);for(let pass=0;pass<3;pass++)for(const o of neighbours(x,z,5))for(const along of [-1.25,0,1.25]){const px=x+fx*along,pz=z+fz*along,dx=px-o.x,dz=pz-o.z,d=Math.hypot(dx,dz),limit=o.r+.8;if(d>=limit)continue;const nx=d>.0001?dx/d:-fx,nz=d>.0001?dz/d:-fz,push=limit-d+.006;x+=nx*push;z+=nz*push;const incoming=state.vx*nx+state.vz*nz;if(incoming<0){impact=Math.max(impact,-incoming);state.vx-=incoming*1.12*nx;state.vz-=incoming*1.12*nz;state.vx*=.72;state.vz*=.72;state.yawRate*=.45;}hit=o;}
 return {x,z,hit,impact};}
 return {update,resolve,obstacles,trees,clearings};
}
