// Choropleth Scripts

var District = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });

var map = L.map('map', {renderer: L.canvas()},
        {layers:[ District]}).setView([37.278,-119.418], 5.5);

var baseMaps = {

  };

var overlayMaps = {
  "District": District
  };

L.control.layers(baseMaps, overlayMaps).addTo(map);
District.addTo(map);

// adding color to the map chloropleth
function getColor(d) {
  // TODO: See style(feature) to understand what levels of color to hardcode
  return  d > 10 ? '#F8AB3F': //#dbdab8
          d > 9 ? '#E7B536':
          d > 8 ? '#D7BD2F':
          d > 7 ? '#C7C228':
          d > 6 ? '#A7B621':
          d > 5  ? '#86A61C':
          d > 4 ? '#689616':
          d > 3  ? '#4D8511':
          d > 2   ? '#35750D':
          d > 1   ? '#21650A':
          d > 0    ? '#105407':
                '#ef8383';
  // return  d > 5000  ? '#800026':
  //         d > 3500  ? '#BD0026':
  //         d > 2000  ? '#E31A1C':
  //         d > 1000   ? '#FC4E2A':
  //         d > 500   ? '#FD8D3C':
  //         d > 100   ? '#FEB24C':
  //         d > 0   ? '#FED976':
  //                   '#FFEDA0';
}

function style(feature) {
  return {
    // TODO: Fill by a more relevant attribute
    fillColor: getColor(feature.properties.new_rank),
    weight: 2,
    opacity: 0.1,
    color: 'white',
    fillOpacity: 0.7
  };
}

// TODO: TO IMPLEMENT (notes):
// if some layer is selected, set dataset to whatever the array is called, e.g.
// if education is selected on map, use dataset = secondary_school_district
var cali = L.geoJson(everything_schools, {style: style}).addTo(map);
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
  info.update_loc(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update_loc();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds(),{padding:[100,100]});
  error(); // Jank but necessary workaround
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
    document.getElementById("name").innerHTML = props.name;
    document.getElementById("custom_index").innerHTML = props.new_rank.toFixed(4);
    document.getElementById("rank").innerHTML = props.rank;
    document.getElementById("kind").innerHTML = props.kind;
    document.getElementById("city").innerHTML = props.City;
    document.getElementById("county").innerHTML = props.County;
    document.getElementById("population").innerHTML = props.population;
    document.getElementById("households").innerHTML = props.households;
    document.getElementById("medgrossrent").innerHTML = props.median_gross_rent;
    document.getElementById("avgmonthlyhouse").innerHTML = props.h_cost;
    document.getElementById("violent").innerHTML = props.Violent_sum;
    document.getElementById("property").innerHTML = props.Property_sum;
    document.getElementById("transportation").innerHTML = props.t_cost_80ami;
    document.getElementById("transit").innerHTML = props.transit_cost_80ami;
  } else {
  }
};

info.update_loc = function (props) {
  this._div.innerHTML = '<h4>School District</h4>' +  (props ? '<b>' + props.name : '');   
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

geojson = L.geoJson(everything_schools, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);


function initMap() {
  //var map2 = new google.maps.Map(document.getElementById('map2'), {
  //  zoom: 8, center: {lat: 36, lng: -119}});

  var geocoder = new google.maps.Geocoder();

  document.getElementById('address').addEventListener('keydown', function(event) {
  if (event.which == 13) {
    geocodeAddress(geocoder, map);
  }
  });

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
}

function geocodeAddress(geocoder, resultsMap) {
  var addr = document.getElementById('address').value;
  addr = addr.concat(", CA");
  geocoder.geocode({address: addr,
            componentRestrictions: {
            country: 'USA',
            }
           },
           function(results, status) {
            if (status === 'OK') {
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
icounter=1;
function pat() {
  if(icounter%2==1){
    document.getElementById("pat").style = "display:visible";
  } else{
    document.getElementById("pat").style = "display:none";
  }
  icounter=icounter+1;
}