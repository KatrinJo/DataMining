var currentData;
var isZscore = false;
var currentVarName;
var bars = {};

function drawScatter(error, data0:{data : any [], type : {[key: string]: string}}) {
    var type = data0.type;
    var traits = [];
    var data = data0.data;
    var tmp = data[0]; // Object.keys(tmp);
    for(var i in tmp) {
        if(type[i] === 'DECIMAL(20,10)' || type[i] === 'INT(11)') {
            traits.push(i);
        }
    }

    var size = 280,
        padding = 20,
        n = 4;

    var x = {}, y = {};
    traits.forEach(function(trait) {
        // Coerce values to numbers.
        data.forEach(function(d) { d[trait] = +d[trait]; });

        var value = function(d) { return d[trait]; },
            domain = [d3.min(data, value), d3.max(data, value)],
            range = [padding / 2, size - padding / 2];
        x[trait] = d3.scaleLinear().domain(domain).range(range);
        y[trait] = d3.scaleLinear().domain(domain).range(range.reverse());
    });

    // Axes.
    // var axis = d3.svg.axis()
    //     .ticks(5)
    //     .tickSize(size * n);

    // Brush.
    // var brush = d3.brush()
    //     .on("brushstart", brushstart)
    //     .on("brush", brushSelect)
    //     .on("brushend", brushend);

    // Root panel.
    var svg = d3.select("body").append("svg:svg")
        .attr("width", 960)
        .attr("height", 1280)
        .append("svg:g")
        .attr("transform", "translate(0,0)");

    // X-axis.
    svg.selectAll("g.x.axis")
        .data(traits)
        .enter().append("svg:g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + i * size + ","+(size-padding/2)+")"; })
        .each(function(d) { d3.select(this).call(d3.axisBottom(x[d]))});

    // Y-axis.
    svg.selectAll("g.y.axis")
        .data(traits)
        .enter().append("svg:g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate("+(size-padding/2)+"," + i * size + ")"; })
        .each(function(d) { d3.select(this).call(d3.axisRight(y[d]))});

