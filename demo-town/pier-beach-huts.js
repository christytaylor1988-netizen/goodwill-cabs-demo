// Two distinct blue-and-white hut rows on the Old Town beach beside the pier.
export function addPierBeachHuts(T,{scene,shared,convertPosition,batchScenery,coast}){
 const parent=new T.Group();parent.name='Pier beach huts · rows of 4 and 6';
 const mat=c=>shared(new T.MeshStandardMaterial({color:c,roughness:.95}));
 const blue=mat(0x267dab),white=mat(0xe6e6dc),roof=mat(0x7f8d89),dark=mat(0x454c49);
 const anchor=convertPosition(50.8533,.5724).x;
 for(const [row,count,offset] of [[0,4,50],[1,6,76]])for(let i=0;i<count;i++){
  const x=anchor+offset+i*2.95,r=coast.promenadeAt(x),z=r.prom+5.5;
  const g=new T.Group();g.name=`Blue hut ${row+1}-${i+1}`;
  const box=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o)};
  box(2.65,2.3,2.8,0,1.15,0,blue);
  for(let j=0;j<5;j++)box(2.67,.16,2.82,0,.22+j*.46,0,white);
  for(const x of [-1.31,1.31])for(const z of [-1.4,1.4])box(.085,2.35,.085,x,1.16,z,white);
  const verts=[],tri=(...ps)=>ps.forEach(p=>verts.push(...p));
  const a=[-1.42,2.31,-1.53],b=[1.42,2.31,-1.53],c=[1.42,2.31,1.53],d=[-1.42,2.31,1.53],e=[0,3.04,-1.53],f=[0,3.04,1.53];
  tri(a,f,e,a,d,f,b,f,c,b,e,f);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.computeVertexNormals();g.add(new T.Mesh(geo,roof));
  for(const z of [-1.41,1.41]){const v=new T.BufferGeometry();v.setAttribute('position',new T.Float32BufferAttribute([-1.31,2.3,z,1.31,2.3,z,0,2.98,z],3));v.computeVertexNormals();const m=new T.Mesh(v,blue);m.material.side=T.DoubleSide;g.add(m);box(2.66,.09,.06,0,2.34,z,white);for(const side of [-1,1]){const trim=new T.Mesh(new T.BoxGeometry(1.57,.085,.09),white);trim.position.set(side*.7,2.68,z);trim.rotation.z=-side*.46;g.add(trim);}}
  box(.045,2.05,.035,.62,1.15,-1.43,white);box(.055,.15,.055,.51,1.08,-1.46,dark);
  g.position.set(x,coast.beachHeight(x,z)+.10,z);g.rotation.y=r.yaw;
  // Bake each hut into the common parent before merging by shared material.
  g.updateMatrixWorld(true);for(const mesh of [...g.children]){mesh.applyMatrix4(g.matrix);parent.add(mesh);}
 }
 batchScenery({group:parent});parent.userData.rows=[4,6];scene.add(parent);return parent;
}
