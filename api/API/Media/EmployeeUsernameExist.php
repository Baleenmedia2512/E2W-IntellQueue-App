<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

// Fetch the username from query parameters
$userName = isset($_GET['JsonUsername']) ? $_GET['JsonUsername'] : '';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
if (empty($userName)) {
    echo json_encode(["status" => "error", "message" => "Username parameter is missing."]);
    exit();
}

try {
    // Connect to the database
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Check if username already exists
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM employee_table WHERE userName = :PDOUserName");
    $stmtCheck->bindParam(':PDOUserName', $userName);
    $stmtCheck->execute();
    $count = $stmtCheck->fetchColumn();

    if ($count > 0) {
        // Username already exists
        echo json_encode(["status" => "error", "message" => "This Username is not available"]);
    } else {
        // Username does not exist
        echo json_encode(["status" => "success", "message" => "Username is available"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error checking username availability: " . $e->getMessage()]);
}
?>
