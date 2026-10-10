let haloTexture;
export function createPortalGlow(THREE,group,colour,radius=3.3){
 if(!haloTexture){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'rgba(255,255,255,.48)');g.addColorStop(.38,'rgba(255,255,255,.27)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);haloTexture=new THREE.CanvasTexture(c);}
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,color:colour,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));halo.scale.setScalar(radius*4.5);group.add(halo);
 const haze=new THREE.Mesh(new THREE.TorusGeometry(radius,.42,6,48),new THREE.MeshBasicMaterial({color:colour,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));group.add(haze);
 const light=new THREE.PointLight(colour,95,26,1.4);group.add(light);let time=0;
 return {update(dt){time+=dt;const pulse=.88+.09*Math.sin(time*2.2)+.03*Math.sin(time*17.3);halo.material.opacity=pulse;haze.material.opacity=.26*pulse;light.intensity=95*pulse;}};
}
