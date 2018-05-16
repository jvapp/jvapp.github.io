//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
        //variables for data join
var attrArray = ["Attacks", "Number of Refugees", "GDP Per Capita"];
var expressed = attrArray[0]; //initial attribute
    
    console.log(attrArray);

//begin script when window loads
window.onresize = setMap();

//set up choropleth map
function setMap(){
    
        //map frame dimensions
        var width = window.innerWidth * 0.75,
            height = 800;

        //create new svg container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on Sahel
        var projection = d3.geoAzimuthalEqualArea()
            .center([15, 10])
            .rotate([-2, 0, 0])
            .scale(1200)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection); 
    
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/data575.csv") //load attributes from csv
        .defer(d3.json, "data/Africa2.topojson") //load background spatial data
        .defer(d3.json, "data/Sahel_data.topojson") //load choropleth spatial data
        .await(callback);
    
      function callback(error, csvData, africa, sahel){
          
            //place graticule on the map
            setGraticule(map, path);
          
        //translate europe TopoJSON
        var africa = topojson.feature(africa, africa.objects.Africa),
            sahel = topojson.feature(sahel, sahel.objects.Sahel_data).features;
          
           
        //add Africa countries to map
        var countries = map.append("path")
            .datum(africa)
            .attr("class", "countries")
            .attr("d", path);
        
        
        sahel = joinData(sahel, csvData);
         //create the color scale
        var colorScale = makeColorScale(csvData);
  
        setEnumerationUnits(sahel, map, path, colorScale);
          
        //add coordinated visualization to the map
        setChart(csvData, colorScale);
      };
};
    
    //function to test for data value and return color
    function choropleth(props, colorScale){
        //make sure attribute value is a number
        var val = parseFloat(props[expressed]);
        //if attribute value exists, assign a color; otherwise assign gray
        if (typeof val == 'number' && !isNaN(val)){
            return colorScale(val);
        } else {
            return "#CCC";
        };
    };
    
    //function to create coordinated bar chart
function setChart(csvData, colorScale){
   
//      //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";


    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
        
         //create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 1200000]);
        
           //set bars for each province
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.NAME_ENGLI;
        })
          .attr("width", chartWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartWidth / csvData.length);
        })
        .attr("height", function(d){
            return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed]));
        })
//    //Example 2.5 line 23...end of bars block
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });
//      //annotate bars with attribute value text
//    var numbers = chart.selectAll(".numbers")
//        .data(csvData)
//        .enter()
//        .append("text")
//        .sort(function(a, b){
//            return a[expressed]-b[expressed]
//        })
//        .attr("class", function(d){
//            return "numbers " + d.adm1_code;
//        })
//        .attr("text-anchor", "middle")
//        .attr("x", function(d, i){
//            var fraction = chartWidth / csvData.length;
//            return i * fraction + (fraction - 1) / 2;
//        })
//        .attr("y", function(d){
//            return chartHeight - yScale(parseFloat(d[expressed])) + 15;
//        })
//        .text(function(d){
//            return d[expressed];
//        })
//      //below Example 2.8...create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Refugees by Country " + expressed[3]);
    
     //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale)
        .orient("left");

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
    
//};
    
    
    
    
    
    
function setChart(csvData, colorScale){
  //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 460;

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
    
     //create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 105]);

var circle = chart.selectAll(".circle")
		.data(csvData)
		.enter()
		.append("circle")
        .attr("cx",function(d,i){
            return  50 * (i*2);})
        .attr('cy', 300)
        .attr('r',25)

};
    
    //function to create color scale generator
//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#E4F1F6",
        "#67AFCB",
        "#347B98",
        "#265A6E",
        "#092834"
    ];

    
    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
};
          
    function setGraticule(map, path){
    //...GRATICULE BLOCKS FROM PREVIOUS MODULE
            //Example 2.5 line 3...create graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude
          
            //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule


        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
};
          
       function joinData(sahel, csvData){
    //...DATA JOIN LOOPS FROM EXAMPLE 1.1
           //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        var csvKey = csvRegion.NAME_ENGLI; //the CSV primary key

        //loop through geojson regions to find correct region
        for (var a=0; a<sahel.length; a++){

            var geojsonProps = sahel[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.NAME_ENGLI; //the geojson primary key

            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){

                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvRegion[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };
           console.log(sahel);
    return sahel;
};
    
    
    function setEnumerationUnits(sahel, map, path, colorScale){
    //...REGIONS BLOCK FROM PREVIOUS MODULE
    //add Sahelian countries to map
        var regions = map.selectAll(".regions")
            .data(sahel)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.NAME_ENGLI;
            })
            .attr("d", path)
            .style("fill", function(d){
            return colorScale(d.properties[expressed]);
            });
};    
})();