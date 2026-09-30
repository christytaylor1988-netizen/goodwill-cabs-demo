import {normanLocations} from './norman-locations.js';
import {normanNames} from './norman-names.js';
import {townLocations} from './town-locations.js';
import {townNames} from './town-names.js';
import {normanStyles} from './norman-styles.js';
export function createNormanFrontages(THREE,api){
 const {shared,terrainHeight,findNearestRoadPoint,roadWidthForType,inPolygon}=api;
 const sites=new Map(Object.entries({...townLocations,...normanLocations}).filter(([,v])=>!v.hidden).map(([id,v])=>[v.buildingId,{id,...v}]));
 const materials=new Map(),used=new Set(),skipped=new Map(),active=new Set(),heights=new Map();
 const names={...townNames,...normanNames};
 let lightingTime='afternoon';
 function lightingFor(s){
  if(s.lighting===false)return null;
  if(s.lighting)return s.lighting;
  if(s.style==='pub')return normanStyles.pub.lighting;
  if(s.style==='shop'&&(['supermarket','convenience','department_store','general','greengrocer'].includes(s.sourceUse)||(s.sourceUse==='retail'&&s.width>=10)))return normanStyles.shop.lighting;
  return null;
 }
 function setTime(value){
  lightingTime=value;
  for(const mat of materials.values())if(mat.userData.nightGlow!==undefined)mat.emissiveIntensity=mat.userData.nightGlow*(value==='night'?1:value==='evening'?.45:0);
 }

 function material(s){
  if(materials.has(s.id))return materials.get(s.id);
  const st=normanStyles[s.style]||normanStyles.shop,c=document.createElement('canvas');const scale=s.id.startsWith('town-')?.5:1;c.width=1024*scale;c.height=512*scale;const g=c.getContext('2d');g.scale(scale,scale);
  g.fillStyle=st.paint;g.fillRect(0,0,1024,512);
  // Fascia and cornice, broad display glazing, recessed dark entrance and stall riser.
  g.fillStyle=st.trim;g.fillRect(0,0,1024,9);g.fillRect(0,94,1024,9);
  g.font='600 48px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(names[s.id]||'Local Shop',512,48,960);
  const door=s.variant===1?62:775,wx=s.variant===1?265:44,ww=690;
  g.fillStyle='#12262b';g.fillRect(door,113,184,376);
  const glass=g.createLinearGradient(0,110,0,448);glass.addColorStop(0,st.glass);glass.addColorStop(1,'#101f26');g.fillStyle=glass;g.fillRect(wx,120,ww,294);g.fillRect(door+15,128,154,282);
  // Small display silhouettes give each use a distinct street-level reading.
  g.fillStyle='#b4a47b';
  if(s.style==='vape'){
   g.fillStyle='#b9d7df';g.fillRect(wx+6,126,ww-12,280);
   for(let row=0;row<3;row++){for(let i=0;i<15;i++){const x=wx+20+i*44,y=175+row*73;g.fillStyle=['#ea61b6','#68ccd5','#f2bf61','#aa83e0','#8ed0a4'][(i+row+s.variant)%5];g.fillRect(x,y,25,42);g.fillStyle='#ffffffb0';g.fillRect(x+5,y+8,15,4);g.fillStyle='#34405b';g.fillRect(x+7,y+24,11,9)}g.fillStyle='#edfaff';g.fillRect(wx+9,220+row*73,ww-18,5)}
   g.fillStyle='#f1ffff';g.fillRect(wx+12,132,ww-24,6);
  }
  else if(s.style==='shop')for(let i=0;i<12;i++){const x=wx+32+i*52;g.fillStyle=['#877e63','#536c6d','#977062'][i%3];g.fillRect(x,310-(i%3)*24,29,82+(i%3)*24)}
  else if(s.style==='cafe'||s.style==='restaurant')for(let i=0;i<3;i++){const x=wx+100+i*210;g.fillStyle='#a69169';g.fillRect(x-55,350,115,10);g.fillRect(x-3,360,6,47);g.fillStyle='#d7ccb0';g.fillRect(x-16,326,23,20);g.fillStyle='#769070';g.beginPath();g.ellipse(x+25,306,18,31,.3,0,7);g.fill()}
  else {g.fillStyle='#a18e65';for(let i=0;i<9;i++){g.fillRect(wx+44+i*70,330,18,43);g.fillRect(wx+49+i*70,319,8,12)}g.fillRect(wx,377,ww,9)}
  g.strokeStyle=st.trim;g.lineWidth=8;g.strokeRect(wx,120,ww,294);g.strokeRect(door+15,128,154,282);g.fillStyle=st.trim;g.fillRect(wx+ww/2-4,120,8,294);g.fillRect(door+144,293,5,29);
  g.fillStyle='#d4e2df1d';g.beginPath();g.moveTo(wx+16,129);g.lineTo(wx+100,129);g.lineTo(wx+260,398);g.lineTo(wx+211,398);g.fill();
  g.font='18px sans-serif';g.fillStyle=st.trim;g.fillText(st.label,wx+ww/2,442,ww-24);
  for(let i=0;i<10;i++){g.fillStyle='#b4aa8d45';g.fillRect((i*137+s.variant*31)%1024,495+(i%3)*4,16,2)}
  const texture=shared(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  const mat=shared(new THREE.MeshStandardMaterial({map:texture,roughness:.85,emissive:s.style==='vape'?0xffffff:0x000000,emissiveMap:s.style==='vape'?texture:null,emissiveIntensity:st.glow||0}));const lighting=lightingFor(s);
  if(lighting){
   // A window-only light map keeps painted walls dark; no extra meshes or lights.
   const lc=document.createElement('canvas');lc.width=c.width;lc.height=c.height;const lg=lc.getContext('2d');lg.scale(scale,scale);lg.fillStyle='#000';lg.fillRect(0,0,1024,512);
   lg.save();lg.beginPath();lg.rect(wx+5,125,ww-10,284);lg.rect(door+20,133,144,272);lg.clip();
   lg.fillStyle=lighting.colour;lg.fillRect(0,0,1024,512);
   lg.globalCompositeOperation='multiply';lg.globalAlpha=.65;lg.drawImage(c,0,0,1024,512);lg.restore();
   lg.fillStyle=lighting.colour;lg.font='600 48px Georgia';lg.textAlign='center';lg.textBaseline='middle';lg.globalAlpha=.32;lg.fillText(names[s.id]||'Local Shop',512,48,960);lg.globalAlpha=1;
   const glow=shared(new THREE.CanvasTexture(lc));glow.colorSpace=THREE.SRGBColorSpace;glow.anisotropy=4;
   mat.emissive.set(0xffffff);mat.emissiveMap=glow;mat.userData.nightGlow=lighting.strength;
   mat.emissiveIntensity=lighting.strength*(lightingTime==='night'?1:lightingTime==='evening'?.45:0);
  }
  materials.set(s.id,mat);return mat;
 }
 function prepare(poly,id,height){
  active.delete(id);const s=sites.get(id);if(!s)return;
  const a=poly.outer[s.edgeIndex],b=poly.outer[(s.edgeIndex+1)%poly.outer.length];if(!a||!b)return;
  const dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz),x=a.x+dx*s.along,z=a.y+dz*s.along,width=Math.min(s.width,len-.12),r=findNearestRoadPoint({x,z},true);if(!r)return;
  let nx=-dz/len,nz=dx/len;if(nx*(r.point.x-x)+nz*(r.point.z-z)<0){nx=-nx;nz=-nz}
  if(inPolygon(x+nx*.3,z+nz*.3,poly)||(s.id.startsWith('norman-')&&r.segment.roadName!=='Norman Road'))return;
  if(![-.5,0,.5].every(t=>{const road=findNearestRoadPoint({x:x+nx*.18+nz*width*t,z:z+nz*.18-nx*width*t},true);return road&&road.distance>roadWidthForType(road.segment.type)/2+.25}))return;
  active.add(id);heights.set(id,height);
 }
 function queue(tile,poly,id){if(active.has(id))(tile.normanFrontages??=[]).push({poly,id})}
 function finish(tile){
  const layer=new THREE.Group();layer.name='Editable commercial ground floors';
  for(const {poly,id} of tile.normanFrontages||[]){
   const s=sites.get(id),a=poly.outer[s.edgeIndex],b=poly.outer[(s.edgeIndex+1)%poly.outer.length];if(!a||!b)continue;
   const dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz),width=Math.min(s.width,len-.12),x=a.x+dx*s.along,z=a.y+dz*s.along;
   const road=findNearestRoadPoint({x,z},true);if(!road)continue;
   let nx=-dz/len,nz=dx/len;if(nx*(road.point.x-x)+nz*(road.point.z-z)<0){nx=-nx;nz=-nz}
   if(inPolygon(x+nx*.3,z+nz*.3,poly)||(s.id.startsWith('norman-')&&road.segment.roadName!=='Norman Road')){skipped.set(id,'Not a Norman Road frontage');continue}
   const offset=.18;
   if(![-.5,0,.5].every(t=>{const r=findNearestRoadPoint({x:x+nx*offset+nz*width*t,z:z+nz*offset-nx*width*t},true);return r&&r.distance>roadWidthForType(r.segment.type)/2+.25})){skipped.set(id,'Insufficient pavement clearance');continue}
   const base=Math.max(...poly.outer.map(p=>terrainHeight(p.x,p.y))),bottom=Math.min(terrainHeight(a.x,a.y),terrainHeight(b.x,b.y))+.04,top=base+Math.min(2.91,(heights.get(id)||3)-.09),height=top-bottom;
   const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material(s));panel.position.set(x+nx*offset,(top+bottom)/2,z+nz*offset);panel.rotation.y=Math.atan2(nx,nz);panel.receiveShadow=true;panel.name=names[s.id];panel.userData={normanId:s.id,buildingId:id,top,base};layer.add(panel);used.add(id);
  }
  if(layer.children.length)tile.group.add(layer);tile.normanFrontages=[];
 }
 return {sites,active,prepare,queue,finish,used,skipped,materials,setTime};
}
