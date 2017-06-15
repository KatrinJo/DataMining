<?php
/**
 * Created by PhpStorm.
 * User: Zhou Yushan
 * Date: 2017/5/10
 * Time: 15:33
 */
require_once 'public.php';

$attr = $_SESSION["attr"];
$attrNum = $_SESSION["attrNum"];
$metaGet = 0;
if(isset($_SESSION["scatterGet"]))
    $metaGet = $_SESSION["scatterGet"];
// var_dump($metaGet);
$part = "";
$paramlist = "";
$params = [];
$j = 0;
foreach($metaGet as $a => $b) {
    if($j > 0)
        $part.=" AND ";

    $j += 1;

    if(is_int($b)) {
        $part .= $a.'=?';
        $paramlist .= "i";
        array_push($params,$b);
    }
    else if(is_string($b)) {
        $tmp = explode('~',$b);
        // var_dump($tmp);
        if(count($tmp) == 1) {
            $part .= $a.'=?';
            $paramlist .= "s";
            array_push($params,$tmp[0]);
        }
        else {
            $part .= $a.'>=? AND '.$a.'<=?';
            $t1 = 0 + $tmp[0];
            array_push($params,$t1);
            $t2 = $tmp[1];//0.0001 + $tmp[1]
            array_push($params,$t2);
            $t1 = explode('.',$t1);
            $t2 = explode('.',$t2);
            if(count($t1) > 1 || count($t2) > 1)
                $paramlist .= "dd";
            else
                $paramlist .= "ii";
        }
    }
    else if(is_float($b) || is_double($b)) {
        $part .= $a.'=?';
        $paramlist .= "d";
        array_push($params,$b);
    }
}
$attrSelect = [];
array_push($attrSelect, $_POST["attr1"]); // 设定attr1为时间
array_push($attrSelect, $_POST["attr2"]); // 设定attr2为数据属性
// var_dump($_SESSION["attrSelect"]);
// var_dump($attrSelect);
$i = 0;


if($j > 0)
$q = <<<QUERY
SELECT $attrSelect[0] as date,avg($attrSelect[1]) as value FROM tmpdata WHERE $part GROUP BY $attrSelect[0] ORDER BY $attrSelect[0]
QUERY;
else
$q = <<<QUERY
SELECT $attrSelect[0] as date,avg($attrSelect[1]) as value FROM tmpdata GROUP BY $attrSelect[0] ORDER BY $attrSelect[0]
QUERY;
//var_dump($q);
//var_dump($params);

$statement = $db->prepare($q);
//var_dump($statement);
if($j > 0)
    $statement->bind_param($paramlist, ...$params);
if($statement->execute()) {
    $statement = $statement->get_result()->fetch_all(MYSQLI_ASSOC);
}
else
    var_dump('Failed to query data.');

// echo json_encode($statement);

?>

<!DOCTYPE html>
<meta charset="utf-8">
<html>

<head>
    <script>
        var data = <?=json_encode($statement)?>;
    </script>

    <title>时间序列分析</title>

    <link rel="stylesheet" href="style/style.css" />

    <script src="js/require.config.js"></script>
    <script data-main="js/comparisonGeometricZoom.js" src="js/lib/require.js"></script>
</head>
<body>
<div id="chart"></div>
</body>
</html>