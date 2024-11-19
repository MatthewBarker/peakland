const keyResponse = await fetch('http://localhost:3000/key.txt');
const key = await keyResponse.text();
const api = "https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key=" + key;

// suppress leaflet warnings
console.warn = () => { };

// setup the EPSG:27700 (British National Grid) projection
const crs = new L.Proj.CRS("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs", {
    resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
    origin: [-238375.0, 1376256.0]
});

// centre on Mam Tor
const mapOptions = {
    crs: crs,
    minZoom: 0,
    maxZoom: 9,
    center: [53.34917, -1.809498],
    zoom: 3,
};

const map = L.map("map", mapOptions);

// add drawing layer
const drawnItems = L.featureGroup().addTo(map);

map.on(L.Draw.Event.CREATED, function (event) {
    drawnItems.addLayer(event.layer);
    console.log(event.layer.toGeoJSON());
});

// add editing
var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    }
});

map.addControl(drawControl);

map.on(L.Draw.Event.EDITED, function (event) {
    console.log(event.layers.toGeoJSON());
});

function onEachFeature(feature, layer) {
    drawnItems.addLayer(layer);
}

// load peak district
// https://www.planning.data.gov.uk/entity/520006#geojson
// const peakDistrictResponse = await fetch('http://localhost:3000/data/peak-district.geojson');
// const peakDistrict = await peakDistrictResponse.json();

// load roman roads
// https://romanroadsinbritain.info/margary.html
// const romanRoadsResponse = await fetch('http://localhost:3000/data/roman-roads.geojson');
// const romanRoads = await romanRoadsResponse.json();

// load ancient woodland
// https://naturalengland-defra.opendata.arcgis.com/datasets/Defra::ancient-woodland-england/explore?location=53.304770%2C-1.665932%2C9.50
// const ancientWoodlandResponse = await fetch('http://localhost:3000/data/ancient-woodland.geojson');
// const ancientWoodland = await ancientWoodlandResponse.json();

// ancientWoodland.features = ancientWoodland.features.filter((feature) =>
//     feature.properties.NAME.length > 1);

// load national character areas
// https://environment.data.gov.uk/explore/f955fff5-a132-4e25-8c7f-0d43664ff42e?download=true
// const areasResponse = await fetch('http://localhost:3000/data/national-character-areas.geojson');
// const areas = await areasResponse.json();
// const darkPeakFeature = areas.features.find((feature) => feature.properties.nca_name === "Dark Peak");
// const whitePeakFeature = areas.features.find((feature) => feature.properties.nca_name === "White Peak");
// const southWestPeakFeature = areas.features.find((feature) => feature.properties.nca_name === "South West Peak");
// const darkPeakArea = L.geoJSON(darkPeakFeature, {
//     //onEachFeature: onEachFeature, // enable this to edit an existing layer
//     style: { color: "red" }
// });
// const whitePeakArea = L.geoJSON(whitePeakFeature, { style: { color: "green" } });
// const southWestPeakArea = L.geoJSON(southWestPeakFeature, { style: { color: "blue" } });

// const areasGroup = L.layerGroup([
//     darkPeakArea,
//     whitePeakArea,
//     southWestPeakArea
// ]);

// load regions
// const blackHillResponse = await fetch('http://localhost:3000/data/blackHill.geojson');
// const blackHill = await blackHillResponse.json();
// const blackhillRegion = L.geoJSON(blackHill, { style: { color: "red" } });
// const bleaklowResponse = await fetch('http://localhost:3000/data/bleaklow.geojson');
// const bleaklow = await bleaklowResponse.json();
// const bleaklowRegion = L.geoJSON(bleaklow, { style: { color: "green" } });
// const highPeakResponse = await fetch('http://localhost:3000/data/highPeak.geojson');
// const highPeak = await highPeakResponse.json();
// const highPeakRegion = L.geoJSON(highPeak, { style: { color: "blue" } });
// const southWestPeakResponse = await fetch('http://localhost:3000/data/southWestPeak.geojson');
// const southWestPeak = await southWestPeakResponse.json();
// const southWestRegion = L.geoJSON(southWestPeak, { style: { color: "cyan" } });
// const whitePeakResponse = await fetch('http://localhost:3000/data/whitePeak.geojson');
// const whitePeak = await whitePeakResponse.json();
// const whitePeakRegion = L.geoJSON(whitePeak, { style: { color: "magenta" } });
// const easternMoorResponse = await fetch('http://localhost:3000/data/easternMoor.geojson');
// const easternMoor = await easternMoorResponse.json();
// const easternMoorRegion = L.geoJSON(easternMoor, { style: { color: "yellow" } });

