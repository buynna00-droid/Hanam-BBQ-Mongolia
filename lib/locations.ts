// User-supplied Google Maps place URL, 2026-11-23.
// !3d/!4d are the place coordinates; the URL's @ coordinates are only its viewport.
export const riverPlazaMap = {
  latitude: 47.8924704,
  longitude: 106.924737,
  url: "https://www.google.com/maps?cid=12885715765301230864",
};
export const romeCenterMap = {
  latitude: 47.913728,
  longitude: 106.9155556,
  url: "https://www.google.com/maps?cid=8180451306157800573",
};
export const branchMaps = [
  { ...riverPlazaMap, name: "River Plaza" },
  { ...romeCenterMap, name: "Rome Center" },
];
