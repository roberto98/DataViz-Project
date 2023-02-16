d3.csv("./python/CSV/stacked_fixed.csv").then(function (data) {
    //console.log(data)
    const margin = {top: 60, right: 15, bottom: 75, left: 87},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#stacked")
      .append("svg")
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- PLAY BUTTON ---------------------------------------------------- //

    function Play(){
        var playButton = d3.select("#stacked_yearPlay")
        var slider = d3.select("#stacked_yearSlider")
        var Stacked_yearDisplay = d3.select("#stacked_yearDisplay")

        var playing = false;
        var interval;
        var currentYear = 2000;
        var i = 0;
        const years = ["2000", "2010", "2015", "2019"];
        //console.log(years);
        // I set default values
        Stacked_yearDisplay.text(currentYear);
        slider.property("value", i);
        updateChart(currentYear, playing);

        // When the input of the slider changes, i update
        slider.on("input", function() {
        i = this.value;
        currentYear = years[i];
        Stacked_yearDisplay.text(currentYear);
        updateChart(currentYear, playing);
      });

      // When Play start the animation
      playButton.on("click", function() {
        if (!playing) {
          playing = true;
          playButton.text("Pause");
          interval = setInterval(function() {
            i = +slider.property("value");
            currentYear = years[i];
            if (currentYear >= 2019) {
              i = 0;
              currentYear = 2000;
              slider.property("value", i);
            } else {
                i+=1;
                currentYear=years[i];
                slider.property("value", i);
            }
            Stacked_yearDisplay.text(currentYear);
            updateChart(currentYear, playing);
          }, 750);
        } else {
          playing = false;
          playButton.text("Play");
          updateChart(currentYear, playing);
          clearInterval(interval);
        }
      });

    }

    Play();

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- UPDATE CHART---------------------------------------------------- //
  function updateChart(year,playing) {
      
      d3.select("#stacked").selectAll("svg > g > *").remove();

      selectedYear = String(year);
      var filteredData = data.filter(d => d.Year == selectedYear);

      var columnNames = Object.keys(data[0]);

      // Get an array of the column names
      var columnNames = Object.keys(data[0]);
      // Select the columns from the third column to the end
      var rangeColumns = columnNames.slice(2);
      // Compute the sum of the selected columns for each row
      filteredData.forEach(function(d) {
          d.total = d3.sum(rangeColumns, function(key) { return +d[key]; });
      });
      // Sort the data by descending order of total
      filteredData.sort(function(a, b) {
          return b.total - a.total;
      });

      // Select the first 5 rows
      var top5 = filteredData.slice(0, 5);

      var max = d3.max(top5, function(d) { return d.total; });
      var y_domain = top5.map(d => d.Country);

        var newTable = top5.map(function(d) {
            return {"Country": d.Country,
                    "Year": d.Year,
                    "0-14":  (+d["<1 year"]) +     (+d["1-4 years"]) +   (+d["5-9 years"]) +   (+d["10-14 years"]),
                     "15-34": (+d["15-19 years"]) + (+d["20-24 years"]) + (+d["25-30 years"]) + (+d["30-34 years"]),
                     "35-60": (+d["35-39 years"]) + (+d["40-44 years"]) + (+d["45-49 years"]) + (+d["50-54 years"]) + (+d["55-59 years"]),
                     "61-84": (+d["60-64 years"]) + (+d["65-69 years"]) + (+d["70-74 years"]) + (+d["75-79 years"]) + (+d["80-84 years"]),
                     "85+":   (+d["85+ years"])
                    };
        });
        console.log(newTable)
        var columnNewTable = Object.keys(newTable[0]);
        // Select the columns from the third column to the end
        var rangeColumns = columnNewTable.slice(2);

         // ---------------------------- Axis x -------------------------- //
        const x = d3.scaleLinear()
           .domain([0, max]).nice()
           .range([0, width]);
        svg.append('g')
           .attr('transform', `translate(0,${height})`)
           .call(d3.axisBottom(x))
        svg.append("text").attr("text-anchor", "end").attr("x", width - margin.right).attr("y", height + 50).text("Number of deaths").style("font-size", 15)

        // ------------------------------- Axis y -------------------------- //
        const y = d3.scaleBand()
           .domain(y_domain)
           .range([0, height])
           .padding(0.1);
        svg.append("g")
           .call(d3.axisLeft(y))
        svg.append("text").attr("text-anchor", "middle").attr("x", 0).attr("y", -20).text("Top 5 countries (by deaths)").style("font-size", 14)

        // ----------------------------- Colors ------------------------------- //
        colors_list = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#023047'];
        const color = d3.scaleOrdinal()
        .domain(rangeColumns)
        .range(colors_list);

        var stackedData = d3.stack()
            .keys(rangeColumns)
            (newTable)

        // ------------------------------- Tooltip ------------------------------ //
        const tooltip = d3.select("#stacked")
            .append("div")
            .attr("id", "tool")
            .attr("class", "tooltip")

        console.log(stackedData)


        // ------------------------------- Plot ------------------------------- //
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .attr("class", d => "myRect range" + d.key.replaceAll('-', '_').replaceAll('+', '')) // Add a class to each subgroup: their name
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(d => d)
            .join("rect")
            .attr('x', d => x(d[0]))
            //.attr('x', function(d) { return x(d[0])})
            .attr('y', d => y(d.data.Country))
            .attr('height', y.bandwidth())
            .attr('width', d => (x(d[1]) - x(d[0])))
            .attr("stroke", "grey")
            .on("mouseover", function (event, d) { // What happens when user hover a bar
                if(!playing){
                  // what subgroup are we hovering?
                var rangeClass = d3.select(this.parentNode).datum().key
                //console.log(rangeClass)
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html("<span class='tooltiptext'>" + "Range: " + rangeClass + "<br>" + "Deaths: " + `${d[1] - d[0]}` + "</span>")
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");

                // Reduce opacity of all rect to 0.2
                d3.selectAll(".myRect")
                    .style("opacity", 0.2)

                // Highlight all rects of this subgroup with opacity 1.
                // It is possible to select them since they have a specific class = their name.
                d3.selectAll(".range" + rangeClass.replaceAll('-', '_').replaceAll('+', ''))
                    .style("opacity", 1)

                }

            })
            .on("mouseleave", function () { // When user do not hover anymore
                if(!playing){
                  tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);

                  // Back to normal opacity: 1
                  d3.selectAll(".myRect")
                      .style("opacity", 1)

                }
                
            })
  }

});
