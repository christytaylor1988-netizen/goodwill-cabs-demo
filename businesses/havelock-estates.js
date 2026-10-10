// Havelock Road only: fictional agencies, with inexpensive textured property displays.
export const havelockAgencyNames=['Havelock & Finch','Pebblegate Property','Marlow Bay Homes','Eastward Living','Copper Key Estates','Harbourline Homes','Birch & Borough','Saltwick Property','Valehouse Sales','Seabrook & Vale','Lantern Key','Crescent Rooms','Northpier Estates','Alder & Tide','Wrenfield Homes','Coastmark Property'];
const palettes=[['#183a48','#eee7ce','#b79753'],['#7c314b','#fff3df','#d9b49d'],['#e4e1d7','#183948','#9b4b3f'],['#155e66','#ffffff','#74c3bb'],['#282a2d','#eddac3','#be794a'],['#35457a','#ffffff','#b2bcd6'],['#485440','#f2ead7','#a7a986'],['#b35135','#fff4e2','#d9ae75'],['#372b46','#eee9e0','#aa8daf'],['#e9e5d5','#274b45','#63897f'],['#bb962f','#172b32','#f8eab7'],['#235365','#f5f0e1','#7f9eab']];
export function estateMaterial(THREE,shared,s,cache){
 if(cache.has(s.id))return cache.get(s.id);
 const bays=s.width>11?2:1,c=document.createElement('canvas');c.width=1024*bays;c.height=640;const g=c.getContext('2d');
 for(let bay=0;bay<bays;bay++){
  const index=s.estateIndex+bay,[paint,ink,accent]=palettes[index%palettes.length],name=havelockAgencyNames[index%havelockAgencyNames.length];
  g.save();g.translate(bay*1024,0);g.fillStyle=paint;g.fillRect(0,0,1024,640);
  const signHeight=index%3===0?115:99;
  g.fillStyle=accent;g.fillRect(0,5,1024,5);g.fillRect(0,signHeight,1024,6);
  g.fillStyle=ink;g.textAlign='center';g.font=index%3===0?'bold 52px Georgia':index%3===1?'600 49px sans-serif':'bold 47px serif';g.fillText(index%3===1?name.toUpperCase():name,512,65,930);
  g.font='17px sans-serif';g.fillText(['INDEPENDENT ESTATE AGENTS','HOMES • SALES • LETTINGS','LOCAL PROPERTY SPECIALISTS'][index%3],512,91);
  const door=index%2===0?788:30,wx=index%2===0?30:240,ww=746,wy=signHeight+23,wh=426;
  const glass=g.createLinearGradient(0,wy,0,wy+wh);glass.addColorStop(0,'#758e96');glass.addColorStop(.32,'#344b54');glass.addColorStop(1,'#152d35');g.fillStyle=glass;g.fillRect(wx,wy,ww,wh);g.fillRect(door,wy,196,wh+38);
  // Door frame, handle, office lettering and a small opening-hours notice.
  g.strokeStyle=accent;g.lineWidth=9;g.strokeRect(door,wy,196,wh+38);g.fillStyle='#d8d6be';g.fillRect(door+163,wy+233,6,45);g.font='17px sans-serif';g.fillStyle=ink;g.fillText('WELCOME',door+98,wy+111);g.font='13px sans-serif';g.fillText('Property advice',door+98,wy+140);g.fillStyle='#e4dcc5';g.fillRect(door+45,wy+197,102,66);g.fillStyle='#465253';g.font='12px sans-serif';g.fillText('OPEN TODAY',door+96,wy+219);g.fillText('9:00 – 17:30',door+96,wy+240);
  const cols=index%3===0?3:4,rows=index%4===0?3:2,cw=(ww-30)/cols-12,ch=(wh-34)/rows-12;
  for(let col=0;col<cols;col++){g.strokeStyle='#b9c3bd';g.lineWidth=2;const x=wx+20+(col+.5)*(ww-30)/cols;g.beginPath();g.moveTo(x,wy+4);g.lineTo(x,wy+wh-4);g.stroke();}
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const n=index*13+row*cols+col,px=wx+15+col*(ww-30)/cols,py=wy+14+row*(wh-25)/rows,flat=n%3===0;
   g.save();g.translate(px+cw/2,py+ch/2);if(index%3===2)g.rotate(((n%5)-2)*.012);g.translate(-cw/2,-ch/2);
   g.fillStyle='#102026';g.fillRect(3,4,cw,ch);g.fillStyle=n%4===0?'#eee7d3':'#f7f4e9';g.fillRect(0,0,cw,ch);
   const ph=ch*.47,x=7,y=7,pw=cw-14;
   const sky=g.createLinearGradient(0,y,0,y+ph);sky.addColorStop(0,['#85adbf','#a8b8bf','#6f97ad'][n%3]);sky.addColorStop(1,'#d5d7c9');g.fillStyle=sky;g.fillRect(x,y,pw,ph);
   g.fillStyle='#71815d';g.fillRect(x,y+ph*.79,pw,ph*.21);
   const bx=x+pw*.18,by=y+ph*.32,bw=pw*.65,bh=ph*.55;
   g.fillStyle=['#c9b49a','#c5c6b7','#ae8070','#dacfb8'][n%4];g.fillRect(bx,by,bw,bh);
   g.fillStyle='#55534d';g.beginPath();g.moveTo(bx-5,by);g.lineTo(bx+bw*.45,by-ph*.21);g.lineTo(bx+bw+5,by);g.fill();
   const floors=flat?3:2,windows=flat?4:2;for(let f=0;f<floors;f++)for(let w=0;w<windows;w++){const xx=bx+6+w*(bw-8)/windows,yy=by+5+f*(bh-8)/floors;g.fillStyle='#e2dfcf';g.fillRect(xx-1,yy-1,bw/windows*.46+2,bh/floors*.49+2);g.fillStyle='#526a76';g.fillRect(xx,yy,bw/windows*.46,bh/floors*.49);}
   g.fillStyle='#384d50';g.fillRect(bx+bw*.47,by+bh*.64,bw*.12,bh*.36);
   g.fillStyle='#516345';g.beginPath();g.ellipse(x+pw*.08,y+ph*.66,pw*.07,ph*.22,0,0,Math.PI*2);g.fill();
   const state=['FOR SALE','NEW','FOR SALE','SOLD / STC','FOR SALE','NEW'][n%6];g.fillStyle=state==='SOLD / STC'?'#a34236':state==='NEW'?'#a48125':paint;g.fillRect(6,ph+11,cw-12,22);g.fillStyle='#fff9e9';g.textAlign='center';g.font='bold 14px sans-serif';g.fillText(state,cw/2,ph+27,cw-17);
   g.fillStyle='#263b42';g.font=`bold ${rows===3?17:23}px sans-serif`;g.fillText('£'+((flat?155:275)+(n%11)*20)+',000',cw/2,ph+(rows===3?48:52),cw-12);g.font=`${rows===3?11:15}px sans-serif`;g.fillText(flat?(n%2?'2 BED FLAT':'1 BED APARTMENT'):(n%2?'3 BED HOUSE':'2 BED COTTAGE'),cw/2,ph+(rows===3?63:72),cw-12);
   if(rows===2){g.fillStyle='#737c79';g.font='12px sans-serif';g.fillText(['SEA VIEWS','GARDEN • CHAIN FREE','TOWN CENTRE','PERIOD FEATURES'][n%4],cw/2,ph+93,cw-12);}
   g.restore();
  }
  g.strokeStyle=accent;g.lineWidth=10;g.strokeRect(wx,wy,ww,wh);g.fillStyle=paint;g.fillRect(wx+ww/2-4,wy,8,wh);
  // Restrained diagonal reflections preserve readable cards.
  g.fillStyle='#d7eef10b';g.beginPath();g.moveTo(wx+15,wy);g.lineTo(wx+70,wy);g.lineTo(wx+220,wy+wh);g.lineTo(wx+180,wy+wh);g.fill();
  g.fillStyle=ink;g.font='19px sans-serif';g.fillText(['Find your next home','Houses & flats for sale','Your local property people'][index%3],wx+ww/2,605,ww-20);g.fillStyle=accent;g.fillRect(0,627,1024,5);g.restore();
 }
 const tex=shared(new THREE.CanvasTexture(c));tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
 const mat=shared(new THREE.MeshStandardMaterial({map:tex,roughness:.86}));cache.set(s.id,mat);return mat;
}

