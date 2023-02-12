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
    svg.append("text").attr("text-anchor", "end").attr("x", width - margin.right).attr("y", height + 50).text("Years").style("font-size", 10)


    // ----------------------------- Y axis ------------------------- //
      y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) {return +d[selectedVariable]}))
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));
      svg.append("text").attr("text-anchor", "middle").attr("x", 0).attr("y", -20).text("Life Expectancy").style("font-size", 10)


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

    // ------------------------------ Tooltip ---------------------- //
    
      // Add the circles
      var circles = svg.selectAll("circles:not(.domain)")
        .data(sumstat)
        .join(
          enter => enter.selectAll("circle")
            .data(d => d[1])
            .join(
              enter => enter.append("circle")
                .attr("cx", d => x(new Date(d.Year, 0, 1)))
                .attr("cy", d => y(+d[selectedVariable]))
                .attr("r", 4)
                .style("fill", "grey")
                .style("opacity", 0.25)
                .call(enter => enter.transition()
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(100 * 7)
                    .attr("stroke-dashoffset", 0)
                ),
            ),
        );


        // Add the tooltip
        circles.on("mouseover", function(event, d) {
          var selected = $('#CountryButton').select2('data');
          var country_data = d[1];

          // if we don't have a selection then highlight the current path
          if (selected.length == 0) {
              // adding extra opacity to current selection
              console.log(d[0]);

              var curr_line = d3.selectAll(`.${d[0].split(/\s/).join("")}:not(.domain)`)

              circles.transition()
                  .ease(d3.easeQuadOut)
                  .duration(500)
                  .style("opacity", 1)

              curr_line.transition()
                  .ease(d3.easeQuadOut)
                  .duration(500)
                  .style("opacity", 1)
                  .attr("stroke-width", 4)

              curr_line.raise()    // and bring the current selection to the front
              circles.raise()
          }

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);

            tooltip.html("<span class='tooltiptext'>" + "Year: " + d.Year + "<br>"
                                                      + "Country: " + d.Country + "<br>"
                                                      + `${selectedVariable}: ` + d[selectedVariable] +"</span>")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

  }

});



const colors = ["#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#17becf"];

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

            d3.selectAll(`circles:not(${selected_classes_str})`)
                .attr("pointer-events", "none")
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .style("opacity", 0.1);
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

            d3.selectAll("circles:not(.domain, .Country, .bar, .link)")
                .attr("pointer-events", "all")
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .style("opacity", 0.25);

            var l = d3.select("#time_line").select("#legend")
            if (!l.empty()) {
                l.remove()
            }
        }

        // remove old ones
        for (const v of old_selection) {
            if (!selected.includes(v)) {
                var old_path = d3.selectAll(`.${v.id}`);
                var old_circle = d3.selectAll(`.circle.${v.id}`);
                // make the current color available to other paths
                available_colors.push(country_color_dict[v.id]);
                delete country_color_dict[v.id];

                old_path.transition()
                    .ease(d3.easeQuadOut)
                    .duration(500)
                    .attr("stroke", "gray")
                    .style("opacity", selected.length != 0 ? 0.1 : 0.25);

                old_circle.transition()
                    .ease(d3.easeQuadOut)
                    .duration(500)
                    .style("fill", "gray")
                    .style("opacity", selected.length != 0 ? 0.1 : 0.25);
            }
        }
        // add selection
        for (const [i, v] of selected.entries()) {

            //if (old_selection.includes(v))
            //    continue;   // no need to transition if we were already plotted
            var curr_path = d3.selectAll(`.${v.id}`)
            var curr_circle = d3.selectAll(`.circle.${v.id}`)

            curr_path
                .attr("pointer-events", "all")
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .attr("stroke", country_color_dict[v.id])
                .style("opacity", 1);
            curr_path.raise();

            curr_circle
                .attr("pointer-events", "all")
                .transition()
                .ease(d3.easeQuadOut)
                .duration(500)
                .style("fill", country_color_dict[v.id])
                .style("opacity", 1);
            curr_circle.raise();
        }
        old_selection = selected;
    });

    // default selection
    // get animated after lines are drawn in
    setTimeout(function () {
        $("#CountryButton").val(["Italy", "Zimbabwe", "Canada"]);
        $("#CountryButton").trigger("change");
    }, 1000);
}
