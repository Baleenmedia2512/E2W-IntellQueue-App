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

$dbName = isset($input['JsonDBName']) ? $input['JsonDBName'] : '';
$entryUser = isset($input['JsonEntryUser']) ? $input['JsonEntryUser'] : '';

if (empty($dbName) || empty($entryUser)) {
    echo json_encode(["success" => false, "message" => "JsonDBName and JsonEntryUser are required"]);
    exit;
}


ConnectionManager::connect($dbName);
$pdo = ConnectionManager::getConnection();

try {
   
    $sql = "SELECT * FROM cart_table WHERE entryUser = :entryUser AND `Valid Status` = 'Valid'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':entryUser' => $entryUser]);
    $cartData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($cartData) {
        echo json_encode(["success" => true, "data" => $cartData]);
    } else {
        echo json_encode(["success" => false, "message" => "No records found for the given entry user"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error fetching data: " . $e->getMessage()]);
}
?>
