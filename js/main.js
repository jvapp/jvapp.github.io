//PSEUDO-CODE FOR ATTRIBUTE LEGEND
//1. Add an `<svg>` element to the legend container
//2. Add a `<circle>` element for each of three attribute values: max, mean, and min
//3. Assign each `<circle>` element a center and radius based on the dataset max, mean, and min values of the current attribute
//4. Create legend text to label each circle
//5. Update circle attributes and legend text when the data attribute is changed by the user
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoianZhcHAiLCJhIjoiY2pka2d5eDVjMDBuajJ6cDNvengzcmg2NCJ9.Ekp8rJfHls_6LjGrCWMp4Q', {attribution: "mapbox"}),

        dark   = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoianZhcHAiLCJhIjoiY2pka2d5eDVjMDBuajJ6cDNvengzcmg2NCJ9.Ekp8rJfHls_6LjGrCWMp4Q', { attribution: "mapbox"});

    var map = L.map('map', {
        center: [20, 30],
        zoom: 2,
        minZoom: 3,
        layers: [light]
    });
    getData(map);

    var baseMaps = {
        "Light": light,
        "Dark": dark
    };
    L.control.layers(baseMaps).addTo(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .0006;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};
//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');


            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');

            $(container).on('mousedown dblclick pointerdown', function(e){
                L.DomEvent.stopPropagation(e);
            });
            return container;
        }
    });
    map.addControl(new SequenceControl());

    //Example 3.6: Below Example 3.5...replace button content with images
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //Example 3.12: Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    //Example 3.14 Example 3.12 line 2...Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 16 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 16 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);

    });
    //Example: 3.13 Example 3.12 line 7...Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        console.log(index);
        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);
    });
    //EX 3.4: set slider attributes
    $('.range-slider').attr({
        max: 16,
        min: 0,
        value: 0,
        step: 1
    });
};

//Calculate the max, mean, and min values for a given attribute

//Example 2.7 line 1...function to create the legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="200px" height="1560px">';
            //array of circle names to base loop on
            var circles = {
                max: 10,
                mean: 20,
                min: 40
            };
            //Step 2: loop to add each circle and text to svg string
            for (var circle in circles){                //circle string
                svg += '<circle class="legend-circle" id="' + circle + 
                    '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
            };
            //close svg string
            svg += "</svg>";
            //add attribute legend svg to container
            $(container).append(svg);
            return container;
        }
    });
    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);
            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };
            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });
    //set mean
    var mean = (max + min) / 2;
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};
//Example 3.7 line 1...Update the legend with new attribute

function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "Refugee Population in " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        $('#'+key).attr({
            cy: 69 - radius,
            r: radius
        });

        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100);
    }
};
//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };
    //check result
    //console.log(attributes);
    return attributes;
};
//Step 3: Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes){
    //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    console.log(attribute);
    //create marker options
    var options = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    };
    var attValue = Number(feature.properties[attribute]);
    //Give each cirvle marker a radius proportional to its value
    options.radius = calcPropRadius(attValue);
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    //Create with constructor function
    var popup = new Popup(feature.properties, attribute, layer, options.radius);

    //add popup to circle marker
    popup.bindToLayer();
    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};
//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);  
        } 
    }).addTo(map);
};

//Function to update symbols on slider event input
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //create with constructor function
            var popup = new Popup(props, attribute, layer, radius);

            //add popup to circle marker
            popup.bindToLayer();
        };
    });
};
//Create Popup Constructor Function
function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.year = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.content = "<p><b>Refugees from  " + this.properties.Country +  " in " + this.year + ":</b> " + this.population + " </p>";
    this.bindToLayer = function(){
        this.layer.bindPopup(this.content, {
            offset: new L.Point(0,-radius)
        });
    };
};
//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/data1.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);

            //call function to create proportional symbols, sequence control, update symbols, and create legend
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            createLegend(map, attributes);
        }
    });
};
$(document).ready(createMap);