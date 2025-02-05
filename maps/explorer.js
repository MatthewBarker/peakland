const keyResponse = await fetch("http://localhost:3000/keys/os.txt");
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
const bounds = new L.LatLngBounds([[53.033855, -2.107998], [53.597859, -1.515579]]);

L.tileLayer(api).addTo(map);
map.fitBounds(bounds);