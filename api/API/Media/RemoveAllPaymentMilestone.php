<?php
require 'ConnectionManager.php';

// Allow cross-origin requests (CORS)
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

    // Check if 'action' is to remove all stages
    if (isset($data['action']) && $data['action'] === 'removeAllStages') {
        // Update all stages for the given order number, marking them as IsValid = 1
        $updateStmt = $pdo->prepare("
            UPDATE `payment_milestone_table`
            SET `IsValid` = 1
            WHERE `OrderNumber` = :orderNumber
        ");
        
        $updateStmt->execute([
            ':orderNumber' => $orderNumber
        ]);

        // Adjust message to reflect that stages have been marked as valid
        echo json_encode(["success" => true, "message" => "All stages marked as valid."]);
        return;
    }

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
            `IsValid` = 1  -- Set IsValid to 1 for each update
        WHERE 
            `ID` = :id
    ");

    // Loop through each stage in the array and update the database
    foreach ($data['JsonStages'] as $stage) {
        // Check if the necessary fields exist
        if (!isset($stage['id']) || !isset($stage['stageAmount']) || !isset($stage['description']) || !isset($stage['dueDate'])) {
            throw new Exception("Missing fields in stage data");
        }

        $stmt->execute([
            ':id' => $stage['id'],
            ':stageAmount' => $stage['stageAmount'],
            ':description' => $stage['description'],
            ':dueDate' => $stage['dueDate']
        ]);
    }

    // Return a success response
    echo json_encode(["success" => true, "message" => "Stages updated successfully."]);
} catch (Exception $e) {
    // Handle exceptions and return an error response
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
