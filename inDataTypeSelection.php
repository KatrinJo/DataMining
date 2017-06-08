<?php
//$query = <<<eof
//    LOAD DATA INFILE 'D:/16-17大三/春季学期大三下/数据挖掘/大作业/data.csv'
//     INTO TABLE tmpdata
//     FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"'
//     LINES TERMINATED BY '\n'
//    (field1,field2,field3,etc)
//eof;
//
//$db->query($query);
require_once 'public.php';

$tmpName = $_FILES['import-data']['tmp_name']; // 临时文件名
$name = $_FILES['import-data']['name']; // 文件名
$tmpFileName = str_replace('\\','/',$tmpName);
$name = basename($name); // 获取直接的文件名，去除路径部分
$_SESSION['fileName'] = $name;

$handle = fopen($_FILES['import-data']['tmp_name'], "r");
// Read first (headers) record only)
$data = fgetcsv($handle, 1000, ",");

$check = 'select TABLE_NAME from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=\'csv_db\' and TABLE_NAME=\'tmpdata\'';
$res = $db->query($check);
if($res)
    if($res->num_rows > 0) {
        $sql= 'DROP TABLE tmpdata';
        $res = $db->query($sql);
        if($res == false)
            var_dump($db->error);
    }

?>
<html>
<head>
    <title>确定属性类型</title>
</head>
<body>
<div>
    <form enctype="multipart/form-data" action="inDataSelection.php" method="post">
    <?php
        for($i=0;$i<count($data); $i++) {?>
            <p>
                <?php echo $data[$i];?>
                <select name="<?=$data[$i]?>" id="select">
                    <option value="VARCHAR(50)">varchar</option>
                    <option value="INT(11)">int</option>
                    <option value="DECIMAL(20,10)">decimal</option>
                </select>
            </p>
    <?php }
    fclose($handle);
    $_SESSION['uploads_dir'] = 'uploads'; // 临时文件存放
    $uploads_dir = 'uploads';
    if(!move_uploaded_file($tmpName, "$uploads_dir/$name")) { // 读取文件数据
        var_dump('Failed to move');
    }
        ?>
        <button class="submit"  type="submit">确定</button>
    </form>
</div>
</body>
</html>
