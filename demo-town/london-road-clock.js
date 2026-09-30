// Freestanding promenade clock opposite the mapped south end of London Road.
export function addLondonRoadClock(THREE,{parent,shared,convertPosition,promenadeAt,pavingHeight}){
 // Continue the straight London Road approach across the junction, rather than
 // using its short eastward junction stub. Set the base just behind the roadside kerb.
 const a=convertPosition(50.8518462,.5605207),b=convertPosition(50.8516373,.5606093),dx=b.x-a.x,dz=b.z-a.z;
 let x=b.x,r=promenadeAt(x);if(!r)return null;
 for(let i=0;i<6;i++){x=b.x+(r.edge+1.4-b.z)*dx/dz;r=promenadeAt(x);}
 const z=r.edge+1.4,y=pavingHeight(x,z),yaw=Math.atan2(dx,dz),group=new THREE.Group();group.name='London Road seafront clock';parent.add(group);
 const iron=shared(new THREE.MeshStandardMaterial({color:0x283c3b,roughness:.8})),geo=new THREE.BoxGeometry(1,1,1),parts=[[.72,.12,.72,0,.06],[.54,.12,.54,0,.18],[.36,.28,.36,0,.38],[.24,.20,.24,0,.59],[.17,2.76,.17,0,2.05],[.30,.30,.30,0,3.51],[.91,.88,.91,0,4.02],[.98,.065,.98,0,4.49]],dummy=new THREE.Object3D();
 const body=new THREE.InstancedMesh(geo,iron,parts.length);parts.forEach(([w,h,d,u,v],i)=>{dummy.position.set(x+u,y+v,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,yaw,0);dummy.updateMatrix();body.setMatrixAt(i,dummy.matrix)});body.castShadow=body.receiveShadow=true;body.computeBoundingSphere();group.add(body);
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#263d3b';g.fillRect(0,0,256,256);g.beginPath();g.arc(128,128,113,0,Math.PI*2);g.fillStyle='#fff9e7';g.fill();g.lineWidth=5;g.strokeStyle='#65796b';g.stroke();
 const numbers=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];g.fillStyle='#253633';g.font='bold 21px Georgia';g.textAlign='center';g.textBaseline='middle';numbers.forEach((n,i)=>{const a=i*Math.PI/6;g.fillText(n,128+Math.sin(a)*88,128-Math.cos(a)*88)});
 // Quiet, legible reference dial, with no timer or animation overhead.
 for(const [a,len,w] of [[-Math.PI/6,75,6],[-Math.PI/3,49,8]]){g.beginPath();g.moveTo(128,128);g.lineTo(128+Math.sin(a)*len,128-Math.cos(a)*len);g.strokeStyle='#1b2a29';g.lineWidth=w;g.lineCap='round';g.stroke();}g.beginPath();g.arc(128,128,7,0,Math.PI*2);g.fill();
 const texture=shared(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;
 const faceMaterial=shared(new THREE.MeshStandardMaterial({map:texture,roughness:.9,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.2})),faces=new THREE.InstancedMesh(new THREE.PlaneGeometry(.85,.85),faceMaterial,4);
 for(let i=0;i<4;i++){const angle=yaw+i*Math.PI/2;dummy.position.set(x+Math.sin(angle)*.457,y+4.02,z+Math.cos(angle)*.457);dummy.scale.set(1,1,1);dummy.rotation.set(0,angle,0);dummy.updateMatrix();faces.setMatrixAt(i,dummy.matrix)}faces.computeBoundingSphere();group.add(faces);group.userData={x,y,z,height:4.525};group.setTime=value=>{const lit=value==='night'||value==='evening';faceMaterial.emissiveIntensity=lit?1.35:.2;group.userData.illuminated=lit;};group.setTime('afternoon');return group;
}
