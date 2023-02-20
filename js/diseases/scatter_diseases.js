
d3.csv("./python/CSV/scatter_diseases.csv").then(function (data) {

  const margin = {top: 40, right: 190, bottom: 60, left: 50},
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#scatter")
      .append("svg")
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- SELECT BUTTONS ---------------------------------------------------- //
      const allVariables = ['Infectious and parasitic diseases', 'Cardiovascular diseases', 'Respiratory diseases',
                            'Digestive diseases', 'Neurological conditions', 'Mental and substance use disorders', 'Unintentional injuries', 'Intentional injuries'];

      const countriesFilters = ['LifeExpectancy', 'Population', 'Infectious and parasitic diseases', 'Cardiovascular diseases', 'Respiratory diseases',
                                'Digestive diseases', 'Neurological conditions', 'Mental and substance use disorders', 'Unintentional injuries', 'Intentional injuries'];
      // Variables
      d3.select("#scatterVariable")
        .selectAll('myOptions')
        .data(allVariables)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
      d3.select("#scatterVariable")
        .property("value", "Infectious and parasitic diseases");

      // Countries in the legend
      d3.select("#scatterCountries")
        .selectAll('myOptions')
        .data(countriesFilters)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
      d3.select("#scatterCountries")
        .property("value", "Population");


  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- PLAY BUTTON ---------------------------------------------------- //
  var years = [2000, 2010, 2015];

  function Play(){
      var playButton = d3.select("#scatter_yearPlay")
      var slider = d3.select("#scatter_yearSlider")
      var scatter_yearDisplay = d3.select("#scatter_yearDisplay")

      var playing = false;
      var interval;
      var currentYear = 2000;
      var currentVariable = "Infectious and parasitic diseases"
      var currentCountriesFilter = "Population"
      var currentSort = "Desc";
      var i = 0;

      // I set default values
      scatter_yearDisplay.text(currentYear);
      slider.property("value", i);
      updateChart(currentYear, currentVariable, currentCountriesFilter, currentSort, playing);

      // When the input of the slider changes, i update
      slider.on("input", function() {
        i = this.value;
        currentYear = years[i];
        scatter_yearDisplay.text(currentYear);
        currentVariable = d3.select("#scatterVariable").property("value");
        currentCountriesFilter = d3.select("#scatterCountries").property("value");
        currentSort = d3.select("#scatterSort").property("value");
        updateChart(currentYear, currentVariable, currentCountriesFilter, currentSort, playing);
      });

      // When Play start the animation
      playButton.on("click", function() {
        if (!playing) {
          playing = true;
          playButton.text("Pause");
          interval = setInterval(function() {
            i = +slider.property("value");
            currentYear = years[i];
            if (currentYear >= 2015) {
              i = 0
              currentYear = 2000;
              slider.property("value", i);
            } else {
              i+=1;
              currentYear = years[i];
              slider.property("value", i);
            }
            scatter_yearDisplay.text(currentYear);
            currentVariable = d3.select("#scatterVariable").property("value");
            currentCountriesFilter = d3.select("#scatterCountries").property("value");
            currentSort = d3.select("#scatterSort").property("value");
            updateChart(currentYear, currentVariable, currentCountriesFilter, currentSort, playing);
          }, 300);
        } else {
          playing = false;
          playButton.text("Play");
          updateChart(currentYear, currentVariable, currentCountriesFilter, currentSort, playing);
          clearInterval(interval);
        }
      });
  }

  Play();


  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- UPDATE CHART---------------------------------------------------- //
  function updateChart(year, variable, countries, sort, playing) {
    d3.select("#scatter").selectAll("svg > g > *").remove();

    sort = String(sort);
    yVal = String(variable);
    xVal = "LifeExpectancy";

    selectedYear = String(year);
    CountriesFilter = String(countries);

    const selectedCountries = data.sort((a, b) => {
        if (sort === 'Asc') {
            return a[CountriesFilter] - b[CountriesFilter];
        } else if (sort === 'Desc') {
            return b[CountriesFilter] - a[CountriesFilter];
        } else {
            // Default to ascending order if sort is not set or has an invalid value
            return a[CountriesFilter] - b[CountriesFilter];
        }
    })
    .reduce((unique, item) => {
        if (!unique.some(d => d.Country === item.Country)) {
            unique.push(item);
        }
        return unique;
    }, [])
    .slice(0, 20)
    .map(d => d.Country);

    var filteredData = data.filter(function(d){
        return selectedCountries.includes(d.Country) && d.Year === selectedYear;
    });

    // --------------------------- X axis ------------------------ //
    var min_max_x = d3.extent(data, function(d) {return +d[xVal]});
    var min_max_y = d3.extent(data, function(d) {return +d[yVal]});

    var x = d3.scaleLinear()
        .domain([min_max_x[0], min_max_x[1]]).nice()
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format(".2s")));

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 50)
        .text(xVal + " (years)")
        .style("font-size", 10)

    // ----------------------------- Y axis ------------------------- //
    var y = d3.scaleLinear()
        .domain([-1, min_max_y[1]*1.1]).nice()
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

    var unit_measure = "per 100 000 population";

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", -50)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text(yVal + " (" + unit_measure + ")")
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

    const colors = ["#FF595E", "#FF924C", "#FFCA3A", "#C5CA30", "#8AC926", "#36949D", "#1982C4", "#4267AC", "#565AA0", "#6A4C93"];
    const color = d3.scaleOrdinal()
        .domain(selectedCountries)
        .range(colors);

    // Create the scatter variable: where both the circles and the brush take place
    const scatter = svg.append('g')
        .attr("clip-path", "url(#clip)")


    // --------------------------------- Tooltip ---------------------------- //
    // create a tooltip
    const tooltip = d3.select("#scatter")
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

    // --------------------------------- Plot ---------------------------- //
    const format = d3.format(".2f");

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
        .on("mouseover", function (event, d){
          if(!playing){
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html("<span class='tooltiptext'>"
                  //+ "Year: "+ d.Year + "<br>"
                  + "Country: " + d.Country + "<br>"
                  + `${xVal}: ` + d[xVal] + " years <br>"
                  + `${yVal}: ` + " " + format(d[yVal])  + " deaths " + unit_measure + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
          }
        })
        .on("mousemove", function (event, d){
          if(!playing){
            tooltip
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
          }
        })
        .on("mouseleave", function (event, d){
          if(!playing){
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
          }
        })


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
    size = 12;
    const legendContainer =  d3.select("#scatter").select("svg").append("g")
      .attr("transform", "translate( 550, 10)")

    // Add a scrollable view to the container
    const scroll = legendContainer.append("g")
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("clip-path", "url(#clip2)")
      .style("overflow", "auto")



    // Add one dot in the legend for each name.
    legendContainer.selectAll("myrect")
      .data(selectedCountries)
      .join("circle")
      .attr("cx", size * 0.6)
      .attr("cy", (d, i) => i * (size + 5))
      .attr("r", 7)
      .style("fill", d => color(d))
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight);

    // Add labels beside legend dots
    legendContainer.selectAll("mylabels")
      .data(selectedCountries)
      .enter()
      .append("text")
      .attr("x", size * 1.2)
      .attr("y", (d, i) => i * (size + 5) + (size / 2))
      .style("fill", d => color(d))
      .text(d => d)
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight);


  }


  // ---------------------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- SELECT BUTTONS LISTENERS ---------------------------------------------------- //

  d3.select("#scatterVariable").on("change", function(event,d) {
    indexYear = d3.select("#scatter_yearSlider").property("value");
    selectedYear = years[indexYear];
    selectedVariable = d3.select("#scatterVariable").property("value");
    selectedCountriesFilter = d3.select("#scatterCountries").property("value");
    selectedSort = d3.select("#scatterSort").property("value");

    var playing = false;
    play_button = d3.select("#scatter_yearPlay").text();
    if(play_button === "Pause") {playing = true;}

    updateChart(selectedYear, selectedVariable, selectedCountriesFilter, selectedSort, playing);
  })

  d3.select("#scatterCountries").on("change", function(event,d) {
    indexYear = d3.select("#scatter_yearSlider").property("value");
    selectedYear = years[indexYear];
    selectedVariable = d3.select("#scatterVariable").property("value");
    selectedCountriesFilter = d3.select("#scatterCountries").property("value");
    selectedSort = d3.select("#scatterSort").property("value");

    var playing = false;
    play_button = d3.select("#scatter_yearPlay").text();
    if(play_button === "Pause") {playing = true;}

    updateChart(selectedYear, selectedVariable, selectedCountriesFilter, selectedSort, playing);
  })

  d3.select("#scatterSort").on("change", function(event,d) {
    indexYear = d3.select("#scatter_yearSlider").property("value");
    selectedYear = years[indexYear];
    selectedVariable = d3.select("#scatterVariable").property("value");
    selectedCountriesFilter = d3.select("#scatterCountries").property("value");
    selectedSort = d3.select("#scatterSort").property("value");

    var playing = false;
    play_button = d3.select("#scatter_yearPlay").text();
    if(play_button === "Pause") {playing = true;}

    updateChart(selectedYear, selectedVariable, selectedCountriesFilter, selectedSort, playing);
  })

});
