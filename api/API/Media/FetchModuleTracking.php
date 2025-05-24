<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Query to fetch all records
    $stmt = $pdo->prepare("SELECT * FROM module_tracking_table");
    $stmt->execute();

    // Fetch data as an associative array
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the JSON-encoded result
    echo json_encode($result);
} catch (PDOException $e) {
    echo json_encode(["error" => "Error Fetching Data: " . $e->getMessage()]);
}
?>
