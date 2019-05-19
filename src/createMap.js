import * as L from 'leaflet';

const ekb = {
  NE: ['56.929128', '60.730923'],
  SW: ['56.768982', '60.491112']
};

export function createMap(elementId, onMapClick) {
  const neLat = ekb.NE[0];
  const neLng = ekb.NE[1];
  const swLat = ekb.SW[0];
  const swLng = ekb.SW[1];

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
