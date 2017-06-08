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

$fileName = realpath('./'.$_SESSION['uploads_dir'].'/'.$_SESSION['fileName']); // 得到待上传文件的原始路径
$fileName = str_replace('\\','/',$fileName); // 替换斜杠
$handle = fopen($fileName, "r"); // 打开文件
// Read first (headers) record only)
$data = fgetcsv($handle, 1000, ",");
$_SESSION['attrAllType'] = [];
?>
<html>
<head>
    <title>选择最多九个属性</title>
    <script src="jquery-3.2.1.min.js"></script>
</head>
<body>
    <?php
    // 读取文件的第一行：属性名字
    $check = 'select TABLE_NAME from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=\'csv_db\' and TABLE_NAME=\'tmpdata\'';
    $res = $db->query($check);
    if($res){
        if($res->num_rows > 0) { // 如果在服务器端的数据库中相应表有内容，则清空删除表。
            $sql= 'DROP TABLE tmpdata'; // 删除表
            $res = $db->query($sql);
            if($res == false)
                var_dump($db->error);
        }
    }
    else
        var_dump($db->error);

    $sql= 'CREATE TABLE tmpdata ('; // 编写建立表格的sql语句
    for($i=0;$i<count($data); $i++) { // $data里存放的是属性名
        if($i > 0)
            $sql .= ', ';
        $sql .= '`'.$data[$i].'` '.$_POST[$data[$i]]; // $_POST存放的是，上一个页面被选择的属性类型
        $_SESSION[$data[$i].'__TypeName'] = $_POST[$data[$i]]; // 将被选择的属性类型存放在SESSION里待复用
    }

    $_SESSION['attrAllType'] = $_POST; // 将被选择的属性及其类型，这个包含所有以属性为键，类型为值的键值对的对象，存放在SESSION里待复用
    $sql .= ')';

    $res = $db->query($sql);
    if($res == false) {
        var_dump("Failed to create table\n\n");
        var_dump($db->error);
    }
    else { // 从文件路径读取数据到表中，文件为csv格式故分隔符为','，每行以'\n'结尾，由于第一行为属性名故省略
        $query = <<<eof
    LOAD DATA INFILE '$fileName'
    INTO TABLE tmpdata
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    IGNORE 1 LINES 
eof;
    $res = $db->query($query);
    if($res == false) {
        var_dump("Falied to load data\n\n");
        var_dump($fileName."\n".$db->error);
    } else { ?>
        <form id="poll" name="poll" enctype="multipart/form-data" action="data-default.php" method="post">
            成功导入数据。选择属性进入可视化页面（最多选择9项）。 <br>
            <?php
            for($i=0;$i<count($data); $i++) { ?>
                <label><input class="checkbox" type="checkbox" name="attr[]" value="<?=$data[$i]?>" onclick="checkbox(this)"><?=$data[$i]?></label><br>
            <?php } ?>
            <button class="submit" type="submit" name="pollsubmit" id="pollsubmit">提交</button>

        </form>

        <script type="text/javascript">
            //return document.getElementById(id);
            var max_obj = 9;//最多可以选择九项进入可视化页面
            var p = 0;
            function checkbox(obj) {
                if (obj.checked) {
                    p++;
                    $('#poll .checkbox').each(function () {
                        if (p == max_obj) { // 如果已达到了属性选择数目，则对于其余未被选中的属性采取禁用操作
                            if (!this.checked) {
                                this.disabled = true;
                            }
                        }
                    });
                } else {
                    p--;
                    $('#poll .checkbox').each(function () {
                        if (!this.checked && this.disabled) {// 如果未达到了属性选择数目，则对于其余未被选中的属性采取解禁用操作
                            this.disabled = false;
                        }
                    });
                }
                $('#pollsubmit').prop("disabled", p <= max_obj && p > 0 ? false : true);
            }
        </script>
        <script>
            //        setTimeout(function () {
            //            location.href = "data-default.php";
            //        }, 1000);
        </script>
    <?php }
    }
    fclose($handle); ?>
</body>
</html>

