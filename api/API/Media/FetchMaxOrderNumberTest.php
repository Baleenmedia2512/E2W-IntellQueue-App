<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Fetch the RateName from the request
    $RateName = isset($_GET['JsonRateName']) ? $_GET['JsonRateName'] : '';

    // Fetch the latest order number for the given RateName
    $stmtRateWise = $pdo->prepare("SELECT RateWiseOrderNumber AS NextRateWiseOrderNumber FROM order_table WHERE Card = :RateName AND RateWiseOrderNumber > 0 ORDER BY OrderNumber DESC LIMIT 1;");
    $stmtRateWise->bindParam(':RateName', $RateName);
    $stmtRateWise->execute();
    $resultRateWise = $stmtRateWise->fetch(PDO::FETCH_ASSOC);
    $nextRateWiseOrderNumber = $resultRateWise['NextRateWiseOrderNumber'] ? $resultRateWise['NextRateWiseOrderNumber'] : 1;
    // $rateWiseOrderNumber = $RateName . '-' . $nextRateWiseOrderNumber;

    // Fetch the next general order number from the order_table
    $stmtGeneral = $pdo->prepare("SELECT MAX(OrderNumber) + 1 AS NextOrderNumber FROM order_table WHERE OrderNumber < 100000");
    $stmtGeneral->execute();
    $resultGeneral = $stmtGeneral->fetch(PDO::FETCH_ASSOC);
    $nextGeneralOrderNumber = $resultGeneral['NextOrderNumber'] ? $resultGeneral['NextOrderNumber'] : 1;

    // Return both values as a JSON object
    $response = [
        'nextOrderNumber' => $nextGeneralOrderNumber,
        'nextRateWiseOrderNumber' => $nextRateWiseOrderNumber
    ];
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode("Error fetching order numbers: " . $e->getMessage());
}
?>
