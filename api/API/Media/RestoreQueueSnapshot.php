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
    $snapshot = $data['JsonSnapshot'];

    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Mark all current queue_table entries for this rateCard for today as Deleted
    $stmt = $pdo->prepare("UPDATE queue_table SET Status = 'Deleted', QueueIndex = 0 WHERE RateCard = ? AND DATE(EntryDateTime) = CURRENT_DATE");
    $stmt->execute([$rateCard]);

    // Insert or update all from snapshot
    foreach ($snapshot as $client) {
      try {

                // If no row updated, try insert
                $stmt = $pdo->prepare("INSERT INTO queue_table (ID, QueueIndex, EntryDateTime, ClientName, ClientContact, RateCard, RateType, Status, Remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $client['queueIndex'],
                    $client['entryDateTime'],
                    $client['name'],
                    $client['contact'],
                    $client['rateCard'],
                    $client['rateType'],
                    $client['status'],
                    $client['remarks']
                ]);
        } catch (PDOException $e) {
            // If an error occurs for this client, record it
            $errors[] = [
                'id' => $client['id'],
                'error' => $e->getMessage()
            ];
        }
    }

    if (empty($errors)) {
        echo json_encode(['success' => true, 'message' => 'All records processed successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Some records failed.', 'errors' => $errors]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>