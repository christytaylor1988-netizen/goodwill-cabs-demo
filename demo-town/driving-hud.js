export function createDrivingHUD(api){
 const menu=document.getElementById('controls'),top=document.getElementById('topbar');menu.prepend(top);
 const button=document.createElement('button');button.id='hudMenuButton';button.textContent='Resume driving · 1';button.setAttribute('aria-controls','controls');button.setAttribute('aria-expanded','false');menu.prepend(button);
 document.getElementById('targetName').after(document.getElementById('distance'));
 const fare=document.createElement('span');fare.id='fareValue';document.getElementById('distance').after(fare);
 const help=document.createElement('div');help.id='hudHelp';help.style.cssText='margin-top:12px;color:#ffdc52';help.textContent='1: pause / menu. 2: normal → no speed HUD → clean view. M: map. C: camera. T: Super Turbo. H: headlights. J: go online / offline.';menu.append(help);
 document.getElementById('guidance').append(document.getElementById('stopTrack'));
 const phone=document.getElementById('driverPhone'),job=document.getElementById('job');
 document.getElementById('driverPhoneTime')?.remove();
 const app=document.createElement('div');app.className='driver-app-screen';phone.insertBefore(app,phone.querySelector('.driver-app-title'));
 for(const child of [phone.querySelector('.driver-app-title'),document.getElementById('miniMapFrame'),phone.querySelector('.driver-map-off'),job])if(child)app.append(child);
 const realmStats=document.createElement('div');realmStats.className='driver-realm-stats';realmStats.hidden=true;app.append(realmStats);
 const navState=document.createElement('div');navState.className='driver-job-state';app.append(navState);
 let mode=0,lastJob='',lastFare='',lastNav='';
 function setMode(value){mode=value;document.body.classList.toggle('hud-no-speed',mode>0);document.body.classList.toggle('hud-clean',mode===2);}
 function cycle(){setMode((mode+1)%3);update()}
 function toggleMenu(){const open=!document.body.classList.contains('hud-menu');document.body.classList.toggle('hud-menu',open);button.setAttribute('aria-expanded',String(open));api.pause(open)}
 function toggleClean(){setMode(mode===2?0:2)}
 button.onclick=()=>{toggleMenu();button.blur()};
 function update(){const state=api.state(),online=state.online,hyper=document.body.classList.contains('hyper-active'),old=document.body.classList.contains('old-time');
 const badge=document.getElementById('oldTimeReadout');if(badge&&badge.parentElement!==realmStats)realmStats.append(badge);
 let coins=realmStats.querySelector('.hyper-phone-coins');if(!coins){coins=document.createElement('span');coins.className='hyper-phone-coins';realmStats.append(coins)}coins.hidden=!hyper;const coinText=hyper?'COINS · '+(state.coins||0):'';if(coins.textContent!==coinText)coins.textContent=coinText;realmStats.hidden=!hyper&&!old;
 if(state.job==='offer'&&mode===2)setMode(1);
 phone.classList.toggle('phone-offline',!online);
 phone.classList.toggle('phone-compact',hyper||old||state.job!=='offer');
 phone.querySelector('.driver-app-title strong').setAttribute('aria-label','GOODWILL CABS · '+(online?'Online':'Offline'));
 phone.classList.toggle('phone-navigating',['pickup','dropoff'].includes(state.job));
 navState.hidden=!hyper&&!old&&['offer','complete'].includes(state.job);
 const title=old?'THE RED LAYER':hyper?'HYPERREALITY':state.job==='pickup'?'COLLECT PASSENGER':state.job==='dropoff'?'PASSENGER ON BOARD':online?'ONLINE':'OFFLINE';
 const message=old?'Collect orbs · find the exit':hyper?'Grab coins · find an exit':state.job==='pickup'?'Drive to your pickup':state.job==='dropoff'?'Drive to your drop-off':online?'Waiting for jobs':'Press J to go online';
 const nav=title+'|'+message;
 if(nav!==lastNav){navState.replaceChildren();const heading=document.createElement('strong'),detail=document.createElement('span');heading.textContent=title;detail.textContent=message;navState.append(heading,detail);lastNav=nav;}
 phone.classList.toggle('phone-collapsed',document.body.classList.contains('era-1066'));
 if(state.job!==lastJob){document.body.dataset.job=state.job;lastJob=state.job;}const value=['pickup','dropoff'].includes(state.job)?'Fare £'+(state.quote/100).toFixed(2):'';if(value!==lastFare){fare.textContent=value;lastFare=value;}const pickup=document.getElementById('pickupHUD');if(pickup&&pickup.parentElement!==document.getElementById('speed'))document.getElementById('speed').append(pickup);}
 return {cycle,toggleMenu,toggleClean,update,help,setMode,get mode(){return mode}};
}
