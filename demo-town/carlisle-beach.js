// Lightweight static beach sculpture and parked excavator opposite The Carlisle.
export function addCarlisleBeach(THREE,{parent,shared,convertPosition,promenadeAt,pavingHeight}){
 const group=new THREE.Group();group.name='Carlisle beach sculpture and parked digger';parent.add(group);
 const material=c=>shared(new THREE.MeshStandardMaterial({color:c,roughness:.85}));
 const metal=material(0x4b5351),yellow=material(0xc7a334),dark=material(0x343938),glass=material(0x476976),red=material(0xc34b38);
 const cube=shared(new THREE.BoxGeometry(1,1,1));
 const box=(g,m,x,y,z,w,h,d,angle=0)=>{const mesh=new THREE.Mesh(cube,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.rotation.z=angle;mesh.castShadow=true;g.add(mesh);return mesh;};
 const height=(x,z)=>{const r=promenadeAt(x),top=pavingHeight(x,r.prom)-.65,t=Math.max(0,Math.min(1,(z-r.prom)/(r.sea-r.prom)));return top*(1-.9*t)-.135*t;};
 const centre=convertPosition(50.8545,.58172).x;
 const sculpture=new THREE.Group(),sx=centre+13,sr=promenadeAt(sx),sz=sr.prom+12;sculpture.position.set(sx,height(sx,sz),sz);group.add(sculpture);
 // Open boat-rib silhouette, with a swept pointed spine.
 const tube=(points,r=.045)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,16,r,4,false),metal);sculpture.add(mesh);};
 tube([[.25,0,0],[.65,1.8,0],[.05,3.65,0],[.7,5.0,0]],.09);
 for(let i=0;i<7;i++){const f=i/6; tube([[.05,3.65,0],[-.7+f*.8,2.2,(f-.5)*1.3],[-1.6+f*2.1,.15,(f-.5)*2.0],[.25,0,0]],.04);}
 const digger=new THREE.Group(),dx=centre-8,dr=promenadeAt(dx),dz=dr.prom+17;digger.position.set(dx,height(dx,dz),dz);digger.rotation.y=-.35;group.add(digger);
 for(const z of [-.95,.95])box(digger,dark,0,.32,z,3.8,.58,.55);
 box(digger,yellow,0,.9,0,3.25,.66,1.8);box(digger,yellow,.8,1.52,0,1.25,.65,1.75);
 box(digger,glass,-.15,1.93,-.1,1.28,1.5,1.25);box(digger,yellow,-.15,2.74,-.1,1.45,.13,1.45);
 for(const x of [-.79,.49])for(const z of [-.73,.53])box(digger,yellow,x,1.93,z,.10,1.52,.10);
 function beam(a,b,w,d,m){const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,z=(a[2]+b[2])/2;box(digger,m,x,y,z,Math.hypot(b[0]-a[0],b[1]-a[1]),w,d,Math.atan2(b[1]-a[1],b[0]-a[0]));}
 beam([-.7,1.3,.7],[-2.5,4.0,.7],.37,.42,yellow);beam([-2.5,4,.7],[-4.2,1.0,.7],.26,.32,yellow);beam([-.8,1.8,.95],[-2.4,3.5,.95],.10,.12,metal);
 box(digger,dark,-4.1,.57,.7,.9,.68,.8,-.3);
 // A few simple safety barrier panels around the stationary machine.
 for(const z of [-2.2,2.2]){box(digger,red,-1,.72,z,8,.18,.12);box(digger,red,-1,.2,z,8,.16,.16);for(let x=-5;x<=3;x+=.5)box(digger,red,x,.46,z,.10,.65,.10);}
}
