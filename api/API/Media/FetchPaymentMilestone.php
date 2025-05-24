<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $orderId = isset($_GET['JsonOrderNumber']) ? $_GET['JsonOrderNumber'] : null;

    // Handle case where finance ID is not provided
    if($orderId){
        $stmtPayment = $pdo->prepare("SELECT * FROM `payment_milestone_table` WHERE OrderNumber = :orderNumber");
        $stmtPayment->bindParam(':orderNumber', $orderId, PDO::PARAM_INT);
        $stmtPayment->execute();

        $result = $stmtPayment->fetchAll(PDO::FETCH_ASSOC);  // Fetch all rows as associative array
        echo json_encode($result);
    }else{
        echo json_encode(["error" => "No finance ID provided"]);
    }
        
} catch (Exception $e) {
    // Catch and display exceptions
    echo json_encode(["error" => $e->getMessage()]);
}