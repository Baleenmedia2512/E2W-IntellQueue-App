<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

if($dbName == 'Baleen Test'){
    $dbName = "Baleen Media";
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try{
    ConnectionManager::connect($dbName);
    $conn = ConnectionManager::getConnection();
    $stmt = $conn -> prepare("SELECT `ElementName` FROM `visibility_table`");
    $stmt -> execute();

    // Fetch the results
    $results = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Output the results as JSON (you can modify this part based on your needs)
    echo json_encode($results);
} catch (PDOException $e) {
    // Handle database-related errors
    http_response_code(500); // Set HTTP status code to 500 (Internal Server Error)
    echo json_encode([
        "error" => "Database error",
        "message" => $e->getMessage()
    ]);
} catch (Exception $e) {
    // Handle general errors
    http_response_code(500); // Set HTTP status code to 500 (Internal Server Error)
    echo json_encode([
        "error" => "Application error",
        "message" => $e->getMessage()
    ]);
}
