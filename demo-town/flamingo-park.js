// Roadside boating lake and compact fairground, east of the existing wheel.
const lights=[];
export function setFlamingoTime(time){for(const m of lights)m.emissiveIntensity=(typeof time==='number'?time:time==='night'?1:0)*2.3;}
export function buildFlamingoPark(T,{scene,shared,convertPosition,terrainHeight,objectBox,batchScenery}){
 const g=new T.Group();g.name='Flamingo Park boating lake and fairground';scene.add(g);
 const mat=(c,lit=false)=>{const m=shared(new T.MeshStandardMaterial({color:c,roughness:.75,emissive:lit?c:0,emissiveIntensity:0}));if(lit)lights.push(m);return m};
 const white=mat(0xf1eee0),stone=mat(0xc2b499),blue=mat(0x387998),yellow=mat(0xe7b82e),dark=mat(0x303e40),roof=mat(0x444b48),wood=mat(0x78664c),skin=mat(0xc99978),water=mat(0x518d98),glass=mat(0x627d83),pink=mat(0xee68b1,true),cyan=mat(0x51d7ed,true),gold=mat(0xfbc759,true);
 // A small repeating ripple texture gives the shallow lake a visible water surface.
 const waterCanvas=document.createElement('canvas');waterCanvas.width=waterCanvas.height=128;
 const wc=waterCanvas.getContext('2d');wc.fillStyle='#438a9c';wc.fillRect(0,0,128,128);
 for(let i=0;i<38;i++){const x=(i*47)%128,z=(i*29)%128;wc.strokeStyle=i%3?'rgba(170,224,228,.24)':'rgba(22,82,104,.22)';wc.lineWidth=1;wc.beginPath();wc.ellipse(x,z,5+i%7,1.2,0,0,Math.PI);wc.stroke();}
 const waterTexture=shared(new T.CanvasTexture(waterCanvas));waterTexture.colorSpace=T.SRGBColorSpace;waterTexture.wrapS=waterTexture.wrapT=T.RepeatWrapping;waterTexture.repeat.set(1,1);
 water.map=waterTexture;water.color.setHex(0xffffff);water.roughness=.22;water.metalness=.15;
 const bulbs=[pink,cyan,gold],shirts=[mat(0xaa665d),mat(0x4c7eaa),mat(0x798f5b)];
 const box=(w,h,d,x,y,z,m,angle=0)=>objectBox(g,w,h,d,x,y,z,m,angle);
 const p=(lat,lon)=>convertPosition(lat,lon),base=(q)=>terrainHeight(q.x,q.z);
 function mesh(geo,m,x,y,z,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;g.add(o);return o}
 const sphere=shared(new T.IcosahedronGeometry(1,1));
 function beam(a,b,r,m){const delta=new T.Vector3().subVectors(b,a);const o=mesh(new T.CylinderGeometry(r,r,delta.length(),5),m,0,0,0);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o}
 function line(points,r,m){for(let i=1;i<points.length;i++)beam(points[i-1],points[i],r,m)}
 function surface(ring,m,offset){const shape=new T.Shape(ring.map(q=>new T.Vector2(q.x,-q.z))),geo=new T.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const v=geo.attributes.position;for(let i=0;i<v.count;i++)v.setY(i,base({x:v.getX(i),z:v.getZ(i)})+offset);if(m===water){const uv=geo.attributes.uv;for(let i=0;i<v.count;i++)uv.setXY(i,v.getX(i)/6,v.getZ(i)/6);}geo.computeVertexNormals();const o=new T.Mesh(geo,m);o.receiveShadow=true;g.add(o)}
 // Follow the diagonal Marine Parade edge, leaving the existing pavement and south path open.
 const outline=[[50.85512,.58910],[50.85522,.58916],[50.85536,.58949],[50.85553,.58987],[50.85562,.59023],[50.85558,.59036],[50.85516,.59036],[50.85509,.59022],[50.855085,.58931]].map(q=>p(...q));
 const cx=outline.reduce((s,q)=>s+q.x,0)/outline.length,cz=outline.reduce((s,q)=>s+q.z,0)/outline.length;
 const inner=outline.map(q=>({x:cx+(q.x-cx)*.985,z:cz+(q.z-cz)*.975}));surface(outline,stone,.18);surface(inner,water,.23);
 outline.forEach((a,i)=>{const b=outline[(i+1)%outline.length],len=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(len/2.5);for(let j=0;j<n;j++){const f=j/n,k=(j+1)/n,q={x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f},r={x:a.x+(b.x-a.x)*k,z:a.z+(b.z-a.z)*k};box(.11,1.15,.11,q.x,base(q)+.8,q.z,white);for(const h of [.5,.9,1.3])beam(new T.Vector3(q.x,base(q)+h,q.z),new T.Vector3(r.x,base(r)+h,r.z),.035,white)}});
 // Low oval island inside the lake.
 const island=p(50.85525,.58989);const ring=Array.from({length:32},(_,i)=>({x:island.x+Math.cos(i*Math.PI/16)*7,z:island.z+Math.sin(i*Math.PI/16)*3}));surface(ring,stone,.4);
 function person(x,y,z,i,seated=false){box(.38,.52,.28,x,y+(seated?.75:1.05),z,shirts[i%3]);mesh(sphere,skin,x,y+(seated?1.16:1.46),z,.16,.19,.16);for(const dx of [-.12,.12]){box(.13,seated?.35:.65,.15,x+dx,y+(seated?.3:.35),z+(seated?-.2:0),dark);if(seated)box(.14,.14,.4,x+dx,y+.49,z-.12,dark)}}
 function swan(lat,lon,angle,i){const q=p(lat,lon),y=base(q)+.35,start=g.children.length;mesh(sphere,white,q.x,y+.3,q.z,1.1,.43,1.7);box(1.15,.12,1.3,q.x,y+.65,q.z,dark);for(const dx of [-.83,.83])mesh(sphere,white,q.x+dx,y+.65,q.z+.2,.26,.52,1.05);
  const curve=new T.CatmullRomCurve3([[0,.55,-1],[0,1.2,-1.48],[0,2.05,-1.5],[0,2.3,-1.87]].map(([x,h,z])=>new T.Vector3(q.x+x,y+h,q.z+z)));g.add(new T.Mesh(new T.TubeGeometry(curve,12,.16,6,false),white));mesh(sphere,white,q.x,y+2.28,q.z-1.9,.23,.23,.34);mesh(new T.ConeGeometry(.14,.4,5),yellow,q.x,y+2.21,q.z-2.24).rotation.x=-Math.PI/2;for(const dx of [-.18,.18])mesh(sphere,dark,q.x+dx,y+2.35,q.z-2.03,.035,.035,.035);
  if(i%3!==1)person(q.x,y+.1,q.z,i,true);
  const pivot=new T.Group();pivot.position.set(q.x,y,q.z);for(const child of g.children.slice(start)){child.position.x-=q.x;child.position.y-=y;child.position.z-=q.z;pivot.add(child)}pivot.rotation.y=angle;g.add(pivot);
 }
 [[50.85517,.58933,.4],[50.85524,.58955,-.6],[50.85539,.58976,1.7],[50.85545,.59009,.7],[50.85517,.59017,-1.1],[50.85532,.59026,2.4]].forEach((a,i)=>swan(...a,i));
 // Yellow rails on a blue scaffold in the left-hand (eastern) corner, clear of the cross-path.
 const c=p(50.85510,.59078),cy=base(c),track=[];
 for(let i=0;i<=96;i++){const t=i/96*Math.PI*2,x=c.x+13*Math.cos(t),z=c.z+6*Math.sin(t),h=4.7+3*Math.sin(t*2+.6)+1.6*Math.cos(t);track.push(new T.Vector3(x,cy+h,z))}
 for(const off of [-.42,.42])line(track.map(v=>new T.Vector3(v.x,v.y,v.z+off)),.1,yellow);
 for(let i=0;i<96;i+=3)beam(new T.Vector3(track[i].x,track[i].y,track[i].z-.65),new T.Vector3(track[i].x,track[i].y,track[i].z+.65),.065,yellow);
 for(let i=0;i<96;i+=8){const a=track[i],b=track[(i+8)%96];for(const dz of [-1.1,1.1]){beam(new T.Vector3(a.x,cy+.2,a.z+dz),new T.Vector3(a.x,a.y+.3,a.z+dz),.12,blue);beam(new T.Vector3(a.x,cy+.3,a.z+dz),new T.Vector3(b.x,b.y,b.z+dz),.075,blue)}beam(new T.Vector3(a.x,a.y,a.z-1.1),new T.Vector3(a.x,a.y,a.z+1.1),.1,blue);mesh(sphere,bulbs[(i/8)%3],a.x,a.y+.3,a.z,.18,.18,.18)}
 for(let i=25;i<29;i++){const a=track[i];box(.85,.48,.8,a.x,a.y+.42,a.z,i%2?pink:yellow);box(.6,.28,.55,a.x,a.y+.77,a.z,dark)}
 // Rear amusement huts: dark, single-storey silhouettes rather than generic town houses.
 for(const [lat,lon,w,d] of [[50.85476,.59021,16,8],[50.85484,.59089,12,4]]){const q=p(lat,lon),y=base(q);box(w,2.8,d,q.x,y+1.4,q.z,dark);mesh(new T.CylinderGeometry(0,1,1,4),roof,q.x,y+3.15,q.z,w*.76,1.4,d*.76).rotation.y=Math.PI/4;for(let x=-w/2+1.6;x<w/2;x+=3){box(2,1.4,.1,q.x+x,y+1.35,q.z-d/2-.07,glass);box(2,.13,.12,q.x+x,y+2.4,q.z-d/2-.12,bulbs[Math.floor(x+w)%3])}}
 const ride=p(50.85490,.59035),ry=base(ride);mesh(new T.CylinderGeometry(4,4,.25,16),stone,ride.x,ry+.2,ride.z);box(.3,4,.3,ride.x,ry+2,ride.z,yellow);mesh(new T.ConeGeometry(4.4,1.8,12),pink,ride.x,ry+4.2,ride.z);for(let i=0;i<8;i++){const t=i*Math.PI/4,x=ride.x+Math.cos(t)*3,z=ride.z+Math.sin(t)*3;box(.07,2.7,.07,x,ry+1.7,z,gold);mesh(sphere,i%2?cyan:yellow,x,ry+1,z,.55,.35,.28)}
 for(let i=0;i<5;i++){const q=p(50.85513+i*.000092,.58907+i*.000223),y=base(q);box(1.9,.12,.52,q.x,y+.5,q.z,wood);box(1.9,.5,.1,q.x,y+.8,q.z+.23,wood);for(const dx of [-.7,.7])box(.09,.5,.48,q.x+dx,y+.25,q.z,dark);person(q.x+2,y,q.z,i);if(i%2===0)person(q.x,y+.03,q.z,i+1,true)}
 for(const [lat,lon] of [[50.85498,.58915],[50.85496,.59002],[50.85497,.59037]]){const q=p(lat,lon),y=base(q);box(.12,5,.12,q.x,y+2.5,q.z,blue);box(1.6,.15,.15,q.x,y+5,q.z,blue);for(const dx of [-.6,.6])box(.35,.18,.3,q.x+dx,y+4.9,q.z,gold)}
 // Compact amusement court on the former generic residential-block footprint.
 const court=[[50.85578,.59066],[50.85583,.59155],[50.85534,.59156],[50.85531,.59091],[50.85540,.59066]].map(q=>p(...q));
 surface(court,stone,.12);
 function sign(label,x,y,z,w,m){const c=document.createElement('canvas');c.width=512;c.height=96;const k=c.getContext('2d');k.fillStyle='#203e62';k.fillRect(0,0,512,96);k.fillStyle='#fff2c3';k.font='bold 48px sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText(label,256,50,492);const tex=shared(new T.CanvasTexture(c));tex.colorSpace=T.SRGBColorSpace;const sm=shared(new T.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:0}));lights.push(sm);box(w+.3,.95,.18,x,y,z,m);const o=mesh(new T.PlaneGeometry(w,.78),sm,x,y,z-.11);o.rotation.y=Math.PI;}
 // Blue and yellow perimeter railings with an open entrance facing the road.
 court.forEach((a,i)=>{const b=court[(i+1)%court.length],n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.6);for(let j=0;j<n;j++){const f=j/n;if(i===0&&f>.38&&f<.58)continue;const q={x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f};box(.065,1.4,.065,q.x,base(q)+.85,q.z,j%5?blue:yellow);if(j%5===0)mesh(sphere,gold,q.x,base(q)+1.59,q.z,.1,.1,.1);}for(const h of [.4,1.35]){if(i===0)continue;beam(new T.Vector3(a.x,base(a)+h,a.z),new T.Vector3(b.x,base(b)+h,b.z),.04,blue)}});
 const entry=p(50.85580,.59108),ey=base(entry);for(const dx of [-3.6,3.6])box(.22,3.4,.22,entry.x+dx,ey+1.7,entry.z,blue);sign('TIDETOP FUNFAIR',entry.x,ey+3.2,entry.z,7,pink);
 // Small open sweets kiosk, with a chunky donut emblem and colourful counter display.
 const sweet=p(50.85576,.59140),sy=base(sweet);box(8,2.7,4.5,sweet.x,sy+1.35,sweet.z,white);box(8.4,.3,4.9,sweet.x,sy+2.8,sweet.z,pink);box(7.4,1.5,.16,sweet.x,sy+1.65,sweet.z-2.33,dark);box(7.7,.32,.65,sweet.x,sy+.88,sweet.z-2.5,yellow);sign('SUGAR SPLASH',sweet.x,sy+3.35,sweet.z-2.4,7.5,pink);
 for(let i=0;i<12;i++){const x=sweet.x-3.3+i*.6;mesh(new T.TorusGeometry(.18,.07,5,10),bulbs[i%3],x,sy+1.15,sweet.z-2.65);box(.28,.45,.25,x,sy+1.65,sweet.z-2.4,bulbs[(i+1)%3]);mesh(sphere,bulbs[i%3],x,sy+2.1,sweet.z-2.42,.12,.17,.12)}
 mesh(new T.TorusGeometry(.72,.24,6,16),gold,sweet.x,sy+4.45,sweet.z-2.42);for(let i=0;i<9;i++)box(.35,.24,.1,sweet.x-3.4+i*.85,sy+.38,sweet.z-2.32,bulbs[i%3]);person(sweet.x+.8,sy+.15,sweet.z-1.9,1);
 // Striped carousel canopy and bright little seats.
 const carousel=p(50.85557,.59092),ay=base(carousel);mesh(new T.CylinderGeometry(4.7,4.7,.3,20),blue,carousel.x,ay+.3,carousel.z);box(.25,4.5,.25,carousel.x,ay+2.3,carousel.z,gold);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6,geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([carousel.x,ay+5.6,carousel.z,carousel.x+5*Math.cos(a),ay+3.7,carousel.z+5*Math.sin(a),carousel.x+5*Math.cos(b),ay+3.7,carousel.z+5*Math.sin(b)],3));geo.computeVertexNormals();const m=i%2?white:blue;m.side=T.DoubleSide;g.add(new T.Mesh(geo,m));const x=carousel.x+3.6*Math.cos(a),z=carousel.z+3.6*Math.sin(a);box(.065,3.3,.065,x,ay+2,z,gold);mesh(sphere,bulbs[i%3],x,ay+1,z,.7,.4,.35);mesh(sphere,bulbs[i%3],carousel.x+4.8*Math.cos(a),ay+3.7,carousel.z+4.8*Math.sin(a),.14,.14,.14)}
 // Six colourful balloon cars on a small radial ride.
 const spinner=p(50.85566,.59123),by=base(spinner);mesh(new T.CylinderGeometry(4.8,4.8,.25,18),blue,spinner.x,by+.25,spinner.z);box(.45,3.2,.45,spinner.x,by+1.7,spinner.z,yellow);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,x=spinner.x+3.4*Math.cos(a),z=spinner.z+3.4*Math.sin(a);beam(new T.Vector3(spinner.x,by+2.4,spinner.z),new T.Vector3(x,by+1.1,z),.12,yellow);mesh(sphere,bulbs[i%3],x,by+1.1,z,.8,.48,.7);for(const dx of [-.48,.48])box(.045,1.4,.045,x+dx,by+1.95,z,white);mesh(sphere,i%2?blue:yellow,x,by+3,z,1,.85,1);if(i%2===0)person(x,by+.65,z,i,true)}
 // Low pitched-roof amusement sheds form the rear of the court.
 for(const [lon,label] of [[.59104,'SEASIDE GAMES'],[.59140,'PRIZE PIER']]){const q=p(50.85539,lon),y=base(q);box(16,3,7,q.x,y+1.5,q.z,dark);mesh(new T.CylinderGeometry(0,1,1,4),roof,q.x,y+3.5,q.z,12,1.8,5.4).rotation.y=Math.PI/4;sign(label,q.x,y+2.6,q.z-3.6,12,cyan);for(let i=0;i<5;i++){const x=q.x-6+i*3;box(2.2,1.65,.12,x,y+1.2,q.z-3.56,bulbs[i%3]);box(1.8,1.25,.14,x,y+1.2,q.z-3.65,dark);mesh(sphere,gold,x,y+1.1,q.z-3.76,.32,.32,.08)}}
 for(let i=0;i<8;i++){const q=p(50.85548+(i%3)*.00008,.59075+i*.00009);person(q.x,base(q),q.z,i);}
 batchScenery({group:g});g.userData.area='Flamingo Park';return g;
}
