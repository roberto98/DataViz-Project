d3.csv("./python/CSV/histogram.csv").then(function (data) {
    const margin = {top: 60, right: 15, bottom: 75, left: 55},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#histogram")
      .append("svg")
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- PLAY BUTTON ---------------------------------------------------- //
    function Play(){
        var playButton = d3.select("#Histogram_yearPlay")
        var slider = d3.select("#Histogram_yearSlider")
        var Histogram_yearDisplay = d3.select("#Histogram_yearDisplay")

        var playing = false;
        var interval;
        var currentYear = 2000;
        var years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

        // I set default values
        Histogram_yearDisplay.text(currentYear);
        slider.property("value", currentYear);
        updateChart(currentYear);

        // When the input of the slider changes, i update
        slider.on("input", function() {
        currentYear = this.value;
        Histogram_yearDisplay.text(currentYear);
        updateChart(currentYear);
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
            Histogram_yearDisplay.text(currentYear);
            updateChart(currentYear);
            }, 750);
        } else {
            playing = false;
            playButton.text("Play");
            clearInterval(interval);
        }
        });
    }

    Play();

    const tooltip = d3.select("#histogram")
        .append("div")
        .attr("class", "tooltip")

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- UPDATE CHART---------------------------------------------------- //

    function updateChart(year) {
        d3.select("#histogram").selectAll("svg > g > *").remove();
        selectedYear = String(year);
        const filteredData = data.filter(function(d){return d.Year === selectedYear});
        var maxVal = d3.max(data, d => d.LifeExpectancy);
        var minVal = d3.min(data, d => d.LifeExpectancy);
        //console.log(filteredData);




        // --------------------------- X axis ------------------------ //
        // X axis: scale and draw:
        var x = d3.scaleLinear()
            .domain([minVal, maxVal])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        svg.append("text").attr("text-anchor", "end").attr("x", width - margin.right).attr("y", height + 50).text("Life Expectancy").style("font-size", 15)



        //-------------------------- Histogram---------------------------//
        // set the parameters for the histogram
        var histogram = d3.histogram()
            //.data(filteredData)
            .value(function(d) { return d.LifeExpectancy; })   // I need to give the vector of value
            .domain(x.domain())  // then the domain of the graphic
            .thresholds(x.ticks(20)); // then the numbers of bins

        // And apply this function to data to get the bins
        var bins = histogram(filteredData);

        //console.log(histogram)

        // ----------------------------- Y axis ------------------------- //

        // Y axis: scale and draw:
        var y = d3.scaleLinear()
            .range([height, 0]);
        //var maxbin = d3.max(bins, function(d) { return d.length; })
        y.domain([0, 40]);   // d3.hist has to be called before the Y axis obviously

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text").attr("text-anchor", "middle").attr("x", 0).attr("y", -20).text("Number of Countries").style("font-size", 12)


        //--------------------TOOLTIP--------------------

        var tooltip = d3.select("#histogram")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("color", "white")
            .style("border-radius", "5px")
            .style("padding", "10px")


        var showTooltip = function(event, d) {

            tooltip
                .transition()
                .duration(200)
                .style("opacity", 1)
            tooltip.html("<span class='tooltiptext'>" + "Age range: " + d.x0 + " - " + d.x1 + "<br>"
                + "Number of countries: " + d.length + "</span>")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px")

            d3.selectAll("rect")
                .style("opacity", 0.4)

            d3.select(this)
              .style("stroke", "black")
              .style("opacity", 1)
        }

        var hideTooltip = function(event) {
            tooltip.transition()
                .duration(2)
                .style("opacity", 0);
            d3.select(this)
              .style("stroke", "none")

            // Back to normal opacity: 1
            d3.selectAll("rect")
                .style("opacity", 1)
        }

        var moveTooltip = function(event) {
            tooltip
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px")
          }

        // append the bar rectangles to the svg element
        svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "#FF595E")
            // Show tooltip on hover
            .on("mouseover", showTooltip )
            .on("mousemove", moveTooltip )
            .on("mouseleave", hideTooltip )




    }
























})
