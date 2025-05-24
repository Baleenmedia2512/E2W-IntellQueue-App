<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Fetch the next general order number from the order_table
    $stmtGeneral = $pdo->prepare("SELECT MAX(OrderNumber) + 1 AS NextOrderNumber FROM order_table WHERE OrderNumber < 100000");
    $stmtGeneral->execute();
    $resultGeneral = $stmtGeneral->fetch(PDO::FETCH_ASSOC);
    $nextGeneralOrderNumber = $resultGeneral['NextOrderNumber'] ?? 1;

    // Return the value as a JSON object
    $response = [
        'nextOrderNumber' => $nextGeneralOrderNumber,
    ];
    header('Content-Type: application/json');
    echo json_encode($response);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => "Error fetching order numbers: " . $e->getMessage()]);
}
?>
