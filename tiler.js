const key = await fetch("http://localhost:3000/map-tiler-key.txt");

maptilersdk.config.apiKey = await key.text();

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.OUTDOOR,
});

const addPoints = (id, path, colour) => {
  map.addSource(id, {
    type: "geojson",
    data: path,
  });

  map.addLayer({
    id: id,
    type: "circle",
    source: id,
    paint: {
      "circle-radius": 10,
      "circle-color": colour,
    },
  });

  const popup = new maptilersdk.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  map.on("mouseenter", id, function (e) {
    const coordinates = e.features[0].geometry.coordinates;
    const name = e.features[0].properties.name;

    popup.setLngLat(coordinates).setHTML(name).addTo(map);
  });

  map.on("mouseleave", id, function () {
    popup.remove();
  });
};

const onLoad = async () => {
  map.addSource("terrain", {
    type: "raster-dem",
    url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json`,
  });

  map.addLayer({
    id: "hillshading",
    source: "terrain",
    type: "hillshade",
    paint: {
      "hillshade-illumination-direction": 335,
      "hillshade-exaggeration": 1,
      "hillshade-highlight-color": "white",
      "hillshade-shadow-color": "black",
      "hillshade-accent-color": "black",
    },
  });

  map.addSource("peakDistrict", {
    type: "geojson",
    data: "gis/downloads/peak-district.geojson",
  });

  map.addSource("nca", {
    type: "geojson",
    data: "gis/downloads/national-character-areas.geojson",
  });

  map.addSource("ancientWoods", {
    type: "geojson",
    data: "gis/downloads/ancient-woodland.geojson",
  });

  map.addSource("rivers", {
    type: "geojson",
    data: "gis/merged/rivers.geojson",
  });

  map.addLayer({
    id: "peakDistrict",
    type: "line",
    source: "peakDistrict",
    paint: {
      "line-color": "yellow",
      "line-width": 6,
    },
  });

  map.addLayer({
    id: "nca",
    type: "line",
    source: "nca",
    paint: {
      "line-color": "orange",
      "line-width": 6,
    },
  });

  map.addLayer({
    id: "ancientWoods",
    type: "line",
    source: "ancientWoods",
    paint: {
      "line-color": "green",
      "line-width": 6,
    },
  });

  map.addLayer({
    id: "rivers",
    type: "line",
    source: "rivers",
    paint: {
      "line-color": "blue",
      "line-width": 6,
    },
  });

  addPoints("areas", "gis/merged/areas.geojson", "orange");
  addPoints("barrows", "gis/merged/barrows.geojson", "brown");
  addPoints("caves", "gis/merged/caves.geojson", "red");
  addPoints("hills", "gis/merged/hills.geojson", "green");
  addPoints("markers", "gis/merged/markers.geojson", "gray");
  addPoints("marshes", "gis/merged/marshes.geojson", "blue");
  addPoints("points", "gis/merged/points.geojson", "black");
  addPoints("stones", "gis/merged/stones.geojson", "magenta");
  addPoints("villages", "gis/merged/villages.geojson", "cyan");
  addPoints("woods", "gis/merged/woods.geojson", "yellow");

  map.fitBounds([-2.107998, 53.033855, -1.515579, 53.597859], {
    padding: 20,
  });

  const targets = {
    peakDistrict: "Peak district",
    nca: "National Character Areas",
    ancientWoods: "Ancient woods",
    rivers: "Rivers",
    areas: "areas",
    barrows: "Barrows",
    caves: "Caves",
    hills: "Hills",
    markers: "Markers",
    marshes: "Marshes",
    points: "Points",
    stones: "Stones",
    villages: "Villages",
    woods: "Woods",
  };

  map.addControl(
    new MaplibreLegendControl.MaplibreLegendControl(targets),
    "bottom-left"
  );
};

map.on("load", onLoad);
