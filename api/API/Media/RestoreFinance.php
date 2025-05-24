<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $id = $_GET['JsonID'];
    $rateWiseOrderNumber = isset($_GET['JsonRateWiseOrderNumber']) ? $_GET['JsonRateWiseOrderNumber'] : null;

    if ($id) {
        if (empty($rateWiseOrderNumber) || $rateWiseOrderNumber == 0) {
            // Set ValidStatus to 'Valid' when RateWiseOrderNumber is empty or 0
            $stmt = $pdo->prepare("UPDATE financial_transaction_table 
                                   SET ValidStatus = 'Valid' 
                                   WHERE ID = :ID");
            $stmt->bindParam(':ID', $id);
            $stmt->execute();

            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                echo json_encode(['success' => true, 'message' => 'Transaction updated with ValidStatus only.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No Transaction updated.']);
            }
        } else {
            // Update ValidStatus to 'Valid' and RateWiseOrderNumber to positive value
            $stmt = $pdo->prepare("UPDATE financial_transaction_table 
                                   SET ValidStatus = 'Valid', 
                                       RateWiseOrderNumber = ABS(:RateWiseOrderNumber) 
                                   WHERE ID = :ID");
            $stmt->bindParam(':ID', $id);
            $stmt->bindParam(':RateWiseOrderNumber', $rateWiseOrderNumber);
            $stmt->execute();

            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                echo json_encode(['success' => true, 'message' => 'Transaction restored successfully with positive RateWiseOrderNumber.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No Transaction restored.']);
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Finance ID not provided.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
