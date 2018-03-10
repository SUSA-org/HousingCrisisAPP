// Choropleth Scripts

var school   = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });
var District = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });

var map = L.map('map',{layers:[school, District]}).setView([37.5,-120.418], 5.5);



var baseMaps = {
  "District": District,
  "school": school
  };

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


function initMap() {
  var map2 = new google.maps.Map(document.getElementById('map2'), {
    zoom: 8,
    center: {lat: 36, lng: -119}
});

var geocoder = new google.maps.Geocoder();

document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
}

function geocodeAddress(geocoder, resultsMap) {
  var addr = document.getElementById('address').value;
  geocoder.geocode({address: addr, 
                    componentRestrictions: {
                      country: 'USA',
                      // postalCode: '90000',
                      // postalCode: ['90', '91', '92', '93', '94', '95', '960', '961']
                    }
                   }, function(results, status) {
    if (status === 'OK') {
      map.setView([results[0].geometry.location.lat(), results[0].geometry.location.lng()], 12);
      temp = results;
      console.log(results);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
