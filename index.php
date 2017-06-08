<?php
/**
 * Created by PhpStorm.
 * User: Zhou Yushan
 * Date: 2017/5/10
 * Time: 15:33
 */
require_once 'public.php';
// 默认页面
?>

<!DOCTYPE html>
<meta charset="utf-8">
<style>
</style>
<body>
<form enctype="multipart/form-data" action="inDataTypeSelection.php" method="post">
    <input type="file" name="import-data">
    <button type="submit">上传数据</button>
    注：上传数据文件名内请去除空格
</form>