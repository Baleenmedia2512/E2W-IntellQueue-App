<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $rateWiseOrderNumber = $_GET['JsonRateWiseOrderNumber'];
    $orderNumber = $_GET['JsonOrderNumber'];

    if ($rateWiseOrderNumber) {
        
        $financeStmt = $pdo->prepare("SELECT COUNT(OrderNumber) FROM financial_transaction_table WHERE OrderNumber = :OrderNumber AND ValidStatus = 'Valid'");
        $financeStmt->bindParam(':OrderNumber', $orderNumber);
        $financeStmt->execute();

        $financeRowCount = $financeStmt->fetchColumn();

        if ($financeRowCount > 0) {
            echo json_encode(['success' => false, 'message' => 'There is finance entry on this order.']);
        } else {
            $orderStmt = $pdo->prepare("UPDATE order_table SET RateWiseOrderNumber = -:RateWiseOrderNumber, CancelFlag = 1 WHERE OrderNumber = :OrderNumber");
            $orderStmt->bindParam(':RateWiseOrderNumber', $rateWiseOrderNumber);
            $orderStmt->bindParam(':OrderNumber', $orderNumber);
            $orderStmt->execute();

            $rowCount = $orderStmt->rowCount();

            if ($rowCount > 0) {
                echo json_encode(['success' => true, 'message' => 'Order deleted successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No order deleted.']);
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Order Number not provided.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
