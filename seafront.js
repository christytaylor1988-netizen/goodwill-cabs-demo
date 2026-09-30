// Local seafront scenery. Shared textures/materials survive the existing tile eviction.
// No interiors, audio, additional lights, or changes to the road/vehicle systems.
export function createSeafront(THREE, api) {
  const {shared, findNearestRoadPoint, roadWidthForType, inPolygon, terrainHeight}=api;
  const sites=new Map([
    [986718095,{kind:'arcade',name:'FUNLAND',colour:'red'}],
    [1301993862,{kind:'arcade',name:'FUNLAND',colour:'red'}],
    [945427895,{kind:'kiosk',name:'SEASIDE GIFTS',colour:'teal'}],
    [945427890,{kind:'kiosk',name:'ICES & ROCK',colour:'coral'}],
    [945427894,{kind:'kiosk',name:'PRIZE EVERY TIME',colour:'mustard'}]
  ]);
  const mats={};
  for(const [name,colour] of Object.entries({red:0xa73532,wall:0xeee0ba,glass:0x344c51,iron:0x272c2b,coral:0x963f48,teal:0x356d70,mustard:0xb48b45,
    cream:0xd7c697,dark:0x16272f,metal:0x7b817b,rust:0x735146,paint:0x887f6c,blue:0x3e5b75}))
    mats[name]=shared(new THREE.MeshStandardMaterial({color:colour,roughness:.85}));
  const bulbs=[0xffd182,0x8bdad3,0xff8593].map(color=>shared(new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8,roughness:.45})));
  const textures=new Map();
  function texture(key,w,h,paint,glow=false){
    if(textures.has(key))return textures.get(key);
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');paint(ctx,w,h);
    const map=shared(new THREE.CanvasTexture(c));map.colorSpace=THREE.SRGBColorSpace;
    const m=shared(new THREE.MeshStandardMaterial({map,roughness:.7,emissive:glow?0xffffff:0x000000,emissiveMap:glow?map:null,emissiveIntensity:glow?.55:0}));
    textures.set(key,m);return m;
  }
  const windows=[0,1].map(variant=>texture('machines'+variant,512,512,(c,w,h)=>{
    c.fillStyle='#101d29';c.fillRect(0,0,w,h);
    // Painted recess, cabinet side planes and tiny coin shelves read through shallow windows.
    const glow=c.createLinearGradient(0,0,0,h);glow.addColorStop(0,'#304f57');glow.addColorStop(.6,'#152431');glow.addColorStop(1,'#0b1017');c.fillStyle=glow;c.fillRect(10,10,w-20,h-20);
    for(let j=0;j<3;j++) {
      const x=14+j*162,y=52+(j%2)*15;
      c.fillStyle=variant?'#2f7f87':'#bd4754';c.fillRect(x,y,148,390);
      c.fillStyle='#f2cc65';c.fillRect(x+7,y+7,134,67);c.fillStyle='#302a36';c.font='900 51px sans-serif';c.textAlign='center';c.fillText('2p',x+75,y+57);
      c.fillStyle='#132531';c.fillRect(x+9,y+82,130,217);
      c.fillStyle='#31606b';c.beginPath();c.moveTo(x+10,y+83);c.lineTo(x+28,y+100);c.lineTo(x+28,y+275);c.lineTo(x+10,y+298);c.fill();
      for(let row=0;row<2;row++) {
        const sy=y+196+row*61;c.fillStyle='#8c9290';c.fillRect(x+25,sy,105,9);
        for(let k=0;k<18;k++){const cx=x+31+(k*19%91),cy=sy-6-(k*11%23);c.fillStyle=k%3?'#c0924a':'#e1b966';c.beginPath();c.ellipse(cx,cy,7,3.5,0,0,Math.PI*2);c.fill()}
      }
      c.strokeStyle='#a9d5d666';c.lineWidth=3;c.strokeRect(x+10,y+83,127,214);c.beginPath();c.moveTo(x+41,y+91);c.lineTo(x+88,y+185);c.stroke();
      c.fillStyle='#ead6a0';c.fillRect(x+22,y+310,105,12);c.fillStyle='#18202c';c.fillRect(x+48,y+345,55,22);
      c.fillStyle='#f6df84';for(let k=0;k<5;k++)c.fillRect(x+13+k*28,y+382,6,6);
    }
    c.fillStyle='#d6d1b31a';c.beginPath();c.moveTo(30,0);c.lineTo(85,0);c.lineTo(330,h);c.lineTo(275,h);c.fill();
  },true));
  const shutter=texture('shutter',256,256,c=>{
    c.fillStyle='#7e8985';c.fillRect(0,0,256,256);
    for(let y=0;y<256;y+=12){c.fillStyle='#afb0a0';c.fillRect(0,y,256,2);c.fillStyle='#475858';c.fillRect(0,y+9,256,3)}
    for(let i=0;i<75;i++){c.fillStyle=i%3?'#704f3880':'#c8c4a755';c.fillRect((i*71)%256,(i*43)%256,2+i%12,4+i%31)}
    c.fillStyle='#d1c9ac';c.fillRect(82,86,96,59);c.fillStyle='#374642';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText('BACK SOON',130,112);c.font='12px sans-serif';c.fillText('(weather permitting)',130,132);
  });
  function sign(name,colour){return texture('sign:'+name,1024,160,c=>{
    c.fillStyle={red:'#a73532',coral:'#852e46',teal:'#245d65',mustard:'#876536'}[colour];c.fillRect(0,0,1024,160);
    c.strokeStyle='#e9d59e';c.lineWidth=6;c.strokeRect(9,9,1006,142);c.fillStyle='#ffe3a0';c.font=name==='FUNLAND'?'bold 91px Georgia, serif':'900 75px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(name,512,82,955);
    // Scuffed edges are fixed at creation, never repainted each frame.
    c.fillStyle='#7c7868';for(let i=0;i<18;i++)c.fillRect(i*59,3+(i%3)*147,9+i%20,5);
  },true)}
  const smallSign=texture('penny',256,256,c=>{c.fillStyle='#dda75d';c.fillRect(0,0,256,256);c.fillStyle='#742e40';c.font='900 135px sans-serif';c.textAlign='center';c.fillText('2p',128,153);c.font='bold 25px sans-serif';c.fillText('PENNY PUSHERS',128,209)},true);
  const cabinet=texture('prize-cabinet',256,512,c=>{
    c.fillStyle='#eee5cc';c.fillRect(0,0,256,512);c.fillStyle='#d2a442';c.fillRect(8,12,240,54);c.fillStyle='#8e2d2a';c.font='bold 28px sans-serif';c.textAlign='center';c.fillText('WIN A PRIZE',128,49);
    c.fillStyle='#23464b';c.fillRect(17,82,222,300);for(let i=0;i<19;i++){c.fillStyle=['#efc44f','#d96e86','#85bbbf','#a4b968'][i%4];c.beginPath();c.arc(35+(i*43)%180,185+(i*37)%178,15,0,7);c.fill()}
    c.strokeStyle='#c5e1de';c.lineWidth=5;c.strokeRect(17,82,222,300);c.fillStyle='#e9d473';c.fillRect(25,401,206,22);c.fillStyle='#16252a';c.fillRect(76,450,108,40);
  },true);
  const used=new Set();
  function decorate(poly,tags,height,id,tile){
    const spec=sites.get(id);if(!spec)return false;
    let face=null;
    for(let i=0;i<poly.outer.length;i++){
      const a=poly.outer[i],b=poly.outer[(i+1)%poly.outer.length],length=a.distanceTo(b);if(length<3)continue;
      const x=(a.x+b.x)/2,z=(a.y+b.y)/2,road=findNearestRoadPoint({x,z},true);if(!road||road.distance>65)continue;
      let nx=-(b.y-a.y)/length,nz=(b.x-a.x)/length;
      if(nx*(road.point.x-x)+nz*(road.point.z-z)<0){nx=-nx;nz=-nz}
      if(inPolygon(x+nx*.4,z+nz*.4,poly))continue;
      // Prefer a broad road-facing frontage, not a narrow corner or service door.
      const score=length-Math.max(0,road.distance-12)*1.5;
      if(!face||score>face.score)face={x,z,nx,nz,length,score,road};
    }
    if(!face)return false;
    const {x,z,nx,nz,length,road}=face,angle=Math.atan2(nx,nz),cos=Math.cos(angle),sin=Math.sin(angle);
    const width=Math.min(length-.25,spec.kind==='arcade'?42:12),top=Math.min(height-.25,spec.kind==='arcade'?4.65:3.15);
    const maxDepth=Math.min(1.1,road.distance-roadWidthForType(road.segment.type)/2-.75);if(maxDepth<.22)return false;
    const baseOffset=terrainHeight(x+nx*.4,z+nz*.4)-Math.max(...poly.outer.map(p=>terrainHeight(p.x,p.y)));
    const point=(u,v)=>({x:x+cos*u+sin*v,z:z-sin*u+cos*v});
    function box(w,h,d,u,y,v,material){const p=point(u,v),m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(p.x,y+baseOffset,p.z);m.rotation.y=angle;m.castShadow=true;m.receiveShadow=true;tile.group.add(m);return m}
    function panel(w,h,u,y,v,material){const p=point(u,v),m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);m.position.set(p.x,y+baseOffset,p.z);m.rotation.y=angle;tile.group.add(m);return m}
    if(spec.kind==='arcade'&&height>top+1){
      // Cream upper storeys with shallow bays and iron balconies, within the existing footprint/clearance.
      box(width,height-top,.06,0,top+(height-top)/2,.04,mats.wall);
      const columns=Math.max(1,Math.floor(width/4.5)),spacing=width/columns;
      for(let level=0;top+1.5+level*2.9<height-.6;level++)for(let i=0;i<columns;i++){
        const u=-width/2+spacing*(i+.5),y=top+1.5+level*2.9,w=Math.min(2.3,spacing-.6),depth=Math.min(.36,maxDepth-.1);
        box(w+.2,2.25,depth,u,y,depth/2+.08,mats.wall);
        panel(w,2.02,u,y,depth+.09,mats.glass);
        for(const f of [-.5,0,.5])box(.055,2.02,.04,u+w*f,y,depth+.12,mats.cream);
        for(const f of [-.5,0,.5])box(w,.055,.04,u,y+f*2,depth+.12,mats.cream);
        box(w+.35,.1,depth+.2,u,y-1.14,(depth+.2)/2,mats.cream);
        const rail=depth+.23;box(w+.3,.045,.04,u,y-.38,rail,mats.iron);
        for(let k=0;k<9;k++)box(.025,.7,.03,u-w/2+w*k/8,y-.77,rail,mats.iron);
        for(const side of [-1,1])box(.035,.045,depth+.12,u+side*(w/2+.12),y-.38,(depth+.12)/2+.05,mats.iron);
        box(w+.4,.13,depth+.22,u,y+1.17,(depth+.22)/2,mats.metal);
      }
    }
    box(width,top,.12,0,top/2,.075,mats[spec.colour]);
    const signH=spec.kind==='arcade'?.9:.58;
    box(width+.08,signH+.14,.2,0,top-signH/2,.16,spec.kind==='arcade'?mats.red:mats.cream);
    if(spec.kind==='arcade'){const n=Math.max(1,Math.floor(width/12));for(let i=0;i<n;i++)panel(Math.min(7.5,width/n-.4),signH,-width/2+width/n*(i+.5),top-signH/2,.272,sign(spec.name,spec.colour));}
    else panel(Math.min(width-.22,spec.name.length*.52),signH,0,top-signH/2,.272,sign(spec.name,spec.colour));
    const openingTop=top-signH-.12,openingH=openingTop-.4;
    const count=Math.max(1,Math.floor(width/(spec.kind==='arcade'?3.2:3.6))),bay=width/count;
    for(let i=0;i<count;i++){
      const u=-width/2+bay*(i+.5),closed=spec.kind==='kiosk'&&(i%2===0||id===945427895);
      box(bay-.12,openingH,.07,u,.4+openingH/2,.155,mats.dark);
      panel(bay-.3,openingH-.13,u,.4+openingH/2,.20,closed?shutter:windows[i%2]);
      if(spec.kind==='arcade'&&i%3===1){panel(bay*.4,openingH-.12,u,.4+openingH/2,.215,mats.dark);box(.06,openingH,.08,u-bay*.21,.4+openingH/2,.25,mats.metal);}
      for(const side of [-1,1])box(.075,openingH+.15,.12,u+side*(bay/2-.10),.4+openingH/2,.23,mats.cream);
      box(bay-.1,.12,.24,u,.34,.24,mats.metal);
      if(!closed)box(bay-.23,.045,.035,u,.4+openingH*.52,.23,mats.metal);
    }
    if(spec.kind==='arcade'){
      panel(.6,.75,-width/2+.38,1.85,.28,smallSign);
      // One shared trio of materials: gentle alternating bulbs, no dynamic light/shadows.
      for(let i=0;i<Math.ceil(width/.65);i++){
        const u=-width/2+.3+i*.65;if(u>width/2-.2)break;
        box(.10,.10,.07,u,top-.055,.3,bulbs[i%3]);
        box(.08,.08,.07,u,top-signH+.055,.3,bulbs[(i+1)%3]);
      }
    }
    // Peeling paint, rust marks and a sagging shallow canopy stay within the pavement margin.
    for(let i=0;i<12;i++)box(.09+(i%4)*.07,.025+(i%3)*.035,.01,-width/2+.15+(i*1.71)%(width-.3),.13+i%3*.06,.145,mats.paint);
    const canopyDepth=Math.min(.75,maxDepth-.15);
    const awning=box(width+.05,.1,canopyDepth,0,openingTop+.03,canopyDepth/2+.12,mats[spec.colour]);
    if(spec.kind==='arcade'){
      awning.rotateX(.18);
      box(width,.25,.06,0,openingTop-.12,canopyDepth+.1,mats.red);
      for(let u=-width/2+3;u<width/2-1;u+=8)panel(Math.min(4.5,width-1),.24,u,openingTop-.12,canopyDepth+.14,sign(spec.name,spec.colour));
      // Shallow physical prize cabinets and one simple ride; no playable interiors.
      const cabinetDepth=Math.min(.43,maxDepth-.28);
      for(let i=0;i<Math.min(4,Math.floor(width/4));i++){
        const u=-width/2+1.4+i*(width-2.8)/Math.max(1,Math.min(4,Math.floor(width/4))-1),v=.25+cabinetDepth/2;
        box(.85,1.8,cabinetDepth,u,.98,v,mats.cream);panel(.77,1.7,u,.98,.255+cabinetDepth,cabinet);
      }
      if(width>9&&maxDepth>.85){
        const u=width*.22,v=.65;box(1.3,.16,.62,u,.12,v,mats.mustard);box(1.1,.42,.5,u,.51,v,mats.red);
        box(.52,.38,.45,u+.12,.9,v,mats.blue);box(.36,.24,.015,u+.12,.91,v+.232,mats.glass);
        for(const side of [-1,1])box(.23,.23,.055,u+side*.36,.31,v+.28,mats.dark);
      }
    }
    if(spec.kind==='kiosk'&&width>5&&maxDepth>.95){
      // A static, salt-worn children's boat ride attached to the frontage.
      const u=width/2-1.1,v=.62;
      box(1.35,.20,.62,u,.20,v,mats.rust);box(.26,.37,.26,u,.48,v,mats.metal);
      box(1.25,.36,.52,u,.78,v,mats.blue);box(.9,.10,.56,u,.99,v,mats.cream);
      box(.23,.48,.43,u+.3,1.13,v,mats[spec.colour]);
      box(.34,.08,.48,u-.23,1.02,v,mats.paint);
    }
    used.add(id);return true;
  }
  function update(time){for(let i=0;i<bulbs.length;i++)bulbs[i].emissiveIntensity=.7+.3*Math.sin(time*1.6+i*2.094)}
  return {decorate,update,sites,used,bulbs,textures};
}
