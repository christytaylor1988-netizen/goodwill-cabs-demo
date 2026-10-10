// One small repeating texture: interlocking 2:1 blocks, no individual block meshes.
export function wellingtonPavingMaterial(THREE,shared){
 const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#555856';g.fillRect(0,0,512,512);
 for(let y=-2;y<18;y++)for(let x=-2;x<18;x++){
  const phase=((x+y)%4+4)%4;if(phase!==0&&phase!==2)continue;
  const w=phase===0?64:32,h=phase===0?32:64,n=((x*19+y*31)%13+13)%13,t=135+n*2;
  g.fillStyle=`rgb(${t},${t+2},${t+1})`;g.fillRect(x*32+1.3,y*32+1.3,w-2.6,h-2.6);
  g.strokeStyle='#c1c3bd66';g.lineWidth=.8;g.strokeRect(x*32+2.3,y*32+2.3,w-4.6,h-4.6);
  g.fillStyle='#55595425';for(let j=0;j<8;j++)g.fillRect(x*32+4+(j*13+n*7)%(w-8),y*32+4+(j*17+n)%(h-8),1.3,1.3);
 }
 const map=shared(new THREE.CanvasTexture(c));map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
 return shared(new THREE.MeshStandardMaterial({map,roughness:1,color:0xffffff,side:THREE.DoubleSide}));
}
