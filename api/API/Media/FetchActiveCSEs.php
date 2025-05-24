<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Call the stored procedure
    // $stmt = $pdo->prepare("CALL FetchAllRates()");
    $stmt = $pdo->prepare("SELECT `username` FROM employee_table
    WHERE `status` like 'active' AND `department` like 'Client Servicing' 
    ORDER BY `username`");
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output the results as JSON (you can modify this part based on your needs)
    echo json_encode($results);
} catch (PDOException $e) {
    echo "Error calling stored procedure: " . $e->getMessage();
}
?>