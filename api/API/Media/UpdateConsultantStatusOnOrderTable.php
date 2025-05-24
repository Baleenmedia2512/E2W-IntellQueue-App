<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
$orderNumbers = isset($_GET['JsonOrderNumbers']) ? explode(',', $_GET['JsonOrderNumbers']) : [];
$currentDate = date('Y-m-d'); // Get current date in YYYY-MM-DD format

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

if (!empty($orderNumbers)) {
    $affectedRows = 0;

    try {
        $stmt = $pdo->prepare("UPDATE order_table SET IncentiveProcessedOn = :currentDate WHERE OrderNumber = :orderNumber");
        $stmt->bindValue(':currentDate', $currentDate, PDO::PARAM_STR);

        foreach ($orderNumbers as $orderNumber) {
            $stmt->bindValue(':orderNumber', $orderNumber, PDO::PARAM_INT);
            $stmt->execute();
            $affectedRows += $stmt->rowCount(); // Increment affected rows for each update
        }

        if ($affectedRows > 0) {
            echo json_encode(['success' => "$affectedRows order(s) updated successfully."]);
        } else {
            echo json_encode(['error' => 'No orders were updated.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => "Update failed: " . $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'No order numbers provided.']);
}

// Close the database connection
$pdo = null;
?>
