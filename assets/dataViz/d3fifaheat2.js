var margin = { top: 100, right: 0, bottom: 20, left: 100 },
          width = 850 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 10),
          legendElementWidth = gridSize*1.5,
          buckets = 5,
          colors = ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"], // adjusted from yellow-green-blue to reds colorbrewer
          teams = ["Argentina", "Australia", "Belgium", "Brazil", "Colombia", "Costa Rica", "Croatia", "Denmark", "Egypt", 
                    "England", "France", "Germany","Iceland","Iran","Japan", "Mexico","Morocco","Nigeria", "Panama", "Peru","Poland",
                    "Portugal", "Russia","Saudi Arabia", "Senegal", "Serbia", "South Korea",  "Spain", "Sweden","Switzerland", 
                    "Tunisia","Uruguay" ],
          stages = ["World Cup Appearances", "Field of 16 Appearances", "Quarterfinal Appearances", "Semifianl Appearances", "Final Appearances", "World Cup Champions"];
          datasets = ["assets/dataViz/heat1978.tsv", "assets/dataViz/heat1998.tsv", "assets/dataViz/heat2018.tsv"];

      var svg = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(teams)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize / 4; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", "dayLabel mono axis");

      var timeLabels = svg.selectAll(".timeLabel")
          .data(stages)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "start")
            .attr("transform", "translate(" + gridSize + ", -6)")
            .attr("class", "timeLabel mono axis");

      var heatmapChart = function(tsvFile) {
        d3.tsv(tsvFile,
        function(d) {
          return {
            Country: +d.Country,
            stage: +d.stage,
            value: +d.value
          };
        },
        function(error, data) {
          var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

          var cards = svg.selectAll(".stage")
              .data(data, function(d) {return d.Country+':'+d.stage;});

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function(d) { return (d.stage - 1) * gridSize; })
              .attr("y", function(d) { return (d.Country - 1) * gridSize/4; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize/4)
              .style("fill", colors[0]);

          cards.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.value); });

          cards.select("title").text(function(d) { return d.value; });
          
          cards.exit().remove();

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

          legend.enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 4)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);

          legend.exit().remove();

        });  
      };

      heatmapChart(datasets[0]);
      
      var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
        .data(datasets);

      datasetpicker.enter()
        .append("input")
        .attr("value", function(d){ return "FIFA World Cup, " + d.slice(19,22); })
        .attr("type", "button")
        .attr("class", "dataset-button")
        .on("click", function(d) {
          heatmapChart(d);
        });
