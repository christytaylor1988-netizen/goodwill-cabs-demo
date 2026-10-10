// Short, original procedural metal/mechanical one-shots. No looping or music.
export function buildPickupSample(kind,sampleRate=44100){
 const lengths={petrol:.42,coin:.24,spanner:.15,turbo:.34};
 if(!lengths[kind])return null;
 const data=new Float32Array(Math.ceil(lengths[kind]*sampleRate));
 let seed=9071,low=0,body=0;
 const ring=(t,f,decay,phase=0)=>Math.sin(2*Math.PI*f*t+phase)*Math.exp(-t/decay);
 for(let i=0;i<data.length;i++){
  const t=i/sampleRate;
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const noise=seed/2147483648-1;
  low+=(noise-low)*(1-Math.exp(-2*Math.PI*2200/sampleRate));
  body+=(noise-body)*(1-Math.exp(-2*Math.PI*240/sampleRate));
  let v=0;
  if(kind==='petrol'){
   // Weighty pump latch: dry contacts, then a low, warm confirmation.
   for(const [delay,level] of [[0,1],[.038,.48]]){
    const u=t-delay;if(u>=0)v+=level*(.32*(low-body)*Math.exp(-u/.005)+.26*ring(u,145,.013)+.10*ring(u,330,.006));
   }
   const u=t-.070;
   if(u>=0){
    const envelope=(1-Math.exp(-u/.012))*Math.exp(-u/.065);
    // A small downward settling tone, without resonant bell partials.
    const phase=2*Math.PI*(155*u+28*.025*(1-Math.exp(-u/.025)));
    v+=.24*envelope*(Math.sin(phase)+.12*Math.sin(2*phase));
   }
  }else if(kind==='coin'){
   // One crisp ting; inharmonic upper partials fade quickly, without a jingle.
   v=.25*ring(t,1740,.043)+.095*ring(t,2787,.030)+.04*ring(t,3911,.020);
   v+=.035*(low-body)*Math.exp(-t/.008);
  }else if(kind==='spanner'){
   // Two tightly spaced ratchet contacts with a dry, low metal resonance.
   for(const [delay,level] of [[0,1],[.024,.55]]){
    const u=t-delay;if(u>=0)v+=level*(.32*(low-body)*Math.exp(-u/.007)+.17*ring(u,610,.016)+.08*ring(u,1327,.009));
   }
  }else{
   // Compact low whoomp with a modest, clean rising tone.
   v=.38*Math.sin(2*Math.PI*(92*t-35*t*t))*Math.exp(-t/.052);
   v+=.15*Math.sin(2*Math.PI*(290*t+420*t*t))*(1-Math.exp(-t/.009))*Math.exp(-t/.064);
   v+=.20*body*Math.exp(-t/.040);
  }
  // Fast rounded attack and silent tail prevent clicks at buffer boundaries.
  const attack=Math.min(1,t/.0015),tail=Math.min(1,(data.length-1-i)/(sampleRate*.015));
  data[i]=v*attack*tail;
 }
 return data;
}

export function createPickupSound(){
 let context,output,failed=false;
 const buffers=new Map(),voices=new Set();
 function report(error){if(!failed){console.warn('Pickup audio unavailable:',error.message||error);failed=true;}}
 function unlock(event){
  if(failed||event?.repeat||event?.metaKey||event?.ctrlKey||event?.altKey)return;
  if(event?.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(event?.target?.tagName))return;
  try{
   if(!context){
    const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
    context=new AudioContext();output=context.createGain();output.gain.value=.28;output.connect(context.destination);
    for(const kind of ['petrol','coin','spanner','turbo']){
     const data=buildPickupSample(kind,context.sampleRate),buffer=context.createBuffer(1,data.length,context.sampleRate);
     buffer.copyToChannel(data,0);buffers.set(kind,buffer);
    }
   }
   if(context.state!=='running')context.resume().catch(report);
  }catch(error){report(error);}
 }
 function quiet(){for(const voice of voices){try{voice.stop();}catch{}}voices.clear();}
 function visibility(){if(document.hidden)quiet();}
 window.addEventListener('pointerdown',unlock);
 window.addEventListener('keydown',unlock);
 window.addEventListener('pagehide',quiet);
 document.addEventListener('visibilitychange',visibility);
 return {
  play(kind){
   if(failed||!context||context.state!=='running'||document.hidden||!buffers.has(kind))return;
   try{
    if(voices.size>=4){const oldest=voices.values().next().value;oldest.stop();voices.delete(oldest);}
    const source=context.createBufferSource();source.buffer=buffers.get(kind);source.connect(output);
    source.onended=()=>{voices.delete(source);source.disconnect();};voices.add(source);source.start();
   }catch(error){report(error);}
  },
  dispose(){
   quiet();window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);
   window.removeEventListener('pagehide',quiet);document.removeEventListener('visibilitychange',visibility);
   if(context)context.close().catch(()=>{});
  }
 };
}
