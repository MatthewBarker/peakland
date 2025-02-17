const key = await fetch("../keys/map-tiler.txt");

maptilersdk.config.apiKey = await key.text();

const map = new maptilersdk.Map({
    container: "map",
    style: {
        version: 8,
        sources: {
            historic: {
                type: "raster",
                tiles: [
                    "https://api.maptiler.com/tiles/uk-osgb1888/{z}/{x}/{y}",
                ], // 5  different scales from around 1900
            },
        },
        layers: [
            {
                id: "historic",
                type: "raster",
                source: "historic",
                minzoom: 1,
                maxzoom: 16,
            },
        ],
    },
});

const onLoad = async () => {
    map.fitBounds([-2.107998, 53.033855, -1.515579, 53.597859], {
        padding: 20,
    });
};

map.on("load", onLoad);