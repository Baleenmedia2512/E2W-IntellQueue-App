<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    if (isset($_GET['OrderNumber'])) {
        $orderNumber = $_GET['OrderNumber'];
        $rateWiseOrderNumber = $_GET['JsonRateWiseOrderNumber'];
        $rateCard = $_GET['RateCard'];
        $checkRateWiseOrderNumber = filter_var($_GET['CheckRateWiseOrderNumber'], FILTER_VALIDATE_BOOLEAN);
        $positiveRateWiseOrderNumber = abs($rateWiseOrderNumber); // Convert to positive for checking

        if ($checkRateWiseOrderNumber) {
            // Check if the RateWiseOrderNumber is already in use
            $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM order_table WHERE RateWiseOrderNumber = :PositiveRateWiseOrderNumber AND Card = :RateCard");
            $checkStmt->bindParam(':PositiveRateWiseOrderNumber', $positiveRateWiseOrderNumber);
            $checkStmt->bindParam(':RateCard', $rateCard);
            $checkStmt->execute();
            $count = $checkStmt->fetchColumn();

            if ($count > 0) {
                // RateWiseOrderNumber is already in use, return a conflict message
                echo json_encode([
                    'success' => false,
                    'message' => 'RateWiseOrderNumber is already occupied.',
                    'conflict' => true
                ]);
                exit;
            }
        }

        // Update order_table to restore the order
        $stmt = $pdo->prepare("UPDATE order_table SET CancelFlag = 0, RateWiseOrderNumber = :PositiveRateWiseOrderNumber WHERE OrderNumber = :OrderNumber");

        if ($stmt) {
            $stmt->bindParam(':OrderNumber', $orderNumber);
            $stmt->bindParam(':PositiveRateWiseOrderNumber', $positiveRateWiseOrderNumber);
            $stmt->execute();

            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Order restored successfully.'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'No order restored'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid OrderNumber specified.'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'OrderNumber not provided.'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
