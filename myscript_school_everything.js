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
    for ( var i = 0; i < everything_schools.length; ++i )
    {

      var m = L.marker( [everything_schools[i].style:style]);
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
  return  d > 100001  ? '#7a7a7a':
          d > 10 ? '#dbdab8': //#dbdab8
          d > 7 ? '#fcfba1':
          d > 5  ? '#f5f970':
          d > 3  ? '#ccf280':
          d > 2   ? '#95cc74':
          d > 1   ? '#49a311':
          d > 0    ? '#2d6808':
                '#ef8383';
  // return 	d > 10  ? '#800026':
  //         d > 9  ? '#BD0026':
  //         d > 7  ? '#E31A1C':
  //         d > 5   ? '#FC4E2A':
  //         d > 2   ? '#FD8D3C':
  //         d > 1   ? '#FEB24C':
  //         d > 0   ? '#FED976':
  //                   '#FFEDA0';
}

function style(feature) {
  return {
    // TODO: Fill by a more relevant attribute
    fillColor: getColor(feature.properties.new_rank),
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
  var temp_str = '<h4>District Information</h4>'
  if (props) {
    rank_line = '<b> Rank:&emsp;&emsp; </b> ' + props.rank;
    type_line = '<b> Type of District:&emsp;&emsp; </b> ' + props.kind;
    name_line = '<b> Name:&emsp;&emsp; </b> ' + props.name;
    city_line = '<b> City:&emsp;&emsp; </b> ' + props.City;
    county_line = '<b> County:&emsp;&emsp; </b> ' + props.County;

    pop_line = '<b> Population:&emsp;&emsp; </b> ' + props.population;
    hh_line = '<b> # Households:&emsp; </b> ' + props.households;
    rent_line = '<b> Median Gross Rent:&emsp; </b> ' + props.median_gross_rent;
    cost_line = '<b> Average Monthly Housing Cost:&emsp; </b> ' + props.h_cost;

    vio_line = '<b> Number of Violent Crimes:&emsp;&emsp; </b> ' + props.Violent_sum;
    prop_line = '<b> Number of Property Crimes:&emsp;&emsp; </b> ' + props.Property_sum;

    t_cost_line = '<b> Annual Transportation Cost for the Regional Moderate Household:&emsp;&emsp; </b> ' + props.t_cost_80ami;
    transit_cost_line = '<b> Annual Transit Cost for the Regional Moderate Household:&emsp;&emsp; </b> ' + props.transit_cost_80ami;

    deets.innerHTML = temp_str + name_line + '<br />' + rank_line + '<br />' + city_line + '<br />' + county_line + '<br />' + type_line + '<br />' + pop_line + '<br />' + hh_line + '<br />' + rent_line + '<br />' + cost_line + '<br />' + vio_line + '<br />' + prop_line + '<br />' + t_cost_line + '<br />' + transit_cost_line + '<br />';
  } else {
    deets.innerHTML = temp_str + 'Click on a district to begin';
  }
};

info.update_loc = function (props) {
      this._div.innerHTML = '<h4>School District</h4>' +  (props ?
        '<b>' + props.name : '');
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
