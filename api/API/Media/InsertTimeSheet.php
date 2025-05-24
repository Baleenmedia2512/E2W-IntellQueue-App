<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit;
}

    $EntryUser = isset($_GET['JsonEntryUser']) ? $_GET['JsonEntryUser'] : '';
    $OrderNumber = isset($_GET['JsonOrderNumber']) ? $_GET['JsonOrderNumber'] : '';
    $QuoteNumber = isset($_GET['JsonQuoteNumber']) ? $_GET['JsonQuoteNumber'] : '';
    $Activity = isset($_GET['JsonActivity']) ? $_GET['JsonActivity'] : '';
    $Duration = isset($_GET['JsonDuration']) ? $_GET['JsonDuration'] : '';
    $WorkDate = isset($_GET['JsonWorkDate']) ? $_GET['JsonWorkDate'] : date('Y-m-d');


    // Insert the new row into the time_sheet_table
    $sql = "INSERT INTO `time_sheet_table`(`ID`, `EntryDateTime`, `EntryUser`, `OrderNumber`, `QuoteNumber`, `Activity`, `Duration`, `WorkDate`, `Validity`, `LastModifiedBy`, `LastModifiedDate`) VALUES (NULL, NOW(), :PDOEntryUser, :PDOOrderNumber, :PDOQuoteNumber, :PDOActivity, :PDODuration, :PDOWorkDate, 1, '', '')";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':PDOEntryUser', $EntryUser);
    $stmt->bindParam(':PDOOrderNumber', $OrderNumber);
    $stmt->bindParam(':PDOQuoteNumber', $QuoteNumber);
    $stmt->bindParam(':PDOActivity', $Activity);
    $stmt->bindParam(':PDODuration', $Duration);
    $stmt->bindParam(':PDOWorkDate', $WorkDate);

    if ($stmt->execute()) {
        echo json_encode(["success" => "New row inserted successfully"]);
    } else {
        echo json_encode(["error" => "Failed to insert new row"]);
    }


// Close the database connection
$pdo = null;
?>
