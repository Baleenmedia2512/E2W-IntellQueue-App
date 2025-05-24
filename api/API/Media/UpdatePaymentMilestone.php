<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

// Retrieve the JSON payload from the request body
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true); // Decode the JSON into an associative array

$dbName = isset($data['JsonDBName']) ? $data['JsonDBName'] : 'Baleen Media';
$orderNumber = isset($data['JsonOrderNumber']) ? $data['JsonOrderNumber'] : 0;

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Check if 'JsonStages' exists and is an array
    if (!isset($data['JsonStages']) || !is_array($data['JsonStages'])) {
        throw new Exception("JsonStages is not defined or not an array");
    }

    // Prepare the SQL statement for updating the payment milestone
    $stmt = $pdo->prepare("
        UPDATE `payment_milestone_table` 
        SET 
            `StageAmount` = :stageAmount,
            `Description` = :description,
            `DueDate` = :dueDate,
            `Stage` = :stage
        WHERE 
            `ID` = :id
    ");

    $istmt = $pdo->prepare("
        INSERT INTO `payment_milestone_table` 
        (`EntryDateTime`, `EntryUser`, `OrderNumber`, `Stage`, `StageAmount`, `Description`, `DueDate`, `IsValid`) 
        VALUES (CURRENT_TIMESTAMP, :PDOUser, :PDOOrderNumber, :stage, :stageAmount, :description, :dueDate, 1)
    ");

    // Loop through each stage in the array and update/insert the database
    foreach ($data['JsonStages'] as $stage) {
        // Check if the necessary fields exist
        if (!isset($stage['stageAmount']) || !isset($stage['description']) || !isset($stage['dueDate'])) {
            throw new Exception("Missing fields in stage data: stageAmount, description, or dueDate.");
        }

        // If the 'id' is set, we perform an update; otherwise, we insert a new record
        if (isset($stage['id']) && !empty($stage['id'])) {
            // Update existing stage
            $stmt->execute([
                ':id' => $stage['id'],
                ':stageAmount' => $stage['stageAmount'],
                ':description' => $stage['description'],
                ':dueDate' => $stage['dueDate'],
                ":stage" => $stage['index']
            ]);
        } else {
            // Insert new stage
            $istmt->execute([
                ':PDOUser' => $data['JsonUser'],
                ':PDOOrderNumber' => $orderNumber,
                ':stage' => $stage['index'],
                ':stageAmount' => $stage['stageAmount'],
                ':description' => $stage['description'],
                ':dueDate' => $stage['dueDate']
            ]);
        }
    }

    // Return a success response
    echo json_encode(["success" => true, "message" => "Stages updated successfully."]);
} catch (Exception $e) {
    // Handle exceptions and return an error response
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>