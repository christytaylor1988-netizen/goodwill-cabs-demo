// A small, self-contained Stade scenery study. No audio or driving changes.
export function createStade(THREE, api) {
  const {scene, taxi, terrainHeight, convertPosition, findNearestRoadPoint,
    roadWidthForType, landmarkGroups, landmarkPolys, inRing, batchScenery} = api;
  const centre = convertPosition(50.85602, .59402);
  const scenery = new THREE.Group(); scenery.name = 'Stade fishing equipment'; scene.add(scenery);
  const birds = new THREE.Group(); birds.name = 'Stade gulls'; scene.add(birds);
  const materials = {};
  for (const [name, color] of Object.entries({timber:0x81705a,rope:0xb09c70,net:0x3e5149,
    rust:0x765142,cream:0xd7d1b8,blue:0x537879,red:0x934c38,black:0x242b2a,
    orange:0xc7793e,white:0xe2e0cf,wing:0xb4c0bf,yellow:0xc5a24e})) {
    materials[name] = new THREE.MeshStandardMaterial({color, roughness:.94});
  }
  const occupied = [], perches = [];
  let seed=714; const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  function mesh(g, geo, mat, x=0,y=0,z=0) {
    const m=new THREE.Mesh(geo,materials[mat]);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;
  }
  const box=(g,w,h,d,x,y,z,mat)=>mesh(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
  function line(g, points, radius, mat) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return mesh(g,new THREE.TubeGeometry(curve,Math.max(8,points.length*3),radius,4,false),mat);
  }
  function coil(g,x,y,z,r=.5) {
    for(let j=0;j<3;j++) {
      const m=mesh(g,new THREE.TorusGeometry(r-j*.095,.035,4,24),'rope',x,y+j*.015,z);m.rotation.x=Math.PI/2;
    }
  }
  function crate(g,x,y,z,mat='blue') {
    box(g,.92,.08,.64,x,y+.04,z,mat);
    for(const side of [-1,1])for(let row=0;row<3;row++) {
      box(g,.96,.095,.055,x,y+.12+row*.13,z+side*.31,mat);
      box(g,.055,.095,.64,x+side*.46,y+.12+row*.13,z,mat);
    }
    for(const sx of [-1,1])for(const sz of [-1,1])box(g,.07,.5,.07,x+sx*.44,y+.25,z+sz*.29,'timber');
    box(g,.65,.045,.025,x,y+.34,z+.345,'cream');
  }
  function pot(g,x,y,z) {
    box(g,1.2,.08,.82,x,y+.04,z,'timber');
    for(let k=0;k<5;k++) {
      const xx=x-.56+k*.28,points=[];
      for(let j=0;j<=8;j++){const t=j/8*Math.PI;points.push([xx,y+.08+Math.sin(t)*.6,z+Math.cos(t)*.4])}
      line(g,points,.025,'rust');
    }
    for(let k=0;k<=8;k++) {
      const t=k/8*Math.PI;line(g,[[x-.56,y+.08+Math.sin(t)*.6,z+Math.cos(t)*.4],[x+.56,y+.08+Math.sin(t)*.6,z+Math.cos(t)*.4]],.015,'net');
    }
    const entry=mesh(g,new THREE.TorusGeometry(.18,.035,4,12),'rope',x-.58,y+.34,z);entry.rotation.y=Math.PI/2;
  }
  function gear(g,kind) {
    if(kind===0){pot(g,-.4,0,0);pot(g,.7,0,.1);pot(g,.12,.7,.05);coil(g,-.5,.05,1,.4)}
    else if(kind===1){crate(g,-.45,0,0);crate(g,-.43,.51,0);crate(g,.6,0,.2,'red');coil(g,.55,.52,.2,.3)}
    else {
      const net=mesh(g,new THREE.SphereGeometry(1,10,6),'net',0,.25,0);net.scale.set(1.05,.3,.65);
      for(let j=0;j<6;j++)line(g,[[-.9+j*.33,.1,-.6],[-.7+j*.28,.53,0],[-.9+j*.33,.1,.6]],.018,'rope');
      for(let j=0;j<3;j++)mesh(g,new THREE.SphereGeometry(.16,8,6),j%2?'cream':'orange',-.7+j*.6,.43,.4);
      coil(g,1,.06,0,.42);
    }
  }
  function safe(x,z,r) {
    const road=findNearestRoadPoint({x,z},true);
    if(!road||road.distance<roadWidthForType(road.segment.type)/2+r+.55)return false;
    if(api.isWater(x,z))return false;
    if(occupied.some(p=>Math.hypot(p.x-x,p.z-z)<p.r+r+.3))return false;
    // Check every local building, including ones whose scenery cell is not loaded yet.
    for(const poly of api.localBuildings)for(const [dx,dz] of [[0,0],[r,r],[-r,r],[r,-r],[-r,-r]])
      if(inRing(x+dx,z+dz,poly.outer))return false;
    return true;
  }
  function place(x,z,r,make,yaw=0) {
    if(!safe(x,z,r))return false;
    const g=new THREE.Group();g.position.set(x,terrainHeight(x,z)+.16,z);g.rotation.y=yaw;scenery.add(g);make(g);
    occupied.push({x,z,r,kind:r>4?'boat':'equipment'});return true;
  }
  const huts=landmarkGroups.filter(g=>g.userData.stadeHut);
  for(const [i,hut] of huts.entries()) {
    const a=hut.userData.anchor,b=hut.userData;
    perches.push(new THREE.Vector3(a.x,a.y+b.hutHeight+1.6,a.z));
    let placed=0;
    // Deliberately small clusters: keep the original lanes and hut entrances open.
    for(const [dx,dz] of [[(b.maxX-b.minX)/2+2.1,0],[-(b.maxX-b.minX)/2-2.1,0],[0,(b.maxZ-b.minZ)/2+2.2],[0,-(b.maxZ-b.minZ)/2-2.2]]) {
      if(place(a.x+dx,a.z+dz,1.5,g=>gear(g,i%3),rand()*Math.PI*2))placed++;
      if(placed===2)break;
    }
  }
  function boat(g,colour) {
    // Broad clinker hull, pointed bow, open gunwales and a small working cabin.
    const stations=[[-3.7,.04,.7],[-2.8,.85,.1],[-1.4,1.25,0],[1.5,1.2,0],[3,.82,.25]],p=[],idx=[];
    for(const [z,w,b] of stations)p.push(-w,1.35,z,-w*.6,b+.3,z,w*.6,b+.3,z,w,1.35,z);
    for(let i=0;i<stations.length-1;i++)for(let j=0;j<3;j++){const a=i*4+j,b=a+4;idx.push(a,b,a+1,a+1,b,b+1)}
    idx.push(0,1,2,0,2,3,16,18,17,16,19,18);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();
    const hull=mesh(g,geo,colour);hull.material.side=THREE.DoubleSide;
    for(const side of [-1,1]) {
      line(g,stations.map(([z,w])=>[w*side,1.37,z]),.09,'cream');
      for(let k=0;k<3;k++)line(g,stations.map(([z,w,b])=>[w*(.7+k*.1)*side,b+.45+k*.25,z]),.025,'timber');
    }
    box(g,1.55,.15,4.8,0,.63,0,'timber');box(g,1.4,1.15,1.2,0,1.3,1,'cream');
    box(g,1.05,.48,.035,0,1.57,.38,'black');box(g,1.65,.12,1.45,0,1.93,1,'red');
    box(g,.09,3.8,.09,0,2.15,-.8,'timber');line(g,[[0,4.05,-.8],[-1,1.4,2.5]],.022,'rope');
    for(const z of [-1.8,1.8])box(g,2.8,.3,.34,0,.16,z,'timber');
    coil(g,0,.8,-1.7,.48);
  }
  for(const [lat,lon,yaw,colour] of [[50.85565,.59385,.22,'blue'],[50.85563,.59422,-.35,'red']]) {
    const p=convertPosition(lat,lon);
    for(const [dx,dz] of [[0,0],[0,8],[-8,8],[8,8],[0,16],[-12,16],[12,16]])
      if(place(p.x+dx,p.z+dz,4.4,g=>boat(g,colour),yaw))break;
  }
  // Flatten once, then use the game's existing material batching (no per-frame prop work).
  scenery.updateMatrixWorld(true);const flat=new THREE.Group();
  scenery.traverse(o=>{if(o.isMesh){const m=new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),o.material);flat.add(m);o.geometry.dispose()}});
  scene.remove(scenery);scene.add(flat);batchScenery({group:flat});flat.name='Stade batched equipment';
  const white=materials.white,wing=materials.wing,black=materials.black,yellow=materials.yellow;
  const bodyGeo=new THREE.SphereGeometry(1,8,6),wingGeo=new THREE.BufferGeometry();
  wingGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, .65,.04,.06, 1.1,0,.32, .52,0,.32],3));
  wingGeo.setIndex([0,2,1,0,3,2]);wingGeo.computeVertexNormals();wing.side=THREE.DoubleSide;
  function birdMesh(g,geo,mat,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m}
  const flock=[];
  const groundSpots=[];
  for(let i=0;i<100&&groundSpots.length<5;i++) {
    const x=centre.x+(rand()-.5)*95,z=centre.z+(rand()-.5)*35;
    if(safe(x,z,.35))groundSpots.push(new THREE.Vector3(x,terrainHeight(x,z)+.38,z));
  }
  const beakGeo=new THREE.ConeGeometry(.065,.22,5),legGeo=new THREE.BoxGeometry(.035,.19,.055);
  function makeBird(home,state,extra={}) {
    const g=new THREE.Group();birds.add(g);
    birdMesh(g,bodyGeo,white,0,0,0,.2,.2,.42);
    birdMesh(g,bodyGeo,white,0,.16,-.29,.15,.16,.17);
    birdMesh(g,beakGeo,yellow,0,.13,-.5).rotation.x=-Math.PI/2;
    const wings=[];for(const side of [-1,1]){const pivot=new THREE.Group();pivot.position.set(side*.1,.08,-.1);g.add(pivot);const w=birdMesh(pivot,wingGeo,wing,0,0,0);w.scale.x=side;wings.push(pivot)}
    const legs=[];for(const side of [-1,1])legs.push(birdMesh(g,legGeo,yellow,side*.085,-.22,.08));
    const b={g,wings,legs,home,state,phase:rand()*Math.PI*2,clock:rand()*8,angle:rand()*Math.PI*2,radius:9+rand()*9,
      duration:14+rand()*12,from:home.clone(),flightTarget:home.clone(),away:0,...extra};
    g.position.copy(home);flock.push(b);
  }
  for(let i=0;i<12;i++) {
    const isGround=i<groundSpots.length;
    const home=isGround?groundSpots[i].clone():(perches[(i-groundSpots.length)%Math.max(1,perches.length)]||new THREE.Vector3(centre.x,terrainHeight(centre.x,centre.z)+10,centre.z)).clone();
    makeBird(home,i>=9?'circle':isGround?'walk':'perch');
  }
  let coast=null;const colonies=[];
  function extendCoast(){coast=api.getCoast?.();
  // Deterministic irregular colonies with quiet gaps, always seaward of the road.
  if(coast){const west=convertPosition(50.85,.5395).x,east=convertPosition(50.85,.597).x;
    for(let x=west+25;x<east;x+=135+rand()*125){const r=coast.promenadeAt(x);if(!r)continue;
      if(coast.pierLimits&&x>coast.pierLimits.west-30&&x<coast.pierLimits.east+30)continue;
      const colony={x,count:5+Math.floor(rand()*5)};colonies.push(colony);
      for(let i=0;i<colony.count;i++){const px=x+(rand()-.5)*34,q=coast.promenadeAt(px);if(!q)continue;
        const beach=i%3===0,perched=i%4===1&&!beach;
        const z=beach?q.prom+4+rand()*13:perched?q.prom:q.prom-2-rand()*2;
        if(api.hitsBuilding(px,z,1))continue;
        const ground=(xx,zz)=>{const row=coast.promenadeAt(xx);if(!row)return terrainHeight(xx,zz);if(zz<=row.prom)return coast.pavingHeight(xx,zz);const top=coast.pavingHeight(xx,row.prom)-.65,t=THREE.MathUtils.clamp((zz-row.prom)/(row.sea-row.prom),0,1);return THREE.MathUtils.lerp(top,-.15,t);};
        const home=new THREE.Vector3(px,ground(px,z)+.38+(perched?1.02:0),z);
        makeBird(home,i<2?'circle':perched?'perch':'walk',{coastal:true,colony,ground,rest:perched?'perch':'walk',radius:5+rand()*5,airY:coast.pavingHeight(px,q.prom)+10+rand()*6});
      }
    }
  }
  }
  function launch(b) {
    b.from.copy(b.g.position);b.state='takeoff';b.clock=0;
    // Circle above the hut group; birds do not fly through the hut roofs.
    const height=b.airY??Math.max(...perches.map(p=>p.y),terrainHeight(centre.x,centre.z)+10)+5;
    b.flightTarget.set(b.home.x+Math.cos(b.angle)*b.radius,height,b.home.z+Math.sin(b.angle)*b.radius);
  }
  function update(dt,time) {
    if(!coast)extendCoast();
    const near=Math.hypot(taxi.position.x-centre.x,taxi.position.z-centre.z)<550;
    flat.visible=near;birds.visible=true;
    const closest=flock.filter(b=>b.coastal&&Math.abs(taxi.position.x-b.home.x)<380&&Math.abs(taxi.position.z-b.home.z)<260).sort((a,b)=>Math.abs(a.home.x-taxi.position.x)-Math.abs(b.home.x-taxi.position.x)).slice(0,24);
    const active=new Set(closest);
    for(const b of flock) {
      b.g.visible=b.coastal?active.has(b):near;if(!b.g.visible)continue;
      b.clock+=dt;const p=b.g.position,previous=p.clone();
      const threat=Math.hypot(taxi.position.x-p.x,taxi.position.z-p.z)<10&&Math.abs(taxi.position.y-p.y)<5;
      if((b.state==='walk'||b.state==='perch')&&(threat||b.clock>b.duration))launch(b);
      if(b.state==='walk') {
        const x=b.home.x+Math.sin(time*.55+b.phase)*.7,z=b.home.z+Math.cos(time*.4+b.phase)*.5;
        if(!api.hitsBuilding(x,z,.3)){p.set(x,(b.ground?b.ground(x,z):terrainHeight(x,z))+.38+Math.abs(Math.sin(time*9+b.phase))*.025,z)}
      } else if(b.state==='takeoff') {
        const t=Math.min(1,b.clock/2.4);const horizontal=Math.max(0,(t-.45)/.55);p.lerpVectors(b.from,b.flightTarget,horizontal);p.y=b.from.y+(b.flightTarget.y-b.from.y)*Math.min(1,t/.45);
        if(t===1){b.state='circle';b.clock=0}
      } else if(b.state==='circle') {
        b.angle+=dt*.38;const roof=b.airY!==undefined?b.airY-5:Math.max(...perches.map(p=>p.y),terrainHeight(centre.x,centre.z)+10);
        p.set(b.home.x+Math.cos(b.angle)*b.radius,roof+5+Math.sin(time*.65+b.phase)*1.1,b.home.z+Math.sin(b.angle)*b.radius);
        b.g.rotation.z=Math.sin(b.angle)*.15;
        if(b.clock>b.duration&&Math.hypot(taxi.position.x-b.home.x,taxi.position.z-b.home.z)>14){b.from.copy(p);b.state='land';b.clock=0}
      } else if(b.state==='land') {
        // Approach vertically for the last part, avoiding neighbouring roof geometry.
        const t=Math.min(1,b.clock/4),horizontal=Math.min(1,t/.6);p.lerpVectors(b.from,b.home,horizontal);p.y=b.from.y+(b.home.y-b.from.y)*Math.max(0,(t-.6)/.4);
        if(threat)launch(b);else if(t===1){b.state=b.rest||(b.home.y-terrainHeight(b.home.x,b.home.z)<1?'walk':'perch');b.clock=0;b.g.rotation.z=0}
      }
      const flying=['circle','takeoff','land'].includes(b.state);
      const flapping=b.state==='takeoff'||b.state==='land'||Math.sin(time*.75+b.phase)>.35;
      const flap=flying?(flapping?Math.sin(time*9+b.phase)*.48:.08):1.32;
      b.wings[0].rotation.z=flap;b.wings[1].rotation.z=-flap;
      b.legs.forEach((l,i)=>{l.visible=!flying;l.rotation.x=b.state==='walk'?Math.sin(time*9+i*Math.PI+b.phase)*.3:0});
      const dx=p.x-previous.x,dz=p.z-previous.z;if(Math.hypot(dx,dz)>.0001)b.g.rotation.y=Math.atan2(-dx,-dz);
    }
  }
  return {update,centre,flock,colonies,props:occupied,perches,group:flat};
}

