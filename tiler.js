maptilersdk.config.apiKey = "0RjFOsJ3u4UQ4R4pvEEn";

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.OUTDOOR,
});

const peakDistrict = await (
  await fetch("http://localhost:3000/gis/downloads/peak-district.geojson")
).json();

const bounds = [Infinity, Infinity, -Infinity, -Infinity];

const findBounds = function (coords) {
  if (Array.isArray(coords[0])) {
    coords.map((coord) => findBounds(coord));
  } else {
    bounds[0] = Math.min(bounds[0], coords[0]);
    bounds[1] = Math.min(bounds[1], coords[1]);
    bounds[2] = Math.max(bounds[2], coords[0]);
    bounds[3] = Math.max(bounds[3], coords[1]);
  }
};

findBounds(peakDistrict.geometry.coordinates);

console.log(bounds);

map.on("load", function () {
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

  console.log(map.addSource("peakDistrict", {
    type: "geojson",
    data: peakDistrict,
  }));

  map.addLayer({
    id: "peakDistrict",
    type: "line",
    source: "peakDistrict",
    layout: {},
    paint: {
      "line-color": "yellow",
      "line-width": 6,
    },
  });

  maptilersdk.helpers.addPolygon(map, {
    data: "gis/downloads/peak-district.geojson",
    fillOpacity: 0.5,
  });

  map.fitBounds(bounds, {
    padding: 20,
  });

  const targets = {
    peakDistrict: "Peak district"
  };

  const options = {
    showDefault: true,
    showCheckbox: true,
    onlyRendered: true,
    reverseOrder: true
  };

  map.addControl(new MaplibreLegendControl.MaplibreLegendControl(targets, options), "bottom-left");
});
