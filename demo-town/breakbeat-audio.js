// Replace each empty array with local sample URLs relative to this module.
// Multiple files per family are round-robin variations; failed loads retain the foley fallback.
export const ROAD_SAMPLES={kick:[],snare:[],hat:[],shaker:[]};
export const ROAD_GAIN={kick:.75,snare:.48,hat:.32,shaker:.36};
// Temporary procedural Foley-style textures, not recordings. No pitched oscillators
// or periodic shaker modulation; each hit is built from irregular contact grains.
export function roadTexture(kind,variant=0,rate=44100){
 const duration={kick:.30,snare:.16,hat:.032,shaker:.25}[kind];
 const data=new Float32Array(Math.ceil(rate*duration));
 let seed=9127+variant*7919+['kick','snare','hat','shaker'].indexOf(kind)*104729;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 // Band-limited contact noise with a rounded attack and a short, damped tail.
 function contact(at,length,gain,lowCut,highCut){
  const start=Math.round(at*rate),count=Math.ceil(length*rate);
  const lowA=1-Math.exp(-2*Math.PI*lowCut/rate),highA=1-Math.exp(-2*Math.PI*highCut/rate);
  let low=0,high=0;
  for(let i=0;i<count&&start+i<data.length;i++){
   const noise=random()*2-1;high+=highA*(noise-high);low+=lowA*(high-low);
   const t=i/rate,attack=Math.min(1,t/.0007),tail=Math.exp(-4*t/length)*Math.min(1,(length-t)/.002);
   data[start+i]+=(high-low)*gain*attack*tail;
  }
 }
 const variation=.9+random()*.2;
 if(kind==='kick'){
  // Loaded tyre entering a depression: soft heavy compression, then bodywork settling.
  contact(0,.23,7,18,170*variation);
  contact(.006,.075,.7,160,1100);
  contact(.030+random()*.012,.16,2.8,30,250);
  contact(.095+random()*.025,.055,.55,100,700);
 }else if(kind==='snare'){
  // Dry seam slap and one or two unequal suspension/underbody knocks.
  contact(0,.063,2.2,160,2400*variation);
  contact(.002,.085,2.4,45,490);
  contact(.014+random()*.008,.027,.95,320,3100);
  contact(.042+random()*.015,.040,.55,140,1500);
 }else if(kind==='hat'){
  // A stone tick: compact contact transient, no pitched ring or sustained hiss.
  contact(0,.012,.95,750,5700*variation);
  contact(.004+random()*.003,.008,.38,350,2900);
 }else if(kind==='shaker'){
  // Loose gravel spat under the chassis. Irregular times/sizes, never an LFO or clock.
  contact(0,.042,.40,240,1800);
  let at=.002;
  while(at<.21){
   const length=.003+random()*.018,gain=(.24+random()*.70)*Math.exp(-at*8);
   contact(at,length,gain,180+random()*700,1700+random()*3300);
   at+=.004+Math.pow(random(),1.4)*.028;
  }
  contact(.027+random()*.020,.040,.36,100,750);
  contact(.085+random()*.030,.050,.20,80,650);
 }
 // Remove residual DC and taper boundaries; retain headroom for simultaneous layers.
 const mean=data.reduce((sum,x)=>sum+x,0)/data.length;
 for(let i=0;i<data.length;i++)data[i]=Math.tanh((data[i]-mean)*1.25)*Math.min(1,i/(rate*.0005),(data.length-1-i)/(rate*.003));
 return data;
}
export function createRoadAudio(){
 let context,master,enabled=true;const buffers={},voices=new Set(),counts={kick:0,snare:0,hat:0,shaker:0};
 function unlock(event){
  if(event?.repeat||event?.metaKey||event?.ctrlKey||event?.altKey||event?.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(event?.target?.tagName))return;
  if(!context){
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   context=new Audio({latencyHint:'interactive'});master=context.createGain();master.gain.value=.65;
   const limiter=context.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=10;limiter.ratio.value=6;limiter.attack.value=.002;limiter.release.value=.08;master.connect(limiter);limiter.connect(context.destination);
   for(const kind of Object.keys(ROAD_SAMPLES)){
    buffers[kind]=[0,1,2].map(v=>{const d=roadTexture(kind,v,context.sampleRate),b=context.createBuffer(1,d.length,context.sampleRate);b.copyToChannel(d,0);return b});
    if(ROAD_SAMPLES[kind].length)Promise.all(ROAD_SAMPLES[kind].map(async path=>{const r=await fetch(new URL(path,import.meta.url));if(!r.ok)throw Error(r.status);return context.decodeAudioData(await r.arrayBuffer())})).then(b=>buffers[kind]=b).catch(e=>console.warn('Road sample fallback:',kind,e));
   }
  }
  context.resume().catch(()=>{});
 }
 function stop(){for(const voice of voices){try{voice.stop()}catch{}}voices.clear();}
 function play(kind,strength=1){
  if(!enabled||document.hidden||context?.state!=='running')return;
  if(voices.size>=24)return;
  const source=context.createBufferSource(),gain=context.createGain(),bank=buffers[kind];
  source.buffer=bank[counts[kind]++%bank.length];gain.gain.value=ROAD_GAIN[kind]*Math.max(.35,Math.min(1.2,strength));source.connect(gain);gain.connect(master);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect()};source.start();
 }
 function visibility(){if(document.hidden)stop()}
 window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',stop);
 return {play,stop,setActive(value){if(enabled&&!value)stop();enabled=value},get state(){return context?.state||'locked'},dispose(){stop();window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',stop);context?.close()}};
}
