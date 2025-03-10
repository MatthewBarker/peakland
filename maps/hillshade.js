const key = await fetch("../keys/map-tiler.txt");

maptilersdk.config.apiKey = await key.text();

const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.OUTDOOR,
});

const onLoad = async () => {
    map.addSource("hillshading", {
        "type": "raster-dem",
        "url": "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json"
    });

    map.addLayer(
        {
            "id": "hillshading",
            "source": "hillshading",
            "type": "hillshade",
            paint: {
                "hillshade-illumination-direction": 335,
                "hillshade-exaggeration": 1,
                "hillshade-highlight-color": "white",
                "hillshade-shadow-color": "black",
                "hillshade-accent-color": "black",
            },
        }
    );

    map.fitBounds([-2.107998, 53.033855, -1.515579, 53.597859], {
        padding: 20,
    });
};

map.on("load", onLoad);