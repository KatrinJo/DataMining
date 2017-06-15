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
<body>
<div id="nav">
    <ul>
        <?php
        $attr = $_SESSION["attr"];
        $attrNum = $_SESSION["attrNum"];
        $attrSelect = [];
        $_SESSION["scatterGet"] = $_GET;
        for($i = 0; $i < $attrNum; $i++) {
            $flag = 0;
            foreach ($_GET as $a => $b) {
                if($a == $attr[$i]){
                    $flag = 1;
                    break;
                }
            }
            if($flag == 1)
                continue;
            array_push($attrSelect, $attr[$i]);
        }
        if(count($_GET) > 0) {
            foreach ($_GET as $a => $b) { ?>
                <li><?=$a?>=<?=$b?> </li>
            <?php }
        } else { ?>
            <li>当前显示全部数据</li>
        <?php }
        $num_date = 0;

        //var_dump($_SESSION['attrAllType']);
        //var_dump($attrSelect);

        for($i = 0; $i < count($attrSelect); $i++) {
            if($_SESSION['attrAllType'][$attrSelect[$i]] != 'DATE')
                continue;
            $num_date += 1;
        }
        $num_int = 0;
        for($i = 0; $i < count($attrSelect); $i++) {
            if($_SESSION['attrAllType'][$attrSelect[$i]] != 'INT(11)' &&
                $_SESSION['attrAllType'][$attrSelect[$i]] != 'DECIMAL(20,10)')
                continue;
            $num_int += 1;
        }

        if($num_date == 0 && $num_int != 0) { ?>
            <li>当前数据中不包含时间数据</li>
        <?php }
        else if($num_date != 0 && $num_int == 0) { ?>
            <li>当前数据中不包含数值型数据</li>
        <?php }
        else if($num_date == 0 && $num_int == 0) { ?>
            <li>当前数据中不包含时间数据与数值型数据</li>
        <?php }
        ?>
    </ul>
    <?php
    if($num_date != 0 && $num_int != 0) {?>
        <form enctype="multipart/form-data" action="data-geometric-zoom.php" method="post">
            <select name = "attr1" id = "select">
                <?php
                for($i = 0; $i < count($attrSelect); $i++) {
                    if($_SESSION['attrAllType'][$attrSelect[$i]] != 'DATE')
                        continue;
                    ?>
                    <option value="<?=$attrSelect[$i]?>"><?=$attrSelect[$i]?></option>
                <?php } ?>
            </select>

            <select name = "attr2" id = "select">
                <?php
                for($i = 0; $i < count($attrSelect); $i++) {
                    if($_SESSION['attrAllType'][$attrSelect[$i]] != 'INT(11)' &&
                        $_SESSION['attrAllType'][$attrSelect[$i]] != 'DECIMAL(20,10)')
                        continue;
                    ?>
                    <option value="<?=$attrSelect[$i]?>"><?=$attrSelect[$i]?></option>
                <?php } ?>
            </select>

            <button class="submit"  type="submit">确定</button>
        </form>
  <?php } ?>


</div>
<script src="jquery-3.2.1.min.js"></script>
<script src="d3.min.js"></script>
<!-- <script src="mainScatter.js"></script> -->
</body>
