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

// $data = json_decode(file_get_contents('php://input'), true);

// if (isset($data['id']) && isset($data['field']) && isset($data['value'])) {
    $ID = $_GET['JsonId'];
    $OrderNumber = isset($_GET['JsonOrderNumber']) ? $_GET['JsonOrderNumber'] : '';
    $QuoteNumber = isset($_GET['JsonQuoteNumber']) ? $_GET['JsonQuoteNumber'] : '';
    $Activity = isset($_GET['JsonActivity']) ? $_GET['JsonActivity'] : '';
    $Duration = isset($_GET['JsonDuration']) ? $_GET['JsonDuration'] : '';
    $LastModifiedUser = isset($_GET['JsonLastModifiedUser']) ? $_GET['JsonLastModifiedUser'] : '';
    $LastModifiedDate = date('Y-m-d H:i:s');

    // Update the specified field in the time_sheet_table
    $sql = "UPDATE `time_sheet_table` SET `OrderNumber`= :PDOOrderNumber,`QuoteNumber`= :PDOQuoteNumber,`Activity`= :PDOActivity,`Duration`= :PDODuration,`LastModifiedBy`= :PDOLastModifiedUser,`LastModifiedDate`= :PDOLastModifiedDate WHERE `ID`= :PDOID";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':PDOID', $ID);
    $stmt->bindParam(':PDOOrderNumber', $OrderNumber);
    $stmt->bindParam(':PDOQuoteNumber', $QuoteNumber);
    $stmt->bindParam(':PDOActivity', $Activity);
    $stmt->bindParam(':PDODuration', $Duration);
    $stmt->bindParam(':PDOLastModifiedUser', $LastModifiedUser);
    $stmt->bindParam(':PDOLastModifiedDate', $LastModifiedDate);

    if ($stmt->execute()) {
        echo json_encode(["success" => "Data updated successfully"]);
    } else {
        echo json_encode(["error" => "Failed to update data"]);
    }
// } else {
//     echo json_encode(["error" => "Invalid input"]);
// }

// Close the database connection
$pdo = null;
?>
