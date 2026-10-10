import {createRoadAudio} from './breakbeat-audio.js';
export const BREAKBEAT={bpm:124,mph:40,steps:32,stripWidth:1.12,triggerWidth:1.28,maxLength:1600,leadIn:20,runOut:20};
export const ROAD_PATTERN={
 kick:'X... ..X. ..X. ...X X..X .... X.X. .X..',
 snare:'.... X... .... X... .... X... ...X X...',
 hat:'x.xx x.x. xx.x x.xx xx.x x.xx .xx. xx.x',
 shaker:'.s.s .ss. .s.s s.s. .ss. .s.s s..s .ss.'
};
export const STEP_METRES=BREAKBEAT.mph*.44704*60/BREAKBEAT.bpm/4;
const OFFSETS={hat:-1.7,kick:0,snare:0,shaker:2.3};
// Pure swept-front-wheel detector: no sequencer clock, no rear-wheel inputs.
export function createRoadDetector(triggers,onHit){
 let previous=null,elapsed=0;const locks=new Map();
 // Index the finite lateral hit lines in 16 m cells; only nearby marks need exact checks.
 const cellSize=16,cells=new Map(),cell=n=>Math.floor(n/cellSize);
 triggers.forEach((t,index)=>{const half=t.width/2+.10,ex=Math.abs(t.dz)*half+.001,ez=Math.abs(t.dx)*half+.001;
  for(let x=cell(t.x-ex);x<=cell(t.x+ex);x++)for(let z=cell(t.z-ez);z<=cell(t.z+ez);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(index);}
 });
 function reset(){previous=null;locks.clear()}
 function update(dt,wheels,active=true){
  elapsed+=Math.max(0,dt);
  if(!active){previous=null;return}
  const old=previous;previous=wheels.map(p=>({...p}));if(!old)return;
  if(wheels.some((p,i)=>Math.hypot(p.x-old[i].x,p.z-old[i].z)>5)){locks.clear();return;}
  const nearby=new Set();
  wheels.forEach((p,i)=>{const a=old[i];for(let x=cell(Math.min(a.x,p.x));x<=cell(Math.max(a.x,p.x));x++)for(let z=cell(Math.min(a.z,p.z));z<=cell(Math.max(a.z,p.z));z++)for(const index of cells.get(x+','+z)||[])nearby.add(index);});
  for(const index of [...nearby].sort((a,b)=>a-b)){
   const trigger=triggers[index];
   const longitudinal=p=>(p.x-trigger.x)*trigger.dx+(p.z-trigger.z)*trigger.dz;
   const lock=locks.get(trigger.id);
   if(lock){if(elapsed-lock<.14||old.some(p=>Math.abs(longitudinal(p))<.55))continue;locks.delete(trigger.id);}
   let hit=null;
   for(let i=0;i<wheels.length;i++){
    const a=longitudinal(old[i]),b=longitudinal(wheels[i]);
    if(a===b||!((a<0&&b>=0)||(a>0&&b<=0)))continue;
    const t=-a/(b-a),x=old[i].x+(wheels[i].x-old[i].x)*t,z=old[i].z+(wheels[i].z-old[i].z)*t;
    const lateral=(x-trigger.x)*-trigger.dz+(z-trigger.z)*trigger.dx;
    if(Math.abs(lateral)<=trigger.width/2+.10){hit={wheel:i,fraction:t};break;}
   }
   if(hit){locks.set(trigger.id,elapsed);onHit(trigger,hit);}
  }
 }
 return {update,reset};
}
// Verified south-to-north main carriageway; stop before the northern one-way split.
// Join only shared mapped endpoints. No new road points or straightened geometry.
export const BOHEMIA_WAYS=[1302217221,1302217222,28455003,1090206324,1090206323];
export function buildBreakbeatPath(roads,convertPosition){
 const points=[];
 for(const id of BOHEMIA_WAYS){
  const way=roads.find(r=>r.id===id&&r.tags?.name==='Bohemia Road');
  if(!way)throw Error('Musical road: missing mapped Bohemia section '+id);
  const next=way.geometry.map(p=>convertPosition(p.lat,p.lon));
  if(!points.length){if(next[0].z<next.at(-1).z)next.reverse();points.push(...next);continue;}
  const last=points.at(-1),distance=p=>Math.hypot(p.x-last.x,p.z-last.z);
  if(distance(next.at(-1))<distance(next[0]))next.reverse();
  if(distance(next[0])>.01)throw Error('Musical road: disconnected Bohemia sections');
  points.push(...next.slice(1));
 }
 const segments=[];let total=0;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.z-a.z);if(length<.001)continue;segments.push({a,b,length,start:total,dx:(b.x-a.x)/length,dz:(b.z-a.z)/length});total+=length;}
 function pointAt(distance,lateral=0){distance=Math.max(0,Math.min(total,distance));const s=segments.find(s=>distance<=s.start+s.length)||segments.at(-1),t=distance-s.start;return {x:s.a.x+s.dx*t-s.dz*lateral,z:s.a.z+s.dz*t+s.dx*lateral,dx:s.dx,dz:s.dz};}
 const start=BREAKBEAT.leadIn,stepCount=Math.floor(Math.min(BREAKBEAT.maxLength,total-start-BREAKBEAT.runOut)/STEP_METRES);
 return {segments,total,start,stepCount,length:stepCount*STEP_METRES,pointAt};
}
export function createBreakbeatRoad(THREE,{scene,taxi,wheels,roads,convertPosition,terrainHeight}){
 const audio=createRoadAudio();
 const path=buildBreakbeatPath(roads,convertPosition),{pointAt,start,stepCount,length}=path;
 const triggers=[];
 for(const [kind,pattern] of Object.entries(ROAD_PATTERN)){
  const steps=pattern.replace(/\s/g,'');if(steps.length!==BREAKBEAT.steps)throw Error('Expected 32 '+kind+' steps');
  for(let step=0;step<stepCount;step++)if(steps[step%BREAKBEAT.steps]!=='.')triggers.push({...pointAt(start+step*STEP_METRES,OFFSETS[kind]),id:kind+'-'+step,kind,step,width:BREAKBEAT.triggerWidth,distance:start+step*STEP_METRES});
 }
 // Natural neutral asphalt atlas. All four families share one static, terrain-following mesh.
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const g=canvas.getContext('2d');let seed=39027;
 const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 ['kick','snare','hat','shaker'].forEach((kind,index)=>{
  g.save();g.translate(index*256,0);
  if(kind==='kick'){
   g.fillStyle='#303332';g.beginPath();for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=.85+rnd()*.15,x=128+Math.cos(a)*118*r,y=128+Math.sin(a)*108*r;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fill();g.strokeStyle='#787871';g.lineWidth=5;g.stroke();
   const shade=g.createLinearGradient(0,50,0,215);shade.addColorStop(0,'#161c1c');shade.addColorStop(1,'#4a4b45');g.fillStyle=shade;g.beginPath();g.ellipse(128,128,95,79,0,0,Math.PI*2);g.fill();
  }else if(kind==='snare'||kind==='hat'){
   g.strokeStyle='#88867b';g.lineWidth=kind==='snare'?46:38;g.beginPath();g.moveTo(5,130);for(let x=20;x<256;x+=18)g.lineTo(x,118+rnd()*25);g.stroke();g.strokeStyle='#222928';g.lineWidth=kind==='snare'?24:18;g.stroke();
  }
  if(kind==='shaker'){g.fillStyle='#aaa18b55';g.beginPath();g.moveTo(20,45);g.lineTo(233,30);g.lineTo(243,219);g.lineTo(12,207);g.closePath();g.fill();for(let j=0;j<23;j++){g.strokeStyle=j%2?'#292e2a66':'#b7ad9788';g.lineWidth=2+rnd()*3;g.beginPath();g.moveTo(18+rnd()*35,35+j*8);g.lineTo(205+rnd()*30,32+j*8);g.stroke();}}
  for(let i=0;i<(kind==='shaker'?580:160);i++){const x=12+rnd()*232,y=kind==='shaker'?30+rnd()*196:90+rnd()*75;g.fillStyle=rnd()<.55?'#292e2aaa':'#98948988';g.fillRect(x,y,1+rnd()*4,1+rnd()*4);}
  g.restore();
 });
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.08,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const vertices=[],uvs=[],indices=[],kinds=['kick','snare','hat','shaker'];
 for(const t of triggers){const base=vertices.length/3,depth={kick:.9,snare:.48,hat:.4,shaker:.8}[t.kind],tile=kinds.indexOf(t.kind),n=3;
  for(let v=0;v<=n;v++)for(let u=0;u<=n;u++){const lateral=(u/n-.5)*BREAKBEAT.stripWidth,along=(v/n-.5)*depth,x=t.x-t.dz*lateral+t.dx*along,z=t.z+t.dx*lateral+t.dz*along;vertices.push(x,terrainHeight(x,z)+.195,z);uvs.push((tile+u/n)/4,v/n);}
  for(let v=0;v<n;v++)for(let u=0;u<n;u++){const a=base+v*(n+1)+u,b=a+n+1;indices.push(a,a+1,b,a+1,b+1,b);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,material);mesh.name='Bohemia Road — extended physical breakbeat';mesh.receiveShadow=true;scene.add(mesh);
 const front=wheels.filter(w=>w.front);let hitCount=0,lastHit=null,strength=1;
 const detector=createRoadDetector(triggers,(trigger,hit)=>{hitCount++;lastHit={kind:trigger.kind,step:trigger.step,...hit};audio.play(trigger.kind,strength);});
 function reset(){detector.reset();audio.stop()}
 function update(dt,speed,active=true){
  audio.setActive(active);mesh.visible=active;
  const c=Math.cos(taxi.rotation.y),s=Math.sin(taxi.rotation.y);
  strength=Math.max(.4,Math.min(1.15,Math.abs(speed)/11.176));
  detector.update(dt,front.map(w=>{const x=w.pivot.position.x,z=w.pivot.position.z;return {x:taxi.position.x+c*x+s*z,z:taxi.position.z-s*x+c*z}}),active);
 }
 return {mesh,triggers,pointAt,start,stepCount,length,path,stepMetres:STEP_METRES,spawn:pointAt(start-18,-.85),update,reset,audio,get hitCount(){return hitCount},get lastHit(){return lastHit}};
}
