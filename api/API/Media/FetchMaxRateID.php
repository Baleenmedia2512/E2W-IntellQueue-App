<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Execute the SQL query to get the maximum RateID
    $stmt = $pdo->prepare("SELECT max(RateID) AS MaxRateID FROM `rate_table`");
    $stmt->execute();

    // Fetch the result
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // Increment the max RateID by 1
    $nextRateID = $result['MaxRateID'] + 1;

    // Output the incremented RateID
    echo json_encode($nextRateID);
} catch (PDOException $e) {
    echo "Error fetching max RateID: " . $e->getMessage();
}
?>
