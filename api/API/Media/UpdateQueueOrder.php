<?php
require 'ConnectionManager.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['JsonDBName'], $data['JsonRateCard'], $data['JsonQueueOrder'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
        exit;
    }

    $dbName = $data['JsonDBName'];
    $rateCard = $data['JsonRateCard'];
    $queueOrder = $data['JsonQueueOrder'];

    if (!is_array($queueOrder) || empty($queueOrder)) {
        echo json_encode(['success' => false, 'message' => 'Queue order must be a non-empty array.']);
        exit;
    }

    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // // First, set all clients in this rateCard to Waiting except On-Hold
    // $stmtReset = $pdo->prepare("UPDATE queue_table SET Status = 'Waiting' WHERE RateCard = ? AND Status != 'On-Hold'");
    // $stmtReset->execute([$rateCard]);

    // Now, update QueueIndex and Status for each item in the new order
    foreach ($queueOrder as $idx => $item) {
        if (!isset($item['queueIndex'], $item['id'], $item['status'])) {
            echo json_encode(['success' => false, 'message' => 'Each queue item must have id, queueIndex, and status.']);
            exit;
        }
        $stmt = $pdo->prepare("UPDATE queue_table SET QueueIndex = ?, Status = ? WHERE ID = ? AND RateCard = ?");
        $stmt->execute([$item['queueIndex'], $item['status'], $item['id'], $rateCard]);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>