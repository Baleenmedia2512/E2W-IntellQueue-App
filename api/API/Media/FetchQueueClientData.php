<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header('Content-Type: application/json');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

$ClientContact = isset($_GET['JsonClientContact']) ? $_GET['JsonClientContact'] : null;

if (!$ClientContact) {
    echo json_encode(['error' => 'Client Contact is required.']);
    exit();
}

try {
    $currentDate = date('Y-m-d');
    
    // Find the current user's RateCard, QueueIndex, EntryDateTime, and Status
    $userQuery = "SELECT RateCard, QueueIndex, EntryDateTime, Status FROM queue_table 
                  WHERE ClientContact = ? AND DATE(EntryDateTime) = ? 
                  ORDER BY ID DESC LIMIT 1";
    $userStmt = $pdo->prepare($userQuery);
    $userStmt->execute([$ClientContact, $currentDate]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['error' => 'Client not found in the queue.']);
        exit();
    }

    $rateCard = $user['RateCard'];
    $clientQueueIndex = (int)$user['QueueIndex'];
    $entryDateTime = $user['EntryDateTime'];
    $status = $user['Status'];

    // Get all records for the same RateCard and eligible status
    $queueQuery = "SELECT QueueIndex, ClientContact, EntryDateTime FROM queue_table 
                   WHERE RateCard = ? AND DATE(EntryDateTime) = ? AND Status IN ('Waiting', 'In-Progress', 'On-Hold')
                   ORDER BY QueueIndex ASC";
    $queueStmt = $pdo->prepare($queueQuery);
    $queueStmt->execute([$rateCard, $currentDate]);
    $queue = $queueStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalOrders = count($queue);

    // Find the position in queue
    $position = array_search($ClientContact, array_column($queue, 'ClientContact')) + 1;

    if ($position === 0) {
        echo json_encode(['error' => 'Client not found in the queue.']);
        exit();
    }

    $peopleAhead = max(0, $position);
    $averageTimePerOrder = 10; // minutes
    $estimatedTime = $position * $averageTimePerOrder;

    // Calculate elapsed and remaining time
    $entryTime = new DateTime($entryDateTime);
    $now = new DateTime();
    $elapsedTime = ($now->getTimestamp() - $entryTime->getTimestamp()) / 60; // minutes

    $remainingTime = max(0, $estimatedTime - floor($elapsedTime));

    echo json_encode([
        'position' => $peopleAhead,
        'totalOrders' => $totalOrders,
        'estimatedTime' => $estimatedTime,
        'remainingTime' => $remainingTime,
        'status' => $status
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
