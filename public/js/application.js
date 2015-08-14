
$(document).ready(function() {
  $(".loader").hide();
  $(".arrow").velocity({
  translateY: "6px"
}, {
  loop: true
}).velocity("reverse");


  $("form").on("submit", function(e){
    e.preventDefault();
    $(".arrow").hide();
    clearSearchResults();
    $(".loader").show();

    var request = $.ajax ({
      method: "POST",
      url: "/data",
      data: $(this).serialize()
    });
    request.done(function(response){
      console.log(response);
      $(".loader").hide();
      $("h4").show();
      $("#hide").show();
      $(".chart").show();
      $("form").trigger('reset');
      drawFrequencyBarChart(response);
      drawAvgScoreBarChart(response);
      drawHoursPostedPlot(response);
      // Iterate through the json object that has been processed in ruby already, for each AR comment object
      // response.each()
    });

  })
  // This is called after the document has loaded in its entirety
  // This guarantees that any elements we bind to will exist on the page
  // when we try to bind to them

  // See: http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
});

function clearSearchResults() {
  $('svg.chart').children().remove();
  $('.chart').hide();
}

function drawHoursPostedPlot(jsonWords) {

  var wordList = jsonWords.map(function(wordObj) {
    return wordObj.word;
  });

  var timeData = jsonWords.map(function(wordObj) {
    return wordObj.hours_posted_data;
  });

  var timeDataFlattened = timeData.reduce(function(a, b) {
    return a.concat(b);
  });

  console.log(timeDataFlattened);

  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 700 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var xScale = d3.scale.ordinal()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
              13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
      .rangePoints([10, width]);


  var yScale = d3.scale.linear()
      .range([(height - 5), 0]);

  var colorScale = d3.scale.category20()
      .domain(wordList);

  var chart = d3.select(".hours-posted-chart")
      .attr("width", width)
      .attr("height", height);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

  var chart = d3.select(".hours-posted-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var legend = chart.append("g")
              .attr("class", "legend")
              .attr("transform", "translate(" + (width - 40) + ",0)");

  for (var i=0; i < wordList.length; i++) {
    legend.append("text")
        .text(wordList[i])
        .attr("fill", colorScale(wordList[i]))
        .attr("y", (i+1) * 25);
  }

  yScale.domain([0, d3.max(timeDataFlattened, function(d) { return d[2]; })]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var plot = chart.selectAll(".plot-point")
            .data(timeDataFlattened)
            .enter()
            .append("circle")
            .attr("class", "plot-point")
            .attr("cx", function(d) { return xScale(d[1]); })
            .attr("cy", function(d) { return yScale(d[2]); })
            .attr("r", "5")
            .attr("fill", function(d) { return colorScale(d[0]); });
}

function drawAvgScoreBarChart(jsonWords) {
  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 700 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var chart = d3.select(".avg-score-chart")
      .attr("width", width)
      .attr("height", height);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var chart = d3.select(".avg-score-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(jsonWords.map(function(d) { return d.word; }));
  y.domain([0, d3.max(jsonWords, function(d) { return d.avgpoints; })]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var barWidth = width / jsonWords.length;

  var bar = chart.selectAll(".bar-group")
            .data(jsonWords)
            .enter()
            .append("g")
            .attr("class", "bar-group")

  bar.append("rect")
     .attr("class", "bar")
     .attr("x", function(d) { return x(d.word); })
     .attr("y", function(d) { return y(d.avgpoints); })
     .attr("height", function(d) { return height - y(d.avgpoints); })
     .attr("width", x.rangeBand())

  bar.append("text")
     .attr("x", function(d) { return x(d.word) + (barWidth / 2) - (margin.right / 2); })
     .attr("y", function(d) { return y(d.avgpoints) + 5; })
     .attr("dy", ".75em")
     .text(function(d) { return d.avgpoints; });
}


function drawFrequencyBarChart(jsonWords) {
  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 700 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var chart = d3.select(".frequency-chart")
      .attr("width", width)
      .attr("height", height);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var chart = d3.select(".frequency-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(jsonWords.map(function(d) { return d.word; }));
  y.domain([0, d3.max(jsonWords, function(d) { return d.frequency; })]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var barWidth = width / jsonWords.length;

  var bar = chart.selectAll(".bar-group")
            .data(jsonWords)
            .enter()
            .append("g")
            .attr("class", "bar-group")

  bar.append("rect")
     .attr("class", "bar2")
     .attr("x", function(d) { return x(d.word); })
     .attr("y", function(d) { return y(d.frequency); })
     .attr("height", function(d) { return height - y(d.frequency); })
     .attr("width", x.rangeBand())

  bar.append("text")
     .attr("x", function(d) { return x(d.word) + (barWidth / 2) - (margin.right / 2); })
     .attr("y", function(d) { return y(d.frequency) + 5; })
     .attr("dy", ".75em")
     .text(function(d) { return d.frequency; });
}
