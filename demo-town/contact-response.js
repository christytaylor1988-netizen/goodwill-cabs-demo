// Small rebound normal to scenery; preserve motion along it. Called only on contact.
export function resolveContact(old,next,yaw,velocity,blocked){
 const dx=next.x-old.x,dz=next.z-old.z;
 let nx=0,nz=0;
 for(let i=0;i<16;i++){const a=i*Math.PI/8,x=Math.cos(a),z=Math.sin(a);if(!blocked(next.x+x*.45,next.z+z*.45,yaw)){nx+=x;nz+=z;}}
 let len=Math.hypot(nx,nz);if(len<.01){nx=-dx;nz=-dz;len=Math.hypot(nx,nz)||1;}nx/=len;nz/=len;
 const inward=velocity.vx*nx+velocity.vz*nz;
 // Rebound on an impact, but settle quietly when the throttle presses against
 // the same wall. Repeated centimetre nudges otherwise shake a stationary taxi.
 const impact=inward<-.8,restitution=impact?1.16:1;
 if(inward<0){velocity.vx-=restitution*inward*nx;velocity.vz-=restitution*inward*nz;if(impact){velocity.vx*=.86;velocity.vz*=.86;}}
 velocity.yawRate*=.35;
 const gap=impact?.025:0,dot=dx*nx+dz*nz,tangent={x:old.x+dx-Math.min(0,dot)*nx+nx*gap,z:old.z+dz-Math.min(0,dot)*nz+nz*gap};
 if(!blocked(tangent.x,tangent.z,yaw))return tangent;
 if(!blocked(old.x,old.z,yaw))return old;
 // A rotating chassis or a newly streamed object can overlap slightly: find the nearest clear position.
 for(let r=.1;r<=2;r+=.15)for(let i=0;i<16;i++){const a=Math.atan2(nz,nx)+i*Math.PI/8,x=old.x+Math.cos(a)*r,z=old.z+Math.sin(a)*r;if(!blocked(x,z,yaw))return {x,z};}
 return old;
}
