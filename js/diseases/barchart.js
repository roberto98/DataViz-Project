d3.csv("./python/CSV/horizontal_barchart.csv").then(function (data) {

    const margin = {top: 40, right: 10, bottom: 50, left: 200},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#barchart")
        .append("svg")
        .attr('width', '100%')
        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const countriesFilters = new Set(data.map(d => d.Country));


    d3.select("#barchart_bottom")
        .selectAll('myOptions')
        .data(countriesFilters)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
    d3.select("#barchart_bottom")
        .property("value", "Italy");


    var years = [2000, 2010, 2015, 2019];

    function Play(){
        var playButton = d3.select("#barchart_yearPlay")
        var slider = d3.select("#barchart_yearSlider")
        var barchart_yearDisplay = d3.select("#barchart_yearDisplay")

        var playing = false;
        var interval;
        var currentYear = 2000;
        var currentCountry = "Italy"
        var i = 0;

        // I set default values
        barchart_yearDisplay.text(currentYear);
        slider.property("value", i);
        updateChart(currentYear, currentCountry);

        // When the input of the slider changes, i update
        slider.on("input", function() {
        i = this.value;
        currentYear = years[i];
        barchart_yearDisplay.text(currentYear);
        currentCountriesFilter = d3.select("#barchart_bottom").property("value");
        updateChart(currentYear, currentCountriesFilter);
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
            barchart_yearDisplay.text(currentYear);
            currentCountry = d3.select("#barchart_bottom").property("value");
            updateChart(currentYear, currentCountry);
          }, 750);
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


    function updateChart(year, country) {
        d3.select("#barchart").selectAll("svg > g > *").remove();
        selectedYear = String(year);
        selectedCountry = country;

        var countryData = data.filter(d => d.Country === selectedCountry);
        var maxValue = d3.max(countryData, d => +d.Deaths);

        var filteredData = data.filter(d => d.Country === selectedCountry && d.Year === selectedYear);

        var columnNames = Object.keys(data[0]);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, maxValue])
            .range([ 0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");
        svg.append("text").attr("text-anchor", "end").attr("x", width - margin.right).attr("y", height + 50).text("Number of deaths").style("font-size", 12)

        // Y axis
        const y = d3.scaleBand()
            .range([ 0, height ])
            .domain(filteredData.map(d => d.Disease))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))
        svg.append("text").attr("text-anchor", "middle").attr("x", 0).attr("y", -20).text("Diseases").style("font-size", 14)

        // colors
        const colors_list = ["#FF595E", "#FF924C", "#FFCA3A", "#C5CA30", "#8AC926", "#36949D", "#1982C4", "#4267AC"];
        const colorScale = d3.scaleOrdinal()
          .domain(filteredData.map(d => d.Disease))
          .range(colors_list);


        // create a tooltip
        const tooltip = d3.select("#barchart")
            .append("div")
            .attr("class", "tooltip")

        //Bars
        svg.selectAll("mybar")
            .data(filteredData)
            .join("rect")
            .attr("class", d => "myRect " + d.Disease.replaceAll(' ', '_'))
            .attr("y", d => y(d.Disease))
            .attr("height", y.bandwidth())
            .attr("fill", d => colorScale(d.Disease))
            .style("opacity", 0.8)
            .attr("width", x(0)) // always equal to 0
            .attr("x", x(0))
            .on("mouseover", function (event, d) {

                var diseasesClass = d3.select(this).attr("class").split(" ")[1]

                // Highlight all rects of this subgroup with opacity 1.
                // It is possible to select them since they have a specific class = their name.
                d3.selectAll("." + diseasesClass.replaceAll(' ', '_'))
                    .style("opacity", 1)

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);

                tooltip.html("<span class='tooltiptext'>" +
                  d.Disease + "<br>" +
                  "Deaths: " + (+d.Deaths).toFixed(2)+"</span>")
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {

                var diseasesClass = d3.select(this).attr("class").split(" ")[1]

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);

                d3.selectAll("." + diseasesClass.replaceAll(' ', '_'))
                    .style("opacity", 0.8)
            });

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(500)
            .attr("x", x(0))
            .attr("width", d => x(d.Deaths))
            .delay((d, i) => {
                return i * 10
            })
    }

    d3.select("#barchart_bottom").on("change", function(event,d) {
        indexYear = d3.select("#barchart_yearSlider").property("value");
        selectedYear = years[indexYear];
        selectedCountriesFilter = d3.select("#barchart_bottom").property("value");
        updateChart(selectedYear, selectedCountriesFilter);
      })



})
