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
        
        // Check if the order has financial entries
        $financeStmt = $pdo->prepare("SELECT COUNT(OrderNumber) FROM financial_transaction_table WHERE OrderNumber = :OrderNumber AND ValidStatus = 'Valid'");
        $financeStmt->bindParam(':OrderNumber', $orderNumber);
        $financeStmt->execute();

        $financeRowCount = $financeStmt->fetchColumn();

        if ($financeRowCount > 0) {
            echo json_encode(['success' => false, 'message' => 'There is finance entry on this order.']);
        } else {
            // Get the OrderDate, ClientName, and ClientContact to compare and pass to procedure
            $dateStmt = $pdo->prepare("SELECT OrderDate, ClientName, ClientContact FROM order_table WHERE OrderNumber = :OrderNumber");
            $dateStmt->bindParam(':OrderNumber', $orderNumber);
            $dateStmt->execute();
            $orderData = $dateStmt->fetch(PDO::FETCH_ASSOC);

            if (!$orderData) {
                echo json_encode(['success' => false, 'message' => 'Order not found.']);
                exit;
            }

            $orderDate = $orderData['OrderDate'];
            $clientName = $orderData['ClientName'];
            $clientContact = $orderData['ClientContact'];

            $isToday = ($orderDate === date('Y-m-d'));

            // Cancel the order
            $orderStmt = $pdo->prepare("UPDATE order_table SET RateWiseOrderNumber = -:RateWiseOrderNumber, CancelFlag = 1 WHERE OrderNumber = :OrderNumber");
            $orderStmt->bindParam(':RateWiseOrderNumber', $rateWiseOrderNumber);
            $orderStmt->bindParam(':OrderNumber', $orderNumber);
            $orderStmt->execute();

            $rowCount = $orderStmt->rowCount();

            if ($rowCount > 0) {
                // Only call the procedure if orderDate is today
                if ($isToday) {
                    $procedureStmt = $pdo->prepare("CALL cancel_order_and_reorder_queue(:clientName, :clientContact)");
                    $procedureStmt->bindParam(':clientName', $clientName);
                    $procedureStmt->bindParam(':clientContact', $clientContact);
                    $procedureStmt->execute();
                }

                echo json_encode(['success' => true, 'message' => 'Order deleted successfully.' . ($isToday ? ' Queue updated.' : '')]);
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
