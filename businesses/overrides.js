// Hand corrections keyed by stable OSM type/id; refresh the game after editing.
// Supported: hidden, name, buildingId, edgeIndex, along (0–1), width,
// mountingHeight, colour. Placement changes still pass wall/road safety checks.
// Example: 'node/2156436400': {name:'Corrected name', hidden:true}
export const businessOverrides = {
  // Norman Road photo pilot uses fictional names, including this shared premise.
  'way/1381130103': {hidden:true},
  // Duplicate name in the source snapshot: retain only the first mapped record.
  'node/9796887318': {hidden:true},
  'node/4240949496': {width:3, mountingHeight:2.85, wallOffset:.12},
  'node/6786035226': {mountingHeight:2.85, wallOffset:.12},
  'node/9528116517': {mountingHeight:2.85, wallOffset:.12}
};
