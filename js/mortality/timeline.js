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


d3.csv("./python/CSV/time_line.csv").then(function (data) {

  // update the graph based on the dropdown selections
  var selectedOption = d3.select("#variable_select").property("value");
  var selectedCountry = d3.select("#country_select").property("value");
  var mappedData;

  updateGraph(data);

  d3.select("#variable_select").on("change", function() {
  selectedOption = d3.select("#variable_select").property("value");
  updateGraph(data);
  });

  d3.select("#country_select").on("change", function() {
  selectedCountry = d3.select("#country_select").property("value");
  updateGraph(data);
  });


  function updateGraph(data) {
    console.log(selectedOption);
    console.log(selectedCountry);

    // filter the data based on the dropdown value
    mappedData = data.filter(d => d.Country == selectedCountry);

    // set the range of the x-axis
    var x = d3.scaleTime()
      .domain(d3.extent(mappedData, d => new Date(d.Year, 0, 1)))
      .range([0, width]);

    if (selectedOption === "Life") { // -------------------------------- LIFE
      // set the range of the y-axis
      var y = d3.scaleLinear()
        .domain(d3.extent(mappedData, d => +d.LifeExpectancy))
        .range([height, 0]);
    } else if (selectedOption === "Deaths") { // ------------------------ DEATHS
      // set the range of the y-axis
      var y = d3.scaleLinear()
          .domain(d3.extent(mappedData, d => [
            +d.AdultMortality,
            +d.DeathsUnder5,
            +d.InfantDeaths
          ]))
          .range([height, 0]);
    }

    // remove existing x-axis and y-axis
    svg.selectAll(".x.axis").remove();
    svg.selectAll(".y.axis").remove();
    svg.selectAll("path").remove();

    // label the x-axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)));

    // label the y-axis
    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(selectedOption);

      // add the line to the graph
      svg.selectAll("path") // Senza selectALL ma con solo select, non va una ceppa
        .data(mappedData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .style("opacity", 1)
        .attr("d", d3.line()
        .x(d => x(new Date(d.Year, 0, 1)))
        .y(d => y(+d[selectedOption])) // ???????? Non va neanche il grafico singolo Life
        .curve(d3.curveCatmullRom.alpha(0.5)));
  }

});
