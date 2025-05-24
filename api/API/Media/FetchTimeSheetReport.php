<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    // Connect to the database
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit;
}

$WorkDate = isset($_GET['JsonWorkDate']) ? $_GET['JsonWorkDate'] : '';

// Fetch data from the time_sheet_table
$sql = "SELECT `ID`, `OrderNumber`, `QuoteNumber`, `Activity`, `Duration` FROM `time_sheet_table` WHERE `WorkDate` = :PDOWorkDate AND `Validity` = 1";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':PDOWorkDate', $WorkDate);
    $stmt->execute();

    // Fetch all the rows and store them in an array
    $timeSheetData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($timeSheetData);

} catch(PDOException $e) {
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}

// Close the database connection
$pdo = null;
?>
