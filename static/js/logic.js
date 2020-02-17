// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);

});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake

    function chooseColor(mag) {
        switch (true) {
            case (mag < 1):
                return "green";
            case (mag < 2):
                return "greenyellow";
            case (mag < 3):
                return "gold";
            case (mag < 4):
                return "DarkOrange";
            case (mag < 5):
                return "Peru";
            default:
                return "tomato";
        };
    }

    function createCircleMarker(feature, latlng) {
        let options = {
            radius: feature.properties.mag * 4,
            fillColor: chooseColor(feature.properties.mag),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        }
        return L.circleMarker(latlng, options);

    }


    function do_OnEachFeature(feature, obj) {
        obj.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>" + "Magnitude: " + feature.properties.mag + "</p>");

        console.log(feature);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: do_OnEachFeature,
        pointToLayer: createCircleMarker
    });

    var queryurl_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

    d3.json(queryurl_plates, function (response) {
        //console.log(response);
        plates = L.geoJSON(response, {
            style: function (feature) {
                return {
                    color: "orange",
                    fillColor: "white",
                    fillOpacity: 0
                }
            },
            onEachFeature: function (feature, layer) {
                console.log(feature.coordinates);
                layer.bindPopup("Plate Name: " + feature.properties.PlateName);
            }

        });

        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes, plates);
    });

    function createMap(earthquakes, plates) {

        function displayLegend() {
            var legendInfo = [{
                limit: "Mag: 0-1",
                color: "green"
            }, {
                limit: "Mag: 1-2",
                color: "greenyellow"
            }, {
                limit: "Mag: 2-3",
                color: "gold"
            }, {
                limit: "Mag: 3-4",
                color: "DarkOrange"
            }, {
                limit: "Mag: 4-5",
                color: "Peru"
            }, {
                limit: "Mag: 5+",
                color: "tomato"
            }];

            var header = "<h3>Magnitude</h3><hr>";

            var strng = "";

            for (i = 0; i < legendInfo.length; i++) {
                strng += "<p style = \"background-color: " + legendInfo[i].color + "\">" + legendInfo[i].limit + "</p> ";
            };

            return header + strng;

        };

        // Define map layers
        var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.satellite",
            accessToken: API_KEY
        });

        var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.light",
            accessToken: API_KEY
        });

        var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.outdoors",
            accessToken: API_KEY
        });

        // Define a baseMaps object to hold our base layers
        var baseMaps = {
            "Satellite": satellite,
            "Outdoors": outdoors,
            "GrayScale": light
        };

        // Create overlay object to hold our overlay layers
        var overlayMaps = {
            Earthquakes: earthquakes,
            Plates: plates
        };

        // Create our map, giving it the basemaps and earthquakes layers to display on load
        var myMap = L.map("map", {
            center: [
                37.09, -95.71
            ],
            zoom: 5,
            layers: [satellite, earthquakes]
        });

        // Create a layer control
        // Pass in our baseMaps and overlayMaps
        // Add the layer control and legend to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);

        var info = L.control({
            position: "bottomright"
        });
    
        info.onAdd = function(){
            var div = L.DomUtil.create("div","legend");
            return div;
        }
    
        info.addTo(myMap);
    
        document.querySelector(".legend").innerHTML=displayLegend();
    };
};