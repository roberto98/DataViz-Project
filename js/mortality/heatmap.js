
//Read the data
d3.csv("./python/CSV/heatmap.csv").then(data => {

  console.log(data);

  const margin = {top: 10, right: 0, bottom: 75, left: 90};
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


  const myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([-1,1])

  // create a tooltip
  const tooltip = d3.select("#heatmap")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "0.5px")
    .style("border-radius", "5px")
    .style("padding", "1px")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function(event,d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  const mousemove = function(event,d) {
    tooltip
      .html("The exact value of<br>this cell is: " + d.corr)
      .style("left", (event.x)/2 + "px")
      .style("top", (event.y)/2 + "px")
  }
  const mouseleave = function(event,d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

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
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
})
