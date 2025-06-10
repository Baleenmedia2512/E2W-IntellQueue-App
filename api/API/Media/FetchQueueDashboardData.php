<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Fetch today's queue entries
    $stmt = $pdo->prepare("
        SELECT 
            * 
        FROM 
            queue_table 
        WHERE 
            DATE(EntryDateTime) = CURRENT_DATE
            AND Status NOT IN ('Remote')
    ");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $formattedData = array_map(function ($row) {
        // Convert time to 12-hour format (e.g., 10:30 AM)
        $inTime = date("g:i A", strtotime($row['EntryDateTime']));

        return [
            'id' => (string) $row['ID'],
            'name' => $row['ClientName'],
            'rateType' => $row['RateType'],
            'rateCard' => $row['RateCard'],
            'queueIndex' => (int) $row['QueueIndex'],
            'inTime' => $inTime,
            'contact' => $row['ClientContact'],
            'status' => $row['Status'],
            'entryDateTime' => $row['EntryDateTime'],
            'remarks' => $row['Remarks'],
            'fcmToken' => $row['FcmToken'],
        ];
    }, $rows);

    echo json_encode([
        'success' => true,
        'data' => $formattedData
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database Error: ' . $e->getMessage()
    ]);
}
?>
