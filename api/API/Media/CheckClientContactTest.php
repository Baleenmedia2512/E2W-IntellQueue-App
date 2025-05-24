<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
// if ($dbName !== 'Grace Scans' && $dbName !== 'Baleen Media') {
//     $dbName = 'Baleen Media';
// }
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
$clientName = isset($_GET['ClientName']) ? $_GET['ClientName'] : '';

if (!empty($clientContact) && empty($clientName)) {
    // Query to fetch details only using clientContact
    $sql = "SELECT COUNT(*) AS count, Validity FROM client_table WHERE ClientContact = :clientContact";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':clientContact', $clientContact);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['count'] >= 1) {
        if ($result['Validity'] == 1) {
            $response = array(
                'isNewUser' => false,
                'warningMessage' => 'Contact number already exists.'
            );
        } else {
            $response = array(
                'isNewUser' => false,
                'warningMessage' => 'This client is invalid. Do you want to restore the client?'
            );
        }
    } else {
        $response = array(
            'isNewUser' => true,
            'warningMessage' => ''
        );
    }
} else {

    $sql = "SELECT COUNT(*) AS count, Validity FROM client_table WHERE ClientContact = :clientContact AND ClientName = :clientName";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':clientContact', $clientContact);
    $stmt->bindParam(':clientName', $clientName);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result['count'] > 0) {
        if ($result['Validity'] == 1) {
            $response = array(
                'isNewUser' => false,
                'warningMessage' => 'Contact number already exists.'
            );
        } else {
            $response = array(
                'isNewUser' => false,
                'warningMessage' => 'This client is invalid. Do you want to restore the client?'
            );
        }
    } else {
        $response = array(
            'isNewUser' => true,
            'warningMessage' => ''
        );
    }
}

echo json_encode($response);

$pdo = null;
?>
