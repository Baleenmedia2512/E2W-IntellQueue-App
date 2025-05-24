<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

$showProcessedConsultantsOnly = filter_var($_GET['JsonShowIcProcessedConsultantsOnly'], FILTER_VALIDATE_BOOLEAN);
$start_date = isset($_GET['JsonStartDate']) ? $_GET['JsonStartDate'] : '';
$end_date = isset($_GET['JsonEndDate']) ? $_GET['JsonEndDate'] : '';

if ($start_date && $end_date) {
    $queryBase = "";

    if ($showProcessedConsultantsOnly) {
        $queryBase .= "SELECT ROW_NUMBER() OVER (ORDER BY o.ConsultantName, o.Card, o.AdType) AS id, 
                        o.ConsultantName AS name, 
                        o.Card AS rateCard, 
                        o.AdType AS rateType,
                        o.Commission AS price,
                        o.OrderNumber AS orderNumber,
                        o.ClientName AS clientName,
                        o.RateWiseOrderNumber AS rateWiseOrderNumber,
                        o.ConsultantId
                        FROM order_table o 
                        WHERE o.OrderDate BETWEEN :startDate AND :endDate
                       AND o.ConsultantName != ''
                       AND o.OrderNumber > 0
                       AND o.CancelFlag = 0
                       AND o.Commission != 0
                       AND o.IncentiveProcessedOn != '0000-00-00'
                       GROUP BY o.OrderNumber
                       ORDER BY name, rateCard, rateType;";
    } else {
        $queryBase .= "SELECT 
                        ROW_NUMBER() OVER (ORDER BY o.ConsultantName, o.Card, o.AdType) AS id, 
                        o.ConsultantName AS name, 
                        o.Card AS rateCard, 
                        o.AdType AS rateType,
                        o.Commission AS price,
                        o.OrderNumber AS orderNumber,
                        o.ClientName AS clientName,
                        o.RateWiseOrderNumber AS rateWiseOrderNumber,
                        o.ConsultantId
                    FROM order_table o
                    JOIN financial_transaction_table ftt ON o.OrderNumber = ftt.OrderNumber
                    WHERE o.OrderDate BETWEEN :startDate AND :endDate
                        AND o.ConsultantName != ''
                        AND o.OrderNumber > 0
                        AND o.CancelFlag = 0
                        AND o.Commission != 0
                        AND o.IncentiveProcessedOn = '0000-00-00'
                        AND ftt.ValidStatus = 'Valid'
                    GROUP BY o.OrderNumber
                    ORDER BY name, rateCard, rateType;";
    }

    $stmt = $pdo->prepare($queryBase);
    $stmt->bindParam(':startDate', $start_date, PDO::PARAM_STR);
    $stmt->bindParam(':endDate', $end_date, PDO::PARAM_STR);
    $stmt->execute();
    $orderDetails = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($orderDetails);
} else {
    echo json_encode(['error' => 'No valid date range provided.']);
}

// Close the database connection
$pdo = null;
?>
