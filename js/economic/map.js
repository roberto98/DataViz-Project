
d3.csv("./python/CSV/map_economic.csv").then(function (data) {

  const margin = {top: 0, right: 200, bottom: 10, left: 10},
      width = 1300 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3.select("#map")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- SELECT BUTTONS ---------------------------------------------------- //
//const allVariables = ["Adult Mortality", "infant deaths", "Alcohol", "percentage expenditure", "Hepatitis B", "Measles "," BMI ","under-five deaths ","Polio","Total expenditure","Diphtheria "," HIV/AIDS","GDP"," thinness  1-19 years"," thinness 5-9 years","Income composition of resources","Schooling"]
const allVariables = ["ICOR",  "GDP", "Gov Health Expenditure", "Population", "AdultMortality", "Schooling"]

d3.select("#selectdVariableMap")
  .selectAll('myOptions')
  .data(allVariables)
  .enter()
  .append('option')
  .text(function (d) { return d; })
  .attr("value", function (d) { return d; })
d3.select("#selectdVariableMap")
  .property("value", "GDP");

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- PLAY BUTTON ---------------------------------------------------- //
function Play(){
    var playButton = d3.select("#map_yearPlay")
    var slider = d3.select("#map_yearSlider")
    var Map_yearDisplay = d3.select("#map_yearDisplay")

    var playing = false;
    var interval;
    var currentYear = 2000;
    var currentVariable = "GDP"
    var years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015];

    // I set default values
    Map_yearDisplay.text(currentYear);
    slider.property("value", currentYear);
    updateChart(currentYear, currentVariable, data, playing);

    // When the input of the slider changes, i update
    slider.on("input", function() {
      currentYear = this.value;
      Map_yearDisplay.text(currentYear);
      currentVariable = d3.select("#selectdVariableMap").property("value");
      updateChart(currentYear, currentVariable, data, playing);
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
          Map_yearDisplay.text(currentYear);
          currentVariable = d3.select("#selectdVariableMap").property("value");
          updateChart(currentYear, currentVariable, data, playing);
        }, 500);
      } else {
        playing = false;
        playButton.text("Play");
        updateChart(currentYear, currentVariable, data, playing);
        clearInterval(interval);
      }
    });
}

Play();

