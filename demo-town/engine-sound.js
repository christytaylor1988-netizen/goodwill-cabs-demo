// Audio-only RPM model. Inputs are read from the existing vehicle simulation.
export function createEngineResponse(){
 let gear=0,rpm=740,load=0;
 const up=[7,14,22,31],ratios=[95,88,81,75,70];
 return function step(dt,{speed=0,acceleration=0,throttle=0}={}){
  dt=Math.min(.1,Math.max(0,Number.isFinite(dt)?dt:0));
  speed=Number.isFinite(speed)?speed:0;
  acceleration=Number.isFinite(acceleration)?acceleration:0;
  throttle=Number.isFinite(throttle)?throttle:0;
  const v=Math.abs(speed),reverse=speed<-.1;
  const pulling=Math.max(0,Math.min(1,Math.abs(throttle)));
  const effort=Math.max(0,Math.min(1,acceleration*(reverse?-1:1)/6));
  if(reverse||v<1)gear=0;
  else if(gear<4&&v>up[gear])gear++;
  else if(gear>0&&pulling>.15&&v<up[gear-1]*.72)gear--;
  const moving=Math.min(1,v/1.5);
  const targetLoad=moving*(pulling*.55+effort*.45);
  load+=(targetLoad-load)*(1-Math.exp(-dt/.45));
  const targetRPM=reverse?Math.min(1250,740+v*75+load*90):Math.min(2650,740+v*ratios[gear]+load*180);
  rpm+=(targetRPM-rpm)*(1-Math.exp(-dt/.55));
  return {rpm,gear:reverse?-1:gear+1,load,
   rate:rpm/1500,gain:.032+load*.040+Math.min(v/30,1)*.004,
   cutoff:300+load*340+rpm*.07};
 };
}

// Audio-only brake detection: coasting and reverse propulsion stay silent.
export function brakeSoundResponse({speed=0,acceleration=0,forward=false,reverse=false,handbrake=false,boost=false,brakeEnabled=true}={}){
 const v=Math.abs(speed),pedal=forward?1:reverse?-1:boost?1:0;
 const braking=handbrake||(pedal&&Math.sign(speed)!==pedal);
 const force=brakeEnabled&&braking?Math.max(0,Math.min(1,-acceleration*Math.sign(speed)/10)):0;
 const rolling=Math.min(1,Math.max(0,(v-.2)/18));
 return {gain:.045*Math.pow(force,2.2)*Math.pow(rolling,1.25),cutoff:260+force*300,rate:.78+Math.min(v,35)*.011};
}

export function createEngineSound(){
 const respond=createEngineResponse();
 let context,source,filter,volume,opening,failed=false,disposed=false;
 let texture,textureFilter,textureGain,brake,brakeFilter,brakeGain;
 let active=false;
 function report(error){if(!failed){console.warn('Engine audio unavailable:',error.message||error);failed=true;}}
 function unlock(event){
  if(disposed||failed||event?.repeat||event?.metaKey||event?.ctrlKey||event?.altKey)return;
  if(event?.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(event?.target?.tagName))return;
  try{
   if(!context){
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)return;
    context=new AudioContext();
    volume=context.createGain();volume.gain.value=0;volume.connect(context.destination);
    filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;filter.Q.value=.45;filter.connect(volume);
    textureGain=context.createGain();textureGain.gain.value=0;textureGain.connect(context.destination);
    textureFilter=context.createBiquadFilter();textureFilter.type='lowpass';textureFilter.frequency.value=300;textureFilter.Q.value=.45;textureFilter.connect(textureGain);
    brakeGain=context.createGain();brakeGain.gain.value=0;brakeGain.connect(context.destination);
    brakeFilter=context.createBiquadFilter();brakeFilter.type='lowpass';brakeFilter.frequency.value=400;brakeFilter.Q.value=.5;brakeFilter.connect(brakeGain);
    fetch(new URL('./audio/road-texture.wav',import.meta.url))
     .then(response=>{if(!response.ok)throw new Error('Road texture HTTP '+response.status);return response.arrayBuffer();})
     .then(bytes=>context.decodeAudioData(bytes)).then(buffer=>{
      if(disposed)return;
      texture=context.createBufferSource();texture.buffer=buffer;texture.loop=true;texture.playbackRate.value=740/1500;texture.connect(textureFilter);texture.start();
     }).catch(error=>console.warn('Road texture unavailable:',error.message||error));
    fetch(new URL('./audio/tyre-scrub.wav',import.meta.url))
     .then(response=>{if(!response.ok)throw new Error('Tyre scrub HTTP '+response.status);return response.arrayBuffer();})
     .then(bytes=>context.decodeAudioData(bytes)).then(buffer=>{
      if(disposed)return;
      brake=context.createBufferSource();brake.buffer=buffer;brake.loop=true;brake.connect(brakeFilter);brake.start();
     }).catch(error=>console.warn('Brake audio unavailable:',error.message||error));
   }
   // Resume synchronously from the existing user gesture (including Safari).
   if(context.state!=='running')context.resume().catch(report);
   if(source||opening)return;
   opening=fetch(new URL('./audio/taxi-engine.wav',import.meta.url))
    .then(response=>{if(!response.ok)throw new Error('Engine sample HTTP '+response.status);return response.arrayBuffer()})
    .then(bytes=>context.decodeAudioData(bytes))
    .then(buffer=>{
     if(disposed)return;
     source=context.createBufferSource();source.buffer=buffer;source.loop=true;
     source.playbackRate.value=740/1500;source.connect(filter);source.start();
    }).catch(report);
  }catch(error){report(error)}
 }
 function quiet(){if(context&&context.state!=='closed')for(const gain of [volume,textureGain,brakeGain])gain?.gain.setTargetAtTime(0,context.currentTime,.04);}
 function visibility(){if(document.hidden)quiet();}
 window.addEventListener('pointerdown',unlock);
 window.addEventListener('keydown',unlock);
 document.addEventListener('visibilitychange',visibility);
 window.addEventListener('pagehide',quiet);
 return {
  update(dt,state){
   if(disposed)return;
   active=!!state.active&&!document.hidden;
   const sound=respond(active?dt:0,state);
   if(source&&context.state==='running'){
    const now=context.currentTime;
    source.playbackRate.setTargetAtTime(sound.rate,now,.18);
    filter.frequency.setTargetAtTime(sound.cutoff,now,.25);
   volume.gain.setTargetAtTime(active?sound.gain:0,now,active?.25:.04);
   }
   if(context?.state==='running'){
    const now=context.currentTime,braking=brakeSoundResponse(state);
    if(texture){
     texture.playbackRate.setTargetAtTime(sound.rate,now,.18);
     textureFilter.frequency.setTargetAtTime(300+sound.load*420,now,.25);
     textureGain.gain.setTargetAtTime(active?sound.gain*(.18+sound.load*.32):0,now,active?.20:.04);
    }
    if(brake){
     brake.playbackRate.setTargetAtTime(braking.rate,now,.10);
     brakeFilter.frequency.setTargetAtTime(braking.cutoff,now,.12);
     brakeGain.gain.setTargetAtTime(active?braking.gain:0,now,active&&braking.gain>.001?.055:.09);
    }
   }
   return sound;
  },
  dispose(){
   disposed=true;quiet();window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);
   document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',quiet);
   if(source)source.stop(context.currentTime+.3);
   if(texture)texture.stop(context.currentTime+.3);
   if(brake)brake.stop(context.currentTime+.3);
   if(context)setTimeout(()=>context.close().catch(()=>{}),350);
  }
 };
}
