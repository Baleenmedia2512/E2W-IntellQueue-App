<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers must be sent before any output
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'ConnectionManager.php';

// Support both JSON and form POST
$input = json_decode(file_get_contents('php://input'), true);

$ClientContact = $_POST['JsonClientContact'] ?? $_GET['JsonClientContact'] ?? $input['JsonClientContact'] ?? null;
$ClientName = $_POST['JsonClientName'] ?? $_GET['JsonClientName'] ?? $input['JsonClientName'] ?? null;
$RateCard = $_POST['JsonRateCard'] ?? $_GET['JsonRateCard'] ?? $input['JsonRateCard'] ?? null;
$dbName = $_POST['JsonDBName'] ?? $_GET['JsonDBName'] ?? $input['JsonDBName'] ?? 'Baleen Test';

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}

if (!$ClientContact || !$ClientName) {
    echo json_encode(['error' => 'Client Name and Contact are required.']);
    exit();
}

try {
    $currentDateTime = date('Y-m-d H:i:s');
    $insertQuery = "INSERT INTO queue_table (QueueIndex, EntryDateTime, ClientName, ClientContact, RateCard, RateType, Status, Remarks) VALUES (0, ?, ?, ?, ?, 'None', 'Remote', 'None')";
    $stmt = $pdo->prepare($insertQuery);
    $stmt->execute([$currentDateTime, $ClientName, $ClientContact, $RateCard]);
    echo json_encode(['status' => 'remote_registered']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
