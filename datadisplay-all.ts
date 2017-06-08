var currentData;
var isZscore = false;

// 这是一个废弃的文件，作test用。请勿将这个文件作为大作业的文件之一
var clickFunction = function(error, data) {
    currentData = data;
    var result: {age:number}[] = <any>data;
    var m = d3.max(result, function (item) { return item.age });
    var ages = result.map(function (item) {
        if(isZscore)
            return item.age/m;
        else
            return item.age;
    });


    var formatCount = d3.format(",.0f");

    //在 body 里添加一个 SVG 画布
    var svg = d3.select("svg");
    //画布周边的空白
    var margin = {top: 10, right: 30, bottom: 30, left: 30};
    //画布大小
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x轴的比例尺
    var x = d3.scaleLinear()
        .rangeRound([0, width]);
    //y轴的比例尺
    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    if(isZscore) {
        x.domain([0,1]);
        bins.thresholds(x.ticks(m));
    }
    else {
        x.domain([0,m]);
        bins.thresholds(x.ticks(10));
    }

    var bar = g.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", function(d) { return height - y(d.length); })
        .attr("fill","steelblue")
        .on("mouseover",function(d,i){
            d3.select(this)
                .attr("fill","yellow");
        })
        .on("mouseout",function(d,i){
            d3.select(this)
                .transition()
                .duration(500)
                .attr("fill","steelblue");
        })
        .on("click", function(d){
            d3.json("index.php?age="+d.x0,clickFunction);
            console.log(d);
        })
    ;

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.length); });

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));
};

d3.json("index.php", clickFunction);