// set the dimensions and margins of the graph
const margin = {top: 10, right: 70, bottom: 30, left: 40},
    width = 750 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#time_line")
    .append("svg")
    .attr('width', '100%')
    .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


//Read the data
d3.csv("./python/CSV/time_line.csv").then(function (data) {
    //console.log(data);


    
    var filteredData = data.filter(function(d){
        return d.Country == "Afghanistan";
    });
    
    var mappedData = filteredData.map(function(d){
        var cols = ["AdultMortality", "Deaths<5", "InfantDeaths"];
        cols.forEach(function(column){
            delete d[column];
        });
        return d;
    });

    
});

