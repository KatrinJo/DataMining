var currentData;
var isZscore = false;
var currentVarName;
var bars = {};
// 对每一个属性绘制直方图
// varName表示属性名
// data0为这样一个对象：
//      data(key)：表示的是这样的数组(value)
//              数组的内容是：当前用于坐标值的属性值，原数据库中的属性值，关于这个属性值的统计量
//      type(key)：表示的是这个属性的类型用作特殊处理
function drawHistogram(varName, data0) {
    var data = data0.data;
    if (data0.type === 'DECIMAL(20,10)') {
        data = data.map(function (d) {
            return { key: parseFloat(d.key), originalKey: d.key, value: d.value }; // 将属性值经过parseFloat得到小数形式
        });
    }
    if (typeof data[0].key === 'number' && data.length > 40) {
        // 改动data，新建data替代，用string代替作为新data的key
        var dataCapacity = data.length;
        var bins = 20; // 分成20个bin
        var binCapacity = Math.ceil(dataCapacity / bins); // 每个bin里存放的属性值区间长度
        var newData = []; // 存放新的data数组
        var newKey = ""; // 新的key值
        var newValue = 0; // 新的value值
        var i = 0;
        do {
            newValue += data[i].value; // 在这个区间内的统计量加和
            if (((i + 1) % binCapacity == 0) || ((i + 1) == dataCapacity)) {
                newKey += (data[i].originalKey || data[i].key); // newKey为字符串，表示属性值的区间范围
                newData.push({ key: newKey, value: newValue });
            }
            else if ((i + 1) % binCapacity == 1) {
                newKey = (data[i].originalKey || data[i].key) + "~";
                newValue = data[i].value;
            }
            i++;
        } while (i < dataCapacity);
        data = newData;
    }
    if (typeof data[0].key === 'number') {
        var m = d3.max(data, function (item) { return item.key; }); // 得到属性值的最大值
        var my = d3.max(data, function (item) { return item.value; }); // 得到属性值的统计量的最大值
        var minX = d3.min(data, function (item) { return item.key; }); // 得到属性值的最小值
        if (localStorage.getItem(varName) == 'zscore') {
            for (var i = 0; i < data.length; i++) {
                data[i].originalKey = data[i].originalKey || data[i].key; // 记录原属性值
                if (minX === m)
                    data[i].key = 1;
                else
                    data[i].key = (data[i].key - minX) / (m - minX);
            }
        }
        // var minY = d3.min(data, function (item) { return item.value });
        var keys = data.map(function (item) { return item.key; }); // 得到key的数组
        var formatCount = d3.format(",.0f");
        //在 body 里添加一个 SVG 画布
        var body = d3.select("body"); // 选择在实际页面中的body
        var heightText = 60; // 给字预留的高度
        var svg = body.append("svg").attr("width", 380).attr("height", 260 + heightText).on("mouseover", function () {
            currentVarName = varName;
        });
        //画布周边的空白
        var margin = { top: 5, right: 30, bottom: 20 + heightText, left: 30 };
        //画布大小
        var width = +svg.attr("width") - margin.left - margin.right;
        var height = +svg.attr("height") - margin.top - margin.bottom;
        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        //"translate(" + x(d.key) + "," + y(d.value) + ")"
        //x轴的比例尺
        var x = d3.scaleBand()
            .range([0, width]).domain(keys).paddingInner(0.2);
        if (localStorage.getItem(varName) == 'zscore') {
        }
        //y轴的比例尺
        var y = d3.scaleLinear()
            .domain([0, my])
            .range([height, 0]);
        // bar表示直方图的每个竖条
        var bar = g.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) { return "translate(" + x(d.key) + "," + y(d.value) + ")"; });
        bars[varName] = bar;
        // 当鼠标移到块上，蓝色块变成黄色，并显示当前块的键值
        bar.append("rect")
            .attr("x", 0)
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", "steelblue")
            .on("mouseover", function (d, i) {
            d3.select(this).attr("fill", "yellow");
            gtext.transition()
                .duration(750)
                .attr("x", 0).attr("y", +svg.attr("height") - (2 * margin.top + margin.bottom) / 3);
            gtext.text("值=" + (d.originalKey || d.key) + " 个数=" + d.value); // 更好地显示当前鼠标移上去的bar的内容
        })
            .on("mouseout", function (d, i) {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("fill", "steelblue");
        })
            .on("click", function (d) {
            if (location.search.length > 0) {
                var tmp2 = location.search.split("?"); // 编写路径条件
                var tmp = tmp2[1].split("&");
                var newSearch = "";
                var flag = 0;
                for (var i = 0; i < tmp.length; i++) {
                    if (i > 0)
                        newSearch = newSearch + "&";
                    var t = tmp[i].split("=");
                    if (t[0] == varName) {
                        flag = 1;
                        newSearch = newSearch + varName + "=" + (d.originalKey || d.key);
                    }
                    else
                        newSearch = newSearch + tmp[i];
                }
                if (flag == 0)
                    location.href = "data-default.php" + location.search + "&" + varName + "=" + (d.originalKey || d.key);
                else
                    location.href = "data-default.php" + "?" + newSearch;
            }
            else
                location.href = "data-default.php" + "?" + varName + "=" + (d.originalKey || d.key);
        });
        bar.append("text") // 在每个块的顶部中央显示当前块的值，也即计数值
            .attr("dy", ".75em")
            .attr("y", 0)
            .attr("x", (width / data.length) / 2)
            .attr("text-anchor", "middle")
            .text(function (d) { return formatCount(d.value); });
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("y", +svg.attr("height") - (margin.top + margin.bottom) / 2)
            .attr("x", +svg.attr("width") / 2)
            .attr("text-anchor", "middle")
            .text(varName);
        svg.append("text")
            .attr("y", +svg.attr("height") - (2 * margin.top + margin.bottom) / 3)
            .attr("x", +svg.attr("width") - 3 * margin.right)
            .attr("text-anchor", "middle")
            .text(function () {
            if (localStorage.getItem(varName) == 'zscore')
                return "反归一化";
            else
                return "归一化";
        })
            .on("mouseover", function (d, i) {
            d3.select(this).attr("fill", "steelblue");
        })
            .on("mouseout", function (d, i) {
            d3.select(this).attr("fill", "black");
        })
            .on("click", function () {
            if (localStorage.getItem(varName) == 'zscore')
                localStorage.setItem(varName, 'unzscore');
            else
                localStorage.setItem(varName, 'zscore');
            location.reload();
        });
        var gtext = g.append("text").attr("fill", "red").attr("transform", "scale(1)");
    }
    else if (typeof data[0].key === 'string') {
        var m = d3.max(data, function (item) { return item.key; });
        var my = d3.max(data, function (item) { return item.value; });
        var keys = data.map(function (item) { return item.key; });
        var formatCount = d3.format(",.0f");
        //在 body 里添加一个 SVG 画布
        var body = d3.select("body");
        var heightText = 60;
        var svg = body.append("svg").attr("width", 380).attr("height", 260 + heightText).on("mouseover", function () {
            currentVarName = varName;
        });
        //画布周边的空白
        var margin = { top: 5, right: 30, bottom: 20 + heightText, left: 40 };
        //画布大小
        var width = +svg.attr("width") - margin.left - margin.right;
        var height = +svg.attr("height") - margin.top - margin.bottom;
        var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        //"translate(" + x(d.key) + "," + y(d.value) + ")"
        //x轴的比例尺
        var x = d3.scaleBand()
            .range([0, width]).domain(keys).paddingInner(0.2);
        //y轴的比例尺
        var y = d3.scaleLinear()
            .domain([0, my])
            .range([height, 0]);
        var bar = g.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) { return "translate(" + x(d.key) + "," + y(d.value) + ")"; });
        bars[varName] = bar;
        bar.append("rect")
            .attr("x", 0)
            .attr("width", x.bandwidth())
            .attr("height", function (d) { return height - y(d.value); })
            .attr("fill", "steelblue")
            .on("mouseover", function (d, i) {
            d3.select(this)
                .attr("fill", "yellow");
            gtext.transition()
                .duration(750)
                .attr("x", 0).attr("y", +svg.attr("height") - (2 * margin.top + margin.bottom) / 3);
            gtext.text("值=" + d.key + " 个数=" + d.value);
        })
            .on("mouseout", function (d, i) {
            d3.select(this)
                .transition()
                .duration(500)
                .attr("fill", "steelblue");
        })
            .on("click", function (d) {
            if (location.search.length > 0) {
                var tmp2 = location.search.split("?");
                var tmp = tmp2[1].split("&");
                var newSearch = "";
                var flag = 0;
                for (var i = 0; i < tmp.length; i++) {
                    if (i > 0)
                        newSearch = newSearch + "&";
                    var t = tmp[i].split("=");
                    if (t[0] == varName) {
                        flag = 1;
                        newSearch = newSearch + varName + "=" + d.key;
                    }
                    else
                        newSearch = newSearch + tmp[i];
                }
                if (flag == 0)
                    location.href = "data-default.php" + location.search + "&" + varName + "=" + d.key;
                else
                    location.href = "data-default.php" + "?" + newSearch;
            }
            else
                location.href = "data-default.php" + "?" + varName + "=" + d.key;
        });
        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 0)
            .attr("x", (width / data.length) / 2)
            .attr("text-anchor", "middle")
            .text(function (d) { return formatCount(d.value); });
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("y", +svg.attr("height") - (margin.top + margin.bottom) / 2)
            .attr("x", +svg.attr("width") / 2)
            .attr("text-anchor", "middle")
            .text(varName);
        var gtext = g.append("text").attr("fill", "red").attr("transform", "scale(1)");
    }
}
var clickFunction = function (error, data) {
    currentData = data;
    var result = data;
    for (var varName in result)
        drawHistogram(varName, result[varName]);
};
d3.json("data-display.php" + location.search, clickFunction);
