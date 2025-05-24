<?php

require "ConnectionManager.php";

header("Access-Control-Allow-Origin:*");
header("Access-Control-Allow-Headers:*");

$DBName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : null;
$ClientContact = isset($_GET['JsonClientContact']) ? $_GET['JsonClientContact'] : null;
$ClietID = isset($_GET['JsonClientID']) ? $_GET['JsonClientID'] : null;

if (empty($DBName) ) {
    echo json_encode(["success" => false, "message" => "No valid Company Name provided"]);
    exit;
}

if(empty($ClientContact) && empty($ClientID)){
    echo json_encode(["success" => false, "message" => "Either client ID and Client Contact is required!"]);
    exit;
}

ConnectionManager::connect($DBName);
$pdo = ConnectionManager::getConnection();

try{
    if(!empty($ClientContact)){
        $sql = "SELECT `OrderNumber`, `AdType`, `DateOfLastRelease` FROM order_table WHERE ClientContact = :ClientContactPDO AND `CancelFlag` = 0";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':ClientContactPDO' => $ClientContact]);
        $clientOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($clientOrders) {
            echo json_encode(["success" => true, "data" => $clientOrders]);
        } else {
            echo json_encode(["success" => false, "message" => "No records found for the given client"]);
        }
        exit;
    } else{
        $sql = "SELECT `OrderNumber`, `AdType`, `DateOfLastRelease` FROM order_table WHERE ClientContact = (SELECT ClientContact FROM client_table WHERE ID = :ClientIDPDO) AND `CancelFlag` = 0";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':ClientIDPDO' => $ClientID]);
        $clientOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($clientOrders) {
            echo json_encode(["success" => true, "data" => $clientOrders]);
        } else {
            echo json_encode(["success" => false, "message" => "No records found for the given client"]);
        }
        exit;
    }
}catch(Exception $e ){
    http_response_code(500);
    $response = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
    echo json_encode($response);
}