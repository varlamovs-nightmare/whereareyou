import * as L from 'leaflet';

export function getRandomPoint(min_lon, min_lat, max_lon, max_lat) {
  return {
    'lon': Math.random() * (max_lon - min_lon) + min_lon,
    'lat': Math.random() * (max_lat - min_lat) + min_lat
  };
}

const ekb = {
  NE: ['56.929128', '60.730923'],
  SW: ['56.768982', '60.491112'],
  randomPoint() {
    return getRandomPoint('60.491112', '56.768982', '60.730923', '56.929128');
  }
};

export function createMap(elementId) {
  const neLat = ekb.NE[0];
  const neLng = ekb.NE[1];
  const swLat = ekb.SW[0];
  const swLng = ekb.SW[1];

  const map = new L.Map(elementId);

  const service = new L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZnJ1bWNoZWciLCJhIjoiY2p2dHBwNnc0MWFkZDRhbHF4MDYzNGdnYiJ9.CpcLysWuR3U-eebecVBENw',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery � <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 13,
      id: 'mapbox.streets'
    }
  );

  const bounds = new L.LatLngBounds(new L.LatLng(neLat, neLng), new L.LatLng(swLat, swLng));
  map
    .addLayer(service)
    .fitBounds(bounds);
}
