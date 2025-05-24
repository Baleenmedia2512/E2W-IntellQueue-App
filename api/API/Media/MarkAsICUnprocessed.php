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

// Retrieve order numbers from the query parameters
$orderNumbers = isset($_GET['JsonOrderNumber']) ? explode(',', $_GET['JsonOrderNumber']) : [];

if (empty($orderNumbers)) {
    echo json_encode(['error' => 'No order numbers provided.']);
    exit();
}

try {
    // Begin a transaction to ensure data integrity
    $pdo->beginTransaction();

    // Prepare the SQL statement to update the orders
    $query = "UPDATE order_table SET IncentiveProcessedOn = '0000-00-00' WHERE OrderNumber IN (" . implode(',', array_fill(0, count($orderNumbers), '?')) . ")";

    $stmt = $pdo->prepare($query);
    $stmt->execute($orderNumbers);

    // Commit the transaction
    $pdo->commit();

    // Return a success message
    echo json_encode(['success' => 'Orders marked as unprocessed successfully.']);
} catch (Exception $e) {
    // Roll back the transaction if something went wrong
    $pdo->rollBack();
    echo json_encode(['error' => "Failed to mark orders as unprocessed: " . $e->getMessage()]);
}

// Close the database connection
$pdo = null;
?>
