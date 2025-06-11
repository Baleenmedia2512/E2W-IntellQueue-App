<?php
require 'ConnectionManager.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['JsonDBName'], $data['JsonToken'], $data['JsonPhoneNumber'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
        exit;
    }

    $dbName = $data['JsonDBName'];
    $phoneNumber = $data['JsonPhoneNumber'];
    $token = $data['JsonToken'];

    // Connect to DB
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $query = "
        UPDATE queue_table
        SET FcmToken = :token
        WHERE ClientContact = :phone
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':token', $token, PDO::PARAM_STR);
    $stmt->bindParam(':phone', $phoneNumber, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'FCM token updated successfully.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No matching client found or token already set.'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