// -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- UPDATE CHART---------------------------------------------------- //
function updateChart(year, variable, data, playing) {

  selectedYear = String(year);
  selectedVariable = String(variable);
  // ----------------------------------------- Projection -------------------------------- //
  const projection = d3.geoNaturalEarth1()
      .scale(250)
      .center([0, 20])
      .translate([width / 2, height / 2]);

	var path = d3.geoPath().projection(projection);

  // ----------------------------------------- Colors ------------------------------------//
  const format = d3.format(".2f");

  var color = d3.scaleQuantize()
      .range(d3.schemeGreens[5]);

  var data = data.filter(function(d){return d.Year === selectedYear})

  var allExpectancies = []
  var allValues = []
  d3.json("./python/data/world.json").then(function(json){
    for (var i = 0; i < data.length; i++) {
      var dataCountry = data[i].Country;
      var dataValue = format(parseFloat(data[i][selectedVariable]));
      var dataLifeExp = parseFloat(data[i]["LifeExpectancy"]);
      for (var j = 0; j < json.features.length; j++) {
        var jsonCountry = json.features[j].properties.name;
        if (dataCountry == jsonCountry) {
          json.features[j].properties.value = dataValue;
          json.features[j].properties.lifeExp = dataLifeExp;
          allExpectancies.push(dataLifeExp);
          allValues.push(dataValue);
          break;
        }
      }
    }

    //color.domain([d3.min(allValues), d3.max(allValues)]);
    color.domain([0, d3.max(allValues) * 0.85]);

    // ----------------------------------------- Plot the map --------------------------- //
    const no_data_color = "#888888";

    // select all paths and bind data
    var map_path = svg.selectAll("path")
      .data(json.features.filter(e => e.id !== "ATA"));

    // add new paths and merge with existing paths
    map_path.enter()
      .append("path")
      .attr("d", path)
      .style("fill", function(d) {
        var value = d.properties.value;
        if (value) {
          return color(value);
        } else {
          return no_data_color;
        }
      })
      .style("stroke", "gray")
      .style("stroke-width", 0.3)
      .style("opacity", 0.8)
      .attr("class", function (d) {
        var value = d.properties.value;
        if (!isNaN(value)){ return "Country"; }
        else { return "Country_" + "no_data"; }
      })
      .merge(map_path)
      .transition()
      .duration(500)
      .ease(d3.easeQuadOut)
      .style("fill", function(d){
        var value = d.properties.value;
        if (value)
          return color(value);
        else
          return no_data_color;
      })
      .attr("d", path);

    // remove paths that are no longer needed
    map_path.exit().remove();

    // ------------------------------------- Plot the labels ----------------------------- //
    // select all text labels and bind data
    var lifeLabels = svg.selectAll("text")
      .data(json.features.filter(e => e.id !== "ATA"));

    // add new text labels and merge with existing labels
    lifeLabels.enter()
      .append("text")
      .attr("font-family", "Arial")
      .attr("fill", "black")
      .attr("stroke", "white")
      .attr("stroke-width", function(d){
          var font_size = 0.3 * Math.sqrt(path.area(d));
          return font_size * 0.01;
      })
      .merge(lifeLabels)
      .transition()
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr("font-size", function(d){
          return 0.3 * Math.sqrt(path.area(d));
      })
      .attr("x", function(d){
        if(d.properties.name == "France")
          return projection([2.96, 47.08])[0] - (0.3 * Math.sqrt(path.area(d)));
        return path.centroid(d)[0] - (0.3 * Math.sqrt(path.area(d)));
      })
      .attr("y", function(d){
        if(d.properties.name == "France")
          return projection([2.96, 47.08])[1] + (0.3 * Math.sqrt(path.area(d))/2);
        return path.centroid(d)[1] + (0.3 * Math.sqrt(path.area(d))/2);
      })
      .text(function(d){
          if (d.properties.lifeExp){
              return format(d.properties.lifeExp);
          }
      });

    // remove labels that are no longer needed
    lifeLabels.exit().remove();

    //---------------------------------------------------- Tooltip ----------------------------------- //

    var unit_measure = "";
    if (selectedVariable === "AdultMortality"){ unit_measure = "per 1000 population";}
    if (selectedVariable === "ICOR"){ unit_measure = "index";}
    if (selectedVariable === "GDP"){ unit_measure = "USD";}
    if (selectedVariable === "Gov Health Expenditure"){ unit_measure = "%";}
    if (selectedVariable === "Schooling"){ unit_measure = "years";}

    // create a tooltip
    const tooltip = d3.select("#map")
        .append("div")
        .attr("class", "tooltip")

    svg.selectAll(".Country")
        .on("mousemove", function (event, d) {
            if(!playing){
              svg.selectAll(".Country")
                  .style("opacity", 0.35);

              d3.select(this)
                  .style("opacity", 1)
                  .style("stroke", "black")
                  .style("stroke-width", 1);

              tooltip.transition()
                  .duration(200)
                  .style("opacity", 1);

              tooltip.html("<span class='tooltiptext'>"
                + "Country: " + d.properties.name + "<br>"
                + "Life Expectancy: " + d.properties.lifeExp + " years <br>"
                +  `${selectedVariable}: ` + d.properties.value + " " + unit_measure + "<br>"
                + "</span>")
                  .style("left", (event.pageX) + "px")
                  .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseleave", function (event, d) {
            if(!playing){
              svg.selectAll(".Country")
                  .style("opacity", 0.8);

              d3.select(this)
                  .style("stroke", "gray")
                  .style("stroke-width", 0.3);

              tooltip.transition()
                .duration(200)
                .style("opacity", 0);
            }
        });

      // --------------------------------------------- Legend -------------------------------- //
      // Add a legend, requires Susie Lu's d3-legend script

      var legend = d3.legendColor()
          .scale(color)
          .ascending(true)
          .shapeHeight(35)
          .shapeWidth(15)
          .title(selectedVariable + " (" + unit_measure + ")" )
          .labels(function ({ // custom function that changes how each label is printed, allows us to have printing
              i,              // like for thresholded scales, which are not implemented for quantized ones
              genLength,
              generatedLabels,
              labelDelimiter
          }) {
              if (i === 0) {
                  const values = generatedLabels[i].split(" to ");
                  return `Less than ${values[1]}`;
              } else if (i === genLength - 1) {
                  const values = generatedLabels[i].split(" to ");
                  return `${values[0]} or more`;
              }
              return generatedLabels[i];
          });

          // adding the legend, if already present we need to remove the previous one first
          var l = svg.select("#legend")
          if (!l.empty()) {
              l.remove()
          }

          svg.append("g")
              .attr("transform", `translate(${width}, 110)`)
              .attr("id", "legend")
              .call(legend);

      }); // chiude json
}


// ---------------------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- SELECT BUTTONS LISTENERS ---------------------------------------------------- //
d3.select("#selectdVariableMap").on("change", function(event,d) {
  selectedYear = d3.select("#map_yearSlider").property("value");
  selectedVariable = d3.select("#selectdVariableMap").property("value");

  var playing = false;
  play_button = d3.select("#map_yearPlay").text();
  if(play_button === "Pause") {playing = true;}
  
  updateChart(selectedYear, selectedVariable, data, playing);
})



});
