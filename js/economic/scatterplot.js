
d3.csv("./python/CSV/scatter_economic.csv").then(function (data) {

  const margin = {top: 40, right: 30, bottom: 50, left: 35},
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#scatter2")
      .append("svg")
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- SELECT BUTTONS ---------------------------------------------------- //
      const allVariables = ["GDP","%Expenditure"]
      const countriesFilters = ["Population", "GDP", "%Expenditure"]

      // Variables y-axis
      d3.select("#scatter2Variable")
        .selectAll('myOptions')
        .data(allVariables)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
      d3.select("#scatter2Variable")
        .property("value", "GDP");

      // Countries in the legend
      d3.select("#scatter2Countries")
        .selectAll('myOptions')
        .data(countriesFilters)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
      d3.select("#scatter2Countries")
        .property("value", "Population");


  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- PLAY BUTTON ---------------------------------------------------- //
  function Play(){
      var playButton = d3.select("#Scatter2_yearPlay")
      var slider = d3.select("#Scatter2_yearSlider")
      var Scatter2_yearDisplay = d3.select("#Scatter2_yearDisplay")

      var playing = false;
      var interval;
      var currentYear = 2000;
      var currentVariable = "GDP"
      var currentCountriesFilter = "Population"
      var years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

      // I set default values
      Scatter2_yearDisplay.text(currentYear);
      slider.property("value", currentYear);
      updateChart(currentYear, currentVariable, currentCountriesFilter);

      // When the input of the slider changes, i update
      slider.on("input", function() {
        currentYear = this.value;
        Scatter2_yearDisplay.text(currentYear);
        currentVariable = d3.select("#scatter2Variable").property("value");
        currentCountriesFilter = d3.select("#scatter2Countries").property("value");
        updateChart(currentYear, currentVariable, currentCountriesFilter);
      });

      // When Play start the animation
      playButton.on("click", function() {
        if (!playing) {
          playing = true;
          playButton.text("Pause");
          interval = setInterval(function() {
            currentYear = +slider.property("value");
            if (currentYear >= 2015) {
              currentYear = 2000;
              slider.property("value", currentYear);
            } else {
              currentYear++;
              slider.property("value", currentYear);
            }
            Scatter2_yearDisplay.text(currentYear);
            currentVariable = d3.select("#scatter2Variable").property("value");
            currentCountriesFilter = d3.select("#scatter2Countries").property("value");
            updateChart(currentYear, currentVariable, currentCountriesFilter);
          }, 500);
        } else {
          playing = false;
          playButton.text("Play");
          clearInterval(interval);
        }
      });
  }

  Play();


  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- UPDATE CHART---------------------------------------------------- //
  function updateChart(year, variable, countries) {
    d3.select("#scatter2").selectAll("svg > g > *").remove();
    selectedYear = String(year);
    xVal = String(variable);
    yVal = "LifeExpectancy";
    CountriesFilter = String(countries);

    var filteredData = data.filter(function(d){return d.Year === selectedYear});

    // --------------------------- X axis ------------------------ //
    x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) {return +d[xVal]}))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format(".2s")));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width - margin.right)
        .attr("y", height + 50)
        .text(xVal)
        .style("font-size", 10)

    // ----------------------------- Y axis ------------------------- //
    y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) {return +d[yVal]}))
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", -20)
        .text(yVal)
        .style("font-size", 10)

    // ------------------------------ Scatter plot ---------------------- //
    // Add a clipPath: everything out of this area won't be drawn.
    const clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);


    // Color scale: give me a specie name, I return a color
    const top10Countries = data.sort((a, b) => b[CountriesFilter] - a[CountriesFilter])
                            .reduce((unique, item) => {
                                if (!unique.some(d => d.Country === item.Country)) {
                                    unique.push(item);
                                }
                                return unique;
                            }, [])
                            .slice(0, 10)
                            .map(d => d.Country);

    filteredData = filteredData.filter(d => top10Countries.includes(d.Country));

    const colors = ["#FF595E", "#FF924C", "#FFCA3A", "#C5CA30", "#8AC926", "#36949D", "#1982C4", "#4267AC", "#565AA0", "#6A4C93"];
    const color = d3.scaleOrdinal()
        .domain(top10Countries)
        .range(colors);

    // Create the scatter variable: where both the circles and the brush take place
    const scatter = svg.append('g')
        .attr("clip-path", "url(#clip)")


    // --------------------------------- Tooltip ---------------------------- //
    // create a tooltip
    const tooltip = d3.select("#scatter2")
        .append("div")
        .attr("class", "tooltip")

    // Highlight the specie that is hovered
    const highlight = function (event, d) {
        selected_country = d
        d3.selectAll(".dot")
            .style("opacity", 0)
        d3.selectAll("." + selected_country.replaceAll(' ', '_'))
            .style("opacity", 1)
    }

    const doNotHighlight = function () {
        d3.selectAll(".dot")
            .style("opacity", 1)
    }

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    const showTooltip = function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);

        tooltip.html("<span class='tooltiptext'>" + "Year: "+ d.Year + "<br>"
                                                  + "Country: " + d.Country + "<br>"
                                                  + "Life Expectancy: " + d.LifeExpectancy + "<br>"
                                                  + `${xVal}: ` + d[xVal]  +"</span>")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    }
    const moveTooltip = function (event, d) {
        tooltip
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px")
    }
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const hideTooltip = function () {
        tooltip
            .transition()
            .duration(100)
            .style("opacity", 0)
    }

    // --------------------------------- Plot ---------------------------- //
    // Add circles
    scatter.append("g")
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", function (d) {
            return "dot " + d.Country.replaceAll(' ', '_')
        })
        .attr("cx", function (d) {
            return x(d[xVal]);
        })
        .attr("cy", function (d) {
            return y(d[yVal]);
        })
        .attr("r", 5)
        .style("fill", function (d) {
            return color(d.Country.replaceAll(' ', '_'))
        })
        // Show tooltip on hover
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)


    // animation circles ?
    svg.selectAll("circle")
        .transition()
        .delay(function (d, i) {
            return i/2
        })
        .duration(200)
        .attr("cx", function (d) {
            return x(d[xVal]);
        })
        .attr("cy", function (d) {
            return y(d[yVal]);
        })

    // --------------------------------- Legend ---------------------------- //
    // Add one dot in the legend for each name.
    const size = 20
    svg.selectAll("myrect")
        .data(top10Countries)
        .join("circle")
        .attr("cx", 490)
        .attr("cy", (d, i) => 10 + i * (size + 5)) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", d => color(d))
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
        .data(top10Countries)
        .enter()
        .append("text")
        .attr("x", 490 + size * .8)
        .attr("y", (d, i) => i * (size + 5) + (size / 2)) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", d => color(d))
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)
  }


  // ---------------------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- SELECT BUTTONS LISTENERS ---------------------------------------------------- //

  d3.select("#scatter2Variable").on("change", function(event,d) {
    selectedYear = d3.select("#Scatter2_yearSlider").property("value");
    selectedVariable = d3.select("#scatter2Variable").property("value");
    selectedCountriesFilter = d3.select("#scatter2Countries").property("value");
    updateChart(selectedYear, selectedVariable, selectedCountriesFilter);
  })

  d3.select("#scatter2Countries").on("change", function(event,d) {
    selectedYear = d3.select("#Scatter2_yearSlider").property("value");
    selectedVariable = d3.select("#scatter2Variable").property("value");
    selectedCountriesFilter = d3.select("#scatter2Countries").property("value");
    updateChart(selectedYear, selectedVariable, selectedCountriesFilter);
  })

});
