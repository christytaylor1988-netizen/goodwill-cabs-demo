export function createDrivingHUD(api){
 const menu=document.getElementById('controls'),top=document.getElementById('topbar');menu.prepend(top);
 const button=document.createElement('button');button.id='hudMenuButton';button.textContent='Menu · 1';button.setAttribute('aria-controls','controls');button.setAttribute('aria-expanded','false');document.body.append(button);
 document.getElementById('targetName').after(document.getElementById('distance'));
 const fare=document.createElement('span');fare.id='fareValue';document.getElementById('distance').after(fare);
 const help=document.createElement('div');help.id='hudHelp';help.style.cssText='margin-top:12px;color:#ffdc52';help.textContent='1: compact → menu → clean view → compact. M: map. C: camera. T: Super Turbo. H: headlights. J: toggle jobs off / on.';menu.append(help);
 document.getElementById('guidance').append(document.getElementById('stopTrack'));
 const phone=document.getElementById('driverPhone'),job=document.getElementById('job'),clock=document.getElementById('driverPhoneTime');
 const app=document.createElement('div');app.className='driver-app-screen';phone.insertBefore(app,phone.querySelector('.driver-app-title'));
 for(const child of [phone.querySelector('.driver-app-title'),document.getElementById('miniMapFrame'),phone.querySelector('.driver-map-off'),job])if(child)app.append(child);
 const navState=document.createElement('div');navState.className='driver-job-state';app.append(navState);
 // Read the existing eight-stage day cycle; displaying time never advances it.
 const stageHours=[9,13,17,19,21,23,27,30,33];
 let mode=0,lastJob='',lastFare='',lastTime='';
 function setMode(value){mode=value;document.body.classList.toggle('hud-menu',mode===1);document.body.classList.toggle('hud-clean',mode===2);button.setAttribute('aria-expanded',String(mode===1));button.textContent=mode===1?'Close menu':'Menu · 1';}
 function cycle(){setMode((mode+1)%3)}
 function toggleMenu(){setMode(mode===1?0:1)}
 function toggleClean(){setMode(mode===2?0:2)}
 button.onclick=()=>{toggleMenu();button.blur()};
 function update(){const state=api.state();phone.classList.toggle('phone-map-only',['waiting','off-duty'].includes(state.job));phone.classList.toggle('phone-navigating',['pickup','dropoff'].includes(state.job));navState.hidden=['offer','complete'].includes(state.job);navState.textContent=state.job==='pickup'?'COLLECT PASSENGER':state.job==='dropoff'?'PASSENGER ON BOARD':state.job==='off-duty'?'OFF SHIFT':'ON SHIFT · WAITING FOR JOB';phone.classList.toggle('phone-collapsed',!['offer','complete'].includes(state.job)||document.body.classList.contains('old-time')||document.body.classList.contains('era-1066')||document.body.classList.contains('hyper-active')||mode===2);const stage=((state.phase||0)%1)*8,index=Math.floor(stage),minutes=Math.floor((stageHours[index]+(stageHours[index+1]-stageHours[index])*(stage-index))*60)%1440,time=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');if(time!==lastTime){clock.textContent=time;lastTime=time;}if(state.job!==lastJob){document.body.dataset.job=state.job;lastJob=state.job;}const value=['pickup','dropoff'].includes(state.job)?'Fare £'+(state.quote/100).toFixed(2):'';if(value!==lastFare){fare.textContent=value;lastFare=value;}const pickup=document.getElementById('pickupHUD');if(pickup&&pickup.parentElement!==document.getElementById('speed'))document.getElementById('speed').append(pickup);}
 return {cycle,toggleMenu,toggleClean,update,help,setMode,get mode(){return mode}};
}
