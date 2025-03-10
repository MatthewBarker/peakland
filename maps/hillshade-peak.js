const key = await fetch("../keys/map-tiler.txt");

maptilersdk.config.apiKey = await key.text();

const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.WINTER,
});

const onLoad = async () => {
    map.addSource("hillshading", {
        type: "raster-dem",
        url: "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json",
    });

    map.addLayer({
        id: "hillshading",
        source: "hillshading",
        type: "hillshade",
        paint: {
            "hillshade-illumination-direction": 335,
            "hillshade-exaggeration": 1,
            "hillshade-highlight-color": "white",
            "hillshade-shadow-color": "black",
            "hillshade-accent-color": "black",
        },
    });

    const peakDistrict = await (
        await fetch("../gis/downloads/peak-district.geojson")
    ).json();

    map.addSource("peakDistrict", {
        type: "geojson",
        data: peakDistrict,
    });

    map.addLayer({
        id: "peakDistrict",
        type: "line",
        source: "peakDistrict",
        layout: {},
        paint: {
            "line-color": "red",
        },
    });

    // line coordinates taken from calculations in hillshade.js
    map.addSource("upper", {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [-2.1455586312328414, 53.315857,],
                        [-2.1455586312328414, 53.597859,],
                        [-1.4780183687671589, 53.597859,],
                        [-1.4780183687671589, 53.315857,],
                        [-2.1455586312328414, 53.315857,],
                    ],
                ],
            },
        },
    });

    map.addLayer({
        id: "upper",
        type: "line",
        source: "upper",
        layout: {},
        paint: {
            "line-color": "red",
        },
    });

    map.addSource("lower", {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [-2.1455586312328414, 53.033855],
                        [-2.1455586312328414, 53.315857],
                        [-1.4780183687671589, 53.315857],
                        [-1.4780183687671589, 53.033855],
                        [-2.1455586312328414, 53.033855],
                    ],
                ],
            },
        },
    });

    map.addLayer({
        id: "lower",
        type: "line",
        source: "lower",
        layout: {},
        paint: {
            "line-color": "red",
        },
    });

    map.addSource("vertical", {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [-1.8117885, 53.597859],
                        [-1.8117885, 53.033855],
                    ],
                ],
            },
        },
    });

    map.addLayer({
        id: "vertical",
        type: "line",
        source: "vertical",
        layout: {},
        paint: {
            "line-color": "red",
        },
    });

    map.fitBounds([-2.107998, 53.033855, -1.515579, 53.597859], {
        padding: 20,
    });
};

map.on("load", onLoad);
