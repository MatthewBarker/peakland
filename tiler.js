const key = await fetch("http://localhost:3000/map-tiler-key.txt");

maptilersdk.config.apiKey = await key.text();

const map = new maptilersdk.Map({
    container: "map",
    // style: maptilersdk.MapStyle.OUTDOOR,
    style: {
        version: 8,
        sources: {
            osgb63k1885: {
                type: "raster",
                tiles: [
                    `https://api.maptiler.com/tiles/uk-osgb63k1885/{z}/{x}/{y}.png`,
                ], // 'Hills' edition, 1885-1903
            },

            osgb1888: {
                type: "raster",
                tiles: [
                    `https://api.maptiler.com/tiles/uk-osgb1888/{z}/{x}/{y}`,
                ], // 5  different scales from around 1900
            },

            terrain: {
                type: "raster-dem",
                url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json`,
            },
        },
        layers: [
            {
                id: "osgb63k1885",
                type: "raster",
                source: "osgb1888",
                minzoom: 1,
                maxzoom: 16,
            },

            {
                id: "terrain",
                type: "hillshade",
                source: "terrain",
                paint: {
                    "hillshade-illumination-direction": 335,
                    "hillshade-exaggeration": 1,
                    "hillshade-highlight-color": "white",
                    "hillshade-shadow-color": "black",
                    "hillshade-accent-color": "black",
                },
            }
        ],
    },
});

const popup = new maptilersdk.Popup({
    closeButton: false,
    closeOnClick: false,
});

const addLines = (id, path, colour) => {
    map.addSource(id, {
        type: "geojson",
        data: path,
    });

    map.addLayer({
        id: id,
        type: "line",
        source: id,
        paint: {
            "line-color": colour,
            "line-width": 6,
        },
        layout: {
            visibility: "none",
        },
    });
};

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
    addLines("peakDistrict", "gis/downloads/peak-district.geojson", "yellow");
    addLines("nca", "gis/downloads/national-character-areas.geojson", "orange");
    addLines("ancientWoods", "gis/downloads/ancient-woodland.geojson", "green");
    addLines("rivers", "gis/merged/rivers.geojson", "blue");
    addLines("paths", "gis/merged/paths.geojson", "black");

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
        areas: "Areas",
        barrows: "Barrows",
        caves: "Caves",
        hills: "Hills",
        markers: "Markers",
        marshes: "Marshes",
        paths: "Paths",
        points: "Points",
        stones: "Stones",
        villages: "Villages",
        woods: "Woods",
    };

    const options = {
        showDefault: true,
        showCheckbox: true,
        onlyRendered: false,
        reverseOrder: true,
    };

    map.addControl(
        new MaplibreLegendControl.MaplibreLegendControl(targets, options),
        "bottom-left"
    );
};

map.on("load", onLoad);