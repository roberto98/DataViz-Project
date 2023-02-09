d3.select("#date_slider").on("input", function (event) {
    const year_start = 2000;
    var slider = document.getElementById('date_slider');
    var offset = +slider.value;
    var hover_date;

    const year = year_start + offset;
    hover_date = `${year}`;

    const parser = d3.timeParse("%Y");
    const formatter = d3.timeFormat("%Y");

    d3.select("#date_slider_txt").text(formatter(parser(hover_date)));
});
