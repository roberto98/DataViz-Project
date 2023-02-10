
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
  d3.select("#CountryButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
    
  d3.select("#CountryButton")
    .property("value", "Italy");

 
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) {return new Date(d.Year, 0, 1)}))
    .range([0, width]);
 
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)));
 


  var y = d3.scaleLinear()
    .domain([d3.min(data, function(d) { return +d.LifeExpectancy; }), d3.max(data, function(d) { return +d.LifeExpectancy; })])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));


  // Initialize line with first group of the list
  var line = svg
  .append('g')
  .append("path")
    .datum(data.filter(function(d){return d.Country=="Italy"}))
    .attr("d", d3.line()
      .x(function(d) { return x(new Date(d.Year, 0, 1)) })
      .y(function(d) {return y(+d.LifeExpectancy) })
    )
    .attr("stroke", "red" )
    .style("stroke-width", 4)
    .style("fill", "none")




  // Add the points
  svg
    .append("g")
    .selectAll("dot")
    .data(data.filter(function(d){return d.Country=="Italy"}))
    .enter()
    .append("circle")
      .attr("cx", function(d) { return x(new Date(d.Year, 0, 1)) } )
      .attr("cy", function(d) { return y(+d.LifeExpectancy) } )
      .attr("r", 5)
      .attr("fill", "red")



  
  function update() {
    d3.selectAll("g > *").remove();
    
    x = d3.scaleTime()
      .domain(d3.extent(data, function(d) {return new Date(d.Year, 0, 1)}))
      .range([0, width]);
    
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)));
    
    // Create new data with the selection?
    const dataFilter = data.filter(function(d){return d.Country==selectedOption})
    
    if(selectedVariable === "Life"){
      y = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return +d.LifeExpectancy; }), d3.max(data, function(d) { return +d.LifeExpectancy; })])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));
      // Give these new data to update line
      line = svg
          .append('g')
          .append("path")
          .datum(dataFilter)
          .attr("d", d3.line()
            .x(function(d) { return x(new Date(d.Year, 0, 1)) })
            .y(function(d) {return y(+d.LifeExpectancy) })
          )
          .attr("stroke", "red" )
          .style("stroke-width", 4)
          .style("fill", "none")


        // Add the points
        svg
        .append("g")
        .selectAll("dot")
        .data(dataFilter)
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(new Date(d.Year, 0, 1)) } )
          .attr("cy", function(d) { return y(+d.LifeExpectancy) } )
          .attr("r", 5)
          .attr("fill", "red")

    }


    else if(selectedVariable === "Deaths"){

      const minValue = d3.min(data, d => d3.min([Math.floor(d.AdultMortality)]));
      const maxValue = d3.max(data, d => d3.max([Math.floor(d.AdultMortality)]));

      y = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));
      
      // Draw the line
      var adult_line = svg
      .append('g')
      .append("path")
      .datum(dataFilter)
      .attr("d", d3.line()
        .x(function(d) { return x(new Date(d.Year, 0, 1)) })
        .y(function(d) {return y(+d.AdultMortality) })
      )
      .attr("stroke", "red" )
      .style("stroke-width", 4)
      .style("fill", "none")


      // Add the points
      svg
        .append("g")
        .selectAll("dot")
        .data(dataFilter)
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(new Date(d.Year, 0, 1)) } )
          .attr("cy", function(d) { return y(+d.AdultMortality) } )
          .attr("r", 5)
          .attr("fill", "red")



    }
  }
  
  var selectedOption = "Italy";
  var selectedVariable = "Life";


  // When the button is changed, run the updateChart function
  d3.select("#CountryButton").on("change", function(event,d) {
    // recover the option that has been chosen
    selectedOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    update()
  })

  // When the button is changed, run the updateChart function
  d3.select("#VariableButton").on("change", function(event,d) {
    // recover the option that has been chosen
    selectedVariable = d3.select(this).property("value")
    // run the updateChart function with this selected option
    update()
  })


 


  

 
  
  

  
  
})