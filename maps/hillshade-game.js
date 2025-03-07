const keyResponse = await fetch("../keys/map-tiler.txt");
const key = await keyResponse.text();
const map = L.map("map");
const mtLayer = L.tileLayer(`https://api.maptiler.com/tiles/hillshade/{z}/{x}/{y}.webp?key=${key}`);

const bounds = new L.LatLngBounds([
    [53.033855, -2.107998],
    [53.597859, -1.515579],
]);

// Add draw control
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

// Add game layers
const ncaResponse = await fetch(
    "../gis/downloads/national-character-areas.geojson"
);

const nca = await ncaResponse.json();

nca.features = nca.features.filter(
    (feature) =>
        feature.properties.nca_name === "Dark Peak" ||
        feature.properties.nca_name === "White Peak" ||
        feature.properties.nca_name === "South West Peak"
);

const peakDistrict = await(
    await fetch("../gis/downloads/peak-district.geojson")
).json();

const peakDistrictLayer = L.geoJSON(peakDistrict, {
    style: { color: "red", fill: false },
});

const centre = bounds.getCenter();

const R = 6378137; // Radius of earth in meters

// https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
function measure(lat1, lon1, lat2, lon2) {
    // generally used geo measurement function
    const dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    const dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
}

// https://stackoverflow.com/questions/7477003/calculating-new-longitude-latitude-from-old-n-meters
function measureX(lat, lon1, lon2) {
    return (Math.PI / 180) * R * Math.cos(lat * Math.PI/180) * (lon1 - lon2);
}

function measureY(lat1, lat2) {
    return (Math.PI / 180) * R * (lat1 - lat2);
}

function moveX(lat, lon, m) {
    return lon + ((m / R) * (180 / Math.PI) / Math.cos(lat * Math.PI/180));
}

function moveY(lat, m) {
    return lat  + ((m / r_earth) * (180 / pi));
}

const height = measureY(bounds.getNorth(), centre.lat); 
const width = height * 420 / 297; // ratio of landscape page

const upperBounds = [
    [bounds.getNorth(), moveX(centre.lat, centre.lng, -width / 2)],
    [centre.lat, moveX(centre.lat, centre.lng, width / 2)]
];

const lowerBounds = [
    [centre.lat, moveX(centre.lat, centre.lng, -width / 2)],
    [bounds.getSouth(), moveX(centre.lat, centre.lng, width / 2)]
];

const upper = L.rectangle(upperBounds, { color: "red", fill: false });
const lower = L.rectangle(lowerBounds, { color: "red", fill: false });

const vertical = L.polyline(
    [
        [bounds.getNorth(), centre.lng],
        [bounds.getSouth(), centre.lng],
    ],
    { color: "red" }
);

const quarters = L.layerGroup([
    upper,
    lower,
    vertical,
]);

map.fitBounds(bounds);

const ancientWoodland = await(
    await fetch("../gis/downloads/ancient-woodland.geojson")
).json();

ancientWoodland.features = ancientWoodland.features.filter(
    (feature) => feature.properties.NAME.length > 1
);

const areas = await(await fetch("../gis/merged/areas.geojson")).json();
const barrows = await(await fetch("../gis/merged/barrows.geojson")).json();
const caves = await(await fetch("../gis/merged/caves.geojson")).json();
const hills = await(await fetch("../gis/merged/hills.geojson")).json();
const markers = await(await fetch("../gis/merged/markers.geojson")).json();
const marshes = await(await fetch("../gis/merged/marshes.geojson")).json();
const paths = await(await fetch("../gis/merged/paths.geojson")).json();
const points = await(await fetch("../gis/merged/points.geojson")).json();
const rivers = await(await fetch("../gis/merged/rivers.geojson")).json();
const stones = await(await fetch("../gis/merged/stones.geojson")).json();
const villages = await(await fetch("../gis/merged/villages.geojson")).json();
const woods = await(await fetch("../gis/merged/woods.geojson")).json();

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
    Map: mtLayer.addTo(map),
    "Peak District": peakDistrictLayer,
    Quarters: quarters,
    "National Character Areas": L.geoJSON(nca, { style: { color: "orange" } }),
    Rivers: L.geoJSON(rivers),
    "Ancient Woodland": L.geoJSON(ancientWoodland, {
        style: { color: "green" },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.NAME);
            layer.on("mouseover", function () {
                layer.openPopup();
            });
            layer.on("mouseout", function () {
                layer.closePopup();
            });
        },
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
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, { radius: 10, color: colour }).bindTooltip(feature.properties.name, { permanent: true });
        },
    });
}