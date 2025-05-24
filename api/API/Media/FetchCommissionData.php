<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    // Get parameters from the request
    $dbName = isset($_GET['JsonDBName']) ? trim($_GET['JsonDBName']) : 'Baleen Test';
    $consultantName = isset($_GET['JsonConsultantName']) ? trim($_GET['JsonConsultantName']) : '';
    $rateName = isset($_GET['JsonRateName']) ? trim($_GET['JsonRateName']) : '';
    $rateType = isset($_GET['JsonRateType']) ? trim($_GET['JsonRateType']) : '';

    // Check if mandatory parameters are provided
    if (empty($dbName) || empty($rateName) || empty($rateType)) {
        echo json_encode(['error' => 'Missing required parameters: JsonDBName, JsonRateName, or JsonRateType']);
        exit();
    }

    // Connect to the database
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Enable exception mode for debugging

    // Primary SQL query
    $sql = "SELECT Commission 
            FROM order_table 
            WHERE Commission > 0 AND IsCommissionAmountSingleUse = 0 AND CancelFlag = 0 AND OrderNumber > 0
            AND Card = :rateCard AND AdType = :rateType AND ConsultantName = :consultantName 
            ORDER BY IncentiveProcessedOn, OrderNumber DESC LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':rateCard', $rateName);
    $stmt->bindParam(':rateType', $rateType);
    $stmt->bindParam(':consultantName', $consultantName);

    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // Fallback query
    if (!$result || !isset($result['Commission'])) {
        $sqlFallback = "SELECT Commission 
                        FROM order_table 
                        WHERE Commission > 0 AND IsCommissionAmountSingleUse = 0 AND CancelFlag = 0 AND OrderNumber > 0
                        AND Card = :rateCard AND AdType = :rateType 
                        ORDER BY IncentiveProcessedOn, OrderNumber DESC LIMIT 1";

        $stmtFallback = $pdo->prepare($sqlFallback);
        $stmtFallback->bindParam(':rateCard', $rateName);
        $stmtFallback->bindParam(':rateType', $rateType);

        $stmtFallback->execute();
        $result = $stmtFallback->fetch(PDO::FETCH_ASSOC);
    }

    // Return the result
    if ($result && isset($result['Commission'])) {
        echo json_encode(['Commission' => $result['Commission']]);
    } else {
        echo json_encode(['error' => 'No data found for the given parameters', 'parameters' => $_GET]);
    }

    // Close the connection
    $pdo = null;
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit();
}
