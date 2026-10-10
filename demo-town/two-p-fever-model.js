// Fixed-step, bounded circle pile. Winnings are minigame-only virtual coins.
export function createPusher(seed=217){
 let rng=seed>>>0;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const coins=[];let nextId=0;
 for(let row=0;row<11;row++)for(let col=0;col<14;col++)coins.push({id:nextId++,x:21+col*29+(row%2)*3,y:120+row*25.5,vx:0,vy:0,fall:0});
 const state={coins,remaining:40,winnings:0,dropX:220,time:0,shelf:106,cooldown:0,events:[]};
 state.aim=x=>state.dropX=Math.max(17,Math.min(423,x));
 state.drop=()=>{if(state.remaining<=0||state.cooldown>0)return false;state.remaining--;state.cooldown=.22;coins.push({id:nextId++,x:state.dropX,y:state.shelf+16,vx:(random()-.5)*13,vy:46,fall:.26});state.events.push('drop');return true;};
 state.step=dt=>{
  dt=Math.min(Math.max(dt,0),1/30);state.time+=dt;state.cooldown=Math.max(0,state.cooldown-dt);const old=state.shelf;state.shelf=106+39*Math.sin(state.time*1.35);const forward=Math.max(0,state.shelf-old);
  for(const c of coins){c.fall=Math.max(0,c.fall-dt);c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=Math.exp(-5*dt);c.vy*=Math.exp(-3.4*dt);if(c.y<state.shelf+14){c.y=state.shelf+14;c.vy=Math.max(c.vy,forward/dt||0);}c.x=Math.max(14,Math.min(426,c.x));}
  // Three small relaxation passes transmit the shelf push through the pile.
  let clink=false;
  for(let pass=0;pass<3;pass++)for(let i=0;i<coins.length;i++)for(let j=i+1;j<coins.length;j++){
   const a=coins[i],b=coins[j],dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)>28||Math.abs(dy)>28)continue;const d=Math.hypot(dx,dy)||.01;if(d>=28)continue;const nx=dx/d,ny=dy/d,over=(28-d)*.51;
   a.x-=nx*over;b.x+=nx*over;a.y-=ny*over;b.y+=ny*over;
   a.x=Math.max(14,Math.min(426,a.x));b.x=Math.max(14,Math.min(426,b.x));a.y=Math.max(state.shelf+14,a.y);b.y=Math.max(state.shelf+14,b.y);
   if(over>1&&pass===0)clink=true;
  }
  if(clink&&Math.floor(state.time*8)!==Math.floor((state.time-dt)*8))state.events.push('clink');
  for(let i=coins.length-1;i>=0;i--)if(coins[i].y>400){coins.splice(i,1);state.winnings++;state.events.push('payout');}
 };
 return state;
}
