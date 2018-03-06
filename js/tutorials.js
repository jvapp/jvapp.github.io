//Quick Start Tutorial for Leaflet
//Initialize the map and set its view to our chosen geographical coordinates and a zoom level

//var map = L.map('map').setView([51.505, -0.09], 13);

//Add a Mapbox tile layer to our map. This one is for Mapbox Streets. Must request access token.
//L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//    maxZoom: 18,
//    id: 'mapbox.streets',
//    accessToken: 'pk.eyJ1IjoianZhcHAiLCJhIjoiY2pka2d5eDVjMDBuajJ6cDNvengzcmg2NCJ9.Ekp8rJfHls_6LjGrCWMp4Q'
//}).addTo(map);

//Add a marker to map
//var marker = L.marker([51.5, -0.09]).addTo(map);
//
////Add a circle to map
//var circle = L.circle([51.508, -0.11], {
//    color: 'red',
//    fillColor: '#f03',
//    fillOpacity: 0.5,
//    radius: 500
//}).addTo(map);
//
////Add a polygon to map
//var polygon = L.polygon([
//    [51.509, -0.08],
//    [51.503, -0.06],
//    [51.51, -0.047]
//]).addTo(map);
//
////Add popups to our various objects
//marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
//circle.bindPopup("I am a circle.");
//polygon.bindPopup("I am a polygon.");
//
////Add popup to the entire layer with openOn(#name of map div)
//var popup = L.popup()
//    .setLatLng([51.5, -0.09])
//    .setContent("I am a standalone popup.")
//    .openOn(map);
//
////Event handling.
////function onMapClick(e) {
////    alert("You clicked the map at " + e.latlng);
////}
////map.on('click', onMapClick);
//
////Use a popup instead of an alert
//var popup = L.popup();
//
//function onMapClick(e) {
//    popup
//        .setLatLng(e.latlng)
//        .setContent("You clicked the map at " + e.latlng.toString())
//        .openOn(map);
//}
//map.on('click', onMapClick);
//End of Quick Start tutorial

//Begin "Using GeoJSON with Leaflet Tutorial"

//example of a simple GeoJSON feature
var map = L.map('map').setView([39.75621, -104.99404], 13);

//Add Mapbox Tile Layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoianZhcHAiLCJhIjoiY2pka2d5eDVjMDBuajJ6cDNvengzcmg2NCJ9.Ekp8rJfHls_6LjGrCWMp4Q'
}).addTo(map);


//onEachFeature gets called  before adding it to a GeoJSON layer. A common reason to use this option is to attach a popup to features when they are clicked.
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

//creating a simple GeoJSON feature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//GeoJSON objects are added to the map through a GeoJSON layer.
L.geoJSON(geojsonFeature).addTo(map);

L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);



//GeoJSON objects may also be passed as an array of valid GeoJSON objects.
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
L.geoJSON(myLines).addTo(map);

//create an empty GeoJSON layer and assign it to a variable
var myLayer = L.geoJSON().addTo(map);
myLayer.addData(myLines);

//Styling individial lines and adding them to the map.
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
//Adding styled features to the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

//Stlye based on properties
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//Assigning the properties to grouped features.
L.geoJSON(states, {
    style: function (feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

//using the pointToLayer option to create a CircleMarker:
//var geojsonMarkerOptions = {
//    radius: 8,
//    fillColor: "#ff7800",
//    color: "#000",
//    weight: 1,
//    opacity: 1,
//    fillOpacity: 0.8
//};
//Pass a latlong to the geoJSON feature
//L.geoJSON(someGeojsonFeature, {
//    pointToLayer: function (feature, latlng) {
//        return L.circleMarker([-105, 40], geojsonMarkerOptions);
//    }
//}).addTo(map);

//Filter, Busch Field is set to False and will not appear
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);


