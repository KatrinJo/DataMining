<?php
/**
 * Created by PhpStorm.
 * User: Zhou Yushan
 * Date: 2017/5/10
 * Time: 15:33
 */
require_once 'public.php';

?>

<!DOCTYPE html>
<meta charset="utf-8">
<style>
    .bar text {
        fill: #000;
        font: 10px sans-serif;
    }

    li {
        display: inline-block;
    }


    svg {
        font-size: 14px;
    }

    .axis {
        shape-rendering: crispEdges;
    }

    .axis line {
        stroke: #ddd;
        stroke-width: .5px;
    }

    .axis path {
        display: none;
    }

    rect.extent {
        fill: #000;
        fill-opacity: .125;
        stroke: #fff;
    }

    rect.frame {
        fill: #fff;
        fill-opacity: .7;
        stroke: #aaa;
    }

    circle {
        fill: #ccc;
        fill-opacity: .5;
    }

    .legend circle {
        fill-opacity: 1;
    }

    .legend text {
        font-size: 18px;
        font-style: oblique;
    }

    .cell text {
        pointer-events: none;
    }

    .setosa {
        fill: #800;
    }

    .versicolor {
        fill: #080;
    }

    .virginica {
        fill: #008;
    }

    .defaultcolor {
        fill: #246;
    }

    .selectcolor{
        fill: #448
    }


</style>
<title>散点图</title>
<body>
<div id="nav">
    <ul>
        <?php
        $_SESSION["attrSelect"] = $_POST;
        $metaGET = [];
        if(isset($_SESSION["scatterGet"]))
            $metaGET = $_SESSION["scatterGet"];
        if(count($metaGET) > 0) {
            foreach ($metaGET as $a => $b) { ?>
                <li><?=$a?>=<?=$b?> </li>
            <?php }
        } else { ?>
            <li>当前显示全部数据</li>
        <?php } ?>
    </ul>
</div>
<script src="jquery-3.2.1.min.js"></script>
<script src="d3.min.js"></script>
<script src="mainScatter.js"></script>
</body>
