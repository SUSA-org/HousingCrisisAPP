// Choropleth Scripts

var school   = L.tileLayer(
  'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
  attribution: 'Map data copywright <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery copywright <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-20v6611k'});
var District = L.tileLayer(
  'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
  attribution: 'Map data copywright <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery copywright <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-20v6611k'});

var map = L.map('map',{layers:[school, District]}).setView([36.778,-119.418], 5.5);
var baseMaps = {
  "District": District,
  "school": school
  };

// TODO: What is this?
var overlayMaps = {

  };

L.control.layers(baseMaps, overlayMaps).addTo(map);
// District.addTo(map);

// adding color to the map chloropleth
function getColor(d) {
  // TODO: See style(feature) to understand what levels of color to hardcode
  return 	d > 20  ? '#800026':
      d > 16  ? '#BD0026':
      d > 13  ? '#E31A1C':
      d > 9   ? '#FC4E2A':
      d > 7   ? '#FD8D3C':
      d > 5   ? '#FEB24C':
      d > 2   ? '#FED976':
            '#FFEDA0';
}

function style(feature) {
  return {
    // TODO: Fill by a more relevant attribute
    fillColor: getColor(feature.properties.co2_per_acre_local),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

//adds chloropleth to map - NOTE: What comment is this for lol

// TODO: TO IMPLEMENT (notes):
// if some layer is selected, set dataset to whatever the array is called, e.g.
// if education is selected on map, use dataset = secondary_school_district
L.geoJson(calidata, {style: style}).addTo(map);
var geojson;

// highlight/remove highlight/zoom features
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());

}

function showinfo(e) {
  info.update(e.target.feature.properties);
}

var info = L.control();

// kk: I wanted to delete this function but leaflet errors without it...
// kk: I literally have no idea what this does.
info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  //console.log(this._div);
  return this._div;
};

// method that we will use to update the control based on feature properties passed
// TODO: Fill this in with relevant info, make it look nice.
info.update = function (props) {
  deets = document.getElementById("details");
  var temp_str = '<h4>Stuff about the CA census track</h4>'
  if (props) {
    pop_line = '<b> Population:&emsp;&emsp; </b> ' + props.population;
    hh_line = '<b> # Households:&emsp; </b> ' + props.households;
    deets.innerHTML = temp_str + pop_line + '<br />' + hh_line + '<br />'
  } else {
    deets.innerHTML = temp_str + 'Click on a track'
  }
};

info.addTo(map);

// implements cool features
function onEachFeature(feature, layer) {
  layer.on({
  mouseover: highlightFeature,
  mouseout: resetHighlight,
  dblclick: zoomToFeature,
  click: showinfo
  });
}

geojson = L.geoJson(calidata, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);