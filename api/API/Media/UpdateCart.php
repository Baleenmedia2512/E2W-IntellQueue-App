<?php
require 'ConnectionManager.php';

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');


$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit;
}

// Database connection
$dbName = isset($input['JsonDBName']) ? $input['JsonDBName'] : 'Baleen Test';
ConnectionManager::connect($dbName);
$pdo = ConnectionManager::getConnection();

try {

    $checkSql = "SELECT COUNT(*) FROM cart_table WHERE CartID = :PDOCartId AND entryUser = :PDOEntryUser";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([
        ':PDOCartId' => $input['JsonCartId'] ?? '',
        ':PDOEntryUser' => $input['JsonEntryUser'] ?? ''
    ]);
    $entryExists = $checkStmt->fetchColumn();

    if ($entryExists) {
      
        $validStatus = (isset($input['JsonValidStatus']) && $input['JsonValidStatus'] === 'Invalid') ? 'Invalid' : 'Valid';


        $sql = "UPDATE cart_table SET `Valid Status` = :PDOValidStatus WHERE CartID = :PDOCartId AND entryUser = :PDOEntryUser";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':PDOValidStatus' => $validStatus,  
            ':PDOCartId' => $input['JsonCartId'] ?? '',
            ':PDOEntryUser' => $input['JsonEntryUser'] ?? ''
        ]);

        echo json_encode(["success" => true, "message" => "Cart Updated Successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Cart item not found"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error updating cart: " . $e->getMessage()]);
}
?>
