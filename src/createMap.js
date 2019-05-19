import * as L from 'leaflet';

export function createMap(elementId, onMapClick, boundaries) {
  const neLat = boundaries[0][0];
  const neLng = boundaries[0][1];
  const swLat = boundaries[1][0];
  const swLng = boundaries[1][1];

  const map = new L.Map(elementId);

  map.on('click', (e) => {onMapClick(e, map)});

  const service = new L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      maxZoom: 17,
      id: 'mapbox.streets'
    }
  );

  const bounds = new L.LatLngBounds(new L.LatLng(neLat, neLng), new L.LatLng(swLat, swLng));
  map
    .addLayer(service)
    .fitBounds(bounds);
}
