//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
        //variables for data join
var attrArray = ["RISK", "AT_2007", "AT_2008", "AT_2009", "AT_2010", "AT_2011", "AT_2012", "AT_2013", "AT_2014", "AT_2015", "AT_2016", "AT_2017", ];
var expressed = attrArray[0]; //initial attribute

//begin script when window loads
window.onresize = setMap();

//set up choropleth map
function setMap(){
    
        //map frame dimensions
        var width = window.innerWidth * 0.5,
            height = 1050;

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
            .scale(1050)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection); 
    
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/ACLED.csv") //load attributes from csv
        .defer(d3.json, "data/Africa.topojson") //load background spatial data
        .defer(d3.json, "data/Sahel.topojson") //load choropleth spatial data
        .await(callback);
    
      function callback(error, csvData, africa, sahel){
          
            //place graticule on the map
            setGraticule(map, path);
          
        //translate europe TopoJSON
        var africa = topojson.feature(africa, africa.objects.Africa),
            sahel = topojson.feature(sahel, sahel.objects.Sahel).features;
          
           
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
    
    //function to create coordinated bar chart
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
    
    //set bars for each province
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .attr("class", function(d){
            return "bars " + d.adm1_code;
        })
        .attr("width", chartWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartWidth / csvData.length);
        })
        .attr("height", 460)
        .attr("y", 0);
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
        var csvKey = csvRegion.HASC_1; //the CSV primary key

        //loop through geojson regions to find correct region
        for (var a=0; a<sahel.length; a++){

            var geojsonProps = sahel[a].properties; //the current region geojson properties
            var geojsonKey = geojsonProps.HASC_1; //the geojson primary key

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
                return "regions " + d.properties.HASC_1;
            })
            .attr("d", path)
            .style("fill", function(d){
            return colorScale(d.properties[expressed]);
            });
};    
})();