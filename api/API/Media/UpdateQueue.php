<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

try {
    ConnectionManager::connect('Baleen Test');
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$currentOrder = $data['currentOrder'] ?? null;
$nextOrder = $data['nextOrder'] ?? null;

if (!$currentOrder) {
    echo json_encode(['error' => 'Current order is required.']);
    exit();
}

try {
    // Update the current order to "Closed"
    $query = "UPDATE order_table SET QueueStatus = 'Closed' WHERE OrderNumber = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$currentOrder]);

    // Update the next order to "Served" if provided
    if ($nextOrder) {
        $query = "UPDATE order_table SET QueueStatus = 'Served' WHERE OrderNumber = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$nextOrder]);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
