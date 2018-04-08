// Choropleth Scripts

// var school   = L.tileLayer(
//   'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
//   attribution: 'Map data copywright <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
//     '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//     'Imagery copywright <a href="http://mapbox.com">Mapbox</a>',
//   id: 'examples.map-20v6611k'});
// var District = L.tileLayer(
//   'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
//   attribution: 'Map data copywright <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
//     '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
//     'Imagery copywright <a href="http://mapbox.com">Mapbox</a>',
//   id: 'examples.map-20v6611k'});
var school   = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });
var District = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });

var map = L.map('map',{layers:[District]}).setView([36.778,-119.418], 5.5);



var baseMaps = {
  // "District": District,
  // "school": school
  };

var overlayMaps = {
  "District": District
  };

L.control.layers(baseMaps, overlayMaps).addTo(map);
// District.addTo(map);

// adding color to the map chloropleth
function getColor(d) {
      // higher score is better
      // CHECK FOR NaN VALUES !!!!!!!!!!!!!!!!!!!!!!
      // return  d > 350000  ? '#7a7a7a':
      //     d > 300000 ? '#dbdab8': //#dbdab8
      //     d > 50000 ? '#fcfba1':
      //     d > 10000  ? '#f5f970':
      //     d > 1000  ? '#ccf280':
      //     d > 100   ? '#95cc74':
      //     d > 50   ? '#49a311':
      //     d > 0    ? '#2d6808':
      //           '#ef8383';

      return d > 12  ? '#7a7a7a':
          d > 10 ? '#dbdab8': //#dbdab8
          d > 7 ? '#fcfba1':
          d > 5  ? '#f5f970':
          d > 3  ? '#ccf280':
          d > 2  ? '#95cc74':
          d > 1   ? '#49a311':
          d > 0    ? '#2d6808':
                '#ef8383';

      // return  //d < 1  ? '#7a7a7a':
      //     d < 1 ? '#dbdab8': //#dbdab8
      //     d < 3 ? '#fcfba1':
      //     d < 5  ? '#f5f970':
      //     d < 7  ? '#ccf280':
      //     d < 8   ? '#95cc74':
      //     d < 9   ? '#49a311':
      //     d < 10    ? '#2d6808':
      //           '#7a7a7a'; //'#ef8383';
    }

function style(feature) {
  return {
    // TODO: Fill by a more relevant attribute
    //start at default values
    fillColor: getColor(0.25*feature.properties.cost + 0.25*feature.properties.safety + 0.25*feature.properties.travel + 0.25*feature.properties.school_system),
    weight: 2,
    opacity: 0.2,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

//adds chloropleth to map - NOTE: What comment is this for lol

// TODO: TO IMPLEMENT (notes):
// if some layer is selected, set dataset to whatever the array is called, e.g.
// if education is selected on map, use dataset = secondary_school_district
var cali = L.geoJson(mergedTractData, {style: style}).addTo(map); //calidata
map.addLayer(cali);
// L.geoJson(crime_data, {style: style}).addTo(map);
var geojson;

// highlight/remove highlight/zoom features
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#35373a', //'#666', //'#303030',
    // dashArray: '',
    fillOpacity: 0.1
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  info.update_loc(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update_loc();
}

function reset() {
  map.setView([37.278,-119.418], 5.5);
}

function recalculate() {
  console.log($('#slideCost').val(),$('#slideSafety').val(),$('#slideTravel').val(),$('#slideSchool').val());
  function newstyle(feature){
    //TO DO: normalize weights !!
    // come up with new formula
    //Checking for NaN values and preparing to normalize
    var num = sum = 0.0 //1.0 * ($('#slideCost').val() + $('#slideSafety').val(); + $('#slideTravel').val() + feature.properties.school_system);
    // var sum = 1.0 * ($('#slideCost').val() + $('#slideSafety').val(); + $('#slideTravel').val() + feature.properties.school_system);
    var cost = safety = travel = school = 0.0;
    if (!isNaN(feature.properties.cost)) {
      cost = $('#slideCost').val();
      sum += cost;
      num += 1;
    } 
    if (!isNaN(feature.properties.safety)) {
      safety = $('#slideSafety').val();
      sum += safety;
      num += 1;
    }
    if (!isNaN(feature.properties.travel)) {
      travel = $('#slideTravel').val();
      sum += travel;
      num += 1;
    }
    if (!isNaN(feature.properties.school_system)) {
      school = $('#slideSchool').val();
      sum += school;
      num += 1;
    }
    // Normalizing the weights to be proportional
    cost = cost / sum;
    safety = safety / sum;
    travel = travel / sum;
    school = school / sum;


    var weightedColor = cost*feature.properties.cost + safety*feature.properties.safety + travel*feature.properties.travel + school*feature.properties.school_system;
    return {
    fillColor: getColor(weightedColor),
    weight: 2,
    opacity: 0.1,
    color: 'white',
    // dashArray: '3',
    fillOpacity: 0.7
    };
  }
  cali.setStyle(newstyle);
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
  error();
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
  if (props) {
    for (var i = 0; i < parameters.length; i++) {
      if (i == 1) { //rounding for school district score
        document.getElementById(parameters[i]['id']).innerHTML = props[parameters[i]['val']].toFixed(4);
      } else {
        document.getElementById(parameters[i]['id']).innerHTML = props[parameters[i]['val']];
      }
    }
  }
  else {}
};

info.update_loc = function (props) {
  this._div.innerHTML = '<h4>County of Tract</h4>' +  (props ? '<b>' + props.County : '');
};

info.addTo(map);

// var legend = L.control({position: 'bottomright'});

// legend.onAdd = function (map) {

//     var div = L.DomUtil.create('div', 'info legend'),
//         grades = [1, 10, 50, 100, 250, 500, 1000, 100000, 1000000],
//         labels = [];

//     // loop through our density intervals and generate a label with a colored square for each interval
//     for (var i = 0; i < grades.length; i++) {
//         div.innerHTML +=
//             '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
//             grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
//     }

//     return div;
// };

// legend.addTo(map);

// implements cool features
function onEachFeature(feature, layer) {
  layer.on({
  mouseover: highlightFeature,
  mouseout: resetHighlight,
  dblclick: zoomToFeature,
  click: showinfo
  });
}

geojson = L.geoJson(mergedTractData, { //calidata
// geojson = L.geoJson(crime_data, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

function initMap() {
  //var map2 = new google.maps.Map(document.getElementById('map2'), {
  //  zoom: 8, center: {lat: 36, lng: -119}});

  var geocoder = new google.maps.Geocoder();

  document.getElementById('address').addEventListener('keydown', function(event) {
  if (event.which == 13) {
    // console.log("Registered enter!!!");
    geocodeAddress(geocoder, map);
  }
  });

  document.getElementById("submit").addEventListener('click', function() {
    // console.log("Registered click!!!!!!!!!!!!!!!!");
    geocodeAddress(geocoder, map);
  });
}

function geocodeAddress(geocoder, resultsMap) {
  var addr = document.getElementById('address').value;
  // console.log(addr);
  addr = addr.concat(", CA");
  geocoder.geocode({address: addr,
            componentRestrictions: {
            country: 'USA',
            }
           },
           function(results, status) {
            if (status == 'OK') {
              map.flyTo([results[0].geometry.location.lat(),
                   results[0].geometry.location.lng()], 12);
              // temp = results;
              // console.log(results);
            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
           });
}

function reset() {
  map.setView([37.278,-119.418], 5.5);
}

