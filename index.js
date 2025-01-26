const keyResponse = await fetch("http://localhost:3000/key.txt");
const key = await keyResponse.text();
const api =
  "https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key=" +
  key;

// suppress leaflet warnings
console.warn = () => {};

// setup the EPSG:27700 (British National Grid) projection
const crs = new L.Proj.CRS(
  "EPSG:27700",
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs",
  {
    resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
    origin: [-238375.0, 1376256.0],
  }
);

const mapOptions = {
  crs: crs,
  minZoom: 0,
  maxZoom: 9,
};

const map = L.map("map", mapOptions);
const drawnItems = L.featureGroup().addTo(map);

map.on(L.Draw.Event.CREATED, function (event) {
  drawnItems.addLayer(event.layer);
  console.log(event.layer.toGeoJSON());
});

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
  },
});

map.addControl(drawControl);

map.on(L.Draw.Event.EDITED, function (event) {
  console.log(event.layers.toGeoJSON());
});

function onEachFeature(feature, layer) {
  drawnItems.addLayer(layer);
}

const ncaResponse = await fetch(
  "http://localhost:3000/gis/downloads/national-character-areas.geojson"
);
const nca = await ncaResponse.json();

nca.features = nca.features.filter(
  (feature) =>
    feature.properties.nca_name === "Dark Peak" ||
    feature.properties.nca_name === "White Peak" ||
    feature.properties.nca_name === "South West Peak"
);

const peakDistrict = await (
  await fetch("http://localhost:3000/gis/downloads/peak-district.geojson")
).json();
const peakDistrictLayer = L.geoJSON(peakDistrict, {
  style: { color: "yellow" },
});
const bounds = peakDistrictLayer.getBounds();
const centre = bounds.getCenter();

// lat = y, lng = x
const box = L.rectangle(bounds, { color: "red", fill: false });

const vertical = L.polyline(
  [
    [bounds.getNorth(), centre.lng],
    [bounds.getSouth(), centre.lng],
  ],
  { color: "red" }
);

const horizontal = L.polyline(
  [
    [centre.lat, bounds.getWest()],
    [centre.lat, bounds.getEast()],
  ],
  { color: "red" }
);

const upperHorizontal = L.polyline(
  [
    [centre.lat + (bounds.getNorth() - centre.lat) / 2, bounds.getWest()],
    [centre.lat + (bounds.getNorth() - centre.lat) / 2, bounds.getEast()],
  ],
  { color: "red" }
);

const lowerHorizontal = L.polyline(
  [
    [centre.lat - (centre.lat - bounds.getSouth()) / 2, bounds.getWest()],
    [centre.lat - (centre.lat - bounds.getSouth()) / 2, bounds.getEast()],
  ],
  { color: "red" }
);

const quarters = L.layerGroup([
  box,
  vertical,
  horizontal,
  upperHorizontal,
  lowerHorizontal,
]);

map.fitBounds(bounds);

const ancientWoodland = await (await fetch("http://localhost:3000/gis/downloads/ancient-woodland.geojson")).json();

ancientWoodland.features = ancientWoodland.features.filter((feature) =>
    feature.properties.NAME.length > 1);

const areas = await (
  await fetch("http://localhost:3000/gis/merged/areas.geojson")
).json();
const barrows = await (
  await fetch("http://localhost:3000/gis/merged/barrows.geojson")
).json();
const caves = await (
  await fetch("http://localhost:3000/gis/merged/caves.geojson")
).json();
const hills = await (
  await fetch("http://localhost:3000/gis/merged/hills.geojson")
).json();
const markers = await (
  await fetch("http://localhost:3000/gis/merged/markers.geojson")
).json();
const marshes = await (
  await fetch("http://localhost:3000/gis/merged/marshes.geojson")
).json();
const paths = await (
  await fetch("http://localhost:3000/gis/merged/paths.geojson")
).json();
const points = await (
  await fetch("http://localhost:3000/gis/merged/points.geojson")
).json();
const rivers = await (
  await fetch("http://localhost:3000/gis/merged/rivers.geojson")
).json();
const stones = await (
  await fetch("http://localhost:3000/gis/merged/stones.geojson")
).json();
const villages = await (
  await fetch("http://localhost:3000/gis/merged/villages.geojson")
).json();
const woods = await (
  await fetch("http://localhost:3000/gis/merged/woods.geojson")
).json();

paths.features = paths.features.filter(
  (feature) =>
    feature.properties.name === "Margary 71a" ||
    feature.properties.name === "Margary 71b" ||
    feature.properties.name === "Margary 710a" ||
    feature.properties.name === "Margary 710b" ||
    feature.properties.name === "Margary 711" ||
    feature.properties.name === "Margary 713" ||
    feature.properties.name === "Margary 714" ||
    !feature.properties.name.startsWith("Margary")
);

// add layer control
const overlay = {
  Map: L.tileLayer(api).addTo(map),
  "Peak District": peakDistrictLayer,
  Quarters: quarters,
  "National Character Areas": L.geoJSON(nca, { style: { color: "orange" } }),
  Rivers: L.geoJSON(rivers),
  "Ancient Woodland": L.geoJSON(ancientWoodland, {
      style: { color: "green" },
      onEachFeature: function(feature, layer) {
          layer.bindPopup(feature.properties.NAME);
          layer.on('mouseover', function() { layer.openPopup(); });
          layer.on('mouseout', function() { layer.closePopup(); });
      }
  }),
  Areas: geojsonToMarkerLayer(areas, "orange"),
  Barrows: geojsonToMarkerLayer(barrows, "brown").addTo(map),
  Caves: geojsonToMarkerLayer(caves, "red").addTo(map),
  Hills: geojsonToMarkerLayer(hills, "green").addTo(map),
  Markers: geojsonToMarkerLayer(markers, "gray").addTo(map),
  Marshes: geojsonToMarkerLayer(marshes, "blue").addTo(map),
  Points: geojsonToMarkerLayer(points, "black").addTo(map),
  Stones: geojsonToMarkerLayer(stones, "magenta").addTo(map),
  Villages: geojsonToMarkerLayer(villages, "cyan").addTo(map),
  Woods: geojsonToMarkerLayer(woods, "yellow").addTo(map),
  Paths: L.geoJSON(paths, { style: { color: "black" } }).addTo(map),
};

L.control.layers(null, overlay).addTo(map);

function geojsonToMarkerLayer(geojson, colour) {
  return L.geoJSON(geojson, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.name);
      layer.on("mouseover", function () {
        layer.openPopup();
      });
      layer.on("mouseout", function () {
        layer.closePopup();
      });
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, { radius: 10, color: colour });
    },
  });
}
