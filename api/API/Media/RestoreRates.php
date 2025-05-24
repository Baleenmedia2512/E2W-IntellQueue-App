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
    $RateID = $_GET['JsonRateId'];

    if(isset($_GET['JsonRateId'])){
    // Prepare the SQL query with multiple RateIDs
    $stmt = $pdo->prepare("UPDATE `rate_table` SET `ApprovedStatus` = 'Approved' WHERE `RateID` = :PDORateID");

    // Bind parameters
    $stmt->bindValue(':PDORateID', $RateID);

    // Execute the query
    $stmt->execute();

    // Check if the update was successful
    $rowCount = $stmt->rowCount();
    if ($rowCount > 0) {
        echo json_encode(['success' => true, 'message' => 'Rate removed successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No records removed.']);
    }
} else {
	echo json_encode(['success' => false, 'message' => 'Cannot receive values']);
}
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>