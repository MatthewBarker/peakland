import geojsonMerge from "@mapbox/geojson-merge";
import fs from "fs";

merge("areas");
merge("barrows");
merge("caves");
merge("hills");
merge("markers");
merge("marshes");
merge("paths");
merge("points");
merge("rivers");
merge("stones");
merge("villages");
merge("woods");

function merge(name) {
    const sourceDir = "gis/" + name + "/";
    const targetPath = "gis/merged/" + name + ".geojson";
    const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".geojson"));

    fs.writeFileSync(targetPath,
      JSON.stringify(
        geojsonMerge.merge(
          files.map(function (file) {
            return JSON.parse(fs.readFileSync(sourceDir + file));
          })
        ),
        null,
        2
      )
    );
}