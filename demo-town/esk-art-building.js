// The user's ESK painting translated into stepped volumes on its mapped footprint.
export function buildEskArtwork(THREE,{poly,tile,shared,objectBox,textSign}){
 const g=tile.group,ring=poly.outer,minX=Math.min(...ring.map(p=>p.x)),maxX=Math.max(...ring.map(p=>p.x));
 // South-facing shopping frontage; the irregular rear service footprint is retained.
 const left=ring[10].x,right=maxX,W=right-left,cut=left+W*.55,end=left+W*.87;
 function painted(base,kind){const c=document.createElement('canvas');c.width=c.height=256;const k=c.getContext('2d');k.fillStyle=base;k.fillRect(0,0,256,256);for(let i=0;i<170;i++){k.fillStyle=i%2?'#e9d9bd16':'#251d1914';k.fillRect((i*67)%256,(i*31)%256,12+i%49,1+i%3);}if(kind==='brick'){k.strokeStyle='#542d2424';for(let y=0;y<256;y+=18){k.beginPath();k.moveTo(0,y);k.lineTo(256,y);k.stroke();}}
 const t=shared(new THREE.CanvasTexture(c));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return shared(new THREE.MeshStandardMaterial({map:t,roughness:1,side:THREE.DoubleSide}));}
 const brick=painted('#914d34','brick'),white=painted('#e5e2d6'),wood=painted('#9f9582'),pale=painted('#cecfbd'),green=painted('#17552f'),frame=painted('#47645c'),glass=painted('#142729'),roof=painted('#574c42');
 function clip(points,x,greater){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ai=greater?a.x>=x:a.x<=x,bi=greater?b.x>=x:b.x<=x;if(ai)out.push(a.clone());if(ai!==bi){const t=(x-a.x)/(b.x-a.x);out.push(new THREE.Vector2(x,a.y+(b.y-a.y)*t));}}return out;}
 function volume(lo,hi,bottom,height,mat){const pts=clip(clip(ring,lo,true),hi,false);if(pts.length<3)return;const geo=new THREE.ExtrudeGeometry(new THREE.Shape(pts),{depth:height,bevelEnabled:false});geo.rotateX(Math.PI/2);const m=new THREE.Mesh(geo,[roof,mat]);m.position.y=bottom+height;m.castShadow=true;g.add(m);}
 volume(minX,cut,0,8.0,brick);volume(cut,end,0,7.6,brick);volume(end,right,0,6.25,pale);
 function front(x){const zs=[];for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];if(x>=Math.min(a.x,b.x)&&x<=Math.max(a.x,b.x)&&Math.abs(a.x-b.x)>.0001)zs.push(a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x));}return Math.max(...zs);}
 const box=(w,h,d,x,y,z,m)=>objectBox(g,w,h,d,x,y,z,m);
 // White upper structure has actual depth, recessed dark openings and an uneven roof silhouette.
 volume(minX,cut,8,1.8,white);
 const mainW=cut-left;
 for(let i=0;i<5;i++){const x=left+mainW*(i+.5)/5,z=front(x);box(mainW/5-.32,1.0,.12,x,8.95,z+.05,glass);box(mainW/5,.14,.35,x,9.82,z+.08,white);}
 // Build the frontage in narrow bays following the existing stepped southern outline.
 const bays=24;
 for(let i=0;i<bays;i++){const x=left+W*(i+.5)/bays,w=W/bays+.025,z=front(x);if(!Number.isFinite(z))continue;
  if(x<cut){
   box(w,.9,1.35,x,3.9,z+.53,white);box(w,.16,1.50,x,3.4,z+.59,roof);
   box(w,2.9,.10,x,1.65,z+.08,x<left+W*.055?green:glass);
   box(w,.55,.12,x,.5,z+.18,green);
   if(i%2===0){box(.14,2.95,.26,x,1.65,z+.25,frame);box(w*.64,.95,.10,x,6.7,z+.07,glass);}
   box(w,.17,.26,x,3.12,z+.2,frame);
  }else if(x<end){box(w,2.8,.18,x,1.6,z+.13,wood);box(w,.21,.3,x,3.12,z+.18,roof);for(let j=0;j<4;j++)box(.035,2.65,.07,x-w/2+(j+.5)*w/4,1.6,z+.26,j%2?roof:pale);}
  else for(let y=.18;y<6.25;y+=.27)box(w,.035,.08,x,y,z+.12,roof);
 }
 // Green tiled left pier with visible grout rather than a flat colour patch.
 const tileX=left+W*.026,tileZ=front(tileX);for(let y=.25;y<3.2;y+=.31)box(W*.055,.024,.045,tileX,y,tileZ+.17,white);for(let i=0;i<4;i++)box(.025,3,.045,left+i*W*.055/3,1.65,tileZ+.17,white);
 // Recessed entrance, handle, and colourful poster panels behind the glazing.
 const doorX=left+W*.095,dz=front(doorX);box(1.15,2.75,.2,doorX,1.5,dz+.18,frame);box(.90,2.5,.05,doorX,1.5,dz+.295,glass);box(.045,.5,.055,doorX+.3,1.45,dz+.34,white);
 const colours=['#dec661','#4395ab','#ad75ad','#d54979','#d997a6'];for(let i=0;i<7;i++){const x=left+W*(.17+i*.049),z=front(x);const c=document.createElement('canvas');c.width=96;c.height=160;const k=c.getContext('2d');k.fillStyle=colours[i%5];k.fillRect(0,0,96,160);for(let j=0;j<20;j++){k.fillStyle=j%2?'#eee5be50':'#274f7850';k.fillRect((j*13)%80,(j*23)%140,7,24);}k.fillStyle='#f0e7cf';k.fillRect(7,122,82,25);k.fillStyle='#334f41';k.font='bold 14px sans-serif';k.fillText(['ESK','FINDS','GIFTS'][i%3],12,141);const t=shared(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;const m=shared(new THREE.MeshStandardMaterial({map:t,roughness:.9,side:THREE.DoubleSide}));box(.65,1.12,.05,x,2,z+.22,m);}
 const sx=left+mainW*.43,sz=front(sx);textSign(g,'ESK',2.55,.73,sx,3.94,sz+1.225,'#eeece2','#167029');
 // Small raised green roof motif above the lettering.
 for(const side of [-1,1]){const beam=new THREE.Mesh(new THREE.BoxGeometry(1.15,.10,.08),green);beam.position.set(sx+side*.47,4.48,sz+1.23);beam.rotation.z=-side*.38;g.add(beam);}
 // Painted decorative bird/animal shapes on the lower right brick wing.
 for(let i=0;i<5;i++){const x=cut+(end-cut)*(.12+i*.17),z=front(x);const m=[white,green,pale,frame,wood][i];const oval=new THREE.Mesh(new THREE.IcosahedronGeometry(.32,1),m);oval.scale.set(1,.65,.11);oval.position.set(x,4.9+(i%2)*.9,z+.12);g.add(oval);box(.1,.30,.06,x+.17,5.1+(i%2)*.9,z+.13,m);}
 const lampX=cut+W*.1,lampZ=front(lampX)+1.55;box(.09,10,.09,lampX,5,lampZ,roof);box(.65,.1,.22,lampX-.27,10,lampZ,roof);
}
