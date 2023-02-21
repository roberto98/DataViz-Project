//https://gist.github.com/kopelli/fce12e352d96188320ed1376fa57afbe
// https://gist.github.com/malon/a3f7fc1e8fde18a1e1a7e674d01c5cb1

d3.csv("./python/CSV/global_sankey.csv").then(data => {

  var margin = {top: 10, right: 280, bottom: 10, left: 10},
      width = 1400 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3.select("#sankey")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  const countries = new Set(data.map(d => d.Country));

  d3.select("#sankey_select")
      .selectAll('myOptions')
      .data(countries)
      .enter()
      .append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })
  d3.select("#sankey_select")
      .property("value", "Italy");

  var years = [2000, 2010, 2015, 2019];

  function Play(){
      var playButton = d3.select("#sankey_yearPlay")
      var slider = d3.select("#sankey_yearSlider")
      var sankey_yearDisplay = d3.select("#sankey_yearDisplay")

      var playing = false;
      var interval;
      var currentYear = 2000;
      var currentCountry = "Italy"
      var i = 0;

      // I set default values
      sankey_yearDisplay.text(currentYear);
      slider.property("value", i);
      updateChart(currentYear, currentCountry, playing, data);

      // When the input of the slider changes, i update
      slider.on("input", function() {
      i = this.value;
      currentYear = years[i];
      sankey_yearDisplay.text(currentYear);
      currentCountry = d3.select("#sankey_select").property("value");
      updateChart(currentYear, currentCountry, playing, data);
    });

    // When Play start the animation
    playButton.on("click", function() {
      if (!playing) {
        playing = true;
        playButton.text("Pause");
        interval = setInterval(function() {
          i = +slider.property("value");
          currentYear = years[i];
          if (currentYear >= 2019) {
            i = 0
            currentYear = 2000;
            slider.property("value", i);
          } else {
            i+=1;
            currentYear = years[i];
            slider.property("value", i);
          }
          sankey_yearDisplay.text(currentYear);
          currentCountry = d3.select("#sankey_select").property("value");
          updateChart(currentYear, currentCountry, playing, data);
        }, 1000);
      } else {
        playing = false;
        playButton.text("Play");
        updateChart(currentYear, currentCountry, playing, data);
        clearInterval(interval);
      }
    });

  }

  Play();

  // -------------------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------------------- UPDATE CHART---------------------------------------------------- //


  function updateChart(year, country, playing, data) {
      d3.select("#sankey").selectAll("svg > g > *").remove();
      selectedYear = String(year);
      selectedCountry = country;

      var data = data.filter(function(d){return d.Country === selectedCountry && d.Year === selectedYear})

      var units = "Widgets";

      // format variables
      var formatNumber = d3.format(",.0f"),    // zero decimal places
          format = function(d) { return formatNumber(d) + " " + units; },
          color = d3.scaleOrdinal(d3.schemeCategory10);

      // Set the sankey diagram properties
      var sankey = d3.sankey()
          .nodeWidth(36)
          .nodePadding(20)
          .size([width, height]);

      var path = sankey.link();
      graph = {"nodes" : [], "links" : []};

      for (var i = 0; i < data.length; i++) {
        d = data[i];
        graph.nodes.push({ "name": d.source });
        graph.nodes.push({ "name": d.target });
        graph.links.push({ "source": d.source,
                           "target": d.target,
                           "value": +d.value,
                            "real_deaths": +d['real deaths']});

      }

      // return only the distinct / unique nodes
      graph.nodes = Array.from(d3.group(graph.nodes, d => d.name).keys());

      // loop through each link replacing the text with its index from node
      graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
      });

      // now loop through each nodes to make nodes an array of objects
      // rather than an array of strings
      graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d };
      });


      function get_value_by_graph(source, target){
        for(var i = 0; i < graph.links.length; i++){
          var diseases_data = graph.links[i];

          if (source === diseases_data.source){

            if(target == diseases_data.target){

              return diseases_data.real_deaths;
            }
          }
        }
        return 0;
      }

      //Tooltip left links
      var tooltip = d3.select("#sankey")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");


      sankey
          .nodes(graph.nodes)
          .links(graph.links)
          .layout(32);

      // add in the links
      var link = svg.append("g").selectAll(".link")
          .data(graph.links)
          .enter().append("path")
          .attr("class", "link")
          .attr("d", path)
          .style("stroke-width", function(d) { return Math.max(1, d.dy); })
          .sort(function(a, b) { return b.dy - a.dy; })
          .on("mousemove", function (event, d) {
            if(!playing){
              tooltip
              .html(get_value_by_graph(d.source, d.target) + " deaths")
              .style("opacity", 1)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
            }
          })
          .on("mouseleave", function (event, d) {
            if(!playing){
              tooltip
                .style("opacity", 0);
            }
          });

      // add in the nodes
      var node = svg.append("g").selectAll(".node")
          .data(graph.nodes)
        .enter().append("g")
          .attr("class", "node")
          .attr("transform", function(d) {
    		  return "translate(" + d.x + "," + d.y + ")"; })
          .call(d3.drag()
            .subject(function(d) {
              return d;
            })
            .on("start", function() {
              this.parentNode.appendChild(this);
            }))
          //  .on("drag", dragmove));

      // add the rectangles for the nodes
      node.append("rect")
          .attr("height", function(d) { return d.dy; })
          .attr("width", sankey.nodeWidth())
          .style("fill", function(d) {
    		  return d.color = color(d.name.replace(/ .*/, "")); })
          .style("stroke", function(d) {
    		  return d3.rgb(d.color).darker(2); })
          .append("title")
          .text(function(d) {
    		  return d.name + "\n" + format(d.value); });

      // add in the title for the nodes
      node.append("text")
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) { return d.name; })
          //.filter(function(d) { return d.x < width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");

  }

  // the function for moving the nodes
  function dragmove(d) {
    d3.select(this)
      .attr("transform",
            "translate("
               + d.x + ","
               + (d.y = Math.max(
                  0, Math.min(height - d.dy, d3.event.y))
                 ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }


  d3.select("#sankey_select").on("change", function(event,d) {
      indexYear = d3.select("#sankey_yearSlider").property("value");
      selectedYear = years[indexYear];
      selectedCountry= d3.select("#sankey_select").property("value");

      var playing = false;
      play_button = d3.select("#sankey_yearPlay").text();
      if(play_button === "Pause") {playing = true;}

      updateChart(selectedYear, selectedCountry, playing, data);
    })

});
