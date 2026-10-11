// Low-poly finishes on existing footprints; merged by the normal scenery batcher.
export function finishRoof(T,{poly,height,seed,tags,tile,roof,trim,chimney,box,inside}){
 const points=poly.outer.filter((p,i,a)=>!i||p.distanceTo(a[i-1])>.04).map(p=>p.clone());
 if(points.length>2&&points[0].distanceTo(points[points.length-1])<.04)points.pop();
 // OSM terraces often contain extra straight-edge vertices; simplify only the roof outline.
 for(let changed=true;changed&&points.length>4;){changed=false;for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length],u=b.clone().sub(a),v=c.clone().sub(b);if(Math.abs(u.x*v.y-u.y*v.x)<.02*u.length()*v.length()&&u.dot(v)>0){points.splice(i,1);changed=true;break;}}}
 let pitched=false,rise=0;
 if(points.length===4&&!poly.holes.length&&height<24&&tags['roof:shape']!=='flat'){
  let [a,b,c,d]=points;const ab=b.clone().sub(a),bc=c.clone().sub(b),cd=d.clone().sub(c),da=a.clone().sub(d);
  if(ab.length()>3&&bc.length()>3&&ab.length()<45&&bc.length()<45&&Math.abs(ab.clone().normalize().dot(bc.clone().normalize()))<.14&&Math.abs(cd.length()-ab.length())<1&&Math.abs(da.length()-bc.length())<1){
   if(ab.length()<bc.length())[a,b,c,d]=[b,c,d,a];
   const r1=a.clone().add(d).multiplyScalar(.5),r2=b.clone().add(c).multiplyScalar(.5);rise=Math.min(height>14?1.65:2.3,a.distanceTo(d)*.23);
   const pos=[],tri=(p,y,q,z,r,w)=>pos.push(p.x,y,p.y,q.x,z,q.y,r.x,w,r.y);
   tri(a,height,b,height,r2,height+rise);tri(a,height,r2,height+rise,r1,height+rise);
   tri(d,height,r1,height+rise,r2,height+rise);tri(d,height,r2,height+rise,c,height);
   tri(a,height,r1,height+rise,d,height);tri(b,height,c,height,r2,height+rise);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.computeVertexNormals();const mesh=new T.Mesh(geo,roof);mesh.material=roof;mesh.castShadow=true;mesh.receiveShadow=true;mesh.name='Shallow terrace roof';tile.group.add(mesh);pitched=true;
  }
 }
 // Coping follows the true outline, including irregular and courtyard buildings.
 for(const ring of [poly.outer,...poly.holes])for(let i=0;i<ring.length;i++){
  const a=ring[i],b=ring[(i+1)%ring.length],len=a.distanceTo(b);if(len<.05)continue;
  const x=(a.x+b.x)/2,z=(a.y+b.y)/2,angle=Math.atan2(-(b.y-a.y),b.x-a.x);
  const h=pitched?.18:.38;
  box(tile,len+.04,h,.20,x,height+h/2,z,angle,trim);
  if(!pitched)box(tile,len+.08,.10,.27,x,height+h+.045,z,angle,trim);
 }
 if(height<5||height>26)return;
 // Sparse stacks: fixed seed variation, set inside the footprint, never on a courtyard.
 const edges=points.map((a,i)=>({a,b:points[(i+1)%points.length]})).sort((a,b)=>b.a.distanceTo(b.b)-a.a.distanceTo(a.b));
 const edge=edges[0];if(!edge)return;const len=edge.a.distanceTo(edge.b),dx=(edge.b.x-edge.a.x)/len,dz=(edge.b.y-edge.a.y)/len;
 const n=Math.min(4,Math.max(1,Math.floor(len/13))),offset=.9;
 for(let i=0;i<n;i++){
  const t=(i+.35+(seed%5)*.06)/n,bx=edge.a.x+(edge.b.x-edge.a.x)*t,bz=edge.a.y+(edge.b.y-edge.a.y)*t;
  let x=bx-dz*offset,z=bz+dx*offset;if(!inside(x,z,poly)){x=bx+dz*offset;z=bz-dx*offset;}if(!inside(x,z,poly))continue;
  const h=1.15+(seed%3)*.16,base=height+.15,angle=Math.atan2(-dz,dx);
  box(tile,.72,h,.62,x,base+h/2,z,angle,chimney);box(tile,.86,.13,.75,x,base+h+.04,z,angle,trim);
  for(const side of [-1,1])box(tile,.18,.36,.18,x+dx*side*.21,base+h+.27,z+dz*side*.21,angle,chimney);
 }
}
