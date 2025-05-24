<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    // Connect to the specified database
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit();
}

// Function to update the consultant's validity and search term
function updateConsultantValidity($ConsultantID, $action) {
    global $pdo;
    
    // Set validity and status for SearchTerm based on the action (Remove or Restore)
    $validity = ($action === 'Remove') ? 0 : 1;
    // $status = ($validity === 1) ? 'Valid' : 'Invalid';
    
    // Fetch consultant's name and contact to update the search term
    $stmtFetch = $pdo->prepare("SELECT `ConsultantName`, `ConsultantNumber` FROM `consultant_table` WHERE `CId` = :PDOCId");
    $stmtFetch->bindParam(':PDOCId', $ConsultantID, PDO::PARAM_INT);
    $stmtFetch->execute();
    $result = $stmtFetch->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode(["error" => "Consultant not found"]);
        return;
    }

    $ConsultantName = isset($result['ConsultantName']) ? trim($result['ConsultantName']) : '';
    $ConsultantContact = isset($result['ConsultantNumber']) ? trim($result['ConsultantNumber']) : '';

    // Build the new search term
    $SearchConcat = trim($ConsultantID)
                  . ($ConsultantName !== '' ? " - " . trim($ConsultantName) : '') 
                  . ($ConsultantContact !== '' ? " - " . trim($ConsultantContact) : " - 0");

    $SearchTerm = trim($SearchConcat);

    // Prepare the SQL query to update the Validity and SearchTerm
    $stmtUpdate = $pdo->prepare("UPDATE `consultant_table` SET `Validity` = :PDOValidity, `SearchTerm` = :PDOSearchTerm WHERE `CId` = :PDOCId");

    // Bind parameters
    $stmtUpdate->bindParam(':PDOValidity', $validity, PDO::PARAM_INT);
    $stmtUpdate->bindParam(':PDOSearchTerm', $SearchTerm, PDO::PARAM_STR);
    $stmtUpdate->bindParam(':PDOCId', $ConsultantID, PDO::PARAM_INT);

    // Execute the query
    $stmtUpdate->execute();
}

try {
    // Get the required parameters from the GET request
    $ConsultantID = isset($_GET['JsonConsultantId']) ? $_GET['JsonConsultantId'] : '';
    $action = isset($_GET['JsonActivity']) ? $_GET['JsonActivity'] : '';

    // Validate inputs
    if ($ConsultantID && ($action === 'Remove' || $action === 'Restore')) {
        // Update consultant's validity and search term
        updateConsultantValidity($ConsultantID, $action);
        $message = ($action === 'Remove') ? "Consultant removed successfully!" : "Consultant restored successfully!";
        echo json_encode(["message" => $message]);
    } else {
        echo json_encode(["error" => "Invalid consultant ID or action"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error updating consultant: " . $e->getMessage()]);
}
?>
