<?php
require 'ConnectionManager.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $data = json_decode(file_get_contents('php://input'), true);

    // Check required DBName parameter
    if (!isset($data['JsonDBName'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required JsonDBName parameter.']);
        exit;
    }

    $dbName = $data['JsonDBName'];

    // Connect to the specific database
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Fetch all tokens
    $query = "SELECT Token FROM fcm_token_table";
    $stmt = $pdo->prepare($query);
    $stmt->execute();

    $tokens = $stmt->fetchAll(PDO::FETCH_COLUMN); // Fetch just the token column

    if (!empty($tokens)) {
        echo json_encode([
            'success' => true,
            'tokens' => $tokens
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No tokens found.'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
