<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $cid = isset($_GET['JsonCID']) ? $_GET['JsonCID'] : '';
    $consultantName = isset($_GET['JsonConsultantName']) ? $_GET['JsonConsultantName'] : '';
    $rateCard = isset($_GET['JsonRateCard']) ? $_GET['JsonRateCard'] : '';
    $rateType = isset($_GET['JsonRateType']) ? $_GET['JsonRateType'] : '';
    $unitPrice = isset($_GET['JsonUnitPrice']) ? $_GET['JsonUnitPrice'] : '';
    $incentiveProcessedOn = isset($_GET['JsonIncentiveProcessedOn']) ? $_GET['JsonIncentiveProcessedOn'] : date('Y-m-d H:i:s'); // Default to current date and time

    $stmt = $pdo->prepare("INSERT INTO commission_table (`CID`, `ConsultantName`, `RateCard`, `RateType`, `UnitPrice`, `IncentiveProcessedOn`) VALUES (:PDOcid, :PDOConsultantName, :PDORateCard, :PDORateType, :PDOUnitPrice, :PDOIncentiveProcessedOn)");
    $stmt->bindParam(':PDOcid', $cid);
    $stmt->bindParam(':PDOConsultantName', $consultantName);
    $stmt->bindParam(':PDORateCard', $rateCard);
    $stmt->bindParam(':PDORateType', $rateType);
    $stmt->bindParam(':PDOUnitPrice', $unitPrice);
    $stmt->bindParam(':PDOIncentiveProcessedOn', $incentiveProcessedOn);

    // Execute the query
    $stmt->execute();
    echo json_encode("Values Inserted Successfully!");
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data:  " . $e->getMessage());
}
?>
