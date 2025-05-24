<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $id = $_GET['JsonID'];
    $rateWiseOrderNumber = $_GET['JsonRateWiseOrderNumber'];

    if ($id) {
        
        // Subtract RateWiseOrderNumber from 0 to make it negative
        $financeStmt = $pdo->prepare("UPDATE financial_transaction_table 
                                        SET RateWiseOrderNumber = -:RateWiseOrderNumber, 
                                            ValidStatus = 'Invalid' 
                                        WHERE ID = :ID;
                                        ");
        $financeStmt->bindParam(':ID', $id);
        $financeStmt->bindParam(':RateWiseOrderNumber', $rateWiseOrderNumber);
        $financeStmt->execute();

        $financeRowCount = $financeStmt->rowCount();

        if ($financeRowCount > 0) {
            echo json_encode(['success' => true, 'message' => 'Transaction deleted successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No Transaction deleted.']);
        }
        
    } else {
        echo json_encode(['success' => false, 'message' => 'ID not provided.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
