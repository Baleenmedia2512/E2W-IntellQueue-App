<?php
require 'ConnectionManager.php';

// Get database name from query string or use default
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

// Allow access from any origin and allow all headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    // Connect to the database
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();    // Get ra    // Prepare and execute the query to fetch LeadDays
    $stmt = $pdo->prepare("SELECT `LeadDays` FROM `rate_table` WHERE `LeadDays` IS NOT NULL");
    $stmt->execute();

    // Fetch all results
    $results = $stmt -> fetchAll(PDO::FETCH_ASSOC);

    // Return results as JSON
    echo json_encode($results[0]);
} catch (PDOException $e) {
    echo "Error fetching LeadDays: " . $e->getMessage();
} 
?>
