
//Read the data
d3.csv("./python/CSV/heatmap.csv").then(data => {

  const margin = {top: 100, right: 0, bottom: 75, left: 90};
  const width = 450 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  const myGroups = Array.from(new Set(data.map(d => d.Group1)))
  const myVars = Array.from(new Set(data.map(d => d.Group2)))

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


  const tooltip = d3.select("#heatmap")
  .append("div")
  .attr("class", "tooltip")


  // add the squares
  svg.selectAll()
    .data(data, function(d) {return d.Group1+':'+d.Group2;})
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

// Add legend
  const size = 10
  const legend = svg.append("g")
    .attr("transform", `translate(10, 0)`)
    .attr("font-size", size)

  const legendLinear = d3.legendColor()
    .shapeWidth(50)
    .orient('vertical')
    .scale(myColor)

  legend.call(legendLinear)


})
