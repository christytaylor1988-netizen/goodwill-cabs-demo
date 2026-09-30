import {marineCourtShops} from './marine-court-data.js';
// One continuous mapped shell; all decorative geometry stays within its footprint.
export function buildMarineCourt(THREE,group,poly,{shared,terrainHeight,inPolygon,polygonShape,objectBox,textSign}){
 group.position.set(0,0,0);
 let seed=1937;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 function surface(colour,brick=false){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=colour;ctx.fillRect(0,0,256,256);
  if(brick){ctx.strokeStyle='#c1af8b';ctx.lineWidth=1;for(let y=0;y<256;y+=12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();for(let x=(y%24?14:0);x<256;x+=28){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+12);ctx.stroke()}}}
  for(let i=0;i<950;i++){ctx.fillStyle=i%3?'rgba(80,72,53,.045)':'rgba(238,229,207,.15)';ctx.fillRect(random()*256,random()*256,random()*9+1,random()*5+1)}
  const t=shared(new THREE.CanvasTexture(c));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
  return shared(new THREE.MeshStandardMaterial({map:t,roughness:.94,side:THREE.DoubleSide}));
 }
 const white=surface('#ffffff'),brick=surface('#947450',true),dark=shared(new THREE.MeshStandardMaterial({color:0x364c55,roughness:.45})),blue=shared(new THREE.MeshStandardMaterial({color:0x3978a6,roughness:.6})),trim=shared(new THREE.MeshStandardMaterial({color:0xffffff,roughness:.86})),roof=shared(new THREE.MeshStandardMaterial({color:0x737671,roughness:.94,side:THREE.DoubleSide})),stain=shared(new THREE.MeshStandardMaterial({color:0xb6af95,roughness:1}));
 const source=poly.outer.slice();if(source[0].distanceTo(source.at(-1))<.01)source.pop();
 const minX=Math.min(...source.map(p=>p.x)),maxX=Math.max(...source.map(p=>p.x)),cx=(minX+maxX)/2;
 // Front and rear slope slightly with the street: retain that orientation and curved east end.
 const westFront=source.reduce((a,p)=>p.y>a.y?p:a),eastFront=source[7];
 const slope=(eastFront.y-westFront.y)/(eastFront.x-westFront.x),cz=source.reduce((s,p)=>s+p.y-slope*(p.x-cx),0)/source.length;
 const local=p=>({x:p.x-cx,z:p.y-cz-slope*(p.x-cx)}),world=(x,z)=>new THREE.Vector2(cx+x,cz+z+slope*x);
 const ring=source.map(p=>{const q=local(p);return world(q.x*.985,q.z*.86)});
 const signedShops=new Set();
 let groundMin=Infinity,groundMax=-Infinity;
 for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],n=Math.ceil(a.distanceTo(b)/2);for(let j=0;j<=n;j++){const p=a.clone().lerp(b,j/n),y=terrainHeight(p.x,p.y);groundMin=Math.min(groundMin,y);groundMax=Math.max(groundMax,y)}}
 const podiumTop=groundMax+9.2,storey=3.1;
 function edge(a,b){const dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz);let nx=-dz/len,nz=dx/len;const mx=(a.x+b.x)/2,mz=(a.y+b.y)/2;if(inPolygon(mx+nx*.2,mz+nz*.2,{outer:ring,holes:[]})){nx=-nx;nz=-nz}return {dx:dx/len,dz:dz/len,len,nx,nz,angle:Math.atan2(nx,nz)}}
 function wall(a,b,bottom,top,m){const e=edge(a,b),n=Math.max(1,Math.ceil(e.len/2)),positions=[],uv=[];for(let j=0;j<n;j++){const u=j/n,v=(j+1)/n,ax=a.x+(b.x-a.x)*u,az=a.y+(b.y-a.y)*u,bx=a.x+(b.x-a.x)*v,bz=a.y+(b.y-a.y)*v,ya=typeof bottom==='function'?bottom(ax,az):bottom,yb=typeof bottom==='function'?bottom(bx,bz):bottom;positions.push(ax,ya,az,bx,yb,bz,bx,top,bz,ax,ya,az,bx,top,bz,ax,top,az);uv.push(u*e.len/4,ya/4,v*e.len/4,yb/4,v*e.len/4,top/4,u*e.len/4,ya/4,v*e.len/4,top/4,u*e.len/4,top/4)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();group.add(new THREE.Mesh(geo,m))}
 function cap(r,y){const geo=new THREE.ShapeGeometry(polygonShape({outer:r,holes:[]}));geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,-pos.getZ(i));geo.translate(0,y,0);geo.computeVertexNormals();group.add(new THREE.Mesh(geo,roof))}
 function panel(a,b,t,w,h,y,m,offset=.08,depth=.08){const e=edge(a,b),x=a.x+(b.x-a.x)*t+e.nx*offset,z=a.y+(b.y-a.y)*t+e.nz*offset;return objectBox(group,w,h,depth,x,y,z,m,e.angle)}
 function window(a,b,t,w,h,y,blueSection=false){panel(a,b,t,w+.18,h+.18,y,trim,.10);panel(a,b,t,w,h,y,dark,.16);if(blueSection)panel(a,b,t,w,h*.34,y,blue,.22);panel(a,b,t,.065,h,y,trim,.27);panel(a,b,t,w,.065,y,trim,.27);if(blueSection)for(const f of [-.32,.32])panel(a,b,t,w,.065,y+h*f,trim,.27)}
 // Ground skirt samples the terrain every two metres: no single-point floating anchor.
 for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],e=edge(a,b);wall(a,b,(x,z)=>terrainHeight(x,z)-.65,podiumTop,e.nz<-.4?brick:white);
  const front=e.nz>.4,back=e.nz<-.4,n=Math.max(1,Math.floor(e.len/(front?5.3:4.8)));
  for(let j=0;j<n;j++){const t=(j+.5)/n,x=a.x+(b.x-a.x)*t,z=a.y+(b.y-a.y)*t,gy=terrainHeight(x,z),bw=Math.min(3.5,e.len/n-.45);
   if(front||e.nx>.6){if(x>maxX-27){const top=podiumTop-.75,bottom=gy+4.1;if(top-bottom>2)window(a,b,t,bw,top-bottom,(top+bottom)/2,true)}else{for(let y=podiumTop-1.8;y>gy+4.2;y-=3.1)window(a,b,t,Math.min(2.7,bw),1.5,y)}}
   if(back){for(let y=podiumTop-1.5;y>gy+1.2;y-=3.1)window(a,b,t,Math.min(2.2,bw),1.5,y)}
  }
  if(back&&e.len>12){for(let y=podiumTop-3.1;y>groundMin+2;y-=3.1){panel(a,b,.5,e.len,.16,y,trim,.28,.55);panel(a,b,.5,e.len,.72,y+.43,white,.48,.10)}for(const t of [.18,.66]){const x=a.x+(b.x-a.x)*t,z=a.y+(b.y-a.y)*t,lo=terrainHeight(x,z);panel(a,b,t,2.2,podiumTop-lo,(podiumTop+lo)/2,dark,.56);for(const side of [-1,1])panel(a,b,t+side*1.2/e.len,.17,podiumTop-lo,(podiumTop+lo)/2,trim,.65);for(let y=podiumTop-3.1;y>lo;y-=3.1)panel(a,b,t,2.35,.1,y,trim,.65)}}
  if(front){const count=Math.max(1,Math.floor(e.len/9));for(let j=0;j<count;j++){const t=(j+.5)/count,x=a.x+(b.x-a.x)*t,z=a.y+(b.y-a.y)*t,gy=terrainHeight(x,z),w=e.len/count-.3,idx=Math.max(0,Math.min(marineCourtShops.length-1,Math.floor((x-minX)/(maxX-minX)*marineCourtShops.length))),shop=marineCourtShops[idx];panel(a,b,t,w,2.55,gy+1.4,dark,.14);for(const f of [-.47,0,.47])panel(a,b,t+f*w/e.len,.11,2.65,gy+1.4,trim,.23);panel(a,b,t,w,.22,gy+.2,trim,.22);panel(a,b,t,w,.18,gy+3.25,blue,.35,.55);if(signedShops.has(idx))continue;signedShops.add(idx);const sign=textSign(group,shop.name,w-.2,.52,x+e.nx*.24,gy+2.93,z+e.nz*.24,shop.colour,'#eee9d7',e.angle);sign.userData.fictionalShop=idx;}}
 }
 cap(ring,podiumTop);
 // Upper tower is recessed inside the podium. Front white; rear brick with long balcony bands.
 for(let floor=0;floor<9;floor++){
  const setback=Math.max(0,floor-6),r=ring.map(p=>{const q=local(p);return world(q.x*(.965-setback*.065)-setback*2,q.z*.70)}),bottom=podiumTop+floor*storey,top=bottom+storey;
  for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],e=edge(a,b),back=e.nz<-.4,front=e.nz>.4;wall(a,b,bottom,top,back?brick:white);
   const n=Math.max(1,Math.floor(e.len/4.4));for(let j=0;j<n;j++)window(a,b,(j+.5)/n,Math.min(2.65,e.len/n-.5),1.45,bottom+1.95);
   // Return balconies follow the curved end segments continuously, meeting both long façades.
   if(back||front||e.nx>.45){panel(a,b,.5,e.len+.08,.17,bottom+.12,trim,.40,.95);panel(a,b,.5,e.len+.08,.88,bottom+.68,white,.86,.12);if(back&&e.len>20){for(let t=.14;t<1;t+=.31){panel(a,b,t,2.3,storey,bottom+storey/2,dark,1.0,.12);panel(a,b,t-.014,.16,storey,bottom+storey/2,trim,1.08);panel(a,b,t+.014,.16,storey,bottom+storey/2,trim,1.08);panel(a,b,t,2.4,.10,bottom+.2,trim,1.08)}}}
   // Occasional muted weathering drips, strongest on the lower visible balcony bands.
   if(floor<4&&e.len>15)for(let t=.09;t<1;t+=.19)panel(a,b,t,.08,.42,bottom+.59,stain,.935,.015);
  }cap(r,top);
 }
 // Building name belongs to the seafront only. Rear has residential glazing, no shop labels.
 let face=null;for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],e=edge(a,b);if(e.nz>.5&&(!face||e.len>face.e.len))face={a,b,e}}
 if(face){const {a,b,e}=face;textSign(group,'MARINE COURT',18,.6,(a.x+b.x)/2+e.nx*.25,podiumTop-.35,(a.y+b.y)/2+e.nz*.25,'#ffffff','#425b63',e.angle)}
 group.userData.marineCourt={groundMin,groundMax,podiumTop,roof:podiumTop+9*storey,shops:marineCourtShops.length,footprint:'OSM 183832482',ring:ring.map(p=>({x:p.x,z:p.y}))};
}
