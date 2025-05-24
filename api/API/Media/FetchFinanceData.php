<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Assume you have the RateId from somewhere, replace 'your_rate_id_here' with the actual value
    $orderNumber = $_GET['JsonOrderNumber'];

    // Call the stored procedure with a parameter
    $stmt = $pdo -> prepare("SELECT * FROM `financial_transaction_table` WHERE OrderNumber = :orderNumber");
    $stmt->bindParam(':orderNumber', $orderNumber, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    // Output the results as JSON (you can modify this part based on your needs)
     if ($results && $results['ValidStatus'] === 'invalid') {
        echo json_encode("Order is invalid");
    } else if ($results && $results['ValidStatus'] === 'Valid') {
        echo json_encode($results);
    } else {
        echo json_encode("No data found for the provided Order Number");
    }
    
} catch (PDOException $e) {
    echo "Error fetching Order Number: " . $e->getMessage();
}
?>
