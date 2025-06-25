<?php
require 'ConnectionManager.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required input
    if (!isset($data['JsonDBName'], $data['JsonRateCard'], $data['JsonSnapshot'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
        exit;
    }

    $dbName = $data['JsonDBName'];
    $rateCard = $data['JsonRateCard'];
    $snapshot = $data['JsonSnapshot'];

    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $errors = [];
    $processed = 0;

    foreach ($snapshot as $client) {
        try {
            // Validate required fields: queueIndex, status, id
            if (!isset($client['queueIndex'], $client['status'], $client['id'])) {
                $errors[] = [
                    'id' => $client['id'] ?? null,
                    'error' => 'Missing required fields: queueIndex, status, or id.'
                ];
                continue;
            }

            // Update the row with matching ID
            // Handle CompletedOn (set to NULL if not present or null)
            $procedureCompleteTime = array_key_exists('procedureCompleteTime', $client) ? $client['procedureCompleteTime'] : null;
            $queueInTime = array_key_exists('queueInTime', $client) ? $client['queueInTime'] : null;
            $queueOutTime = array_key_exists('queueOutTime', $client) ? $client['queueOutTime'] : null;

            $updateStmt = $pdo->prepare("
                UPDATE queue_table 
                SET QueueIndex = ?, Status = ?, ProcedureCompleteTime = ?, QueueInTime = ?, QueueOutTime = ?
                WHERE ID = ?
            ");
            $updateStmt->execute([
                $client['queueIndex'],
                $client['status'],
                $procedureCompleteTime,
                $queueInTime,
                $queueOutTime, // PDO will set to SQL NULL if this is PHP null
                (int)$client['id']
            ]);

            if ($updateStmt->rowCount() > 0) {
                $processed++;
            } else {
                $errors[] = [
                    'id' => $client['id'],
                    'error' => 'No matching record found to update.'
                ];
            }

        } catch (PDOException $e) {
            $errors[] = [
                'id' => $client['id'],
                'error' => $e->getMessage()
            ];
        }
    }

    if (empty($errors)) {
        echo json_encode(['success' => true, 'message' => "Successfully updated $processed records."]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => "Updated $processed records, with errors.",
            'errors' => $errors
        ]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
