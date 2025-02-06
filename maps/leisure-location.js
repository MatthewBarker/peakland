const keyResponse = await fetch("../keys/os.txt");
const key = await keyResponse.text();
const api = "https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key=" + key;

const mapMarkerResponse = await fetch("../assets/map-marker-1.svg");
const mapMarker = await mapMarkerResponse.text();

// setup the EPSG:27700 (British National Grid) projection
const crs = new L.Proj.CRS(
    "EPSG:27700",
    "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs",
    {
        resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
        origin: [-238375.0, 1376256.0],
    }
);

function onLocationFound(e) {
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + e.accuracy + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}

L.Control.Locate = L.Control.extend({
    onAdd: function(map) {
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        const button = L.DomUtil.create("a", "leaflet-control-button", container);

        L.DomEvent.disableClickPropagation(button);
        
        L.DomEvent.on(button, "click", function(){
            map.locate({setView: true, maxZoom: 16});
        });

        container.title = "Locate";
        button.style.cursor = "pointer";
        button.innerHTML = mapMarker;

        return container;
    },

    onRemove: function(map) {}
});

L.control.locate = function(options) {
    return new L.Control.Locate(options);
}

const map = L.map("map", { crs: crs, minZoom: 0, maxZoom: 9 });
const bounds = new L.LatLngBounds([[53.033855, -2.107998], [53.597859, -1.515579]]);

L.tileLayer(api).addTo(map);
map.fitBounds(bounds);
map.on("locationfound", onLocationFound);
map.on("locationerror", onLocationError);
L.control.locate({ position: "topleft" }).addTo(map);