// const regionsGroup = L.layerGroup([
//     blackhillRegion,
//     bleaklowRegion,
//     highPeakRegion,
//     southWestRegion,
//     whitePeakRegion,
//     easternMoorRegion
// ]);

// load caves
const cavesResponse = await fetch('http://localhost:3000/data/caves.yaml');
const cavesText = await cavesResponse.text();
const caves = jsyaml.load(cavesText);
const cavesMarkers = caves.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'red' }).bindTooltip(item.name));

// load hills
const hillsResponse = await fetch('http://localhost:3000/data/hills.yaml');
const hillsText = await hillsResponse.text();
const hills = jsyaml.load(hillsText);
const hillsMarkers = hills.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'green' }).bindTooltip(item.name));

// load stones
const stonesResponse = await fetch('http://localhost:3000/data/stones.yaml');
const stonesText = await stonesResponse.text();
const stones = jsyaml.load(stonesText);
const stonesMarkers = stones.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'blue' }).bindTooltip(item.name));

// load woods
const woodsResponse = await fetch('http://localhost:3000/data/woods.yaml');
const woodsText = await woodsResponse.text();
const woods = jsyaml.load(woodsText);
const woodsMarkers = woods.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'yellow' }).bindTooltip(item.name));

// load points
// const pointsResponse = await fetch('http://localhost:3000/data/points.yaml');
// const pointsText = await pointsResponse.text();
// const points = jsyaml.load(pointsText);
// const blackHillMarkers = points.blackHill.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'red' }).bindTooltip(item.name));
// const bleaklowMarkers = points.bleaklow.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'green' }).bindTooltip(item.name));
// const highPeakMarkers = points.highPeak.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'blue' }).bindTooltip(item.name));
// const whitePeakMarkers = points.whitePeak.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'magenta' }).bindTooltip(item.name));
// const easternMoorsMarkers = points.easternMoors.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'yellow' }).bindTooltip(item.name));
// const southWesternPeakMarkers = points.southWesternPeak.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'cyan' }).bindTooltip(item.name));
// const villagesMarkers = points.villages.map((item) => L.circleMarker(item.coords, { radius: 10, color: 'black' }).bindTooltip(item.name));

// const allPoints = points.blackHill.concat(points.bleaklow, points.highPeak,
//     points.whitePeak, points.easternMoors, points.southWesternPeak, points.villages);

// const paths = points.routes.map((route) => {
//     const coords = route.points.map((point) => allPoints.find((item) => item.name == point).coords);

//     return L.polyline(coords, { dashArray: '5' }).bindTooltip(route.name);
// });

// const pointsGroup = L.layerGroup([
//     L.featureGroup(blackHillMarkers),
//     L.featureGroup(bleaklowMarkers),
//     L.featureGroup(highPeakMarkers),
//     L.featureGroup(whitePeakMarkers),
//     L.featureGroup(easternMoorsMarkers),
//     L.featureGroup(southWesternPeakMarkers),
//     L.featureGroup(villagesMarkers),
//     L.featureGroup(paths)
// ]);

// add layer control
const overlay = {
    "Map": L.tileLayer(api).addTo(map),
    // "Peak District": L.geoJSON(peakDistrict, { style: { color: "yellow" } }),
    // "Roman Roads": L.geoJSON(romanRoads),
    // "Ancient Woodland": L.geoJSON(ancientWoodland, { style: { color: "green" },
    //     onEachFeature: function (feature, layer) {
    //         layer.bindTooltip(feature.properties.NAME);
    //     }
    // }),
    // "National Character Areas": areasGroup,
    // "Regions": regionsGroup,
    //"Points": pointsGroup,
    "Caves": await createFeatureGroup('caves.yaml', 'red'),
    "Hills": await createFeatureGroup('hills.yaml', 'green'),
    "Stones": await createFeatureGroup('stones.yaml', 'blue'),
    "Woods": await createFeatureGroup('woods.yaml', 'black'),
};

L.control.layers(null, overlay).addTo(map);

async function createFeatureGroup(name, colour) {
    const response = await fetch('http://localhost:3000/data/' + name);
    const text = await response.text();
    const data = jsyaml.load(text);
    const markers = data.map((item) => L.circleMarker(item.coords, { radius: 10, color: colour }).bindTooltip(item.name));

    return L.featureGroup(markers);
}