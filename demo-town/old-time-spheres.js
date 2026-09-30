// A small shared-geometry collection, scoped to Old Time's landscape group.
export function createOldTimeSpheres(T,{world,roads,entry,exit,surface,award}){
 const junctions=[...new Map(roads.flatMap(s=>[s.na,s.nb]).filter(n=>n?.links?.length>2).map(n=>[n.key,n])).values()];
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const candidates=roads.filter(s=>s.length>=90&&distance({x:(s.a.x+s.b.x)/2,z:(s.a.z+s.b.z)/2},entry)<1200).sort((a,b)=>distance(a.a,entry)-distance(b.a,entry));
 const rows=[];for(const s of candidates){const dx=(s.b.x-s.a.x)/s.length,dz=(s.b.z-s.a.z)/s.length,mid={x:(s.a.x+s.b.x)/2,z:(s.a.z+s.b.z)/2};if(rows.some(r=>distance(r[3],mid)<140))continue;
 const points=Array.from({length:6},(_,i)=>({x:mid.x+dx*(i-2.5)*10,z:mid.z+dz*(i-2.5)*10}));
 if(points.some(p=>distance(p,entry)<15||distance(p,exit)<15||junctions.some(j=>distance(j,p)<20)))continue;
 if(distance(points[5],entry)<distance(points[0],entry))points.reverse();rows.push(points);if(rows.length===5)break;}
 const geometry=new T.SphereGeometry(.65,10,8),material=new T.MeshBasicMaterial({color:0xff2525}),items=[];
 for(const [row,points] of rows.entries())for(const p of points){const mesh=new T.Mesh(geometry,material);mesh.position.set(p.x,surface(p.x,p.z)+1.3,p.z);world.add(mesh);items.push({...p,row,mesh,value:25,collected:false});}
 const megas=[];for(const row of [1,3]){const points=rows[row];if(!points)continue;const p={x:(points[2].x+points[3].x)/2,z:(points[2].z+points[3].z)/2},mesh=new T.Mesh(geometry,material);mesh.scale.setScalar(32);mesh.position.set(p.x,surface(p.x,p.z)+22,p.z);world.add(mesh);const item={...p,row,mesh,value:250,collected:false};items.push(item);megas.push(item);}
 let count=0,earned=0;function reset(){count=0;earned=0;for(const item of items){item.collected=false;item.mesh.visible=true;}}
 function update(previous,position){const dx=position.x-previous.x,dz=position.z-previous.z,l2=dx*dx+dz*dz;if(l2>900)return;let collected=0;for(const item of items){if(item.collected)continue;const t=Math.max(0,Math.min(1,((item.x-previous.x)*dx+(item.z-previous.z)*dz)/(l2||1)));if(Math.hypot(previous.x+t*dx-item.x,previous.z+t*dz-item.z)>2.3)continue;item.collected=true;item.mesh.visible=false;count++;collected+=item.value;}if(collected){earned+=collected;award(collected);}}
 return {rows,megas,reset,update,get earned(){return earned},get count(){return count},get total(){return items.length}};
}
