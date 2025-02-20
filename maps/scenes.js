const key = await fetch("../keys/map-tiler.txt");

maptilersdk.config.apiKey = await key.text();

const hills = await(await fetch("../gis/merged/hills.geojson")).json();
const points = await(await fetch("../gis/merged/points.geojson")).json();
const scenes = document.getElementById("scenes");
const merged = hills.features.concat(points.features);

scenes.add(new Option("------Hills------", null));

for (const feature of hills.features) {
    scenes.add(new Option(feature.properties.name));
}

scenes.add(new Option("------Points------", null));

for (const feature of points.features) {
    scenes.add(new Option(feature.properties.name));
}

scenes.onchange = (event) => {
    const scene = merged.find(feature => feature.properties.name === event.target.value);

    if (scene) {
        map.flyTo({ center: (scene.geometry.coordinates) });
    }
};

const map = new maptilersdk.Map({
    container: "map",
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
                    "https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}@2x.png",
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
    center: [-1.858402, 53.382507],
    zoom: 14,
    pitch: 60,
    maxPitch: 85,
    terrain: true,
    terrainControl: true,
});
