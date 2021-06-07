let vehicles = require("./vehicles.json");

let minLat = undefined;
let maxLat = undefined;
let minLong = undefined;
let maxLong = undefined;

vehicles.data.forEach((element) => {
  if (minLat === undefined || minLat > element.attributes.latitude) {
    minLat = element.attributes.latitude;
  }
  if (maxLat === undefined || maxLat < element.attributes.latitude) {
    maxLat = element.attributes.latitude;
  }
  if (minLong === undefined || minLong > element.attributes.longitude) {
    minLong = element.attributes.longitude;
  }
  if (maxLong === undefined || maxLong < element.attributes.longitude) {
    maxLong = element.attributes.longitude;
  }
});

console.log(`Longitude: ${minLong} -> ${maxLong}`);
console.log(`Latitude: ${minLat} -> ${maxLat}`);
