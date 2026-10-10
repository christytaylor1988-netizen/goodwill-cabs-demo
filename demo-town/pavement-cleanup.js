// Fill mapped hard surfaces and short, clear frontage gaps; never recolour base terrain.
export function addPavementCleanup(THREE,{tile,cell,featurePolygons,convertPosition,findNearestRoadPoint,roadWidthForType,inPolygon,groundPatch,material,coast,cellSize}){
 const protectedPolys=cell.land.filter(f=>{const t=f.tags||{};return ['grass','meadow','forest','allotments','cemetery'].includes(t.landuse)||['park','garden','recreation_ground','pitch'].includes(t.leisure)||['wood','scrub','water','beach','sand'].includes(t.natural)||t.waterway;}).flatMap(featurePolygons);
 const buildings=cell.buildings.flatMap(featurePolygons);
 const green=(x,z)=>protectedPolys.some(p=>inPolygon(x,z,p));
 const seaward=(x,z)=>{const r=coast?.promenadeAt(x);return r&&z>r.edge;};
 const paths=[];tile.hardPaving=[];
 function add(poly,explicit=false){const c=poly.outer.reduce((a,p)=>a.add(p),new THREE.Vector2()).multiplyScalar(1/poly.outer.length);if(Math.floor(c.x/cellSize)!==tile.x||Math.floor(c.y/cellSize)!==tile.z)return;
  if(seaward(c.x,c.y))return;
  if(!explicit&&[c,...poly.outer].some(p=>green(p.x,p.y)||buildings.some(b=>inPolygon(p.x,p.y,b))))return;
  const mesh=groundPatch(poly,material,.045),p=mesh.geometry.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/2.24,p.getZ(i)/2.24);mesh.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));tile.group.add(mesh);tile.hardPaving.push(poly);
 }
 for(const f of cell.paths){const t=f.tags||{},nodes=f.geometry;if(!nodes||nodes.length<2||t.tunnel||t.bridge||t.highway==='steps'||['unpaved','grass','ground','dirt','earth','sand','gravel'].includes(t.surface))continue;
  const closed=nodes.length>3&&nodes[0].lat===nodes.at(-1).lat&&nodes[0].lon===nodes.at(-1).lon;
  if(closed){if(t.highway==='pedestrian'||['paved','paving_stones','asphalt','concrete'].includes(t.surface))for(const p of featurePolygons(f))add(p,true);continue;}
  if(!['footway','pedestrian','path'].includes(t.highway))continue;
  const ps=nodes.map(n=>convertPosition(n.lat,n.lon));
  for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],len=Math.hypot(b.x-a.x,b.z-a.z);if(len<.1)continue;
   const n=Math.ceil(len/5),w=t.highway==='pedestrian'?3:1.8;
   for(let j=0;j<n;j++){const u=j/n,v=(j+1)/n,x=a.x+(b.x-a.x)*(u+v)/2,z=a.z+(b.z-a.z)*(u+v)/2;
    // Unsurfaced paths through green land retain their original treatment.
    if(green(x,z)&&!t.surface&&t.highway!=='pedestrian')continue;
    if(t.highway==='path'&&!t.surface)continue;
    const nx=-(b.z-a.z)/len*w/2,nz=(b.x-a.x)/len*w/2;
    add({outer:[[u,1],[v,1],[v,-1],[u,-1]].map(([q,s])=>new THREE.Vector2(a.x+(b.x-a.x)*q+nx*s,a.z+(b.z-a.z)*q+nz*s)),holes:[]},true);
   }
  }
 }
 for(const f of cell.buildings){const tag=f.tags||{};if(['detached','semidetached_house','farm','farm_auxiliary','shed','garage','garages','greenhouse'].includes(tag.building))continue;
  for(const poly of featurePolygons(f))for(let i=0;i<poly.outer.length;i++){
   const a=poly.outer[i],b=poly.outer[(i+1)%poly.outer.length],len=a.distanceTo(b);if(len<2)continue;
   const n=Math.ceil(len/3);
   for(let j=0;j<n;j++){const u=j/n,v=(j+1)/n,mx=a.x+(b.x-a.x)*(u+v)/2,mz=a.y+(b.y-a.y)*(u+v)/2,r=findNearestRoadPoint({x:mx,z:mz},true);if(!r||!['residential','tertiary','secondary','primary','trunk','unclassified','living_street','pedestrian'].includes(r.segment.type))continue;
    const dx=r.point.x-mx,dz=r.point.z-mz,d=Math.hypot(dx,dz),edge=roadWidthForType(r.segment.type)/2+1.25,gap=d-edge;
    if(gap<.15||gap>12||Math.abs(((b.x-a.x)*dx+(b.y-a.y)*dz)/(len*d))>.4)continue;
    const nx=dx/d,nz=dz/d;if(inPolygon(mx+nx*.4,mz+nz*.4,poly))continue;
    const p=new THREE.Vector2(a.x+(b.x-a.x)*u+nx*.12,a.y+(b.y-a.y)*u+nz*.12),q=new THREE.Vector2(a.x+(b.x-a.x)*v+nx*.12,a.y+(b.y-a.y)*v+nz*.12);
    add({outer:[p,q,new THREE.Vector2(q.x+nx*gap,q.y+nz*gap),new THREE.Vector2(p.x+nx*gap,p.y+nz*gap)],holes:[]});
   }
  }
 }
}
