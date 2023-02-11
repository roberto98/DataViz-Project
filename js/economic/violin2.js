var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#violin")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("./python/CSV/violin.csv").then(function (data) {
  var selectedYear = "2015"
  const filteredData = data.filter(function(d){return d.Year === selectedYear});
  var maxVal = d3.max(filteredData, d => d.LifeExpectancy);
  var minVal = d3.min(filteredData, d => d.LifeExpectancy);
  console.log(maxVal);
  var y = d3.scaleLinear()
    .domain([minVal, maxVal])
    .range([height, 0])
  svg.append("g").call( d3.axisLeft(y) )

  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(["Developing", "Developed"])
    .padding(0.05)
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  var kde = kernelDensityEstimator(kernelEpanechnikov(.2), y.ticks(50))

  var sumstats = d3.rollup(filteredData, v => d3.mean(v, d => d.LifeExpectancy), d => d.Status);

  var maxNum = 0
  for (const [key, value] of sumstats) {
    allBins = filteredData.filter(d => d.Status === key)
    kdeValues = kde(allBins.map(d => d.LifeExpectancy));
    biggest = d3.max(kdeValues.map(d => d[1]));
    if (biggest > maxNum) { maxNum = biggest }
  }

  var xNum = d3.scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum,maxNum])

  svg
    .selectAll("myViolin")
    .data(sumstats)
    .enter()
    .append("g")
      .attr("transform", function([key, value]){ return("translate(" + x(key) +" ,0)") } )
    .append("path")
        .datum(function([key, value]){ return(kde(filteredData.filter(d => d.Status === key).map(d => d.LifeExpectancy)))})
        .style("stroke", "none")
        .style("fill","#blue")
        .attr("d", d3.area()
          .x0(function(d){ return(xNum(-d[1]))})
          .x1(function(d){ return(xNum(d[1]))})
          .y(function(d){ return(y(d[0]))})
          .curve(d3.curveCatmullRom)
        )

        
});

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
