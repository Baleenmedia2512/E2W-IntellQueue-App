<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $stmt = $pdo -> prepare("SELECT DISTINCT `CampaignDurationUnit` FROM rate_table WHERE `CampaignDurationUnit` <> ''");
    $stmt -> execute();

    // Fetch the results
    $results = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Output the results as JSON (you can modify this part based on your needs)
    echo json_encode($results);
} catch (PDOException $e) {
    echo json_encode("Error calling stored procedure: " . $e->getMessage());
}