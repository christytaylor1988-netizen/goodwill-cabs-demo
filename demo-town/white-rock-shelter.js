import {createPedestrian} from './pedestrian-pool.js?v=local-2';
// White Rock's long modernist shelter; fixed to its saved seafront footprint.
export function addWhiteRockShelter(THREE,{scene,shared,convertPosition,terrainHeight,batchScenery,coast}){
 const g=new THREE.Group();g.name='White Rock · modernist seafront shelter';
 const paint=shared(new THREE.MeshStandardMaterial({color:0xdcd9c9,roughness:.94}));
 const red=shared(new THREE.MeshStandardMaterial({color:0x8e3028,roughness:.94}));
 const bench=shared(new THREE.MeshStandardMaterial({color:0x442b24,roughness:1}));
 const grime=shared(new THREE.MeshStandardMaterial({color:0x27251f,roughness:1}));
 const edge=shared(new THREE.MeshStandardMaterial({color:0xbab6aa,roughness:1}));
 const worn=shared(new THREE.MeshStandardMaterial({color:0xaca594,roughness:1}));
 const glass=shared(new THREE.MeshStandardMaterial({color:0xb8cacc,transparent:true,opacity:.25,depthWrite:false,roughness:.65,side:THREE.DoubleSide}));
 function box(w,h,d,x,y,z,m=paint){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=m!==glass;o.receiveShadow=true;g.add(o);return o}
 // Road is local -Z, sea is +Z. Roof projects over the open bays at either end.
 box(21.5,.12,4.5,0,.015,0,edge);
 box(22.2,.14,5.1,0,3.28,0);box(21.7,.15,4.7,0,3.135,0,paint);
 box(20.8,.055,3.95,0,3.035,0,red);
 box(22.3,.045,5.2,0,3.375,0,edge);
 // Glazed back and returns: low panelled base, tall repetitive panes, slim pale mullions.
 box(12.5,.85,.14,0,.53,1.23);box(12.7,.12,.23,0,.15,1.23);
 for(let i=0;i<12;i++){const x=-5.75+i*1.045;
  box(.96,1.83,.022,x,1.96,1.23,glass);
  box(.05,.61,.025,x-.45,.54,1.135);box(.91,.045,.025,x,.25,1.135);
 }
 for(let i=0;i<=12;i++)box(.065,2.8,.12,-6.27+i*1.045,1.64,1.23);
 for(const h of [1.04,2.91])box(12.65,.075,.16,0,h,1.23);
 for(const x of [-6.3,6.3]){
  box(.16,.85,2.4,x,.53,.1);box(.22,.11,2.5,x,.15,.1);
  for(const z of [-.67,.42])box(.024,1.83,1.01,x,1.96,z,glass);
  for(const z of [-1.22,-.12,1.23])box(.12,2.85,.075,x,1.6,z);
  for(const h of [1.04,2.91])box(.16,.075,2.5,x,h,.02);
  box(.3,3,.3,x,1.56,-1.2);box(.4,.13,.4,x,3,-1.2);
 }
 // Single flared column in the middle of each open end bay, matching the end views.
 for(const x of [-8.8,8.8]){
  const profile=[[.23,0],[.23,2.28],[.26,2.48],[.35,2.65],[.52,2.82],[.82,2.96],[.92,3.02]].map(([r,y])=>new THREE.Vector2(r,y));
  const column=new THREE.Mesh(new THREE.LatheGeometry(profile,8),paint);column.position.set(x,.08,-.05);column.castShadow=true;g.add(column);
 }
 // Red slatted long bench and short return seats, with pale metal legs.
 for(let j=0;j<4;j++)box(12,.065,.105,0,.56,.66-j*.12,bench);
 box(12,.16,.065,0,.99,1.105,bench);
 for(let x=-5.5;x<=5.5;x+=1.1){box(.045,.47,.045,x,.3,.31);box(.045,.47,.045,x,.3,.7);}
 for(const side of [-1,1]){
  for(let j=0;j<4;j++)box(.105,.065,1.72,side*(6.03-j*.12),.56,-.2,bench);
  box(.065,.16,1.82,side*6.18,.99,-.2,bench);
  for(const z of [-.85,.3])box(.055,.47,.055,side*5.73,.3,z);
 }
 for(let i=0;i<36;i++)box(.15+(i%5)*.08,.009,.07,-5.7+(i%18)*.65,.598,.30+Math.floor(i/18)*.24,i%3?grime:worn);
 // Restrained chips and weathering, no textures or real lights needed.
 for(let i=0;i<25;i++){const x=-10.4+i*.86;box(.13+(i%3)*.09,.026,.02,x,3.26,-2.56,worn);}
 for(let i=0;i<14;i++)box(.05,.12+(i%4)*.055,.018,-5.9+i*.89,.32,1.315,worn);
 const a=convertPosition(50.8534328,.5725403),b=convertPosition(50.8534708,.5727859);
 const centre=convertPosition(50.853432,.57350),yaw=Math.atan2(-(b.z-a.z),b.x-a.x);
 const promenade=coast?.promenadeAt(centre.x);
 if(promenade)centre.z=promenade.edge+5.5;
 const floor=(coast?.pavingHeight(centre.x,centre.z)??terrainHeight(centre.x,centre.z))+.045;
 // Short plinth follows the promenade slope while keeping the shelter floor level.
 for(let u=-10.25;u<=10.25;u+=.5){const x=centre.x+Math.cos(yaw)*u,z=centre.z-Math.sin(yaw)*u;
  const ground=coast?.pavingHeight(x,z)??terrainHeight(x,z),drop=Math.max(.08,floor-ground+.08);
  box(.51,drop,4.5,u,-drop/2,0,edge);
 }
 g.position.set(centre.x,floor,centre.z);g.rotation.y=yaw;
 const view={x:centre.x,y:floor,z:centre.z,yaw};
 const {g:elder}=createPedestrian(THREE,1,{seated:true});elder.name='Older person resting in White Rock shelter';elder.position.set(-1.6,.16,.58);elder.rotation.y=Math.PI;g.add(elder);g.updateMatrixWorld(true);scene.attach(elder);
 batchScenery({group:g});g.position.set(0,0,0);g.rotation.set(0,0,0);g.userData.shelterView=view;scene.add(g);return g;
}
