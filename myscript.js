
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
	// console.log("cost: " + layer.feature.properties.cost + "\nsafety: " + layer.feature.properties.safety + "\n travel: " + layer.feature.properties.travel + "\nschool: " + 	layer.properties.feature.school_system);
	const colorValue = 	costWeight*layer.feature.properties.cost +
						safetyWeight*layer.feature.properties.safety +
						travelWeight*layer.feature.properties.travel +
						schoolWeight*layer.feature.properties.school_system;
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
		// console.log(countyName);
		document.getElementById("countyContent").innerHTML = countyName;
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
		// info.update_loc();
	};

	function zoomToFeature(e) {
		map.flyToBounds(e.target.getBounds(),{padding:[100,100]});
		error(); // Jank but necessary workaround
	}

	function showinfo(e) {
		info.update(e.target.feature.properties);
		if (!leftVisible)
			toggleSidebar();
	}

	var info = L.control();

	// kk: I wanted to delete this function but leaflet errors without it...
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		return this._div;
	};

	info.update = function (props) {
		if (props) {
			for (var i = 0; i < parameters.length; i++) {
        if (i != 1 && !props[parameters[i]['val']]) {
          document.getElementById(parameters[i]['id']).innerHTML = "N/A";
        } else if (i == 5) {
          document.getElementById(parameters[i]['id']).innerHTML = props[parameters[i]['val']].toFixed(1);
        } else if (i == 4) { //rounding for school district score
					document.getElementById(parameters[i]['id']).innerHTML = (props[parameters[i]['val']]* 10).toFixed(1);
				} else if (i == 2 || i == 3) {
          document.getElementById(parameters[i]['id']).innerHTML = "$" + props[parameters[i]['val']];
        } else if (i == 1) {
          document.getElementById(parameters[i]['id']).innerHTML = colorValue.toFixed(1);
        } else {
					document.getElementById(parameters[i]['id']).innerHTML = props[parameters[i]['val']];
				}
			}
		}
	};

  info.addTo(map);
}; //end handleLayer

//END TopoJSON

//adding reset button
ResetButton = L.easyButton( {
  position:'topright',
  states:[{
    icon: '<strong>Reset Map</strong>',
    onClick: function(){
      reset();
    }
  }]
}).addTo(map);
ResetButton.button.style.width = '100px';

function reset() {
	map.flyTo([37.278,-119.418], 6.4);
}
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
	// KK: We can make this much simpler by portin this to the HTML
	var div = L.DomUtil.create('div', 'info legend');
	var labels = []
	/* Add min & max*/
	div.innerHTML = '<div id="legend"><h3 style="font-weight:bolder;font-size:larger; text-align:center;">Preference Scale</h3></div>\
		<div ><img src="colorscale.png" alt=""></div><div class="labels"><span class="domain-min">Low Pref</span>\
		<span class="domain-max">High Pref</span>\
    </div>'
	return div
}
legend.addTo(map);
// legend.style.width = '400px';
function recalculate() {
   var sum = parseInt($('#slideCost').val()) + parseInt($('#slideSafety').val()) + parseInt($('#slideTravel').val()) + parseInt($('#slideSchool').val());
   costWeight = $('#slideCost').val() / sum;
   safetyWeight = $('#slideSafety').val() / sum;
   travelWeight = $('#slideTravel').val() / sum;
   schoolWeight = $('#slideSchool').val() / sum;
   topoLayer.eachLayer(handleLayer);
}

function initMap(x,y) {
	var geocoder = new google.maps.Geocoder();
	document.getElementById('address').addEventListener('keydown', function(event) {
			if (event.which == 13)
				geocodeAddress(geocoder, map);
		});

	document.getElementById("submit").addEventListener('click', function() {
			geocodeAddress(geocoder, map);
		});
}
//Initial Overlay Code:
function titleOverlay() {
    var geocoder = new google.maps.Geocoder();
  document.getElementById("submitTitle").addEventListener('click', function() {
    console.log(geocoder);
    geocodeTitleOverlayAddress(geocoder, map);
    document.getElementById("overlay").style.display = "none";
    toggleSidebar();
    toggleDropdown();
    });
  document.getElementById('addressTitle').addEventListener('keydown', function(event) {
    if (event.which == 13) {
      geocodeTitleOverlayAddress(geocoder, map);
			document.getElementById("overlay").style.display = "none";
      toggleSidebar();
      toggleDropdown();
		}
  });
}
function removeTitleOverlay(){
    document.getElementById('addressTitle').removeEventListener()
    document.getElementById('submitTitle').removeEventListener()
    delete google.maps.Geocoder();
}

