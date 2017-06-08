<?php
/**
 * Created by PhpStorm.
 * User: Zhou Yushan
 * Date: 2017/5/10
 * Time: 15:33
 */
require_once 'public.php';

if(isset($_POST["attr"])) { // 判断通过POST方式传递过来的参数是否存在
    $attr = $_POST["attr"]; // 通过POST方式传递过来的参数
    $attrNum = count($attr);
    $_SESSION["attr"] = $attr; // 存成SESSION格式，之后可以复用
    $_SESSION["attrNum"] = $attrNum;
}

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
</style>
<body>
<div id="nav">
    <ul>
        <?php
        if(count($_GET) > 0) {
            foreach ($_GET as $a => $b) { ?>
                <li><?=$a?>=<?=$b?> </li>
            <?php }
        } else { ?>
            <li>当前显示全部数据</li>
        <?php } ?>
    </ul>
</div>
<div>
    <button onclick="location.href = 'data-scatter-selectattr.php'+location.search">选择绘制散点图属性</button>
<!--    阈值=<input id="threshold">%-->
    <button onclick="location.href = 'data-mining-select.php'">数据挖掘</button>
<!--    +'threshold='+$('#threshold').val()-->
<!--    <button onclick="location.href = 'data-analysis-select.php'">数据分析</button>-->
</div>
<script src="jquery-3.2.1.min.js"></script>
<script src="d3.min.js"></script>
<script src="main.js"></script>
</body>
