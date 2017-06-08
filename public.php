<?php
/**
 * Created by PhpStorm.
 * User: Zhou Yushan
 * Date: 2017/5/10
 * Time: 19:00
 */

error_reporting(E_ERROR);

//ini_set("display_errors","Off");

session_start();
//mysqli_report(MYSQLI_ASSOC);
mysqli_report(MYSQLI_REPORT_ERROR);
$db = mysqli_connect('localhost', 'test', '', 'bank'); //the last is the name od database

if ($db->connect_errno)
{
    echo json_encode(array(
        'success' => false,
        'message' => "Error occurred while processing your request: $db->connect_error. Please contact me to do me a favor~"
    ));
    exit;
}
