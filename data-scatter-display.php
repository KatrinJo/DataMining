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
array_push($attrSelect, $_SESSION["attrSelect"]["attr1"]);
array_push($attrSelect, $_SESSION["attrSelect"]["attr2"]);
// var_dump($_SESSION["attrSelect"]);
// var_dump($attrSelect);
$i = 0;

if(isset($_SESSION["attrSelect"])) {
    if($j > 0)
        $q = <<<QUERY
SELECT $attrSelect[0],$attrSelect[1],count(*) as countNum FROM tmpdata WHERE $part GROUP BY $attrSelect[0],$attrSelect[1] ORDER BY $attrSelect[0],$attrSelect[1]
QUERY;
    else
        $q = <<<QUERY
SELECT $attrSelect[0],$attrSelect[1],count(*) as countNum FROM tmpdata GROUP BY $attrSelect[0],$attrSelect[1]  ORDER BY $attrSelect[0],$attrSelect[1]
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


    header('Content-Type: application/json');
    echo json_encode(['data'=>$statement, 'type'=>$_SESSION['attrAllType']]);
}
else {
    var_dump("Please select the attributes again.");
}


?>