<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $RateId = $_GET['JsonRateId'];
    $Qty = $_GET['JsonQty'];
    $Width = isset($_GET['JsonWidth']) ? $_GET['JsonWidth'] : 1;

    $stmt = $pdo->prepare("UPDATE rates_qty_slab_table SET `Validity` = 0 WHERE `RateId` = :RateIdPDO AND `StartQty` = :StartQtyPDO AND `Width` = :PDOWidth");
    $stmt->bindParam(":RateIdPDO", $RateId);
    $stmt->bindParam(":StartQtyPDO", $Qty);
    $stmt->bindParam(':PDOWidth', $Width);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode("Updated Successfully!");
    } else {
        echo json_encode("No rows updated");
    }
}catch(PDOException $e){
    echo json_encode("Error inserting data: ".$e->getMessage());
}