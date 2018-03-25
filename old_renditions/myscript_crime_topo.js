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

L.TopoJSON = L.GeoJSON.extend({  
  addData: function(jsonData) {    
    if (jsonData.type === 'Topology') {
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

var school   = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });
var District = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + 'pk.eyJ1Ijoic2hlZXBpbmF2IiwiYSI6ImNqZHA2bnFrMjBjYnoycm80M3BiaW1lc3EifQ.3MflXoZep5Hlr1ryAomj9A', {
    id: 'mapbox.light',
  });

var map = L.map('map',{layers:[school, District]}).setView([36.778,-119.418], 5.5);



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
      return  d > 350000  ? '#7a7a7a':
          d > 300000 ? '#dbdab8': //#dbdab8
          d > 50000 ? '#fcfba1':
          d > 10000  ? '#f5f970':
          d > 1000  ? '#ccf280':
          d > 100   ? '#95cc74':
          d > 50   ? '#49a311':
          d > 0    ? '#2d6808':
                '#ef8383';
    }

function style(feature) {
  return {
    // TODO: Fill by a more relevant attribute
    fillColor: getColor(feature.properties.Violent_sum + feature.properties.Property_sum),
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
// L.geoJson(crime_data, {style: style}).addTo(map);
// L.geoJson(crime_data, {style: style}).addTo(map);
// var geojson;
var geojson = new L.TopoJSON();

$.getJSON('crimes.topo.json')
  .done(addTopoData);

function addTopoData(topoData) {  
  geojson.addData(topoData);
  geojson.addTo(map);
}

// highlight/remove highlight/zoom features
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 5,
    color: '#666',
    // dashArray: '',
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
      var temp_str = '<h4>Crime Information by County</h4>'
      if (props) {
        // rank_line = '<b> Rank:&emsp;&emsp; </b> ' + props.rank;
        // type_line = '<b> Type of District:&emsp;&emsp; </b> ' + props.kind;
        // name_line = '<b> Name:&emsp;&emsp; </b> ' + props.name;
        // city_line = '<b> City:&emsp;&emsp; </b> ' + props.City;
        county_line = '<b> County:&emsp;&emsp; </b> ' + props.County;
        vio_line = '<b> Number of Violent Crimes:&emsp;&emsp; </b> ' + props.Violent_sum;
        prop_line = '<b> Number of Property Crimes:&emsp;&emsp; </b> ' + props.Property_sum;
        deets.innerHTML = temp_str + county_line + '<br />' + vio_line + '<br />' + prop_line + '<br />';
      } else {
        deets.innerHTML = temp_str + 'Click on a county to begin.'
      }
    };

info.update_loc = function (props) {
      this._div.innerHTML = '<h4>County</h4>' +  (props ?
        '<b>' + props.County : '');
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

geojson = L.geoJson(crime_data, {
// geojson = L.geoJson(crime_data, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);
