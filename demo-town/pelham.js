// Local scenery-only Pelham frontage. Heights never feed back into vehicle terrain.
export function buildPelham(THREE,api){
 const {scene,shared,convertPosition,terrainHeight,mapData,roadWidthForType,batchScenery}=api;
 const group=new THREE.Group();group.name='Pelham arched frontage, pavement and cliff';scene.add(group);
 const mat=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.95}));
 const stone=mat(0x929f9b),trim=mat(0xc4ccc1),dark=mat(0x24383c),cream=mat(0xe7dfc8);
 const cx=convertPosition(50.85533,.58463).x,front=convertPosition(50.8552893,.58463).z,width=43;
 const box=(w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o};
 const base=terrainHeight(cx,front);
 box(width,4.5,8,cx,base+2.25,front-4,stone);
 box(width+.3,.24,.45,cx,base+4.4,front+.1,trim);
 function label(text,x,w){const c=document.createElement('canvas');c.width=512;c.height=96;const k=c.getContext('2d');k.fillStyle='#929f9b';k.fillRect(0,0,512,96);k.fillStyle='#f2eddf';k.font='26px Georgia';k.textAlign='center';k.fillText(text,256,60,490);const tex=shared(new THREE.CanvasTexture(c));tex.colorSpace=THREE.SRGBColorSpace;const m=shared(new THREE.MeshStandardMaterial({map:tex,roughness:.9}));const o=new THREE.Mesh(new THREE.PlaneGeometry(w,.7),m);o.position.set(x,base+3.93,front+.25);group.add(o)}
 label('ST MARY IN THE CASTLE',cx-12,16);label('COASTAL CURIOS',cx+4,12);label('THE VAULTS CAFÉ',cx+16,10);
 for(let i=0;i<9;i++){
  const x=cx-width/2+(i+.5)*width/9,w=3.9,h=3.35;
  const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(w/2,h-w/2);sh.absarc(0,h-w/2,w/2,0,Math.PI,false);sh.closePath();
  const o=new THREE.Mesh(new THREE.ShapeGeometry(sh,12),dark);o.position.set(x,base+.12,front+.12);group.add(o);
  box(.075,2.7,.07,x,base+1.5,front+.17,cream);box(w,.08,.07,x,base+2.3,front+.17,cream);
  const pts=[];for(let j=0;j<=16;j++){const a=j/16*Math.PI;pts.push(new THREE.Vector3(x+Math.cos(a)*(w/2+.08),base+.12+h-w/2+Math.sin(a)*(w/2+.08),front+.2))}const geo=new THREE.BufferGeometry().setFromPoints(pts);group.add(new THREE.Line(geo,shared(new THREE.LineBasicMaterial({color:0xcbd0c5}))));
  box(w,.12,.18,x,base+.13,front+.16,trim);
  if(i%3){for(let j=0;j<4;j++)box(.3,.45+.15*(j%2),.18,x-1.25+j*.75,base+.5,front+.24,mat([0xc09c69,0x847ba3,0x859e82,0xa76b69][j]));}
 }
 // Pavement mesh samples existing terrain; omit cells on any mapped road.
 const roads=[];for(const r of mapData.roads){if(['no','private'].includes(r.tags?.access)||['no','private'].includes(r.tags?.motor_vehicle)||['no','private'].includes(r.tags?.motorcar))continue;if(['footway','path','steps','pedestrian','cycleway','track'].includes(r.tags?.highway))continue;const g=r.geometry||[];for(let i=1;i<g.length;i++)roads.push({a:convertPosition(g[i-1].lat,g[i-1].lon),b:convertPosition(g[i].lat,g[i].lon),w:roadWidthForType(r.tags?.highway||'residential')/2})}
 const local=roads.filter(r=>Math.min(r.a.x,r.b.x)<cx+90&&Math.max(r.a.x,r.b.x)>cx-90&&Math.min(r.a.z,r.b.z)<front+38&&Math.max(r.a.z,r.b.z)>front-30);
 const clear=(x,z)=>!local.some(({a,b,w})=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-dx*t,z-a.z-dz*t)<w+.25});
 const pavementCanvas=document.createElement('canvas');pavementCanvas.width=pavementCanvas.height=256;const p=pavementCanvas.getContext('2d');p.fillStyle='#a9a69b';p.fillRect(0,0,256,256);for(let y=0;y<256;y+=64)for(let x=0;x<256;x+=128){p.strokeStyle='#85887f';p.lineWidth=2;p.strokeRect(x,y,128,64);p.fillStyle='#ffffff09';p.fillRect(x+3,y+3,122,58)}
 const pavementTex=shared(new THREE.CanvasTexture(pavementCanvas));pavementTex.colorSpace=THREE.SRGBColorSpace;pavementTex.wrapS=pavementTex.wrapT=THREE.RepeatWrapping;const pavement=shared(new THREE.MeshStandardMaterial({map:pavementTex,roughness:1}));
 const vertices=[],uvs=[];for(let x=cx-70;x<cx+62;x+=1.5)for(let z=front-27;z<front+31;z+=1.5){const ps=[[x,z],[x+1.5,z],[x+1.5,z+1.5],[x,z+1.5]];if(!ps.every(([x,z])=>clear(x,z)))continue;for(const i of [0,2,1,0,3,2]){const [x,z]=ps[i];vertices.push(x,terrainHeight(x,z)+.09,z);uvs.push(x/3,z/3)}}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));pg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));pg.computeVertexNormals();const pm=new THREE.Mesh(pg,pavement);pm.receiveShadow=true;group.add(pm);
 // Exposed sandstone face behind the terrace, with an irregular scrub-covered crest.
 const rockCanvas=document.createElement('canvas');rockCanvas.width=512;rockCanvas.height=256;const r=rockCanvas.getContext('2d');r.fillStyle='#857e69';r.fillRect(0,0,512,256);let seed=19;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};for(let i=0;i<2400;i++){r.fillStyle=['#474b3c55','#c3b69966','#655f5066'][i%3];r.fillRect(rand()*512,rand()*256,2+rand()*28,1+rand()*4)}for(let y=0;y<256;y+=17){r.strokeStyle='#494a3c77';r.beginPath();r.moveTo(0,y);for(let x=0;x<=512;x+=16)r.lineTo(x,y+rand()*5);r.stroke()}
 const rt=shared(new THREE.CanvasTexture(rockCanvas));rt.colorSpace=THREE.SRGBColorSpace;rt.wrapS=rt.wrapT=THREE.RepeatWrapping;const rock=shared(new THREE.MeshStandardMaterial({map:rt,roughness:1,side:THREE.DoubleSide})),scrub=mat(0x4c6340),v=[],uv=[],cap=[];
 const zc=convertPosition(50.85581,.58463).z;
 const columns=[];for(let i=0;i<=24;i++){const x=cx-85+i*7,z=zc+Math.sin(i*.68)*4,foot=terrainHeight(x,z)-1,crest=foot+3+Math.max(0,48-foot)*Math.pow(Math.sin(i/24*Math.PI),.4)+Math.sin(i*1.4)*1.1;columns.push({x,z,foot,crest})}
 for(let i=0;i<24;i++){const a=columns[i],b=columns[i+1],ps=[[a.x,a.foot,a.z],[b.x,b.foot,b.z],[b.x,b.crest,b.z-7],[a.x,a.crest,a.z-7]];for(const n of [0,1,2,0,2,3]){v.push(...ps[n]);uv.push(ps[n][0]/18,ps[n][1]/12)}const pa=[[a.x,a.crest,a.z-7],[b.x,b.crest,b.z-7],[b.x,terrainHeight(b.x,b.z-25),b.z-25],[a.x,terrainHeight(a.x,a.z-25),a.z-25]];for(const n of [0,2,1,0,3,2])cap.push(...pa[n])}
 for(const [verts,m,tex]of [[v,rock,uv],[cap,scrub,null]]){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));if(tex)geo.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);mesh.castShadow=true;group.add(mesh)}
 const tuftGeo=shared(new THREE.IcosahedronGeometry(1,0));for(let i=1;i<columns.length-1;i++){const c=columns[i],bush=new THREE.Mesh(tuftGeo,scrub);bush.position.set(c.x,c.crest-.1,c.z-7);bush.scale.set(3.8,.7+(i%3)*.35,2.2);group.add(bush)}
 batchScenery({group});for(const o of group.children)if(o.material===pavement){o.renderOrder=0;o.castShadow=false;}group.position.set(0,0,0);return group;
}
