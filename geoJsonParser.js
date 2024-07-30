const fs = require('fs');

function loadGeoJson(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function getLineStringFeatures(geoJsonData) {
  return geoJsonData.features.filter(feature => feature.geometry.type === 'LineString');
}

function parseLineStringCoordinates(lineStringFeatures) {
  const tracks = {};

  lineStringFeatures.forEach(feature => {
    const id = feature.id || feature.properties["@id"];
    if (!tracks[id]) {
      tracks[id] = [];
    }
    tracks[id].push(...feature.geometry.coordinates);
  });

  return tracks;
}

module.exports = { loadGeoJson, getLineStringFeatures, parseLineStringCoordinates };
