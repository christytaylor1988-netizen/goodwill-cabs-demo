// Shared arcade doorway: local X spans the opening; local Z is the approach direction.
export function createHyperGateway(T,{exit=false,index=0}={}){
 const group=new T.Group();group.name=exit?'Hyper arcade exit '+(index+1):'Funland frontage entrance';
 if(!exit)return {group,halfWidth:2.45,update(){}};
 const red=new T.MeshStandardMaterial({color:0x811b27,roughness:.78}),trim=new T.MeshStandardMaterial({color:0xdfb985,roughness:.65});
 const orange=new T.LineBasicMaterial({color:0xff8a26,transparent:true,opacity:.96,toneMapped:false});
 const glow=new T.MeshBasicMaterial({color:0xff6a16,transparent:true,opacity:.13,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 function box(w,h,d,x,y,z,material){const geometry=new T.BoxGeometry(w,h,d);let mesh;
  if(exit){mesh=new T.LineSegments(new T.EdgesGeometry(geometry),orange);const aura=new T.Mesh(geometry,glow);aura.position.set(x,y,z);group.add(aura);}else mesh=new T.Mesh(geometry,material);
  mesh.position.set(x,y,z);group.add(mesh);
 }
 // 5.6 metre clear opening, 4.1 metre headroom: broad arcade shopfront proportions.
 for(const x of [-3.1,3.1]){box(.6,4.7,1.25,x,2.35,0,red);box(.09,4.15,.09,x-Math.sign(x)*.24,2.08,.68,trim);}
 box(6.8,.75,1.4,0,4.48,0,red);box(7.05,.16,1.65,0,4.93,0,trim);
 box(6.25,.065,.06,0,4.78,.73,trim);box(6.25,.065,.06,0,4.17,.73,trim);
 if(!exit){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#811b27';c.fillRect(0,0,1024,128);c.fillStyle='#ffe4b1';c.font='bold 78px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText('FUNLAND',512,67);
  const sign=new T.Mesh(new T.PlaneGeometry(5.7,.57),new T.MeshBasicMaterial({map:new T.CanvasTexture(canvas),toneMapped:false}));sign.position.set(0,4.48,.711);group.add(sign);
  const bulb=new T.MeshBasicMaterial({color:0xffd899,toneMapped:false});const geo=new T.SphereGeometry(.045,6,4);for(let i=0;i<13;i++){const m=new T.Mesh(geo,bulb);m.position.set(-2.85+i*.475,4.86,.84);group.add(m);}
 }else{
  // Receding outlines describe an open threshold, not a filled laser wall.
  const points=[];for(const z of [-.6,0,.6])points.push(-2.8,0,z,-2.8,4.1,z,-2.8,4.1,z,2.8,4.1,z,2.8,4.1,z,2.8,0,z);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));group.add(new T.LineSegments(g,orange));
  const light=new T.PointLight(0xff761f,12,22,2);light.position.y=3;group.add(light);
 }
 let time=index;
 return {group,halfWidth:2.8,update(dt){time+=dt;if(exit){orange.opacity=.88+.1*Math.sin(time*4);glow.opacity=.11+.025*Math.sin(time*4);}}};
}
// Swept plane crossing avoids missed hits at speed and activation beside the doorway.
export function crossesGateway(previous,current,group,halfWidth){
 const dx=current.x-previous.x,dz=current.z-previous.z;if(dx*dx+dz*dz>900)return false;
 const c=Math.cos(group.rotation.y),s=Math.sin(group.rotation.y);
 const ax=previous.x-group.position.x,az=previous.z-group.position.z,bx=current.x-group.position.x,bz=current.z-group.position.z;
 const a=s*ax+c*az,b=s*bx+c*bz;if(a*b>0||Math.abs(a-b)<.00001)return false;
 const t=a/(a-b),x=c*(ax+(bx-ax)*t)-s*(az+(bz-az)*t);
 return Math.abs(x)<halfWidth-.65;
}
