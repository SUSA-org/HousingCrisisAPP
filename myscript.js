var District = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
   id: 'mapbox.light',
});

//TOPOJSON IMPLEMENTATION STARTS
L.TopoJSON = L.GeoJSON.extend({
   addData: function(jsonData) {
     if (jsonData.type === "Topology") {
       for (key in jsonData.objects) {
         geojson = topojson.feature(jsonData, jsonData.objects[key]);
         L.GeoJSON.prototype.addData.call(this, geojson);
       }
     }
     else {
       L.GeoJSON.prototype.addData.call(this, jsonData);
     }
   }
});


 'use strict' //"fool-proof" mechanism to avoid bad code

var map = L.map('map',{renderer: L.canvas()},
  {layers:[ District]},
  topoLayer = new L.TopoJSON(),
  $countyName = $('.countyName'));

var baseMaps = {
};

var overlayMaps = {
  "District": District
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

District.addTo(map);
map.setView([37.278,-119.418], 5.5);
$.getJSON('crimes.topo.json').done(addTopoData);

function addTopoData(topoData){
   topoLayer.addData(topoData);
   topoLayer.addTo(map);
   topoLayer.eachLayer(handleLayer);
}

function getColor(d) {
  // TODO: See style(feature) to understand what levels of color to hardcode
  return  d > 10000 ? '#F8AB3F': //#dbdab8
          d > 1000 ? '#E7B536':
          d > 700 ? '#D7BD2F':
          d > 500 ? '#C7C228':
          d > 200 ? '#A7B621':
          d > 100  ? '#86A61C':
          d > 10 ? '#689616':
          d > 5  ? '#4D8511':
          d > 3   ? '#35750D':
          d > 1   ? '#21650A':
          d > 0    ? '#105407':
          '#ef8383';}

function handleLayer(layer){
    layer.setStyle({
      fillColor : getColor(layer.feature.properties.Violent_sum),
      fillOpacity: .7,
      color:'#555',
      weight:1,
      opacity:.7
    });
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      dblclick: zoomToFeature,
      click: showinfo
    });

function highlightFeature(){
  var countyName = layer.feature.properties.County;
  console.log(countyName);
  $countyName.text(county).show();
  this.bringToFront();
  this.setStyle({
    weight:2,
    opacity: 1,
    color: '#666',
    fillOpacity: 1
  });
  info.update_loc(layer.feature.properties);
}
function resetHighlight(){
  $countyName.hide();
  this.bringToBack();
  this.setStyle({
    weight:1,
    opacity:.5,
    fillColor:getColor(layer.feature.properties.Violent_sum),
    fillOpacity:.7,
    color: '#555'
  });
  info.update_loc();
};

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
    document.getElementById("name").innerHTML = props.County; //proof of concept works, need to add other features
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
  this._div.innerHTML = '<h4>School District</h4>' +   (props ?'<b>' + props.County : "");
  console.log(props)
};

info.addTo(map);
}; //end handleLayer

//END TopoJSON

function initMap() {
  //var map2 = new google.maps.Map(document.getElementById('map2'), {
  //  zoom: 8, center: {lat: 36, lng: -119}});

  var geocoder = new google.maps.Geocoder();

  document.getElementById('address').addEventListener('keydown', function(event) {
  if (event.which == 13) {
    geocodeAddress(geocoder, map);
  }
  });

  document.getElementById("submit").addEventListener('click', function() {
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




//Easteregg
icounter=1;
function pat() {
  if(icounter%2==1){
    document.getElementById("pat").style = "display:visible";
  } else{
    document.getElementById("pat").style = "display:none";
  }
  icounter=icounter+1;
}
