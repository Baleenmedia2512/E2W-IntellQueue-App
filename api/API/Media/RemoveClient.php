<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Check if ClientContact is provided
    if (isset($_GET['JsonClientID'])) {
        $clientID = $_GET['JsonClientID'];

        // Update client_table
        $stmt1 = $pdo->prepare("UPDATE client_table SET Validity = 0 WHERE ID = :PDOClientID");
        $stmt1->bindParam(':PDOClientID', $clientID);
        $stmt1->execute();

        // Check if any rows were affected
        $rowCount1 = $stmt1->rowCount();

        if ($rowCount1 > 0) {
            echo json_encode(['success' => true, 'message' => 'Client removed successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No client removed.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Client contact not provided.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
