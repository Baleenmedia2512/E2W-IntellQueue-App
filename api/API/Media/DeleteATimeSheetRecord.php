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

$ID = isset($_GET['JsonId']) ? $_GET['JsonId'] : '';
$LastModifiedUser = isset($_GET['JsonLastModifiedUser']) ? $_GET['JsonLastModifiedUser'] : '';
$LastModifiedDate = date('Y-m-d H:i:s');

if (empty($ID)) {
    echo json_encode(["error" => "ID is required for deletion."]);
    exit;
}

// Update the validity of the row to 0
$sql = "UPDATE `time_sheet_table` SET `Validity` = 0 ,`LastModifiedBy` = :PDOLastModifiedUser ,`LastModifiedDate` = :PDOLastModifiedDate WHERE `ID` = :ID";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':ID', $ID, PDO::PARAM_INT);
    $stmt->bindParam(':PDOLastModifiedUser', $LastModifiedUser);
    $stmt->bindParam(':PDOLastModifiedDate', $LastModifiedDate);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => "Row deleted successfully."]);
    } else {
        echo json_encode(["error" => "No row found with the given ID."]);
    }

} catch(PDOException $e) {
    echo json_encode(["error" => "Query failed: " . $e->getMessage()]);
}

// Close the database connection
$pdo = null;
?>
