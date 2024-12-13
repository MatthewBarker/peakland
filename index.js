import geojsonMerge from "@mapbox/geojson-merge";
import fs from "fs";

merge("areas");
merge("barrows");
merge("caves");
merge("hills");
merge("marshes");
merge("paths");
merge("points");
merge("stones");
merge("villages");
merge("woods");

function merge(name) {
    const dir = "gis/" + name;
    const files = fs.readdirSync(dir);
    
    fs.writeFileSync(dir + ".geojson",
      JSON.stringify(
        geojsonMerge.merge(
          files.map(function (file) {
            return JSON.parse(fs.readFileSync(dir + "/" + file));
          })
        ),
        null,
        2
      )
    );
}