<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Assume you have the RateId from somewhere, replace 'your_rate_id_here' with the actual value
    $rateId = $_GET['JsonRateId'];

    // Call the stored procedure with a parameter
    $stmt = $pdo->prepare("CALL FetchQtySlab(:rateId)");
    $stmt->bindParam(':rateId', $rateId, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output the results as JSON (you can modify this part based on your needs)
    echo json_encode($results);
} catch (PDOException $e) {
    echo "Error calling stored procedure: " . $e->getMessage();
}
?>
