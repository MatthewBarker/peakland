const keyResponse = await fetch("../keys/os.txt");
const key = await keyResponse.text();
const api = "https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key=" + key;

// setup the EPSG:27700 (British National Grid) projection
const crs = new L.Proj.CRS(
    "EPSG:27700",
    "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs",
    {
        resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
        origin: [-238375.0, 1376256.0],
    }
);

const map = L.map("map", { crs: crs, minZoom: 0, maxZoom: 9 });

L.tileLayer(api).addTo(map);
map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    const radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);