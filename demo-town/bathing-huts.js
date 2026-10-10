// Only the mapped hut row beside the Old Bathing Pool Site.
export function createBathingHuts(THREE,{shared,objectBox,polygonShape}){
 const walls=[0x075bff,0x00b94f,0xf52032].map(color=>shared(new THREE.MeshStandardMaterial({color,roughness:.85})));
 const roof=shared(new THREE.MeshStandardMaterial({color:0x535b60,roughness:1,side:THREE.DoubleSide}));
 const indices=new Map();
 return {
  prepare(data){
   const row=data.buildings.filter(f=>f.tags?.building==='beach_hut'&&f.geometry?.every(p=>p.lon>.5369&&p.lon<.5385&&p.lat>50.8501&&p.lat<50.8503));
   row.sort((a,b)=>a.geometry[0].lon-b.geometry[0].lon).forEach((f,i)=>indices.set(f.id,i));
  },
  build(poly,id,tile){
   if(!indices.has(id))return false;
   const mat=walls[indices.get(id)%3],points=poly.outer;
   const geo=new THREE.ExtrudeGeometry(polygonShape(poly),{depth:2.05,bevelEnabled:false});geo.rotateX(Math.PI/2);
   const body=new THREE.Mesh(geo,mat);body.position.y=2.05;body.castShadow=body.receiveShadow=true;tile.group.add(body);
   const xs=points.map(p=>p.x),zs=points.map(p=>p.y),x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
   const w=Math.max(...xs)-Math.min(...xs),d=Math.max(...zs)-Math.min(...zs),h=2.05,rise=.5;
   // Shallow pitched roof, with coloured gable ends and a simple door seam.
   const verts=[x-w/2-.12,h,z-d/2-.12, x,h+rise,z-d/2-.12, x,h+rise,z+d/2+.12, x-w/2-.12,h,z-d/2-.12, x,h+rise,z+d/2+.12, x-w/2-.12,h,z+d/2+.12,
    x,h+rise,z-d/2-.12, x+w/2+.12,h,z-d/2-.12, x+w/2+.12,h,z+d/2+.12, x,h+rise,z-d/2-.12, x+w/2+.12,h,z+d/2+.12, x,h+rise,z+d/2+.12];
   const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));rg.computeVertexNormals();const top=new THREE.Mesh(rg,roof);top.castShadow=true;tile.group.add(top);
   for(const end of [-1,1]){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();const gm=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat);gm.material=mat;gm.position.set(x,h,z+end*d/2);gm.rotation.y=end<0?Math.PI:0;tile.group.add(gm);}
   objectBox(tile.group,.035,1.65,.025,x,.9,z-d/2-.025,roof);
   return true;
  }
 };
}
