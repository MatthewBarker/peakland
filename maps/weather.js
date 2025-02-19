const key = await fetch("../keys/map-tiler.txt");

maptilersdk.config.apiKey = await key.text();

const map = (window.map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.BACKDROP,
}));

const timeTextDiv = document.getElementById("time-text");
const pointerDataDiv = document.getElementById("pointer-data");
let pointerLngLat = null;

const layers = [
    new maptilerweather.PrecipitationLayer({
        id: "precipitation",
    }),
    new maptilerweather.PressureLayer({
        opacity: 0.8,
        id: "pressure",
    }),
    new maptilerweather.RadarLayer({
        opacity: 0.8,
        id: "radar",
    }),
    new maptilerweather.TemperatureLayer({
        colorramp: maptilerweather.ColorRamp.builtin.TEMPERATURE_3,
        id: "temperature",
    }),
    new maptilerweather.WindLayer({ 
        id: "wind" 
    })
];

let active;

// Called when the animation is progressing
// active.on("tick", (event) => {
//     refreshTime();
//     updatePointerValue(pointerLngLat);
// });

document.getElementById("buttons").addEventListener("click", function (event) {
    changeLayer(event.target.id);
});

function changeLayer(id) {
    if (!active || active.id !== id) {
        for (const layer of layers) {
            if (layer.id !== id) {
                map.setLayoutProperty(layer.id, "visibility", "none");
            }
            else {
                map.setLayoutProperty(id, "visibility", "visible");
                active = layer;
            }            
        }

        const buttons = document.getElementsByClassName('button');
    
        for (const button of buttons) {
            if (button.id === active.id) {
                button.classList.add('active');
              } else {
                button.classList.remove('active');
              }
        }
    }
}

map.on("load", function () {
    map.fitBounds([-2.107998, 53.033855, -1.515579, 53.597859], {
        padding: 20,
    });

    map.setPaintProperty("Water", "fill-color", "rgba(0, 0, 0, 0.4)"); // need to be called Water, don't know why

    for (const layer of layers) {
        map.addLayer(layer, "Water");
        layer.animateByFactor(1);
    }

    changeLayer("wind");
});

// map.on("mouseout", function (evt) {
//     if (!evt.originalEvent.relatedTarget) {
//         pointerDataDiv.innerText = "";
//         pointerLngLat = null;
//     }
// });

// // Update the date time display
// function refreshTime() {
//     const d = temperature.getAnimationTimeDate();
//     timeTextDiv.innerText = d.toString();
// }

// function updatePointerValue(lngLat) {
//     if (!lngLat) return;

//     pointerLngLat = lngLat;
//     const value = active.pickAt(lngLat.lng, lngLat.lat);

//     if (!value) {
//         pointerDataDiv.innerText = "";

//         return;
//     }

//     pointerDataDiv.innerText = `${value.value.toFixed(1)}°`;
// }

// map.on("mousemove", (e) => {
//     updatePointerValue(e.lngLat);
// });
