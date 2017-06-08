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
$para1 = 0;
if(isset($_GET['threshold']))
    $para1 = $_GET['threshold'];
// var_dump($para1);
// python2 为python2.7的python.exe重命名与原来的相区别
exec("python2 dmFPTree.py $filePath $para1", $array, $ret);
?>
<!DOCTYPE html>
<meta charset="utf-8">
<style type="text/css">

    .node {
        cursor: pointer;
    }

    .overlay{
        background-color:#EEE;
    }

    .node circle {
        fill: #fff;
        stroke: steelblue;
        stroke-width: 1.5px;
    }

    .node text {
        font-size:10px;
        font-family:sans-serif;
    }

    .link {
        fill: none;
        stroke: #ccc;
        stroke-width: 1.5px;
    }

    .templink {
        fill: none;
        stroke: red;
        stroke-width: 3px;
    }

    .ghostCircle.show{
        display:block;
    }

    .ghostCircle, .activeDrag .ghostCircle{
        display: none;
    }

</style>
<script>
    var treeData = <?=$array[0]?>;
</script>
<body>
    <div id="tree-container"></div>
    <script src="jquery-3.2.1.min.js"></script>
    <script src="d3.old.min.js"></script>
    <script src="mainFPGrowth.js"></script>
</body>