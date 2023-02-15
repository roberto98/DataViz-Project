d3.csv("./python/CSV/stacked.csv").then(function (data) {
    const margin = {top: 60, right: 15, bottom: 75, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#stacked")
      .append("svg")
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = new Set(data.map(d => d.Year));

    // Buttom to select Year
    d3.select("#stackedButtom")
        .selectAll('myOptions')
        .data(years)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
    d3.select("#stackedButtom")
        .property("value", 2019);


    function onchange() {
        var selectedYear = d3.select(this).property("value");
    
        // Filter the data based on the selected year
        var filteredData = data.filter(function(d) {
            return d.Year == selectedYear;
    })};

    var filteredData = data.filter(function (d) {
        return d.Year == d3.select("#stackedButtom").property("value") ;
    })

    
    // Get an array of the column names
    var columnNames = Object.keys(data[0]);
    

    // Select the columns from the third column to the end
    var rangeColumns = columnNames.slice(2);

    //console.log(rangeColumns)

    // Compute the sum of the selected columns for each row
    filteredData.forEach(function(d) {
        d.total = d3.sum(rangeColumns, function(key) { return +d[key]; });
    });

    // Sort the data by descending order of total
    filteredData.sort(function(a, b) {
        return b.total - a.total;
    });

    // Select the first 5 rows
    var top5 = filteredData.slice(0, 5);
    //console.log(top5);
    var max = d3.max(top5, function(d) { return d.total; });

    var y_domain = top5.map(d => d.Country)

    console.log(top5);

    var newTable = top5.map(function(d) {
        return { "0-14":  (+d["<1 year"]) +     (+d["1-4 years"]) +   (+d["5-9 years"]) +   (+d["10-14 years"]),
                 "15-34": (+d["15-19 years"]) + (+d["20-24 years"]) + (+d["25-30 years"]) + (+d["30-34 years"]),
                 "35-60": (+d["35-39 years"]) + (+d["40-44 years"]) + (+d["45-49 years"]) + (+d["50-54 years"]) + (+d["55-59 years"]),
                 "61-84": (+d["60-64 years"]) + (+d["65-69 years"]) + (+d["70-74 years"]) + (+d["75-79 years"]) + (+d["80-84 years"]),
                 "85+":   (+d["85+ years"])
                };
    });
    console.log(newTable);

     // scales
    const x = d3.scaleLinear()
       .domain([0, max]).nice()
       .range([0, width]);
    
    svg.append('g')
       .attr('transform', `translate(0,${height})`)
       .call(d3.axisBottom(x))

    const y = d3.scaleBand()
       .domain(y_domain)
       .range([0, height])
       .padding(0.1);

    svg.append("g")
       .call(d3.axisLeft(y))

    const color = d3.scaleOrdinal()
    .domain(rangeColumns)
    .range(['#003366', '#339966', '#00ff00','#00ccff','#ff0066','#ffff00','#ff3300','#999966','#cc00ff','#0000ff','#00ffcc','#cc6600',
            '#cc00cc','#99ff66','#99cc00','#336600','#ff00ff','#666633','#ccff33']);
    var stackedData = d3.stack()
        .keys(rangeColumns)
        (newTable)
console.log(stackedData);
    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => "myRect " + d.key.replaceAll(' ', '_')) // Add a class to each subgroup: their name
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .join("rect")
        //.attr('x', d => x(d[0]))
        .attr('x', function(d) { return x(d[0])})
        .attr('y', d => y(d.data.Country))
        .attr('height', y.bandwidth())
        .attr('width', d => (x(d[1]) - x(d[0])))
        .attr("stroke", "grey")
    
    






    


    
})