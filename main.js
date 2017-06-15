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
    if ((typeof data[0].key === 'number' || data0.type === 'DATE') && data.length > 40) {
        // 改动data，新建data替代，用string代替作为新data的key
        var dataCapacity = data.length;
        var bins = 20; // 分成20个bin
        var binCapacity = Math.ceil(dataCapacity / bins); // 每个bin里存放的属性值区间长度
        var newData = []; // 存放新的data数组
        var newKey = ""; // 新的key值
        var newValue = 0; // 新的value值
        var i_1 = 0;
        do {
            newValue += data[i_1].value; // 在这个区间内的统计量加和
            if (((i_1 + 1) % binCapacity == 0) || ((i_1 + 1) == dataCapacity)) {
                newKey += (data[i_1].originalKey || data[i_1].key); // newKey为字符串，表示属性值的区间范围
                newData.push({ key: newKey, value: newValue });
            }
            else if ((i_1 + 1) % binCapacity == 1) {
                newKey = (data[i_1].originalKey || data[i_1].key) + "~";
                newValue = data[i_1].value;
            }
            i_1++;
        } while (i_1 < dataCapacity);
        data = newData;
    }
    if (typeof data[0].key === 'number') {
        var m = d3.max(data, function (item) { return item.key; }); // 得到属性值的最大值
        var my = d3.max(data, function (item) { return item.value; }); // 得到属性值的统计量的最大值
        var minX = d3.min(data, function (item) { return item.key; }); // 得到属性值的最小值
        if (localStorage.getItem(varName) == 'zscore') {
            for (var i_2 = 0; i_2 < data.length; i_2++) {
                data[i_2].originalKey = data[i_2].originalKey || data[i_2].key; // 记录原属性值
                if (minX === m)
                    data[i_2].key = 1;
                else
                    data[i_2].key = (data[i_2].key - minX) / (m - minX);
            }
        }
        // let minY = d3.min(data, function (item) { return item.value });
        var keys = data.map(function (item) { return item.key; }); // 得到key的数组
        var formatCount_1 = d3.format(",.0f");
        //在 body 里添加一个 SVG 画布
        var body = d3.select("body"); // 选择在实际页面中的body
        var heightText = 60; // 给字预留的高度
        var svg_1 = body.append("svg").attr("width", 380).attr("height", 260 + heightText).on("mouseover", function () {
            currentVarName = varName;
        });
        //画布周边的空白
        var margin_1 = { top: 5, right: 30, bottom: 20 + heightText, left: 30 };
        //画布大小
        var width = +svg_1.attr("width") - margin_1.left - margin_1.right;
        var height_1 = +svg_1.attr("height") - margin_1.top - margin_1.bottom;
        var g = svg_1.append("g").attr("transform", "translate(" + margin_1.left + "," + margin_1.top + ")");
        //"translate(" + x(d.key) + "," + y(d.value) + ")"
        //x轴的比例尺
        var x_1 = d3.scaleBand()
            .range([0, width]).domain(keys).paddingInner(0.2);
        if (localStorage.getItem(varName) == 'zscore') {
        }
        //y轴的比例尺
        var y_1 = d3.scaleLinear()
            .domain([0, my])
            .range([height_1, 0]);
        // bar表示直方图的每个竖条
        var bar = g.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) { return "translate(" + x_1(d.key) + "," + y_1(d.value) + ")"; });
        bars[varName] = bar;
        // 当鼠标移到块上，蓝色块变成黄色，并显示当前块的键值
        bar.append("rect")
            .attr("x", 0)
            .attr("width", x_1.bandwidth())
            .attr("height", function (d) { return height_1 - y_1(d.value); })
            .attr("fill", "steelblue")
            .on("mouseover", function (d, i) {
            d3.select(this).attr("fill", "yellow");
            gtext_1.transition()
                .duration(750)
                .attr("x", 0).attr("y", +svg_1.attr("height") - (2 * margin_1.top + margin_1.bottom) / 3);
            gtext_1.text("值=" + (d.originalKey || d.key) + " 个数=" + d.value); // 更好地显示当前鼠标移上去的bar的内容
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
                for (var i_3 = 0; i_3 < tmp.length; i_3++) {
                    if (i_3 > 0)
                        newSearch = newSearch + "&";
                    var t = tmp[i_3].split("=");
                    if (t[0] == varName) {
                        flag = 1;
                        newSearch = newSearch + varName + "=" + (d.originalKey || d.key);
                    }
                    else
                        newSearch = newSearch + tmp[i_3];
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
            .text(function (d) { return formatCount_1(d.value); });
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height_1 + ")")
            .call(d3.axisBottom(x_1));
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y_1));
        svg_1.append("text")
            .attr("y", +svg_1.attr("height") - (margin_1.top + margin_1.bottom) / 2)
            .attr("x", +svg_1.attr("width") / 2)
            .attr("text-anchor", "middle")
            .text(varName);
        svg_1.append("text")
            .attr("y", +svg_1.attr("height") - (2 * margin_1.top + margin_1.bottom) / 3)
            .attr("x", +svg_1.attr("width") - 3 * margin_1.right)
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
        var gtext_1 = g.append("text").attr("fill", "red").attr("transform", "scale(1)");
    }
    else if (typeof data[0].key === 'string') {
        var m = d3.max(data, function (item) { return item.key; });
        var my = d3.max(data, function (item) { return item.value; });
        var keys = data.map(function (item) { return item.key; });
        var formatCount_2 = d3.format(",.0f");
        //在 body 里添加一个 SVG 画布
        var body = d3.select("body");
        var heightText = 60;
        var svg_2 = body.append("svg").attr("width", 380).attr("height", 260 + heightText).on("mouseover", function () {
            currentVarName = varName;
        });
        //画布周边的空白
        var margin_2 = { top: 5, right: 30, bottom: 20 + heightText, left: 40 };
        //画布大小
        var width = +svg_2.attr("width") - margin_2.left - margin_2.right;
        var height_2 = +svg_2.attr("height") - margin_2.top - margin_2.bottom;
        var g = svg_2.append("g").attr("transform", "translate(" + margin_2.left + "," + margin_2.top + ")");
        //"translate(" + x(d.key) + "," + y(d.value) + ")"
        //x轴的比例尺
        var x_2 = d3.scaleBand()
            .range([0, width]).domain(keys).paddingInner(0.2);
        //y轴的比例尺
        var y_2 = d3.scaleLinear()
            .domain([0, my])
            .range([height_2, 0]);
        var bar = g.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) { return "translate(" + x_2(d.key) + "," + y_2(d.value) + ")"; });
        bars[varName] = bar;
        bar.append("rect")
            .attr("x", 0)
            .attr("width", x_2.bandwidth())
            .attr("height", function (d) { return height_2 - y_2(d.value); })
            .attr("fill", "steelblue")
            .on("mouseover", function (d, i) {
            d3.select(this)
                .attr("fill", "yellow");
            gtext_2.transition()
                .duration(750)
                .attr("x", 0).attr("y", +svg_2.attr("height") - (2 * margin_2.top + margin_2.bottom) / 3);
            gtext_2.text("值=" + d.key + " 个数=" + d.value);
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
                for (var i_4 = 0; i_4 < tmp.length; i_4++) {
                    if (i_4 > 0)
                        newSearch = newSearch + "&";
                    var t = tmp[i_4].split("=");
                    if (t[0] == varName) {
                        flag = 1;
                        newSearch = newSearch + varName + "=" + d.key;
                    }
                    else
                        newSearch = newSearch + tmp[i_4];
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
            .text(function (d) { return formatCount_2(d.value); });
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height_2 + ")")
            .call(d3.axisBottom(x_2));
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y_2));
        svg_2.append("text")
            .attr("y", +svg_2.attr("height") - (margin_2.top + margin_2.bottom) / 2)
            .attr("x", +svg_2.attr("width") / 2)
            .attr("text-anchor", "middle")
            .text(varName);
        var gtext_2 = g.append("text").attr("fill", "red").attr("transform", "scale(1)");
    }
}
var clickFunction = function (error, data) {
    currentData = data;
    var result = data;
    for (var varName in result)
        drawHistogram(varName, result[varName]);
};
d3.json("data-display.php" + location.search, clickFunction);
