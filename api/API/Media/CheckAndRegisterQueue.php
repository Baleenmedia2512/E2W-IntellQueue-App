<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

$dbName = isset($input['JsonDBName']) ? $input['JsonDBName'] : 'Baleen Test';
$ClientContact = isset($input['JsonClientContact']) ? $input['JsonClientContact'] : null;
$ClientName = isset($input['JsonClientName']) ? $input['JsonClientName'] : null;


try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

if (!$ClientContact) {
    echo json_encode(['error' => 'Client Contact is required.', 'ClientContact' => $ClientContact ]);
    exit();
}

try {
    $currentDate = date('Y-m-d');
    // Check if the phone number exists in the order_table
    $query = "SELECT ClientName FROM order_table WHERE OrderDate = ? AND CancelFlag = 0 AND ClientContact = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$currentDate, $ClientContact]);

    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($client) {
        // Client found in the order_table
        echo json_encode([
            'status' => 'found',
            'ClientName' => $client['ClientName']
        ]);
    } else {
        // Client not found, check if already registered in queue_table
        $query = "SELECT ClientName FROM queue_table WHERE ClientContact = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$ClientContact]);

        $queueClient = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($queueClient) {
            // Client already registered in queue_table
            echo json_encode([
                'status' => 'registered',
                'ClientName' => $queueClient['ClientName']
            ]);
        } else {
            // Register the client in queue_table
            if ($ClientName) {
                $query = "INSERT INTO queue_table (ClientContact, ClientName) VALUES (?, ?)";
                $stmt = $pdo->prepare($query);
                $stmt->execute([$ClientContact, $ClientName]);

                echo json_encode([
                    'status' => 'registered',
                    'ClientName' => $ClientName
                ]);
            } else {
                // Client not found and no name provided for registration
                echo json_encode(['status' => 'not_found']);
            }
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
