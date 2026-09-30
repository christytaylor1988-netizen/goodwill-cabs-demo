// Fixed, editable promenade placements. Coordinates select a nearby road;
// the shelter is placed on its seaward side, subject to pavement clearance.
export const shelterSites=[
 {id:'marine-court',lat:50.85055,lon:.5541},
 {id:'warrior-seafront',lat:50.8513,lon:.5618},
 {id:'town-seafront',lat:50.85445,lon:.5844}
];
export function createShelters(THREE,api){
 const {shared,convertPosition,findNearestRoadPoint,roadWidthForType,terrainHeight,clearPavement,batchScenery}=api;
 const used=new Map(),skipped=new Map();
 const material=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.9}));
 const paint=material(0xb9c6bf),trim=material(0x65716e),wood=material(0x343735),stone=material(0x777970),rust=material(0x786855);
 const glass=shared(new THREE.MeshStandardMaterial({color:0xa7c4bd,transparent:true,opacity:.38,roughness:.45,depthWrite:false,side:THREE.DoubleSide}));
 const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#4a4d4d';ctx.fillRect(0,0,256,256);
 for(let row=0;row<16;row++)for(let col=-1;col<9;col++){const x=col*32+(row%2)*16,y=row*16;ctx.fillStyle=['#575957','#505454','#62635e'][(row*7+col+9)%3];ctx.fillRect(x+1,y+1,30,14);ctx.fillStyle='#343b3b';ctx.fillRect(x,y+14,32,2)}
 const tex=shared(new THREE.CanvasTexture(c));tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,1);const roofmat=shared(new THREE.MeshStandardMaterial({map:tex,roughness:1,side:THREE.DoubleSide}));
 function build(){
  const g=new THREE.Group();
  function box(w,h,d,x,y,z,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
  box(7,.16,2.4,0,.08,0,stone);
  for(const x of [-3.2,0,3.2]){box(.16,2.7,.16,x,1.5,0,paint);box(.26,.12,.26,x,.25,0,trim);box(.27,.18,.24,x,2.61,0,paint)}
  // Two glass bays, with three rows of panes and open, accessible bench fronts.
  for(const centre of [-1.6,1.6]){
   box(3.05,1.46,.025,centre,1.91,.09,glass);
   for(const x of [centre-1.53,centre-.51,centre+.51,centre+1.53])box(.055,1.5,.08,x,1.92,.06,trim);
   for(const y of [1.17,1.66,2.15,2.64])box(3.12,.05,.08,centre,y,.06,trim);
   for(let i=0;i<6;i++)box(2.94,.065,.065,centre,.73+i*.078,-.18,wood);
   for(let i=0;i<4;i++)box(2.94,.065,.115,centre,.69,-.3-i*.13,wood);
   for(const x of [centre-1.13,centre+1.13]){box(.10,.52,.5,x,.43,-.46,trim);box(.085,.25,.08,x,.84,-.65,trim);box(.09,.065,.58,x,.96,-.43,wood)}
  }
  // Matching glazed end panels and inward-facing return benches, under the existing roof.
  for(const side of [-1,1]){
   const x=side*3.2;
   for(const z of [-1,1]){box(.16,2.7,.16,x,1.5,z,paint);box(.26,.12,.26,x,.25,z,trim)}
   box(.10,.95,1.92,x,.68,0,paint);
   for(const y of [.28,.49,.70,.91,1.12])box(.12,.025,1.96,x,y,0,trim);
   box(.025,1.46,1.92,x,1.91,0,glass);
   for(const z of [-.98,0,.98])box(.08,1.5,.055,x,1.92,z,trim);
   for(const y of [1.17,1.66,2.15,2.64])box(.08,.05,2.02,x,y,0,trim);
   for(let i=0;i<6;i++)box(.065,.065,1.8,side*3.02,.73+i*.078,0,wood);
   for(let i=0;i<4;i++)box(.115,.065,1.8,side*(2.90-i*.13),.69,0,wood);
   for(const z of [-.68,.68])box(.50,.52,.10,side*2.74,.43,z,trim);
  }
  box(6.85,.18,2.15,0,2.72,0,paint);box(7.2,.09,2.55,0,2.86,0,trim);
  const v=[[-3.65,2.91,-1.36],[3.65,2.91,-1.36],[3.65,2.91,1.36],[-3.65,2.91,1.36],[-2.65,3.55,0],[2.65,3.55,0]];
  const indices=[0,4,5,0,5,1,1,5,2,2,5,4,2,4,3,3,4,0],positions=[],uv=[];
  for(const i of indices){positions.push(...v[i]);uv.push((v[i][0]+3.65)/7.3,(v[i][2]+1.36)/2.72)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();const roof=new THREE.Mesh(geo,roofmat);roof.castShadow=true;g.add(roof);
  box(5.5,.08,.13,0,3.56,0,trim);
  for(const x of [-2.67,2.67]){const finial=new THREE.Mesh(new THREE.ConeGeometry(.09,.46,6),trim);finial.position.set(x,3.83,0);g.add(finial)}
  // Curved corner brackets, formed by short beams rather than dense geometry.
  for(const x of [-3.2,0,3.2])for(const side of [-1,1])for(let i=0;i<3;i++){const b=box(.09,.16,.12,x+side*(.13+i*.1),2.44+i*.075,0,paint);b.rotation.z=-side*.65}
  for(let i=0;i<12;i++)box(.09,.025,.012,-3.1+i*.53,2.73,.108,rust);
  return g;
 }
 function finish(tile){
  for(const site of shelterSites){const r=findNearestRoadPoint(convertPosition(site.lat,site.lon),true);if(!r)continue;
   const dx=r.segment.b.x-r.segment.a.x,dz=r.segment.b.z-r.segment.a.z,len=Math.hypot(dx,dz);let nx=-dz/len,nz=dx/len;if(nz<0){nx=-nx;nz=-nz}
   const off=roadWidthForType(r.segment.type)/2+(site.offset||4.4),x=r.point.x+nx*off,z=r.point.z+nz*off;
   if(Math.floor(x/450)!==tile.x||Math.floor(z/450)!==tile.z)continue;
   const samples=[];for(const u of [-3.7,0,3.7])for(const v of [-1.4,0,1.4])samples.push({x:x+nz*u+nx*v,z:z-nx*u+nz*v});
   if(samples.some(p=>!clearPavement(p.x,p.z))){skipped.set(site.id,'Not enough clear promenade');continue}
   const heights=samples.map(p=>terrainHeight(p.x,p.z));if(Math.max(...heights)-Math.min(...heights)>.65){skipped.set(site.id,'Uneven promenade');continue}
   const g=build();g.name='Seaside shelter · '+site.id;g.position.set(x,Math.max(...heights)+.025,z);g.rotation.y=Math.atan2(nx,nz);
   // Bake the static pieces together within this tile, sharing all materials.
   g.updateMatrixWorld(true);batchScenery({group:g});g.position.set(0,0,0);g.rotation.set(0,0,0);tile.group.add(g);used.set(site.id,{x,z,road:r.segment.roadName});skipped.delete(site.id);
  }
 }
 return {finish,used,skipped};
}
