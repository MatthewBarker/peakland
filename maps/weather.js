const key = await fetch("../keys/map-tiler.txt");

maptilersdk.config.apiKey = await key.text();

const map = (window.map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.BACKDROP,
}));

const timeTextDiv = document.getElementById("time-text");
const pointerDataDiv = document.getElementById("pointer-data");
const variableNameDiv = document.getElementById("variable-name");
let pointerLngLat = null;

const layers = [
    {
        layer: new maptilerweather.PrecipitationLayer({
            id: "precipitation",
        }),
        value: "value",
        units: " mm",
    },
    {
        layer: new maptilerweather.PressureLayer({
            opacity: 0.8,
            id: "pressure",
        }),
        value: "value",
        units: " hPa",
    },
    {
        layer: new maptilerweather.RadarLayer({
            opacity: 0.8,
            id: "radar",
        }),
        value: "value",
        units: " dBZ",
    },
    {
        layer: new maptilerweather.TemperatureLayer({
            colorramp: maptilerweather.ColorRamp.builtin.TEMPERATURE_3,
            id: "temperature",
        }),
        value: "value",
        units: "°",
    },
    {
        layer: new maptilerweather.WindLayer({
            id: "wind",
        }),
        value: "speedMilesPerHour",
        units: " mph",
    },
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
            if (layer.layer.id !== id) {
                map.setLayoutProperty(layer.layer.id, "visibility", "none");
            } else {
                map.setLayoutProperty(id, "visibility", "visible");
                active = layer;
            }
        }

        const buttons = document.getElementsByClassName("button");

        for (const button of buttons) {
            if (button.id === active.layer.id) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        }

        updatePointerValue(pointerLngLat);
    }
}

map.on("load", function () {
    map.fitBounds([-2.107998, 53.033855, -1.515579, 53.597859], {
        padding: 20,
    });

    map.setPaintProperty("Water", "fill-color", "rgba(0, 0, 0, 0.4)"); // need to be called Water, don't know why

    for (const layer of layers) {
        map.addLayer(layer.layer, "Water");
        layer.layer.animateByFactor(1);
    }

    changeLayer("wind");
});

function refreshTime() {
    const d = layers[0].layer.getAnimationTimeDate();

    timeTextDiv.innerText = d.toString();
}

function updatePointerValue(lngLat) {
    if (!active || !lngLat) return;

    pointerLngLat = lngLat;

    const value = active.layer.pickAt(lngLat.lng, lngLat.lat);

    if (!value) {
        pointerDataDiv.innerText = "";
        variableNameDiv.innerText = "";

        return;
    }

    pointerDataDiv.innerText = `${value[active.value].toFixed(1)}${active.units}`;
    variableNameDiv.innerText = active.layer.id;
}

map.on("mousemove", (e) => {
    updatePointerValue(e.lngLat);
});
