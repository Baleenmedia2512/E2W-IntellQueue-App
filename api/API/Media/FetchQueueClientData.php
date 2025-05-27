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

    // Fetch all entries for this client today
    $userQuery = "SELECT ID, RateCard, QueueIndex, EntryDateTime, Status FROM queue_table 
                  WHERE ClientContact = ? AND DATE(EntryDateTime) = ? 
                  ORDER BY ID DESC";
    $userStmt = $pdo->prepare($userQuery);
    $userStmt->execute([$ClientContact, $currentDate]);
    $entries = $userStmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$entries) {
        echo json_encode(['error' => 'Client not found in the queue.']);
        exit();
    }

    // Prefer latest joined (non-remote) entry
    $user = null;
    foreach ($entries as $entry) {
        if ($entry['Status'] !== 'Remote' && $entry['QueueIndex'] != 0) {
            $user = $entry;
            break;
        }
    }

    // If no joined entry found, fallback to remote
    if (!$user) {
        $user = $entries[0];
    }

    $rateCard = $user['RateCard'];
    $clientQueueIndex = (int)$user['QueueIndex'];
    $entryDateTime = $user['EntryDateTime'];
    $status = $user['Status'];

    // Fetch today's queue with eligible statuses
    $queueQuery = "SELECT QueueIndex, ClientContact, EntryDateTime, Status FROM queue_table 
                   WHERE RateCard = ? AND DATE(EntryDateTime) = ? AND Status IN ('Waiting', 'In-Progress', 'On-Hold', 'Remote', 'Completed')";
    $queueStmt = $pdo->prepare($queueQuery);
    $queueStmt->execute([$rateCard, $currentDate]);
    $queue = $queueStmt->fetchAll(PDO::FETCH_ASSOC);

    $totalOrders = count($queue);
    $walkinStatuses = ['Waiting', 'In-Progress', 'On-Hold'];
    $remoteStatus = 'Remote';

    // Separate walk-in and remote queues
    $walkinQueue = array_filter($queue, fn($row) => in_array($row['Status'], $walkinStatuses));
    $remoteQueue = array_filter($queue, fn($row) => $row['Status'] === $remoteStatus);

    // Sort walk-ins by QueueIndex ASC
    usort($walkinQueue, fn($a, $b) => $a['QueueIndex'] - $b['QueueIndex']);

    // Sort remote queue by EntryDateTime ASC
    usort($remoteQueue, fn($a, $b) => strtotime($a['EntryDateTime']) - strtotime($b['EntryDateTime']));

    if (in_array($status, $walkinStatuses)) {
        // Find position in walk-in queue
        $walkinContacts = array_column($walkinQueue, 'ClientContact');
        $position = array_search($ClientContact, $walkinContacts) + 1;
    } elseif ($status === $remoteStatus) {
        // Find position in remote queue (ordered by join time)
        $remoteContacts = array_column($remoteQueue, 'ClientContact');
        $walkinCount = count($walkinQueue);
        $remotePosition = array_search($ClientContact, $remoteContacts) + 1;
        $position = $walkinCount + $remotePosition;
    } else {
        echo json_encode(['error' => 'Invalid client status.']);
        exit();
    }

    $averageTimePerOrder = 10; // minutes
    $estimatedTime = $position * $averageTimePerOrder;

    $entryTime = new DateTime($entryDateTime);
    $now = new DateTime();
    $elapsedTime = ($now->getTimestamp() - $entryTime->getTimestamp()) / 60;
    $remainingTime = max(0, $estimatedTime - floor($elapsedTime));

    echo json_encode([
        'position' => $position,
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