// Only the existing Stade net-hut branch calls this. Other buildings are untouched.
export function detailNetHut(THREE,g,w,d,h,seed,api) {
  const {objectBox,netRoof,tarBlack,iron,foundationMaterial,textSign}=api;
  g.userData.stadeHut=true;g.userData.hutHeight=h;
  objectBox(g,w,h,d,0,h/2,0,tarBlack);netRoof(g,w+.15,d+.15,h);
  for(const side of [-1,1]) {
    for(let y=.25;y<h;y+=.3)objectBox(g,w,.025,.035,0,y,side*(d/2+.025),iron);
    for(let y=1;y<h-.5;y+=2.1){
      const dw=Math.min(w*.53,1.35),z=side*(d/2+.05);
      objectBox(g,dw,1.65,.065,0,y,z,iron);
      for(const x of [-dw/2,dw/2])objectBox(g,.065,1.8,.075,x,y,z+side*.04,foundationMaterial);
      objectBox(g,dw+.15,.07,.1,0,y+.87,z,foundationMaterial);
      objectBox(g,dw,.05,.065,0,y-.55,z+side*.045,foundationMaterial);
      const brace=objectBox(g,.065,1.55,.05,0,y,z+side*.09,foundationMaterial);brace.rotation.z=.55;
    }
    // Faded hut number, not an invented shop or business name.
    textSign(g,String(seed%60+1).padStart(2,'0'),.48,.35,-w*.3,2.15,side*(d/2+.13),'#b4aa88','#34382f',side<0?Math.PI:0);
  }
  for(const side of [-1,1])for(let y=.3;y<h;y+=.3)objectBox(g,.025,.025,d,side*(w/2+.018),y,0,iron);
}
