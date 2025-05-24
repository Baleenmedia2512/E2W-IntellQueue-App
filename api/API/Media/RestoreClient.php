<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(array("error" => "Connection failed: " . $e->getMessage()));
    exit();
}

$clientContact = isset($_GET['ClientContact']) ? $_GET['ClientContact'] : '';

if (strlen($clientContact) === 10) {
    try {
        $pdo->beginTransaction();

        $sql1 = "UPDATE client_table SET Validity = 1 WHERE ClientContact = :clientContact";
        $stmt1 = $pdo->prepare($sql1);
        $stmt1->bindParam(':clientContact', $clientContact);

        $sql2 = "UPDATE enquiry_table SET Validity = 1 WHERE ClientContact = :clientContact";
        $stmt2 = $pdo->prepare($sql2);
        $stmt2->bindParam(':clientContact', $clientContact);

        if ($stmt1->execute() && $stmt2->execute()) {
            $pdo->commit();
            $response = array('success' => true, 'message' => 'Client has been restored successfully.');
        } else {
            $pdo->rollBack();
            $response = array('success' => false, 'message' => 'Failed to restore the client.');
        }
    } catch (Exception $e) {
        $pdo->rollBack();
        $response = array('success' => false, 'message' => 'Transaction failed: ' . $e->getMessage());
    }
} else {
    $response = array('success' => false, 'message' => 'Invalid contact number length.');
}

echo json_encode($response);

$pdo = null;
?>
