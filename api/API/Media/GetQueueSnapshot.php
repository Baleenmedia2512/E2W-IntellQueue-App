<?php
require 'ConnectionManager.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['JsonDBName'], $data['JsonRateCard'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
        exit;
    }
    $dbName = $data['JsonDBName'];
    $rateCard = $data['JsonRateCard'];
    $currentId = $data['currentId'] ?? null;

    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    if ($currentId) {
        // If we have an ID, get that exact snapshot
        $query = "SELECT * FROM queue_history_table 
                 WHERE RateCard = ? 
                 AND ID = ? 
                 AND DATE(TimeStamp) = CURRENT_DATE";
        $params = [$rateCard, $currentId];
    } else {
        // If no ID provided, get the latest snapshot
        $query = "SELECT * FROM queue_history_table 
                 WHERE RateCard = ? 
                 AND DATE(TimeStamp) = CURRENT_DATE 
                 ORDER BY ID DESC LIMIT 1";
        $params = [$rateCard];
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        echo json_encode([
            'success' => true, 
            'snapshot' => json_decode($row['QueueSnapshot'], true), 
            'id' => $row['ID']
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'No snapshot found.'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>