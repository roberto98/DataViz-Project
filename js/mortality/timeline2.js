
d3.csv("./python/CSV/time_line.csv").then(function (data) {
  
  // set the dimensions and margins of the graph
  const margin = {top: 10, right: 10, bottom: 75, left: 50},
      width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#time_line")
      .append("svg")
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);


  // List of groups (here I have one group per column)
  const allGroup = new Set(data.map(d => d.Country))

  // add the options to the button
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    
  d3.select("#selectButton")
    .property("value", "Italy");

  /*  
  // A color scale: one color for each group
  const myColor = d3.scaleOrdinal()
  .domain(allGroup)
  .range(d3.schemeSet2);
  
  //var filterData = data.filter(d => d.Country == "Italy");
  */
 
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) {return new Date(d.Year, 0, 1)}))
    .range([0, width]);
 
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)));
 


   y = d3.scaleLinear()
    .domain([d3.min(data, function(d) { return +d.LifeExpectancy; }), d3.max(data, function(d) { return +d.LifeExpectancy; })])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));


  // Initialize line with first group of the list
  const line = svg
  .append('g')
  .append("path")
    .datum(data.filter(function(d){return d.Country=="Italy"}))
    .attr("d", d3.line()
      .x(function(d) { return x(new Date(d.Year, 0, 1)) })
      .y(function(d) { console.log(+d.LifeExpectancy); return y(+d.LifeExpectancy) })
    )
    .attr("stroke", "red" )
    .style("stroke-width", 4)
    .style("fill", "none")

  
  function update(selectedGroup) {
    console.log(selectedGroup)
    // Create new data with the selection?
    const dataFilter = data.filter(function(d){return d.Country==selectedGroup})

    // Give these new data to update line
    line
        .datum(dataFilter)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
          .x(function(d) { return x(new Date(d.Year, 0, 1)) })
          .y(function(d) { console.log(+d.LifeExpectancy); return y(+d.LifeExpectancy) })
        )
        .attr("stroke", "red")
  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function(event,d) {
    // recover the option that has been chosen
    const selectedOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    update(selectedOption)
  })


  

  
  
})