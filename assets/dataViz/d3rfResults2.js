function filterJSON(json, key, value) {
  var result = [];
  json.forEach(function(val,idx,arr){
    if(val[key] == value){
    
      result.push(val)
    }
  })
  return result;
}

// Set the dimensions of the canvas / graph
var margin = {top: 50, right: 20, bottom: 100, left: 160},
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");
var formatYear = d3.format(".2");

// Parse the date / time


// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(10)
    .tickFormat(formatYear);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5)
    .tickFormat(formatPercent);

// Define the line
var stageline = d3.svg.line()
		.interpolate("cardinal")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });

// Adds the svg canvas
var svg2 = d3.select("#linePlot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
var data;
// Get the data
d3.json("assets/dataViz/rfPred6.json", function(error, json) {
  console.log(json)
 
  json.forEach(function(d) {
		d.value = +d.value;
  });

	d3.select('#inds')
			.on("change", function () {
				var sect = document.getElementById("inds");
				var section = sect.options[sect.selectedIndex].value;

				data = filterJSON(json, 'country', section);

	      
	      //debugger
	      
		    data.forEach(function(d) {
    			d.value = +d.value;
    			//d.year = parseDate(String(d.year));
    			d.active = true;
    		});
    		
		    
		    //debugger
				updateGraph(data);


				jQuery('h1.page-header').html(section);
			});

	// generate initial graph
	data = filterJSON(json, 'country', 'Brazil');
	updateGraph(data);

});

var color = d3.scale.category20(); //ordinal().range(["#48A36D",  "#0096ff", "#ff007e"]);

function updateGraph(data) {
    

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.year; }));
    y.domain([d3.min(data, function(d) { return d.value; }), d3.max(data, function(d) { return d.value; })]);


    // Nest the entries by state
    dataNest = d3.nest()
        .key(function(d) {return d.stage;})
        .entries(data);


 		var result = dataNest.filter(function(val,idx, arr){
				  return $("." + val.key).attr("fill") != "#ccc" 
				  // matching the data with selector status
				})
				
				
 		var stage = svg2.selectAll(".line")
      .data(result, function(d){return d.key});

		stage.enter().append("path")
			.attr("class", "line");

		stage.transition()
			.style("stroke", function(d,i) { return d.color = color(d.key); })
			.attr("id", function(d){ return 'tag'+d.key.replace(/\s+/g, '');}) // assign ID
			.attr("d", function(d){
		
				return stageline(d.values)
			});

		stage.exit().remove();

		var legend = d3.select("#legend2")
			.selectAll("text")
			.data(dataNest, function(d){return d.key});

		//checkboxes
		legend.enter().append("rect")
		  .attr("width", 10)
		  .attr("height", 10)
		  .attr("x", 0)
		  .attr("y", function (d, i) { return 0 +i*15; })  // spacing
		  .attr("fill",function(d) { 
		    return color(d.key);
		    
		  })
		  .attr("class", function(d,i){return "legendcheckbox " + d.key})
			.on("click", function(d){
			  d.active = !d.active;
			  
			  d3.select(this).attr("fill", function(d){
			    if(d3.select(this).attr("fill")  == "#ccc"){
			      return color(d.key);
			    }else {
			      return "#ccc";
			    }
			  })
			  
			  
			 var result = dataNest.filter(function(val,idx, arr){
         return $("." + val.key).attr("fill") != "#ccc" 
       // matching the data with selector status
      })
      
       // Hide or show the lines based on the ID
       svg2.selectAll(".line").data(result, function(d){return d.key})
         .enter()
         .append("path")
         .attr("class", "line")
         .style("stroke", function(d,i) { return d.color = color(d.key); })
        .attr("d", function(d){
                return stageline(d.values);
         });
 
      svg2.selectAll(".line").data(result, function(d){return d.key}).exit().remove()  
					
			})
		        
    // Add the Legend text
    legend.enter().append("text")
      .attr("x", 15)
      .attr("y", function(d,i){return 10 +i*15;})
      .attr("class", "legend");

		legend.transition()
      .style("fill", "#777" )
      .text(function(d){return d.key;});

		legend.exit().remove();

		svg2.selectAll(".axis").remove();

    // Add the X Axis
    svg2.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg2.append("g")
        .attr("class", "y axis")
        .call(yAxis);
};

function clearAll(){
  d3.selectAll(".line")
	.transition().duration(100)
			.attr("d", function(d){
        return null;
      });
  d3.select("#legend2").selectAll("rect")
  .transition().duration(100)
      .attr("fill", "#ccc");
};

function showAll(){
  d3.selectAll(".line")
	.transition().duration(100)
			.attr("d", function(d){
        return stageline(d.values);
      });
  d3.select("#legend2").selectAll("rect")
  .attr("fill",function(d) {
    if (d.active == true){
       return color(d.key);
     }
   })
};
