import {createPedestrian} from './pedestrian-pool.js?v=local-2';
// Visual frontage only. The mapped building and all existing collision geometry stay intact.
export function addElectroStudios(THREE,{scene,mapData,convertPosition,terrainHeight,findNearestRoadPoint,roadWidthForType}){
 const feature=mapData.buildings.find(f=>f.id===1002731789);
 if(!feature)return null;
 const ring=feature.geometry.map(p=>convertPosition(p.lat,p.lon));
 // The long south wall faces Seaside Road (and the old bathing pool in the reference).
 const a=ring[3],b=ring[2],length=a.distanceTo(b),tx=(b.x-a.x)/length,tz=(b.z-a.z)/length;
 const nx=-tz,nz=tx,x=a.x+(b.x-a.x)*.72,z=a.z+(b.z-a.z)*.72;
 const group=new THREE.Group();group.name='Electro Studios';
 group.position.set(x,terrainHeight(x+nx*.8,z+nz*.8),z);group.rotation.y=Math.atan2(nx,nz);scene.add(group);
 const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:1});
 const cream=mat(0xd6d2bf),wood=mat(0xc9c8b9),dark=mat(0x62665e),glass=mat(0x26383b);
 const box=(w,h,d,u,y,v,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(u,y,v);o.receiveShadow=true;group.add(o);return o};
 // A shallow cream surround masks only this doorway's generic ground-floor detail.
 box(6.5,5.7,.18,0,2.85,.59,cream);
 const shape=new THREE.Shape();shape.moveTo(-1.65,.08);shape.lineTo(1.65,.08);shape.lineTo(1.65,3.05);shape.absarc(0,3.05,1.65,0,Math.PI,false);shape.lineTo(-1.65,.08);
 const door=new THREE.Mesh(new THREE.ShapeGeometry(shape,24),wood);door.position.z=.70;group.add(door);
 box(.025,3.08,.025,0,1.6,.73,dark);
 // Vertical timber seams and a few restrained worn patches, fixed rather than random.
 for(let i=-7;i<=7;i++){const u=i*.215,top=3.05+Math.sqrt(Math.max(0,1.65**2-u*u));box(.012,top-.15,.015,u,(top+.15)/2,.724,dark);}
 for(let i=0;i<18;i++){const u=((i*7)%17-8)*.18,y=.25+((i*11)%29)*.11;box(.035,.08+(i%4)*.04,.012,u,y,.74,cream);}
 box(3.35,.19,.06,0,3.05,.76,wood);box(.38,.09,.07,0,1.58,.79,dark);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=80;const ctx=canvas.getContext('2d');ctx.fillStyle='#cecbbb';ctx.fillRect(0,0,768,80);ctx.fillStyle='#343b38';ctx.font='bold 54px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ELECTRO STUDIOS',384,42);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.9,.3),new THREE.MeshStandardMaterial({map:texture,roughness:1}));sign.position.set(0,3.07,.80);group.add(sign);
 // Small upper windows retain the modest two-storey studio character.
 for(const u of [-2.35,2.35]){box(.75,1.1,.08,u,4.7,.72,wood);box(.62,.97,.025,u,4.7,.78,glass);box(.04,.97,.03,u,4.7,.80,wood);}
 const bulbMaterial=new THREE.MeshStandardMaterial({color:0xffedba,emissive:0xffbb58,emissiveIntensity:0});
 const bulbGeometry=new THREE.SphereGeometry(.065,7,5),cordPoints=[];
 for(let i=0;i<=16;i++){const angle=Math.PI-i*Math.PI/16;cordPoints.push(new THREE.Vector3(Math.cos(angle)*1.72,3.05+Math.sin(angle)*1.72,.84));}
 group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cordPoints),new THREE.LineBasicMaterial({color:0x425445})));
 for(const p of cordPoints){const bulb=new THREE.Mesh(bulbGeometry,bulbMaterial);bulb.position.copy(p);group.add(bulb);}
 const light=new THREE.PointLight(0xffbf73,0,7,2);light.position.set(0,3.15,1.3);light.castShadow=false;group.add(light);
 const people=new THREE.Group();people.name='Electro opening guests';scene.add(people);
 const skin=mat(0xb98e73),trousers=mat(0x30373c),bottle=mat(0x385544),shirts=[mat(0x784948),mat(0x58635b),mat(0x526478)];
 const guests=[[-2.35,1.05,.5],[-3.05,1.45,2.7],[2.25,1.10,-.5],[3.05,1.45,-2.5],[3.8,1.05,-1.3]];
 for(let i=0;i<guests.length;i++){
  const [u,v,yaw]=guests[i],wx=x+tx*u+nx*v,wz=z+tz*u+nz*v,near=findNearestRoadPoint({x:wx,z:wz},true);
  // Never place a guest on the carriageway, even if a future road dataset changes.
  if(near&&near.distance<roadWidthForType(near.segment.type)/2+.35)continue;
  const {g:person}=createPedestrian(THREE,[2,5,9,8,10][i]);person.position.set(wx,terrainHeight(wx,wz),wz);person.rotation.y=yaw;people.add(person);
 }
 // One shared bulb material and one shadow-free doorway light; no animation or colliders.
 function setTime(time){const on=typeof time==='number'?time:time==='evening'||time==='night'?1:0;bulbMaterial.emissiveIntensity=on*3;light.intensity=on*22;}
 return {group,people,setTime,light,bulbMaterial,featureId:feature.id};
}
