const key = await fetch("../keys/map-tiler.txt");

maptilersdk.config.apiKey = await key.text();

const map = new maptilersdk.Map({
  container: "map", // container id
  style: {
    version: 8,
    sources: {
      elevation: {
        type: "raster-dem",
        tiles: [
          "https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp",
        ],
      },

      images: {
        type: "raster",
        tiles: [
          // "https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}@2x.png"
          // "https://api.maptiler.com/maps/winter-v2/{z}/{x}/{y}@2x.png"
          "https://api.maptiler.com/tiles/uk-osgb63k1955/{z}/{x}/{y}.jpg",
        ],
      },
    },
    layers: [
      {
        id: "images",
        type: "raster",
        source: "images",
        minzoom: 1,
        maxzoom: 15,
      },

      {
        id: "elevation",
        type: "hillshade",
        source: "elevation",
        minzoom: 1,
        maxzoom: 15,
        paint: { "hillshade-exaggeration": 1 },
      },
    ],
  },
  center: [-1.858402, 53.382507], // starting position [lng, lat]
  zoom: 12, // starting zoom
  pitch: 60,
  maxPitch: 85,
  terrain: true,
  terrainControl: true,
});
