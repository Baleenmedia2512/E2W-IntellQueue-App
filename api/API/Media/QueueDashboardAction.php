<?php
require 'ConnectionManager.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$data = json_decode(file_get_contents('php://input'), true);

$dbName   = $data['JsonDBName']   ?? '';
$action   = $data['JsonAction']   ?? '';
$clientId = $data['JsonClientId'] ?? '';

if (!$dbName || !$action) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

ConnectionManager::connect($dbName);
$pdo = ConnectionManager::getConnection();

function renumberQueueIndexes($pdo, $rateCard) {
    // Get all clients for this RateCard and today, not Completed or Deleted, order by QueueIndex
    $stmt = $pdo->prepare("SELECT ID FROM queue_table WHERE RateCard = ? AND Status NOT IN ('Completed', 'Deleted', 'Remote') AND Date(EntryDateTime) = CURRENT_DATE ORDER BY QueueIndex ASC, ID ASC");
    $stmt->execute([$rateCard]);
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $i = 1;
    foreach ($clients as $client) {
        $pdo->prepare("UPDATE queue_table SET QueueIndex = ? WHERE ID = ?")->execute([$i, $client['ID']]);
        $i++;
    }
}

try {
    if ($action === 'startQueue') {
        // Use the given clientId to set that client to In-Progress, all others in the same RateCard to Waiting
        $stmt = $pdo->prepare("SELECT RateCard FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            echo json_encode(['success' => false, 'message' => 'Client not found']);
            exit;
        }
        $rateCard = $row['RateCard'];

        $pdo->prepare("UPDATE queue_table SET Status = 'Waiting' WHERE RateCard = ? AND (Status = 'Waiting' OR Status = 'On-Hold') AND Date(EntryDateTime) = CURRENT_DATE")->execute([$rateCard]);
        $pdo->prepare("UPDATE queue_table SET Status = 'In-Progress', QueueOutTime = NOW() WHERE ID = ?")->execute([$clientId]);
        renumberQueueIndexes($pdo, $rateCard);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'doneAndHold') {
        $stmt = $pdo->prepare("SELECT RateCard FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $rateCard = $row ? $row['RateCard'] : null;

        // Only set ProcedureCompleteTime if it's currently null
        $stmt = $pdo->prepare("SELECT ProcedureCompleteTime FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $currentPCT = $stmt->fetchColumn();
        if ($currentPCT === null) {
            $pdo->prepare("UPDATE queue_table SET Status = 'Completed', QueueIndex = 0, ProcedureCompleteTime = NOW() WHERE ID = ?")->execute([$clientId]);
        } else {
            $pdo->prepare("UPDATE queue_table SET Status = 'Completed', QueueIndex = 0 WHERE ID = ?")->execute([$clientId]);
        }

        $stmt = $pdo->prepare("SELECT ID FROM queue_table WHERE Status = 'Waiting' AND Date(EntryDateTime) = CURRENT_DATE AND RateCard = ? ORDER BY QueueIndex ASC LIMIT 1");
        $stmt->execute([$rateCard]);
        $next = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($next) {
            $pdo->prepare("UPDATE queue_table SET Status = 'On-Hold' WHERE ID = ?")->execute([$next['ID']]);
        }
        renumberQueueIndexes($pdo, $rateCard);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'callNext') {
        $stmt = $pdo->prepare("SELECT RateCard FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $rateCard = $row ? $row['RateCard'] : null;

        // Only set ProcedureCompleteTime if it's currently null
        $stmt = $pdo->prepare("SELECT ProcedureCompleteTime FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $currentPCT = $stmt->fetchColumn();
        if ($currentPCT === null) {
            $pdo->prepare("UPDATE queue_table SET Status = 'Completed', QueueIndex = 0, ProcedureCompleteTime = NOW() WHERE ID = ?")->execute([$clientId]);
        } else {
            $pdo->prepare("UPDATE queue_table SET Status = 'Completed', QueueIndex = 0 WHERE ID = ?")->execute([$clientId]);
        }

        $stmt = $pdo->prepare("SELECT ID FROM queue_table WHERE Status = 'Waiting' AND Date(EntryDateTime) = CURRENT_DATE AND RateCard = ? ORDER BY QueueIndex ASC LIMIT 1");
        $stmt->execute([$rateCard]);
        $next = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($next) {
            // Only set QueueOutTime if it's currently null
            $stmtQOT = $pdo->prepare("SELECT QueueOutTime FROM queue_table WHERE ID = ?");
            $stmtQOT->execute([$next['ID']]);
            $currentQOT = $stmtQOT->fetchColumn();
            if ($currentQOT === null) {
                $pdo->prepare("UPDATE queue_table SET Status = 'In-Progress', QueueOutTime = NOW() WHERE ID = ?")->execute([$next['ID']]);
            } else {
                $pdo->prepare("UPDATE queue_table SET Status = 'In-Progress' WHERE ID = ?")->execute([$next['ID']]);
            }
        }
        renumberQueueIndexes($pdo, $rateCard);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'closeToken') {
        $stmt = $pdo->prepare("SELECT RateCard FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $rateCard = $row ? $row['RateCard'] : null;

        $pdo->prepare("UPDATE queue_table SET Status = 'Deleted', QueueIndex = 0 WHERE ID = ?")->execute([$clientId]);
        renumberQueueIndexes($pdo, $rateCard);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'completeToken') {
        $stmt = $pdo->prepare("SELECT RateCard FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $rateCard = $row ? $row['RateCard'] : null;

        $pdo->prepare("UPDATE queue_table SET Status = 'Completed', QueueIndex = 0, ProcedureCompleteTime = NOW() WHERE ID = ?")->execute([$clientId]);
        renumberQueueIndexes($pdo, $rateCard);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'continueToken') {
        $stmt = $pdo->prepare("SELECT RateCard FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $rateCard = $row ? $row['RateCard'] : null;

        // Only set QueueOutTime if it's currently null
        $stmt = $pdo->prepare("SELECT QueueOutTime FROM queue_table WHERE ID = ?");
        $stmt->execute([$clientId]);
        $currentQOT = $stmt->fetchColumn();
        if ($currentQOT === null) {
            $pdo->prepare("UPDATE queue_table SET Status = 'In-Progress', QueueOutTime = NOW() WHERE ID = ?")->execute([$clientId]);
        } else {
            $pdo->prepare("UPDATE queue_table SET Status = 'In-Progress' WHERE ID = ?")->execute([$clientId]);
        }
        renumberQueueIndexes($pdo, $rateCard);

        echo json_encode(['success' => true]);
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'Unknown action']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
