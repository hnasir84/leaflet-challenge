// create tile layer for the map backround
let defaultMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// add a gray scale layer
let grayscale =  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

// add water color layer
let waterColor =  L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});

// add topographyu
let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// make basmaps ojbect
let basemaps = {
    Default: defaultMap,
    GrayScale: grayscale,
    WaterColor: waterColor,
    Topography: topoMap
};


let myMap = L.map("map",{
    center : [36.7783, -119.4179],
    zoom: 3,
    layers: [defaultMap, grayscale, waterColor, topoMap]

});

// add the default map to the map
defaultMap.addTo(myMap);



// obtain tectonic plate data and draw it on the map
// variable to hold tectonic plate layer

let tectonicplates = new L.layerGroup();

// call api to obtain infor for tectnic plates
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
    .then(function(plateData){
        // console log to ensure that data is loaded
        // console.log(plateData);

       L.geoJson(plateData,{
          // add styling to make lines visible
          color: "red",
          weight: 1
       }).addTo(tectonicplates);
    });

// add the tetonic plates to the map
tectonicplates.addTo(myMap);

// carete a variable to hold the earthquake data layer
let earthquakes = new L.layerGroup();

// obtain dta for the earthquakes and populate layergrop
// call USGS GeoJson API
d3.json ("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquackeData){
      // console log to ensure data is loaded
    //console.log(earthquackeData);
      // pplot circles, where readius is dpenedent on magnitude and color is dpenedent on depth

      // create a function that choses the color of data point
    function dataColor(depth){
        if (depth > 90)
           return "red";
        else if(depth > 70)
           return "#fc4903";
        else if(depth > 50)
           return "#fc8403";
        else if(depth > 30)
           return "#fcad03";
        else if(depth > 10)
           return "#cafc03";
        else
           return "green";
    }

    // create a function that determine the size of our raduis
    function radiusSize(mag){
            if (mag == 0)
                return 1; // ensure that 0 mag earthquake shows up
            else
                return mag * 5; // ensure that the circle is pronunced in the map
    }

      

      // add the style for each data point
    function dataStyle(feature)
    {
      
        return {
           opacity:0.5,
           fillOpacity: 0.5,
           fillColor: dataColor(feature.geometry.coordinates[2]), // index 2 hold depth
           color: "000000", // black outline
           radius: radiusSize(feature.properties.mag), // grabls the magnitude
           weight: 0.5,
           stroke: true
        }

      }


      // add the Geojson Data to earthquake layer group
      L.geoJson(earthquackeData,{
           // make each feature  a marker on the map, each marker is a circle
            pointToLayer: function(feature, latLng) {
               return L.circleMarker(latLng);
         },
         // set the style for each marker
         style: dataStyle, // calls the data style fucntion and passes in earthquake data
         
         // add popups
         onEachFeature: function(feature, layer){
            layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                              Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                              Location: <b>${feature.properties.place}</b>`)
         }
      }).addTo(earthquakes);

    }
    
);

  // add the earthquake layer to the map
earthquakes.addTo(myMap);

// add the overlay for the tectonic plates and earthquake
let overlays = {
        "Tectonic Plates": tectonicplates,
        "EarthQuake Data": earthquakes
};

// add layer control
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

    var legend = L.control({
      position: "bottomright"
    });
  
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
  
      var grades = [-10, 10, 30, 50, 70, 90];
      var colors = ["#2c99ea", "#2ceabf", "#92ea2c", "#d5ea2c","#eaa92c", "#ea2c2c"];
  
  
    // loop thry the intervals of colors to put it in the label
      for (var i = 0; i<grades.length; i++) {
        div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
      }
      return div;
  
    };
  
    legend.addTo(myMap);
    





