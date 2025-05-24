<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

function checkExistingFollowup($clientContact, $dbName) {
    try {
        // Connect to the database
        ConnectionManager::connect($dbName);
        $pdo = ConnectionManager::getConnection();

        // Validate input
        if (empty($clientContact)) {
            echo json_encode(["error" => "No client Contact provided"]);
            exit();
        }

        $clientContact = "%" . $clientContact;

        // Query to check if the contact exists in leads_tracking_table with Call Followup Status
        $stmt = $pdo->prepare("
            SELECT SheetId
            FROM leads_tracking_table 
            WHERE ClientContact LIKE :ClientContact 
            AND Status = 'Call Followup'
        ");
        $stmt->bindParam(':ClientContact', $clientContact, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return $result['SheetId']; // Return only SheetId
        } else {
            echo json_encode(["message" => "No follow-up found", "result" => $result]);
            exit();
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        exit();
    }
}

// Example usage
if (isset($_GET['JsonClientContact'])) {
    $clientContact = isset($_GET['JsonClientContact']) ? trim(htmlspecialchars($_GET['JsonClientContact'], ENT_QUOTES, 'UTF-8')) : "";
    $dbName = isset($_GET['JsonDBName']) ? trim(htmlspecialchars($_GET['JsonDBName'], ENT_QUOTES, 'UTF-8')) : "Baleen Test";


    $result = checkExistingFollowup($clientContact, $dbName);

    echo json_encode(["message" => "Contact exists in leads_tracking_table", "SheetId" => $result]);
}
?>
