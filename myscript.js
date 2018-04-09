
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
     } else {
       L.GeoJSON.prototype.addData.call(this, jsonData);
     }
   }
});

// Put here to avoid breaking our "bad" code in earlier lines
'use strict' // "fool-proof" mechanism to avoid bad code

var map = L.map('map', {renderer: L.canvas()},
                       {layers: [District]});
var topoLayer = new L.TopoJSON();

const colorScale = chroma
  .scale(['#dbdab8', '#2d6808'])
  .domain([0,12]); //need to change to max value of properties later

var baseMaps = {
  };

var overlayMaps = {
    "District": District
  };

L.control.layers(baseMaps, overlayMaps).addTo(map);

District.addTo(map);
map.setView([37.278,-119.418], 5.5);
$.getJSON('https://raw.githubusercontent.com/SUSA-org/HousingCrisisAPP/master/mergedTracts.topo.json').done(addTopoData);

function addTopoData(topoData) {
   topoLayer.addData(topoData);
   topoLayer.addTo(map);
   topoLayer.eachLayer(handleLayer);
}

function handleLayer(layer) {
  // TODO: Fix colors
  const colorValue = 0.25*layer.feature.properties.cost + 0.25*layer.feature.properties.safety + 
                     0.25*layer.feature.properties.travel + 0.25*layer.feature.properties.school_system;
  const fillColor = colorScale(colorValue).hex();

  layer.setStyle({
    fillColor : fillColor,
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
    // console.log(countyName);
    this.bringToFront();
    this.setStyle({
      weight:2,
      opacity: 1,
      color: '#666',
      fillOpacity: 1
    });
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
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    // this.update();
    return this._div;
  };

  info.update_loc = function (props) {
    this._div.innerHTML = '<h4>School District</h4>' +   (props ?'<b>' + props.County : "");
    // console.log(props)
  };

  info.addTo(map);
  
}; //end handleLayer

function recalculate() {
    // console.log($('#slideCost').val(),$('#slideSafety').val(),$('#slideTravel').val(),$('#slideSchool').val());
    var sum = 1.0 * ($('#slideCost').val() + $('#slideSafety').val() + $('#slideTravel').val() + $('#slideSchool').val());
    var cost = safety = travel = school = 0.0;
    cost = $('#slideCost').val() / sum;
    safety = $('#slideSafety').val() / sum;
    travel = $('#slideTravel').val() / sum;
    school = $('#slideSchool').val() / sum;
    // console.log("cost: " + 5000*cost + "\nsafety: " + 5000*safety + "\ntravel: " + 5000*travel + "\nschool: " + 5000*school);

    //TO DO: normalize weights !!
    // come up with new formula
    // Checking for NaN values and preparing to normalize
    // Helper function for recalculate
    function newstyle(feature) {
      var weightedColor = 5000*cost*feature.properties.cost + 5000*safety*feature.properties.safety + 5000*travel*feature.properties.travel + 5000*school*feature.properties.school_system;
      return {
        fillColor: colorScale(weightedColor).hex(),
        weight: 2,
        opacity: 1,
        color: '#555',
        // dashArray: '3',
        fillOpacity: 0.7
        };
    }
    topoLayer.setStyle(newstyle);
  }

//END TopoJSON

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
  map.setView([37.278,-119.418], 5.5);
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
