//https://gist.github.com/kopelli/fce12e352d96188320ed1376fa57afbe
// https://gist.github.com/malon/a3f7fc1e8fde18a1e1a7e674d01c5cb1

d3.csv("./python/CSV/global_sankey.csv").then(data => {

const units = "Widgets";

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1500 - margin.left - margin.right,
  height = 5000 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// format variables
const formatNumber = d3.format(",.0f"),    // zero decimal places
  format = d => formatNumber(d) + " " + units,
  color = d3.scaleOrdinal(d3.schemeCategory10);

// Set the sankey diagram properties
const sankey = d3.sankey()
  .nodeWidth(36)
  .nodePadding(40)
  .size([width, height]);

const path = sankey.link();



  var selectedCountry = "Argentina"
  const filteredData = data.filter(d => d.Zimbabwe === selectedCountry);

  const graph = {"nodes" : [], "links" : []};

  for (let i = 0; i < filteredData.length; i++) {
    const d = filteredData[i];
    graph.nodes.push({ "name": d.source });
    graph.nodes.push({ "name": d.target });
    graph.links.push({ "source": d.source,
                       "target": d.target,
                       "value": +d.value });
  }
  // return only the distinct / unique nodes
  graph.nodes = Array.from(new Set(graph.nodes.map(d => d.name))).map(name => ({ "name": name }));

  // loop through each link replacing the text with its index from node
  graph.links.forEach(d => {
    d.source = graph.nodes.findIndex(n => n.name === d.source);
    d.target = graph.nodes.findIndex(n => n.name === d.target);
  });

  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  graph.nodes.forEach((d, i) => {
    graph.nodes[i] = { "name": d.name };
  });

  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

  // add in the links
  const link = svg.append("g")
      .selectAll(".link")
      .data(graph.links)
      .join("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", d => Math.max(1, d.width))
      .sort((a, b) => b.width - a.width);

  // add the link titles
  link.append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

  // add in the nodes
  const node = svg.append("g")
      .selectAll(".node")
      .data(graph.nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .subject(d => d)
        .on("start", function() {
          this.parentNode.appendChild(this);
        })
      .on("drag", dragmove));

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
    .attr("x", -6)
    .attr("y", function(d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) { return d.name; })
  .filter(function(d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

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
});
