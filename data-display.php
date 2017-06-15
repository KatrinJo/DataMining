<?php
/**
 * Created by PhpStorm.
 * User: Zhou Yushan
 * Date: 2017/5/10
 * Time: 15:33
 */
require_once 'public.php';

$attr = $_SESSION["attr"]; // 属性的名字
$attrNum = $_SESSION["attrNum"]; // 属性的个数
$attrStat = []; // 数组，每个元素的格式为：（属性名，统计数）

$part = "";
$paramlist = "";
$params = [];
$j = 0;
foreach($_GET as $a => $b) { // 在sql查询语句中的条件语句构成，通过GET方式得到key-value对
    if($j > 0) // 查看有1个还是多个条件语句
        $part.=" AND ";

    $j += 1;

    if(is_int($b)) { // 属性类型为int
        $part .= $a.'=?';
        $paramlist .= "i"; // i表示属性类型为int
        array_push($params,$b); // 将value值push进数组
    }
    else if(is_string($b)) { // 属性类型为string
        $tmp = explode('~',$b); // 将$b这个字符串根据'~'划分
        //判断这个属性的确定值是唯一的一个值，还是经过分bin处理后的一个范围
        if(count($tmp) == 1) { // 这个属性的确定值是唯一的一个值
            $part .= $a.'=?';
            $paramlist .= "s"; // s表示属性类型为string
            array_push($params,$tmp[0]); // 将value值push进数组
        }
        else { // 这个属性的确定值是经过分bin处理后的一个范围
            $tmp2 = explode('-',$tmp);
            $part .= $a.'>=? AND '.$a.'<=?';
            if(count($tmp2) == 1) {
                $t1 = 0 + $tmp[0];
                array_push($params,$t1);
                $t2 = $tmp[1];//0.0001 + $tmp[1]
                array_push($params,$t2);
                $t1 = explode('.',$t1); // 将$t1这个字符串根据'.'划分，用来判断是小数类型还是整数类型
                $t2 = explode('.',$t2); // 将$t2这个字符串根据'.'划分
                if(count($t1) > 1 || count($t2) > 1)// 是小数类型
                    $paramlist .= "dd";
                else// 是整数类型
                    $paramlist .= "ii";
            }
            else { // 是date类型
                array_push($params,$tmp[0],$tmp[1]);
                $paramlist .= "ss";
            }
        }
    }
    else if(is_float($b) || is_double($b)) { // 属性类型为小数，事实上不会进入，因为参数是以string形式传递过来的
        $part .= $a.'=?';
        $paramlist .= "d";
        array_push($params,$b);
    }
}

for($i = 0; $i < $attrNum; $i++) {
    if(isset($_GET[$attr[$i]])) {
        $tmp = $_GET[$attr[$i]]; // 对于已经确定了值（参数值被选择）的属性，不应再出现关于这个属性的统计图
        if(is_string($tmp)) { // 由于分bin操作，点击有数值范围之后，得到的确定了值的属性仍应该有统计图，故要特殊处理
            $tmp = explode('~',$tmp);
            if(count($tmp) == 1) // 属性确定了值，同时不是范围
                continue;
        }
    }
    if($j > 0) // $j用于判断是否有条件语句
        $q = <<<QUERY
SELECT $attr[$i], count($attr[$i]) as $attr[$i]Count FROM tmpdata WHERE $part group by $attr[$i] ORDER BY $attr[$i]
QUERY;
    else
        $q = <<<QUERY
SELECT $attr[$i], count($attr[$i]) as $attr[$i]Count FROM tmpdata group by $attr[$i] ORDER BY $attr[$i]
QUERY;
    // var_dump($q);
    // var_dump($params);

    $statement = $db->prepare($q); // sql语句
    if($j > 0) // 若有条件语句
        $statement->bind_param($paramlist, ...$params); // 传入参数
    if($statement->execute()) { // 执行查询
        $statement = $statement->get_result()->fetch_all(MYSQLI_ASSOC); // 得到结果
        // var_dump($statement);
        $keyValue = []; // 存放查询结果
        for($k = 0; $k < count($statement); $k++)
            array_push($keyValue, ['key' => $statement[$k][$attr[$i]], 'value' => $statement[$k][$attr[$i]."Count"]]);
        //var_dump($keyValue);
        $attrStat[$attr[$i]] = ['data' =>$keyValue, 'type'=> $_SESSION[$attr[$i].'__TypeName'] ] ;
    }
    else
        var_dump('Failed to query data.');
}
// var_dump($attrStat);

header('Content-Type: application/json');
//$i = 0;
//foreach ($statement as $row) {
//    if($i > 1)
//        break;
//    foreach ($row as $item) {
//        // var_dump($item);
//        if(is_int($item)) {}
//        else if(is_string($item)) {}
//        else if(is_float($item)) {}
//    }
//    $i += 1;
//}
echo json_encode($attrStat); // 将上述值编码成json格式传递
?>