function geocodeAddress(geocoder, resultsMap) {
	var addr = document.getElementById('address').value;
	addr = addr.concat(", CA");
	geocoder.geocode({address: addr,
					  componentRestrictions: {
						country: 'USA',
					  }
					 }, function(results, status) {
						if (status === 'OK') {
							map.flyTo([results[0].geometry.location.lat(),
							results[0].geometry.location.lng()], 12);
						} else {
							alert('Geocode was not successful for the following reason: ' + status);
						}
					});
}

function geocodeTitleOverlayAddress(geocoder, resultsMap) {
	var addr = document.getElementById('addressTitle').value;
	addr = addr.concat(", CA");
	geocoder.geocode({address: addr,
					  componentRestrictions: {
						country: 'USA',
					  }
					 }, function(results, status) {
						if (status === 'OK') {
							map.flyTo([results[0].geometry.location.lat(),
							results[0].geometry.location.lng()], 12);
						} else {
							alert('Geocode was not successful for the following reason: ' + status);
						}
					});
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



var leftVisible = false;
function toggleSidebar() {
	var sidebar = document.getElementById("leftsidebar");
	var button = document.getElementById("toggleSidebar");
	var dropdown = document.getElementById("dropdownWindow");
	var button2 = document.getElementById("toggleDropdown");
	if (leftVisible) {
		sidebar.style.left = "-420px";
		button.style.left = "0%";
		button.style.transform = "scale(1, 1)";

		// dropdown.style.width = "calc(100% - 20px)";
		// button2.style.width = "calc(100% - 20px)";
		// dropdown.style.left = "420px";
		// button2.style.left = "420px";
	} else {
		sidebar.style.left = "0%";
		button.style.left = "420px";
		button.style.transform = "scale(-1,1)";

		// dropdown.style.width = "80%";
		// button2.style.width = "80%";
		// dropdown.style.left = "calc(420px + 20px)";
		// button2.style.left = "calc(420px + 20px)";
	}
	leftVisible = !leftVisible;
}

var botVisible = false;
function toggleDropdown() {
	var dropdown = document.getElementById("dropdownWindow");
	var button = document.getElementById("toggleDropdown");
  var sidebar = document.getElementById("leftsidebar");
  var button2 = document.getElementById("toggleSidebar");
	if (botVisible) {
		dropdown.style.bottom = "-25%";
    dropdown.style.left = "0px";
    dropdown.style.width = "100%";
		button.style.bottom = "0%";
    button.style.left = "0px";
    button.style.width = "100%";
		button.style.transform = "scale(1, 1)";

    sidebar.style.height = "calc(100% - 20px)";
    button2.style.height = "calc(100% - 20px)";
    // sidebar.style.transform = "scale(1, 1)";
    //button2.style.transform = "scale(1, 1)";
	} else {
		dropdown.style.bottom = "0%";
    dropdown.style.left = "0px";
    dropdown.style.width = "100%";
		button.style.bottom = "25%";
    button.style.left = "0px";
    button.style.width = "100%";
		button.style.transform = "scale(1,-1)";

    sidebar.style.height = "calc(75% - 20px)";
    button2.style.height = "calc(75% - 20px)";
    // sidebar.style.transform = "scale(-1, 1)";
    //button2.style.transform = "scale(1, -1)";
	}
	botVisible = !botVisible;
}

// Easteregg
var icounter = true;
function pat() {
	if (icounter) {
		document.getElementById("pat").style = "display:visible";
	} else {
		document.getElementById("pat").style = "display:none";
	}
	icounter = !icounter;
}
