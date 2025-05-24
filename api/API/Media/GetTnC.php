<?php
require "ConnectionManager.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$pdo = "";

try{
    $DBName = $_GET['JsonDBName'];

    ConnectionManager::connect($DBName);
    $pdo = ConnectionManager::getConnection();
}catch (\Throwable $th) {
    error_log("Connection Error: " .$th->getMessage(), 3,  './db_error.txt');
    echo json_encode("Unable to connect to DB");
}

try{
    $Medium = isset($_GET['JsonMedium']) ? $_GET['JsonMedium'] : 'Common';
    $ComChannel = isset($_GET['JsonComChannel']) ? $_GET['JsonComChannel'] : "Quote";
    $stmt = $pdo->prepare("SELECT `ID`, `Message` FROM `tnc_table` WHERE `IsValid` = 1 AND `Medium` = :PDOMedium AND ComChannel = :PDOComChannel");
    $stmt->execute([":PDOMedium" => $Medium, ":PDOComChannel" => $ComChannel]);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result);
}catch(PDOException $e){
    error_log("Unable to Search data: ".$e->getMessage(), 3, './search_error.txt');
    echo json_encode("Failed to fetch");
}