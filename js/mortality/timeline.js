d3.csv("./python/CSV/time_line.csv").then(function (data) {
  const margin = {top: 120, right: 15, bottom: 75, left: 50},
      width = 800 - margin.left - margin.right,
      height = 550 - margin.top - margin.bottom;

  const svg = d3.select("#time_line")
      .append("svg")
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);


  const tooltip = d3.select("#time_line")
      .append("div")
      .attr("class", "tooltip")
  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- SELECT BUTTONS ---------------------------------------------------- //
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

  // ------------------------------------------------ DEFAULT STATE -------------------------------- //
  selectedVariable = d3.select("#VariableButton").property("value");
  start_select2_handler();
  updateChart(selectedVariable);

  // ------------------------------------------------ CHANGING STATE -------------------------------- //
  d3.select("#CountryButton").on("change", function(event,d) {
    selectedVariable = d3.select("#VariableButton").property("value");
    start_select2_handler();
    updateChart(selectedVariable);
  })

  d3.select("#VariableButton").on("change", function(event,d) {
    selectedVariable = d3.select("#VariableButton").property("value");
    start_select2_handler();
    updateChart(selectedVariable);
  })

  // -------------------------------------------------------------------------------------------------------------------------------- //
  // --------------------------------------------------------------- UPDATE CHARTS ---------------------------------------------------- //
  function updateChart(selectedVariable) {
     d3.select("#time_line").selectAll("svg > g > *").remove();

    // --------------------------- X axis ------------------------ //
    x = d3.scaleTime()
      .domain(d3.extent(data, function(d) {return new Date(d.Year, 0, 1)}))
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)));
    svg.append("text").attr("text-anchor", "end").attr("x", width - margin.right).attr("y", height + 50).text("Time period").style("font-size", 10)


    // ----------------------------- Y axis ------------------------- //
      y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) {return +d[selectedVariable]})).nice()
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));

      var unit_measure = "(years)";
      if (selectedVariable === "AdultMortality"){ unit_measure = "(per 1000 population)"}

      svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", -50)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text(selectedVariable + " " + unit_measure)
        .style("font-size", 10);



    // ------------------------------ Plot ---------------------- //
      const sumstat = d3.group(data, d => d.Country);

      // Add the plot
      var path = svg.selectAll("path:not(.domain)")
          .data(sumstat)
          .join(
              // if we are adding a new path then animate it being "drawn"
              enter => enter.append("path")
                  .attr("fill", "none")
                  .attr("stroke", "gray")
                  .attr("stroke-width", 4)
                  .attr("stroke-dashoffset", width * 10)
                  .attr("stroke-dasharray", width * 10)
                  .style("opacity", 0.25)
                  .attr("d", function (d) {
                      return d3.line()
                          .x(d => x(new Date(d.Year, 0, 1)))
                          .y(d => y(+d[selectedVariable]))
                          (d[1])
                  })
                  .attr("class", function (d) {
                      return d[0].split(/\s/).join(""); // remove whitespace from class names
                  })
                  .call(enter => enter.transition()
                      .transition()
                      .ease(d3.easeLinear)
                      .duration(100 * 7)
                      .attr("stroke-dashoffset", 0)
                  ),
          );
        /*
          var dot = svg
          .selectAll('circle')
          .data(sumstat)
          .enter()
          .append('circle')
            .attr("cx", function(d) { return x(d => x(new Date(d.Year, 0, 1))) })
            .attr("cy", function(d) { return d => y(+d[selectedVariable])})
            .attr("r", 7)
            .style("fill", "#69b3a2")
        */
    // ------------------------------ Tooltip ---------------------- //


    path
        .on("mousemove", function (event, d) {
            var selected = $('#CountryButton').select2('data');
            var country_data = d[1];

            var dateString = x.invert(d3.pointer(event)[0])
            var date = new Date(dateString);
            var year = date.getFullYear();

            var arr_years = country_data.map(d => d.Year);
            var i = arr_years.indexOf(String(year));

            // if we don't have a selection then highlight the current path
            if (selected.length == 0) {
                // adding extra opacity to current selection
                var curr_line = d3.selectAll(`.${d[0].split(/\s/).join("")}:not(.domain)`)

                path.transition()
                    .ease(d3.easeQuadOut)
                    .duration(500)
                    .style("opacity", 0.1)

                curr_line.transition()
                    .ease(d3.easeQuadOut)
                    .duration(500)
                    .style("opacity", 1)
                    .attr("stroke-width", 4)

                curr_line.raise()    // and bring the current selection to the front
            }

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            var tooltip_name = "";
            if (selectedVariable === "AdultMortality"){ tooltip_name = "deaths"}
            if (selectedVariable === "LifeExpectancy"){ tooltip_name = "years"}

            tooltip.html("<span class='tooltiptext'>" + "Year: " + country_data[i].Year + "<br>"
                                                      + "Country: " +  country_data[i].Country + "<br>"
                                                      + `${selectedVariable}: ` +  country_data[i][selectedVariable] + " " + tooltip_name + "</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function () {
            // If we have a selection then just remove the tooltip
            // if we didn't then bring back everything to default styles
            var selected = $('#CountryButton').select2('data');
            if (selected.length == 0) {
                d3.selectAll("path:not(.domain)")
                    .transition()
                    .ease(d3.easeQuadOut)
                    .duration(500)
                    .style("opacity", 0.25)
                    .attr("stroke-width", 2)
            }

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });
  }

});


const colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"]; //,'#023047'];
//const colors = ["#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#17becf"];

var old_selection = [];
var available_colors = [...colors];
var country_color_dict = {}

function start_select2_handler() {

    $(document).ready(function () {
        $(".select2-multiple").select2({
            maximumSelectionLength: 5,
        });
    })

    $("#CountryButton").select2().on("change", function (event) {
        var selected = $('#CountryButton').select2('data');

        if (selected.length != 0) {
            // we have a selection, make all path less visible to highlight it
            let selected_classes_str = selected.map(e => e.id)
                .reduce((prev, e) => `.${e},` + prev, '.domain, .Country, .bar, .link') // the axes should never be touched, nor other paths from maps

            // -------------------- Controllo che Path e Circles non facciano parte della selezione --------------- //
            d3.selectAll(`path:not(${selected_classes_str})`)
                .attr("pointer-events", "none")
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .style("opacity", 0.1)

            // if we have a selection also add a legend
            for (const v of selected) {
                if (!(v.id in country_color_dict))
                    country_color_dict[v.id] = available_colors.pop();
            }

            var country_scale = d3.scaleOrdinal()
                .domain(selected.map(e => e.text))
                .range(selected.map(e => country_color_dict[e.id]));

            var linechart_legend = d3.legendColor()
                .scale(country_scale)
                .orient("vertical")
                .title("Selected Countries")

            var linechart_svg = d3.select("#time_line").select("svg");

            var l = linechart_svg.select("#legend")
            if (!l.empty()) {
                l.remove()
            }

            linechart_svg.append("g")
                .attr("transform", `translate(100, 30)`) // change position to the legend
                .attr("id", "legend")
                .call(linechart_legend);
        }

        if (selected.length == 0) {
            // no selection, then make everything back to default
            d3.selectAll("path:not(.domain, .Country, .bar, .link)")
                .attr("pointer-events", "all")
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .style("opacity", 0.25)

            var l = d3.select("#time_line").select("#legend")
            if (!l.empty()) {
                l.remove()
            }
        }

        // remove old ones
        for (const v of old_selection) {
            if (!selected.includes(v)) {
                var old_path = d3.selectAll(`.${v.id}`);
                // make the current color available to other paths
                available_colors.push(country_color_dict[v.id]);
                delete country_color_dict[v.id];

                old_path.transition()
                    .ease(d3.easeQuadOut)
                    .duration(500)
                    .attr("stroke", "gray")
                    .style("opacity", selected.length != 0 ? 0.1 : 0.25);
            }
        }
        // add selection
        for (const [i, v] of selected.entries()) {

            //if (old_selection.includes(v))
            //    continue;   // no need to transition if we were already plotted
            var curr_path = d3.selectAll(`.${v.id}`)

            curr_path
                .attr("pointer-events", "all")
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .attr("stroke", country_color_dict[v.id])
                .style("opacity", 1);
            curr_path.raise();

        }
        old_selection = selected;
    });

    // default selection
    // get animated after lines are drawn in
    setTimeout(function () {
        $("#CountryButton").val(["Italy", "Yemen", "Zimbabwe"]);
        $("#CountryButton").trigger("change");
    }, 1000);
}
