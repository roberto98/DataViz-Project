//Read the data
d3.csv("./python/CSV/country_heatmap.csv").then(data => {

  const margin = {top: 40, right: 15, bottom: 20, left: 40};
  const width = 450 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);



// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- SELECT BUTTONS ---------------------------------------------------- //
  const allCountries = new Set(data.map(d => d.Country))
  // Countries
  d3.select("#heatmapCountry")
    .selectAll('myOptions')
    .data(allCountries)
    .enter()
    .append('option')
    .text(function (d) { return d; })
    .attr("value", function (d) { return d; })
  d3.select("#heatmapCountry")
    .property("value", "Italy");

  // ----------------------------------------- Create Tooltip ----------------------------------- //
    const tooltip = d3.select("#heatmap")
    .append("div")
    .attr("class", "tooltip")

selectedCountry = d3.select("#heatmapCountry").property("value");
updateChart(selectedCountry)
// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- UPDATE CHARTS ---------------------------------------------------- //
  function updateChart(selectedCountry){
    d3.select("#heatmap").selectAll("svg > g > *").remove();

    const filteredData = data.filter(d => d.Country === selectedCountry);

    const myGroups = Array.from(new Set(filteredData.map(d => d.Group1)))
    const myVars = Array.from(new Set(filteredData.map(d => d.Group2)))

    // Build X scales and axis:
    const x = d3.scaleBand()
      .range([ 0, width ])
      .domain(myGroups)
      .padding(0.05);

    svg.append("g")
      .style("font-size", 5)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .select(".domain").remove()

    // Build Y scales and axis:
    const y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(myVars)
      .padding(0.05);
    svg.append("g")
      .style("font-size", 5)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain").remove()

    // Build color scale
    color_arr = d3.schemeGreens[8].slice(1);
    const myColor = d3.scalePow(/*d3.interpolateBlues*/)
        .domain([-1, 1])
        .range([color_arr[0], color_arr[color_arr.length-1]])
        .exponent(0.6);

    // add the squares
    svg.selectAll()
      .data(filteredData, function(d) {return d.Group1+':'+d.Group2;})
      .join("rect")
        .attr("x", function(d) { return x(d.Group1) })
        .attr("y", function(d) { return y(d.Group2) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.corr)} )
        .style("stroke-width", 2)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {

          tooltip.transition()
              .duration(200)
              .style("opacity", 1)

          tooltip.html("<span class='tooltiptext'>" + "Correlation: " + Math.round(d.corr *100) /100 + "</span>")
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px")

              d3.select(this)
              .style("stroke", "black")
      })
      .on("mouseout", function () {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
            d3.select(this)
              .style("stroke", "none")
      });

      // ------------------------------------------- LEGEND ---------------------------------------- //
      // https://d3-legend.susielu.com/
      // Build color scale


      // ------------------------------------------- LEGEND ---------------------------------------- //

      // Define the size and position of the legend
      const legendMargin = {top: 10, right: 0, bottom: 10, left: 40};

      // Create the SVG element for the legend
      const legendSvg = d3.select("#heatmap").select("svg").append("g")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMinYMin meet");

      // Create the color gradient for the legend
      const gradient = legendSvg.append("defs")
        .append("linearGradient")
        .attr("id", "heatmap-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      // Define the color stops for the gradient
      gradient.selectAll("stop")
        .data(myColor.ticks().map(d => myColor(d)))
        .enter().append("stop")
        .attr("offset", (d, i) => i / (myColor.ticks().length - 1))
        .attr("stop-color", d => d);

      // Create the colorbar rectangle
      legendSvg.append("rect")
        .attr("x", legendMargin.left)
        .attr("y", legendMargin.top)
        .attr("width", width)
        .attr("height", 10)
        .style("fill", "url(#heatmap-gradient)");

      // Create the axis for the legend
      const legendAxis = d3.axisBottom(d3.scaleLinear().domain([-1, 1]).range([0, width]));
      legendSvg.append("g")
        .attr("transform", `translate(${legendMargin.left }, ${legendMargin.top + 10})`)
        .style("font-size", 8)
        .call(legendAxis);

  }

// ------------------------------------------------ CHANGING STATE -------------------------------- //
  d3.select("#heatmapCountry").on("change", function(event,d) {
    //selectedYear = d3.select("#heatmap_yearSlider").property("value");
    selectedCountry = d3.select("#heatmapCountry").property("value");
    updateChart(selectedCountry);
  })




});
