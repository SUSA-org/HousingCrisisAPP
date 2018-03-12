// Choropleth Scripts


var District = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });

var map = L.map('map',
  {renderer: L.canvas()},
  {layers:[ District]}).setView([36.778,-119.418], 5.5);



var baseMaps = {

  };

var overlayMaps = {
  "District": District
  };

  /**TESTING
  var markerClusters = L.markerClusterGroup();
    for ( var i = 0; i < calidata.length; ++i )
    {

      var m = L.marker( [calidata[i].style:style]);
      markerClusters.addLayer( m );
      console.log(m);
    }

    map.addLayer( markerClusters );
  //END TESTING
**/
L.control.layers(baseMaps, overlayMaps).addTo(map);
// District.addTo(map);

// adding color to the map chloropleth
function getColor(d) {
  // TODO: See style(feature) to understand what levels of color to hardcode
  return 	d > 5000  ? '#800026':
          d > 3500  ? '#BD0026':
          d > 2000  ? '#E31A1C':
          d > 1000   ? '#FC4E2A':
          d > 500   ? '#FD8D3C':
          d > 100   ? '#FEB24C':
          d > 0   ? '#FED976':
                    '#FFEDA0';
}

function style(feature) {
  return {
    // TODO: Fill by a more relevant attribute
    fillColor: getColor(feature.properties.median_gross_rent),
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
var cali = L.geoJson(calidata, {style: style}).addTo(map);
map.addLayer(cali);
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
  //map.setView(e.target.getCenter());
  map.fitBounds(e.target.getBounds(),{padding:[100,100]});
  error();
  //console.log(e.target.getCenter())
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
    rent_line = '<b> Median Gross Rent:&emsp; </b> ' + props.median_gross_rent;
    cost_line = '<b> Average Monthly Housing Cost:&emsp; </b> ' + props.h_cost;
    deets.innerHTML = temp_str + pop_line + '<br />' + hh_line + '<br />' + rent_line + '<br />' + cost_line + '<br />';
  } else {
    deets.innerHTML = temp_str + 'Click on a track';
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
  var addr = document.getElementById('address').value + " california";
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
