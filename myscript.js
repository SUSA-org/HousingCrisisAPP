
var District = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
   id: 'mapbox.light',
});

// TOPOJSON IMPLEMENTATION STARTS
L.TopoJSON = L.GeoJSON.extend({
   addData: function(jsonData) {
     if (jsonData.type === "Topology") {
       for (key in jsonData.objects) {
         geojson = topojson.feature(jsonData, jsonData.objects[key]);
         L.GeoJSON.prototype.addData.call(this, geojson);
       }
     } else {
       L.GeoJSON.prototype.addData.call(this, jsonData);
     }
   }
});

// Put here to avoid breaking our "bad" code in earlier lines
'use strict' // "fool-proof" mechanism to avoid bad code

var map = L.map('map', {zoomSnap: 0.1,
                        zoomControl: true,
                        renderer: L.canvas(),
                       layers: [District]});
map.zoomControl.setPosition('topright');

var topoLayer = new L.TopoJSON();

const colorScale = chroma
  //.bezier(['yellow','green','skyblue','blue'])
  .bezier(['white','skyblue','blue','darkblue'])
  .scale().correctLightness()
  .mode('lab')
  .domain([0,9]); //need to change to max value of properties later

var baseMaps = {
  };

var overlayMaps = {
    "District": District
  };

L.control.layers(baseMaps, overlayMaps).addTo(map);

District.addTo(map);
map.setView([37.278,-119.418],6);
map.setZoom(6.4);
// CHANGE THIS BACK WHEN GIVING TO SUSA
// $.getJSON('finaltracts.topo.json').done(addTopoData);
$.getJSON('https://raw.githubusercontent.com/SUSA-org/HousingCrisisAPP/master/finalTracts.topo.json').done(addTopoData);
var costWeight = 0.25;
var safetyWeight = 0.25;
var travelWeight = 0.25;
var schoolWeight = 0.25;
function addTopoData(topoData) {
  topoLayer.addData(topoData);
  topoLayer.addTo(map);
  topoLayer.eachLayer(handleLayer);
}

function handleLayer(layer) {
  // TODO: Fix colors
  //console.log("SCORES ");
  // console.log("cost: " + layer.feature.properties.cost + "\nsafety: " + layer.feature.properties.safety + "\n travel: " + layer.feature.properties.travel + "\nschool: " + layer.properties.feature.school_system);
  const colorValue = costWeight*layer.feature.properties.cost + safetyWeight*layer.feature.properties.safety +
                     travelWeight*layer.feature.properties.travel + schoolWeight*layer.feature.properties.school_system;
  const fillColor = colorScale(colorValue).hex();
  //console.log(colorValue);
  layer.setStyle({
    fillColor : fillColor,
    fillOpacity: .7,
    color:'#555',
    weight:1,
    opacity:.4
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
    document.getElementById("hov").innerHTML = '<div><h5 style="font-weight:bolder;font-size:larger;">County Name </h5><p>' + countyName + '</p></div>';
    // $("#hov").innerHTML = '<div><h3 style="font-weight:bolder;font-size:larger;">Test Hover</h3><p>' + countyName + '</p></div>';
    // hover_info.innerHTML = '<h4>County Name</h4>' + countyName;
    this.bringToFront();
    this.setStyle({
      weight:2,
      opacity: 1,
      color: '#666',
      fillOpacity: 1
    });
    //info.update_loc();
  }

  function resetHighlight(){
    this.bringToBack();
    this.setStyle({
      weight:1,
      opacity:.5,
      fillColor:fillColor,
      fillOpacity:.7,
      color: '#555'
    });
     //info.update_loc();
  };

  function zoomToFeature(e) {
    map.flyToBounds(e.target.getBounds(),{padding:[100,100]});
    error(); // Jank but necessary workaround
  }

  function showinfo(e) {
    info.update(e.target.feature.properties);
    showLeftSB();
  }

  var info = L.control();

  // kk: I wanted to delete this function but leaflet errors without it...
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    // this.update();
    return this._div;
  };

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

  // info.update_loc = function (props) {
  //   this.div.innerHTML = '<h4>County Name</h4>' +   (props ?'<b>' + props.County : "");
  //   console.log(props.County);
  // };

  info.addTo(map);
}; //end handleLayer

//END TopoJSON

// HOW TO ADD THIS IN HTML D:
var hover_info = L.control({position: 'topright'});
// var info = L.control();
hover_info.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'info hover');
  // div.innerHTML = '<div><h5 style="font-weight:bolder;font-size:larger;">County Name </h5><p>' + name + '</p></div>';
  div.innerHTML = '<div><h3 style="font-weight:bolder;font-size:larger;">County Name</h3></div>';
  return div;
}
hover_info.addTo(map);

var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');

  var labels = []

  /* Add min & max*/
  div.innerHTML = '<div><h3 style="font-weight:bolder;font-size:larger;">Preference Scale</h3></div>\
  <div ><img src="colorscale.png" alt=""></div><div class="labels"><span class="domain-min">Low Pref</span>\
  <span class="domain-max">High Pref</span></div>'

  return div
}
legend.addTo(map);

function recalculate() {
   var sum = parseInt($('#slideCost').val()) + parseInt($('#slideSafety').val()) + parseInt($('#slideTravel').val()) + parseInt($('#slideSchool').val());
   costWeight = $('#slideCost').val() / sum;
   safetyWeight = $('#slideSafety').val() / sum;
   travelWeight = $('#slideTravel').val() / sum;
   schoolWeight = $('#slideSchool').val() / sum;
   topoLayer.eachLayer(handleLayer);
}

// MIGHT GET WORKING LATER
// function hover(e) {
//   var layer = e.target;
//   document.getElementById("hov").text = layer.feature.properties.County;
// }

function initMap() {
  var geocoder = new google.maps.Geocoder();

  document.getElementById('address').addEventListener('keydown', function(event) {
    if (event.which == 13)
      geocodeAddress(geocoder, map);
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
            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
           });
}

function reset() {
  map.setView([37.278,-119.418], 6.4);
}

//TODO clear map colors and revert to base map
function clearmap() {
  $('#slideCost').val(5);
  $("#slideCost").trigger('change');
  $('#slideTravel').val(5);
  $("#slideTravel").trigger('change');
  $('#slideSafety').val(5);
  $("#slideSafety").trigger('change');
  $('#slideSchool').val(5);
  $("#slideSchool").trigger('change');
  recalculate();
}

// Initial Overlay Code:
function off() {
  document.getElementById("overlay").style.display = "none";
}

function toggleSidebar() {
  var sidebar = document.getElementById("leftsidebar");
  var button = document.getElementById('hideSidebar');
  if (sidebar.style.left == '0%') {
    sidebar.style.left = '-20%';
    button.style.transform = 'rotate(180deg)';
    button.style.left = '0%';
  }
  else{
    sidebar.style.left = '0%';
    button.style.transform = '';
    button.style.left = "20%";
  }
}
function toggleDropdown() {
  var dropdown = document.getElementById("dropdownWindow");
  var button = document.getElementById('hideDropdown');
  if (dropdown.style.display == '') {
    dropdown.style.display = 'none';
    button.style.transform = 'rotate(90deg)';
    button.style.bottom = '0%';
  }
  else{
    dropdown.style.display = '';
    button.style.transform = 'rotate(270deg)';
    button.style.bottom = "30%";
  }
}

// Easteregg
var icounter = true;
function pat() {
  if(icounter) {
    document.getElementById("pat").style = "display:visible";
  } else {
    document.getElementById("pat").style = "display:none";
  }
  icounter = !icounter;
}
