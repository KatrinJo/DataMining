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
if(isset($_GET['threshold'])) {
    $para1 = $_GET['threshold'];
}

// var_dump($para1);

exec("python2 dmFPGrowth.py $filePath $para1", $array, $ret);
// var_dump($array);
// var_dump($ret);
?>
<!DOCTYPE html>
<meta charset="utf-8">
<body>
    <div id="nav">
        有频繁项集为：
        <ul>
            <?php
            if($ret == 0) {
                $retCount = count($array);
                if($retCount != 2) {
                    var_dump('The return count is wrong!');
                }
                else {
                    $ItemNum = $array[1];
                    $ItemSet = $array[0];
                    //echo $ItemSet;
                    $ItemSet = str_replace(", set",",set",$ItemSet);
                    $ItemSet = str_replace("', '","','",$ItemSet);

                    $vowels = array("set(",")","'");
                    $ItemSet = str_replace($vowels,"",$ItemSet);
//                    ."\n\n";
                    $ItemArray = explode("],[",$ItemSet);
//                    for($i = 0; $i < count($ItemArray); $i++)
//                        echo $ItemArray[$i];
                    $vowels2 = array("[","]");
                    $ItemArray[0] = str_replace($vowels2,"",$ItemArray[0]);
                    if(count($ItemArray) > 0)
                        $ItemArray[count($ItemArray)-1] = str_replace($vowels2,"",$ItemArray[count($ItemArray)-1]);
                    for($i = 0; $i < count($ItemArray); $i++) {?>
                        <li><?=$ItemArray[$i]?></li>
                    <?php }
                }
            } ?>
        </ul>
    </div>
<!--    <div id="tree-container"></div>-->
<!--    <script src="jquery-3.2.1.min.js"></script>-->
<!--    <script src="d3.old.min.js"></script>-->
<!--    <script src="mainFPGrowth.js"></script>-->
</body>