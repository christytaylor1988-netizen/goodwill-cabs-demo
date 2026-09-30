// One small shared texture; no extra objects, lights, animation or collision changes.
export function createPathWear(THREE){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const g=canvas.getContext('2d');
 let seed=72419;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 g.fillStyle='#e4e2dc';g.fillRect(0,0,512,512);
 // Fine aggregate and quiet, irregular surface weathering.
 for(let i=0;i<12500;i++){const v=180+Math.floor(random()*60);g.fillStyle=`rgba(${v},${v},${v},.18)`;g.fillRect(random()*512,random()*512,1+random()*2,1+random()*2)}
 for(let i=0;i<30;i++){const x=random()*512,y=random()*512,r=8+random()*32,gradient=g.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,'#666d6420');gradient.addColorStop(1,'#666d6400');g.fillStyle=gradient;g.fillRect(x-r,y-r,r*2,r*2)}
 // A few short hairline cracks per eight metres; no regular slab grid.
 for(let i=0;i<5;i++){let x=45+random()*422,y=45+random()*422,angle=random()*Math.PI*2;g.beginPath();g.moveTo(x,y);for(let j=0;j<5;j++){angle+=(random()-.5)*.8;x+=Math.cos(angle)*(5+random()*8);y+=Math.sin(angle)*(5+random()*8);g.lineTo(x,y);if(j===2){g.moveTo(x+Math.sin(angle)*9,y-Math.cos(angle)*9);g.lineTo(x,y)}}g.strokeStyle='#5d62584d';g.lineWidth=.65+random()*.5;g.stroke()}
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
export function pathSurfaceUV(THREE,geometry){
 const p=geometry.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/8,p.getZ(i)/8);geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
}
// Stable modest edge wear, strongest in the seafront band and fading inland.
export function edgeWear(x,z){
 const longitude=.570+x/(111320*Math.cos(50.870*Math.PI/180)),latitude=50.870-z/111320;
 const coast=.8505+.0058*Math.max(0,Math.min(1,(longitude-.55)/.04));
 const fade=Math.max(0,Math.min(1,(1250-(latitude-coast)*111320)/400));
 return fade*(Math.sin(x*.83+z*.47)*.035+Math.sin(x*2.13-z*.71)*.018);
}
