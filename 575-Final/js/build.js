(function(){

        //variables for data join
var attrArray = ["Incidents of Conflict", "Number of Refugees", "GDP Per Capita", "Life Expectancy at Birth"];
var expressed = attrArray[0]; //initial attribute
    
        //chart frame dimensions
   //map frame dimensions
      var chartWidth = window.innerWidth * 0.425,
        chartHeight = 1000,
        leftPadding = 25,
        rightPadding = 25,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 2808]);

//begin script when window load
window.onload = setMap();

//set up choropleth map
function setMap(){
     //map frame dimensions
   //map frame dimensions
    var width = window.innerWidth * 0.5,
        height = 1000;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

     //create Albers equal area conic projection centered on Sahel
        var projection = d3.geoAzimuthalEqualArea()
            .center([15, 15])
            .rotate([-2, 0, 0])
            .scale(1200)
            .translate([width / 2, height / 2]);
    
        var path = d3.geoPath()
        .projection(projection);

    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/data575.csv") //load attributes from csv
        .defer(d3.json, "data/Africa2.topojson") //load background spatial data
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
        console.log(sahel)
         //create the color scale
        var colorScale = makeColorScale(csvData);
        
        setEnumerationUnits(sahel, map, path, colorScale);
        setChart(csvData, colorScale);
            createDropdown(csvData);          
    };
};
    
    
    //function to create coordinated bar chart
    function setChart(csvData, colorScale){

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
                return chartHeight - yScale(parseFloat(d[expressed])-10);
            })
            .style("fill", function(d){
                return choropleth(d, colorScale);
            });
             var chartTitle = chart.append("text")
                .attr("x", 20)
                .attr("y", 40)
                .attr("class", "chartTitle")
                .text("Occurences of Violent Conflict by Country");
            //annotate bars with attribute value text
        var numbers = chart.selectAll(".numbers")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function(a, b){
                return a[expressed]-b[expressed]
            })
            .attr("class", function(d){
                return "numbers " + d.NAME_ENGLI;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){
                var fraction = chartWidth / csvData.length;
                return i * fraction + (fraction - 1) / 2;
            })
            .attr("y", function(d){
                return chartHeight - yScale(parseFloat(d[expressed]));
            })
            .text(function(d){
                return d[expressed];
            })
            //below Example 2.8...create a text element for the chart title
   
            updateChart(bars, csvData.length, colorScale);

};
    
    //function to create a dropdown menu for attribute selection
    function createDropdown(csvData){
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
          .on("change", function(){
            changeAttribute(this.value, csvData)
        });

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };
    
    //dropdown change listener handler
    function changeAttribute(attribute, csvData){
    //change the expressed attribute
        expressed = attribute;

        //recreate the color scale
        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var regions = d3.selectAll(".regions")
            .style("fill", function(d){
                return choropleth(d.properties, colorScale)
            });
        //in changeAttribute()...Example 1.5 line 15...re-sort bars
      //re-sort, resize, and recolor bars
        var bars = d3.selectAll(".bar")
            //re-sort bars
            .sort(function(a, b){
                return b[expressed] - a[expressed];
            });
            updateChart(bars, csvData.length, colorScale);

};          
//function to position, size, and color bars in chart
    function updateChart(bars, n, colorScale){
//        //position bars
        bars.attr("x", function(d, i){
                return i * (chartWidth / csvData.length);
            })
            .data(csvData)
            .attr("height", function(d){
                return yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d){
                return chartHeight - yScale(parseFloat(d[expressed])-10);
            })
            .style("fill", function(d){
                return choropleth(d, colorScale);
            });
             var chartTitle = chart.append("text")
                .attr("x", 20)
                .attr("y", 40)
                .attr("class", "chartTitle")
                .text("Occurences of Violent Conflict by Country");
        };
           
    //create a domain array for use throughout the map
    function makeDomainArray(csvData){
	//build a domain array for the attribute
	var domainArray = [];
	for (var i=0; i<csvData.length; i++) {
		var val = parseFloat(csvData[i][expressed]); //remember that 'expressed' is a global attribute!
		domainArray.push(val);
	};
	return domainArray;
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
    
    function makeColorScale(data){
        var colorClasses = [
            "#FFFD00",
            "#DCDB10",
            "#AAA939",
            "#787848",
            "#46463C"
        ];


        //create color scale generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //call domainArray to create list of currently expressed values
        var domainArray = makeDomainArray(data);
       
    

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
    
   //function to test for data value and return color
    function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#FFFFFF";
    };
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
         //  console.log(sahel);
    return sahel;
    };
    
    function setEnumerationUnits(sahel, map, path, colorScale){
    //add Sahelian countries to map
        var regions = map.selectAll(".regions")
            .data(sahel)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.NAME_ENGLI;
            })
            .attr("d", path)
                    //Example 1.7 line 13
        .style("fill", function(d){
            return choropleth(d.properties, colorScale);
        });
}; 

})(); //last line of main.js