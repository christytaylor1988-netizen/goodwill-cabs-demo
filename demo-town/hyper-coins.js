// One instanced mesh, shared geometry/material, no per-coin lights or physics bodies.
export function createHyperCoins(T,{taxi,terrainHeight,roads}){
 const capacity=128,points=[],dummy=new T.Object3D(),previous=taxi.position.clone();let collected=0,time=0;
 const geometry=new T.CylinderGeometry(.65,.65,.16,12);geometry.rotateX(Math.PI/2);
 const mesh=new T.InstancedMesh(geometry,new T.MeshBasicMaterial({color:0xffd45c,toneMapped:false}),capacity);
 mesh.name='Hyper arcade coins';mesh.visible=false;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
 function write(i){const p=points[i];dummy.position.set(p.x,p.y+Math.sin(time*2+i)*.12,p.z);dummy.rotation.set(0,time*1.5+i*.7,0);dummy.scale.setScalar(p.taken?0:1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}
 const roadCandidates=roads.filter(s=>s.length>12).map((s,i)=>({s,i,x:(s.a.x+s.b.x)/2,z:(s.a.z+s.b.z)/2}));
 function reset(origin){
  points.length=0;collected=0;time=0;previous.copy(taxi.position);
  const candidates=roadCandidates.filter(p=>{const d=Math.hypot(p.x-origin.x,p.z-origin.z);return d>35&&d<1250;});
  // Stable scattered layout, with small strings of coins along existing road directions.
  candidates.sort((a,b)=>((a.i*7919)%104729)-((b.i*7919)%104729));
  for(const p of candidates){if(points.length>=capacity)break;if(points.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<24))continue;
   const s=p.s,dx=(s.b.x-s.a.x)/s.length,dz=(s.b.z-s.a.z)/s.length;
   for(const offset of [-4,0,4]){if(points.length>=capacity)break;const x=p.x+dx*offset,z=p.z+dz*offset;points.push({x,z,y:terrainHeight(x,z)+1.15,taken:false});}
  }
  mesh.count=points.length;for(let i=0;i<points.length;i++)write(i);mesh.instanceMatrix.needsUpdate=true;
 }
 function update(dt){time+=dt;const dx=taxi.position.x-previous.x,dz=taxi.position.z-previous.z,l2=dx*dx+dz*dz;
  for(let i=0;i<points.length;i++){const p=points[i];if(!p.taken&&l2<900){const t=T.MathUtils.clamp(((p.x-previous.x)*dx+(p.z-previous.z)*dz)/(l2||1),0,1);if(Math.hypot(p.x-previous.x-t*dx,p.z-previous.z-t*dz)<2.1){p.taken=true;collected++;}}write(i);}
  mesh.instanceMatrix.needsUpdate=true;previous.copy(taxi.position);
 }
 return {mesh,reset,update,get collected(){return collected},get remaining(){return points.filter(p=>!p.taken).length}};
}