export const havelockEstateSites = {
  "town-418261567": {
    "buildingId": 418261567,
    "edgeIndex": 5,
    "along": 0.5,
    "width": 16,
    "style": "shop",
    "variant": 2,
    "road": "Havelock Road",
    "sourceUse": "retail",
    "lat": 50.855852049999996,
    "lon": 0.57914945,
    "estateIndex": 0
  },
  "town-307879204": {
    "buildingId": 307879204,
    "edgeIndex": 2,
    "along": 0.5,
    "width": 16,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "convenience",
    "sourceNode": 3452759104,
    "lat": 50.8565984,
    "lon": 0.5780574,
    "estateIndex": 2
  },
  "town-418261574": {
    "buildingId": 418261574,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 5.95,
    "style": "restaurant",
    "variant": 1,
    "road": "Havelock Road",
    "sourceUse": "fast_food",
    "sourceNode": 13006345055,
    "lat": 50.8560924,
    "lon": 0.578695,
    "estateIndex": 4
  },
  "town-1415122306": {
    "buildingId": 1415122306,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 5.53,
    "style": "cafe",
    "variant": 2,
    "road": "Havelock Road",
    "sourceUse": "cafe",
    "sourceNode": 13015482762,
    "lat": 50.8568457,
    "lon": 0.5783076,
    "estateIndex": 5
  },
  "town-418261570": {
    "buildingId": 418261570,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 9.6,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 6
  },
  "town-418261572": {
    "buildingId": 418261572,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 4.03,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 7
  },
  "town-418261573": {
    "buildingId": 418261573,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 4.21,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 8
  },
  "town-418261575": {
    "buildingId": 418261575,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 5.96,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 9
  },
  "town-418261576": {
    "buildingId": 418261576,
    "edgeIndex": 5,
    "along": 0.5,
    "width": 5.79,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 10
  },
  "town-418261577": {
    "buildingId": 418261577,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 4.5,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 11
  },
  "town-418261578": {
    "buildingId": 418261578,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 5.53,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 12
  },
  "town-418261579": {
    "buildingId": 418261579,
    "edgeIndex": 0,
    "along": 0.5,
    "width": 5.07,
    "style": "shop",
    "variant": 0,
    "road": "Havelock Road",
    "sourceUse": "estate_agent",
    "estateIndex": 13
  }
};
