<?php
/**
 * Created by PhpStorm.
 * User: Zhou Yushan
 * Date: 2017/5/10
 * Time: 15:33
 */
require_once 'public.php';

// var_dump($_GET);
$part = "";
$paramlist = "";
$params = [];
$i = 0;

foreach($_GET as $a => $b) {
    if($i > 0)
        $part.=" AND ";
        
    $i += 1;
    $part .= $a.'=?';
    $paramlist .= "s";
    array_push($params,$b);
}

$q = <<<QUERY
SELECT * FROM tmpdata
QUERY
.($i > 0 ? ' where '.$part : "");
// var_dump($q);

$statement = $db->prepare($q);
//SELECT count() FROM tbl_name group by age
if($i > 0)
    $statement->bind_param($paramlist, ...$params);
$statement->execute();

$statement = $statement->get_result()->fetch_all(MYSQLI_ASSOC);

header('Content-Type: application/json');
echo json_encode($statement);

?>