
d3.csv("./python/CSV/violin.csv").then(function (data) {

  const margin ={top: 30, right: 30, bottom: 30, left: 40},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#violin")
      .append("svg")
      .attr('width', width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);


  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- PLAY BUTTON ---------------------------------------------------- //
  function Play(){
      var playButton = d3.select("#Violin_yearPlay")
      var slider = d3.select("#Violin_yearSlider")
      var Violin_yearDisplay = d3.select("#Violin_yearDisplay")

      var playing = false;
      var interval;
      var currentYear = 2000;
      var years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

      // I set default values
      Violin_yearDisplay.text(currentYear);
      slider.property("value", currentYear);
      updateChart(currentYear);

      // When the input of the slider changes, i update
      slider.on("input", function() {
        currentYear = this.value;
        Violin_yearDisplay.text(currentYear);
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
            Violin_yearDisplay.text(currentYear);
            updateChart(currentYear);
          }, 500);
        } else {
          playing = false;
          playButton.text("Play");
          clearInterval(interval);
        }
      });
  }

  Play();

  const tooltip = d3.select("#violin")
  .append("div")
  .attr("class", "tooltip")

  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- UPDATE CHART---------------------------------------------------- //
  function updateChart(year) {
    d3.select("#violin").selectAll("svg > g > *").remove();
    selectedYear = String(year);
    const filteredData = data.filter(function(d){return d.Year === selectedYear});
    var maxVal = d3.max(filteredData, d => d.LifeExpectancy);
    var minVal = d3.min(filteredData, d => d.LifeExpectancy);

    // ----------------------------- Y axis ------------------------- //
    y = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))
    svg.append("text").attr("text-anchor", "middle").attr("x", 0).attr("y", -20).text("Life Expectancy").style("font-size", 10)

    // --------------------------- X axis ------------------------ //
    x = d3.scaleBand()
      .range([ 0, width ])
      .domain(["Developing", "Developed"])
      .padding(0.05)
    svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x))
    svg.append("text").attr("text-anchor", "end").attr("x", width - margin.right).attr("y", height + 50).text("Country Status").style("font-size", 10)

    // ----------------------------- Kernel Density ------------------------- //
    kde = kernelDensityEstimator(kernelEpanechnikov(2), y.ticks(50))
    sumstats = d3.rollup(filteredData, v => d3.mean(v, d => d.LifeExpectancy), d => d.Status);

    var maxNum = 0
    for (const [key, value] of sumstats) {
      allBins = filteredData.filter(d => d.Status === key)
      kdeValues = kde(allBins.map(d => d.LifeExpectancy));
      biggest = d3.max(kdeValues.map(d => d[1]));
      if (biggest > maxNum) { maxNum = biggest }
    }

    xNum = d3.scaleLinear()
      .range([0, x.bandwidth()])
      .domain([-maxNum,maxNum])

    // ----------------------------- Plot  ------------------------- //
      svg
        .selectAll("myViolin")
        .data(sumstats)
        .enter()
        .append("g")
          .attr("transform", function([key, value]){ return("translate(" + x(key) +" ,0)") } )
        .append("path")
            .datum(function([key, value]){ return(kde(filteredData.filter(d => d.Status === key).map(d => d.LifeExpectancy)))})
            .style("stroke", "none")
            .style("fill","blue")
            .attr("d", d3.area()
              .x0(function(d){ return(xNum(-d[1]))})
              .x1(function(d){ return(xNum(d[1]))})
              .y(function(d){ return(y(d[0]))})
              .curve(d3.curveCatmullRom)
            )
            // -----------------------------  Tooltip ------------------------- //
            .on("mousemove", function(d) {
              var [key, value] = this.parentNode.__data__;
              const filteredDataElement = filteredData.filter(function(d) {return d.Status === key;});
              //console.log(filteredDataElement);
              tooltip.transition()
                .duration(200)
                .style("opacity", 1);

              // compute index of closest point in the array
              var closestIndex = d3.bisectCenter(filteredDataElement.map(d => y(d.LifeExpectancy)), d3.pointer(event)[1]);
              console.log(closestIndex);

              tooltip.html("<span class='tooltiptext'>" +
                "Year: " + filteredDataElement[closestIndex].Year + "<br>" +
                "Status: " + key + "<br>" +
                "Life expectancy: " + filteredDataElement[closestIndex].LifeExpectancy + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
            })

            .on("mouseout", function () {
              tooltip.transition()
                  .duration(200)
                  .style("opacity", 0);
            });

  }

});

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- ALTRE FUNZIONI ---------------------------------------------------- //

  function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
  }

  function kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }
