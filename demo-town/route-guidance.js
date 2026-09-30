// Routes use the same directed road graph as the fare system. No physics changes.
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const project=(p,s)=>{const dx=s.b.x-s.a.x,dz=s.b.z-s.a.z,t=Math.max(0,Math.min(1,((p.x-s.a.x)*dx+(p.z-s.a.z)*dz)/(dx*dx+dz*dz)));return {x:s.a.x+dx*t,z:s.a.z+dz*t,t};};
const forward=s=>s.oneway!=='-1',backward=s=>!['yes','1','true'].includes(s.oneway);
export function planRoute(position,yaw,near,target,Heap){
 const s=near.segment,end=target.road,a=project(position,s),b=project(target.stop,end),costs=new Map(),previous=new Map(),heap=new Heap();
 const seed=(node,d)=>{const angle=Math.atan2(node.x-a.x,-(node.z-a.z))+yaw,penalty=Math.cos(angle)<-.25?45:0;const cost=d+penalty;if(cost<(costs.get(node.key)??Infinity)){costs.set(node.key,cost);previous.set(node.key,null);heap.push({node,cost});}};
 if(forward(s))seed(s.nb,distance(a,s.nb));if(backward(s))seed(s.na,distance(a,s.na));
 let best=Infinity,last=null,direct=false;
 if(s===end&&((b.t>=a.t&&forward(s))||(b.t<=a.t&&backward(s)))){const ang=Math.atan2(b.x-a.x,-(b.z-a.z))+yaw;best=distance(a,b)+(Math.cos(ang)<-.25?45:0);direct=true;}
 while(heap.items.length){const {node,cost}=heap.pop();if(cost!==costs.get(node.key)||cost>best)continue;
  const remaining=node===end.na&&forward(end)?distance(node,b):node===end.nb&&backward(end)?distance(node,b):Infinity;
  if(cost+remaining<best){best=cost+remaining;last=node;direct=false;}
  for(const edge of node.edges){const c=cost+edge.length;if(c<(costs.get(edge.to.key)??Infinity)&&c<best){costs.set(edge.to.key,c);previous.set(edge.to.key,node);heap.push({node:edge.to,cost:c});}}
 }
 if(!Number.isFinite(best))return [];
 const nodes=[];if(!direct)for(let n=last;n;n=previous.get(n.key))nodes.push(n);nodes.reverse();
 return [a,...nodes,b].filter((v,i,all)=>!i||distance(v,all[i-1])>.05);
}
export function nextInstruction(points,position,yaw){
 if(points.length<2)return {label:'REJOIN A ROAD',angle:0,distance:0};
 // Discard points already passed between the low-frequency route calculations.
 let first=0,best=Infinity,progress=0;
 for(let i=0;i<Math.min(points.length-1,4);i++){const q=project(position,{a:points[i],b:points[i+1]}),d=distance(q,position);if(d<best){best=d;first=i;progress=q.t;}}
 const a=points[first],b=points[first+1],heading=Math.atan2(b.x-a.x,-(b.z-a.z))+yaw;
 if(Math.cos(heading)<-.45)return {label:'TURN AROUND WHEN SAFE',angle:Math.PI,distance:distance(position,b)};
 let metres=distance(a,b)*(1-progress);
 for(let i=first+1;i<points.length-1;i++){
  const prev=points[i-1],p=points[i],next=points[i+1],ax=p.x-prev.x,az=p.z-prev.z,bx=next.x-p.x,bz=next.z-p.z;
  const turn=Math.atan2(ax*bz-az*bx,ax*bx+az*bz),junction=new Set((p.links||[]).map(n=>n.key)).size>2;
  if(Math.abs(turn)>2.5)return {label:'TURN AROUND WHEN SAFE',angle:Math.PI,distance:metres};
  if(junction||Math.abs(turn)>.55){const right=turn>0;return {label:Math.abs(turn)<.40?'STRAIGHT AT JUNCTION':right?'RIGHT AT JUNCTION':'LEFT AT JUNCTION',angle:Math.abs(turn)<.40?0:right?Math.PI/2:-Math.PI/2,distance:metres};}
  metres+=distance(p,next);
 }
 return {label:'DESTINATION AHEAD',angle:0,distance:metres};
}
