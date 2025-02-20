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

const visuals = [
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
        units: " mbar",
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

document.getElementById("buttons").addEventListener("click", function (event) {
    changeVisual(event.target.id);
});

function changeVisual(id) {
    if (!active || active.id !== id) {
        for (const visual of visuals) {
            if (visual.layer.id !== id) {
                map.setLayoutProperty(visual.layer.id, "visibility", "none");
            } else {
                map.setLayoutProperty(id, "visibility", "visible");
                active = visual;
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

    for (const visual of visuals) {
        map.addLayer(visual.layer, "Water");
    }

    changeVisual("wind");
});

function refreshTime() {
    const d = visuals[0].layer.getAnimationTimeDate();

    timeTextDiv.innerText = d.toString();
}

function updatePointerValue(lngLat) {
    if (!active || !lngLat) {
        return;
    }

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
