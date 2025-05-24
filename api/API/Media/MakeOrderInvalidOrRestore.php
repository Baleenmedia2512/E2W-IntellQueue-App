<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    if (isset($_GET['OrderNumber']) && isset($_GET['Action'])) {
        $orderNumber = $_GET['OrderNumber'];
        $action = $_GET['Action']; // 'invalid' or 'restore'

        $stmt = null;

        // Update order_table based on action
        if ($action === 'invalid') {
            $stmt = $pdo->prepare("UPDATE order_table SET CancelFlag = 1 WHERE OrderNumber = :OrderNumber");
        } elseif ($action === 'restore') {
            $stmt = $pdo->prepare("UPDATE order_table SET CancelFlag = 0 WHERE OrderNumber = :OrderNumber");
        }

        if ($stmt) {
            $stmt->bindParam(':OrderNumber', $orderNumber);
            $stmt->execute();

            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                echo json_encode(['success' => true, 'message' => 'Order ' . ($action === 'invalid' ? 'marked as invalid' : 'restored') . ' successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'No order ' . ($action === 'invalid' ? 'marked as invalid' : 'restored') . '.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid action specified.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'OrderNumber or Action not provided.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
