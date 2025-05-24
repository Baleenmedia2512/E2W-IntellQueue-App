<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
// if($dbName !== 'Grace Scans' && $dbName !== 'Baleen Media'){
//     $dbName = 'Baleen Media';
// }
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Assume you have the RateId from somewhere, replace 'your_rate_id_here' with the actual value
    $rateId = $_GET['JsonRateId'];

    // Call the stored procedure with a parameter
    $stmt = $pdo -> prepare("SELECT * FROM rate_table WHERE rateId = :rateId");
    $stmt->bindParam(':rateId', $rateId, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    // Output the results as JSON (you can modify this part based on your needs)
     if ($results && $results['ApprovedStatus'] === 'Rejected') {
        echo json_encode($results);
    } else if ($results && $results['ApprovedStatus'] === 'Approved') {
        echo json_encode($results);
    } else {
        echo json_encode("Not rates found for the provided Rate ID");
    }
    
} catch (PDOException $e) {
    echo "Error fetching Rate ID: " . $e->getMessage();
}
?>