// Cell and plot.
    var cell = svg.selectAll("g.cell")
        .data(cross(traits, traits))
        .enter().append("svg:g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
        .each(plot);

    // Titles for the diagonal.
    cell.filter(function(d) { return d.i == d.j; }).append("svg:text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

    function plot(p) {
        var cell = d3.select(this);
        // Plot frame.
        cell.append("svg:rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        // Plot dots.
        cell.selectAll("circle")
            .data(data)
            .enter().append("svg:circle")
            .attr("class", "defaultcolor")
            .attr("cx", function(d) { return x[p.x](d[p.x]); })
            .attr("cy", function(d) { return y[p.y](d[p.y]); })
            .attr("r", 3);

        // Plot brush.
        // cell.call(brush.x(x[p.x]).y(y[p.y]));
    }

    // Clear the previously-active brush, if any.
    // function brushstart(p) {
    //     if (brush.data !== p) {
    //         cell.call(function () {
    //             brush.move(this,[[x[p.x], y[p.y]], [x[p.x], y[p.y]]]).data = p;
    //         });
    //     }
    // }
    //
    // // Highlight the selected circles.
    // function brushSelect(p) {
    //     var e = brush.extent();
    //     svg.selectAll(".cell circle").attr("class", function(d) {
    //         return e[0][0] <= d[p.x] && d[p.x] <= e[1][0]
    //         && e[0][1] <= d[p.y] && d[p.y] <= e[1][1]
    //             ? "selectcolor" : null;
    //     });
    // }
    //
    // // If the brush is empty, select all circles.
    // function brushend() {
    //     var e = brush.extent();
    //     if(e[0][0] == e[1][0] && e[0][1] == e[1][1])
    //         svg.selectAll(".cell circle").attr("class", "selectcolor");
    // }

    function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
    }

//
//     if(data0.type === 'DECIMAL(20,10)') {
//         data = data.map(function (d) {
//             return {key:parseFloat(d.key),originalKey:d.key,value:d.value};
//         })
//     }
//     if(typeof data[0].key === 'number' && data.length > 40) { // 分bins
//         // 改动data，新建data替代，用string代替作为新data的key
//         var dataCapacity = data.length;
//         var bins = 20;
//         var binCapacity = Math.ceil(dataCapacity/bins);
//         var newData = [];
//         var newKey = "";
//         var newValue = 0;
//         var i = 0;
//         do {
//             newValue += data[i].value;
//             if(((i+1) % binCapacity == 0) || ((i+1) == dataCapacity)) {
//                 newKey += (data[i].originalKey || data[i].key);
//                 newData.push({key:newKey, value:newValue});
//             }
//             else if((i+1) % binCapacity == 1) {
//                 newKey = (data[i].originalKey || data[i].key)+ "~";
//                 newValue = data[i].value;
//             }
//             i++;
//         } while (i < dataCapacity);
//         data = newData;
// //        console.log(newData);
//     }
//     if(typeof data[0].key === 'number') {
//         var m = d3.max(data, function (item) { return item.key });
//         var my = d3.max(data, function (item) { return item.value });
//         var minX = d3.min(data, function (item) { return item.key });
//
//         if(localStorage.getItem(varName) == 'zscore') {
//             for(var i = 0; i < data.length; i++) {
//                 data[i].originalKey = data[i].originalKey || data[i].key;
//                 if(minX === m)
//                     data[i].key = 1;
//                 else
//                     data[i].key = (data[i].key-minX)/(m-minX);
//             }
//         }
//
//         var minY = d3.min(data, function (item) { return item.value });
//
//         var keys = data.map(function (item) { return item.key;});
//
//         var formatCount = d3.format(",.0f");
//         //在 body 里添加一个 SVG 画布
//
//         var body = d3.select("body");
//         var heightText = 60;
//         var svg = body.append("svg").attr("width",380).attr("height",260+heightText).on("mouseover",function(){
//             currentVarName = varName;
//         });
//         //画布周边的空白
//         var margin = {top: 5, right: 30, bottom: 20+heightText, left: 30};
//         //画布大小
//         var width = +svg.attr("width") - margin.left - margin.right;
//         var height = +svg.attr("height") - margin.top - margin.bottom;
//         var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//         //"translate(" + x(d.key) + "," + y(d.value) + ")"
//         //x轴的比例尺
//         var x = d3.scaleBand()
//             .range([0, width]).domain(keys).paddingInner(0.2);
//         if(localStorage.getItem(varName) == 'zscore') {
//
//         }
//         //y轴的比例尺
//         var y = d3.scaleLinear()
//             .domain([0, my])
//             .range([height, 0]);
//
//         var bar = g.selectAll(".bar")
//             .data(data)
//             .enter().append("g")
//             .attr("class", "bar")
//             .attr("transform", function(d) { return "translate(" + x(d.key) + "," + y(d.value) + ")"; });
//         bars[varName] = bar;
//
//         bar.append("rect")
//             .attr("x", 0)
//             .attr("width", x.bandwidth())
//             .attr("height", function(d) { return height - y(d.value); })
//             .attr("fill","steelblue")
//             .on("mouseover",function(d,i){
//                 d3.select(this).attr("fill","yellow");
//
//                 gtext.transition()
//                     .duration(750)
//                     .attr("x",0).attr("y",+svg.attr("height") - (2*margin.top+margin.bottom)/3);
//                 gtext.text("值="+ (d.originalKey || d.key) +" 个数="+ d.value);
//             })
//             .on("mouseout",function(d,i){
//                 d3.select(this)
//                     .transition()
//                     .duration(500)
//                     .attr("fill","steelblue");
//             })
//             .on("click", function(d){
//                 if(location.search.length > 0) {
//                     var tmp2 = location.search.split("?");
//                     var tmp = tmp2[1].split("&");
//                     var newSearch = "";
//                     var flag = 0;
//                     for(var i = 0; i < tmp.length; i++) {
//                         if(i > 0)
//                             newSearch = newSearch + "&";
//                         var t = tmp[i].split("=");
//                         if(t[0] == varName) {
//                             flag = 1;
//                             newSearch = newSearch + varName + "=" + (d.originalKey || d.key);
//                         }
//                         else
//                             newSearch = newSearch + tmp[i];
//                     }
//                     if(flag == 0)
//                         location.href = "data-default.php"+location.search + "&" + varName+"="+(d.originalKey || d.key);
//                     else
//                         location.href = "data-default.php"+ "?" + newSearch;
//                     // location.href = "data-default.php"+location.search + "&" + varName+"="+(d.originalKey || d.key);
//                 }
//                 else
//                     location.href = "data-default.php" + "?" + varName+"="+(d.originalKey || d.key);
//             })
//         ;
//
//         bar.append("text")
//             .attr("dy", ".75em")
//             .attr("y", 0)
//             .attr("x", (width/data.length) / 2)
//             .attr("text-anchor", "middle")
//             .text(function(d) { return formatCount(d.value); });
//
//         g.append("g")
//             .attr("class", "axis axis--x")
//             .attr("transform", "translate(0," + height + ")")
//             .call(d3.axisBottom(x));
//
//         g.append("g")
//             .attr("class", "axis axis--y")
//             .call(d3.axisLeft(y));
//
//         svg.append("text")
//             .attr("y", +svg.attr("height") - (margin.top+margin.bottom)/2)
//             .attr("x", +svg.attr("width")/2)
//             .attr("text-anchor", "middle")
//             .text(varName);
//
//         svg.append("text")
//             .attr("y", +svg.attr("height") - (2*margin.top+margin.bottom)/3)
//             .attr("x", +svg.attr("width")-3*margin.right)
//             .attr("text-anchor", "middle")
//             .text(function () {
//                 if(localStorage.getItem(varName) == 'zscore')
//                     return "反归一化" ;
//                 else
//                     return "归一化" ;
//             })
//             .on("mouseover",function(d,i){
//                 d3.select(this).attr("fill","steelblue");
//             })
//             .on("mouseout",function(d,i){
//                 d3.select(this).attr("fill","black");
//             })
//             .on("click",function () {
//                 if(localStorage.getItem(varName) == 'zscore')
//                     localStorage.setItem(varName, 'unzscore');
//                 else
//                     localStorage.setItem(varName, 'zscore');
//                 location.reload();
//             });
//
//         var gtext = g.append("text").attr("fill","red").attr("transform","scale(1)");
//     }


}

d3.json("data-scatter-display.php" + location.search, drawScatter);