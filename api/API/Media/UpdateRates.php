<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['DBName']) ? $_GET['DBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $EntryUser = $_GET['JsonUserName'];
    $RateIDs = $_GET['JsonRateId']; // Assuming JsonRateId is an array

    $ValidityDate = $_GET['JsonValidity'];

    // Generate the placeholders for RateIDs
    $placeholders = implode(', ', array_fill(0, count($RateIDs), '?'));

    if(isset($_GET['JsonUserName']) && isset($_GET['JsonRateId']) && isset($_GET['JsonValidity'])){
    // Prepare the SQL query with multiple RateIDs
    $stmt = $pdo->prepare("UPDATE `rate_table` SET `ValidityDate` = ? AND `LastUsedUser` = ? WHERE `RateID` IN ($placeholders)");

    // Bind parameters
    $stmt->bindValue(1, $ValidityDate);
    $stmt->bindValue(2, $EntryUser);

    // Bind RateIDs dynamically
    foreach ($RateIDs as $index => $RateID) {
        $stmt->bindValue($index + 3, $RateID); // Index starts from 3 because we already bound two parameters (ValidityDate and LastUsedUser)
    }

    // Execute the query
    $stmt->execute();

    // Check if the update was successful
    $rowCount = $stmt->rowCount();
    if ($rowCount > 0) {
        echo json_encode(['success' => true, 'message' => 'Rate updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No records updated.']);
    }
} else {
	echo json_encode(['success' => false, 'message' => 'Cannot receive values']);
}
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>