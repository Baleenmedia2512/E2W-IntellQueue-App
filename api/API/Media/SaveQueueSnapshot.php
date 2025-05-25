<?php
require 'ConnectionManager.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['JsonDBName'], $data['JsonRateCard'], $data['JsonSnapshot'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
        exit;
    }
    $dbName = $data['JsonDBName'];
    $rateCard = $data['JsonRateCard'];
    $snapshot = json_encode($data['JsonSnapshot']);
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $stmt = $pdo->prepare("INSERT INTO queue_history_table (RateCard, QueueSnapshot, TimeStamp) VALUES (?, ?, NOW())");
    $stmt->execute([$rateCard, $snapshot]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>