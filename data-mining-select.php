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
$filePath = $_SESSION['uploads_dir'].'\\'.$_SESSION['fileName'];

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
    阈值=<input id="threshold" min="0" type="number">%
    <button onclick="location.href = 'data-mining-fpgrowth.php?'+'threshold='+($('#threshold').val())">FPGrowth</button>
    <button onclick="location.href = 'data-mining-fpTree.php?'+'threshold='+($('#threshold').val())">FPTree</button>
</div>
<script src="jquery-3.2.1.min.js"></script>
<!--<script src="d3.min.js"></script>-->
<!--<script src="main.js"></script>-->
</body>
