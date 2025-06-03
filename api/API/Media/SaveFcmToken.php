<?php
require 'ConnectionManager.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['JsonDBName'], $data['JsonToken'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
        exit;
    }

    $dbName = $data['JsonDBName'];
    $tokens = $data['JsonToken'];

    // Ensure tokens is an array
    if (!is_array($tokens)) {
        $tokens = [$tokens];  // Convert to array with one element
    }

    // Connect to DB
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $query = "
        INSERT INTO fcm_token_table (Token, EntryDateTime)
        VALUES (:token, NOW())
        ON DUPLICATE KEY UPDATE EntryDateTime = CURRENT_TIMESTAMP
    ";
    $stmt = $pdo->prepare($query);

    $savedCount = 0;
    foreach ($tokens as $token) {
        $stmt->bindParam(':token', $token, PDO::PARAM_STR);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $savedCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "Saved $savedCount tokens successfully."
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
