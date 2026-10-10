// Five reusable, single-mesh dogs. Decorative only: no collision/AI or extra lights.
const cache=new WeakMap();
export function createDogCompanion(T,index=0){
 let pool=cache.get(T);if(!pool){pool={templates:[],material:new T.MeshStandardMaterial({vertexColors:true,roughness:1}),lead:new T.LineBasicMaterial({color:0x383533})};cache.set(T,pool);}
 const type=index%5;
 if(!pool.templates[type]){
  const profiles=[['small terrier',.28,.42,.17,0x9b815e],['medium dog',.47,.65,.24,0x97704b],['large dog',.66,.82,.30,0x3d3632],['scruffy dog',.40,.55,.25,0xa29578],['sausage dog',.23,.79,.18,0x7c4930]];
  const [name,height,length,width,fur]=profiles[type],positions=[],normals=[],colours=[],unit=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,6,4);
  function part(geo,c,x,y,z,w,h,d,rx=0,rz=0){const m=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,0,rz)),new T.Vector3(w,h,d)),nm=new T.Matrix3().getNormalMatrix(m),colour=new T.Color(c);for(let i=0;i<geo.index.count;i++){const k=geo.index.getX(i),v=new T.Vector3().fromBufferAttribute(geo.attributes.position,k).applyMatrix4(m),n=new T.Vector3().fromBufferAttribute(geo.attributes.normal,k).applyMatrix3(nm).normalize();positions.push(v.x,v.y,v.z);normals.push(n.x,n.y,n.z);colours.push(colour.r,colour.g,colour.b);}}
  const bodyY=height*.78,headY=height+width*.28,headZ=length*.43;
  part(ball,fur,0,bodyY,0,width, height*.40,length*.58);
  for(const side of [-1,1])for(const z of [-length*.31,length*.28])part(unit,fur,side*width*.65,height*.32,z,width*.36,height*.64,width*.4);
  part(ball,fur,0,headY,headZ,width*.77,width*.8,width*.85);
  part(unit,type===2?0x292728:fur,0,headY-.045,headZ+width*.72,width*.88,width*.57,width*.88);
  part(unit,0x222325,0,headY-.02,headZ+width*1.15,width*.5,width*.3,.045);
  for(const side of [-1,1]){part(unit,0x342a23,side*width*.57,headY+(type===0?.16:-.04),headZ-.015,width*.31,type===0?.24:width*1.2,width*.45,0,side*.2);part(unit,0x171818,side*width*.43,headY+.055,headZ+width*.66,.035,.035,.035);}
  part(unit,fur,0,bodyY+.06,-length*.63,.055,type===4?.12:.23,.08,-.55);
  part(unit,0x447e80,0,headY-width*.55,headZ-.04,width*1.6,.055,width*.65);
  if(type===3)for(let j=0;j<9;j++)part(unit,j%2?0x786c56:fur,Math.sin(j*2.4)*width,bodyY+.12,(j/8-.5)*length,.12,.16,.13,0,(j%3-1)*.6);
  const geometry=new T.BufferGeometry();for(const [n,a]of [['position',positions],['normal',normals],['color',colours]])geometry.setAttribute(n,new T.Float32BufferAttribute(a,3));geometry.computeBoundingSphere();
  const group=new T.Group();group.name='Dog walker · '+name;group.userData.dogType=name;
  const dog=new T.Mesh(geometry,pool.material);dog.position.set(.44,0,-.95);group.add(dog);
  const lead=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(.31,.84,.07),new T.Vector3(.39,.63,-.4),new T.Vector3(.44,headY-width*.55,headZ-.99)]),pool.lead);group.add(lead);pool.templates[type]=group;unit.dispose();ball.dispose();
 }
 return pool.templates[type].clone(true);
}
