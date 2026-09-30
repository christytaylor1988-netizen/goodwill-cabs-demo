export function createDrivingHUD(api){
 const menu=document.getElementById('controls'),top=document.getElementById('topbar');menu.prepend(top);
 const button=document.createElement('button');button.id='hudMenuButton';button.textContent='Menu · 1';button.setAttribute('aria-controls','controls');button.setAttribute('aria-expanded','false');document.body.append(button);
 const fare=document.createElement('span');fare.id='fareValue';document.getElementById('distance').after(fare);
 const help=document.createElement('div');help.id='hudHelp';help.style.cssText='margin-top:12px;color:#ffdc52';help.textContent='1: compact → menu → clean view → compact. M: map. C: camera. T: Super Turbo. H: headlights.';menu.append(help);
 document.getElementById('guidance').append(document.getElementById('stopTrack'));
 let mode=0,lastJob='',lastFare='';
 function setMode(value){mode=value;document.body.classList.toggle('hud-menu',mode===1);document.body.classList.toggle('hud-clean',mode===2);button.setAttribute('aria-expanded',String(mode===1));button.textContent=mode===1?'Close menu':'Menu · 1';}
 function cycle(){setMode((mode+1)%3)}
 function toggleMenu(){setMode(mode===1?0:1)}
 function toggleClean(){setMode(mode===2?0:2)}
 button.onclick=()=>{toggleMenu();button.blur()};
 function update(){const state=api.state();if(state.job!==lastJob){document.body.dataset.job=state.job;lastJob=state.job;}const value=['pickup','dropoff'].includes(state.job)?'Fare £'+(state.quote/100).toFixed(2):'';if(value!==lastFare){fare.textContent=value;lastFare=value;}const pickup=document.getElementById('pickupHUD');if(pickup&&pickup.parentElement!==document.body)document.body.append(pickup);}
 return {cycle,toggleMenu,toggleClean,update,help,setMode,get mode(){return mode}};
}
